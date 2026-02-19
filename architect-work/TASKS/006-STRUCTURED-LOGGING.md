# Task: Structured Logging Setup

**Task ID:** 006
**Category:** Architecture / Infrastructure
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 3 hours
**Dependencies:** 001, 014 (Settings module recommended first)

---

## Description

The system has minimal logging. The bot writes to a flat `telegram_bot.log`. The API has no request/response logging. `loguru` is in requirements but barely used. This task sets up structured, leveled logging across all application layers.

---

## Acceptance Criteria

- [ ] All API requests logged: method, path, status code, duration, user login (if authenticated)
- [ ] All API errors logged with traceback at ERROR level
- [ ] Bot operations logged: user action, handler, outcome
- [ ] Log levels configurable via `LOG_LEVEL` environment variable
- [ ] Logs include timestamp, level, module, message in consistent format
- [ ] Log rotation: max 10MB per file, keep 7 days
- [ ] No sensitive data in logs (passwords, tokens, full DB connection strings)
- [ ] Startup/shutdown events logged

---

## Technical Details

### Configure loguru in `src/core/logging_setup.py`

```python
import sys
from loguru import logger

def setup_logging(log_level: str = "INFO", log_file: str = "logs/app.log"):
    # Remove default handler
    logger.remove()

    # Console handler (human-readable)
    logger.add(
        sys.stdout,
        level=log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
    )

    # File handler (JSON for parsing)
    logger.add(
        log_file,
        level=log_level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
        rotation="10 MB",
        retention="7 days",
        compression="gz",
        serialize=False,  # Set to True for JSON format
    )

    return logger
```

### FastAPI Request Logging Middleware

```python
# src/core/middleware.py
import time
from fastapi import Request
from loguru import logger

async def logging_middleware(request: Request, call_next):
    start_time = time.time()

    # Don't log token values
    user_login = "anonymous"
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            from src.core.security import decode_access_token
            payload = decode_access_token(auth[7:])
            user_login = payload.get("sub", "unknown")
        except Exception:
            pass

    response = await call_next(request)

    duration_ms = round((time.time() - start_time) * 1000, 2)

    logger.info(
        f"{request.method} {request.url.path} "
        f"status={response.status_code} "
        f"duration={duration_ms}ms "
        f"user={user_login} "
        f"ip={request.client.host if request.client else 'unknown'}"
    )

    return response
```

### Register Middleware in `src/main.py`

```python
from src.core.middleware import logging_middleware
from src.core.logging_setup import setup_logging

# In lifespan or app creation:
setup_logging(log_level=os.getenv("LOG_LEVEL", "INFO"))
app.middleware("http")(logging_middleware)
```

### Bot Logging

```python
# src/telegram_bot/bot.py — add at top:
from loguru import logger

# Replace all print() calls with logger.info()/logger.error()
# Example handler logging:
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    logger.info(f"Bot message: user_id={user.id} username={user.username} text={update.message.text[:50]!r}")
    ...
```

### Log Levels by Environment

```env
# .env.example additions:
LOG_LEVEL=INFO           # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FILE=logs/app.log    # Path to log file
```

### Sensitive Data Protection

```python
# Never log these:
# - passwords (even hashed)
# - JWT tokens
# - Database connection strings with passwords
# - API keys (Telegram, Yandex, Sentry DSN)

# Safe to log:
# - User login (username, not password)
# - Request paths
# - Response status codes
# - Timing information
# - Operation IDs and entity IDs
```

---

## Testing Requirements

- Make 5 API requests, verify each appears in log with correct format
- Make a request with invalid JWT, verify 401 is logged
- Trigger a 500 error, verify full traceback appears in log at ERROR level
- Verify log file rotates after reaching 10MB (test with small rotation size)
- Grep log for any password/token patterns — should find none

---

## Related Documentation

- [TECHNICAL_DESIGN.md — Monitoring & Observability](../TECHNICAL_DESIGN.md)
- [CURRENT_STATE.md — Missing Components](../CURRENT_STATE.md)

---

## Notes

- `loguru` supports async-safe logging — no special async wrapper needed
- Consider centralizing logs with ELK stack or Loki + Grafana for production
- Add `request_id` (UUID per request) to all log lines for distributed tracing
