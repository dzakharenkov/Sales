# Task: Secrets Management & Credential Rotation

**Task ID:** 001
**Category:** Setup / Security
**Priority:** CRITICAL
**Status:** COMPLETED
**Estimated Time:** 3 hours
**Dependencies:** None

---

## Description

The current codebase has production credentials hardcoded as default values in `src/database/connection.py`. The `.env` file contains a weak JWT secret and real DB/Telegram credentials. This is a critical security vulnerability that must be fixed before any other work.

**Affected files:**
- `src/database/connection.py` — hardcoded DB credentials as defaults
- `.env` — weak JWT secret `your-super-secret-key-change-this-in-production`
- `src/telegram_bot/config.py` — may have hardcoded fallbacks

---

## Acceptance Criteria

- [ ] `src/database/connection.py` has NO hardcoded credentials (no default values for host/port/user/password/db)
- [ ] Application raises a clear error on startup if any required env var is missing
- [ ] JWT secret is a cryptographically strong random string (≥32 bytes, base64-encoded)
- [ ] All credentials loaded exclusively from environment variables
- [ ] `.env.example` updated with correct placeholder descriptions
- [ ] `.gitignore` verified to exclude `.env` (already done, verify still works)
- [ ] Git history reviewed — if credentials were ever committed, document remediation steps

---

## Technical Details

### Step 1: Remove hardcoded credentials from `src/database/connection.py`

```python
# BEFORE (dangerous):
DEFAULT_HOST = "45.141.76.83"
DEFAULT_PASSWORD = "!Tesla11"
DATABASE_URL = f"postgresql+asyncpg://{os.getenv('DATABASE_USER', DEFAULT_USER)}:..."

# AFTER (safe — fails fast):
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]  # KeyError if missing = good
# OR use the Settings module from Task 014
```

### Step 2: Generate strong JWT secret

```bash
# Generate a strong secret (run once, save to .env):
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 3: Validate all required vars on startup

```python
# In src/main.py lifespan or a settings module:
REQUIRED_ENV_VARS = [
    "DATABASE_URL",
    "JWT_SECRET_KEY",
    "TELEGRAM_BOT_TOKEN",
]

for var in REQUIRED_ENV_VARS:
    if not os.getenv(var):
        raise RuntimeError(f"Required environment variable {var!r} is not set")
```

### Step 4: Update `.env.example`

```env
# Database (required)
DATABASE_URL=postgresql+asyncpg://user:password@host:port/dbname

# JWT Security (required) — generate with: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=REPLACE_WITH_GENERATED_SECRET

# Telegram Bot (required)
TELEGRAM_BOT_TOKEN=REPLACE_WITH_BOT_TOKEN

# Optional integrations
YANDEX_MAPS_API_KEY=
SENTRY_DSN=
SENTRY_ENABLED=false
```

---

## Testing Requirements

- Start the API with an empty `.env` — should fail with a clear error message listing missing variables
- Start the API with all required vars — should connect successfully
- Verify no credentials appear in `git log --all -p` output

---

## Related Documentation

- [TECHNICAL_DESIGN.md — Configuration Management](../TECHNICAL_DESIGN.md)
- [CURRENT_STATE.md — Critical Security Issues](../CURRENT_STATE.md)

---

## Notes

- After rotating credentials, update the actual `.env` on the production server
- The Telegram bot token in the old `.env` should be revoked via BotFather
- Consider using a password manager or secrets vault (HashiCorp Vault, AWS Secrets Manager) for long-term
- This task MUST be completed before any code is pushed to a public repository
