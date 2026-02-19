from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError, OperationalError

from src.core.exception_handlers import (
    database_error_handler,
    generic_error_handler,
    http_exception_handler,
    integrity_error_handler,
    validation_exception_handler,
)


def _build_app() -> FastAPI:
    app = FastAPI()
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(OperationalError, database_error_handler)
    app.add_exception_handler(Exception, generic_error_handler)

    @app.get("/http400")
    async def http400():
        raise HTTPException(status_code=400, detail="bad request")

    @app.get("/http500")
    async def http500():
        raise HTTPException(status_code=500, detail="internal details")

    @app.get("/boom")
    async def boom():
        raise RuntimeError("sensitive stack trace detail")

    @app.get("/integrity")
    async def integrity():
        raise IntegrityError("INSERT ...", {}, Exception("unique violation"))

    @app.get("/db")
    async def db():
        raise OperationalError("SELECT 1", {}, Exception("connection string leaked"))

    @app.get("/validation")
    async def validation(required_number: int):
        return {"value": required_number}

    return app


def test_http_error_is_structured() -> None:
    client = TestClient(_build_app(), raise_server_exceptions=False)
    response = client.get("/http400")

    assert response.status_code == 400
    payload = response.json()
    assert "error" in payload
    assert payload["error"]["code"] == "BAD_REQUEST"


def test_internal_http_error_is_sanitized() -> None:
    client = TestClient(_build_app(), raise_server_exceptions=False)
    response = client.get("/http500")

    assert response.status_code == 500
    payload = response.json()
    assert payload["error"]["code"] == "INTERNAL_ERROR"
    assert "internal details" not in payload["error"]["message"].lower()


def test_unhandled_exception_is_sanitized() -> None:
    client = TestClient(_build_app(), raise_server_exceptions=False)
    response = client.get("/boom")

    assert response.status_code == 500
    payload = response.json()
    assert payload["error"]["code"] == "INTERNAL_ERROR"
    assert "sensitive" not in str(payload).lower()


def test_integrity_error_is_structured() -> None:
    client = TestClient(_build_app(), raise_server_exceptions=False)
    response = client.get("/integrity")

    assert response.status_code == 409
    payload = response.json()
    assert payload["error"]["code"] == "DB_CONSTRAINT_ERROR"


def test_operational_error_is_structured() -> None:
    client = TestClient(_build_app(), raise_server_exceptions=False)
    response = client.get("/db")

    assert response.status_code == 503
    payload = response.json()
    assert payload["error"]["code"] == "DATABASE_UNAVAILABLE"
    assert "connection string" not in str(payload).lower()


def test_validation_error_is_structured() -> None:
    client = TestClient(_build_app(), raise_server_exceptions=False)
    response = client.get("/validation")

    assert response.status_code == 422
    payload = response.json()
    assert payload["error"]["code"] == "VALIDATION_ERROR"
    assert isinstance(payload["error"]["details"], list)
