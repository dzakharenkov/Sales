from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.models import Customer, Item, Order, PaymentType, Product, Status, User, Warehouse


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _parse_optional_datetime(raw: str | None) -> datetime | None:
    if not raw or not raw.strip():
        return None
    value = raw.strip().replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(value)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except (TypeError, ValueError):
        return None


class OrderService:
    """Business logic for orders domain."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def is_delivery_status(self, status_code: str | None) -> bool:
        if status_code is None:
            return False
        code_str = str(status_code).strip().lower()
        st_result = await self.db.execute(select(Status).where(Status.code == status_code))
        st_row = st_result.scalar_one_or_none()
        name_lower = ((st_row.name or "") + " " + code_str).strip().lower() if st_row else code_str
        return code_str in ("2", "delivery") or any(
            marker in name_lower for marker in ("deliver", "delivery", "shipping")
        )

    async def create_order(self, payload: dict, created_by: str) -> tuple[dict, dict | None]:
        status_code = payload.get("status_code") or "open"
        scheduled_delivery_at = _parse_optional_datetime(payload.get("scheduled_delivery_at"))
        if await self.is_delivery_status(status_code) and scheduled_delivery_at is None:
            raise HTTPException(
                status_code=422,
                detail="For delivery status, scheduled_delivery_at is required.",
            )

        next_no = await self.db.execute(select(func.coalesce(func.max(Order.order_no), 0) + 1))
        order_no = next_no.scalar() or 1
        order = Order(
            order_no=order_no,
            customer_id=payload.get("customer_id"),
            status_code=status_code,
            payment_type_code=payload.get("payment_type_code"),
            created_by=created_by,
            scheduled_delivery_at=scheduled_delivery_at,
        )
        self.db.add(order)
        await self.db.commit()
        await self.db.refresh(order)

        notify_payload = None
        if order.customer_id:
            customer_result = await self.db.execute(select(Customer).where(Customer.id == order.customer_id))
            customer = customer_result.scalar_one_or_none()
            if customer and customer.login_expeditor:
                customer_name = (customer.name_client or customer.firm_name or "").strip()
                notify_payload = {
                    "order_no": order.order_no,
                    "customer_name": customer_name,
                    "total_amount": order.total_amount,
                    "scheduled_delivery_at": order.scheduled_delivery_at,
                    "expeditor_login": customer.login_expeditor,
                }

        return (
            {"id": order.order_no, "order_no": order.order_no, "status_code": order.status_code, "message": "created"},
            notify_payload,
        )

    async def get_order(self, order_id: int) -> dict:
        result = await self.db.execute(select(Order).where(Order.order_no == order_id))
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        customer_result = await self.db.execute(select(Customer).where(Customer.id == order.customer_id)) if order.customer_id else None
        customer = customer_result.scalar_one_or_none() if customer_result else None

        agent_fio = expeditor_fio = None
        if customer:
            if customer.login_agent:
                agent_user_result = await self.db.execute(select(User).where(User.login == customer.login_agent))
                agent_user = agent_user_result.scalar_one_or_none()
                agent_fio = agent_user.fio if agent_user else None
            if customer.login_expeditor:
                exp_user_result = await self.db.execute(select(User).where(User.login == customer.login_expeditor))
                exp_user = exp_user_result.scalar_one_or_none()
                expeditor_fio = exp_user.fio if exp_user else None

        warehouse_from_expeditor = None
        if customer and customer.login_expeditor:
            warehouse_result = await self.db.execute(
                select(Warehouse.code).where(Warehouse.expeditor_login == customer.login_expeditor).limit(1)
            )
            warehouse_from_expeditor = warehouse_result.scalar_one_or_none()

        status_name = None
        if order.status_code:
            status_result = await self.db.execute(select(Status.name).where(Status.code == order.status_code))
            status_name = status_result.scalar_one_or_none()

        payment_type_name = None
        if order.payment_type_code:
            payment_result = await self.db.execute(select(PaymentType.name).where(PaymentType.code == order.payment_type_code))
            payment_type_name = payment_result.scalar_one_or_none()

        items_result = await self.db.execute(
            select(Item, Product).outerjoin(Product, Product.code == Item.product_code).where(Item.order_id == order.order_no)
        )
        item_rows = items_result.all()

        return {
            "id": order.order_no,
            "order_no": order.order_no,
            "customer_id": order.customer_id,
            "customer_name": (customer.name_client or customer.firm_name or "") if customer else None,
            "order_date": order.order_date.isoformat() if order.order_date else None,
            "status_code": order.status_code,
            "status_name": status_name,
            "total_amount": float(order.total_amount) if order.total_amount else None,
            "payment_type_code": order.payment_type_code,
            "payment_type_name": payment_type_name,
            "created_by": order.created_by,
            "login_agent": customer.login_agent if customer else None,
            "login_expeditor": customer.login_expeditor if customer else None,
            "warehouse_from_expeditor": warehouse_from_expeditor,
            "agent_fio": agent_fio,
            "expeditor_fio": expeditor_fio,
            "scheduled_delivery_at": order.scheduled_delivery_at.isoformat() if order.scheduled_delivery_at else None,
            "status_delivery_at": order.status_delivery_at.isoformat() if order.status_delivery_at else None,
            "closed_at": order.closed_at.isoformat() if order.closed_at else None,
            "last_updated_at": order.last_updated_at.isoformat() if order.last_updated_at else None,
            "last_updated_by": order.last_updated_by,
            "items": [
                {
                    "id": str(item.id),
                    "product_code": item.product_code,
                    "product_name": product.name if product else None,
                    "quantity": item.quantity,
                    "price": float(item.price) if item.price else None,
                }
                for item, product in item_rows
            ],
        }

    async def update_order(self, order_id: int, payload: dict, updated_by: str) -> tuple[dict, dict | None]:
        result = await self.db.execute(select(Order).where(Order.order_no == order_id))
        order = result.scalar_one_or_none()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        old_status_code = order.status_code

        status_code = payload.get("status_code") if "status_code" in payload else order.status_code
        parsed_scheduled = _parse_optional_datetime(payload.get("scheduled_delivery_at")) if "scheduled_delivery_at" in payload else None
        target_scheduled = parsed_scheduled if "scheduled_delivery_at" in payload else order.scheduled_delivery_at
        if await self.is_delivery_status(status_code) and target_scheduled is None:
            raise HTTPException(
                status_code=422,
                detail="For delivery status, scheduled_delivery_at is required.",
            )

        now = _now_utc()
        if "customer_id" in payload:
            order.customer_id = payload.get("customer_id")
        if "status_code" in payload:
            order.status_code = payload.get("status_code")
            status_result = await self.db.execute(select(Status).where(Status.code == payload.get("status_code")))
            status_obj = status_result.scalar_one_or_none()
            code_str = str(payload.get("status_code") or "").strip().lower()
            name_lower = ((status_obj.name or "") + " " + code_str).strip().lower() if status_obj else code_str
            is_delivery_status = code_str in ("2", "delivery") or any(
                marker in name_lower for marker in ("deliver", "delivery", "shipping")
            )
            if order.status_delivery_at is None and is_delivery_status:
                order.status_delivery_at = now
            if order.closed_at is None and any(
                marker in name_lower
                for marker in ("cancel", "closed", "delivered", "dismiss")
            ):
                order.closed_at = now
        if "total_amount" in payload:
            order.total_amount = payload.get("total_amount")
        if "payment_type_code" in payload:
            order.payment_type_code = payload.get("payment_type_code")
        if "scheduled_delivery_at" in payload:
            order.scheduled_delivery_at = parsed_scheduled

        order.last_updated_at = now
        order.last_updated_by = updated_by
        await self.db.commit()
        await self.db.refresh(order)

        notify_payload = None
        new_status = payload.get("status_code")
        status_changed = new_status is not None and new_status != old_status_code
        if status_changed:
            customer_name = ""
            agent_login = order.created_by
            if order.customer_id:
                customer_result = await self.db.execute(select(Customer).where(Customer.id == order.customer_id))
                customer = customer_result.scalar_one_or_none()
                if customer:
                    customer_name = (customer.name_client or customer.firm_name or "").strip()
                    if customer.login_agent:
                        agent_login = customer.login_agent
            notify_payload = {
                "order_no": order.order_no,
                "customer_name": customer_name,
                "total_amount": order.total_amount,
                "agent_login": agent_login,
                "new_status": order.status_code or "",
            }

        return ({"id": order.order_no, "message": "updated"}, notify_payload)
