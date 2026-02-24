"""Add common runtime telegram texts for agent/expeditor dialogs

Revision ID: 035_tg_common_runtime
Revises: 034_translations_ui_labels
Create Date: 2026-02-22 05:35:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "035_tg_common_runtime"
down_revision: Union[str, Sequence[str], None] = "034_translations_ui_labels"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("telegram.common.choose_date", "ru", "?? ???????? ????:", "telegram"),
    ("telegram.common.choose_date", "uz", "?? Sanani tanlang:", "telegram"),
    ("telegram.common.choose_date", "en", "?? Choose a date:", "telegram"),

    ("telegram.common.select_customer", "ru", "???????? ???????:", "telegram"),
    ("telegram.common.select_customer", "uz", "Mijozni tanlang:", "telegram"),
    ("telegram.common.select_customer", "en", "Select customer:", "telegram"),

    ("telegram.common.customers_not_found_try", "ru", "??????? ?? ???????. ?????????? ?????? ??????:", "telegram"),
    ("telegram.common.customers_not_found_try", "uz", "Mijozlar topilmadi. Boshqa so'rov bilan urinib ko'ring:", "telegram"),
    ("telegram.common.customers_not_found_try", "en", "Customers not found. Try another query:", "telegram"),

    ("telegram.common.no_orders", "ru", "??? ???????.", "telegram"),
    ("telegram.common.no_orders", "uz", "Buyurtmalar yo'q.", "telegram"),
    ("telegram.common.no_orders", "en", "No orders.", "telegram"),

    ("telegram.expeditor.no_orders_for_route", "ru", "??? ??????? ??? ????????.", "telegram"),
    ("telegram.expeditor.no_orders_for_route", "uz", "Marshrut uchun buyurtmalar yo'q.", "telegram"),
    ("telegram.expeditor.no_orders_for_route", "en", "No orders for route.", "telegram"),

    ("telegram.expeditor.route_choose_date", "ru", "?? *??? ???????*\\n\\n???????? ????:", "telegram"),
    ("telegram.expeditor.route_choose_date", "uz", "?? *Mening marshrutim*\\n\\nSanani tanlang:", "telegram"),
    ("telegram.expeditor.route_choose_date", "en", "?? *My route*\\n\\nChoose a date:", "telegram"),

    ("telegram.expeditor.building_route", "ru", "? ????? ???????...", "telegram"),
    ("telegram.expeditor.building_route", "uz", "? Marshrut tuzilmoqda...", "telegram"),
    ("telegram.expeditor.building_route", "en", "? Building route...", "telegram"),

    ("telegram.agent.customer_name_required", "ru", "? ????????? ???? ?? *???????? ???????* (??????? 2 ???????).", "telegram"),
    ("telegram.agent.customer_name_required", "uz", "? Kamida *mijoz nomini* kiriting (kamida 2 belgi).", "telegram"),
    ("telegram.agent.customer_name_required", "en", "? Fill at least *customer name* (minimum 2 chars).", "telegram"),

    ("telegram.agent.product_not_found", "ru", "????? ?? ??????.", "telegram"),
    ("telegram.agent.product_not_found", "uz", "Mahsulot topilmadi.", "telegram"),
    ("telegram.agent.product_not_found", "en", "Product not found.", "telegram"),
]


def upgrade() -> None:
    conn = op.get_bind()
    query = sa.text(
        """
        INSERT INTO "Sales".translations
            (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), :key, :lang, :text, :category, 'migration_035', 'migration_035', now(), now())
        ON CONFLICT (translation_key, language_code)
        DO UPDATE SET
            translation_text = EXCLUDED.translation_text,
            category = COALESCE(EXCLUDED.category, "Sales".translations.category),
            updated_by = 'migration_035',
            updated_at = now()
        """
    )
    for key, lang, text, category in ROWS:
        conn.execute(query, {"key": key, "lang": lang, "text": text, "category": category})


def downgrade() -> None:
    pass
