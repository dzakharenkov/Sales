"""
ТЗ: 6 типизированных эндпоинтов операций (warehouse_receipt, allocation, delivery,
cash_receipt, return_from_customer, cash_return) с валидациями и транзакциями.
Остатки считаются через VIEW v_warehouse_stock (из operations).
"""
from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import Operation, Batch, Customer, Product, Order, User
from src.core.deps import get_current_user

router = APIRouter()

# ТЗ-VAL-003
QUANTITY_MIN, QUANTITY_MAX = 1, 1_000_000
AMOUNT_MIN, AMOUNT_MAX = 0, 1_000_000_000


# ─── DTOs (ТЗ) ─────────────────────────────────────────────────────────────

class WarehouseReceiptDT(BaseModel):
    warehouse_to: str
    product_code: str
    batch_code: str
    quantity: int = Field(..., ge=QUANTITY_MIN, le=QUANTITY_MAX)
    expiry_date: str  # YYYY-MM-DD
    created_by: str
    comment: str | None = None


class AllocationDT(BaseModel):
    warehouse_from: str
    warehouse_to: str
    product_code: str
    batch_code: str
    quantity: int = Field(..., ge=QUANTITY_MIN, le=QUANTITY_MAX)
    expeditor_login: str
    created_by: str
    comment: str | None = None


class DeliveryDT(BaseModel):
    warehouse_from: str
    product_code: str
    batch_code: str
    quantity: int = Field(..., ge=QUANTITY_MIN, le=QUANTITY_MAX)
    customer_id: int
    order_id: int | None = None
    amount: Decimal | None = None  # если не передан — рассчитывается как price * quantity
    payment_type_code: str
    expeditor_login: str
    created_by: str
    comment: str | None = None


class WriteOffDT(BaseModel):
    warehouse_from: str
    product_code: str
    batch_code: str
    quantity: int = Field(..., ge=QUANTITY_MIN, le=QUANTITY_MAX)
    amount: Decimal | None = None
    created_by: str
    comment: str | None = None


class TransferDT(BaseModel):
    """Перемещение между складами (без экспедитора)."""
    warehouse_from: str
    warehouse_to: str
    product_code: str
    batch_code: str
    quantity: int = Field(..., ge=QUANTITY_MIN, le=QUANTITY_MAX)
    created_by: str
    comment: str | None = None


class CashReceiptDT(BaseModel):
    customer_id: int
    amount: Decimal = Field(..., ge=AMOUNT_MIN, le=AMOUNT_MAX)
    payment_type_code: str
    cashier_login: str
    expeditor_login: str | None = None
    related_delivery_operation_id: UUID
    created_by: str
    comment: str | None = None


class ReturnFromCustomerDT(BaseModel):
    warehouse_to: str
    product_code: str
    batch_code: str
    quantity: int = Field(..., ge=QUANTITY_MIN, le=QUANTITY_MAX)
    customer_id: int
    expeditor_login: str
    amount: Decimal | None = None  # вычет, может быть отрицательным
    related_delivery_operation_id: UUID
    created_by: str
    comment: str | None = None


class CashReturnDT(BaseModel):
    customer_id: int
    amount: Decimal = Field(..., ge=AMOUNT_MIN, le=AMOUNT_MAX)
    payment_type_code: str
    cashier_login: str
    expeditor_login: str | None = None
    related_return_operation_id: UUID
    created_by: str
    comment: str | None = None


# ─── Валидации справочников (ТЗ-VAL-004) ──────────────────────────────────

async def validate_warehouse(session: AsyncSession, code: str) -> bool:
    r = await session.execute(text('SELECT 1 FROM "Sales".warehouse WHERE code = :c'), {"c": code})
    return r.scalar() is not None


async def validate_product(session: AsyncSession, code: str) -> bool:
    r = await session.execute(
        text('SELECT 1 FROM "Sales".product WHERE code = :c AND active = TRUE'), {"c": code}
    )
    return r.scalar() is not None


async def validate_customer(session: AsyncSession, customer_id: int) -> bool:
    r = await session.execute(select(Customer).where(Customer.id == customer_id))
    return r.scalar_one_or_none() is not None


