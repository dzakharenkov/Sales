# Security Policy — Sales (SDS)

## Scope
- Backend API: FastAPI (`src/main.py`)
- Web UI: static frontend (`src/static/*`)
- Telegram bot: `src/telegram_bot/*`
- Database: PostgreSQL via SQLAlchemy async

## Authentication & Authorization

### Authentication
- Method: JWT Bearer token (`src/core/security.py`)
- Access token expiry: 60 minutes (`src/core/config.py` -> `jwt_expire_minutes`)
- Transport expectation: HTTPS in production (HSTS is set when `api_debug=false`)
- Current storage in Web UI: `localStorage` (`src/static/login.html:160`, `src/static/app.js:2`)

### Authorization
- Model: RBAC via role field in JWT/user record
- Role checks: `require_admin` (`src/core/deps.py`)
- Protected endpoints require bearer token (`src/core/deps.py`)

### Passwords
- Hashing: `bcrypt` (`src/core/security.py`)
- Verification: bcrypt check with safe exception handling
- Runtime requirement: secrets validation includes JWT strength (`src/core/env.py`)

## Session & Login Security
- API login rate limit: 10 requests / 10 minutes per IP (`src/main.py`, `src/core/rate_limit.py`)
- Authenticated API rate limit: 200 requests / 60 seconds per IP
- Gap: account-level lockout from `max_login_attempts/login_block_minutes` config is not enforced in API login flow.

## Data Protection

### In Transit
- CORS allowlist configured from env (`src/main.py`, `src/core/config.py`)
- Security headers middleware enabled:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - HSTS in non-debug mode

### At Rest
- Passwords stored hashed (bcrypt)
- Sensitive runtime secrets loaded from env/.env and validated at startup (`src/core/env.py`)

## API Security Controls
- SQL injection guard tests present and passing (`tests/test_sql_injection_guards.py`)
- Rate-limit tests present and passing (`tests/test_rate_limit.py`)
- CORS/security header tests present and passing (`tests/test_cors_security_headers.py`)

## Dependency Security
- `pip-audit` on cleaned requirements: no known vulnerabilities (see `security-work/pip-audit-report.json`)
- Bandit static scan available (see `security-work/bandit-report.json`)

## Secrets Management
- No hardcoded production keys detected in source by pattern scan.
- Placeholders and test credentials are present in docs/CI/test files (expected for non-production contexts).

## Incident Response (Project Standard)
1. Triage and severity assignment within 24h.
2. Reproduce and isolate affected components.
3. Patch with regression/security tests.
4. Deploy fix and verify logs/monitoring.
5. Post-incident report with root cause and prevention steps.

## Mandatory Hardening Baseline (Next Iteration)
1. Move web token storage from `localStorage` to secure HTTP-only cookie strategy.
2. Implement account-level login lockout policy in API auth route.
3. Add CSP header and modernize browser security header set.
4. Reduce dynamic SQL string construction in reports/finances routers.
5. Add periodic security pipeline: bandit + pip-audit + secret scan in CI.
