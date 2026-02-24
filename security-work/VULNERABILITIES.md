# Known Vulnerabilities — Sales (SDS)

Audit date: 2026-02-20
Re-audit after fixes: 2026-02-20

## Summary (After Fixes)
- Total tracked vulnerabilities: 5
- Closed: 5
- Open: 0

Severity split (open only):
- Critical: 0
- High: 0
- Medium: 0
- Low: 0

Bandit snapshot:
- Before: 28 findings (`B608=16`, `B110=11`, `B104=1`)
- After final hardening: 16 findings (`B110=10`, `B608=3`, `B105=2`, `B104=1`)
- Reports:
  - `security-work/bandit-report.json`
  - `security-work/bandit-report-after-fixes.json`
  - `security-work/bandit-report-after-final-hardening.json`

---

## 1) JWT token in `localStorage` (XSS impact amplification)
**Severity:** CRITICAL  
**Status:** RESOLVED  
**Fixed in:**
- `src/api/v1/routers/auth.py` (httpOnly cookie issuance)
- `src/core/deps.py` (cookie auth support)
- `src/static/login.html` (no real JWT in localStorage)
- `src/static/app.html`, `src/static/app.js` (cookie-aware auth/logout flow)

### Resolution
Auth now uses httpOnly cookie `sds_access_token` as primary. UI keeps only non-secret marker (`cookie`) for legacy checks.

---

## 2) Account lockout policy not enforced in API login
**Severity:** HIGH  
**Status:** RESOLVED  
**Fixed in:** `src/api/v1/routers/auth.py`

### Resolution
Implemented per-login lockout using configured policy:
- `max_login_attempts`
- `login_block_minutes`

Behavior:
- failed logins increment counter
- account blocked after threshold
- successful login clears counters

---

## 3) Dynamic SQL construction in reporting/finance routers
**Severity:** MEDIUM  
**Status:** RESOLVED  
**Fixed part:**
- `src/api/v1/routers/finances.py` (`cash-received` queries rewritten to static SQL with parameterized flags)
- `src/api/v1/routers/dictionary.py` (`cities` query removed dynamic SQL fragment)
- `src/api/v1/routers/reports.py` (all flagged dynamic SQL blocks rewritten to static parameterized queries)

### Verification
- Bandit `B608` findings in `reports.py`: `0` (see `security-work/bandit-report-after-final-hardening.json`)

---

## 4) Missing explicit Content-Security-Policy header
**Severity:** MEDIUM  
**Status:** RESOLVED  
**Fixed in:** `src/core/middleware.py`

### Resolution
Added `Content-Security-Policy` and `Permissions-Policy` headers in security middleware.

---

## 5) Broad `except` with silent `pass`
**Severity:** LOW  
**Status:** RESOLVED  
**Fixed in:** `src/api/v1/routers/operations.py`

### Resolution
Replaced `except/pass` with explicit warning log preserving non-blocking behavior.

---

## Additional Security Verification
- `pip-audit`: clean
  - `security-work/pip-audit-report.json`
  - `security-work/pip-audit-report-after-fixes.json`
- Security-focused tests: `12 passed`
  - `tests/test_rate_limit.py`
  - `tests/test_cors_security_headers.py`
  - `tests/test_sql_injection_guards.py`
  - `tests/unit/test_security.py`
