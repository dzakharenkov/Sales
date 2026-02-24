"""Seed missing orders UI i18n keys

Revision ID: 040_orders_i18n_keys
Revises: 039_tg_processing_key
Create Date: 2026-02-22 18:05:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "040_orders_i18n_keys"
down_revision: Union[str, Sequence[str], None] = "039_tg_processing_key"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("ui.orders.title", "ru", "Заказы", "menu"),
    ("ui.orders.title", "uz", "Buyurtmalar", "menu"),
    ("ui.orders.title", "en", "Orders", "menu"),

    ("ui.orders.search_title", "ru", "Поиск заказов", "fields"),
    ("ui.orders.search_title", "uz", "Buyurtmalar qidiruvi", "fields"),
    ("ui.orders.search_title", "en", "Orders search", "fields"),

    ("ui.orders.none", "ru", "Заказов не найдено", "messages"),
    ("ui.orders.none", "uz", "Buyurtmalar topilmadi", "messages"),
    ("ui.orders.none", "en", "No orders found", "messages"),

    ("ui.orders.load", "ru", "Загрузить заказы", "buttons"),
    ("ui.orders.load", "uz", "Buyurtmalarni yuklash", "buttons"),
    ("ui.orders.load", "en", "Load orders", "buttons"),

    ("field.order_no", "ru", "Номер заказа", "fields"),
    ("field.order_no", "uz", "Buyurtma raqami", "fields"),
    ("field.order_no", "en", "Order number", "fields"),

    ("field.status_delivery_at", "ru", "Перевод в статус «Доставка»", "fields"),
    ("field.status_delivery_at", "uz", "\"Yetkazib berish\" holatiga o'tkazish", "fields"),
    ("field.status_delivery_at", "en", "Moved to status \"Delivery\"", "fields"),

    ("field.closed_at", "ru", "Дата закрытия", "fields"),
    ("field.closed_at", "uz", "Yopilgan sana", "fields"),
    ("field.closed_at", "en", "Closed at", "fields"),
]


def upgrade() -> None:
    conn = op.get_bind()
    query = sa.text(
        '''
        INSERT INTO "Sales".translations
            (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), :key, :lang, :text, :category, 'migration_040', 'migration_040', now(), now())
        ON CONFLICT (translation_key, language_code)
        DO UPDATE SET
            translation_text = EXCLUDED.translation_text,
            category = COALESCE(EXCLUDED.category, "Sales".translations.category),
            updated_by = 'migration_040',
            updated_at = now()
        '''
    )
    for key, lang, text_value, category in ROWS:
        conn.execute(query, {"key": key, "lang": lang, "text": text_value, "category": category})


def downgrade() -> None:
    pass
