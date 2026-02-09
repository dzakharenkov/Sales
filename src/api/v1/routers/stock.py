"""
Остатки по складам (warehouse_stock). Таблица создаётся миграцией 002.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import WarehouseStock, Product
from src.core.deps import get_current_user
from src.database.models import User

router = APIRouter()


@router.get("/stock")
async def get_stock(
    warehouse_code: str = Query(..., description="Код склада (например w_main)"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Остатки товаров по складу. Требуется таблица Sales.warehouse_stock (миграция 002)."""
    try:
        q = (
            select(WarehouseStock.product_code, WarehouseStock.quantity, Product.name)
            .join(Product, Product.code == WarehouseStock.product_code)
            .where(WarehouseStock.warehouse_code == warehouse_code)
            .where(WarehouseStock.quantity > 0)
        )
        result = await session.execute(q)
        rows = result.all()
        return [
            {"product_code": r.product_code, "name": r.name, "quantity": r.quantity}
            for r in rows
        ]
    except Exception:
        return []
