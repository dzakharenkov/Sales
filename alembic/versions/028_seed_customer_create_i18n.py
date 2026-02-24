"""Seed customer-create telegram i18n keys

Revision ID: 028_customer_i18n
Revises: 027_fix_telegram_newlines
Create Date: 2026-02-22 01:20:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "028_customer_i18n"
down_revision: Union[str, Sequence[str], None] = "027_fix_telegram_newlines"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("telegram.button.refresh", "ru", "🔄 Обновить", "telegram"),
    ("telegram.button.refresh", "uz", "🔄 Yangilash", "telegram"),
    ("telegram.button.refresh", "en", "🔄 Refresh", "telegram"),
    ("telegram.customer_create.title", "ru", "➕ *Добавление нового клиента*", "telegram"),
    ("telegram.customer_create.title", "uz", "➕ *Yangi mijoz qo'shish*", "telegram"),
    ("telegram.customer_create.title", "en", "➕ *Add new customer*", "telegram"),
    ("telegram.customer_create.step1", "ru", "📝 Шаг 1 из 11: Введите *название клиента* (минимум 2 символа):", "telegram"),
    ("telegram.customer_create.step1", "uz", "📝 1/11: *Mijoz nomini* kiriting (kamida 2 belgi):", "telegram"),
    ("telegram.customer_create.step1", "en", "📝 Step 1/11: Enter *customer name* (at least 2 chars):", "telegram"),
    ("telegram.customer_create.step2_required_inn", "ru", "📝 Шаг 2 из 11: Введите ИНН (9-12 цифр):", "telegram"),
    ("telegram.customer_create.step2_required_inn", "uz", "📝 2/11: STIR kiriting (9-12 raqam):", "telegram"),
    ("telegram.customer_create.step2_required_inn", "en", "📝 Step 2/11: Enter TIN (9-12 digits):", "telegram"),
    ("telegram.customer_create.step3", "ru", "📝 Шаг 3 из 11: Введите *название фирмы* или нажмите Пропустить:", "telegram"),
    ("telegram.customer_create.step3", "uz", "📝 3/11: *Kompaniya nomini* kiriting yoki Skip ni bosing:", "telegram"),
    ("telegram.customer_create.step3", "en", "📝 Step 3/11: Enter *company name* or press Skip:", "telegram"),
    ("telegram.customer_create.step4", "ru", "📝 Шаг 4 из 11: Введите *телефон* или нажмите Пропустить:", "telegram"),
    ("telegram.customer_create.step4", "uz", "📝 4/11: *Telefon* kiriting yoki Skip ni bosing:", "telegram"),
    ("telegram.customer_create.step4", "en", "📝 Step 4/11: Enter *phone* or press Skip:", "telegram"),
    ("telegram.customer_create.step5", "ru", "📝 Шаг 5 из 11: Введите *контактное лицо* или нажмите Пропустить:", "telegram"),
    ("telegram.customer_create.step5", "uz", "📝 5/11: *Kontakt shaxsni* kiriting yoki Skip ni bosing:", "telegram"),
    ("telegram.customer_create.step5", "en", "📝 Step 5/11: Enter *contact person* or press Skip:", "telegram"),
    ("telegram.customer_create.step6", "ru", "📝 Шаг 6 из 11: Введите *адрес* или нажмите Пропустить:", "telegram"),
    ("telegram.customer_create.step6", "uz", "📝 6/11: *Manzilni* kiriting yoki Skip ni bosing:", "telegram"),
    ("telegram.customer_create.step6", "en", "📝 Step 6/11: Enter *address* or press Skip:", "telegram"),
    ("telegram.customer_create.step7", "ru", "📝 Шаг 7 из 11: Выберите *город* (обязательно):", "telegram"),
    ("telegram.customer_create.step7", "uz", "📝 7/11: *Shaharni* tanlang (majburiy):", "telegram"),
    ("telegram.customer_create.step7", "en", "📝 Step 7/11: Select *city* (required):", "telegram"),
    ("telegram.customer_create.step8", "ru", "📝 Шаг 8 из 11: Выберите *территорию* (обязательно):", "telegram"),
    ("telegram.customer_create.step8", "uz", "📝 8/11: *Hududni* tanlang (majburiy):", "telegram"),
    ("telegram.customer_create.step8", "en", "📝 Step 8/11: Select *territory* (required):", "telegram"),
    ("telegram.customer_create.step9", "ru", "📝 Шаг 9 из 11: Введите *расчётный счёт* или нажмите Пропустить:", "telegram"),
    ("telegram.customer_create.step9", "uz", "📝 9/11: *Hisob raqamini* kiriting yoki Skip ni bosing:", "telegram"),
    ("telegram.customer_create.step9", "en", "📝 Step 9/11: Enter *account number* or press Skip:", "telegram"),
    ("telegram.customer_create.step10", "ru", "📝 Шаг 10 из 11: Выберите *экспедитора* или нажмите Пропустить:", "telegram"),
    ("telegram.customer_create.step10", "uz", "📝 10/11: *Ekspeditorni* tanlang yoki Skip ni bosing:", "telegram"),
    ("telegram.customer_create.step10", "en", "📝 Step 10/11: Select *expeditor* or press Skip:", "telegram"),
    ("telegram.customer_create.step11", "ru", "📝 Шаг 11 из 11: Отправьте *геолокацию клиента*\n⚠️ _Обязательное поле_ - используйте кнопку ниже:", "telegram"),
    ("telegram.customer_create.step11", "uz", "📝 11/11: *Mijoz geolokatsiyasini* yuboring\n⚠️ _Majburiy maydon_ - pastdagi tugmadan foydalaning:", "telegram"),
    ("telegram.customer_create.step11", "en", "📝 Step 11/11: Send *customer geolocation*\n⚠️ _Required field_ - use the button below:", "telegram"),
    ("telegram.customer_create.required_field", "ru", "⚠️ _Обязательное поле_", "telegram"),
    ("telegram.customer_create.required_field", "uz", "⚠️ _Majburiy maydon_", "telegram"),
    ("telegram.customer_create.required_field", "en", "⚠️ _Required field_", "telegram"),
    ("telegram.customer_create.check_data", "ru", "✅ *Проверьте введённые данные:*", "telegram"),
    ("telegram.customer_create.check_data", "uz", "✅ *Kiritilgan ma'lumotlarni tekshiring:*", "telegram"),
    ("telegram.customer_create.check_data", "en", "✅ *Check entered data:*", "telegram"),
    ("telegram.customer_create.all_correct", "ru", "Всё верно?", "telegram"),
    ("telegram.customer_create.all_correct", "uz", "Hammasi to'g'rimi?", "telegram"),
    ("telegram.customer_create.all_correct", "en", "Is everything correct?", "telegram"),
    ("telegram.customer_create.create_btn", "ru", "✅ Создать клиента", "telegram"),
    ("telegram.customer_create.create_btn", "uz", "✅ Mijoz yaratish", "telegram"),
    ("telegram.customer_create.create_btn", "en", "✅ Create customer", "telegram"),
    ("telegram.customer_create.send_location_btn", "ru", "📍 Отправить геолокацию", "telegram"),
    ("telegram.customer_create.send_location_btn", "uz", "📍 Geolokatsiyani yuborish", "telegram"),
    ("telegram.customer_create.send_location_btn", "en", "📍 Send geolocation", "telegram"),
    ("telegram.customer_create.cancelled", "ru", "❌ Добавление клиента отменено.\n\nНажмите /start для возврата в главное меню.", "telegram"),
    ("telegram.customer_create.cancelled", "uz", "❌ Mijoz qo'shish bekor qilindi.\n\nAsosiy menyuga qaytish uchun /start ni bosing.", "telegram"),
    ("telegram.customer_create.cancelled", "en", "❌ Customer creation canceled.\n\nPress /start to return to main menu.", "telegram"),
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
                    (gen_random_uuid(), :key, :lang, :text, :category, 'migration_028', 'migration_028', now(), now())
                ON CONFLICT (translation_key, language_code)
                DO UPDATE SET
                    translation_text = EXCLUDED.translation_text,
                    category = COALESCE(EXCLUDED.category, "Sales".translations.category),
                    updated_by = 'migration_028',
                    updated_at = now()
                """
            ),
            {"key": key, "lang": lang, "text": text, "category": category},
        )


def downgrade() -> None:
    pass
