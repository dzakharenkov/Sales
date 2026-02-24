"""Seed additional UI translations for mixed-language screens

Revision ID: 026_fill_remaining_ui_labels
Revises: 025_tg_dialog_i18n
Create Date: 2026-02-21 23:20:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "026_fill_remaining_ui_labels"
down_revision: Union[str, Sequence[str], None] = "025_tg_dialog_i18n"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("field.type", "ru", "Тип", "fields"),
    ("field.type", "uz", "Turi", "fields"),
    ("field.type", "en", "Type", "fields"),

    ("field.customer", "ru", "Клиент", "fields"),
    ("field.customer", "uz", "Mijoz", "fields"),
    ("field.customer", "en", "Customer", "fields"),

    ("field.agent", "ru", "Агент", "fields"),
    ("field.agent", "uz", "Agent", "fields"),
    ("field.agent", "en", "Agent", "fields"),

    ("field.expeditor", "ru", "Экспедитор", "fields"),
    ("field.expeditor", "uz", "Ekspeditor", "fields"),
    ("field.expeditor", "en", "Expeditor", "fields"),

    ("field.price", "ru", "Цена", "fields"),
    ("field.price", "uz", "Narx", "fields"),
    ("field.price", "en", "Price", "fields"),

    ("ui.common.any", "ru", "Любой", "fields"),
    ("ui.common.any", "uz", "Istalgan", "fields"),
    ("ui.common.any", "en", "Any", "fields"),

    ("ui.common.unassigned", "ru", "Не назначен", "fields"),
    ("ui.common.unassigned", "uz", "Tayinlanmagan", "fields"),
    ("ui.common.unassigned", "en", "Unassigned", "fields"),

    ("ui.common.total_amount", "ru", "Итого сумма", "fields"),
    ("ui.common.total_amount", "uz", "Jami summa", "fields"),
    ("ui.common.total_amount", "en", "Total amount", "fields"),

    ("ui.common.shown", "ru", "Показано", "fields"),
    ("ui.common.shown", "uz", "Ko'rsatilgan", "fields"),
    ("ui.common.shown", "en", "Shown", "fields"),

    ("ui.common.all_customers", "ru", "Все клиенты", "fields"),
    ("ui.common.all_customers", "uz", "Barcha mijozlar", "fields"),
    ("ui.common.all_customers", "en", "All customers", "fields"),

    ("ui.orders.saved_search", "ru", "Сохранённый поиск", "fields"),
    ("ui.orders.saved_search", "uz", "Saqlangan qidiruv", "fields"),
    ("ui.orders.saved_search", "en", "Saved search", "fields"),

    ("ui.orders.current_search", "ru", "Текущий поиск", "fields"),
    ("ui.orders.current_search", "uz", "Joriy qidiruv", "fields"),
    ("ui.orders.current_search", "en", "Current search", "fields"),

    ("ui.orders.found_count", "ru", "Найдено заказов", "fields"),
    ("ui.orders.found_count", "uz", "Topilgan buyurtmalar", "fields"),
    ("ui.orders.found_count", "en", "Orders found", "fields"),

    ("ui.order_items.found_count", "ru", "Найдено позиций", "fields"),
    ("ui.order_items.found_count", "uz", "Topilgan pozitsiyalar", "fields"),
    ("ui.order_items.found_count", "en", "Items found", "fields"),

    ("ui.order_items.load", "ru", "Загрузить позиции", "fields"),
    ("ui.order_items.load", "uz", "Pozitsiyalarni yuklash", "fields"),
    ("ui.order_items.load", "en", "Load items", "fields"),

    ("ui.reports.filters_hint", "ru", "Укажите фильтры и нажмите «Показать».", "fields"),
    ("ui.reports.filters_hint", "uz", "Filtrlarni tanlang va «Ko'rsatish» tugmasini bosing.", "fields"),
    ("ui.reports.filters_hint", "en", "Set filters and click Show.", "fields"),

    ("ui.operations.search_hint", "ru", "Укажите критерии поиска и нажмите «Найти» или оставьте поля пустыми и нажмите «Найти» для полного списка.", "fields"),
    ("ui.operations.search_hint", "uz", "Qidiruv mezonlarini kiriting va «Qidirish»ni bosing yoki barcha maydonlarni bo'sh qoldirib to'liq ro'yxatni oling.", "fields"),
    ("ui.operations.search_hint", "en", "Set search criteria and click Find, or leave fields empty and click Find for the full list.", "fields"),

    ("ui.placeholder.order_no", "uz", "Buyurtma raqami", "fields"),
]


def upgrade() -> None:
    conn = op.get_bind()
    for key, lang, text, category in ROWS:
        conn.execute(
            sa.text(
                """
                INSERT INTO "Sales".translations
                    (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
                VALUES
                    (gen_random_uuid(), :key, :lang, :text, :category, 'migration_026', 'migration_026', now(), now())
                ON CONFLICT (translation_key, language_code)
                DO UPDATE SET
                    translation_text = EXCLUDED.translation_text,
                    category = COALESCE(EXCLUDED.category, "Sales".translations.category),
                    updated_by = 'migration_026',
                    updated_at = now()
                """
            ),
            {"key": key, "lang": lang, "text": text, "category": category},
        )


def downgrade() -> None:
    pass
