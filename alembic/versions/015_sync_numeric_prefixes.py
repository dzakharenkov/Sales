"""sync numeric prefixes from ru to en/uz translations

Revision ID: 015_sync_numeric_prefixes
Revises: 014_translations_menu_admin
Create Date: 2026-02-21 02:30:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = "015_sync_numeric_prefixes"
down_revision: Union[str, Sequence[str], None] = "014_translations_menu_admin"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        WITH ru_prefix AS (
          SELECT
            translation_key,
            substring(translation_text from '^\\s*([0-9]+\\.)\\s+') AS num_prefix
          FROM "Sales".translations
          WHERE language_code = 'ru'
            AND translation_text ~ '^\\s*[0-9]+\\.\\s+'
        )
        UPDATE "Sales".translations t
        SET
          translation_text = rp.num_prefix || ' ' || regexp_replace(t.translation_text, '^\\s*[0-9]+\\.\\s*', ''),
          updated_at = now(),
          updated_by = 'migration_015'
        FROM ru_prefix rp
        WHERE t.translation_key = rp.translation_key
          AND t.language_code IN ('en', 'uz')
          AND rp.num_prefix IS NOT NULL
          AND substring(t.translation_text from '^\\s*([0-9]+\\.)\\s+') IS DISTINCT FROM rp.num_prefix
        """
    )


def downgrade() -> None:
    op.execute(
        """
        UPDATE "Sales".translations
        SET
          translation_text = regexp_replace(translation_text, '^\\s*[0-9]+\\.\\s*', ''),
          updated_at = now(),
          updated_by = 'migration_015_downgrade'
        WHERE updated_by = 'migration_015'
          AND language_code IN ('en', 'uz')
        """
    )
