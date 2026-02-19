from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from src.core.middleware import SecurityHeadersMiddleware


def _build_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://sales.zakharenkov.ru", "http://localhost:8000"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    )
    app.add_middleware(SecurityHeadersMiddleware)

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    return app


def test_preflight_allowed_origin() -> None:
    client = TestClient(_build_app())
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:8000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:8000"


def test_preflight_disallowed_origin() -> None:
    client = TestClient(_build_app())
    response = client.options(
        "/health",
        headers={
            "Origin": "https://evil.example.com",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 400
    assert response.headers.get("access-control-allow-origin") is None


def test_security_headers_present() -> None:
    client = TestClient(_build_app())
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("x-frame-options") == "DENY"
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-xss-protection") == "1; mode=block"
