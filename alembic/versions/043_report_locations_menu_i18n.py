"""add report_locations menu item and i18n keys

Revision ID: 043_report_locations_menu_i18n
Revises: 042_fix_remaining_ru_mojibake
Create Date: 2026-02-26 16:40:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op


revision: str = "043_report_locations_menu_i18n"
down_revision: Union[str, Sequence[str], None] = "042_fix_remaining_ru_mojibake"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade() -> None:
    op.execute(
        """
        INSERT INTO "Sales".menu_items (code, label, icon, url, sort_order, is_active)
        VALUES ('report_locations', 'Локации клиентов', NULL, 'report_locations', 97, TRUE)
        ON CONFLICT (code) DO UPDATE SET
          label = EXCLUDED.label,
          url = EXCLUDED.url,
          sort_order = EXCLUDED.sort_order,
          is_active = EXCLUDED.is_active
        """
    )

    op.execute(
        """
        DO $$
        DECLARE
          report_locations_id INT;
        BEGIN
          SELECT id INTO report_locations_id FROM "Sales".menu_items WHERE code = 'report_locations';
          IF report_locations_id IS NULL THEN
            RETURN;
          END IF;

          INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
          VALUES
            ('admin', report_locations_id, 'full'),
            ('agent', report_locations_id, 'view'),
            ('expeditor', report_locations_id, 'view'),
            ('stockman', report_locations_id, 'view'),
            ('paymaster', report_locations_id, 'view')
          ON CONFLICT (role, menu_item_id) DO UPDATE SET access_level = EXCLUDED.access_level;
        END $$;
        """
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
          'migration_043'
        FROM (
          VALUES
            ('menu.report_locations', 'ru', 'Локации клиентов', 'menu'),
            ('menu.report_locations', 'uz', 'Mijozlar lokatsiyasi', 'menu'),
            ('menu.report_locations', 'en', 'Customer locations', 'menu'),

            ('ui.report.locations.title', 'ru', 'Отчёт: Локации клиентов', 'fields'),
            ('ui.report.locations.title', 'uz', 'Hisobot: Mijozlar lokatsiyasi', 'fields'),
            ('ui.report.locations.title', 'en', 'Report: Customer locations', 'fields')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_043'
        """
    )



def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE translation_key IN ('menu.report_locations', 'ui.report.locations.title')
        """
    )

    op.execute(
        """
        DELETE FROM "Sales".role_menu_access
        WHERE menu_item_id IN (
          SELECT id FROM "Sales".menu_items WHERE code = 'report_locations'
        )
        """
    )

    op.execute(
        """
        DELETE FROM "Sales".menu_items WHERE code = 'report_locations'
        """
    )
