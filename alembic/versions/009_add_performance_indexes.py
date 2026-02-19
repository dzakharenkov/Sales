"""add performance indexes

Revision ID: 009_add_performance_indexes
Revises: 008_add_test_cities_territories
Create Date: 2026-02-19 23:59:00
"""

from __future__ import annotations

from typing import TypedDict, Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "009_add_performance_indexes"
down_revision: Union[str, Sequence[str], None] = "008_add_test_cities_territories"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


class IndexSpec(TypedDict):
    table: str
    name: str
    create_sql: str
    equivalent_names: tuple[str, ...]
    equivalent_token_sets: tuple[tuple[str, ...], ...]


INDEXES: tuple[IndexSpec, ...] = (
    {
        "table": "customers",
        "name": "idx_customers_login_agent",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_login_agent
            ON "Sales".customers(login_agent)
            WHERE login_agent IS NOT NULL
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "customers",
        "name": "idx_customers_login_expeditor",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_login_expeditor
            ON "Sales".customers(login_expeditor)
            WHERE login_expeditor IS NOT NULL
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "customers",
        "name": "idx_customers_name_gin",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_name_gin
            ON "Sales".customers
            USING gin(
                to_tsvector(
                    'russian',
                    coalesce(name_client, '') || ' ' || coalesce(firm_name, '')
                )
            )
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (
            ("using gin", "to_tsvector", "name_client", "firm_name"),
        ),
    },
    {
        "table": "orders",
        "name": "idx_orders_customer_status",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_status
            ON "Sales".orders(customer_id, status_code)
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "orders",
        "name": "idx_orders_delivery_date",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_delivery_date
            ON "Sales".orders(scheduled_delivery_at)
            WHERE scheduled_delivery_at IS NOT NULL
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "orders",
        "name": "idx_orders_order_date",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_date
            ON "Sales".orders(order_date DESC)
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "operations",
        "name": "idx_operations_warehouse_from",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_operations_warehouse_from
            ON "Sales".operations(warehouse_from, created_at DESC)
            WHERE warehouse_from IS NOT NULL
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "operations",
        "name": "idx_operations_created_by_date",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_operations_created_by_date
            ON "Sales".operations(created_by, created_at DESC)
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "customers_visits",
        "name": "idx_visits_date_responsible",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_date_responsible
            ON "Sales".customers_visits(visit_date, responsible_login)
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "customers_visits",
        "name": "idx_visits_customer_id",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_visits_customer_id
            ON "Sales".customers_visits(customer_id, visit_date DESC)
        """,
        "equivalent_names": ("idx_customers_visits_customer_date",),
        "equivalent_token_sets": (("customer_id", "visit_date desc"),),
    },
    {
        "table": "warehouse_stock",
        "name": "idx_stock_warehouse_code",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_warehouse_code
            ON "Sales".warehouse_stock(warehouse_code)
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "warehouse_stock",
        "name": "idx_stock_warehouse_product",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_warehouse_product
            ON "Sales".warehouse_stock(warehouse_code, product_code)
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
    {
        "table": "customer_photo",
        "name": "idx_photos_customer_id",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_photos_customer_id
            ON "Sales".customer_photo(customer_id)
        """,
        "equivalent_names": ("idx_customer_photo_customer_id",),
        "equivalent_token_sets": (("customer_id",),),
    },
    {
        "table": "batches",
        "name": "idx_batches_expiry",
        "create_sql": """
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batches_expiry
            ON "Sales".batches(expiry_date)
            WHERE expiry_date IS NOT NULL
        """,
        "equivalent_names": (),
        "equivalent_token_sets": (),
    },
)


def _normalize(text: str) -> str:
    return " ".join(text.lower().split())


def _load_table_indexes(bind: sa.Connection, table: str) -> list[tuple[str, str]]:
    rows = bind.execute(
        sa.text(
            """
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'Sales' AND tablename = :table_name
            """
        ),
        {"table_name": table},
    ).mappings()
    return [(row["indexname"], _normalize(row["indexdef"])) for row in rows]


def _table_exists(bind: sa.Connection, table: str) -> bool:
    return bool(
        bind.execute(
            sa.text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'Sales' AND table_name = :table_name
                )
                """
            ),
            {"table_name": table},
        ).scalar()
    )


def _has_equivalent(existing: list[tuple[str, str]], spec: IndexSpec) -> bool:
    existing_by_name = {name for name, _ in existing}
    if spec["name"] in existing_by_name:
        return True
    if any(index_name in existing_by_name for index_name in spec["equivalent_names"]):
        return True

    for _, indexdef in existing:
        for token_set in spec["equivalent_token_sets"]:
            if all(token in indexdef for token in token_set):
                return True
    return False


def upgrade() -> None:
    bind = op.get_bind()
    existing_by_table: dict[str, list[tuple[str, str]]] = {}

    with op.get_context().autocommit_block():
        for spec in INDEXES:
            if not _table_exists(bind, spec["table"]):
                continue

            if spec["table"] not in existing_by_table:
                existing_by_table[spec["table"]] = _load_table_indexes(bind, spec["table"])

            if _has_equivalent(existing_by_table[spec["table"]], spec):
                continue

            op.execute(sa.text(spec["create_sql"]))
            existing_by_table[spec["table"]] = _load_table_indexes(bind, spec["table"])


def downgrade() -> None:
    with op.get_context().autocommit_block():
        for spec in reversed(INDEXES):
            op.execute(sa.text(f'DROP INDEX CONCURRENTLY IF EXISTS "Sales".{spec["name"]}'))
