# Task: Pydantic Response Schemas for All API Endpoints

**Task ID:** 007
**Category:** Architecture
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 6 hours
**Dependencies:** 001, 003

---

## Description

Currently, API endpoints return raw database row dicts without type validation or documentation. This means:
- OpenAPI docs show `{}` as response type
- Internal DB fields may be exposed unintentionally
- No guarantee of response structure consistency
- Type errors can reach the client without detection

This task adds Pydantic response schemas (`response_model=`) to all endpoints.

---

## Acceptance Criteria

- [x] Every `GET` endpoint has a `response_model=` parameter
- [x] Every `POST` endpoint has a `response_model=` parameter
- [x] Response schemas exclude sensitive fields (password hashes, internal tokens)
- [x] List endpoints return `list[SchemaType]`
- [x] A `schemas/` directory created in `src/api/v1/` with one file per domain
- [x] OpenAPI docs (`/docs`) shows correct response structure for all endpoints
- [x] No `dict` return types remain â€” always return Pydantic model instances or SQLAlchemy ORM rows that FastAPI can serialize

---

## Technical Details

### Create `src/api/v1/schemas/` directory structure:

```
src/api/v1/schemas/
â”œâ”€â”€ __init__.py
â”œâ”€â”€ auth.py        # LoginRequest, LoginResponse, UserInfo
â”œâ”€â”€ users.py       # UserCreate, UserUpdate, UserResponse
â”œâ”€â”€ customers.py   # CustomerCreate, CustomerUpdate, CustomerResponse
â”œâ”€â”€ orders.py      # OrderCreate, OrderUpdate, OrderResponse, ItemResponse
â”œâ”€â”€ visits.py      # VisitCreate, VisitUpdate, VisitResponse
â”œâ”€â”€ operations.py  # OperationCreate, OperationResponse
â”œâ”€â”€ stock.py       # StockItem
â”œâ”€â”€ warehouse.py   # WarehouseCreate, WarehouseResponse
â”œâ”€â”€ dictionary.py  # ProductResponse, ProductTypeResponse, PaymentTypeResponse
â”œâ”€â”€ reports.py     # DashboardMetrics, AgentReport, etc.
â””â”€â”€ common.py      # Pagination, ErrorResponse, SuccessResponse
```

### Example: `src/api/v1/schemas/customers.py`

```python
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CustomerBase(BaseModel):
    name_client: str = Field(..., min_length=1, max_length=255)
    firm_name: Optional[str] = None
    category_client: Optional[str] = None
    address: Optional[str] = None
    city_id: Optional[int] = None
    territory_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    login_agent: Optional[str] = None
    login_expeditor: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    """All fields optional for partial update."""
    name_client: Optional[str] = None
    firm_name: Optional[str] = None
    # ... all fields optional


class CustomerResponse(CustomerBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    main_photo_id: Optional[int] = None

    model_config = {"from_attributes": True}  # Pydantic v2 ORM mode


class CustomerListResponse(BaseModel):
    data: list[CustomerResponse]
    total: int
```

### Example: `src/api/v1/schemas/auth.py`

```python
class LoginRequest(BaseModel):
    login: str
    password: str


class UserInfo(BaseModel):
    login: str
    fio: str
    role: str
    phone: Optional[str] = None
    email: Optional[str] = None
    status: str
    telegram_username: Optional[str] = None

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfo
```

### Common Schemas (`src/api/v1/schemas/common.py`)

```python
class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


class SuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None


class PaginatedResponse(BaseModel):
    data: list
    total: int
    limit: int
    offset: int
```

### Update Routers to Use Response Models

```python
# BEFORE:
@router.get("/customers")
async def get_customers(...):
    result = await db.execute(query)
    return result.fetchall()  # Returns dict-like rows

# AFTER:
from src.api.v1.schemas.customers import CustomerResponse

@router.get("/customers", response_model=list[CustomerResponse])
async def get_customers(...) -> list[CustomerResponse]:
    result = await db.execute(query)
    rows = result.mappings().fetchall()
    return [CustomerResponse.model_validate(dict(row)) for row in rows]
```

---

## Testing Requirements

- Hit `GET /api/v1/customers` â€” response must match `CustomerResponse` schema exactly
- Verify `/docs` shows correct response schemas for all endpoints
- Verify password/token fields never appear in responses
- Create a customer with extra fields â€” verify extra fields are stripped from response
- Test with `response_model_exclude_unset=True` for PATCH endpoints

---

## Related Documentation

- [TECHNICAL_DESIGN.md â€” API Design](../TECHNICAL_DESIGN.md)
- [CURRENT_STATE.md â€” Technical Debt](../CURRENT_STATE.md)

---

## Notes

- Pydantic v2 uses `model_config = {"from_attributes": True}` instead of `class Config: orm_mode = True`
- Use `model_validate(dict(row))` for SQLAlchemy Row objects, not `from_orm()`
- Consider `response_model_by_alias=True` if you want camelCase in API responses

