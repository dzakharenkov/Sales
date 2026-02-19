"""add cities and territories menu items

Revision ID: 003_add_cities_territories_menu
Revises: 002_role_menu_access
Create Date: 2026-02-19 23:52:00
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003_add_cities_territories_menu"
down_revision: Union[str, Sequence[str], None] = "002_role_menu_access"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        SELECT setval(pg_get_serial_sequence('"Sales".menu_items', 'id'),
                      COALESCE((SELECT MAX(id) FROM "Sales".menu_items), 1),
                      true);

        INSERT INTO "Sales".menu_items (code, label, icon, url, sort_order, is_active) VALUES
          ('ref_cities', 'Города', NULL, 'cities', 21, TRUE),
          ('ref_territories', 'Территории', NULL, 'territories', 22, TRUE)
        ON CONFLICT (code) DO UPDATE SET
          label = EXCLUDED.label,
          url = EXCLUDED.url,
          sort_order = EXCLUDED.sort_order,
          is_active = EXCLUDED.is_active;

        DO $$
        DECLARE
          cities_id INT;
          territories_id INT;
        BEGIN
          SELECT id INTO cities_id FROM "Sales".menu_items WHERE code = 'ref_cities';
          SELECT id INTO territories_id FROM "Sales".menu_items WHERE code = 'ref_territories';

          INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
          VALUES ('admin', cities_id, 'full'), ('admin', territories_id, 'full')
          ON CONFLICT (role, menu_item_id) DO UPDATE SET access_level = EXCLUDED.access_level;

          INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
          VALUES
            ('agent', cities_id, 'none'), ('agent', territories_id, 'none'),
            ('expeditor', cities_id, 'none'), ('expeditor', territories_id, 'none'),
            ('stockman', cities_id, 'none'), ('stockman', territories_id, 'none'),
            ('paymaster', cities_id, 'none'), ('paymaster', territories_id, 'none')
          ON CONFLICT (role, menu_item_id) DO UPDATE SET access_level = EXCLUDED.access_level;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".role_menu_access
        WHERE menu_item_id IN (
          SELECT id FROM "Sales".menu_items WHERE code IN ('ref_cities', 'ref_territories')
        );
        DELETE FROM "Sales".menu_items WHERE code IN ('ref_cities', 'ref_territories');
        """
    )

