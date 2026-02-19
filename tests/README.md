# Test Suite

This project uses `pytest` for unit and integration tests.

## Structure

```text
tests/
  conftest.py
  .env.test
  unit/
  integration/
```

## Test database safety

- Integration tests use `tests/.env.test`.
- `TEST_DATABASE_URL` must point to a database name containing `test`.
- If the URL is missing, unsafe, or unavailable, integration tests are skipped.
- Unit tests still run normally.

## Run tests

```bash
# All tests
pytest tests/ -v

# Unit tests
pytest tests/unit/ -v

# Integration tests
pytest tests/integration/ -v

# Coverage
pytest tests/ --cov=src --cov-report=term-missing --cov-report=html
```

Coverage HTML report is generated in `htmlcov/index.html`.
