# Task: Unit & Integration Test Suite

**Task ID:** 014
**Category:** Quality
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 8 hours
**Dependencies:** 010 (code quality tools), 009 (settings module)

---

## Description

The project has only Playwright UI tests that run against the production database. There are no unit tests, no API integration tests, and no isolated test database. This task sets up a proper test infrastructure with pytest, creates a test database, and writes tests for the most critical paths.

---

## Acceptance Criteria

- [x] `pytest` runs without errors from project root
- [x] Test database isolated from production (separate `.env.test`)
- [x] Unit tests for `security.py` (password hashing, JWT)
- [x] Unit tests for all Pydantic schema validation
- [x] API integration tests for auth endpoints (login, me, config)
- [x] API integration tests for customers CRUD
- [x] API integration tests for orders CRUD
- [x] API integration tests for role-based access control
- [x] Test coverage >= 50% measured with `pytest-cov`
- [x] All tests pass in CI (see Task 036)
- [x] Tests use fixtures for DB setup/teardown

---

## Technical Details

### Test Configuration

```
tests/
â”œâ”€â”€ conftest.py           # Shared fixtures
â”œâ”€â”€ .env.test             # Test environment config
â”œâ”€â”€ unit/
â”‚   â”œâ”€â”€ test_security.py
â”‚   â”œâ”€â”€ test_schemas.py
â”‚   â””â”€â”€ test_helpers.py
â”œâ”€â”€ integration/
â”‚   â”œâ”€â”€ test_auth.py
â”‚   â”œâ”€â”€ test_customers.py
â”‚   â”œâ”€â”€ test_orders.py
â”‚   â”œâ”€â”€ test_access_control.py
â”‚   â””â”€â”€ test_operations.py
â””â”€â”€ README.md             # (existing, update with new instructions)
```

### Test Environment Setup

```env
# tests/.env.test
DATABASE_URL=postgresql+asyncpg://postgres:testpass@localhost:5432/sds_test
JWT_SECRET_KEY=test-secret-key-minimum-32-characters-long
TELEGRAM_BOT_TOKEN=test-token-not-real
SENTRY_ENABLED=false
LOG_LEVEL=WARNING
```

### `tests/conftest.py`

```python
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from src.main import app
from src.database.connection import get_db
from src.database.models import Base

# Use .env.test
import os
os.environ["ENV_FILE"] = "tests/.env.test"

TEST_DATABASE_URL = os.environ["DATABASE_URL"]

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    # Drop all tables after tests
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db_session(test_engine):
    """Provide a fresh DB session per test with automatic rollback."""
    async with AsyncSession(test_engine) as session:
        async with session.begin():
            yield session
            await session.rollback()


@pytest.fixture
async def client(db_session):
    """HTTP test client with overridden DB dependency."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture
async def admin_user(db_session):
    """Create test admin user."""
    from src.core.security import hash_password
    from sqlalchemy import text

    await db_session.execute(text("""
        INSERT INTO "Sales".users (login, fio, role, password, status)
        VALUES ('test_admin', 'Test Admin', 'admin', :password, 'Ð°ÐºÑ‚Ð¸Ð²ÐµÐ½')
        ON CONFLICT (login) DO NOTHING
    """), {"password": hash_password("testpass123")})
    return {"login": "test_admin", "password": "testpass123"}


@pytest.fixture
async def admin_token(client, admin_user):
    """Get JWT token for test admin."""
    response = await client.post("/api/v1/auth/login", json=admin_user)
    return response.json()["access_token"]


@pytest.fixture
async def agent_user(db_session):
    from src.core.security import hash_password
    from sqlalchemy import text
    await db_session.execute(text("""
        INSERT INTO "Sales".users (login, fio, role, password, status)
        VALUES ('test_agent', 'Test Agent', 'agent', :password, 'Ð°ÐºÑ‚Ð¸Ð²ÐµÐ½')
        ON CONFLICT (login) DO NOTHING
    """), {"password": hash_password("testpass123")})
    return {"login": "test_agent", "password": "testpass123"}


@pytest.fixture
async def agent_token(client, agent_user):
    response = await client.post("/api/v1/auth/login", json=agent_user)
    return response.json()["access_token"]
```

### `tests/unit/test_security.py`

```python
import pytest
from src.core.security import hash_password, verify_password, create_access_token, decode_access_token


def test_password_hash_and_verify():
    password = "MySecretPass123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("WrongPass", hashed)


def test_jwt_create_and_decode():
    payload = {"sub": "testuser", "role": "admin"}
    token = create_access_token(data=payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "testuser"
    assert decoded["role"] == "admin"


def test_jwt_expired_token():
    from datetime import timedelta
    token = create_access_token(data={"sub": "user"}, expires_delta=timedelta(seconds=-1))
    with pytest.raises(Exception):  # Should raise on expired token
        decode_access_token(token)
```

### `tests/integration/test_auth.py`

```python
import pytest


@pytest.mark.asyncio
async def test_login_success(client, admin_user):
    response = await client.post("/api/v1/auth/login", json=admin_user)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["login"] == "test_admin"
    assert data["user"]["role"] == "admin"
    assert "password" not in data["user"]  # Never expose password


@pytest.mark.asyncio
async def test_login_wrong_password(client, admin_user):
    response = await client.post("/api/v1/auth/login", json={
        "login": admin_user["login"],
        "password": "wrong_password"
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    response = await client.post("/api/v1/auth/login", json={
        "login": "does_not_exist",
        "password": "anything"
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_authenticated(client, admin_token):
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["login"] == "test_admin"


@pytest.mark.asyncio
async def test_me_unauthenticated(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
```

### `tests/integration/test_access_control.py`

```python
@pytest.mark.asyncio
async def test_admin_endpoint_requires_admin(client, agent_token):
    """Agents cannot access admin-only endpoints."""
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {agent_token}"}
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_access_admin_endpoint(client, admin_token):
    response = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
```

### Run Tests

```bash
# All tests:
pytest tests/ -v --cov=src --cov-report=html

# Unit tests only:
pytest tests/unit/ -v

# Integration tests only:
pytest tests/integration/ -v

# With coverage threshold:
pytest tests/ --cov=src --cov-fail-under=50
```

---

## Testing Requirements (Meta)

- All test fixtures clean up after themselves (rollback or drop)
- Tests never modify production database
- Tests run in <60 seconds total
- Coverage report generated at `htmlcov/index.html`

---

## Related Documentation

- [CURRENT_STATE.md â€” Missing Components: Testing](../CURRENT_STATE.md)
- Task 010 (Code quality tools â€” pytest config in pyproject.toml)
- Task 036 (CI/CD â€” runs tests automatically)

