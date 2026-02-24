"""Normalize telegram button/action texts inserted with mojibake

Revision ID: 038_tg_text_fix
Revises: 037_i18n_fix
Create Date: 2026-02-22 10:05:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "038_tg_text_fix"
down_revision: Union[str, Sequence[str], None] = "037_i18n_fix"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("telegram.agent.visit_mark_done", "ru", "Отметить выполненным", "telegram"),
    ("telegram.agent.visit_mark_done", "uz", "Bajarildi deb belgilash", "telegram"),
    ("telegram.agent.visit_mark_done", "en", "Mark as completed", "telegram"),

    ("telegram.agent.visit_mark_not_done", "ru", "Отметить не выполненным", "telegram"),
    ("telegram.agent.visit_mark_not_done", "uz", "Bajarilmadi deb belgilash", "telegram"),
    ("telegram.agent.visit_mark_not_done", "en", "Mark as not completed", "telegram"),

    ("telegram.agent.photos", "ru", "Фотографии", "telegram"),
    ("telegram.agent.photos", "uz", "Suratlar", "telegram"),
    ("telegram.agent.photos", "en", "Photos", "telegram"),

    ("telegram.agent.order_checkout", "ru", "Оформить заказ", "telegram"),
    ("telegram.agent.order_checkout", "uz", "Buyurtmani rasmiylashtirish", "telegram"),
    ("telegram.agent.order_checkout", "en", "Checkout order", "telegram"),

    ("telegram.agent.order_add_more", "ru", "Добавить ещё", "telegram"),
    ("telegram.agent.order_add_more", "uz", "Yana qo'shish", "telegram"),
    ("telegram.agent.order_add_more", "en", "Add more", "telegram"),

    ("telegram.agent.order_checkout_cart", "ru", "Оформить заказ", "telegram"),
    ("telegram.agent.order_checkout_cart", "uz", "Buyurtma berish", "telegram"),
    ("telegram.agent.order_checkout_cart", "en", "Place order", "telegram"),

    ("telegram.agent.confirm", "ru", "Подтвердить", "telegram"),
    ("telegram.agent.confirm", "uz", "Tasdiqlash", "telegram"),
    ("telegram.agent.confirm", "en", "Confirm", "telegram"),

    ("telegram.agent.customer_finish", "ru", "Завершить заведение клиента", "telegram"),
    ("telegram.agent.customer_finish", "uz", "Mijoz yaratishni yakunlash", "telegram"),
    ("telegram.agent.customer_finish", "en", "Finish customer creation", "telegram"),

    ("telegram.agent.back_to_fields", "ru", "Назад к меню полей", "telegram"),
    ("telegram.agent.back_to_fields", "uz", "Maydonlar menyusiga qaytish", "telegram"),
    ("telegram.agent.back_to_fields", "en", "Back to fields menu", "telegram"),

    ("telegram.expeditor.build_route", "ru", "Построить маршрут", "telegram"),
    ("telegram.expeditor.build_route", "uz", "Marshrutni qurish", "telegram"),
    ("telegram.expeditor.build_route", "en", "Build route", "telegram"),

    ("telegram.expeditor.open_in_yandex", "ru", "Открыть в Яндекс.Картах", "telegram"),
    ("telegram.expeditor.open_in_yandex", "uz", "Yandex xaritalarda ochish", "telegram"),
    ("telegram.expeditor.open_in_yandex", "en", "Open in Yandex Maps", "telegram"),

    ("telegram.expeditor.open_point_in_yandex", "ru", "Открыть в Яндекс.Картах", "telegram"),
    ("telegram.expeditor.open_point_in_yandex", "uz", "Yandex xaritalarda ochish", "telegram"),
    ("telegram.expeditor.open_point_in_yandex", "en", "Open in Yandex Maps", "telegram"),

    ("telegram.expeditor.deliver_order", "ru", "Доставить заказ", "telegram"),
    ("telegram.expeditor.deliver_order", "uz", "Buyurtmani yetkazish", "telegram"),
    ("telegram.expeditor.deliver_order", "en", "Deliver order", "telegram"),

    ("telegram.expeditor.delivered", "ru", "Доставлен", "telegram"),
    ("telegram.expeditor.delivered", "uz", "Yetkazildi", "telegram"),
    ("telegram.expeditor.delivered", "en", "Delivered", "telegram"),

    ("telegram.expeditor.confirm_delivered_yes", "ru", "Да, товар доставлен", "telegram"),
    ("telegram.expeditor.confirm_delivered_yes", "uz", "Ha, tovar yetkazildi", "telegram"),
    ("telegram.expeditor.confirm_delivered_yes", "en", "Yes, delivered", "telegram"),

    ("telegram.expeditor.confirm_delivered_no_back", "ru", "Нет, назад", "telegram"),
    ("telegram.expeditor.confirm_delivered_no_back", "uz", "Yo'q, ortga", "telegram"),
    ("telegram.expeditor.confirm_delivered_no_back", "en", "No, back", "telegram"),

    ("telegram.expeditor.other_amount", "ru", "Другая сумма", "telegram"),
    ("telegram.expeditor.other_amount", "uz", "Boshqa summa", "telegram"),
    ("telegram.expeditor.other_amount", "en", "Other amount", "telegram"),

    ("telegram.visit_create.all_correct", "ru", "Всё верно?", "telegram"),
    ("telegram.visit_create.all_correct", "uz", "Hammasi to'g'rimi?", "telegram"),
    ("telegram.visit_create.all_correct", "en", "Is everything correct?", "telegram"),
]


def upgrade() -> None:
    conn = op.get_bind()
    query = sa.text(
        '''
        INSERT INTO "Sales".translations
            (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), :key, :lang, :text, :category, 'migration_038', 'migration_038', now(), now())
        ON CONFLICT (translation_key, language_code)
        DO UPDATE SET
            translation_text = EXCLUDED.translation_text,
            category = COALESCE(EXCLUDED.category, "Sales".translations.category),
            updated_by = 'migration_038',
            updated_at = now()
        '''
    )
    for key, lang, text_value, category in ROWS:
        conn.execute(query, {"key": key, "lang": lang, "text": text_value, "category": category})


def downgrade() -> None:
    pass
