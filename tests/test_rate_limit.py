from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.core.rate_limit import InMemoryRateLimiter, RateLimitMiddleware


class FakeClock:
    def __init__(self) -> None:
        self._now = 1_700_000_000.0

    def now(self) -> float:
        return self._now

    def advance(self, seconds: float) -> None:
        self._now += seconds


def _build_test_app(clock: FakeClock) -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        RateLimitMiddleware,
        auth_login_limiter=InMemoryRateLimiter(requests=10, window_seconds=600, time_func=clock.now),
        authenticated_api_limiter=InMemoryRateLimiter(requests=200, window_seconds=60, time_func=clock.now),
    )

    @app.post("/api/v1/auth/login")
    async def login():
        return {"ok": True}

    @app.get("/api/v1/customers")
    async def customers():
        return {"ok": True}

    return app


def test_login_rate_limit_blocks_11th_request_and_returns_retry_after():
    clock = FakeClock()
    client = TestClient(_build_test_app(clock))

    headers = {"x-forwarded-for": "203.0.113.10"}
    for _ in range(10):
        response = client.post("/api/v1/auth/login", json={"login": "u", "password": "p"}, headers=headers)
        assert response.status_code == 200

    blocked = client.post("/api/v1/auth/login", json={"login": "u", "password": "p"}, headers=headers)
    assert blocked.status_code == 429
    assert blocked.headers.get("Retry-After")
    assert blocked.headers.get("X-RateLimit-Limit") == "10"
    assert blocked.headers.get("X-RateLimit-Remaining") == "0"
    assert blocked.headers.get("X-RateLimit-Reset")


def test_login_rate_limit_resets_after_window_expiration():
    clock = FakeClock()
    client = TestClient(_build_test_app(clock))
    headers = {"x-forwarded-for": "203.0.113.11"}

    for _ in range(10):
        assert client.post("/api/v1/auth/login", json={"login": "u", "password": "p"}, headers=headers).status_code == 200
    assert client.post("/api/v1/auth/login", json={"login": "u", "password": "p"}, headers=headers).status_code == 429

    clock.advance(601)
    assert client.post("/api/v1/auth/login", json={"login": "u", "password": "p"}, headers=headers).status_code == 200


def test_different_ips_have_independent_counters():
    clock = FakeClock()
    client = TestClient(_build_test_app(clock))

    ip1_headers = {"x-forwarded-for": "203.0.113.20"}
    ip2_headers = {"x-forwarded-for": "203.0.113.21"}

    for _ in range(10):
        assert client.post("/api/v1/auth/login", json={"login": "u", "password": "p"}, headers=ip1_headers).status_code == 200
    assert client.post("/api/v1/auth/login", json={"login": "u", "password": "p"}, headers=ip1_headers).status_code == 429

    # Independent IP should still be allowed.
    assert client.post("/api/v1/auth/login", json={"login": "u", "password": "p"}, headers=ip2_headers).status_code == 200


def test_authenticated_api_rate_limit_uses_200_per_minute_and_returns_headers():
    clock = FakeClock()
    client = TestClient(_build_test_app(clock))

    headers = {"authorization": "Bearer token", "x-forwarded-for": "203.0.113.30"}
    first = client.get("/api/v1/customers", headers=headers)
    assert first.status_code == 200
    assert first.headers.get("X-RateLimit-Limit") == "200"
    assert first.headers.get("X-RateLimit-Remaining") == "199"
    assert first.headers.get("X-RateLimit-Reset")

    for _ in range(199):
        assert client.get("/api/v1/customers", headers=headers).status_code == 200
    blocked = client.get("/api/v1/customers", headers=headers)
    assert blocked.status_code == 429
    assert blocked.headers.get("Retry-After")
    assert blocked.headers.get("X-RateLimit-Limit") == "200"

