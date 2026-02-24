"""ensure admin access for translations menu

Revision ID: 014_translations_menu_admin
Revises: 013_finalize_translations
Create Date: 2026-02-21 01:50:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = "014_translations_menu_admin"
down_revision: Union[str, Sequence[str], None] = "013_finalize_translations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        DECLARE
          translations_id INT;
        BEGIN
          SELECT id INTO translations_id FROM "Sales".menu_items WHERE code = 'ref_translations';
          IF translations_id IS NULL THEN
            RETURN;
          END IF;

          INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
          VALUES ('admin', translations_id, 'full')
          ON CONFLICT (role, menu_item_id) DO UPDATE SET access_level = EXCLUDED.access_level;
        END $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".role_menu_access
        WHERE role = 'admin'
          AND menu_item_id IN (SELECT id FROM "Sales".menu_items WHERE code = 'ref_translations');
        """
    )
