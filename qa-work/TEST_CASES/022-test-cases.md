# Test Plan: 022 ? 022-ASYNC-PHOTO-UPLOAD

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. `aiofiles` added to `requirements.txt`
2. All `open()` calls in `customer_photos.py` replaced with `await aiofiles.open()`
3. File size limit enforced (max 10MB per photo)
4. File type validation (only JPEG, PNG, WEBP allowed)
5. Cleanup of temp files on upload failure
6. Upload directory created if it doesn't exist (on startup)

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
