"""Add extra telegram button/action keys used in agent/expeditor handlers

Revision ID: 036_tg_buttons_extra
Revises: 035_tg_common_runtime
Create Date: 2026-02-22 06:00:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "036_tg_buttons_extra"
down_revision: Union[str, Sequence[str], None] = "035_tg_common_runtime"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("telegram.agent.visit_mark_done", "ru", "? ???????? ?????????", "telegram"),
    ("telegram.agent.visit_mark_done", "uz", "? Bajarildi deb belgilash", "telegram"),
    ("telegram.agent.visit_mark_done", "en", "? Mark as completed", "telegram"),

    ("telegram.agent.visit_mark_not_done", "ru", "? ???????? ?? ?????????", "telegram"),
    ("telegram.agent.visit_mark_not_done", "uz", "? Bajarilmadi deb belgilash", "telegram"),
    ("telegram.agent.visit_mark_not_done", "en", "? Mark as not completed", "telegram"),

    ("telegram.agent.photos", "ru", "?? ??????????", "telegram"),
    ("telegram.agent.photos", "uz", "?? Suratlar", "telegram"),
    ("telegram.agent.photos", "en", "?? Photos", "telegram"),

    ("telegram.agent.order_checkout", "ru", "? ???????? ?????", "telegram"),
    ("telegram.agent.order_checkout", "uz", "? Buyurtmani rasmiylashtirish", "telegram"),
    ("telegram.agent.order_checkout", "en", "? Checkout order", "telegram"),

    ("telegram.agent.order_add_more", "ru", "? ???????? ???", "telegram"),
    ("telegram.agent.order_add_more", "uz", "? Yana qo'shish", "telegram"),
    ("telegram.agent.order_add_more", "en", "? Add more", "telegram"),

    ("telegram.agent.order_checkout_cart", "ru", "?? ???????? ?????", "telegram"),
    ("telegram.agent.order_checkout_cart", "uz", "?? Buyurtma berish", "telegram"),
    ("telegram.agent.order_checkout_cart", "en", "?? Place order", "telegram"),

    ("telegram.agent.confirm", "ru", "? ???????????", "telegram"),
    ("telegram.agent.confirm", "uz", "? Tasdiqlash", "telegram"),
    ("telegram.agent.confirm", "en", "? Confirm", "telegram"),

    ("telegram.agent.customer_finish", "ru", "? ????????? ????????? ???????", "telegram"),
    ("telegram.agent.customer_finish", "uz", "? Mijoz yaratishni yakunlash", "telegram"),
    ("telegram.agent.customer_finish", "en", "? Finish customer creation", "telegram"),

    ("telegram.agent.back_to_fields", "ru", "?? ????? ? ???? ?????", "telegram"),
    ("telegram.agent.back_to_fields", "uz", "?? Maydonlar menyusiga qaytish", "telegram"),
    ("telegram.agent.back_to_fields", "en", "?? Back to fields menu", "telegram"),

    ("telegram.expeditor.build_route", "ru", "?? ????????? ???????", "telegram"),
    ("telegram.expeditor.build_route", "uz", "?? Marshrutni qurish", "telegram"),
    ("telegram.expeditor.build_route", "en", "?? Build route", "telegram"),

    ("telegram.expeditor.open_in_yandex", "ru", "?? ??????? ? ??????.??????", "telegram"),
    ("telegram.expeditor.open_in_yandex", "uz", "?? Yandex xaritalarda ochish", "telegram"),
    ("telegram.expeditor.open_in_yandex", "en", "?? Open in Yandex Maps", "telegram"),

    ("telegram.expeditor.open_point_in_yandex", "ru", "?? ??????? ? ??????.??????", "telegram"),
    ("telegram.expeditor.open_point_in_yandex", "uz", "?? Yandex xaritalarda ochish", "telegram"),
    ("telegram.expeditor.open_point_in_yandex", "en", "?? Open in Yandex Maps", "telegram"),

    ("telegram.expeditor.deliver_order", "ru", "?? ????????? ?????", "telegram"),
    ("telegram.expeditor.deliver_order", "uz", "?? Buyurtmani yetkazish", "telegram"),
    ("telegram.expeditor.deliver_order", "en", "?? Deliver order", "telegram"),

    ("telegram.expeditor.delivered", "ru", "? ?????????", "telegram"),
    ("telegram.expeditor.delivered", "uz", "? Yetkazildi", "telegram"),
    ("telegram.expeditor.delivered", "en", "? Delivered", "telegram"),

    ("telegram.expeditor.confirm_delivered_yes", "ru", "? ??, ????? ?????????", "telegram"),
    ("telegram.expeditor.confirm_delivered_yes", "uz", "? Ha, tovar yetkazildi", "telegram"),
    ("telegram.expeditor.confirm_delivered_yes", "en", "? Yes, delivered", "telegram"),

    ("telegram.expeditor.confirm_delivered_no_back", "ru", "?? ???, ?????", "telegram"),
    ("telegram.expeditor.confirm_delivered_no_back", "uz", "?? Yo'q, ortga", "telegram"),
    ("telegram.expeditor.confirm_delivered_no_back", "en", "?? No, back", "telegram"),

    ("telegram.expeditor.other_amount", "ru", "?? ?????? ?????", "telegram"),
    ("telegram.expeditor.other_amount", "uz", "?? Boshqa summa", "telegram"),
    ("telegram.expeditor.other_amount", "en", "?? Other amount", "telegram"),
]


def upgrade() -> None:
    conn = op.get_bind()
    query = sa.text(
        """
        INSERT INTO "Sales".translations
            (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), :key, :lang, :text, :category, 'migration_036', 'migration_036', now(), now())
        ON CONFLICT (translation_key, language_code)
        DO UPDATE SET
            translation_text = EXCLUDED.translation_text,
            category = COALESCE(EXCLUDED.category, "Sales".translations.category),
            updated_by = 'migration_036',
            updated_at = now()
        """
    )
    for key, lang, text, category in ROWS:
        conn.execute(query, {"key": key, "lang": lang, "text": text, "category": category})


def downgrade() -> None:
    pass
