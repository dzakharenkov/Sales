"""Add translation management UI labels

Revision ID: 034_translations_ui_labels
Revises: 033_fix_customers_i18n
Create Date: 2026-02-22 05:00:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "034_translations_ui_labels"
down_revision: Union[str, Sequence[str], None] = "033_fix_customers_i18n"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("ui.translations.title", "ru", "??????????: ????????", "messages"),
    ("ui.translations.title", "uz", "Ma'lumotnoma: Tarjimalar", "messages"),
    ("ui.translations.title", "en", "References: Translations", "messages"),
    ("ui.translations.key_contains", "ru", "???? ????????...", "messages"),
    ("ui.translations.key_contains", "uz", "Kalitda bor...", "messages"),
    ("ui.translations.key_contains", "en", "Key contains...", "messages"),
    ("ui.translations.all_languages", "ru", "??? ?????", "messages"),
    ("ui.translations.all_languages", "uz", "Barcha tillar", "messages"),
    ("ui.translations.all_languages", "en", "All languages", "messages"),
    ("ui.translations.all_translations", "ru", "??? ????????", "messages"),
    ("ui.translations.all_translations", "uz", "Barcha tarjimalar", "messages"),
    ("ui.translations.all_translations", "en", "All translations", "messages"),
    ("ui.translations.telegram_translations", "ru", "???????? Telegram", "messages"),
    ("ui.translations.telegram_translations", "uz", "Telegram tarjimalari", "messages"),
    ("ui.translations.telegram_translations", "en", "Telegram translations", "messages"),
    ("ui.translations.quality", "ru", "????????", "messages"),
    ("ui.translations.quality", "uz", "Sifat", "messages"),
    ("ui.translations.quality", "en", "Quality", "messages"),
    ("ui.translations.missing_by_language_set", "ru", "????? ? ???????? ??????? ??????", "messages"),
    ("ui.translations.missing_by_language_set", "uz", "To'liq bo'lmagan tillar to'plamidagi kalitlar", "messages"),
    ("ui.translations.missing_by_language_set", "en", "Missing keys by language set", "messages"),
    ("ui.translations.no_data", "ru", "???????? ?? ???????.", "messages"),
    ("ui.translations.no_data", "uz", "Tarjimalar topilmadi.", "messages"),
    ("ui.translations.no_data", "en", "No translations.", "messages"),
    ("ui.translations.failed_load", "ru", "?? ??????? ????????? ????????.", "messages"),
    ("ui.translations.failed_load", "uz", "Tarjimalarni yuklab bo'lmadi.", "messages"),
    ("ui.translations.failed_load", "en", "Failed to load translations.", "messages"),
    ("ui.translations.add_title", "ru", "???????? ???????", "messages"),
    ("ui.translations.add_title", "uz", "Tarjima qo'shish", "messages"),
    ("ui.translations.add_title", "en", "Add translation", "messages"),
    ("ui.translations.edit_title", "ru", "????????????? ???????", "messages"),
    ("ui.translations.edit_title", "uz", "Tarjimani tahrirlash", "messages"),
    ("ui.translations.edit_title", "en", "Edit translation", "messages"),
    ("ui.translations.delete_confirm", "ru", "??????? ????????", "messages"),
    ("ui.translations.delete_confirm", "uz", "Tarjimani o'chirasizmi?", "messages"),
    ("ui.translations.delete_confirm", "en", "Delete translation?", "messages"),
    ("ui.translations.delete_failed", "ru", "?? ??????? ??????? ???????", "messages"),
    ("ui.translations.delete_failed", "uz", "Tarjimani o'chirib bo'lmadi", "messages"),
    ("ui.translations.delete_failed", "en", "Delete failed", "messages"),
    ("label.key", "ru", "????", "fields"),
    ("label.key", "uz", "Kalit", "fields"),
    ("label.key", "en", "Key", "fields"),
    ("label.lang", "ru", "????", "fields"),
    ("label.lang", "uz", "Til", "fields"),
    ("label.lang", "en", "Lang", "fields"),
    ("label.text", "ru", "?????", "fields"),
    ("label.text", "uz", "Matn", "fields"),
    ("label.text", "en", "Text", "fields"),
    ("label.notes", "ru", "??????????", "fields"),
    ("label.notes", "uz", "Izohlar", "fields"),
    ("label.notes", "en", "Notes", "fields"),
    ("label.keys", "ru", "?????", "fields"),
    ("label.keys", "uz", "Kalitlar", "fields"),
    ("label.keys", "en", "Keys", "fields"),
]


def upgrade() -> None:
    conn = op.get_bind()
    query = sa.text(
        """
        INSERT INTO "Sales".translations
            (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), :key, :lang, :text, :category, 'migration_034', 'migration_034', now(), now())
        ON CONFLICT (translation_key, language_code)
        DO UPDATE SET
            translation_text = EXCLUDED.translation_text,
            category = COALESCE(EXCLUDED.category, "Sales".translations.category),
            updated_by = 'migration_034',
            updated_at = now()
        """
    )
    for key, lang, text, category in ROWS:
        conn.execute(query, {"key": key, "lang": lang, "text": text, "category": category})


def downgrade() -> None:
    pass
