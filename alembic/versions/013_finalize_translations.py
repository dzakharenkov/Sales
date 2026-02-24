"""finalize translations seeds and performance index

Revision ID: 013_finalize_translations
Revises: 012_seed_ui_translations
Create Date: 2026-02-21 01:10:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "013_finalize_translations"
down_revision: Union[str, Sequence[str], None] = "012_seed_ui_translations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        'CREATE INDEX IF NOT EXISTS idx_translations_lang_category_key '
        'ON "Sales".translations (language_code, category, translation_key)'
    )

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
          'migration_013'
        FROM (
          VALUES
            ('operation_type.payment_receipt_from_customer', 'en', 'Payment Receipt from Customer', 'operation_types'),
            ('operation_type.payment_receipt_from_customer', 'uz', 'Mijozdan to''lov qabul qilish', 'operation_types'),
            ('operation_type.cash_handover_from_expeditor', 'en', 'Cash Handover from Expeditor', 'operation_types'),
            ('operation_type.cash_handover_from_expeditor', 'uz', 'Ekspeditordan naqd pul topshirish', 'operation_types')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_013'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE (created_by = 'migration_013' OR updated_by = 'migration_013')
          AND translation_key IN (
            'operation_type.payment_receipt_from_customer',
            'operation_type.cash_handover_from_expeditor'
          )
          AND language_code IN ('en', 'uz')
        """
    )
    op.execute('DROP INDEX IF EXISTS "Sales".idx_translations_lang_category_key')