async def validate_user_role(session: AsyncSession, login: str, allowed_roles: list[str]) -> bool:
    r = await session.execute(select(User).where(User.login == login))
    u = r.scalar_one_or_none()
    if not u:
        return False
    return (u.role or "").lower() in [r.lower() for r in allowed_roles]


async def validate_payment_type(session: AsyncSession, code: str) -> bool:
    r = await session.execute(text('SELECT 1 FROM "Sales".payment_type WHERE code = :c'), {"c": code})
    return r.scalar() is not None


# ─── Бизнес-правила (ТЗ-BIZ) ──────────────────────────────────────────────

async def get_stock_from_view(
    session: AsyncSession, warehouse_code: str, product_code: str, batch_code: str | None = None
) -> int:
    """Остаток по VIEW v_warehouse_stock (если VIEW нет — возвращаем 0)."""
    try:
        if batch_code:
            r = await session.execute(
                text('''
                    SELECT total_qty FROM "Sales".v_warehouse_stock
                    WHERE warehouse_code = :wh AND product_code = :pc AND batch_code = :bc
                '''),
                {"wh": warehouse_code, "pc": product_code, "bc": batch_code},
            )
        else:
            r = await session.execute(
                text('''
                    SELECT COALESCE(SUM(total_qty), 0)::int FROM "Sales".v_warehouse_stock
                    WHERE warehouse_code = :wh AND product_code = :pc
                '''),
                {"wh": warehouse_code, "pc": product_code},
            )
        row = r.fetchone()
        return int(row[0]) if row and row[0] is not None else 0
    except Exception:
        return 0


async def check_batch_expiry(session: AsyncSession, batch_code: str) -> tuple[bool, str]:
    """ТЗ-BIZ-002: партия не просрочена."""
    r = await session.execute(
        text('SELECT expiry_date FROM "Sales".batches WHERE batch_code = :bc'), {"bc": batch_code}
    )
    row = r.fetchone()
    if not row or not row[0]:
        return True, ""
    if row[0] <= date.today():
        return False, f"Партия {batch_code} просрочена"
    return True, ""


def error_400(error_code: str, error_message: str, details: dict | None = None):
    return HTTPException(
        status_code=400,
        detail={
            "success": False,
            "error_code": error_code,
            "error_message": error_message,
            "details": details or {},
        },
    )


def success_201(**kwargs):
    return {"success": True, **kwargs}


# ─── Вспомогательно: партия и номер операции ──────────────────────────────

async def get_or_create_batch(
    session: AsyncSession, product_code: str, batch_code: str, expiry_date: str | None
) -> UUID:
    r = await session.execute(
        select(Batch).where(
            Batch.product_code == product_code,
            Batch.batch_code == batch_code,
        )
    )
    batch = r.scalar_one_or_none()
    if batch:
        return batch.id
    exp_date = None
    if expiry_date:
        try:
            exp_date = date.fromisoformat(expiry_date[:10])
        except (ValueError, TypeError):
            pass
    batch = Batch(
        product_code=product_code,
        batch_code=batch_code,
        expiry_date=exp_date,
    )
    session.add(batch)
    await session.flush()
    return batch.id


async def generate_op_number(session: AsyncSession) -> str:
    r = await session.execute(text('SELECT "Sales".generate_operation_number()'))
    return (r.scalar() or "OP-000000") or "OP-000000"


# ─── POST /operations/warehouse_receipt (ТЗ-ALG-001) ───────────────────────

