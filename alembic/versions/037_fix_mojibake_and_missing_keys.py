"""Fix mojibake translation values and add missing i18n keys

Revision ID: 037_i18n_fix
Revises: 036_tg_buttons_extra
Create Date: 2026-02-22 09:40:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "037_i18n_fix"
down_revision: Union[str, Sequence[str], None] = "036_tg_buttons_extra"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


UPSERT_ROWS = [
    # Broken RU labels in translations UI
    ("label.key", "ru", "Ключ", "fields"),
    ("label.keys", "ru", "Ключи", "fields"),
    ("label.lang", "ru", "Язык", "fields"),
    ("label.text", "ru", "Текст", "fields"),
    ("label.notes", "ru", "Заметки", "fields"),
    ("ui.translations.title", "ru", "Справочник: Переводы", "menu"),
    ("ui.translations.key_contains", "ru", "Ключ содержит...", "fields"),
    ("ui.translations.all_languages", "ru", "Все языки", "fields"),
    ("ui.translations.all_translations", "ru", "Все переводы", "messages"),
    ("ui.translations.telegram_translations", "ru", "Переводы Telegram", "messages"),
    ("ui.translations.quality", "ru", "Качество", "messages"),
    ("ui.translations.missing_by_language_set", "ru", "Пропуски по языковому набору", "messages"),
    ("ui.translations.no_data", "ru", "Переводы не найдены.", "messages"),
    ("ui.translations.failed_load", "ru", "Не удалось загрузить переводы.", "messages"),
    ("ui.translations.add_title", "ru", "Добавить перевод", "messages"),
    ("ui.translations.edit_title", "ru", "Редактировать перевод", "messages"),
    ("ui.translations.delete_confirm", "ru", "Удалить перевод?", "messages"),
    ("ui.translations.delete_failed", "ru", "Не удалось удалить перевод", "messages"),

    # Missing key used in customer create section
    ("ui.customers.create.title", "ru", "Создать клиента", "menu"),
    ("ui.customers.create.title", "uz", "Mijoz yaratish", "menu"),
    ("ui.customers.create.title", "en", "Create Customer", "menu"),

    # Telegram text fixes (replace mojibake, keep no hardcode in handlers)
    ("telegram.common.choose_date", "ru", "Выберите дату:", "telegram"),
    ("telegram.common.choose_date", "uz", "Sanani tanlang:", "telegram"),
    ("telegram.common.choose_date", "en", "Choose a date:", "telegram"),

    ("telegram.common.select_customer", "ru", "Выберите клиента:", "telegram"),
    ("telegram.common.select_customer", "uz", "Mijozni tanlang:", "telegram"),
    ("telegram.common.select_customer", "en", "Select customer:", "telegram"),

    ("telegram.common.customers_not_found_try", "ru", "Клиенты не найдены. Попробуйте другой запрос:", "telegram"),
    ("telegram.common.customers_not_found_try", "uz", "Mijozlar topilmadi. Boshqa so'rovni kiriting:", "telegram"),
    ("telegram.common.customers_not_found_try", "en", "Customers not found. Try another query:", "telegram"),

    ("telegram.common.no_orders", "ru", "Нет заказов.", "telegram"),
    ("telegram.common.no_orders", "uz", "Buyurtmalar yo'q.", "telegram"),
    ("telegram.common.no_orders", "en", "No orders.", "telegram"),

    ("telegram.expeditor.no_orders_for_route", "ru", "Нет заказов для маршрута.", "telegram"),
    ("telegram.expeditor.no_orders_for_route", "uz", "Marshrut uchun buyurtmalar yo'q.", "telegram"),
    ("telegram.expeditor.no_orders_for_route", "en", "No orders for route.", "telegram"),

    ("telegram.expeditor.building_route", "ru", "Строю маршрут...", "telegram"),
    ("telegram.expeditor.building_route", "uz", "Marshrut tuzilmoqda...", "telegram"),
    ("telegram.expeditor.building_route", "en", "Building route...", "telegram"),

    ("telegram.expeditor.route_choose_date", "ru", "*Мой маршрут*\n\nВыберите дату:", "telegram"),
    ("telegram.expeditor.route_choose_date", "uz", "*Mening marshrutim*\n\nSanani tanlang:", "telegram"),
    ("telegram.expeditor.route_choose_date", "en", "*My route*\n\nChoose a date:", "telegram"),

    ("telegram.agent.product_not_found", "ru", "Товар не найден.", "telegram"),
    ("telegram.agent.product_not_found", "uz", "Mahsulot topilmadi.", "telegram"),
    ("telegram.agent.product_not_found", "en", "Product not found.", "telegram"),

    ("telegram.agent.customer_name_required", "ru", "Заполните хотя бы *название клиента* (минимум 2 символа).", "telegram"),
    ("telegram.agent.customer_name_required", "uz", "Kamida *mijoz nomini* kiriting (kamida 2 belgi).", "telegram"),
    ("telegram.agent.customer_name_required", "en", "Fill at least *customer name* (minimum 2 chars).", "telegram"),

    # Generic runtime/service keys for remaining dynamic messages
    ("telegram.common.error_with_detail", "ru", "Ошибка: {detail}", "telegram"),
    ("telegram.common.error_with_detail", "uz", "Xatolik: {detail}", "telegram"),
    ("telegram.common.error_with_detail", "en", "Error: {detail}", "telegram"),

    ("telegram.agent.photo_uploaded", "ru", "Фото загружено! ({filename})", "telegram"),
    ("telegram.agent.photo_uploaded", "uz", "Rasm yuklandi! ({filename})", "telegram"),
    ("telegram.agent.photo_uploaded", "en", "Photo uploaded! ({filename})", "telegram"),

    ("telegram.agent.photo_upload_failed", "ru", "Ошибка загрузки: {detail}", "telegram"),
    ("telegram.agent.photo_upload_failed", "uz", "Yuklash xatosi: {detail}", "telegram"),
    ("telegram.agent.photo_upload_failed", "en", "Upload error: {detail}", "telegram"),

    ("telegram.agent.photo_upload_warning", "ru", "Не удалось загрузить фото: {detail}", "telegram"),
    ("telegram.agent.photo_upload_warning", "uz", "Rasmni yuklab bo'lmadi: {detail}", "telegram"),
    ("telegram.agent.photo_upload_warning", "en", "Failed to upload photo: {detail}", "telegram"),

    ("telegram.agent.visit_mark_not_done", "ru", "Визит #{id} отмечен как не выполненный.", "telegram"),
    ("telegram.agent.visit_mark_not_done", "uz", "Tashrif #{id} bajarilmagan deb belgilandi.", "telegram"),
    ("telegram.agent.visit_mark_not_done", "en", "Visit #{id} marked as not completed.", "telegram"),

    ("telegram.agent.location_update_error", "ru", "Ошибка при обновлении локации: {detail}", "telegram"),
    ("telegram.agent.location_update_error", "uz", "Lokatsiyani yangilashda xatolik: {detail}", "telegram"),
    ("telegram.agent.location_update_error", "en", "Location update error: {detail}", "telegram"),
]


def upgrade() -> None:
    conn = op.get_bind()
    query = sa.text(
        '''
        INSERT INTO "Sales".translations
            (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
        VALUES
            (gen_random_uuid(), :key, :lang, :text, :category, 'migration_037', 'migration_037', now(), now())
        ON CONFLICT (translation_key, language_code)
        DO UPDATE SET
            translation_text = EXCLUDED.translation_text,
            category = COALESCE(EXCLUDED.category, "Sales".translations.category),
            updated_by = 'migration_037',
            updated_at = now()
        '''
    )
    for key, lang, text_value, category in UPSERT_ROWS:
        conn.execute(query, {"key": key, "lang": lang, "text": text_value, "category": category})


def downgrade() -> None:
    pass
