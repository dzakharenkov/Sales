"""Global API exception handlers with sanitized structured responses."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, OperationalError

logger = logging.getLogger(__name__)


def _error_payload(code: str, message: str, **extra: Any) -> dict[str, Any]:
    payload: dict[str, Any] = {"code": code, "message": message}
    payload.update(extra)
    return payload


async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    details = []
    for item in exc.errors():
        details.append(
            {
                "field": ".".join(str(loc) for loc in item.get("loc", [])),
                "message": item.get("msg", "Validation error"),
                "type": item.get("type", "value_error"),
            }
        )
    return JSONResponse(
        status_code=422,
        content={"error": _error_payload("VALIDATION_ERROR", "Ошибка валидации", details=details)},
    )


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    logger.exception("DB integrity error on %s %s", request.method, request.url.path, exc_info=exc)
    text = str(exc).lower()
    if "unique" in text:
        message = "Запись с такими данными уже существует"
    elif "foreign key" in text:
        message = "Связанная запись не найдена"
    elif "not null" in text:
        message = "Обязательное поле не заполнено"
    else:
        message = "Ошибка ограничений базы данных"
    return JSONResponse(
        status_code=409,
        content={"error": _error_payload("DB_CONSTRAINT_ERROR", message)},
    )


async def database_error_handler(request: Request, exc: OperationalError) -> JSONResponse:
    logger.exception("DB operational error on %s %s", request.method, request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=503,
        content={
            "error": _error_payload(
                "DATABASE_UNAVAILABLE",
                "База данных временно недоступна",
            )
        },
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    if exc.status_code >= 500:
        logger.exception("HTTP %s on %s %s", exc.status_code, request.method, request.url.path, exc_info=exc)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": _error_payload("INTERNAL_ERROR", "Внутренняя ошибка сервера")},
        )

    detail = exc.detail
    if isinstance(detail, dict) and "error" in detail:
        payload = detail["error"]
    elif isinstance(detail, dict) and "code" in detail and "message" in detail:
        payload = detail
    else:
        default_codes = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            422: "VALIDATION_ERROR",
        }
        payload = _error_payload(default_codes.get(exc.status_code, "HTTP_ERROR"), str(detail))

    return JSONResponse(status_code=exc.status_code, content={"error": payload})


async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"error": _error_payload("INTERNAL_ERROR", "Внутренняя ошибка сервера")},
    )
