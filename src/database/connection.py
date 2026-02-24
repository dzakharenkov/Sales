"""
PostgreSQL async connection module. Configuration is loaded only from environment.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.exc import TimeoutError as SQLAlchemyTimeoutError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import AsyncAdaptedQueuePool

from src.core.config import settings

logger = logging.getLogger(__name__)


def _normalize_database_url(raw_url: str) -> str:
    """Normalize URL for SQLAlchemy asyncpg driver."""
    if "+psycopg" in raw_url:
        raw_url = raw_url.replace("postgresql+psycopg://", "postgresql://", 1)
    if not raw_url.startswith("postgresql+asyncpg"):
        raw_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return raw_url


DATABASE_URL = _normalize_database_url(settings.database_url)

DB_POOL_SIZE = 10
DB_MAX_OVERFLOW = 20
DB_POOL_TIMEOUT = 30
DB_POOL_RECYCLE = 1800
DB_RESERVED_CONNECTIONS = 10

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.api_debug,
    future=True,
    pool_pre_ping=True,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=DB_POOL_SIZE,
    max_overflow=DB_MAX_OVERFLOW,
    pool_timeout=DB_POOL_TIMEOUT,
    pool_recycle=DB_POOL_RECYCLE,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db_session():
    """Yield DB session for API endpoints."""
    try:
        async with async_session() as session:
            try:
                yield session
            except HTTPException:
                await session.rollback()
                raise
            except Exception as exc:
                await session.rollback()
                logger.error("Database session error: %s", exc)
                raise
            finally:
                await session.close()
    except SQLAlchemyTimeoutError as exc:
        logger.error("Database pool timeout: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Database temporarily unavailable. Please try again.",
        ) from exc


@asynccontextmanager
async def get_db():
    """Context manager for non-endpoint DB operations."""
    async with async_session() as session:
        try:
            yield session
        except Exception as exc:
            await session.rollback()
            logger.error("Database error: %s", exc)
            raise
        finally:
            await session.close()


async def test_connection() -> bool:
    """Check DB connectivity."""
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version();"))
            version = result.scalar()
            logger.info("Database connected. PostgreSQL: %s", version)
            return True
    except Exception as exc:
        logger.error("Database connection failed: %s", exc)
        return False


async def get_schema_info():
    """Return list of tables in Sales schema."""
    async with engine.begin() as conn:
        result = await conn.execute(
            text(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'Sales'
                ORDER BY table_name;
                """
            )
        )
        tables = result.fetchall()
        logger.info("Tables in Sales schema: %s", [t[0] for t in tables])
        return tables


async def check_data_integrity() -> None:
    """Run basic integrity checks."""
    checks = [
        (
            "Orders without customer",
            'SELECT COUNT(*) FROM "Sales".orders WHERE customer_id NOT IN (SELECT id FROM "Sales".customers)',
        ),
        (
            "Items without order",
            'SELECT COUNT(*) FROM "Sales".items WHERE order_id NOT IN (SELECT order_no FROM "Sales".orders)',
        ),
        (
            "Operations without type",
            'SELECT COUNT(*) FROM "Sales".operations o WHERE o.type_code IS NOT NULL AND o.type_code NOT IN (SELECT code FROM "Sales".operation_types)',
        ),
        (
            "Expired batches",
            'SELECT COUNT(*) FROM "Sales".batches WHERE expiry_date < CURRENT_DATE',
        ),
    ]
    for name, query in checks:
        try:
            async with engine.begin() as conn:
                result = await conn.execute(text(query))
                count = result.scalar()
                logger.info("%s %s: %s", "WARN" if count and count > 0 else "OK", name, count)
        except Exception as exc:
            logger.warning("Check %s failed: %s", name, exc)


async def cleanup() -> None:
    """Close DB resources on shutdown."""
    await engine.dispose()


def log_pool_status() -> None:
    """Log current SQLAlchemy async pool state."""
    logger.info(
        "DB pool: size=%s, checked_out=%s, overflow=%s",
        engine.pool.size(),
        engine.pool.checkedout(),
        engine.pool.overflow(),
    )


async def verify_postgres_max_connections() -> int | None:
    """Return PostgreSQL max_connections and log capacity health."""
    try:
        async with engine.begin() as conn:
            max_connections = await conn.scalar(text("SHOW max_connections"))
            max_connections_int = int(max_connections) if max_connections is not None else None
            if max_connections_int is None:
                return None
            required = DB_POOL_SIZE + DB_MAX_OVERFLOW
            if max_connections_int - DB_RESERVED_CONNECTIONS < required:
                logger.warning(
                    "PostgreSQL max_connections=%s may be too low for pool requirement=%s (reserve=%s).",
                    max_connections_int,
                    required,
                    DB_RESERVED_CONNECTIONS,
                )
            else:
                logger.info(
                    "PostgreSQL max_connections=%s is sufficient for pool requirement=%s.",
                    max_connections_int,
                    required,
                )
            return max_connections_int
    except Exception as exc:
        logger.warning("Could not verify PostgreSQL max_connections: %s", exc)
        return None
