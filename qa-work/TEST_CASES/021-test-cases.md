# Test Plan: 021 ? 021-SERVICE-LAYER

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. `src/api/v1/services/` directory created with domain service files
2. `CustomerService` class implemented with all customer business logic
3. `OrderService` class implemented with all order business logic
4. Router files thin: only HTTP parsing, calling service, returning response
5. Service methods are async and take `AsyncSession` as parameter
6. Services are independently unit-testable (no HTTP layer required)
7. All existing API behavior preserved (no functional regressions)

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
