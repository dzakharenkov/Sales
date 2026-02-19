"""Custom application exceptions for structured API error responses."""

from __future__ import annotations

from fastapi import HTTPException


class AppError(HTTPException):
    """Base application error with structured detail payload."""

    def __init__(self, status_code: int, code: str, message: str, **extra: object) -> None:
        detail: dict[str, object] = {"code": code, "message": message}
        detail.update(extra)
        super().__init__(status_code=status_code, detail=detail)


class NotFoundError(AppError):
    def __init__(self, resource: str, item_id: str | int) -> None:
        super().__init__(
            status_code=404,
            code="NOT_FOUND",
            message=f"{resource} не найден(а)",
            id=str(item_id),
        )


class ForbiddenError(AppError):
    def __init__(self, message: str = "Доступ запрещён") -> None:
        super().__init__(status_code=403, code="FORBIDDEN", message=message)


class ValidationError(AppError):
    def __init__(self, message: str, field: str | None = None) -> None:
        payload: dict[str, object] = {}
        if field is not None:
            payload["field"] = field
        super().__init__(status_code=400, code="VALIDATION_ERROR", message=message, **payload)


class ConflictError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(status_code=409, code="CONFLICT", message=message)


class DatabaseError(AppError):
    def __init__(self, message: str = "Ошибка базы данных") -> None:
        super().__init__(status_code=500, code="DATABASE_ERROR", message=message)
