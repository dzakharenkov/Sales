"""add test cities and territories

Revision ID: 008_add_test_cities_territories
Revises: 007_add_telegram_tables
Create Date: 2026-02-19 23:57:00
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "008_add_test_cities_territories"
down_revision: Union[str, Sequence[str], None] = "007_add_telegram_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS "Sales".cities (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "Sales".territories (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'city_id') THEN
                ALTER TABLE "Sales".customers ADD COLUMN city_id INTEGER REFERENCES "Sales".cities(id);
            END IF;

            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'territory_id') THEN
                ALTER TABLE "Sales".customers ADD COLUMN territory_id INTEGER REFERENCES "Sales".territories(id);
            END IF;
        END $$;

        INSERT INTO "Sales".cities (name, is_active) VALUES
            ('Ташкент', TRUE),
            ('Самарканд', TRUE)
        ON CONFLICT (name) DO NOTHING;

        INSERT INTO "Sales".territories (name, is_active) VALUES
            ('Центральный район', TRUE),
            ('Северный район', TRUE)
        ON CONFLICT (name) DO NOTHING;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".territories
        WHERE name IN ('Центральный район', 'Северный район');
        DELETE FROM "Sales".cities
        WHERE name IN ('Ташкент', 'Самарканд');
        """
    )

