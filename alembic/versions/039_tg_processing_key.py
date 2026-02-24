"""Add telegram common processing key

Revision ID: 039_tg_processing_key
Revises: 038_tg_text_fix
Create Date: 2026-02-22 10:15:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "039_tg_processing_key"
down_revision: Union[str, Sequence[str], None] = "038_tg_text_fix"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("telegram.common.processing", "ru", "Обработка...", "telegram"),
    ("telegram.common.processing", "uz", "Qayta ishlanmoqda...", "telegram"),
    ("telegram.common.processing", "en", "Processing...", "telegram"),
]


def upgrade() -> None:
    conn = op.get_bind()
    query = sa.text(
        '''
        INSERT INTO "Sales".translations
            (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), :key, :lang, :text, :category, 'migration_039', 'migration_039', now(), now())
        ON CONFLICT (translation_key, language_code)
        DO UPDATE SET
            translation_text = EXCLUDED.translation_text,
            category = COALESCE(EXCLUDED.category, "Sales".translations.category),
            updated_by = 'migration_039',
            updated_at = now()
        '''
    )
    for key, lang, text_value, category in ROWS:
        conn.execute(query, {"key": key, "lang": lang, "text": text_value, "category": category})


def downgrade() -> None:
    pass
