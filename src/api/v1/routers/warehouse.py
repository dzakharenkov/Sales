"""
GET /warehouse/stock — остатки по VIEW v_warehouse_stock (ТЗ) + статусы по сроку годности.
"""
from datetime import date, datetime, timezone
import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.core.deps import get_current_user
from src.database.models import User, Batch, Product

router = APIRouter()


async def _fetch_stock_with_expiry(
    session: AsyncSession,
    warehouse: str | None,
    product: str | None,
    batch_code: str | None,
):
    """Вспомогательная функция: остатки из VIEW + expiry_date, days_until_expiry, expiry_status."""
    # Основной запрос по VIEW v_warehouse_stock
    q = '''
        SELECT warehouse_code, warehouse_name, product_code, product_name,
               batch_id, batch_code, total_qty
        FROM "Sales".v_warehouse_stock
        WHERE total_qty > 0
    '''
    params: dict = {}
    if warehouse:
        q += ' AND warehouse_code = :warehouse'
        params["warehouse"] = warehouse
    if product:
        q += ' AND product_code = :product'
        params["product"] = product
    if batch_code:
        q += ' AND batch_code = :batch_code'
        params["batch_code"] = batch_code
    q += ' ORDER BY warehouse_code, product_code, batch_code'

    r = await session.execute(text(q), params)
    rows = r.fetchall()
    columns = [
        "warehouse_code",
        "warehouse_name",
        "product_code",
        "product_name",
        "batch_id",
        "batch_code",
        "total_qty",
    ]
    data = [dict(zip(columns, row)) for row in rows]

    # Подтягиваем цену товара из таблицы Product
    product_codes = {d["product_code"] for d in data if d.get("product_code")}
    prices_map: dict[str, float] = {}
    if product_codes:
        price_result = await session.execute(
            select(Product.code, Product.price).where(Product.code.in_(product_codes))
        )
        for code, price in price_result.fetchall():
            prices_map[code] = float(price) if price is not None else 0.0

    # Собираем batch_id для одного запроса в batches
    batch_ids = {d["batch_id"] for d in data if d.get("batch_id") is not None}
    batches_map: dict = {}
    if batch_ids:
        batch_result = await session.execute(
            select(Batch.id, Batch.expiry_date).where(Batch.id.in_(batch_ids))
        )
        for bid, expiry_date in batch_result.fetchall():
            batches_map[bid] = expiry_date

    # Загружаем правила светофора
    rules_result = await session.execute(
        text(
            '''
            SELECT name, color, min_days, max_days, alert_level, description
            FROM "Sales".expiry_date_config
            WHERE is_active = TRUE
            ORDER BY sort_order, min_days
            '''
        )
    )
    rules = [
        {
            "name": row[0],
            "color": row[1],
            "min_days": row[2],
            "max_days": row[3],
            "alert_level": row[4],
            "description": row[5],
        }
        for row in rules_result.fetchall()
    ]
    icon_map = {"GREEN": "🟢", "YELLOW": "🟡", "RED": "🔴", "BLACK": "⚫"}

    today = date.today()

    def pick_rule(days_left: int):
        for r in rules:
            if r["min_days"] <= days_left <= r["max_days"]:
                return r
        return None

    for d in data:
        bid = d.get("batch_id")
        expiry_date = batches_map.get(bid)
        if expiry_date is not None:
            d["expiry_date"] = expiry_date.isoformat()
            days_left = (expiry_date - today).days
            d["days_until_expiry"] = days_left
            rule = pick_rule(days_left)
            if rule:
                status = {
                    "name": rule["name"],
                    "color": rule["color"],
                    "alert_level": rule["alert_level"],
                    "description": rule["description"],
                    "days": days_left,
                    "icon": icon_map.get(rule["color"]),
                }
                d["expiry_status"] = status
            else:
                d["expiry_status"] = None
        else:
            d["expiry_date"] = None
            d["days_until_expiry"] = None
            d["expiry_status"] = None

        if d.get("batch_id"):
            d["batch_id"] = str(d["batch_id"])

        # Цена за единицу и общая стоимость
        price = prices_map.get(d.get("product_code"), 0.0)
        qty = d.get("total_qty") or 0
        d["unit_price"] = price
        d["total_cost"] = price * qty

    return data


@router.get("/stock")
async def get_warehouse_stock(
    warehouse: str | None = Query(None, description="Код склада (например w_main)"),
    product: str | None = Query(None, description="Код товара"),
    batch_code: str | None = Query(None, description="Код партии"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Остатки на складах из VIEW v_warehouse_stock с информацией по срокам годности."""
    try:
        data = await _fetch_stock_with_expiry(session, warehouse, product, batch_code)
        # Сортируем по количеству дней до истечения (по возрастанию), NULL в конец
        data.sort(
            key=lambda x: (
                x["days_until_expiry"]
                if x.get("days_until_expiry") is not None
                else 10**9
            )
        )
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)[:200], "data": []}


@router.get("/stock/export")
async def export_warehouse_stock_excel(
    warehouse: str | None = Query(None, description="Код склада (например w_main)"),
    product: str | None = Query(None, description="Код товара"),
    batch_code: str | None = Query(None, description="Код партии"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Выгрузка остатков по складу в Excel (с учётом сроков годности)."""
    data = await _fetch_stock_with_expiry(session, warehouse, product, batch_code)

    wb = Workbook()
    ws = wb.active
    ws.title = "Остатки"

    headers = [
        "Склад",
        "Товар (код)",
        "Товар (название)",
        "Партия (код)",
        "Количество",
        "Цена за 1 шт",
        "Сумма",
        "Срок годности",
        "Дней осталось",
        "Статус",
    ]
    ws.append(headers)

    for row in data:
        status = row.get("expiry_status") or {}
        ws.append(
            [
                row.get("warehouse_name") or row.get("warehouse_code") or "",
                row.get("product_code") or "",
                row.get("product_name") or "",
                row.get("batch_code") or "",
                row.get("total_qty") or 0,
                row.get("unit_price") or 0,
                row.get("total_cost") or 0,
                row.get("expiry_date") or "",
                row.get("days_until_expiry")
                if row.get("days_until_expiry") is not None
                else "",
                status.get("name") or status.get("color") or "",
            ]
        )

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)

    filename = f"warehouse_stock_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        stream,
        media_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
