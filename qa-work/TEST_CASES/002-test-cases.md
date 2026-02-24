# Test Plan: 002 ? API Rate Limiting

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. `/api/v1/auth/login` is limited to 10 attempts per IP per 10 minutes
2. Blocked IPs receive `HTTP 429 Too Many Requests` with `Retry-After` header
3. General API rate limit: 200 requests per minute per IP for authenticated endpoints
4. Rate limit state stored in-memory (resets on restart — acceptable for current scale)
5. Rate limit headers included in responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

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
