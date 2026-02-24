"""HTTP middleware for request logging and security headers."""

from __future__ import annotations

import time
import uuid

from fastapi import Request
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware

from src.core.config import settings
from src.core.security import decode_access_token


AUTH_COOKIE_KEY = "sds_at"


def _extract_user_login(request: Request) -> str:
    auth_header = request.headers.get("authorization", "")
    candidate_tokens: list[str] = []
    if auth_header.lower().startswith("bearer "):
        candidate_tokens.append(auth_header[7:].strip())
    candidate_tokens.append((request.cookies.get(AUTH_COOKIE_KEY) or "").strip())

    for token in candidate_tokens:
        if not token:
            continue
        payload = decode_access_token(token)
        if payload:
            return str(payload.get("sub") or "unknown")
    if auth_header or request.cookies.get(AUTH_COOKIE_KEY):
        return "unknown"
    return "anonymous"


async def request_logging_middleware(request: Request, call_next):
    request_id = uuid.uuid4().hex[:12]
    start = time.perf_counter()
    user_login = _extract_user_login(request)
    client_ip = request.client.host if request.client else "unknown"

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.exception(
            "api_error request_id={} method={} path={} user={} ip={} duration_ms={}",
            request_id,
            request.method,
            request.url.path,
            user_login,
            client_ip,
            duration_ms,
        )
        raise

    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    log_message = "api_request request_id={} method={} path={} status={} duration_ms={} user={} ip={}"
    log_args = (
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
        user_login,
        client_ip,
    )
    if response.status_code >= 500:
        logger.error(log_message, *log_args)
    elif response.status_code >= 400:
        logger.warning(log_message, *log_args)
    else:
        logger.info(log_message, *log_args)
    return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://api-maps.yandex.ru https://yastatic.net https://*.yandex.ru https://*.yandex.net; "
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://yastatic.net https://*.yandex.ru https://*.yandex.net; "
            "img-src 'self' data: blob: https://*.yandex.ru https://*.yandex.net https://*.openstreetmap.org; "
            "font-src 'self' data: https://cdnjs.cloudflare.com; "
            "connect-src 'self' https://api-maps.yandex.ru https://*.yandex.ru https://*.yandex.net https://*.openstreetmap.org; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'none'"
        )
        if not settings.api_debug:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
