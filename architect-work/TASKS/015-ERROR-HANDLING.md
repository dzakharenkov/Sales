# Task: Standardized Error Handling

**Task ID:** 015
**Category:** Architecture / Security
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 4 hours
**Dependencies:** 007 (response schemas for error schemas), 009 (settings)

---

## Description

Currently, exceptions are caught and the raw exception message is sent to the client (`detail=str(e)`). This exposes internal implementation details (table names, column names, query structure). Additionally, there's no standardized error code system. This task implements proper error handling throughout the API.

---

## Acceptance Criteria

- [x] No raw exception messages exposed to API clients
- [x] All 500 errors logged with full traceback internally
- [x] All errors return structured JSON: `{"error": {"code": "...", "message": "..."}}`
- [x] Custom exception classes for business logic errors
- [x] Global exception handlers registered on FastAPI app
- [x] Database errors caught and converted to user-friendly messages
- [x] Validation errors (Pydantic) formatted consistently

---

## Technical Details

### Custom Exception Classes (`src/core/exceptions.py`)

```python
from fastapi import HTTPException


class AppError(HTTPException):
    """Base application error."""
    pass


class NotFoundError(AppError):
    def __init__(self, resource: str, id: str | int):
        super().__init__(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": f"{resource} Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½(Ð°)", "id": str(id)}
        )


class ForbiddenError(AppError):
    def __init__(self, message: str = "Ð”Ð¾ÑÑ‚ÑƒÐ¿ Ð·Ð°Ð¿Ñ€ÐµÑ‰Ñ‘Ð½"):
        super().__init__(
            status_code=403,
            detail={"code": "FORBIDDEN", "message": message}
        )


class ValidationError(AppError):
    def __init__(self, message: str, field: str | None = None):
        detail = {"code": "VALIDATION_ERROR", "message": message}
        if field:
            detail["field"] = field
        super().__init__(status_code=400, detail=detail)


class ConflictError(AppError):
    def __init__(self, message: str):
        super().__init__(
            status_code=409,
            detail={"code": "CONFLICT", "message": message}
        )


class DatabaseError(AppError):
    def __init__(self, message: str = "ÐžÑˆÐ¸Ð±ÐºÐ° Ð±Ð°Ð·Ñ‹ Ð´Ð°Ð½Ð½Ñ‹Ñ…"):
        super().__init__(
            status_code=500,
            detail={"code": "DATABASE_ERROR", "message": message}
        )
```

### Global Exception Handlers (`src/core/exception_handlers.py`)

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, OperationalError
from loguru import logger


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "VALIDATION_ERROR", "message": "ÐžÑˆÐ¸Ð±ÐºÐ° Ð²Ð°Ð»Ð¸Ð´Ð°Ñ†Ð¸Ð¸", "details": errors}}
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Handle DB constraint violations."""
    logger.error(f"DB IntegrityError: {exc}")

    if "unique" in str(exc).lower():
        message = "Ð—Ð°Ð¿Ð¸ÑÑŒ Ñ Ñ‚Ð°ÐºÐ¸Ð¼Ð¸ Ð´Ð°Ð½Ð½Ñ‹Ð¼Ð¸ ÑƒÐ¶Ðµ ÑÑƒÑ‰ÐµÑÑ‚Ð²ÑƒÐµÑ‚"
    elif "foreign key" in str(exc).lower():
        message = "Ð¡Ð²ÑÐ·Ð°Ð½Ð½Ð°Ñ Ð·Ð°Ð¿Ð¸ÑÑŒ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð°"
    elif "not null" in str(exc).lower():
        message = "ÐžÐ±ÑÐ·Ð°Ñ‚ÐµÐ»ÑŒÐ½Ð¾Ðµ Ð¿Ð¾Ð»Ðµ Ð½Ðµ Ð·Ð°Ð¿Ð¾Ð»Ð½ÐµÐ½Ð¾"
    else:
        message = "ÐžÑˆÐ¸Ð±ÐºÐ° Ð¾Ð³Ñ€Ð°Ð½Ð¸Ñ‡ÐµÐ½Ð¸Ð¹ Ð±Ð°Ð·Ñ‹ Ð´Ð°Ð½Ð½Ñ‹Ñ…"

    return JSONResponse(
        status_code=409,
        content={"error": {"code": "DB_CONSTRAINT_ERROR", "message": message}}
    )


async def database_error_handler(request: Request, exc: OperationalError):
    """Handle DB connection/operation errors."""
    logger.critical(f"DB OperationalError: {exc}")
    return JSONResponse(
        status_code=503,
        content={"error": {"code": "DATABASE_UNAVAILABLE", "message": "Ð‘Ð°Ð·Ð° Ð´Ð°Ð½Ð½Ñ‹Ñ… Ð²Ñ€ÐµÐ¼ÐµÐ½Ð½Ð¾ Ð½ÐµÐ´Ð¾ÑÑ‚ÑƒÐ¿Ð½Ð°"}}
    )


async def generic_error_handler(request: Request, exc: Exception):
    """Catch-all for unexpected errors."""
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "Ð’Ð½ÑƒÑ‚Ñ€ÐµÐ½Ð½ÑÑ Ð¾ÑˆÐ¸Ð±ÐºÐ° ÑÐµÑ€Ð²ÐµÑ€Ð°"}}
    )
```

### Register in `src/main.py`

```python
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, OperationalError
from src.core.exception_handlers import (
    validation_exception_handler,
    integrity_error_handler,
    database_error_handler,
    generic_error_handler,
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)
app.add_exception_handler(OperationalError, database_error_handler)
app.add_exception_handler(Exception, generic_error_handler)
```

### Update Routers to Use Custom Exceptions

```python
# BEFORE (dangerous):
@router.get("/customers/{id}")
async def get_customer(id: int, db = Depends(get_db)):
    try:
        result = await db.execute(text("SELECT * FROM ... WHERE id = :id"), {"id": id})
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Not found")
        return row
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  # EXPOSES INTERNALS

# AFTER (safe):
from src.core.exceptions import NotFoundError, DatabaseError

@router.get("/customers/{id}")
async def get_customer(id: int, db = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM ... WHERE id = :id"), {"id": id})
    row = result.fetchone()
    if not row:
        raise NotFoundError("ÐšÐ»Ð¸ÐµÐ½Ñ‚", id)
    return CustomerResponse.model_validate(dict(row))
    # SQLAlchemy/DB exceptions bubble up to global handlers
```

---

## Testing Requirements

- `GET /customers/99999999` returns `{"error": {"code": "NOT_FOUND", ...}}` not a 500
- `POST /customers` with invalid body returns `{"error": {"code": "VALIDATION_ERROR", ...}}`
- Simulate DB connection failure â€” should return 503, not expose connection string
- Verify no stack traces in HTTP responses
- Verify stack traces appear in logs (Sentry + file)

---

## Related Documentation

- [TECHNICAL_DESIGN.md â€” Error Handling Strategy](../TECHNICAL_DESIGN.md)
- [CURRENT_STATE.md â€” Anti-Patterns](../CURRENT_STATE.md)
- Task 006 (Structured Logging â€” logs errors)

