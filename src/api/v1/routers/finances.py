"""
GET /finances/ledger — финансовый реестр из VIEW v_financial_ledger (ТЗ).
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.core.deps import get_current_user
from src.database.models import User

router = APIRouter()


@router.get("/ledger")
async def get_financial_ledger(
    date_from: str | None = Query(None, description="Дата с (YYYY-MM-DD)"),
    date_to: str | None = Query(None, description="Дата по (YYYY-MM-DD)"),
    customer_id: int | None = Query(None, description="ID клиента"),
    movement_type: str | None = Query(None, description="Тип движения: ПРИХОД, РАСХОД, К ПОЛУЧЕНИЮ"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Финансовый реестр из VIEW v_financial_ledger."""
    try:
        q = 'SELECT * FROM "Sales".v_financial_ledger WHERE 1=1'
        params = {}
        if date_from:
            q += ' AND DATE(operation_date) >= :date_from'
            params["date_from"] = date_from
        if date_to:
            q += ' AND DATE(operation_date) <= :date_to'
            params["date_to"] = date_to
        if customer_id is not None:
            q += ' AND customer_id = :customer_id'
            params["customer_id"] = customer_id
        if movement_type:
            q += ' AND movement_type = :movement_type'
            params["movement_type"] = movement_type
        q += ' ORDER BY operation_date DESC'

        r = await session.execute(text(q), params)
        rows = r.fetchall()
        cols = [c for c in r.keys()]
        data = [dict(zip(cols, row)) for row in rows]
        for d in data:
            for k, v in list(d.items()):
                if hasattr(v, "isoformat"):
                    d[k] = v.isoformat()
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)[:200], "data": []}
