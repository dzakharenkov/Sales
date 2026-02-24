"""seed system title translation key

Revision ID: 017_seed_system_title
Revises: 016_seed_menu_telegram_keys
Create Date: 2026-02-21 03:30:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = "017_seed_system_title"
down_revision: Union[str, Sequence[str], None] = "016_seed_menu_telegram_keys"
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
          'migration_017'
        FROM (
          VALUES
            ('app.system_title', 'ru', 'Система управления продажами и дистрибуцией', 'messages'),
            ('app.system_title', 'uz', 'Savdo va distribyutsiyani boshqarish tizimi', 'messages'),
            ('app.system_title', 'en', 'Sales and Distribution Management System', 'messages')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_017'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE translation_key = 'app.system_title'
        """
    )
