# Task: Configure Alembic Database Migrations

**Task ID:** 005
**Category:** Architecture / Setup
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 6 hours
**Dependencies:** 001, 004

---

## Description

The project has `alembic` in `requirements.txt` but it's not configured. Currently, schema changes are tracked as raw `.sql` files in `/migrations/` with no way to know which migrations have been applied to which environment. This must be replaced with Alembic-managed migrations.

---

## Acceptance Criteria

- [ ] `alembic.ini` created and configured for the `"Sales"` PostgreSQL schema
- [ ] `alembic/env.py` configured with async engine and SQLAlchemy models
- [ ] Initial migration generated from current `models.py` state (baseline)
- [ ] All 7 existing SQL migration files converted to Alembic migrations
- [ ] `alembic upgrade head` runs cleanly on a fresh database
- [ ] `alembic downgrade -1` works for each migration
- [ ] Migration commands documented in README or TASKS overview

---

## Technical Details

### Initialize Alembic

```bash
cd d:/Python/Sales
alembic init -t async alembic
```

This creates:
```
alembic/
├── env.py          # Migration environment
├── script.py.mako  # Template for migration files
└── versions/       # Migration files
alembic.ini         # Config file
```

### Configure `alembic.ini`

```ini
[alembic]
script_location = alembic
sqlalchemy.url = # Leave empty — set in env.py from environment variable

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### Configure `alembic/env.py` (async version)

```python
import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from dotenv import load_dotenv

# Import your models so Alembic can detect changes
from src.database.models import Base

load_dotenv()

config = context.config
config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        version_table_schema="Sales",  # Store alembic_version in Sales schema
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=True,
        version_table_schema="Sales",
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### Generate Initial Baseline Migration

```bash
# Mark current DB state as the starting point:
alembic revision --autogenerate -m "initial_schema_baseline"
# Review generated file, adjust if needed
alembic stamp head  # Mark current DB as up-to-date without running
```

### Convert Existing SQL Migrations

For each file in `/migrations/`, create a corresponding Alembic migration:

```python
# alembic/versions/002_add_cities_territories.py
def upgrade() -> None:
    op.create_table(
        "cities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        schema="Sales",
    )
    # ... rest of the migration

def downgrade() -> None:
    op.drop_table("cities", schema="Sales")
```

### Order of Alembic migrations:
1. `001_initial_schema_baseline.py` — current `sales_sql.sql` state
2. `002_add_cities_territories_menu.py`
3. `003_add_city_territory_refs.py`
4. `004_add_missing_submenu_items.py`
5. `005_add_photo_datetime.py`
6. `006_add_telegram_tables.py`
7. `007_role_menu_access.py`
8. `008_add_test_cities_territories.py` (only for dev/test)

### Useful Commands (add to README)

```bash
# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>

# Show current version
alembic current

# Show migration history
alembic history --verbose

# Auto-generate migration from model changes
alembic revision --autogenerate -m "description_of_change"

# Show SQL without executing
alembic upgrade head --sql
```

---

## Testing Requirements

- Drop and recreate the test database, run `alembic upgrade head` — must complete without errors
- Run `alembic downgrade base` then `alembic upgrade head` — must round-trip cleanly
- After adding a new model column, run `alembic revision --autogenerate` — must detect the change
- Verify `alembic_version` table exists in `"Sales"` schema after first run

---

## Related Documentation

- [ARCHITECTURE.md — Dependencies](../ARCHITECTURE.md)
- [TECHNICAL_DESIGN.md — Database Design](../TECHNICAL_DESIGN.md)

---

## Notes

- The `include_schemas=True` and `version_table_schema="Sales"` are critical for the schema-qualified setup
- Do NOT run `alembic revision --autogenerate` against production without reviewing the generated SQL first
- Once Alembic is set up, delete the raw `/migrations/*.sql` files or move them to an archive folder
