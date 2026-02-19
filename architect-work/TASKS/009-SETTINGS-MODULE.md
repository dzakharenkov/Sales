# Task: Centralized Settings Module with pydantic-settings

**Task ID:** 009
**Category:** Architecture
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 2 hours
**Dependencies:** 001

---

## Description

Configuration is currently scattered across multiple files (`connection.py`, `telegram_bot/config.py`, `core/security.py`, `main.py`). Each file reads from `os.getenv()` independently with different defaults. Centralize all configuration into a single `Settings` class using `pydantic-settings` (already in `requirements.txt`).

---

## Acceptance Criteria

- [x] Single `src/core/config.py` file with all application settings
- [x] `pydantic-settings` `BaseSettings` class used (fails fast on missing required vars)
- [x] All existing `os.getenv()` calls in the codebase replaced with `settings.field_name`
- [x] `.env.example` updated to list all settings with descriptions
- [x] Application fails to start with clear error if required settings are missing
- [x] Settings are validated at startup (not lazily at first use)

---

## Technical Details

### `src/core/config.py`

```python
from pydantic import Field, PostgresDsn, AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore unknown env vars
    )

    # Database (required)
    database_url: str = Field(..., description="Full PostgreSQL async connection URL")

    # Security (required)
    jwt_secret_key: str = Field(..., min_length=32, description="JWT signing secret")
    jwt_algorithm: str = Field(default="HS256")
    jwt_expire_minutes: int = Field(default=60)

    # Telegram Bot (required)
    telegram_bot_token: str = Field(..., description="Token from @BotFather")
    sds_api_url: str = Field(default="http://127.0.0.1:8000")
    api_timeout: int = Field(default=30)

    # API Server
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)
    api_debug: bool = Field(default=False)

    # File Storage
    upload_dir: str = Field(default="photo")
    site_url: str = Field(default="http://localhost:8000")

    # External APIs (optional)
    yandex_maps_api_key: str = Field(default="")

    # Sentry (optional)
    sentry_enabled: bool = Field(default=False)
    sentry_dsn: str = Field(default="")
    sentry_traces_sample_rate: float = Field(default=0.1)
    sentry_environment: str = Field(default="development")

    # Logging
    log_level: str = Field(default="INFO")
    log_file: str = Field(default="logs/app.log")

    # Bot-specific
    cache_ttl: int = Field(default=3600)
    max_login_attempts: int = Field(default=5)
    login_block_minutes: int = Field(default=10)
    timezone: str = Field(default="Asia/Tashkent")


# Singleton â€” import this everywhere
settings = Settings()
```

### Update Consumers

```python
# src/database/connection.py â€” BEFORE:
DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql+asyncpg://...")
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "secret")

# AFTER:
from src.core.config import settings
DATABASE_URL = settings.database_url
JWT_SECRET = settings.jwt_secret_key
```

```python
# src/core/security.py â€” BEFORE:
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")

# AFTER:
from src.core.config import settings
SECRET_KEY = settings.jwt_secret_key
```

```python
# src/telegram_bot/config.py â€” BEFORE:
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
API_TIMEOUT = 30
CACHE_TTL = 3600

# AFTER:
from src.core.config import settings
BOT_TOKEN = settings.telegram_bot_token
API_TIMEOUT = settings.api_timeout
CACHE_TTL = settings.cache_ttl
```

### Validate on Startup

```python
# src/main.py â€” in lifespan:
from src.core.config import settings  # This triggers validation

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting SDS API v0.5 | environment={settings.sentry_environment}")
    logger.info(f"API: {settings.api_host}:{settings.api_port} | Debug: {settings.api_debug}")
    # ... rest of startup
    yield
```

### Updated `.env.example`

```env
# ===== REQUIRED =====
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname
JWT_SECRET_KEY=  # Generate: python -c "import secrets; print(secrets.token_hex(32))"
TELEGRAM_BOT_TOKEN=  # Get from @BotFather on Telegram

# ===== API SERVER =====
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=false

# ===== FILE STORAGE =====
UPLOAD_DIR=/path/to/photos
SITE_URL=https://yourdomain.com

# ===== EXTERNAL APIs =====
YANDEX_MAPS_API_KEY=

# ===== MONITORING (optional) =====
SENTRY_ENABLED=false
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_ENVIRONMENT=production

# ===== LOGGING =====
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# ===== BOT SETTINGS =====
SDS_API_URL=http://127.0.0.1:8000
API_TIMEOUT=30
CACHE_TTL=3600
MAX_LOGIN_ATTEMPTS=5
LOGIN_BLOCK_MINUTES=10
TIMEZONE=Asia/Tashkent
```

---

## Testing Requirements

- Start app without `.env` â€” should fail with clear "field required" Pydantic error
- Start app with all required vars â€” should start successfully
- `settings.database_url` should return correct URL from env
- Verify `settings` is imported (not re-instantiated) across modules â€” should be singleton

---

## Related Documentation

- [ARCHITECTURE.md â€” Configuration Management](../ARCHITECTURE.md)
- [TECHNICAL_DESIGN.md â€” Configuration Management](../TECHNICAL_DESIGN.md)
- Task 001 (Secrets â€” must be done first)

