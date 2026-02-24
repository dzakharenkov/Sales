# Test Plan: 011 ? 011-CITIES-TERRITORIES-API

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. `GET /api/v1/dictionary/cities` returns all cities (id, name, region)
2. `POST /api/v1/dictionary/cities` creates a new city (admin only)
3. `PUT /api/v1/dictionary/cities/{id}` updates city (admin only)
4. `DELETE /api/v1/dictionary/cities/{id}` deletes city (admin only)
5. Same four endpoints for `/territories`
6. `GET /api/v1/dictionary/cities/{id}/territories` returns territories for a city
7. Customer create/update API accepts `city_id` and `territory_id` and validates they exist
8. Frontend dropdowns for city and territory populated from API
9. Telegram bot customer creation flow uses cities/territories selection

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
