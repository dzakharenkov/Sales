# Task: API Rate Limiting

**Task ID:** 002
**Category:** Setup / Security
**Priority:** CRITICAL
**Status:** COMPLETED
**Estimated Time:** 2 hours
**Dependencies:** 001 (secrets management done first)

---

## Description

The `/api/v1/auth/login` endpoint has no rate limiting. An attacker can make unlimited login attempts to brute-force user passwords. The Telegram bot has a basic attempt counter (5 tries, 10-min block), but the API itself has none.

Additionally, all other API endpoints should have general rate limiting to prevent abuse and DoS.

---

## Acceptance Criteria

- [ ] `/api/v1/auth/login` is limited to 10 attempts per IP per 10 minutes
- [ ] Blocked IPs receive `HTTP 429 Too Many Requests` with `Retry-After` header
- [ ] General API rate limit: 200 requests per minute per IP for authenticated endpoints
- [ ] Rate limit state stored in-memory (resets on restart — acceptable for current scale)
- [ ] Rate limit headers included in responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Technical Details

### Option A: Use `slowapi` (recommended, minimal code)

```bash
pip install slowapi
```

```python
# src/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

```python
# src/api/v1/routers/auth.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/auth/login")
@limiter.limit("10/10 minutes")
async def login(request: Request, body: LoginRequest, db = Depends(get_db)):
    ...
```

### Option B: Middleware-based (more control)

```python
# src/core/rate_limit.py
from collections import defaultdict
from time import time
from fastapi import Request, HTTPException

class InMemoryRateLimiter:
    def __init__(self, requests: int, window: int):
        self.requests = requests
        self.window = window
        self._store: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time()
        timestamps = self._store[key]
        # Remove expired timestamps
        self._store[key] = [t for t in timestamps if now - t < self.window]
        if len(self._store[key]) >= self.requests:
            return False
        self._store[key].append(now)
        return True

auth_limiter = InMemoryRateLimiter(requests=10, window=600)  # 10/10min
```

### Add to requirements.txt

```
slowapi>=0.1.9
```

---

## Testing Requirements

- Send 11 rapid POST requests to `/auth/login` — 11th should return 429
- Verify `Retry-After` header is present in 429 response
- Verify successful login still works after waiting for window to expire
- Test that different IP addresses have independent rate limit counters

---

## Related Documentation

- [TECHNICAL_DESIGN.md — Security Design](../TECHNICAL_DESIGN.md)
- [CURRENT_STATE.md — Security Gaps](../CURRENT_STATE.md)
