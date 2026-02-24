# Troubleshooting

## `RuntimeError: Missing required environment variables`
Cause: one or more required env vars are unset.

Fix:
1. Set `DATABASE_URL`, `JWT_SECRET_KEY`, `TELEGRAM_BOT_TOKEN` in `.env`.
2. Restart the application.

## `JWT_SECRET_KEY is too weak`
Cause: secret is shorter than 32 bytes.

Fix:
```bash
python -c "import base64,secrets; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())"
```
Set generated value and restart.

## `Database connection failed` on startup
Cause: DB is unreachable or URL is invalid.

Fix:
1. Verify `DATABASE_URL`.
2. Confirm DB host/port/network access.
3. Check PostgreSQL user permissions.

## 401 on protected endpoints
Cause: missing or expired auth token.

Fix:
1. Re-login via `POST /api/v1/auth/login`.
2. Retry request with valid cookie/token.

