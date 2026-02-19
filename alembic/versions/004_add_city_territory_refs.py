"""add city and territory references

Revision ID: 004_add_city_territory_refs
Revises: 003_add_cities_territories_menu
Create Date: 2026-02-19 23:53:00
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "004_add_city_territory_refs"
down_revision: Union[str, Sequence[str], None] = "003_add_cities_territories_menu"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS "Sales".city CASCADE;
        DROP TABLE IF EXISTS "Sales".territory CASCADE;

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

        ALTER TABLE "Sales".customers
        ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES "Sales".cities(id),
        ADD COLUMN IF NOT EXISTS territory_id INTEGER REFERENCES "Sales".territories(id);

        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'city') THEN
                ALTER TABLE "Sales".customers RENAME COLUMN city TO city_old;
            END IF;

            IF EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'territory') THEN
                ALTER TABLE "Sales".customers RENAME COLUMN territory TO territory_old;
            END IF;
        END $$;

        COMMENT ON TABLE "Sales".cities IS 'Справочник городов';
        COMMENT ON TABLE "Sales".territories IS 'Справочник территорий';
        COMMENT ON COLUMN "Sales".customers.city_id IS 'Ссылка на справочник городов';
        COMMENT ON COLUMN "Sales".customers.territory_id IS 'Ссылка на справочник территорий';
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'city_old') THEN
                ALTER TABLE "Sales".customers RENAME COLUMN city_old TO city;
            END IF;

            IF EXISTS (SELECT 1 FROM information_schema.columns
                       WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'territory_old') THEN
                ALTER TABLE "Sales".customers RENAME COLUMN territory_old TO territory;
            END IF;
        END $$;

        ALTER TABLE "Sales".customers DROP COLUMN IF EXISTS city_id;
        ALTER TABLE "Sales".customers DROP COLUMN IF EXISTS territory_id;
        DROP TABLE IF EXISTS "Sales".cities CASCADE;
        DROP TABLE IF EXISTS "Sales".territories CASCADE;
        """
    )