@router.post("/operations/warehouse_receipt", status_code=201)
async def post_warehouse_receipt(
    dt: WarehouseReceiptDT,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Приход товара на склад. ТЗ-ALG-001."""
    if not await validate_warehouse(session, dt.warehouse_to):
        raise error_400("INVALID_WAREHOUSE", "Склад не найден", {"warehouse_to": dt.warehouse_to})
    if not await validate_product(session, dt.product_code):
        raise error_400("INVALID_PRODUCT", "Товар не найден", {"product_code": dt.product_code})
    if not await validate_user_role(session, dt.created_by, ["admin", "stockman"]):
        raise error_400("INVALID_USER", "Пользователь не найден или роль не admin/stockman", {"created_by": dt.created_by})

    try:
        batch_id = await get_or_create_batch(session, dt.product_code, dt.batch_code, dt.expiry_date)
        op_number = await generate_op_number(session)

        op = Operation(
            operation_number=op_number,
            type_code="warehouse_receipt",
            warehouse_to=dt.warehouse_to,
            product_code=dt.product_code,
            batch_id=batch_id,
            quantity=dt.quantity,
            created_by=dt.created_by,
            status="completed",
            comment=dt.comment,
        )
        session.add(op)
        await session.commit()
        await session.refresh(op)

        stock_after = await get_stock_from_view(session, dt.warehouse_to, dt.product_code, dt.batch_code)
        return success_201(
            operation_id=str(op.id),
            operation_number=op_number,
            type_code="warehouse_receipt",
            status="completed",
            warehouse_stock_after={dt.warehouse_to: {dt.product_code: {dt.batch_code: stock_after}}},
            created_at=op.operation_date.isoformat() if op.operation_date else None,
            message="Товар успешно поступил на склад",
        )
    except Exception as e:
        await session.rollback()
        raise error_400("DATABASE_ERROR", str(e)[:200], {})


# ─── POST /operations/allocation (ТЗ-ALG-002) ──────────────────────────────

@router.post("/operations/allocation", status_code=201)
async def post_allocation(
    dt: AllocationDT,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Выдача товара экспедитору. ТЗ-ALG-002."""
    if not await validate_warehouse(session, dt.warehouse_from):
        raise error_400("INVALID_WAREHOUSE", "Склад от не найден", {"warehouse_from": dt.warehouse_from})
    if not await validate_warehouse(session, dt.warehouse_to):
        raise error_400("INVALID_WAREHOUSE", "Склад в не найден", {"warehouse_to": dt.warehouse_to})
    if not await validate_product(session, dt.product_code):
        raise error_400("INVALID_PRODUCT", "Товар не найден", {"product_code": dt.product_code})
    if not await validate_user_role(session, dt.expeditor_login, ["expeditor"]):
        raise error_400("INVALID_USER", "Экспедитор не найден или роль не expeditor", {"expeditor_login": dt.expeditor_login})

    available = await get_stock_from_view(session, dt.warehouse_from, dt.product_code, dt.batch_code)
    if available < dt.quantity:
        raise error_400(
            "INSUFFICIENT_STOCK",
            "Недостаточно товара на складе",
            {"warehouse": dt.warehouse_from, "product_code": dt.product_code, "batch_code": dt.batch_code, "requested": dt.quantity, "available": available},
        )

    try:
        r = await session.execute(
            select(Batch).where(Batch.product_code == dt.product_code, Batch.batch_code == dt.batch_code)
        )
        batch = r.scalar_one_or_none()
        if not batch:
            raise error_400("INVALID_BATCH", "Партия не найдена", {"batch_code": dt.batch_code})
        batch_id = batch.id

        op_number = await generate_op_number(session)
        op = Operation(
            operation_number=op_number,
            type_code="allocation",
            warehouse_from=dt.warehouse_from,
            warehouse_to=dt.warehouse_to,
            product_code=dt.product_code,
            batch_id=batch_id,
            quantity=dt.quantity,
            expeditor_login=dt.expeditor_login,
            created_by=dt.created_by,
            status="completed",
            comment=dt.comment,
        )
        session.add(op)
        await session.commit()
        await session.refresh(op)

        from_main = await get_stock_from_view(session, dt.warehouse_from, dt.product_code, dt.batch_code)
        to_wh = await get_stock_from_view(session, dt.warehouse_to, dt.product_code, dt.batch_code)
        return success_201(
            operation_id=str(op.id),
            operation_number=op_number,
            type_code="allocation",
            warehouse_from=dt.warehouse_from,
            warehouse_to=dt.warehouse_to,
            quantity=dt.quantity,
            warehouse_stock_after={
                dt.warehouse_from: {dt.product_code: {dt.batch_code: from_main}},
                dt.warehouse_to: {dt.product_code: {dt.batch_code: to_wh}},
            },
            created_at=op.operation_date.isoformat() if op.operation_date else None,
            message="Товар успешно выдан экспедитору",
        )
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise error_400("DATABASE_ERROR", str(e)[:200], {})


# ─── POST /operations/delivery (ТЗ-ALG-003) ────────────────────────────────

@router.post("/operations/delivery", status_code=201)
async def post_delivery(
    dt: DeliveryDT,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Доставка клиенту. ТЗ-ALG-003."""
    if not await validate_warehouse(session, dt.warehouse_from):
        raise error_400("INVALID_WAREHOUSE", "Склад не найден", {"warehouse_from": dt.warehouse_from})
    prod_result = await session.execute(select(Product).where(Product.code == dt.product_code))
    product = prod_result.scalar_one_or_none()
    if not product:
        raise error_400("INVALID_PRODUCT", "Товар не найден", {"product_code": dt.product_code})
    if not await validate_customer(session, dt.customer_id):
        raise error_400("INVALID_CUSTOMER", "Клиент не найден", {"customer_id": dt.customer_id})
    if not await validate_payment_type(session, dt.payment_type_code):
        raise error_400("INVALID_PAYMENT_TYPE", "Тип оплаты не найден", {"payment_type_code": dt.payment_type_code})

    available = await get_stock_from_view(session, dt.warehouse_from, dt.product_code, dt.batch_code)
    if available < dt.quantity:
        raise error_400(
            "INSUFFICIENT_STOCK",
            "Недостаточно товара на витрине",
            {"warehouse": dt.warehouse_from, "product_code": dt.product_code, "requested": dt.quantity, "available": available},
        )
    ok, msg = await check_batch_expiry(session, dt.batch_code)
    if not ok:
        raise error_400("EXPIRED_BATCH", msg, {"batch_code": dt.batch_code})

    try:
        r = await session.execute(
            select(Batch).where(Batch.product_code == dt.product_code, Batch.batch_code == dt.batch_code)
        )
        batch = r.scalar_one_or_none()
        if not batch:
            raise error_400("INVALID_BATCH", "Партия не найдена", {"batch_code": dt.batch_code})

        unit_price = float(product.price) if product.price is not None else 0
        calc_amount = unit_price * dt.quantity
        amount_to_use = float(dt.amount) if dt.amount is not None and float(dt.amount) > 0 else calc_amount
        if amount_to_use < AMOUNT_MIN or amount_to_use > AMOUNT_MAX:
            amount_to_use = calc_amount
        op_number = await generate_op_number(session)
        op = Operation(
            operation_number=op_number,
            type_code="delivery",
            warehouse_from=dt.warehouse_from,
            product_code=dt.product_code,
            batch_id=batch.id,
            quantity=dt.quantity,
            customer_id=dt.customer_id,
            order_id=dt.order_id,
            amount=amount_to_use,
            payment_type_code=dt.payment_type_code,
            expeditor_login=dt.expeditor_login,
            created_by=dt.created_by,
            status="pending",
            comment=dt.comment,
        )
        session.add(op)
        await session.flush()
        if dt.order_id:
            await session.execute(
                text('UPDATE "Sales".orders SET status_code = :st WHERE order_no = :oid'),
                {"st": "delivery", "oid": dt.order_id},
            )
        await session.commit()
        await session.refresh(op)

        stock_after = await get_stock_from_view(session, dt.warehouse_from, dt.product_code, dt.batch_code)
        return success_201(
            operation_id=str(op.id),
            operation_number=op_number,
            type_code="delivery",
            status="pending",
            customer_id=dt.customer_id,
            amount=amount_to_use,
            quantity=dt.quantity,
            warehouse_stock_after={dt.warehouse_from: {dt.product_code: {dt.batch_code: stock_after}}},
            created_at=op.operation_date.isoformat() if op.operation_date else None,
            message="Товар отправлен клиенту. Ожидание оплаты.",
        )
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise error_400("DATABASE_ERROR", str(e)[:200], {})


# ─── POST /operations/write_off ──────────────────────────────────────────────

@router.post("/operations/write_off", status_code=201)
async def post_write_off(
    dt: WriteOffDT,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Списание товара со склада."""
    if not await validate_warehouse(session, dt.warehouse_from):
        raise error_400("INVALID_WAREHOUSE", "Склад не найден", {"warehouse_from": dt.warehouse_from})
    if not await validate_product(session, dt.product_code):
        raise error_400("INVALID_PRODUCT", "Товар не найден", {"product_code": dt.product_code})

    available = await get_stock_from_view(session, dt.warehouse_from, dt.product_code, dt.batch_code)
    if available < dt.quantity:
        raise error_400(
            "INSUFFICIENT_STOCK",
            "Недостаточно товара на складе",
            {"warehouse": dt.warehouse_from, "product_code": dt.product_code, "batch_code": dt.batch_code, "requested": dt.quantity, "available": available},
        )

    r = await session.execute(
        select(Batch).where(Batch.product_code == dt.product_code, Batch.batch_code == dt.batch_code)
    )
    batch = r.scalar_one_or_none()
    if not batch:
        raise error_400("INVALID_BATCH", "Партия не найдена", {"batch_code": dt.batch_code})
    batch_id = batch.id

    amount_to_use = dt.amount
    if amount_to_use is None or amount_to_use <= 0:
        prod_result = await session.execute(select(Product).where(Product.code == dt.product_code))
        product = prod_result.scalar_one_or_none()
        price = float(product.price) if product and product.price is not None else 0
        amount_to_use = Decimal(str(price)) * dt.quantity

    if not await validate_user_role(session, dt.created_by, ["admin", "stockman"]):
        raise error_400("INVALID_USER", "Пользователь не найден или роль не admin/stockman", {"created_by": dt.created_by})

    try:
        op_number = await generate_op_number(session)
        op = Operation(
            operation_number=op_number,
            type_code="write_off",
            warehouse_from=dt.warehouse_from,
            product_code=dt.product_code,
            batch_id=batch_id,
            quantity=dt.quantity,
            amount=float(amount_to_use),
            created_by=dt.created_by,
            status="completed",
            comment=dt.comment,
        )
        session.add(op)
        await session.commit()
        await session.refresh(op)

        stock_after = await get_stock_from_view(session, dt.warehouse_from, dt.product_code, dt.batch_code)
        return success_201(
            operation_id=str(op.id),
            operation_number=op_number,
            type_code="write_off",
            status="completed",
            quantity=dt.quantity,
            amount=float(amount_to_use),
            warehouse_stock_after={dt.warehouse_from: {dt.product_code: {dt.batch_code: stock_after}}},
            created_at=op.operation_date.isoformat() if op.operation_date else None,
            message="Товар успешно списан",
        )
    except Exception as e:
        await session.rollback()
        raise error_400("DATABASE_ERROR", str(e)[:200], {})


# ─── POST /operations/transfer (перемещение между складами) ────────────────

@router.post("/operations/transfer", status_code=201)
async def post_transfer(
    dt: TransferDT,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Перемещение товара между складами (без экспедитора)."""
    if not await validate_warehouse(session, dt.warehouse_from):
        raise error_400("INVALID_WAREHOUSE", "Склад от не найден", {"warehouse_from": dt.warehouse_from})
    if not await validate_warehouse(session, dt.warehouse_to):
        raise error_400("INVALID_WAREHOUSE", "Склад в не найден", {"warehouse_to": dt.warehouse_to})
    if dt.warehouse_from == dt.warehouse_to:
        raise error_400("SAME_WAREHOUSE", "Склад от и склад в не должны совпадать", {})
    if not await validate_product(session, dt.product_code):
        raise error_400("INVALID_PRODUCT", "Товар не найден", {"product_code": dt.product_code})

    available = await get_stock_from_view(session, dt.warehouse_from, dt.product_code, dt.batch_code)
    if available < dt.quantity:
        raise error_400(
            "INSUFFICIENT_STOCK",
            "Недостаточно товара на складе",
            {"warehouse": dt.warehouse_from, "product_code": dt.product_code, "batch_code": dt.batch_code, "requested": dt.quantity, "available": available},
        )

    if not await validate_user_role(session, dt.created_by, ["admin", "stockman"]):
        raise error_400("INVALID_USER", "Пользователь не найден или роль не admin/stockman", {"created_by": dt.created_by})

    try:
        r = await session.execute(
            select(Batch).where(Batch.product_code == dt.product_code, Batch.batch_code == dt.batch_code)
        )
        batch = r.scalar_one_or_none()
        if not batch:
            raise error_400("INVALID_BATCH", "Партия не найдена", {"batch_code": dt.batch_code})
        batch_id = batch.id

        op_number = await generate_op_number(session)
        op = Operation(
            operation_number=op_number,
            type_code="transfer",
            warehouse_from=dt.warehouse_from,
            warehouse_to=dt.warehouse_to,
            product_code=dt.product_code,
            batch_id=batch_id,
            quantity=dt.quantity,
            created_by=dt.created_by,
            status="completed",
            comment=dt.comment,
        )
        session.add(op)
        await session.commit()
        await session.refresh(op)

        from_after = await get_stock_from_view(session, dt.warehouse_from, dt.product_code, dt.batch_code)
        to_after = await get_stock_from_view(session, dt.warehouse_to, dt.product_code, dt.batch_code)
        return success_201(
            operation_id=str(op.id),
            operation_number=op_number,
            type_code="transfer",
            warehouse_from=dt.warehouse_from,
            warehouse_to=dt.warehouse_to,
            quantity=dt.quantity,
            warehouse_stock_after={
                dt.warehouse_from: {dt.product_code: {dt.batch_code: from_after}},
                dt.warehouse_to: {dt.product_code: {dt.batch_code: to_after}},
            },
            created_at=op.operation_date.isoformat() if op.operation_date else None,
            message="Товар успешно перемещён",
        )
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise error_400("DATABASE_ERROR", str(e)[:200], {})


# ─── POST /operations/cash_receipt (ТЗ-ALG-004) ────────────────────────────

@router.post("/operations/cash_receipt", status_code=201)
async def post_cash_receipt(
    dt: CashReceiptDT,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Приём наличных (связь с delivery). ТЗ-ALG-004."""
    try:
        r = await session.execute(
            select(Operation).where(
                Operation.id == dt.related_delivery_operation_id,
                Operation.type_code == "delivery",
                Operation.status == "pending",
            )
        )
        delivery = r.scalar_one_or_none()
        if not delivery:
            raise error_400(
                "INVALID_RELATED_OPERATION",
                "Операция доставки не найдена или уже оплачена",
                {"related_operation_id": str(dt.related_delivery_operation_id)},
            )

        op_number = await generate_op_number(session)
        op = Operation(
            operation_number=op_number,
            type_code="cash_receipt",
            customer_id=dt.customer_id,
            amount=float(dt.amount),
            payment_type_code=dt.payment_type_code,
            cashier_login=dt.cashier_login,
            expeditor_login=dt.expeditor_login,
            related_operation_id=delivery.id,
            created_by=dt.created_by,
            status="completed",
            comment=dt.comment,
        )
        session.add(op)
        await session.flush()

        delivery.status = "completed"
        if delivery.order_id:
            await session.execute(
                text('UPDATE "Sales".orders SET status_code = :st WHERE order_no = :oid'),
                {"st": "completed", "oid": delivery.order_id},
            )
        await session.commit()
        await session.refresh(op)

        return success_201(
            operation_id=str(op.id),
            operation_number=op_number,
            type_code="cash_receipt",
            status="completed",
            amount=float(dt.amount),
            related_operation_id=str(delivery.id),
            related_operation_number=delivery.operation_number,
            delivery_status_updated_to="completed",
            order_status_updated_to="completed",
            created_at=op.operation_date.isoformat() if op.operation_date else None,
            message="Платёж успешно принят. Заказ завершен.",
        )
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise error_400("DATABASE_ERROR", str(e)[:200], {})


# ─── POST /operations/return_from_customer (ТЗ-ALG-005) ────────────────────

@router.post("/operations/return_from_customer", status_code=201)
async def post_return_from_customer(
    dt: ReturnFromCustomerDT,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Возврат товара от клиента. ТЗ-ALG-005."""
    if not await validate_warehouse(session, dt.warehouse_to):
        raise error_400("INVALID_WAREHOUSE", "Склад не найден", {"warehouse_to": dt.warehouse_to})
    if not await validate_product(session, dt.product_code):
        raise error_400("INVALID_PRODUCT", "Товар не найден", {"product_code": dt.product_code})
    if not await validate_customer(session, dt.customer_id):
        raise error_400("INVALID_CUSTOMER", "Клиент не найден", {"customer_id": dt.customer_id})

    r = await session.execute(
        select(Operation).where(
            Operation.id == dt.related_delivery_operation_id,
            Operation.type_code == "delivery",
        )
    )
    delivery = r.scalar_one_or_none()
    if not delivery:
        raise error_400(
            "INVALID_RELATED_OPERATION",
            "Операция доставки не найдена",
            {"related_operation_id": str(dt.related_delivery_operation_id)},
        )
    if (delivery.quantity or 0) < dt.quantity:
        raise error_400(
            "RETURN_QUANTITY_EXCEEDED",
            "Количество возврата больше доставленного",
            {"delivery_quantity": delivery.quantity, "return_quantity": dt.quantity},
        )

    try:
        r2 = await session.execute(
            select(Batch).where(Batch.product_code == dt.product_code, Batch.batch_code == dt.batch_code)
        )
        batch = r2.scalar_one_or_none()
        if not batch:
            raise error_400("INVALID_BATCH", "Партия не найдена", {"batch_code": dt.batch_code})

        op_number = await generate_op_number(session)
        amount_adj = float(dt.amount) if dt.amount is not None else None
        op = Operation(
            operation_number=op_number,
            type_code="return_from_customer",
            warehouse_to=dt.warehouse_to,
            product_code=dt.product_code,
            batch_id=batch.id,
            quantity=dt.quantity,
            customer_id=dt.customer_id,
            amount=amount_adj,
            expeditor_login=dt.expeditor_login,
            related_operation_id=delivery.id,
            created_by=dt.created_by,
            status="completed",
            comment=dt.comment,
        )
        session.add(op)
        await session.flush()

        old_delivery_amt = float(delivery.amount) if delivery.amount is not None else None
        if amount_adj is not None and old_delivery_amt is not None:
            new_amt = max(0, old_delivery_amt - abs(amount_adj))
            delivery.amount = new_amt

        await session.commit()
        await session.refresh(op)

        stock_after = await get_stock_from_view(session, dt.warehouse_to, dt.product_code, dt.batch_code)
        out = success_201(
            operation_id=str(op.id),
            operation_number=op_number,
            type_code="return_from_customer",
            quantity=dt.quantity,
            related_operation_id=str(delivery.id),
            warehouse_stock_after={dt.warehouse_to: {dt.product_code: {dt.batch_code: stock_after}}},
            created_at=op.operation_date.isoformat() if op.operation_date else None,
            message="Товар успешно возвращен",
        )
        if amount_adj is not None and old_delivery_amt is not None:
            out["delivery_amount_adjusted_from"] = old_delivery_amt
            out["delivery_amount_adjusted_to"] = max(0, old_delivery_amt - abs(amount_adj))
        return out
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise error_400("DATABASE_ERROR", str(e)[:200], {})


# ─── POST /operations/cash_return (ТЗ-ALG-006) ────────────────────────────

@router.post("/operations/cash_return", status_code=201)
async def post_cash_return(
    dt: CashReturnDT,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Возврат денег клиенту (связь с return_from_customer). ТЗ-ALG-006."""
    if not await validate_customer(session, dt.customer_id):
        raise error_400("INVALID_CUSTOMER", "Клиент не найден", {"customer_id": dt.customer_id})
    if not await validate_payment_type(session, dt.payment_type_code):
        raise error_400("INVALID_PAYMENT_TYPE", "Тип оплаты не найден", {"payment_type_code": dt.payment_type_code})

    r = await session.execute(
        select(Operation).where(
            Operation.id == dt.related_return_operation_id,
            Operation.type_code == "return_from_customer",
        )
    )
    ret_op = r.scalar_one_or_none()
    if not ret_op:
        raise error_400(
            "INVALID_RELATED_OPERATION",
            "Операция возврата товара не найдена",
            {"related_operation_id": str(dt.related_return_operation_id)},
        )

    try:
        op_number = await generate_op_number(session)
        op = Operation(
            operation_number=op_number,
            type_code="cash_return",
            customer_id=dt.customer_id,
            amount=float(dt.amount),
            payment_type_code=dt.payment_type_code,
            cashier_login=dt.cashier_login,
            expeditor_login=dt.expeditor_login,
            related_operation_id=ret_op.id,
            created_by=dt.created_by,
            status="completed",
            comment=dt.comment,
        )
        session.add(op)
        await session.commit()
        await session.refresh(op)

        return success_201(
            operation_id=str(op.id),
            operation_number=op_number,
            type_code="cash_return",
            status="completed",
            amount=float(dt.amount),
            related_operation_id=str(ret_op.id),
            created_at=op.operation_date.isoformat() if op.operation_date else None,
            message="Деньги успешно возвращены клиенту",
        )
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise error_400("DATABASE_ERROR", str(e)[:200], {})
