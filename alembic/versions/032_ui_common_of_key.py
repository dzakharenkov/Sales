"""Add ui.common.of translation key

Revision ID: 032_ui_common_of
Revises: 031_ui_customers_i18n
Create Date: 2026-02-22 02:45:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "032_ui_common_of"
down_revision: Union[str, Sequence[str], None] = "031_ui_customers_i18n"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    rows = [
        ("ui.common.of", "ru", "из", "messages"),
        ("ui.common.of", "uz", "dan", "messages"),
        ("ui.common.of", "en", "of", "messages"),
    ]
    for key, lang, text, category in rows:
        conn.execute(
            sa.text(
                """
                INSERT INTO "Sales".translations
                    (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
                VALUES
                    (gen_random_uuid(), :key, :lang, :text, :category, 'migration_032', 'migration_032', now(), now())
                ON CONFLICT (translation_key, language_code)
                DO UPDATE SET
                    translation_text = EXCLUDED.translation_text,
                    category = COALESCE(EXCLUDED.category, "Sales".translations.category),
                    updated_by = 'migration_032',
                    updated_at = now()
                """
            ),
            {"key": key, "lang": lang, "text": text, "category": category},
        )


def downgrade() -> None:
    pass

