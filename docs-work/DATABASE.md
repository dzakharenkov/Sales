# Database Notes

## Engine
- PostgreSQL
- SQLAlchemy async engine (`postgresql+asyncpg`)
- Session factory: `async_sessionmaker`

## Configuration
- Required env: `DATABASE_URL`
- Runtime URL normalization supports `postgresql://` and converts to `postgresql+asyncpg://`.

## Schema
- Active schema in queries: `"Sales"`
- Migrations: `alembic/versions/`

## Task 001 Impact
- No schema/table changes.
- Security change only: removed hardcoded database credential fallbacks.

