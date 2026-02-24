# Test Plan: 003 ? Fix SQL Injection Risks in Raw Queries

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. All `text()` queries use `:param` placeholders, never f-strings with user data
2. All `text()` queries pass params via `.bindparams()` or the `params={}` argument
3. Audit complete — every router file reviewed, findings documented
4. No `f"...{variable}..."` patterns inside `text()` calls remain
5. Search filter inputs (search strings) are properly escaped or parameterized

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
