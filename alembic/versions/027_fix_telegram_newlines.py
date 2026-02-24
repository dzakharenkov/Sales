"""Normalize escaped newlines in telegram translations

Revision ID: 027_fix_telegram_newlines
Revises: 026_fill_remaining_ui_labels
Create Date: 2026-02-21 23:35:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "027_fix_telegram_newlines"
down_revision: Union[str, Sequence[str], None] = "026_fill_remaining_ui_labels"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
            UPDATE "Sales".translations
            SET
                translation_text = replace(translation_text, E'\\\\n', E'\n'),
                updated_by = 'migration_027',
                updated_at = now()
            WHERE translation_key LIKE 'telegram.%'
              AND translation_text LIKE '%\\n%'
            """
        )
    )


def downgrade() -> None:
    pass
