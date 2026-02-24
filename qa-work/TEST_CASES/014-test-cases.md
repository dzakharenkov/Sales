# Test Plan: 014 ? 014-TEST-SUITE

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. `pytest` runs without errors from project root
2. Test database isolated from production (separate `.env.test`)
3. Unit tests for `security.py` (password hashing, JWT)
4. Unit tests for all Pydantic schema validation
5. API integration tests for auth endpoints (login, me, config)
6. API integration tests for customers CRUD
7. API integration tests for orders CRUD
8. API integration tests for role-based access control
9. Test coverage >= 50% measured with `pytest-cov`
10. All tests pass in CI (see Task 036)
11. Tests use fixtures for DB setup/teardown

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
