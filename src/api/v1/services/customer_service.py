from __future__ import annotations

from datetime import date, time

from fastapi import HTTPException
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import ForbiddenError, NotFoundError
from src.core.pagination import PaginationParams
from src.core.sql import escape_like
from src.database.models import Customer, CustomerVisit, User


class CustomerService:
    """Business logic for customers domain."""

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def customer_to_dict(customer: Customer) -> dict:
        return {
            "id": customer.id,
            "name_client": customer.name_client,
            "firm_name": customer.firm_name,
            "category_client": customer.category_client,
            "address": customer.address,
            "city_id": customer.city_id,
            "city": getattr(customer, "city_name", None),
            "territory_id": customer.territory_id,
            "territory": getattr(customer, "territory_name", None),
            "landmark": customer.landmark,
            "phone": customer.phone,
            "contact_person": customer.contact_person,
            "tax_id": customer.tax_id,
            "status": customer.status,
            "login_agent": customer.login_agent,
            "login_expeditor": customer.login_expeditor,
            "latitude": float(customer.latitude) if customer.latitude is not None else None,
            "longitude": float(customer.longitude) if customer.longitude is not None else None,
            "PINFL": customer.PINFL,
            "contract_no": customer.contract_no,
            "account_no": customer.account_no,
            "bank": customer.bank,
            "MFO": customer.MFO,
            "OKED": customer.OKED,
            "VAT_code": customer.VAT_code,
        }

    async def list_customers(
        self,
        pagination: PaginationParams,
        *,
        customer_id: int | None = None,
        search: str | None = None,
        name_client: str | None = None,
        firm_name: str | None = None,
        city: str | None = None,
        login_agent: str | None = None,
        login_expeditor: str | None = None,
        phone: str | None = None,
        tax_id: str | None = None,
    ) -> tuple[list[dict], int]:
        base_from_sql = '''
            FROM "Sales".customers c
            LEFT JOIN "Sales".cities ct ON c.city_id = ct.id
            LEFT JOIN "Sales".territories t ON c.territory_id = t.id
        '''
        conditions: list[str] = []
        params: dict[str, object] = {}

        if customer_id is not None:
            conditions.append("c.id = :customer_id")
            params["customer_id"] = customer_id
        if search and search.strip():
            conditions.append(
                "(name_client ILIKE :search ESCAPE '\\' OR tax_id ILIKE :search ESCAPE '\\' OR account_no ILIKE :search ESCAPE '\\')"
            )
            params["search"] = "%" + escape_like(search.strip()) + "%"
        if name_client and name_client.strip():
            conditions.append(" name_client ILIKE :name_client ESCAPE '\\' ")
            params["name_client"] = "%" + escape_like(name_client.strip()) + "%"
        if firm_name and firm_name.strip():
            conditions.append(" firm_name ILIKE :firm_name ESCAPE '\\' ")
            params["firm_name"] = "%" + escape_like(firm_name.strip()) + "%"
        if city and city.strip():
            conditions.append(" ct.name ILIKE :city ESCAPE '\\' ")
            params["city"] = "%" + escape_like(city.strip()) + "%"
        if login_agent and login_agent.strip():
            conditions.append(" login_agent = :login_agent ")
            params["login_agent"] = login_agent.strip()
        if login_expeditor and login_expeditor.strip():
            conditions.append(" login_expeditor = :login_expeditor ")
            params["login_expeditor"] = login_expeditor.strip()
        if phone and phone.strip():
            conditions.append(" phone ILIKE :phone ESCAPE '\\' ")
            params["phone"] = "%" + escape_like(phone.strip()) + "%"
        if tax_id and tax_id.strip():
            conditions.append(" tax_id ILIKE :tax_id ESCAPE '\\' ")
            params["tax_id"] = "%" + escape_like(tax_id.strip()) + "%"

        where_sql = (" WHERE " + " AND ".join(conditions)) if conditions else ""

        count_sql = f"SELECT COUNT(*) {base_from_sql} {where_sql}"
        total = int((await self.db.execute(text(count_sql), params)).scalar() or 0)

        sql = f'''SELECT c.id, c.name_client, c.firm_name, c.category_client, c.address,
                 c.city_id, ct.name AS city_name,
                 c.territory_id, t.name AS territory_name,
                 c.landmark, c.phone, c.contact_person, c.tax_id, c.status, c.login_agent, c.login_expeditor, c.latitude, c.longitude, c.pinfl, c.contract_no, c.account_no, c.bank, c.mfo, c.oked, c.vat_code,
                 EXISTS (SELECT 1 FROM "Sales".customer_photo cp WHERE cp.customer_id = c.id) AS has_photo
                 {base_from_sql}
                 {where_sql}
                 ORDER BY c.id LIMIT :lim OFFSET :off'''  # nosec B608
        params["lim"] = pagination.limit
        params["off"] = pagination.offset
        result = await self.db.execute(text(sql), params)
        rows = result.fetchall()

        data: list[dict] = []
        for row in rows:
            data.append(
                {
                    "id": row[0],
                    "name_client": row[1],
                    "firm_name": row[2],
                    "category_client": row[3],
                    "address": row[4],
                    "city_id": row[5],
                    "city": row[6],
                    "territory_id": row[7],
                    "territory": row[8],
                    "landmark": row[9],
                    "phone": row[10],
                    "contact_person": row[11],
                    "tax_id": row[12],
                    "status": row[13],
                    "login_agent": row[14],
                    "login_expeditor": row[15],
                    "latitude": float(row[16]) if row[16] is not None else None,
                    "longitude": float(row[17]) if row[17] is not None else None,
                    "PINFL": row[18],
                    "contract_no": row[19],
                    "account_no": row[20],
                    "bank": row[21],
                    "MFO": row[22],
                    "OKED": row[23],
                    "VAT_code": row[24],
                    "has_photo": bool(row[25]) if len(row) > 25 else False,
                }
            )
        return data, total

    async def get_customer(self, customer_id: int) -> Customer:
        result = await self.db.execute(select(Customer).where(Customer.id == customer_id))
        customer = result.scalar_one_or_none()
        if customer is None:
            raise NotFoundError("Клиент", customer_id)
        return customer

    async def get_customer_dict(self, customer_id: int) -> dict:
        customer = await self.get_customer(customer_id)
        return self.customer_to_dict(customer)

    async def validate_city_territory_refs(self, city_id: int | None, territory_id: int | None) -> None:
        if city_id is not None:
            city_result = await self.db.execute(
                text('SELECT id FROM "Sales".cities WHERE id = :id AND COALESCE(is_active, TRUE) = TRUE'),
                {"id": city_id},
            )
            if city_result.first() is None:
                raise HTTPException(status_code=400, detail="city_id is invalid")

        if territory_id is not None:
            territory_result = await self.db.execute(
                text(
                    '''
                    SELECT id
                    FROM "Sales".territories
                    WHERE id = :id AND COALESCE(is_active, TRUE) = TRUE
                    '''
                ),
                {"id": territory_id},
            )
            territory_row = territory_result.first()
            if territory_row is None:
                raise HTTPException(status_code=400, detail="territory_id is invalid")

    @staticmethod
    def _is_blank(value: object | None) -> bool:
        return value is None or (isinstance(value, str) and not value.strip())

    async def _validate_create_required_fields(self, payload: dict) -> None:
        if self._is_blank(payload.get("name_client")):
            raise HTTPException(status_code=400, detail="Поле «Название клиента» обязательно.")
        if payload.get("city_id") is None:
            raise HTTPException(status_code=400, detail="Поле «Город» обязательно.")
        if payload.get("territory_id") is None:
            raise HTTPException(status_code=400, detail="Поле «Территория» обязательно.")
        if self._is_blank(payload.get("login_agent")):
            raise HTTPException(status_code=400, detail="Поле «login агента» обязательно.")

    async def _validate_login_agent(self, login_agent: str) -> None:
        result = await self.db.execute(select(User).where(User.login == login_agent))
        agent = result.scalar_one_or_none()
        if agent is None:
            raise HTTPException(status_code=400, detail="Указанный login агента не найден.")
        if (agent.role or "").strip().lower() != "agent":
            raise HTTPException(status_code=400, detail="Указанный login не относится к роли agent.")

    async def create_customer(self, payload: dict, user_role: str | None) -> dict:
        role = (user_role or "").strip().lower()
        if role not in {"admin", "agent"}:
            raise ForbiddenError("Только admin или agent может создавать клиентов")

        await self._validate_create_required_fields(payload)
        await self.validate_city_territory_refs(payload.get("city_id"), payload.get("territory_id"))
        await self._validate_login_agent(str(payload.get("login_agent")))

        customer = Customer(
            name_client=payload.get("name_client"),
            firm_name=payload.get("firm_name"),
            category_client=payload.get("category_client"),
            address=payload.get("address"),
            city_id=payload.get("city_id"),
            territory_id=payload.get("territory_id"),
            landmark=payload.get("landmark"),
            phone=payload.get("phone"),
            contact_person=payload.get("contact_person"),
            tax_id=payload.get("tax_id"),
            status=payload.get("status") or "активен",
            login_agent=payload.get("login_agent"),
            login_expeditor=payload.get("login_expeditor"),
            latitude=payload.get("latitude"),
            longitude=payload.get("longitude"),
            PINFL=payload.get("PINFL"),
            contract_no=payload.get("contract_no"),
            account_no=payload.get("account_no"),
            bank=payload.get("bank"),
            MFO=payload.get("MFO"),
            OKED=payload.get("OKED"),
            VAT_code=payload.get("VAT_code"),
        )
        self.db.add(customer)
        await self.db.commit()
        await self.db.refresh(customer)
        return self.customer_to_dict(customer)

    async def list_customer_visits(self, customer_id: int, limit: int) -> list[dict]:
        await self.get_customer(customer_id)
        result = await self.db.execute(
            select(CustomerVisit, User.fio)
            .outerjoin(User, CustomerVisit.responsible_login == User.login)
            .where(CustomerVisit.customer_id == customer_id)
            .order_by(CustomerVisit.visit_date.desc(), CustomerVisit.visit_time.desc().nullslast())
            .limit(limit)
        )
        rows = result.all()
        return [
            {
                "id": v.id,
                "visit_date": v.visit_date.isoformat() if v.visit_date else None,
                "visit_time": v.visit_time.strftime("%H:%M") if v.visit_time else None,
                "status": v.status,
                "responsible_login": v.responsible_login,
                "responsible_name": resp_fio or v.responsible_login or "",
                "comment": v.comment,
            }
            for v, resp_fio in rows
        ]

    async def create_customer_visit(self, customer_id: int, payload: dict, created_by: str) -> dict:
        await self.get_customer(customer_id)
        try:
            visit_date = date.fromisoformat((payload.get("visit_date") or "")[:10])
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Некорректный формат даты")

        visit_time = None
        raw_time = payload.get("visit_time")
        if raw_time and str(raw_time).strip():
            parts = str(raw_time).strip()[:8].split(":")
            if len(parts) >= 2:
                try:
                    hour = int(parts[0])
                    minute = int(parts[1])
                    second = int(parts[2]) if len(parts) > 2 else 0
                    visit_time = time(hour, minute, second)
                except (ValueError, TypeError, IndexError):
                    visit_time = None

        visit = CustomerVisit(
            customer_id=customer_id,
            visit_date=visit_date,
            visit_time=visit_time,
            status=payload.get("status") or "planned",
            responsible_login=payload.get("responsible_login") or None,
            comment=payload.get("comment") or None,
            created_by=created_by,
        )
        self.db.add(visit)
        await self.db.commit()
        await self.db.refresh(visit)
        return {
            "id": visit.id,
            "visit_date": payload.get("visit_date"),
            "status": visit.status,
            "message": "created",
        }

    async def get_customer_balance(self, customer_id: int) -> dict:
        await self.get_customer(customer_id)
        result = await self.db.execute(
            text(
                '''
                SELECT COALESCE(SUM(amount), 0) FROM "Sales".operations
                WHERE customer_id = :cid AND type_code = 'delivery' AND status = 'pending'
                '''
            ),
            {"cid": customer_id},
        )
        row = result.fetchone()
        balance = float(row[0]) if row and row[0] is not None else 0
        return {"success": True, "customer_id": customer_id, "balance": balance, "currency": "???"}

    async def update_customer(self, customer_id: int, payload: dict, user_role: str | None, user_login: str | None) -> dict:
        customer = await self.get_customer(customer_id)
        updates = dict(payload)
        role = (user_role or "").lower()

        if role != "admin":
            if role != "agent":
                raise ForbiddenError("Редактирование клиентов доступно только администратору или агенту")
            is_own_client = (
                customer.login_agent is not None
                and str(customer.login_agent).strip().lower() == str(user_login or "").strip().lower()
            )
            if not is_own_client:
                raise ForbiddenError("Агент может редактировать только своих клиентов")

        for key, value in updates.items():
            if hasattr(customer, key):
                setattr(customer, key, value)

        if "city_id" in updates or "territory_id" in updates:
            await self.validate_city_territory_refs(
                updates.get("city_id", customer.city_id),
                updates.get("territory_id", customer.territory_id),
            )

        await self.db.commit()
        await self.db.refresh(customer)
        return self.customer_to_dict(customer)

    async def delete_customer(self, customer_id: int) -> dict:
        await self.get_customer(customer_id)  # raise 404 if not found

        # 1. Break circular FK: customers.main_photo_id -> customer_photo.id
        await self.db.execute(
            text('UPDATE "Sales".customers SET main_photo_id = NULL WHERE id = :id'),
            {"id": customer_id},
        )
        # 2. Nullify orders.customer_id (no CASCADE on this FK)
        await self.db.execute(
            text('UPDATE "Sales".orders SET customer_id = NULL WHERE customer_id = :id'),
            {"id": customer_id},
        )
        # 3. Nullify operations.customer_id (no CASCADE on this FK)
        await self.db.execute(
            text('UPDATE "Sales".operations SET customer_id = NULL WHERE customer_id = :id'),
            {"id": customer_id},
        )
        # 4. Delete customer; CASCADE handles customers_visits and customer_photo
        await self.db.execute(
            text('DELETE FROM "Sales".customers WHERE id = :id'),
            {"id": customer_id},
        )
        await self.db.commit()
        return {"id": customer_id, "message": "deleted"}
