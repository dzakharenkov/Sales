"""seed ui translations and add translations menu item

Revision ID: 012_seed_ui_translations
Revises: 011_seed_en_uz_translations
Create Date: 2026-02-21 00:20:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "012_seed_ui_translations"
down_revision: Union[str, Sequence[str], None] = "011_seed_en_uz_translations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO "Sales".menu_items (code, label, icon, url, sort_order, is_active)
        VALUES ('ref_translations', 'Переводы', NULL, 'ref_translations', 29, TRUE)
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
          translations_id INT;
        BEGIN
          SELECT id INTO translations_id FROM "Sales".menu_items WHERE code = 'ref_translations';
          IF translations_id IS NULL THEN
            RETURN;
          END IF;

          INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
          VALUES
            ('admin', translations_id, 'full'),
            ('agent', translations_id, 'none'),
            ('expeditor', translations_id, 'none'),
            ('stockman', translations_id, 'none'),
            ('paymaster', translations_id, 'none')
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
          'migration_012'
        FROM (
          VALUES
            ('menu.ref_translations', 'ru', 'Переводы', 'menu'),
            ('menu.ref_translations', 'en', 'Translations', 'menu'),
            ('menu.ref_translations', 'uz', 'Tarjimalar', 'menu'),

            ('button.save', 'ru', 'Сохранить', 'buttons'),
            ('button.save', 'en', 'Save', 'buttons'),
            ('button.save', 'uz', 'Saqlash', 'buttons'),
            ('button.cancel', 'ru', 'Отмена', 'buttons'),
            ('button.cancel', 'en', 'Cancel', 'buttons'),
            ('button.cancel', 'uz', 'Bekor qilish', 'buttons'),
            ('button.delete', 'ru', 'Удалить', 'buttons'),
            ('button.delete', 'en', 'Delete', 'buttons'),
            ('button.delete', 'uz', 'O''chirish', 'buttons'),
            ('button.edit', 'ru', 'Изменить', 'buttons'),
            ('button.edit', 'en', 'Edit', 'buttons'),
            ('button.edit', 'uz', 'Tahrirlash', 'buttons'),
            ('button.create', 'ru', 'Создать', 'buttons'),
            ('button.create', 'en', 'Create', 'buttons'),
            ('button.create', 'uz', 'Yaratish', 'buttons'),
            ('button.search', 'ru', 'Поиск', 'buttons'),
            ('button.search', 'en', 'Search', 'buttons'),
            ('button.search', 'uz', 'Qidirish', 'buttons'),

            ('field.language', 'ru', 'Язык', 'fields'),
            ('field.language', 'en', 'Language', 'fields'),
            ('field.language', 'uz', 'Til', 'fields'),
            ('field.category', 'ru', 'Категория', 'fields'),
            ('field.category', 'en', 'Category', 'fields'),
            ('field.category', 'uz', 'Kategoriya', 'fields'),
            ('field.translation_key', 'ru', 'Ключ перевода', 'fields'),
            ('field.translation_key', 'en', 'Translation Key', 'fields'),
            ('field.translation_key', 'uz', 'Tarjima kaliti', 'fields'),
            ('field.translation_text', 'ru', 'Текст перевода', 'fields'),
            ('field.translation_text', 'en', 'Translation Text', 'fields'),
            ('field.translation_text', 'uz', 'Tarjima matni', 'fields'),
            ('field.notes', 'ru', 'Примечание', 'fields'),
            ('field.notes', 'en', 'Notes', 'fields'),
            ('field.notes', 'uz', 'Izoh', 'fields'),

            ('message.translation_created', 'ru', 'Перевод успешно создан', 'messages'),
            ('message.translation_created', 'en', 'Translation created successfully', 'messages'),
            ('message.translation_created', 'uz', 'Tarjima muvaffaqiyatli yaratildi', 'messages'),
            ('message.translation_updated', 'ru', 'Перевод успешно обновлен', 'messages'),
            ('message.translation_updated', 'en', 'Translation updated successfully', 'messages'),
            ('message.translation_updated', 'uz', 'Tarjima muvaffaqiyatli yangilandi', 'messages'),
            ('message.translation_deleted', 'ru', 'Перевод успешно удален', 'messages'),
            ('message.translation_deleted', 'en', 'Translation deleted successfully', 'messages'),
            ('message.translation_deleted', 'uz', 'Tarjima muvaffaqiyatli o''chirildi', 'messages')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_012'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE created_by = 'migration_012'
           OR updated_by = 'migration_012'
        """
    )
    op.execute(
        """
        DELETE FROM "Sales".role_menu_access
        WHERE menu_item_id IN (
          SELECT id FROM "Sales".menu_items WHERE code = 'ref_translations'
        )
        """
    )
    op.execute('DELETE FROM "Sales".menu_items WHERE code = \'ref_translations\'')
