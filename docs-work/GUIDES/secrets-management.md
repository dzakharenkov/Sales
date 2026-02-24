# Guide: Secrets Management

## Required Secrets
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `TELEGRAM_BOT_TOKEN`

## Runtime Validation
On startup, `src/core/env.py` validates:
- Required values are present and non-empty.
- `JWT_SECRET_KEY` has at least 32 bytes entropy.

If validation fails, app startup stops with a `RuntimeError`.

## Rotation Procedure
1. Generate a new JWT secret:
```bash
python -c "import base64,secrets; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())"
```
2. Update `.env` in each environment.
3. Rotate DB password and update `DATABASE_URL`.
4. Revoke old Telegram token in BotFather and set a new `TELEGRAM_BOT_TOKEN`.
5. Restart API and bot processes.

## Repository Hygiene
- Keep `.env` out of git.
- Keep `.env.example` placeholder-only.
- If a secret was committed historically, rewrite history and rotate all affected credentials.

