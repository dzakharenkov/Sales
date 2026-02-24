"""fix ru header button labels

Revision ID: 022_fix_header_ru_buttons
Revises: 021_fix_ru_mojibake
Create Date: 2026-02-21 14:00:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = "022_fix_header_ru_buttons"
down_revision: Union[str, Sequence[str], None] = "021_fix_ru_mojibake"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE "Sales".translations
        SET
          translation_text = CASE
            WHEN translation_key = 'button.about' THEN convert_from(decode('d09e20d181d0b8d181d182d0b5d0bcd0b5', 'hex'), 'UTF8')
            WHEN translation_key = 'button.logout' THEN convert_from(decode('d092d18bd0b9d182d0b8', 'hex'), 'UTF8')
            ELSE translation_text
          END,
          updated_at = now(),
          updated_by = 'migration_022'
        WHERE language_code = 'ru'
          AND translation_key IN ('button.about', 'button.logout');
        """
    )


def downgrade() -> None:
    pass
