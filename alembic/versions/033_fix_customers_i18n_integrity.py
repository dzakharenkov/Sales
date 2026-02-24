"""Fix customers UI translation integrity (RU/UZ/EN)

Revision ID: 033_fix_customers_i18n
Revises: 032_ui_common_of
Create Date: 2026-02-22 04:10:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "033_fix_customers_i18n"
down_revision: Union[str, Sequence[str], None] = "032_ui_common_of"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    # Header/common
    ("button.about", "ru", "О системе", "buttons"),
    ("button.about", "uz", "Tizim haqida", "buttons"),
    ("button.about", "en", "About", "buttons"),
    ("button.logout", "ru", "Выйти", "buttons"),
    ("button.logout", "uz", "Chiqish", "buttons"),
    ("button.logout", "en", "Logout", "buttons"),
    ("ui.common.of", "ru", "из", "messages"),
    ("ui.common.of", "uz", "dan", "messages"),
    ("ui.common.of", "en", "of", "messages"),
    ("ui.common.not_selected", "ru", "Не выбрано", "messages"),
    ("ui.common.not_selected", "uz", "Tanlanmagan", "messages"),
    ("ui.common.not_selected", "en", "Not selected", "messages"),
    ("ui.common.unassigned", "ru", "Не назначен", "messages"),
    ("ui.common.unassigned", "uz", "Tayinlanmagan", "messages"),
    ("ui.common.unassigned", "en", "Unassigned", "messages"),
    ("ui.common.all", "ru", "Все", "messages"),
    ("ui.common.all", "uz", "Barchasi", "messages"),
    ("ui.common.all", "en", "All", "messages"),

    # Customers section titles/buttons
    ("ui.customers.title", "ru", "Клиенты", "fields"),
    ("ui.customers.title", "uz", "Mijozlar", "fields"),
    ("ui.customers.title", "en", "Customers", "fields"),
    ("ui.customers.add", "ru", "Добавить клиента", "buttons"),
    ("ui.customers.add", "uz", "Mijoz qoʻshish", "buttons"),
    ("ui.customers.add", "en", "Add customer", "buttons"),
    ("ui.customers.export", "ru", "Скачать в Excel всех клиентов", "buttons"),
    ("ui.customers.export", "uz", "Barcha mijozlarni Excelga yuklash", "buttons"),
    ("ui.customers.export", "en", "Export all customers to Excel", "buttons"),
    ("ui.customers.search", "ru", "Поиск", "fields"),
    ("ui.customers.search", "uz", "Qidiruv", "fields"),
    ("ui.customers.search", "en", "Search", "fields"),
    ("ui.customers.find", "ru", "Найти", "buttons"),
    ("ui.customers.find", "uz", "Qidirish", "buttons"),
    ("ui.customers.find", "en", "Search", "buttons"),
    ("ui.customers.none", "ru", "Нет клиентов.", "messages"),
    ("ui.customers.none", "uz", "Mijozlar topilmadi.", "messages"),
    ("ui.customers.none", "en", "No customers.", "messages"),

    # Customers columns
    ("ui.customers.col.actions", "ru", "Действия", "fields"),
    ("ui.customers.col.actions", "uz", "Amallar", "fields"),
    ("ui.customers.col.actions", "en", "Actions", "fields"),
    ("ui.customers.col.id", "ru", "ИД клиента", "fields"),
    ("ui.customers.col.id", "uz", "Mijoz ID", "fields"),
    ("ui.customers.col.id", "en", "Customer ID", "fields"),
    ("ui.customers.col.name", "ru", "Название клиента", "fields"),
    ("ui.customers.col.name", "uz", "Mijoz nomi", "fields"),
    ("ui.customers.col.name", "en", "Customer name", "fields"),
    ("ui.customers.col.firm", "ru", "Название фирмы", "fields"),
    ("ui.customers.col.firm", "uz", "Kompaniya nomi", "fields"),
    ("ui.customers.col.firm", "en", "Company name", "fields"),
    ("ui.customers.col.category", "ru", "Категория клиента", "fields"),
    ("ui.customers.col.category", "uz", "Mijoz toifasi", "fields"),
    ("ui.customers.col.category", "en", "Customer category", "fields"),
    ("ui.customers.col.address", "ru", "Адрес", "fields"),
    ("ui.customers.col.address", "uz", "Manzil", "fields"),
    ("ui.customers.col.address", "en", "Address", "fields"),
    ("ui.customers.col.city", "ru", "Город", "fields"),
    ("ui.customers.col.city", "uz", "Shahar", "fields"),
    ("ui.customers.col.city", "en", "City", "fields"),
    ("ui.customers.col.territory", "ru", "Территория", "fields"),
    ("ui.customers.col.territory", "uz", "Hudud", "fields"),
    ("ui.customers.col.territory", "en", "Territory", "fields"),
    ("ui.customers.col.landmark", "ru", "Ориентир", "fields"),
    ("ui.customers.col.landmark", "uz", "Moʻljal", "fields"),
    ("ui.customers.col.landmark", "en", "Landmark", "fields"),
    ("ui.customers.col.phone", "ru", "Телефон", "fields"),
    ("ui.customers.col.phone", "uz", "Telefon", "fields"),
    ("ui.customers.col.phone", "en", "Phone", "fields"),
    ("ui.customers.col.contact", "ru", "Контактное лицо", "fields"),
    ("ui.customers.col.contact", "uz", "Aloqa shaxsi", "fields"),
    ("ui.customers.col.contact", "en", "Contact person", "fields"),
    ("ui.customers.col.tax_id", "ru", "ИНН", "fields"),
    ("ui.customers.col.tax_id", "uz", "STIR", "fields"),
    ("ui.customers.col.tax_id", "en", "TIN", "fields"),
    ("ui.customers.col.status", "ru", "Статус", "fields"),
    ("ui.customers.col.status", "uz", "Holat", "fields"),
    ("ui.customers.col.status", "en", "Status", "fields"),
    ("ui.customers.col.agent_login", "ru", "login агента", "fields"),
    ("ui.customers.col.agent_login", "uz", "Agent login", "fields"),
    ("ui.customers.col.agent_login", "en", "Agent login", "fields"),
    ("ui.customers.col.expeditor_login", "ru", "login экспедитора", "fields"),
    ("ui.customers.col.expeditor_login", "uz", "Ekspeditor login", "fields"),
    ("ui.customers.col.expeditor_login", "en", "Expeditor login", "fields"),
    ("ui.customers.col.has_photo", "ru", "Есть фото", "fields"),
    ("ui.customers.col.has_photo", "uz", "Rasm bor", "fields"),
    ("ui.customers.col.has_photo", "en", "Has photo", "fields"),
    ("ui.customers.col.lat", "ru", "Широта", "fields"),
    ("ui.customers.col.lat", "uz", "Kenglik", "fields"),
    ("ui.customers.col.lat", "en", "Latitude", "fields"),
    ("ui.customers.col.lon", "ru", "Долгота", "fields"),
    ("ui.customers.col.lon", "uz", "Uzunlik", "fields"),
    ("ui.customers.col.lon", "en", "Longitude", "fields"),
    ("ui.customers.col.pinfl", "ru", "ПИНФЛ", "fields"),
    ("ui.customers.col.pinfl", "uz", "JSHSHIR", "fields"),
    ("ui.customers.col.pinfl", "en", "PINFL", "fields"),
    ("ui.customers.col.contract", "ru", "Договор №", "fields"),
    ("ui.customers.col.contract", "uz", "Shartnoma №", "fields"),
    ("ui.customers.col.contract", "en", "Contract #", "fields"),
    ("ui.customers.col.account", "ru", "Р/С", "fields"),
    ("ui.customers.col.account", "uz", "Hisob raqami", "fields"),
    ("ui.customers.col.account", "en", "Account no", "fields"),
    ("ui.customers.col.bank", "ru", "Банк", "fields"),
    ("ui.customers.col.bank", "uz", "Bank", "fields"),
    ("ui.customers.col.bank", "en", "Bank", "fields"),
    ("ui.customers.col.mfo", "ru", "МФО", "fields"),
    ("ui.customers.col.mfo", "uz", "MFO", "fields"),
    ("ui.customers.col.mfo", "en", "MFO", "fields"),
    ("ui.customers.col.oked", "ru", "ОКЭД", "fields"),
    ("ui.customers.col.oked", "uz", "OKED", "fields"),
    ("ui.customers.col.oked", "en", "OKED", "fields"),
    ("ui.customers.col.vat_code", "ru", "Рег. код НДС", "fields"),
    ("ui.customers.col.vat_code", "uz", "QQS toʻlovchi reg. kodi", "fields"),
    ("ui.customers.col.vat_code", "en", "VAT payer registration code", "fields"),

    # Customers map
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
    ("ui.customers.map.displayed_prefix", "uz", "Xaritada koʻrsatilgan mijozlar:", "messages"),
    ("ui.customers.map.displayed_prefix", "en", "Customers shown on map:", "messages"),
]


def upgrade() -> None:
    conn = op.get_bind()
    query = sa.text(
        """
        INSERT INTO "Sales".translations
            (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), :key, :lang, :text, :category, 'migration_033', 'migration_033', now(), now())
        ON CONFLICT (translation_key, language_code)
        DO UPDATE SET
            translation_text = EXCLUDED.translation_text,
            category = COALESCE(EXCLUDED.category, "Sales".translations.category),
            updated_by = 'migration_033',
            updated_at = now()
        """
    )
    for key, lang, text, category in ROWS:
        conn.execute(query, {"key": key, "lang": lang, "text": text, "category": category})


def downgrade() -> None:
    pass
