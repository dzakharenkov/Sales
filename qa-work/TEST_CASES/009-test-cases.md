# Test Plan: 009 ? 009-SETTINGS-MODULE

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. Single `src/core/config.py` file with all application settings
2. `pydantic-settings` `BaseSettings` class used (fails fast on missing required vars)
3. All existing `os.getenv()` calls in the codebase replaced with `settings.field_name`
4. `.env.example` updated to list all settings with descriptions
5. Application fails to start with clear error if required settings are missing
6. Settings are validated at startup (not lazily at first use)

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
