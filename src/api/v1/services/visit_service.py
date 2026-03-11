from __future__ import annotations

from datetime import date, datetime, time

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.models import Customer, CustomerVisit


class VisitService:
    """Business logic for customer visits."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_visit(self, payload: dict, created_by: str) -> tuple[dict, dict | None]:
        customer_result = await self.db.execute(select(Customer).where(Customer.id == payload["customer_id"]))
        customer = customer_result.scalar_one_or_none()
        if not customer:
            raise HTTPException(status_code=404, detail="Клиент не найден")

        visit = CustomerVisit(
            customer_id=payload["customer_id"],
            visit_date=date.fromisoformat(str(payload["visit_date"])[:10]),
            visit_time=None,
            status=payload.get("status") or "planned",
            responsible_login=payload.get("responsible_login") or created_by,
            comment=payload.get("comment"),
            created_by=created_by,
            updated_by=created_by,
        )

        raw_time = payload.get("visit_time")
        if raw_time and str(raw_time).strip():
            parts = str(raw_time).strip()[:5].split(":")
            if len(parts) == 2:
                try:
                    visit.visit_time = time(int(parts[0]), int(parts[1]))
                except (TypeError, ValueError):
                    visit.visit_time = None

        self.db.add(visit)
        await self.db.commit()
        await self.db.refresh(visit)

        customer_name = (customer.name_client or customer.firm_name or "").strip() or f"Клиент #{customer.id}"
        notify_payload = None
        if (visit.responsible_login or created_by) != created_by:
            notify_payload = {
                "visit_id": visit.id,
                "customer_name": customer_name,
                "visit_date": visit.visit_date,
                "responsible_login": visit.responsible_login or created_by,
            }

        return ({"id": visit.id, "message": "created"}, notify_payload)

    @staticmethod
    def parse_visit_datetime(value: str) -> datetime | None:
        if not value:
            return None
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            return None
