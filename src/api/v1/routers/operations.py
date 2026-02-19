"""
Операции: новая структура (operation_number, type_code, warehouse_from/to, status и др.).
"""
import io
from datetime import date, datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from openpyxl import Workbook
from pydantic import BaseModel, field_validator
from sqlalchemy import select, text, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.exc import IntegrityError

from src.database.connection import get_db_session
from src.database.models import Operation, Customer, Product, Order, OperationConfig, OperationType, Batch, Item, Status
from src.core.deps import get_current_user, require_admin
from src.database.models import User
import json
import logging

router = APIRouter()


def _parse_delivery_date_input(raw: str) -> date:
    """Parse delivery date from yyyy-mm-dd or dd.mm.yyyy."""
    value = (raw or "").strip()
    if not value:
        raise HTTPException(status_code=400, detail="Не указана дата поставки.")
    for fmt in ("%Y-%m-%d", "%d.%m.%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    raise HTTPException(
        status_code=400,
        detail="Неверный формат даты поставки. Используйте дд.мм.гггг или yyyy-mm-dd.",
    )


@router.get("/operations/allocation/suggest-by-delivery-date")
async def suggest_allocation_items_by_delivery_date(
    warehouse_from: str = Query(..., description="Код склада от"),
    expeditor_login: str = Query(..., description="Логин экспедитора"),
    delivery_date: str = Query(..., description="Дата поставки (yyyy-mm-dd или dd.mm.yyyy)"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Автоподбор позиций для allocation на основе заказов в доставке по дате поставки."""
    delivery_dt = _parse_delivery_date_input(delivery_date)

    # 1) Находим ВСЕ активные (не закрытые) заказы экспедитора на выбранную дату.
    status_code_l = func.lower(func.coalesce(Order.status_code, ""))
    status_name_l = func.lower(func.coalesce(Status.name, ""))
    matched_orders_result = await session.execute(
        select(Order.order_no)
        .select_from(Order)
        .join(Customer, Customer.id == Order.customer_id)
        .outerjoin(Status, Status.code == Order.status_code)
        .where(Customer.login_expeditor == expeditor_login.strip())
        .where(func.date(Order.scheduled_delivery_at) == delivery_dt)
        .where(
            ~or_(
                status_code_l.in_(["completed", "cancelled", "canceled", "3", "4"]),
                status_name_l.like("%отмен%"),
                status_name_l.like("%доставлен%"),
                status_name_l.like("%cancel%"),
                status_name_l.like("%completed%"),
                status_name_l.like("%closed%"),
            )
        )
    )
    matched_order_ids = [int(r[0]) for r in matched_orders_result.fetchall() if r and r[0] is not None]
    if not matched_order_ids:
        return {
            "success": True,
            "delivery_date": delivery_dt.isoformat(),
            "expeditor_login": expeditor_login,
            "warehouse_from": warehouse_from,
            "no_orders": True,
            "matched_orders_count": 0,
            "matched_order_ids": [],
            "message": f"На выбранную дату нет активных заказов для доставки экспедитором {expeditor_login}.",
            "items": [],
            "warnings": [],
        }

    # 2) Суммируем количества по товарам по ВСЕМ найденным заказам.
    grouped_items_result = await session.execute(
        select(
            Item.product_code,
            func.sum(func.coalesce(Item.quantity, 0)).label("required_qty"),
        )
        .select_from(Item)
        .where(Item.order_id.in_(matched_order_ids))
        .group_by(Item.product_code)
    )
    filtered_required: dict[str, int] = {}
    for product_code, required_qty in grouped_items_result.fetchall():
        if not product_code:
            continue
        filtered_required[product_code] = int(required_qty or 0)

    product_codes = list(filtered_required.keys())

    # 2) Получаем остатки по партиям со склада от.
    stock_result = await session.execute(
        text(
            '''
            SELECT warehouse_code, product_code, batch_code, batch_id, total_qty
            FROM "Sales".v_warehouse_stock
            WHERE warehouse_code = :warehouse_from
              AND total_qty > 0
              AND product_code = ANY(:product_codes)
            ORDER BY product_code, batch_code
            '''
        ),
        {"warehouse_from": warehouse_from, "product_codes": product_codes},
    )
    stock_rows = stock_result.fetchall()

    by_product_stock: dict[str, list[dict]] = {pc: [] for pc in product_codes}
    batch_ids = set()
    for wh_code, product_code, batch_code, batch_id, total_qty in stock_rows:
        if not product_code:
            continue
        if batch_id:
            batch_ids.add(batch_id)
        by_product_stock.setdefault(product_code, []).append(
            {
                "warehouse_code": wh_code,
                "product_code": product_code,
                "batch_code": batch_code,
                "batch_id": batch_id,
                "available_qty": int(total_qty or 0),
            }
        )

    # 3) Подтягиваем справочные данные о сроках и товарах.
    expiry_by_batch: dict = {}
    if batch_ids:
        batch_result = await session.execute(
            select(Batch.id, Batch.expiry_date).where(Batch.id.in_(batch_ids))
        )
        for b_id, expiry_date in batch_result.fetchall():
            expiry_by_batch[b_id] = expiry_date

    product_info: dict[str, dict] = {}
    product_result = await session.execute(
        select(Product.code, Product.name, Product.price, Product.weight_g).where(Product.code.in_(product_codes))
    )
    for code, name, price, weight_g in product_result.fetchall():
        product_info[code] = {
            "product_name": name or code,
            "unit_price": float(price) if price is not None else 0.0,
            "weight_g": int(weight_g) if weight_g is not None else 0,
        }

    # 4) FEFO-алгоритм: распределяем требуемое количество по доступным партиям.
    today = date.today()
    items: list[dict] = []
    warnings: list[str] = []

    for product_code, required_qty in filtered_required.items():
        stock_list = by_product_stock.get(product_code, [])
        for row in stock_list:
            exp_date = expiry_by_batch.get(row.get("batch_id"))
            row["expiry_date"] = exp_date
            row["days_until_expiry"] = (exp_date - today).days if exp_date else None
        stock_list.sort(
            key=lambda r: (r["days_until_expiry"] if r["days_until_expiry"] is not None else 10**9)
        )

        remaining = int(required_qty or 0)
        allocated_total = 0
        available_total = sum(int(r.get("available_qty") or 0) for r in stock_list)
        product_meta = product_info.get(
            product_code,
            {"product_name": product_code, "unit_price": 0.0, "weight_g": 0},
        )

        allocations: list[dict] = []
        for st in stock_list:
            if remaining <= 0:
                break
            available = int(st.get("available_qty") or 0)
            if available <= 0:
                continue
            take_qty = min(remaining, available)
            remaining -= take_qty
            allocated_total += take_qty
            allocations.append(
                {
                    "product_code": product_code,
                    "product_name": product_meta["product_name"],
                    "batch_code": st.get("batch_code"),
                    "expiry_date": st.get("expiry_date").isoformat() if st.get("expiry_date") else None,
                    "days_until_expiry": st.get("days_until_expiry"),
                    "available_qty": available,
                    "required_qty": int(required_qty or 0),
                    "allocated_qty": take_qty,
                    "unit_price": product_meta["unit_price"],
                    "weight_g": product_meta["weight_g"],
                }
            )

        shortage_qty = max(0, int(required_qty or 0) - allocated_total)
        if shortage_qty > 0:
            warnings.append(
                f"Товар '{product_meta['product_name']}' недостаточно на складе: "
                f"требуется {int(required_qty or 0)} шт., доступно {available_total} шт., заполнено {allocated_total} шт."
            )

        items.append(
            {
                "product_code": product_code,
                "product_name": product_meta["product_name"],
                "required_qty": int(required_qty or 0),
                "available_qty_total": available_total,
                "allocated_qty_total": allocated_total,
                "shortage_qty": shortage_qty,
                "allocations": allocations,
            }
        )

    return {
        "success": True,
        "delivery_date": delivery_dt.isoformat(),
        "expeditor_login": expeditor_login,
        "warehouse_from": warehouse_from,
        "no_orders": False,
        "matched_orders_count": len(matched_order_ids),
        "matched_order_ids": matched_order_ids,
        "items": items,
        "warnings": warnings,
    }


@router.get("/operation-types")
async def list_operation_types(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Типы операций: приход, расход, продажа, возврат и т.д. (code PK) + активность из operation_config.
    active=True только если есть operation_config и oc.active=TRUE. has_config=True если конфиг есть (для создания операции)."""
    result = await session.execute(
        text(
            '''
            SELECT ot.code, ot.name, ot.description,
                   (oc.operation_type_code IS NOT NULL AND COALESCE(oc.active, TRUE) = TRUE) AS active,
                   (oc.operation_type_code IS NOT NULL) AS has_config
            FROM "Sales".operation_types ot
            LEFT JOIN "Sales".operation_config oc
              ON oc.operation_type_code = ot.code
            ORDER BY ot.code
            '''
        )
    )
    rows = result.fetchall()
    return [
        {"code": r[0], "name": r[1], "description": r[2], "active": bool(r[3]), "has_config": bool(r[4])}
        for r in rows
    ]


class OperationTypeCreate(BaseModel):
    code: str
    name: str
    description: str | None = None
    # Активность берётся из operation_config (active), здесь не управляем


class OperationTypeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    active: bool | None = None


@router.post("/operation-types")
async def create_operation_type(
    body: OperationTypeCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Добавить тип операции. Только admin. Таблица Sales.operation_types (code PK)."""
    await session.execute(
        text('INSERT INTO "Sales".operation_types (code, name, description) VALUES (:code, :name, :desc)'),
        {"code": body.code, "name": body.name, "desc": body.description},
    )
    await session.commit()
    return {"code": body.code, "name": body.name, "message": "created"}


@router.put("/operation-types/{code}")
async def update_operation_type(
    code: str,
    body: OperationTypeUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Изменить тип операции. Только admin. Активность берётся из operation_config.active."""
    if body.name is not None:
        await session.execute(
            text('UPDATE "Sales".operation_types SET name = :name WHERE code = :code'),
            {"name": body.name, "code": code},
        )
    if body.description is not None:
        await session.execute(
            text('UPDATE "Sales".operation_types SET description = :desc WHERE code = :code'),
            {"desc": body.description, "code": code},
        )
    if body.active is not None:
        # Обновляем активность в таблице конфигурации
        await session.execute(
            text('UPDATE "Sales".operation_config SET active = :act WHERE operation_type_code = :code'),
            {"act": body.active, "code": code},
        )
    await session.commit()
    return {"code": code, "message": "updated"}


@router.delete("/operation-types/{code}")
async def delete_operation_type(
    code: str,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Удалить тип операции. Только admin."""
    result = await session.execute(
        text('DELETE FROM "Sales".operation_types WHERE code = :code'),
        {"code": code},
    )
    await session.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Тип операции не найден")
    return {"code": code, "message": "deleted"}


@router.get("/operations")
async def list_operations(
    type_code: str | None = Query(None),
    customer_id: int | None = Query(None),
    product_code: str | None = Query(None),
    status: str | None = Query(None),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    created_by: str | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список операций с фильтрами."""
    q = select(Operation).order_by(Operation.operation_date.desc().nulls_last(), Operation.created_at.desc().nulls_last())
    if type_code and type_code.strip():
        q = q.where(Operation.type_code == type_code.strip())
    if customer_id is not None:
        q = q.where(Operation.customer_id == customer_id)
    if product_code and product_code.strip():
        q = q.where(Operation.product_code == product_code.strip())
    if status and status.strip():
        q = q.where(Operation.status == status.strip())
    if from_date:
        q = q.where(func.date(Operation.operation_date) >= from_date)
    if to_date:
        q = q.where(func.date(Operation.operation_date) <= to_date)
    if created_by and created_by.strip():
        q = q.where(Operation.created_by == created_by.strip())
    result = await session.execute(q)
    rows = result.scalars().all()
    type_codes = {r.type_code for r in rows if r.type_code}
    types_name_map = {}
    if type_codes:
        t_result = await session.execute(text('SELECT code, name FROM "Sales".operation_types'))
        for row in t_result.fetchall():
            if row[0] in type_codes:
                types_name_map[row[0]] = row[1] or row[0]
    customer_ids = {r.customer_id for r in rows if r.customer_id is not None}
    customer_names = {}
    if customer_ids:
        c_result = await session.execute(select(Customer.id, Customer.name_client, Customer.firm_name).where(Customer.id.in_(customer_ids)))
        for r in c_result.all():
            customer_names[r[0]] = (r[1] or r[2] or "")
    STATUS_RU = {"pending": "В ожидании", "completed": "Выполнено", "cancelled": "Отменено", "canceled": "Отменено"}
    out = []
    for o in rows:
        st = (o.status or "").strip().lower()
        out.append({
            "id": str(o.id),
            "operation_number": o.operation_number,
            "operation_date": o.operation_date.isoformat() if o.operation_date else None,
            "type_code": o.type_code,
            "type_name": types_name_map.get(o.type_code) if o.type_code else None,
            "status": o.status,
            "status_name_ru": STATUS_RU.get(st, o.status or ""),
            "warehouse_from": o.warehouse_from,
            "warehouse_to": o.warehouse_to,
            "customer_id": o.customer_id,
            "customer_name": customer_names.get(o.customer_id),
            "product_code": o.product_code,
            "quantity": o.quantity,
            "amount": float(o.amount) if o.amount else None,
            "comment": o.comment,
            "order_id": o.order_id,
            "created_by": o.created_by,
        })
    return out


class OperationCreate(BaseModel):
    type_code: str
    operation_date: datetime | date | None = None  # если не указано — now()
    warehouse_from: str | None = None
    warehouse_to: str | None = None
    product_code: str | None = None
    quantity: int | None = None
    amount: float | None = None
    payment_type_code: str | None = None
    customer_id: int | None = None
    order_id: int | None = None
    comment: str | None = None
    status: str | None = None
    expeditor_login: str | None = None
    cashier_login: str | None = None
    storekeeper_login: str | None = None

    @field_validator("customer_id", mode="before")
    @classmethod
    def customer_id_empty_to_none(cls, v):  # noqa: ANN001
        if v == "" or v is None:
            return None
        if isinstance(v, int):
            return v
        try:
            return int(v)
        except (TypeError, ValueError):
            return None

    @field_validator("order_id", mode="before")
    @classmethod
    def order_id_empty_to_none(cls, v):  # noqa: ANN001
        if v == "" or v is None:
            return None
        if v == 0:
            return None
        if isinstance(v, int):
            return v
        try:
            n = int(v)
            return None if n == 0 else n
        except (TypeError, ValueError):
            return None


class OperationUpdate(BaseModel):
    operation_date: datetime | date | None = None
    type_code: str | None = None
    warehouse_from: str | None = None
    warehouse_to: str | None = None
    product_code: str | None = None
    quantity: int | None = None
    amount: float | None = None
    payment_type_code: str | None = None
    customer_id: int | None = None
    order_id: int | None = None
    comment: str | None = None
    status: str | None = None
    completed_date: datetime | None = None
    expeditor_login: str | None = None
    cashier_login: str | None = None
    storekeeper_login: str | None = None

    @field_validator("order_id")
    @classmethod
    def order_id_zero_to_none(cls, v: int | None) -> int | None:
        return None if v == 0 else v


OPERATIONS_EXPORT_HEADERS_RU = [
    "№ операции", "Дата", "Тип", "Статус", "Склад от", "Склад в", "Товар", "Кол-во", "Сумма", "Клиент", "Заказ №", "Кто создал", "Комментарий",
]


@router.get("/operations/export")
async def export_operations_excel(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Выгрузка операций в Excel. Только admin."""
    q = select(Operation).order_by(Operation.operation_date.desc().nulls_last(), Operation.created_at.desc().nulls_last())
    result = await session.execute(q)
    rows = result.scalars().all()[:50000]
    types_name_map = {}
    t_result = await session.execute(text('SELECT code, name FROM "Sales".operation_types'))
    for row in t_result.fetchall():
        types_name_map[row[0]] = row[1] or row[0]
    customer_ids = {r.customer_id for r in rows if r.customer_id is not None}
    customer_names = {}
    if customer_ids:
        c_result = await session.execute(select(Customer.id, Customer.name_client, Customer.firm_name).where(Customer.id.in_(customer_ids)))
        for r in c_result.all():
            customer_names[r[0]] = (r[1] or r[2] or "")
    wb = Workbook()
    ws = wb.active
    ws.title = "Операции"
    for col, name in enumerate(OPERATIONS_EXPORT_HEADERS_RU, start=1):
        ws.cell(row=1, column=col, value=name)
    for row_idx, o in enumerate(rows, start=2):
        type_name = types_name_map.get(o.type_code) or o.type_code or ""
        cust_name = customer_names.get(o.customer_id) or ""
        row_data = [
            o.operation_number or "",
            o.operation_date.isoformat() if o.operation_date else "",
            type_name,
            o.status or "",
            o.warehouse_from or "",
            o.warehouse_to or "",
            o.product_code or "",
            o.quantity or "",
            float(o.amount) if o.amount is not None else "",
            cust_name,
            o.order_id or "",
            o.created_by or "",
            o.comment or "",
        ]
        for col_idx, val in enumerate(row_data, start=1):
            ws.cell(row=row_idx, column=col_idx, value=val)
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return Response(
        content=buf.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="operations.xlsx"'},
    )


@router.get("/operations/{operation_id}")
async def get_operation(
    operation_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Одна операция по id."""
    result = await session.execute(select(Operation).where(Operation.id == operation_id))
    op = result.scalar_one_or_none()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")
    type_name = None
    if op.type_code:
        t = await session.execute(
            text('SELECT name FROM "Sales".operation_types WHERE code = :code'),
            {"code": op.type_code},
        )
        row = t.fetchone()
        if row:
            type_name = row[0]
    customer_name = None
    if op.customer_id:
        c = await session.execute(select(Customer.name_client, Customer.firm_name).where(Customer.id == op.customer_id))
        row = c.scalar_one_or_none()
        if row:
            customer_name = row[0] or row[1]
    STATUS_RU = {"pending": "В ожидании", "completed": "Выполнено", "cancelled": "Отменено", "canceled": "Отменено"}
    st = (op.status or "").strip().lower()
    return {
        "id": str(op.id),
        "operation_number": op.operation_number,
        "operation_date": op.operation_date.isoformat() if op.operation_date else None,
        "completed_date": op.completed_date.isoformat() if op.completed_date else None,
        "type_code": op.type_code,
        "type_name": type_name,
        "status": op.status,
        "status_name_ru": STATUS_RU.get(st, op.status or ""),
        "warehouse_from": op.warehouse_from,
        "warehouse_to": op.warehouse_to,
        "product_code": op.product_code,
        "quantity": op.quantity,
        "amount": float(op.amount) if op.amount else None,
        "payment_type_code": op.payment_type_code,
        "customer_id": op.customer_id,
        "customer_name": customer_name,
        "order_id": op.order_id,
        "comment": op.comment,
        "created_by": op.created_by,
        "expeditor_login": op.expeditor_login,
        "cashier_login": op.cashier_login,
        "storekeeper_login": op.storekeeper_login,
    }


@router.patch("/operations/{operation_id}")
async def update_operation(
    operation_id: UUID,
    body: OperationUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Изменить операцию. Только admin."""
    result = await session.execute(select(Operation).where(Operation.id == operation_id))
    op = result.scalar_one_or_none()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")
    if body.operation_date is not None:
        op.operation_date = body.operation_date
    if body.completed_date is not None:
        op.completed_date = body.completed_date
    if body.type_code is not None:
        t = await session.execute(
            text('SELECT 1 FROM "Sales".operation_types WHERE code = :code'),
            {"code": body.type_code},
        )
        if t.fetchone() is None:
            raise HTTPException(status_code=400, detail=f"Тип операции «{body.type_code}» не найден")
        op.type_code = body.type_code
    if body.warehouse_from is not None:
        op.warehouse_from = body.warehouse_from or None
    if body.warehouse_to is not None:
        op.warehouse_to = body.warehouse_to or None
    if body.product_code is not None:
        op.product_code = body.product_code or None
    if body.quantity is not None:
        op.quantity = body.quantity
    if body.amount is not None:
        op.amount = body.amount
    if body.payment_type_code is not None:
        op.payment_type_code = body.payment_type_code or None
    if body.customer_id is not None:
        op.customer_id = body.customer_id
    if body.order_id is not None:
        op.order_id = body.order_id
    if body.comment is not None:
        op.comment = body.comment
    if body.status is not None:
        op.status = body.status
    if body.expeditor_login is not None:
        op.expeditor_login = body.expeditor_login or None
    if body.cashier_login is not None:
        op.cashier_login = body.cashier_login or None
    if body.storekeeper_login is not None:
        op.storekeeper_login = body.storekeeper_login or None
    op.updated_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(op)
    return {"id": str(op.id), "operation_number": op.operation_number, "message": "updated"}


@router.post("/operations")
async def create_operation(
    body: OperationCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Создать операцию. Номер генерируется в БД (generate_operation_number). Только admin."""
    try:
        type_check = await session.execute(
            text('SELECT 1 FROM "Sales".operation_types WHERE code = :code'),
            {"code": body.type_code},
        )
        if type_check.fetchone() is None:
            raise HTTPException(status_code=400, detail=f"Тип операции «{body.type_code}» не найден")
        if body.order_id is not None:
            order_result = await session.execute(select(Order).where(Order.order_no == body.order_id))
            if order_result.scalar_one_or_none() is None:
                raise HTTPException(status_code=400, detail=f"Заказ с номером {body.order_id} не найден")
        if body.product_code:
            prod_result = await session.execute(select(Product).where(Product.code == body.product_code.strip()))
            if prod_result.scalar_one_or_none() is None:
                raise HTTPException(status_code=400, detail=f"Товар с кодом «{body.product_code}» не найден")
        num_result = await session.execute(text('SELECT "Sales".generate_operation_number()'))
        operation_number = num_result.scalar() or f"OP-{datetime.utcnow().strftime('%Y-%m-%d')}-000001"
        op = Operation(
            operation_number=operation_number,
            type_code=body.type_code,
            operation_date=body.operation_date,
            warehouse_from=(body.warehouse_from or "").strip() or None,
            warehouse_to=(body.warehouse_to or "").strip() or None,
            product_code=body.product_code.strip() if body.product_code else None,
            quantity=body.quantity,
            amount=body.amount,
            payment_type_code=body.payment_type_code or None,
            customer_id=body.customer_id,
            order_id=body.order_id,
            comment=body.comment,
            status=body.status or "pending",
            created_by=user.login,
            expeditor_login=body.expeditor_login or None,
            cashier_login=body.cashier_login or None,
            storekeeper_login=body.storekeeper_login or None,
        )
        session.add(op)
        await session.commit()
        await session.refresh(op)
    except HTTPException:
        await session.rollback()
        raise
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Ошибка связи с данными: проверьте заказ, товар, склад или пользователя.")
    except Exception as e:
        await session.rollback()
        err_msg = str(e).strip() if e else "Ошибка сохранения"
        raise HTTPException(status_code=400, detail="Не удалось сохранить операцию: " + err_msg[:200])
    return {"id": str(op.id), "operation_number": op.operation_number, "type_code": body.type_code, "message": "created"}


logger = logging.getLogger(__name__)


@router.get("/operations/{operation_type}/form-config")
async def get_operation_form_config(
    operation_type: str,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """
    Получить конфигурацию формы для создания операции определённого типа.
    Возвращает список полей: required, optional, hidden, readonly.
    """
    logger.info(f"[FORM-CONFIG] Запрос конфига для операции: {operation_type}")
    
    # Получить конфиг из БД
    config_result = await session.execute(
        select(OperationConfig).where(
            OperationConfig.operation_type_code == operation_type,
            OperationConfig.active == True
        )
    )
    config = config_result.scalar_one_or_none()
    
    if not config:
        logger.warning(f"[FORM-CONFIG] Конфиг не найден для: {operation_type}")
        raise HTTPException(
            status_code=404,
            detail=f"Configuration for operation '{operation_type}' not found"
        )
    
    # Получить название операции из operation_types
    type_result = await session.execute(
        select(OperationType).where(OperationType.code == operation_type)
    )
    op_type = type_result.scalar_one_or_none()
    operation_name = op_type.name if op_type else operation_type
    
    # Парсить JSON из БД
    try:
        required_fields = json.loads(config.required_fields) if config.required_fields else []
        optional_fields = json.loads(config.optional_fields) if config.optional_fields else []
        hidden_fields = json.loads(config.hidden_fields) if config.hidden_fields else []
        readonly_fields = json.loads(config.readonly_fields) if config.readonly_fields else []
    except json.JSONDecodeError as e:
        logger.error(f"[FORM-CONFIG] Ошибка парсинга JSON: {e}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON in config: {str(e)}")
    
    logger.info(f"[FORM-CONFIG] Конфиг загружен: required={len(required_fields)}, optional={len(optional_fields)}")
    
    return {
        "operation_type": config.operation_type_code,
        "operation_name": operation_name,
        "description": config.description,
        "default_status": config.default_status,
        "required_fields": required_fields,
        "optional_fields": optional_fields,
        "hidden_fields": hidden_fields,
        "readonly_fields": readonly_fields,
    }


class OperationCreateFromConfig(BaseModel):
    """Модель для создания операции из конфига (динамические поля)."""
    warehouse_from: str | None = None
    warehouse_to: str | None = None
    product_code: str | None = None
    batch_code: str | None = None
    expiry_date: str | None = None  # дд.мм.гггг или YYYY-MM-DD для создания партии
    quantity: int | None = None
    amount: float | None = None
    payment_type_code: str | None = None
    customer_id: int | None = None
    order_id: int | None = None
    comment: str | None = None
    expeditor_login: str | None = None
    cashier_login: str | None = None
    storekeeper_login: str | None = None
    related_operation_id: str | None = None


@router.post("/operations/{operation_type}/create")
async def create_operation_from_config(
    operation_type: str,
    body: OperationCreateFromConfig,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """
    Создать операцию с валидацией по конфигу из operation_config.
    Проверяет required_fields, игнорирует hidden_fields, заполняет readonly_fields автоматически.
    """
    logger.info(f"=== CREATING OPERATION ===")
    logger.info(f"Operation type: {operation_type}")
    logger.info(f"Current user: {user.login}")
    logger.info(f"Incoming data: {body.model_dump()}")
    
    # ШАГ 1: Получить конфиг
    logger.info(f"[STEP 1] Получаем конфиг для операции: {operation_type}")
    
    config_result = await session.execute(
        select(OperationConfig).where(
            OperationConfig.operation_type_code == operation_type,
            OperationConfig.active == True
        )
    )
    config = config_result.scalar_one_or_none()
    
    if not config:
        logger.error(f"[STEP 1] Конфиг не найден для: {operation_type}")
        raise HTTPException(
            status_code=404,
            detail=f"Configuration for '{operation_type}' not found"
        )
    role = (user.role or "").lower()
    if operation_type == "payment_receipt_from_customer":
        if role not in ("admin", "expeditor"):
            raise HTTPException(status_code=403, detail="Только экспедитор или администратор может создать эту операцию")
    elif operation_type == "cash_receipt":
        if role not in ("admin", "paymaster"):
            raise HTTPException(status_code=403, detail="Только кассир или администратор может создать эту операцию")
    elif operation_type in ("warehouse_receipt", "allocation", "transfer", "write_off"):
        if role not in ("admin", "stockman"):
            raise HTTPException(status_code=403, detail="Только кладовщик или администратор может создать эту операцию")
    elif operation_type == "delivery":
        if role not in ("admin", "expeditor"):
            raise HTTPException(status_code=403, detail="Только экспедитор или администратор может создать эту операцию")
    elif operation_type == "promotional_sample":
        if role not in ("admin", "stockman", "expeditor"):
            raise HTTPException(status_code=403, detail="Только кладовщик, экспедитор или администратор может создать эту операцию")
    elif role != "admin":
        raise HTTPException(status_code=403, detail="Только администратор может создать эту операцию")
    logger.info(f"✓ Конфиг найден")
    
    # ШАГ 2: Парсить required_fields из конфига
    logger.info(f"[STEP 2] Проверяем обязательные поля")
    
    try:
        required_fields = json.loads(config.required_fields) if config.required_fields else []
        optional_fields = json.loads(config.optional_fields) if config.optional_fields else []
        hidden_fields = json.loads(config.hidden_fields) if config.hidden_fields else []
    except json.JSONDecodeError as e:
        logger.error(f"[STEP 2] Ошибка парсинга JSON: {e}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON in config: {str(e)}")
    
    logger.info(f"  Required: {required_fields}")
    logger.info(f"  Optional: {optional_fields}")
    logger.info(f"  Hidden: {hidden_fields}")
    
    # ШАГ 3: Проверить, что все required_fields заполнены
    logger.info(f"[STEP 3] Валидируем заполненность required_fields")
    
    data = body.model_dump(exclude_none=True)
    errors = {}
    
    for field in required_fields:
        # Специальные поля, которые заполняются автоматически
        if field in ['created_by', 'operation_date', 'operation_number', 'status', 'type_code']:
            continue
        
        # Проверить, что поле заполнено
        if field not in data or data[field] is None or (isinstance(data[field], str) and data[field].strip() == ''):
            errors[field] = "This field is required"
            logger.info(f"  ❌ {field}: MISSING")
        else:
            logger.info(f"  ✓ {field}: OK")
    
    # Если есть ошибки валидации — вернуть их
    if errors:
        logger.warning(f"\n❌ ОШИБКИ ВАЛИДАЦИИ: {errors}")
        raise HTTPException(status_code=400, detail={"errors": errors})
    
    # ШАГ 4: Проверить, что никакие hidden_fields не переданы
    logger.info(f"\n[STEP 4] Проверяем, что скрытые поля не переданы")
    
    for field in hidden_fields:
        if field in data:
            logger.warning(f"  ⚠️ ВНИМАНИЕ: Поле {field} должно быть скрыто, но передано в data!")
            del data[field]
    
    logger.info(f"✓ Скрытые поля очищены")
    
    # ШАГ 5: Заполнить readonly_fields автоматически
    logger.info(f"\n[STEP 5] Заполняем readonly_fields")
    
    # Генерируем номер операции
    num_result = await session.execute(text('SELECT "Sales".generate_operation_number()'))
    operation_number = num_result.scalar() or f"OP-{datetime.now(timezone.utc).strftime('%Y-%m-%d')}-000001"
    logger.info(f"  Generated operation_number: {operation_number}")
    
    # Получаем статус из конфига (для доставки — всегда completed)
    default_status = config.default_status
    if operation_type == "delivery":
        default_status = "completed"
    logger.info(f"  default_status: {default_status}")
    
    # Получаем текущего пользователя
    created_by = user.login
    logger.info(f"  created_by: {created_by}")
    
    # Для доставки: проверить, что заказ не уже доставлен, и что остатков хватает
    if operation_type == "delivery":
        order_id_val = data.get("order_id")
        if order_id_val is not None:
            order_row = await session.execute(select(Order).where(Order.order_no == order_id_val))
            order_obj = order_row.scalar_one_or_none()
            if order_obj and (order_obj.status_code or "").strip().lower() == "completed":
                raise HTTPException(
                    status_code=400,
                    detail="Заказ уже доставлен. Нельзя создать ещё одну операцию доставки по этому заказу.",
                )
        wh_from = data.get("warehouse_from")
        pc = data.get("product_code")
        bc = data.get("batch_code")
        qty = data.get("quantity") or 0
        if wh_from and pc and bc is not None and qty > 0:
            try:
                stock_r = await session.execute(
                    text('''
                        SELECT COALESCE(total_qty, 0)::int FROM "Sales".v_warehouse_stock
                        WHERE warehouse_code = :wh AND product_code = :pc AND batch_code = :bc
                    '''),
                    {"wh": wh_from, "pc": pc, "bc": bc},
                )
                stock_row = stock_r.fetchone()
                available = int(stock_row[0]) if stock_row and stock_row[0] is not None else 0
                if available < qty:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Недостаточно остатков на складе: доступно {available}, запрошено {qty}.",
                    )
            except HTTPException:
                raise
            except Exception:
                pass  # VIEW может отсутствовать — не блокируем создание
    
    # ШАГ 6: Создать операцию в БД
    logger.info(f"\n[STEP 6] Создаём операцию в БД")
    
    # Получить или создать batch по batch_code и product_code
    batch_id = None
    if data.get("batch_code") and data.get("product_code"):
        batch_result = await session.execute(
            select(Batch).where(
                Batch.batch_code == data["batch_code"],
                Batch.product_code == data["product_code"]
            )
        )
        batch = batch_result.scalar_one_or_none()
        if batch:
            batch_id = batch.id
        else:
            expiry_date_parsed = None
            if data.get("expiry_date"):
                raw = data["expiry_date"].strip()
                for fmt in ("%d.%m.%Y", "%Y-%m-%d"):
                    try:
                        expiry_date_parsed = datetime.strptime(raw, fmt).date()
                        break
                    except ValueError:
                        continue
            new_batch = Batch(
                product_code=data["product_code"],
                batch_code=data["batch_code"],
                expiry_date=expiry_date_parsed,
            )
            session.add(new_batch)
            await session.flush()
            batch_id = new_batch.id
            logger.info(f"  Создана новая партия: {data['batch_code']}, expiry_date={expiry_date_parsed}")
    
    op = Operation(
        operation_number=operation_number,
        type_code=operation_type,
        status=default_status,
        operation_date=datetime.now(timezone.utc),
        created_by=created_by,
        warehouse_from=data.get("warehouse_from"),
        warehouse_to=data.get("warehouse_to"),
        product_code=data.get("product_code"),
        batch_id=batch_id,
        quantity=data.get("quantity"),
        amount=data.get("amount"),
        payment_type_code=data.get("payment_type_code"),
        customer_id=data.get("customer_id"),
        order_id=data.get("order_id"),
        comment=data.get("comment"),
        expeditor_login=data.get("expeditor_login"),
        cashier_login=data.get("cashier_login"),
        storekeeper_login=data.get("storekeeper_login"),
        related_operation_id=UUID(data["related_operation_id"]) if data.get("related_operation_id") else None,
    )
    
    session.add(op)
    await session.flush()
    if operation_type == "payment_receipt_from_customer":
        num2 = (await session.execute(text('SELECT "Sales".generate_operation_number()'))).scalar() or "OP-000000"
        handover = Operation(
            operation_number=num2,
            type_code="cash_handover_from_expeditor",
            status="pending",
            operation_date=datetime.now(timezone.utc),
            created_by=op.created_by,
            amount=op.amount,
            expeditor_login=op.expeditor_login,
            customer_id=op.customer_id,
            order_id=op.order_id,
            related_operation_id=op.id,
        )
        session.add(handover)
        logger.info(f"  Автосоздана cash_handover_from_expeditor: {num2}")
    try:
        await session.commit()
        await session.refresh(op)
    except IntegrityError as e:
        await session.rollback()
        logger.error(f"[STEP 6] Ошибка IntegrityError: {e}")
        raise HTTPException(status_code=400, detail="Ошибка связи с данными: проверьте заказ, товар, склад или пользователя.")
    except Exception as e:
        await session.rollback()
        logger.error(f"[STEP 6] Ошибка создания операции: {e}")
        err_msg = str(e).strip() if e else "Ошибка сохранения"
        raise HTTPException(status_code=400, detail="Не удалось сохранить операцию: " + err_msg[:200])
    
    logger.info(f"✓ Операция создана: {op.operation_number}")
    logger.info(f"=== END ===")
    
    # ШАГ 7: Вернуть результат
    return {
        "status": "success",
        "operation_id": str(op.id),
        "operation_number": op.operation_number,
        "type": operation_type,
        "default_status": op.status,
        "message": f"Operation '{operation_type}' created successfully"
    }


class WarehouseReceiptBatchItem(BaseModel):
    """Одна позиция товара для прихода на склад."""
    product_code: str
    expiry_date: str  # дд.мм.гггг или YYYY-MM-DD
    quantity: int
    batch_code: str  # автогенерируется, но передаётся для проверки


class WarehouseReceiptBatchCreate(BaseModel):
    """Создание нескольких операций прихода на склад."""
    warehouse_to: str
    items: list[WarehouseReceiptBatchItem]
    comment: str | None = None


@router.post("/operations/warehouse_receipt/create-batch")
async def create_warehouse_receipt_batch(
    body: WarehouseReceiptBatchCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """
    Создать несколько операций прихода на склад за раз (для каждого товара отдельная операция).
    batch_code генерируется автоматически как {product_code}_{DDMMYYYY} на основе expiry_date.
    """
    logger.info(f"=== CREATING WAREHOUSE RECEIPT BATCH ===")
    logger.info(f"Warehouse: {body.warehouse_to}, Items: {len(body.items)}")
    logger.info(f"Current user: {user.login}")
    
    if not body.items:
        raise HTTPException(status_code=400, detail="Список товаров пуст")
    
    # Получить конфиг для warehouse_receipt
    config_result = await session.execute(
        select(OperationConfig).where(
            OperationConfig.operation_type_code == 'warehouse_receipt',
            OperationConfig.active == True
        )
    )
    config = config_result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration for 'warehouse_receipt' not found")
    
    default_status = config.default_status
    created_operations = []
    errors = []
    
    for idx, item in enumerate(body.items):
        try:
            # Парсить expiry_date
            expiry_date_parsed = None
            raw = item.expiry_date.strip()
            for fmt in ("%d.%m.%Y", "%Y-%m-%d"):
                try:
                    expiry_date_parsed = datetime.strptime(raw, fmt).date()
                    break
                except ValueError:
                    continue
            
            if not expiry_date_parsed:
                errors.append(f"Позиция {idx + 1}: неверный формат даты '{item.expiry_date}'")
                continue
            
            # Проверить batch_code (должен быть product_code_DDMMYYYY)
            expected_batch_code = f"{item.product_code}_{expiry_date_parsed.strftime('%d%m%Y')}"
            if item.batch_code != expected_batch_code:
                logger.warning(f"  Позиция {idx + 1}: batch_code не совпадает. Ожидалось: {expected_batch_code}, получено: {item.batch_code}")
                # Используем ожидаемый код
                batch_code = expected_batch_code
            else:
                batch_code = item.batch_code
            
            # Найти или создать партию
            batch_result = await session.execute(
                select(Batch).where(
                    Batch.batch_code == batch_code,
                    Batch.product_code == item.product_code
                )
            )
            batch = batch_result.scalar_one_or_none()
            
            if not batch:
                new_batch = Batch(
                    product_code=item.product_code,
                    batch_code=batch_code,
                    expiry_date=expiry_date_parsed,
                )
                session.add(new_batch)
                await session.flush()
                batch_id = new_batch.id
                logger.info(f"  Создана партия: {batch_code}")
            else:
                batch_id = batch.id
            
            # Генерировать номер операции
            num_result = await session.execute(text('SELECT "Sales".generate_operation_number()'))
            operation_number = num_result.scalar() or f"OP-{datetime.now(timezone.utc).strftime('%Y-%m-%d')}-000001"
            
            # Создать операцию
            op = Operation(
                operation_number=operation_number,
                type_code='warehouse_receipt',
                status=default_status,
                operation_date=datetime.now(timezone.utc),
                created_by=user.login,
                warehouse_to=body.warehouse_to,
                product_code=item.product_code,
                batch_id=batch_id,
                quantity=item.quantity,
                comment=body.comment,
            )
            session.add(op)
            await session.flush()
            created_operations.append({
                "operation_number": op.operation_number,
                "product_code": item.product_code,
                "quantity": item.quantity,
            })
            logger.info(f"  Создана операция: {op.operation_number} для товара {item.product_code}")
            
        except Exception as e:
            logger.error(f"  Ошибка при создании позиции {idx + 1}: {e}")
            errors.append(f"Позиция {idx + 1}: {str(e)[:100]}")
            continue
    
    if errors and not created_operations:
        await session.rollback()
        raise HTTPException(status_code=400, detail={"errors": errors})
    
    try:
        await session.commit()
        logger.info(f"✓ Создано операций: {len(created_operations)}")
        logger.info(f"=== END ===")
    except Exception as e:
        await session.rollback()
        logger.error(f"Ошибка коммита: {e}")
        raise HTTPException(status_code=400, detail=f"Не удалось сохранить операции: {str(e)[:200]}")
    
    return {
        "status": "success",
        "operations_count": len(created_operations),
        "operations": created_operations,
        "errors": errors if errors else None,
        "message": f"Создано операций: {len(created_operations)}"
    }


class AllocationCreate(BaseModel):
    """Модель для выдачи товара экспедитору (allocation)."""
    warehouse_from: str
    warehouse_to: str
    product_code: str
    batch_code: str
    quantity: int
    expeditor_login: str
    comment: str | None = None


@router.post("/operations/allocation")
async def create_allocation_operation(
    body: AllocationCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """
    Создать одну операцию «allocation» (выдача экспедитору).

    Использует существующую партию (batch) по product_code + batch_code,
    не создаёт новые партии.
    """
    role = (user.role or "").strip().lower()
    if role not in ("admin", "stockman"):
        raise HTTPException(
            status_code=403,
            detail="Только кладовщик или администратор может создать эту операцию",
        )

    # Найти партию по product_code + batch_code
    batch_result = await session.execute(
        select(Batch).where(
            Batch.product_code == body.product_code.strip(),
            Batch.batch_code == body.batch_code.strip(),
        )
    )
    batch = batch_result.scalar_one_or_none()
    if not batch:
        raise HTTPException(
            status_code=400,
            detail=f"Партия с кодом «{body.batch_code}» для товара «{body.product_code}» не найдена",
        )

    # Получить конфиг для allocation, чтобы взять default_status
    config_result = await session.execute(
        select(OperationConfig).where(
            OperationConfig.operation_type_code == "allocation",
            OperationConfig.active == True,
        )
    )
    config = config_result.scalar_one_or_none()
    default_status = config.default_status if config else "completed"

    # Сгенерировать номер операции
    num_result = await session.execute(text('SELECT "Sales".generate_operation_number()'))
    operation_number = num_result.scalar() or f"OP-{datetime.utcnow().strftime('%Y-%m-%d')}-000001"

    op = Operation(
        operation_number=operation_number,
        type_code="allocation",
        status=default_status,
        operation_date=datetime.now(timezone.utc),
        created_by=user.login,
        warehouse_from=body.warehouse_from.strip(),
        warehouse_to=body.warehouse_to.strip(),
        product_code=body.product_code.strip(),
        batch_id=batch.id,
        quantity=body.quantity,
        comment=body.comment,
        expeditor_login=body.expeditor_login.strip(),
    )

    session.add(op)
    try:
        await session.commit()
        await session.refresh(op)
    except IntegrityError as e:
        await session.rollback()
        logger.error(f"[ALLOCATION] IntegrityError: {e}")
        raise HTTPException(
            status_code=400,
            detail="Ошибка связи с данными: проверьте склады, товар, партию или пользователя.",
        )
    except Exception as e:
        await session.rollback()
        logger.error(f"[ALLOCATION] Ошибка создания операции: {e}")
        err_msg = str(e).strip() if e else "Ошибка сохранения"
        raise HTTPException(status_code=400, detail="Не удалось сохранить операцию: " + err_msg[:200])

    return {
        "status": "success",
        "operation_id": str(op.id),
        "operation_number": op.operation_number,
        "type": op.type_code,
        "message": "Операция выдачи экспедитору создана",
    }
