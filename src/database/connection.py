"""
Подключение к PostgreSQL (async). Конфигурация из .env или значения по умолчанию.
"""
import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Загрузка .env из корня проекта (рабочая директория при запуске - корень)
load_dotenv()

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.pool import NullPool
from sqlalchemy import text

logger = logging.getLogger(__name__)

# Параметры по умолчанию (совпадают с postgres.py)
DEFAULT_HOST = "45.141.76.83"
DEFAULT_PORT = "5433"
DEFAULT_NAME = "localdb"
DEFAULT_USER = "postgres"
DEFAULT_PASSWORD = "!Tesla11"

# Для create_async_engine используем asyncpg (async-драйвер PostgreSQL)
_raw_url = os.getenv(
    "DATABASE_URL",
    f"postgresql://{os.getenv('DATABASE_USER', DEFAULT_USER)}:{os.getenv('DATABASE_PASSWORD', DEFAULT_PASSWORD)}@"
    f"{os.getenv('DATABASE_HOST', DEFAULT_HOST)}:{os.getenv('DATABASE_PORT', DEFAULT_PORT)}/{os.getenv('DATABASE_NAME', DEFAULT_NAME)}",
)
# Поддержка формата postgresql+psycopg в .env — приводим к asyncpg
if "+psycopg" in _raw_url:
    _raw_url = _raw_url.replace("postgresql+psycopg://", "postgresql://", 1)
if not _raw_url.startswith("postgresql+asyncpg"):
    _raw_url = _raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
DATABASE_URL = _raw_url

# NullPool не поддерживает pool_size/max_overflow — убраны
engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("API_DEBUG", "false").lower() == "true",
    future=True,
    pool_pre_ping=True,
    poolclass=NullPool,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db_session():
    """Генератор сессии для эндпоинтов."""
    async with async_session() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error("Database session error: %s", e)
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db():
    """Контекст-менеджер для операций с БД вне эндпоинтов."""
    async with async_session() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error("Database error: %s", e)
            raise
        finally:
            await session.close()


async def test_connection():
    """Проверка подключения к БД."""
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version();"))
            version = result.scalar()
            logger.info("Database connected. PostgreSQL: %s", version)
            return True
    except Exception as e:
        logger.error("Database connection failed: %s", e)
        return False


async def get_schema_info():
    """Список таблиц в схеме Sales."""
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


async def check_data_integrity():
    """Проверка целостности данных."""
    checks = [
        (
            "Orders without customer",
            'SELECT COUNT(*) FROM "Sales".orders WHERE customer_id NOT IN (SELECT id FROM "Sales".customers)',
        ),
        (
            "Items without order",
            'SELECT COUNT(*) FROM "Sales".items WHERE order_id NOT IN (SELECT id FROM "Sales".orders)',
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
        except Exception as e:
            logger.warning("Check %s failed: %s", name, e)


async def cleanup():
    """Закрытие пула при завершении."""
    await engine.dispose()
