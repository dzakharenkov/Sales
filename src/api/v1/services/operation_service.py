from __future__ import annotations

from datetime import date

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.pagination import PaginationParams
from src.database.models import Customer, Operation


class OperationService:
    """Business logic for warehouse operations domain."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_operations(
        self,
        pagination: PaginationParams,
        *,
        type_code: str | None = None,
        customer_id: int | None = None,
        product_code: str | None = None,
        status: str | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
        created_by: str | None = None,
    ) -> tuple[list[dict], int]:
        query = select(Operation).order_by(Operation.operation_date.desc().nulls_last(), Operation.created_at.desc().nulls_last())
        if type_code and type_code.strip():
            query = query.where(Operation.type_code == type_code.strip())
        if customer_id is not None:
            query = query.where(Operation.customer_id == customer_id)
        if product_code and product_code.strip():
            query = query.where(Operation.product_code == product_code.strip())
        if status and status.strip():
            query = query.where(Operation.status == status.strip())
        if from_date:
            query = query.where(func.date(Operation.operation_date) >= from_date)
        if to_date:
            query = query.where(func.date(Operation.operation_date) <= to_date)
        if created_by and created_by.strip():
            query = query.where(Operation.created_by == created_by.strip())

        count_q = query.with_only_columns(func.count()).order_by(None)
        total = int((await self.db.execute(count_q)).scalar() or 0)
        result = await self.db.execute(query.offset(pagination.offset).limit(pagination.limit))
        rows = result.scalars().all()

        type_codes = {row.type_code for row in rows if row.type_code}
        type_names: dict[str, str] = {}
        if type_codes:
            type_result = await self.db.execute(text('SELECT code, name FROM "Sales".operation_types'))
            for code, name in type_result.fetchall():
                if code in type_codes:
                    type_names[code] = name or code

        customer_ids = {row.customer_id for row in rows if row.customer_id is not None}
        customer_names: dict[int, str] = {}
        if customer_ids:
            customer_result = await self.db.execute(
                select(Customer.id, Customer.name_client, Customer.firm_name).where(Customer.id.in_(customer_ids))
            )
            for cid, name_client, firm_name in customer_result.all():
                customer_names[cid] = (name_client or firm_name or "")

        status_ru = {
            "pending": "В ожидании",
            "completed": "Выполнено",
            "cancelled": "Отменено",
            "canceled": "Отменено",
        }

        data = []
        for operation in rows:
            st = (operation.status or "").strip().lower()
            data.append(
                {
                    "id": str(operation.id),
                    "operation_number": operation.operation_number,
                    "operation_date": operation.operation_date.isoformat() if operation.operation_date else None,
                    "type_code": operation.type_code,
                    "type_name": type_names.get(operation.type_code) if operation.type_code else None,
                    "status": operation.status,
                    "status_name_ru": status_ru.get(st, operation.status or ""),
                    "warehouse_from": operation.warehouse_from,
                    "warehouse_to": operation.warehouse_to,
                    "customer_id": operation.customer_id,
                    "customer_name": customer_names.get(operation.customer_id) if operation.customer_id is not None else None,
                    "product_code": operation.product_code,
                    "quantity": operation.quantity,
                    "amount": float(operation.amount) if operation.amount else None,
                    "comment": operation.comment,
                    "order_id": operation.order_id,
                    "created_by": operation.created_by,
                    "related_operation_id": str(operation.related_operation_id) if operation.related_operation_id else None,
                }
            )

        return data, total
