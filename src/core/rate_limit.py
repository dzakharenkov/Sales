"""In-memory rate limiting primitives and FastAPI middleware."""

from __future__ import annotations

import math
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Callable

from fastapi import Request
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import BaseHTTPMiddleware


@dataclass(frozen=True)
class RateLimitDecision:
    """Decision payload returned by a limiter check."""

    allowed: bool
    limit: int
    remaining: int
    reset_at: int
    retry_after: int | None = None


class InMemoryRateLimiter:
    """Simple fixed-window limiter backed by in-memory timestamps."""

    def __init__(
        self,
        requests: int,
        window_seconds: int,
        time_func: Callable[[], float] | None = None,
    ) -> None:
        if requests <= 0:
            raise ValueError("requests must be > 0")
        if window_seconds <= 0:
            raise ValueError("window_seconds must be > 0")

        self._requests = requests
        self._window = window_seconds
        self._time_func = time_func or time.time
        self._store: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> RateLimitDecision:
        """Check key allowance and consume one slot when allowed."""
        now = self._time_func()
        with self._lock:
            bucket = self._store[key]
            boundary = now - self._window
            while bucket and bucket[0] <= boundary:
                bucket.popleft()

            if len(bucket) >= self._requests:
                reset_at = int(bucket[0] + self._window)
                retry_after = max(1, int(math.ceil(reset_at - now)))
                return RateLimitDecision(
                    allowed=False,
                    limit=self._requests,
                    remaining=0,
                    reset_at=reset_at,
                    retry_after=retry_after,
                )

            bucket.append(now)
            remaining = self._requests - len(bucket)
            reset_at = int((bucket[0] + self._window) if bucket else (now + self._window))
            return RateLimitDecision(
                allowed=True,
                limit=self._requests,
                remaining=remaining,
                reset_at=reset_at,
            )


def get_client_ip(request: Request) -> str:
    """Return client IP, honoring X-Forwarded-For when present."""
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        candidate = forwarded.split(",")[0].strip()
        if candidate:
            return candidate
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _rate_limit_headers(decision: RateLimitDecision) -> dict[str, str]:
    return {
        "X-RateLimit-Limit": str(decision.limit),
        "X-RateLimit-Remaining": str(decision.remaining),
        "X-RateLimit-Reset": str(decision.reset_at),
    }


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Apply endpoint-specific and authenticated API rate limits."""

    def __init__(
        self,
        app,
        auth_login_limiter: InMemoryRateLimiter,
        authenticated_api_limiter: InMemoryRateLimiter,
    ) -> None:
        super().__init__(app)
        self._auth_login_limiter = auth_login_limiter
        self._authenticated_api_limiter = authenticated_api_limiter

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        method = request.method.upper()
        auth_header = request.headers.get("authorization", "")
        client_ip = get_client_ip(request)

        limiter: InMemoryRateLimiter | None = None
        limiter_key: str | None = None

        if method == "POST" and path == "/api/v1/auth/login":
            limiter = self._auth_login_limiter
            limiter_key = f"login:{client_ip}"
        elif path.startswith("/api/v1/") and auth_header.lower().startswith("bearer "):
            limiter = self._authenticated_api_limiter
            limiter_key = f"auth:{client_ip}"

        if limiter is None or limiter_key is None:
            return await call_next(request)

        decision = limiter.check(limiter_key)
        if not decision.allowed:
            headers = _rate_limit_headers(decision)
            headers["Retry-After"] = str(decision.retry_after or 1)
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
                headers=headers,
            )

        response = await call_next(request)
        for header, value in _rate_limit_headers(decision).items():
            response.headers[header] = value
        return response

