"""seed warehouse receipt weight translation key

Revision ID: 050_wh_receipt_weight_i18n
Revises: 049_add_product_photo_path
Create Date: 2026-03-12 17:20:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op


revision: str = "050_wh_receipt_weight_i18n"
down_revision: Union[str, Sequence[str], None] = "049_add_product_photo_path"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO "Sales".translations
          (id, translation_key, language_code, translation_text, category, created_by)
        SELECT
          md5(random()::text || clock_timestamp()::text)::uuid,
          x.translation_key,
          x.language_code,
          x.translation_text,
          x.category,
          'migration_050'
        FROM (
          VALUES
            ('ui.wh_receipt.form.col_weight', 'ru', 'Вес', 'messages'),
            ('ui.wh_receipt.form.col_weight', 'uz', 'Vazn', 'messages'),
            ('ui.wh_receipt.form.col_weight', 'en', 'Weight', 'messages')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET translation_text = EXCLUDED.translation_text,
            category = EXCLUDED.category,
            updated_at = now(),
            updated_by = 'migration_050'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE translation_key = 'ui.wh_receipt.form.col_weight'
        """
    )
