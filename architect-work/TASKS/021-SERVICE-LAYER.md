# Task: Service Layer Extraction

**Task ID:** 021
**Category:** Architecture / Refactoring
**Priority:** MEDIUM
**Status:** COMPLETED
**Estimated Time:** 8 hours
**Dependencies:** 007 (response schemas), 015 (error handling), 014 (tests â€” needed to verify refactoring)

---

## Description

Currently, router files handle HTTP parsing, business logic, database queries, and response formatting all in one place. This violates Single Responsibility Principle and makes unit testing impossible (you can't test business logic without HTTP). Extract business logic into a service layer.

**Target domains for extraction:**
- `CustomerService` â€” customer CRUD, search, validation
- `OrderService` â€” order lifecycle, status transitions, item management
- `OperationService` â€” warehouse operations, stock management

---

## Acceptance Criteria

- [x] `src/api/v1/services/` directory created with domain service files
- [x] `CustomerService` class implemented with all customer business logic
- [x] `OrderService` class implemented with all order business logic
- [x] Router files thin: only HTTP parsing, calling service, returning response
- [x] Service methods are async and take `AsyncSession` as parameter
- [x] Services are independently unit-testable (no HTTP layer required)
- [x] All existing API behavior preserved (no functional regressions)

---

## Technical Details

### New Directory Structure

```
src/api/v1/
â”œâ”€â”€ routers/          # HTTP layer only (thin)
â”‚   â”œâ”€â”€ customers.py  # â‰¤ 100 lines each
â”‚   â”œâ”€â”€ orders.py
â”‚   â””â”€â”€ ...
â”œâ”€â”€ services/         # Business logic layer
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ customer_service.py
â”‚   â”œâ”€â”€ order_service.py
â”‚   â”œâ”€â”€ operation_service.py
â”‚   â””â”€â”€ visit_service.py
â””â”€â”€ schemas/          # Pydantic models (from Task 007)
    â”œâ”€â”€ customers.py
    â””â”€â”€ ...
```

### Example: `src/api/v1/services/customer_service.py`

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.api.v1.schemas.customers import CustomerCreate, CustomerUpdate, CustomerResponse
from src.core.exceptions import NotFoundError, ValidationError


class CustomerService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_customers(
        self,
        agent_login: str | None = None,
        search: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[CustomerResponse], int]:
        """Returns (customers, total_count)."""
        base_where = "WHERE TRUE"
        params: dict = {}

        if agent_login:
            base_where += " AND c.login_agent = :agent_login"
            params["agent_login"] = agent_login

        if search:
            base_where += " AND (c.name_client ILIKE :search OR c.firm_name ILIKE :search)"
            params["search"] = f"%{search}%"

        count_result = await self.db.execute(
            text(f'SELECT COUNT(*) FROM "Sales".customers c {base_where}').bindparams(**params)
        )
        total = count_result.scalar()

        data_result = await self.db.execute(
            text(f"""
                SELECT c.*, p.photo_path as main_photo_path
                FROM "Sales".customers c
                LEFT JOIN "Sales".customer_photo p ON p.id = c.main_photo_id
                {base_where}
                ORDER BY c.id DESC
                LIMIT :limit OFFSET :offset
            """).bindparams(**params, limit=limit, offset=offset)
        )
        rows = data_result.mappings().fetchall()
        customers = [CustomerResponse.model_validate(dict(r)) for r in rows]

        return customers, total

    async def get_customer(self, customer_id: int) -> CustomerResponse:
        result = await self.db.execute(
            text('SELECT * FROM "Sales".customers WHERE id = :id').bindparams(id=customer_id)
        )
        row = result.mappings().fetchone()
        if not row:
            raise NotFoundError("ÐšÐ»Ð¸ÐµÐ½Ñ‚", customer_id)
        return CustomerResponse.model_validate(dict(row))

    async def create_customer(
        self,
        data: CustomerCreate,
        created_by: str,
    ) -> CustomerResponse:
        # Business rule: name required
        if not data.name_client.strip():
            raise ValidationError("Ð˜Ð¼Ñ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð° Ð½Ðµ Ð¼Ð¾Ð¶ÐµÑ‚ Ð±Ñ‹Ñ‚ÑŒ Ð¿ÑƒÑÑ‚Ñ‹Ð¼", field="name_client")

        result = await self.db.execute(
            text("""
                INSERT INTO "Sales".customers
                    (name_client, firm_name, category_client, address, city_id, territory_id,
                     phone, email, latitude, longitude, login_agent, login_expeditor)
                VALUES
                    (:name_client, :firm_name, :category_client, :address, :city_id, :territory_id,
                     :phone, :email, :latitude, :longitude, :login_agent, :login_expeditor)
                RETURNING *
            """).bindparams(**data.model_dump())
        )
        row = result.mappings().fetchone()
        await self.db.commit()
        return CustomerResponse.model_validate(dict(row))

    async def update_customer(
        self,
        customer_id: int,
        data: CustomerUpdate,
    ) -> CustomerResponse:
        # Verify exists
        await self.get_customer(customer_id)

        updates = {k: v for k, v in data.model_dump().items() if v is not None}
        if not updates:
            return await self.get_customer(customer_id)

        set_clause = ", ".join(f"{k} = :{k}" for k in updates)
        result = await self.db.execute(
            text(f'UPDATE "Sales".customers SET {set_clause} WHERE id = :id RETURNING *').bindparams(
                **updates, id=customer_id
            )
        )
        row = result.mappings().fetchone()
        await self.db.commit()
        return CustomerResponse.model_validate(dict(row))

    async def delete_customer(self, customer_id: int) -> None:
        await self.get_customer(customer_id)  # Verify exists
        await self.db.execute(
            text('DELETE FROM "Sales".customers WHERE id = :id').bindparams(id=customer_id)
        )
        await self.db.commit()
```

### Thin Router After Extraction

```python
# src/api/v1/routers/customers.py â€” AFTER service extraction
from src.api.v1.services.customer_service import CustomerService
from src.core.pagination import PaginationParams, PaginatedResponse

@router.get("/customers", response_model=PaginatedResponse[CustomerResponse])
async def list_customers(
    search: str | None = None,
    agent: str | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # Agent sees only their own customers
    agent_filter = None if current_user.role == "admin" else current_user.login
    if agent and current_user.role == "admin":
        agent_filter = agent

    service = CustomerService(db)
    customers, total = await service.list_customers(
        agent_login=agent_filter,
        search=search,
        limit=pagination.limit,
        offset=pagination.offset,
    )
    return PaginatedResponse.create(data=customers, total=total, pagination=pagination)


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return await CustomerService(db).get_customer(customer_id)
```

### Unit Test for Service (No HTTP)

```python
# tests/unit/services/test_customer_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock
from src.api.v1.services.customer_service import CustomerService
from src.api.v1.schemas.customers import CustomerCreate


@pytest.mark.asyncio
async def test_create_customer_empty_name_raises():
    db = AsyncMock()
    service = CustomerService(db)
    data = CustomerCreate(name_client="  ")

    with pytest.raises(ValidationError, match="Ð˜Ð¼Ñ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð°"):
        await service.create_customer(data, created_by="agent1")
```

---

## Testing Requirements

- All existing API endpoints still return same data as before (integration tests from Task 014)
- `CustomerService.list_customers()` is unit-testable without HTTP client
- `CustomerService.create_customer()` validates business rules independently of HTTP layer
- Service layer handles 1000 concurrent requests without DB connection exhaustion

---

## Related Documentation

- [CURRENT_STATE.md â€” SOLID Violations](../CURRENT_STATE.md)
- [TECHNICAL_DESIGN.md â€” Component Structure](../TECHNICAL_DESIGN.md)
- Task 007 (Pydantic schemas), Task 015 (Error handling)

---

## Notes

- Do this domain by domain â€” start with `CustomerService` before touching orders
- Run the full test suite after each service extraction to catch regressions
- Don't refactor all routers at once â€” incremental migration reduces risk


