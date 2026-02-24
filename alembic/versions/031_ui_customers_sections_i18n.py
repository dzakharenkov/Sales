"""Seed customers sections UI i18n keys

Revision ID: 031_ui_customers_i18n
Revises: 030_tg_cust_i18n
Create Date: 2026-02-22 02:30:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "031_ui_customers_i18n"
down_revision: Union[str, Sequence[str], None] = "030_tg_cust_i18n"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("field.city", "ru", "Город", "fields"),
    ("field.city", "uz", "Shahar", "fields"),
    ("field.city", "en", "City", "fields"),
    ("field.phone", "ru", "Телефон", "fields"),
    ("field.phone", "uz", "Telefon", "fields"),
    ("field.phone", "en", "Phone", "fields"),
    ("field.landmark", "ru", "Ориентир", "fields"),
    ("field.landmark", "uz", "Mo'ljal", "fields"),
    ("field.landmark", "en", "Landmark", "fields"),
    ("field.category_client", "ru", "Категория клиента", "fields"),
    ("field.category_client", "uz", "Mijoz toifasi", "fields"),
    ("field.category_client", "en", "Customer category", "fields"),
    ("field.status", "ru", "Статус", "fields"),
    ("field.status", "uz", "Holat", "fields"),
    ("field.status", "en", "Status", "fields"),
    ("field.agent_login", "ru", "login агента", "fields"),
    ("field.agent_login", "uz", "Agent login", "fields"),
    ("field.agent_login", "en", "Agent login", "fields"),
    ("ui.customers.map.title", "ru", "Клиенты на карте", "messages"),
    ("ui.customers.map.title", "uz", "Xaritadagi mijozlar", "messages"),
    ("ui.customers.map.title", "en", "Customers on map", "messages"),
    ("ui.customers.map.provider", "ru", "Карта:", "messages"),
    ("ui.customers.map.provider", "uz", "Xarita:", "messages"),
    ("ui.customers.map.provider", "en", "Map:", "messages"),
    ("ui.customers.map.yandex", "ru", "Яндекс.Карты", "messages"),
    ("ui.customers.map.yandex", "uz", "Yandex Maps", "messages"),
    ("ui.customers.map.yandex", "en", "Yandex Maps", "messages"),
    ("ui.customers.map.displayed_prefix", "ru", "Отображено клиентов на карте:", "messages"),
    ("ui.customers.map.displayed_prefix", "uz", "Xaritada ko'rsatilgan mijozlar:", "messages"),
    ("ui.customers.map.displayed_prefix", "en", "Customers shown on map:", "messages"),
    # fix potential mojibake overwrite
    ("field.contact_person", "ru", "Контактное лицо", "fields"),
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
                    (gen_random_uuid(), :key, :lang, :text, :category, 'migration_031', 'migration_031', now(), now())
                ON CONFLICT (translation_key, language_code)
                DO UPDATE SET
                    translation_text = EXCLUDED.translation_text,
                    category = COALESCE(EXCLUDED.category, "Sales".translations.category),
                    updated_by = 'migration_031',
                    updated_at = now()
                """
            ),
            {"key": key, "lang": lang, "text": text, "category": category},
        )


def downgrade() -> None:
    pass

