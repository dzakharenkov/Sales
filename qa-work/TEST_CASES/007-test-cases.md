# Test Plan: 007 ? 007-PYDANTIC-RESPONSE-SCHEMAS

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. Every `GET` endpoint has a `response_model=` parameter
2. Every `POST` endpoint has a `response_model=` parameter
3. Response schemas exclude sensitive fields (password hashes, internal tokens)
4. List endpoints return `list[SchemaType]`
5. A `schemas/` directory created in `src/api/v1/` with one file per domain
6. OpenAPI docs (`/docs`) shows correct response structure for all endpoints
7. No `dict` return types remain â€” always return Pydantic model instances or SQLAlchemy ORM rows that FastAPI can serialize

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
