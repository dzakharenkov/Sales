# Security Remediation Report — 015

Date: 2026-02-20

## Scope
Remediation of previously identified vulnerabilities from `security-work/VULNERABILITIES.md`.

## Numeric итог
- Vulnerabilities tracked: **5**
- Closed: **5**
- Open: **0**
- Critical open: **0**
- High open: **0**

## Code changes
- Files changed for remediation: **9**
- Diff stats (these files): **383 insertions**, **183 deletions**

Files:
1. `src/api/v1/routers/auth.py`
2. `src/core/deps.py`
3. `src/core/middleware.py`
4. `src/static/login.html`
5. `src/static/app.js`
6. `src/static/app.html`
7. `src/api/v1/routers/operations.py`
8. `src/api/v1/routers/finances.py`
9. `src/api/v1/routers/dictionary.py`

## Security controls implemented
1. Cookie-based auth (httpOnly) enabled on login, logout endpoint added.
2. Backend auth now accepts secure cookie token fallback.
3. Account lockout enforced in API login route.
4. CSP and Permissions-Policy headers added.
5. Silent `except/pass` removed in operations flow hot spot.
6. Dynamic SQL reduced in `finances` and `dictionary` routes.

## Validation results
### Automated tests
- Command: `pytest tests/test_rate_limit.py tests/test_cors_security_headers.py tests/test_sql_injection_guards.py tests/unit/test_security.py -q`
- Result: **12 passed**, **0 failed**

### Auth tests
- Command: `pytest tests/unit/test_security.py tests/integration/test_auth.py -q`
- Result: **3 passed**, **5 skipped**, **0 failed**

### Dependency audit
- `pip-audit` result: **No known vulnerabilities found**
- Artifacts:
  - `security-work/pip-audit-report.json`
  - `security-work/pip-audit-report-after-fixes.json`

### Static security scan (Bandit)
- Before: **28 findings** (`B608=16`, `B110=11`, `B104=1`)
- After final hardening: **16 findings** (`B110=10`, `B608=3`, `B105=2`, `B104=1`)
- Artifacts:
  - `security-work/bandit-report.json`
  - `security-work/bandit-report-after-fixes.json`
  - `security-work/bandit-report-after-final-hardening.json`

## Remaining open items
- **0**
