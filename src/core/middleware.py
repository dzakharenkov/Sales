"""HTTP middleware for request and error logging."""

from __future__ import annotations

import time
import uuid

from fastapi import Request
from loguru import logger

from src.core.security import decode_access_token


def _extract_user_login(request: Request) -> str:
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return "anonymous"
    token = auth_header[7:].strip()
    if not token:
        return "anonymous"
    payload = decode_access_token(token)
    if not payload:
        return "unknown"
    return str(payload.get("sub") or "unknown")


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
    log_message = (
        "api_request request_id={} method={} path={} status={} duration_ms={} user={} ip={}"
    )
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

