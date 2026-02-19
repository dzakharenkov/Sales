# Task: API Pagination for List Endpoints

**Task ID:** 008
**Category:** Architecture
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 4 hours
**Dependencies:** 007 (response schemas)

---

## Description

All list endpoints (`GET /customers`, `GET /orders`, `GET /visits`, `GET /operations`) return unbounded result sets. With thousands of records, this causes slow responses and memory pressure. Standard pagination with `limit`/`offset` and total count must be added.

---

## Acceptance Criteria

- [x] All list endpoints accept `limit` (default 50, max 200) and `offset` (default 0) query params
- [x] All list endpoints return `{"data": [...], "total": N, "limit": 50, "offset": 0}` envelope
- [x] `total` count is always accurate (uses COUNT query, not len(results))
- [x] Frontend `app.js` updated to use paginated responses (display page info, prev/next buttons)
- [x] OpenAPI docs show pagination parameters for all list endpoints

---

## Technical Details

### Pagination Dependency

```python
# src/core/pagination.py
from fastapi import Query
from pydantic import BaseModel
from typing import TypeVar, Generic

T = TypeVar("T")

class PaginationParams:
    def __init__(
        self,
        limit: int = Query(default=50, ge=1, le=200, description="Results per page"),
        offset: int = Query(default=0, ge=0, description="Number of records to skip"),
    ):
        self.limit = limit
        self.offset = offset


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    total: int
    limit: int
    offset: int
    has_more: bool

    @classmethod
    def create(cls, data: list, total: int, pagination: PaginationParams):
        return cls(
            data=data,
            total=total,
            limit=pagination.limit,
            offset=pagination.offset,
            has_more=(pagination.offset + pagination.limit) < total,
        )
```

### Updated Router Pattern

```python
# BEFORE:
@router.get("/customers")
async def get_customers(search: str = None, db = Depends(get_db)):
    query = text("SELECT * FROM Sales.customers WHERE ...")
    result = await db.execute(query)
    return result.fetchall()

# AFTER:
from src.core.pagination import PaginationParams, PaginatedResponse
from src.api.v1.schemas.customers import CustomerResponse

@router.get("/customers", response_model=PaginatedResponse[CustomerResponse])
async def get_customers(
    search: Optional[str] = None,
    pagination: PaginationParams = Depends(),
    db = Depends(get_db),
):
    # Count query (same WHERE as main query, without LIMIT/OFFSET)
    count_query = text("""
        SELECT COUNT(*) FROM "Sales".customers
        WHERE (:search IS NULL OR name_client ILIKE :search_pattern
               OR firm_name ILIKE :search_pattern)
    """).bindparams(search=search, search_pattern=f"%{search}%" if search else None)

    total = (await db.execute(count_query)).scalar()

    # Main query with pagination
    data_query = text("""
        SELECT * FROM "Sales".customers
        WHERE (:search IS NULL OR name_client ILIKE :search_pattern
               OR firm_name ILIKE :search_pattern)
        ORDER BY id DESC
        LIMIT :limit OFFSET :offset
    """).bindparams(
        search=search,
        search_pattern=f"%{search}%" if search else None,
        limit=pagination.limit,
        offset=pagination.offset,
    )

    rows = (await db.execute(data_query)).mappings().fetchall()
    data = [CustomerResponse.model_validate(dict(row)) for row in rows]

    return PaginatedResponse.create(data=data, total=total, pagination=pagination)
```

### Frontend Updates (`src/static/app.js`)

The frontend currently fetches all data without pagination. Update to:

```javascript
// Pagination state per section
const state = {
    customers: { page: 0, limit: 50, total: 0 },
    orders: { page: 0, limit: 50, total: 0 },
    // ...
};

async function loadCustomers(search = '') {
    const { page, limit } = state.customers;
    const offset = page * limit;
    const url = `/api/v1/customers?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}`;
    const response = await authFetch(url);
    const { data, total, has_more } = await response.json();

    state.customers.total = total;
    renderCustomerTable(data);
    renderPagination('customers', total, page, limit);
}

function renderPagination(section, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    // Render prev/next buttons and page info
    document.getElementById(`${section}-pagination`).innerHTML = `
        <button onclick="prevPage('${section}')" ${page === 0 ? 'disabled' : ''}>â† ÐÐ°Ð·Ð°Ð´</button>
        <span>Ð¡Ñ‚Ñ€Ð°Ð½Ð¸Ñ†Ð° ${page + 1} Ð¸Ð· ${totalPages} (${total} Ð·Ð°Ð¿Ð¸ÑÐµÐ¹)</span>
        <button onclick="nextPage('${section}')" ${page >= totalPages - 1 ? 'disabled' : ''}>Ð’Ð¿ÐµÑ€Ñ‘Ð´ â†’</button>
    `;
}
```

---

## Testing Requirements

- `GET /customers?limit=10&offset=0` returns exactly 10 records and correct `total`
- `GET /customers?limit=10&offset=10` returns next 10 records
- `GET /customers?limit=201` returns 400 (exceeds max)
- `total` field matches actual database count
- Frontend shows "Ð¡Ñ‚Ñ€Ð°Ð½Ð¸Ñ†Ð° 1 Ð¸Ð· N (M Ð·Ð°Ð¿Ð¸ÑÐµÐ¹)" correctly

---

## Related Documentation

- [TECHNICAL_DESIGN.md â€” Missing API Features](../TECHNICAL_DESIGN.md)
- Task 007 (Pydantic schemas â€” must be done first)

