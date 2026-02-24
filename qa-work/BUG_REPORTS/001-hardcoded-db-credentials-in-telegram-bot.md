# Bug Report: Hardcoded DB Credentials in Telegram Bot Runtime

**Task:** 001 (Secrets Management)
**Severity:** CRITICAL
**Status:** RESOLVED (2026-02-20)

## Description
Telegram bot runtime still contains hardcoded DB fallback credentials in source code, which violates task 001 acceptance criteria (no hardcoded credentials).

## Steps to Reproduce
1. Open `src/telegram_bot/bot.py`.
2. Check DSN assembly constants.
3. Observe defaults with real host/password fallbacks.

## Expected Result
Bot must read DB DSN only from required environment variables and fail-fast when missing.

## Actual Result
Code still contains hardcoded fallback values:
- `DEFAULT_HOST = os.getenv("DATABASE_HOST", "45.141.76.83")`
- `DEFAULT_PASSWORD = os.getenv("DATABASE_PASSWORD", "!Tesla11")`

## Evidence
- `src/telegram_bot/bot.py:27`
- `src/telegram_bot/bot.py:31`
- `src/telegram_bot/bot.py:32`

## Environment
- OS: Windows 11
- Python: 3.13.3
- Date: 2026-02-20

## Resolution
- Fixed in `src/telegram_bot/bot.py`: removed hardcoded fallback host/password defaults.
- Bot DB DSN now loads from environment only (`DATABASE_URL` or required `DATABASE_*` vars with fail-fast).
