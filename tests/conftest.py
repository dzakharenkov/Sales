from __future__ import annotations

from pathlib import Path
from uuid import uuid4

import pytest
import pytest_asyncio
from dotenv import dotenv_values
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncSession, create_async_engine

from src.core.security import hash_password
from src.database.connection import get_db_session
from src.main import app


def _normalize_database_url(raw_url: str) -> str:
    if raw_url.startswith("postgresql+psycopg://"):
        return raw_url.replace("postgresql+psycopg://", "postgresql+asyncpg://", 1)
    if raw_url.startswith("postgresql://"):
        return raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return raw_url


def _load_test_database_url() -> str | None:
    env_file = Path(__file__).parent / ".env.test"
    env_values = dotenv_values(env_file)
    raw = env_values.get("TEST_DATABASE_URL") or env_values.get("DATABASE_URL")
    if raw is None:
        return None
    raw = str(raw).strip()
    return raw or None


def _validate_test_database_url(raw_url: str) -> str:
    db_name = (make_url(raw_url).database or "").lower()
    if "test" not in db_name:
        raise RuntimeError(
            f"Unsafe TEST_DATABASE_URL: database name '{db_name}' does not contain 'test'."
        )
    return _normalize_database_url(raw_url)


@pytest.fixture(scope="session")
def test_database_url() -> str:
    raw_url = _load_test_database_url()
    if raw_url is None:
        pytest.skip("tests/.env.test is missing TEST_DATABASE_URL or DATABASE_URL for integration tests.")
    try:
        return _validate_test_database_url(raw_url)
    except RuntimeError as exc:
        pytest.skip(str(exc))
    raise AssertionError("unreachable")


@pytest_asyncio.fixture(scope="session")
async def test_engine(test_database_url: str):
    engine = create_async_engine(test_database_url, pool_pre_ping=True, future=True)
    required_tables = {"users", "customers", "orders"}
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            rows = await conn.execute(
                text(
                    """
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'Sales'
                    """
                )
            )
            existing = {row[0] for row in rows}
            missing = sorted(required_tables - existing)
            if missing:
                pytest.skip(
                    "Integration schema is incomplete in test DB. Missing: " + ", ".join(missing)
                )
    except Exception as exc:
        pytest.skip(f"Integration DB is unavailable: {exc}")

    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_connection(test_engine) -> AsyncConnection:
    async with test_engine.connect() as connection:
        transaction = await connection.begin()
        try:
            yield connection
        finally:
            await transaction.rollback()


@pytest_asyncio.fixture
async def db_session(db_connection: AsyncConnection) -> AsyncSession:
    session = AsyncSession(bind=db_connection, expire_on_commit=False)
    try:
        yield session
    finally:
        await session.close()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    async def override_get_db_session():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> dict[str, str]:
    login = f"test_admin_{uuid4().hex[:8]}"
    password = "TestPass123!"
    await db_session.execute(
        text(
            """
            INSERT INTO "Sales".users (login, fio, role, password, status)
            VALUES (:login, :fio, :role, :password, :status)
            """
        ),
        {
            "login": login,
            "fio": "Test Admin",
            "role": "admin",
            "password": hash_password(password),
            "status": "активен",
        },
    )
    await db_session.flush()
    return {"login": login, "password": password}


@pytest_asyncio.fixture
async def agent_user(db_session: AsyncSession) -> dict[str, str]:
    login = f"test_agent_{uuid4().hex[:8]}"
    password = "TestPass123!"
    await db_session.execute(
        text(
            """
            INSERT INTO "Sales".users (login, fio, role, password, status)
            VALUES (:login, :fio, :role, :password, :status)
            """
        ),
        {
            "login": login,
            "fio": "Test Agent",
            "role": "agent",
            "password": hash_password(password),
            "status": "активен",
        },
    )
    await db_session.flush()
    return {"login": login, "password": password}


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient, admin_user: dict[str, str]) -> str:
    response = await client.post("/api/v1/auth/login", json=admin_user)
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


@pytest_asyncio.fixture
async def agent_token(client: AsyncClient, agent_user: dict[str, str]) -> str:
    response = await client.post("/api/v1/auth/login", json=agent_user)
    assert response.status_code == 200, response.text
    return response.json()["access_token"]
