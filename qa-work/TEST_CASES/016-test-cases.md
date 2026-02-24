# Test Plan: 016 ? 016-CORS-HARDENING

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. `allow_origins` set to production domain (`https://sales.zakharenkov.ru`) in production
2. `allow_origins` can be configured via environment variable for development flexibility
3. Security headers added: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`
4. Local development still works with `http://localhost:*` allowed
5. Preflight requests (`OPTIONS`) handled correctly

## Executed Checks
1. `pytest tests/ -v --cov=src --cov-report=html --cov-report=term`
2. `mypy src`
3. `flake8 src`
4. `bandit -r src -f json`
5. `safety check --json`

## Global Metrics Snapshot
- Pytest: 61 passed, 9 skipped
- Coverage: 22%
- mypy errors: 1353
- flake8 issues: 1795
- bandit: 28 findings
- safety: 19 vulnerabilities
