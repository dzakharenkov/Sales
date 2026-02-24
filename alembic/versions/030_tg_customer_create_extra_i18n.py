"""Seed extra telegram customer-create i18n keys

Revision ID: 030_tg_cust_i18n
Revises: 029_ui_i18n
Create Date: 2026-02-22 02:00:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "030_tg_cust_i18n"
down_revision: Union[str, Sequence[str], None] = "029_ui_i18n"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("telegram.customer_create.error_name_min", "ru", "❌ *Ошибка:* Название должно содержать минимум 2 символа.\n\nПопробуйте еще раз:", "telegram"),
    ("telegram.customer_create.error_name_min", "uz", "❌ *Xato:* Nomi kamida 2 belgidan iborat bo'lishi kerak.\n\nQayta urinib ko'ring:", "telegram"),
    ("telegram.customer_create.error_name_min", "en", "❌ *Error:* Name must contain at least 2 characters.\n\nTry again:", "telegram"),
    ("telegram.customer_create.error_inn_format", "ru", "❌ *Ошибка:* ИНН должен содержать от 9 до 12 цифр.\n\nПопробуйте еще раз:", "telegram"),
    ("telegram.customer_create.error_inn_format", "uz", "❌ *Xato:* STIR 9 dan 12 gacha raqam bo'lishi kerak.\n\nQayta urinib ko'ring:", "telegram"),
    ("telegram.customer_create.error_inn_format", "en", "❌ *Error:* TIN must contain 9 to 12 digits.\n\nTry again:", "telegram"),
    ("telegram.customer_create.error_phone_min", "ru", "❌ *Ошибка:* Телефон должен содержать минимум 5 символов.\n\nПопробуйте еще раз:", "telegram"),
    ("telegram.customer_create.error_phone_min", "uz", "❌ *Xato:* Telefon kamida 5 belgidan iborat bo'lishi kerak.\n\nQayta urinib ko'ring:", "telegram"),
    ("telegram.customer_create.error_phone_min", "en", "❌ *Error:* Phone must contain at least 5 characters.\n\nTry again:", "telegram"),
    ("telegram.customer_create.error_location_required", "ru", "❌ *Ошибка:* Геолокация обязательна!\n\nНажмите кнопку 📍 для отправки координат:", "telegram"),
    ("telegram.customer_create.error_location_required", "uz", "❌ *Xato:* Geolokatsiya majburiy!\n\nKoordinatalarni yuborish uchun 📍 tugmasini bosing:", "telegram"),
    ("telegram.customer_create.error_location_required", "en", "❌ *Error:* Geolocation is required!\n\nPress 📍 to send coordinates:", "telegram"),
    ("telegram.customer_create.error_no_cities", "ru", "❌ Невозможно продолжить: в справочнике нет городов.\nГород обязателен при создании клиента.\n\nПопросите администратора заполнить справочник и повторите попытку.", "telegram"),
    ("telegram.customer_create.error_no_cities", "uz", "❌ Davom etib bo'lmaydi: shaharlar ma'lumotnomasi bo'sh.\nMijoz yaratishda shahar majburiy.\n\nAdministratorga ma'lumotnomani to'ldirishni ayting va qayta urinib ko'ring.", "telegram"),
    ("telegram.customer_create.error_no_cities", "en", "❌ Cannot continue: no cities in directory.\nCity is required for customer creation.\n\nAsk administrator to fill the directory and retry.", "telegram"),
    ("telegram.customer_create.error_no_territories", "ru", "❌ Невозможно продолжить: в справочнике нет территорий.\nТерритория обязательна при создании клиента.\n\nПопросите администратора заполнить справочник и повторите попытку.", "telegram"),
    ("telegram.customer_create.error_no_territories", "uz", "❌ Davom etib bo'lmaydi: hududlar ma'lumotnomasi bo'sh.\nMijoz yaratishda hudud majburiy.\n\nAdministratorga ma'lumotnomani to'ldirishni ayting va qayta urinib ko'ring.", "telegram"),
    ("telegram.customer_create.error_no_territories", "en", "❌ Cannot continue: no territories in directory.\nTerritory is required for customer creation.\n\nAsk administrator to fill the directory and retry.", "telegram"),
    ("telegram.customer_create.error_active_visit_dialog", "ru", "⚠️ У вас уже активен диалог создания визита.\nПожалуйста, завершите его (нажмите Отмена) перед добавлением клиента.", "telegram"),
    ("telegram.customer_create.error_active_visit_dialog", "uz", "⚠️ Sizda tashrif yaratish dialogi allaqachon faol.\nMijoz qo'shishdan oldin uni yakunlang (Bekor qilishni bosing).", "telegram"),
    ("telegram.customer_create.error_active_visit_dialog", "en", "⚠️ You already have an active visit creation dialog.\nPlease finish it (press Cancel) before adding customer.", "telegram"),
    ("telegram.customer_create.expeditors_not_found", "ru", "⚠️ Экспедиторы не найдены в системе.", "telegram"),
    ("telegram.customer_create.expeditors_not_found", "uz", "⚠️ Tizimda ekspeditorlar topilmadi.", "telegram"),
    ("telegram.customer_create.expeditors_not_found", "en", "⚠️ No expeditors found in the system.", "telegram"),
    ("telegram.customer_create.attach_prompt", "ru", "📎 Нажмите на кнопку Скрепка 📎 для отправки локации клиента:", "telegram"),
    ("telegram.customer_create.attach_prompt", "uz", "📎 Mijoz lokatsiyasini yuborish uchun Skrepka 📎 tugmasini bosing:", "telegram"),
    ("telegram.customer_create.attach_prompt", "en", "📎 Press attachment 📎 button to send customer location:", "telegram"),
    ("telegram.customer_create.attach_prompt_md", "ru", "📎 *Нажмите на кнопку Скрепка 📎 для отправки локации клиента:*", "telegram"),
    ("telegram.customer_create.attach_prompt_md", "uz", "📎 *Mijoz lokatsiyasini yuborish uchun Skrepka 📎 tugmasini bosing:*", "telegram"),
    ("telegram.customer_create.attach_prompt_md", "en", "📎 *Press attachment 📎 button to send customer location:*", "telegram"),
    ("telegram.customer_create.send_coords_prompt", "ru", "👇 *Нажмите кнопку для отправки координат:*", "telegram"),
    ("telegram.customer_create.send_coords_prompt", "uz", "👇 *Koordinatalarni yuborish uchun tugmani bosing:*", "telegram"),
    ("telegram.customer_create.send_coords_prompt", "en", "👇 *Press button to send coordinates:*", "telegram"),
    ("telegram.customer_create.error_required_missing_head", "ru", "❌ Нельзя сохранить клиента.", "telegram"),
    ("telegram.customer_create.error_required_missing_head", "uz", "❌ Mijozni saqlab bo'lmadi.", "telegram"),
    ("telegram.customer_create.error_required_missing_head", "en", "❌ Cannot save customer.", "telegram"),
    ("telegram.customer_create.error_required_missing_list", "ru", "Обязательные поля не выбраны:", "telegram"),
    ("telegram.customer_create.error_required_missing_list", "uz", "Majburiy maydonlar tanlanmagan:", "telegram"),
    ("telegram.customer_create.error_required_missing_list", "en", "Required fields are not selected:", "telegram"),
    ("telegram.customer_create.error_required_missing_tail", "ru", "Вернитесь назад и заполните их.", "telegram"),
    ("telegram.customer_create.error_required_missing_tail", "uz", "Ortga qayting va ularni to'ldiring.", "telegram"),
    ("telegram.customer_create.error_required_missing_tail", "en", "Go back and fill them.", "telegram"),
    ("telegram.customer_create.success", "ru", "✅ *Клиент успешно создан!*", "telegram"),
    ("telegram.customer_create.success", "uz", "✅ *Mijoz muvaffaqiyatli yaratildi!*", "telegram"),
    ("telegram.customer_create.success", "en", "✅ *Customer created successfully!*", "telegram"),
    ("telegram.customer_create.error_create", "ru", "❌ *Ошибка при создании клиента:*", "telegram"),
    ("telegram.customer_create.error_create", "uz", "❌ *Mijoz yaratishda xato:*", "telegram"),
    ("telegram.customer_create.error_create", "en", "❌ *Error while creating customer:*", "telegram"),
    ("telegram.customer_create.error_unexpected", "ru", "❌ *Неожиданная ошибка:*", "telegram"),
    ("telegram.customer_create.error_unexpected", "uz", "❌ *Kutilmagan xato:*", "telegram"),
    ("telegram.customer_create.error_unexpected", "en", "❌ *Unexpected error:*", "telegram"),
    ("telegram.customer_create.city_required_alert", "ru", "Поле «Город» обязательно", "telegram"),
    ("telegram.customer_create.city_required_alert", "uz", "«Shahar» maydoni majburiy", "telegram"),
    ("telegram.customer_create.city_required_alert", "en", "Field \"City\" is required", "telegram"),
    ("telegram.customer_create.territory_required_alert", "ru", "Поле «Территория» обязательно", "telegram"),
    ("telegram.customer_create.territory_required_alert", "uz", "«Hudud» maydoni majburiy", "telegram"),
    ("telegram.customer_create.territory_required_alert", "en", "Field \"Territory\" is required", "telegram"),
    ("telegram.customer_create.summary.name", "ru", "Название:", "telegram"),
    ("telegram.customer_create.summary.name", "uz", "Nomi:", "telegram"),
    ("telegram.customer_create.summary.name", "en", "Name:", "telegram"),
    ("telegram.customer_create.summary.tax_id", "ru", "ИНН:", "telegram"),
    ("telegram.customer_create.summary.tax_id", "uz", "STIR:", "telegram"),
    ("telegram.customer_create.summary.tax_id", "en", "TIN:", "telegram"),
    ("telegram.customer_create.summary.firm_name", "ru", "Название фирмы:", "telegram"),
    ("telegram.customer_create.summary.firm_name", "uz", "Kompaniya nomi:", "telegram"),
    ("telegram.customer_create.summary.firm_name", "en", "Company:", "telegram"),
    ("telegram.customer_create.summary.phone", "ru", "Телефон:", "telegram"),
    ("telegram.customer_create.summary.phone", "uz", "Telefon:", "telegram"),
    ("telegram.customer_create.summary.phone", "en", "Phone:", "telegram"),
    ("telegram.customer_create.summary.contact_person", "ru", "Контактное лицо:", "telegram"),
    ("telegram.customer_create.summary.contact_person", "uz", "Kontakt shaxs:", "telegram"),
    ("telegram.customer_create.summary.contact_person", "en", "Contact person:", "telegram"),
    ("telegram.customer_create.summary.address", "ru", "Адрес:", "telegram"),
    ("telegram.customer_create.summary.address", "uz", "Manzil:", "telegram"),
    ("telegram.customer_create.summary.address", "en", "Address:", "telegram"),
    ("telegram.customer_create.summary.city", "ru", "Город:", "telegram"),
    ("telegram.customer_create.summary.city", "uz", "Shahar:", "telegram"),
    ("telegram.customer_create.summary.city", "en", "City:", "telegram"),
    ("telegram.customer_create.summary.territory", "ru", "Территория:", "telegram"),
    ("telegram.customer_create.summary.territory", "uz", "Hudud:", "telegram"),
    ("telegram.customer_create.summary.territory", "en", "Territory:", "telegram"),
    ("telegram.customer_create.summary.account_no", "ru", "Р/с:", "telegram"),
    ("telegram.customer_create.summary.account_no", "uz", "Hisob:", "telegram"),
    ("telegram.customer_create.summary.account_no", "en", "Account:", "telegram"),
    ("telegram.customer_create.summary.expeditor", "ru", "Экспедитор:", "telegram"),
    ("telegram.customer_create.summary.expeditor", "uz", "Ekspeditor:", "telegram"),
    ("telegram.customer_create.summary.expeditor", "en", "Expeditor:", "telegram"),
    ("telegram.customer_create.summary.coords", "ru", "Координаты:", "telegram"),
    ("telegram.customer_create.summary.coords", "uz", "Koordinatalar:", "telegram"),
    ("telegram.customer_create.summary.coords", "en", "Coordinates:", "telegram"),
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
                    (gen_random_uuid(), :key, :lang, :text, :category, 'migration_030', 'migration_030', now(), now())
                ON CONFLICT (translation_key, language_code)
                DO UPDATE SET
                    translation_text = EXCLUDED.translation_text,
                    category = COALESCE(EXCLUDED.category, "Sales".translations.category),
                    updated_by = 'migration_030',
                    updated_at = now()
                """
            ),
            {"key": key, "lang": lang, "text": text, "category": category},
        )


def downgrade() -> None:
    pass

