# Task: CORS Hardening & Security Headers

**Task ID:** 016
**Category:** Setup / Security
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 1 hour
**Dependencies:** 009 (settings module)

---

## Description

The API currently uses `allow_origins=["*"]` which allows any website to make authenticated requests to the API using a user's credentials. In production, CORS should only allow the actual frontend domain. Additionally, security headers (CSP, X-Frame-Options, etc.) are missing.

---

## Acceptance Criteria

- [x] `allow_origins` set to production domain (`https://sales.zakharenkov.ru`) in production
- [x] `allow_origins` can be configured via environment variable for development flexibility
- [x] Security headers added: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`
- [x] Local development still works with `http://localhost:*` allowed
- [x] Preflight requests (`OPTIONS`) handled correctly

---

## Technical Details

### Update `src/main.py`

```python
from src.core.config import settings

# Parse allowed origins from env var (comma-separated)
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:8000").split(",")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)
```

### Add Security Headers Middleware

```python
# src/core/middleware.py (add to logging middleware file)
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if not settings.api_debug:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

# Register:
app.add_middleware(SecurityHeadersMiddleware)
```

### `.env` Updates

```env
# Production
CORS_ALLOWED_ORIGINS=https://sales.zakharenkov.ru

# Development
CORS_ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

---

## Testing Requirements

- Browser DevTools: POST to API from `https://evil.example.com` should be blocked by CORS
- `OPTIONS /api/v1/auth/login` from allowed origin returns 200 with correct headers
- Response headers include `X-Frame-Options: DENY`
- In production: `Strict-Transport-Security` header present

---

## Related Documentation

- [CURRENT_STATE.md â€” Security Gaps](../CURRENT_STATE.md)
- [TECHNICAL_DESIGN.md â€” Security Design](../TECHNICAL_DESIGN.md)

