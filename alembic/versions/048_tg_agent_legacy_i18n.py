"""complete telegram agent legacy i18n keys

Revision ID: 048_tg_agent_legacy_i18n
Revises: 047_tg_internal_dialogs_i18n
Create Date: 2026-03-11
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op


revision: str = "048_tg_agent_legacy_i18n"
down_revision: Union[str, Sequence[str], None] = "047_tg_internal_dialogs_i18n"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO "Sales".translations
          (id, translation_key, language_code, translation_text, category, created_by)
        SELECT
          md5(random()::text || clock_timestamp()::text)::uuid,
          x.translation_key,
          x.language_code,
          x.translation_text,
          x.category,
          'migration_048'
        FROM (
          VALUES
            ('telegram.agent.legacy_customer_start', 'ru', '➕ *Добавить клиента*\n\nВведите *название клиента* (минимум 2 символа):', 'telegram'),
            ('telegram.agent.legacy_customer_start', 'uz', '➕ *Mijoz qo''shish*\n\n*Mijoz nomi*ni kiriting (kamida 2 belgi):', 'telegram'),
            ('telegram.agent.legacy_customer_start', 'en', '➕ *Add customer*\n\nEnter *customer name* (at least 2 characters):', 'telegram'),
            ('telegram.agent.legacy_customer_name_min', 'ru', '❌ Название минимум 2 символа. Введите снова:', 'telegram'),
            ('telegram.agent.legacy_customer_name_min', 'uz', '❌ Nom kamida 2 belgidan iborat bo''lishi kerak. Qayta kiriting:', 'telegram'),
            ('telegram.agent.legacy_customer_name_min', 'en', '❌ Name must be at least 2 characters. Enter it again:', 'telegram'),
            ('telegram.agent.legacy_customer_name_ok_enter_inn', 'ru', '✅ Название: *{name}*\n\nВведите *ИНН* (9–12 цифр) или нажмите Пропустить:', 'telegram'),
            ('telegram.agent.legacy_customer_name_ok_enter_inn', 'uz', '✅ Nomi: *{name}*\n\n*STIR*ni kiriting (9–12 raqam) yoki O''tkazib yuborishni bosing:', 'telegram'),
            ('telegram.agent.legacy_customer_name_ok_enter_inn', 'en', '✅ Name: *{name}*\n\nEnter *Tax ID* (9–12 digits) or press Skip:', 'telegram'),
            ('telegram.agent.legacy_customer_inn_invalid', 'ru', '❌ ИНН должен содержать от 9 до 12 цифр. Введите снова:', 'telegram'),
            ('telegram.agent.legacy_customer_inn_invalid', 'uz', '❌ STIR 9 dan 12 gacha raqamdan iborat bo''lishi kerak. Qayta kiriting:', 'telegram'),
            ('telegram.agent.legacy_customer_inn_invalid', 'en', '❌ Tax ID must contain 9 to 12 digits. Enter it again:', 'telegram'),
            ('telegram.agent.legacy_customer_fields_intro', 'ru', '📋 *Заполните данные клиента*\nНажмите на поле, введите значение и отправьте. Для координат — отправьте геолокацию.\n', 'telegram'),
            ('telegram.agent.legacy_customer_fields_intro', 'uz', '📋 *Mijoz ma''lumotlarini to''ldiring*\nMaydonni bosing, qiymatni kiriting va yuboring. Koordinatalar uchun geolokatsiyani yuboring.\n', 'telegram'),
            ('telegram.agent.legacy_customer_fields_intro', 'en', '📋 *Fill in customer details*\nTap a field, enter the value, and send it. For coordinates, send geolocation.\n', 'telegram'),
            ('telegram.agent.legacy_customer.field_name', 'ru', 'Название', 'telegram'),
            ('telegram.agent.legacy_customer.field_name', 'uz', 'Nomi', 'telegram'),
            ('telegram.agent.legacy_customer.field_name', 'en', 'Name', 'telegram'),
            ('telegram.agent.legacy_customer.field_inn', 'ru', 'ИНН', 'telegram'),
            ('telegram.agent.legacy_customer.field_inn', 'uz', 'STIR', 'telegram'),
            ('telegram.agent.legacy_customer.field_inn', 'en', 'Tax ID', 'telegram'),
            ('telegram.agent.legacy_customer.field_firm_name', 'ru', 'Название фирмы', 'telegram'),
            ('telegram.agent.legacy_customer.field_firm_name', 'uz', 'Firma nomi', 'telegram'),
            ('telegram.agent.legacy_customer.field_firm_name', 'en', 'Company name', 'telegram'),
            ('telegram.agent.legacy_customer.field_account_no', 'ru', 'Р/с', 'telegram'),
            ('telegram.agent.legacy_customer.field_account_no', 'uz', 'Hisob raqami', 'telegram'),
            ('telegram.agent.legacy_customer.field_account_no', 'en', 'Account No.', 'telegram'),
            ('telegram.agent.legacy_customer.field_address', 'ru', 'Адрес', 'telegram'),
            ('telegram.agent.legacy_customer.field_address', 'uz', 'Manzil', 'telegram'),
            ('telegram.agent.legacy_customer.field_address', 'en', 'Address', 'telegram'),
            ('telegram.agent.legacy_customer.field_city', 'ru', 'Город', 'telegram'),
            ('telegram.agent.legacy_customer.field_city', 'uz', 'Shahar', 'telegram'),
            ('telegram.agent.legacy_customer.field_city', 'en', 'City', 'telegram'),
            ('telegram.agent.legacy_customer.field_territory', 'ru', 'Территория', 'telegram'),
            ('telegram.agent.legacy_customer.field_territory', 'uz', 'Hudud', 'telegram'),
            ('telegram.agent.legacy_customer.field_territory', 'en', 'Territory', 'telegram'),
            ('telegram.agent.legacy_customer.field_phone', 'ru', 'Телефон', 'telegram'),
            ('telegram.agent.legacy_customer.field_phone', 'uz', 'Telefon', 'telegram'),
            ('telegram.agent.legacy_customer.field_phone', 'en', 'Phone', 'telegram'),
            ('telegram.agent.legacy_customer.field_contact', 'ru', 'Контактное лицо', 'telegram'),
            ('telegram.agent.legacy_customer.field_contact', 'uz', 'Kontakt shaxs', 'telegram'),
            ('telegram.agent.legacy_customer.field_contact', 'en', 'Contact person', 'telegram'),
            ('telegram.agent.legacy_customer.field_geo', 'ru', '📍 Координаты (геолокация)', 'telegram'),
            ('telegram.agent.legacy_customer.field_geo', 'uz', '📍 Koordinatalar (geolokatsiya)', 'telegram'),
            ('telegram.agent.legacy_customer.field_geo', 'en', '📍 Coordinates (geolocation)', 'telegram'),
            ('telegram.agent.legacy_customer.field_photo', 'ru', '📸 Фото', 'telegram'),
            ('telegram.agent.legacy_customer.field_photo', 'uz', '📸 Foto', 'telegram'),
            ('telegram.agent.legacy_customer.field_photo', 'en', '📸 Photo', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_name', 'ru', 'Введите *название клиента* (минимум 2 символа):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_name', 'uz', '*Mijoz nomi*ni kiriting (kamida 2 belgi):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_name', 'en', 'Enter *customer name* (at least 2 characters):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_inn', 'ru', 'Введите *ИНН* (9–12 цифр):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_inn', 'uz', '*STIR*ni kiriting (9–12 raqam):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_inn', 'en', 'Enter *Tax ID* (9–12 digits):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_firm_name', 'ru', 'Введите *название фирмы*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_firm_name', 'uz', '*Firma nomi*ni kiriting:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_firm_name', 'en', 'Enter *company name*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_account_no', 'ru', 'Введите *расчётный счёт* (р/с):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_account_no', 'uz', '*Hisob raqami*ni kiriting:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_account_no', 'en', 'Enter *account number*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_address', 'ru', 'Введите *адрес*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_address', 'uz', '*Manzil*ni kiriting:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_address', 'en', 'Enter *address*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_city', 'ru', 'Введите *город*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_city', 'uz', '*Shahar*ni kiriting:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_city', 'en', 'Enter *city*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_territory', 'ru', 'Введите *территорию*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_territory', 'uz', '*Hudud*ni kiriting:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_territory', 'en', 'Enter *territory*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_phone', 'ru', 'Введите *телефон*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_phone', 'uz', '*Telefon*ni kiriting:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_phone', 'en', 'Enter *phone*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_contact', 'ru', 'Введите *контактное лицо*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_contact', 'uz', '*Kontakt shaxs*ni kiriting:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_contact', 'en', 'Enter *contact person*:', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_geo', 'ru', '📍 Отправьте *геолокацию* (нажмите 📎 → Геолокация):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_geo', 'uz', '📍 *Geolokatsiya*ni yuboring (📎 → Geolokatsiya ni bosing):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_geo', 'en', '📍 Send *geolocation* (tap 📎 → Location):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_photo', 'ru', '📸 Отправьте *фото* клиента (вывеска, магазин):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_photo', 'uz', '📸 Mijozning *fotosi*ni yuboring (peshlavha, do''kon):', 'telegram'),
            ('telegram.agent.legacy_customer.prompt_photo', 'en', '📸 Send *customer photo* (signboard, store):', 'telegram'),
            ('telegram.agent.legacy_customer_confirm_title', 'ru', '📋 *Подтверждение нового клиента:*\n', 'telegram'),
            ('telegram.agent.legacy_customer_confirm_title', 'uz', '📋 *Yangi mijozni tasdiqlash:*\n', 'telegram'),
            ('telegram.agent.legacy_customer_confirm_title', 'en', '📋 *Confirm new customer:*\n', 'telegram'),
            ('telegram.agent.legacy_customer.label_name', 'ru', '*Название:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_name', 'uz', '*Nomi:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_name', 'en', '*Name:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_inn', 'ru', '*ИНН:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_inn', 'uz', '*STIR:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_inn', 'en', '*Tax ID:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_coords', 'ru', '*Координаты:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_coords', 'uz', '*Koordinatalar:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_coords', 'en', '*Coordinates:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_photo', 'ru', '*Фото:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_photo', 'uz', '*Foto:*', 'telegram'),
            ('telegram.agent.legacy_customer.label_photo', 'en', '*Photo:*', 'telegram'),
            ('telegram.agent.photo_attached', 'ru', '✅ Прикреплено', 'telegram'),
            ('telegram.agent.photo_attached', 'uz', '✅ Biriktirildi', 'telegram'),
            ('telegram.agent.photo_attached', 'en', '✅ Attached', 'telegram'),
            ('telegram.agent.legacy_customer_created', 'ru', '✅ *Клиент создан!*\n\n*ID:* {cid}\n*Название:* {name}', 'telegram'),
            ('telegram.agent.legacy_customer_created', 'uz', '✅ *Mijoz yaratildi!*\n\n*ID:* {cid}\n*Nomi:* {name}', 'telegram'),
            ('telegram.agent.legacy_customer_created', 'en', '✅ *Customer created!*\n\n*ID:* {cid}\n*Name:* {name}', 'telegram'),
            ('telegram.agent.visits_for_date', 'ru', '📋 *Визиты на {date}:*\n', 'telegram'),
            ('telegram.agent.visits_for_date', 'uz', '📋 *{date} sanadagi tashriflar:*\n', 'telegram'),
            ('telegram.agent.visits_for_date', 'en', '📋 *Visits for {date}:*\n', 'telegram'),
            ('telegram.agent.visits_for_date_empty', 'ru', '📋 Визиты на {date}:\n\nНет визитов.', 'telegram'),
            ('telegram.agent.visits_for_date_empty', 'uz', '📋 {date} sanadagi tashriflar:\n\nTashriflar yo''q.', 'telegram'),
            ('telegram.agent.visits_for_date_empty', 'en', '📋 Visits for {date}:\n\nNo visits.', 'telegram'),
            ('telegram.agent.photo_search_prompt', 'ru', '📸 Введите название клиента или ИНН для поиска:', 'telegram'),
            ('telegram.agent.photo_search_prompt', 'uz', '📸 Qidirish uchun mijoz nomi yoki STIRni kiriting:', 'telegram'),
            ('telegram.agent.photo_search_prompt', 'en', '📸 Enter customer name or Tax ID to search:', 'telegram'),
            ('telegram.agent.products_choose_page', 'ru', '📦 *Выберите товар* (стр. {page}/{pages}){cart}\n', 'telegram'),
            ('telegram.agent.products_choose_page', 'uz', '📦 *Mahsulotni tanlang* (bet {page}/{pages}){cart}\n', 'telegram'),
            ('telegram.agent.products_choose_page', 'en', '📦 *Choose a product* (page {page}/{pages}){cart}\n', 'telegram'),
            ('telegram.agent.price', 'ru', 'Цена:', 'telegram'),
            ('telegram.agent.price', 'uz', 'Narx:', 'telegram'),
            ('telegram.agent.price', 'en', 'Price:', 'telegram'),
            ('telegram.agent.enter_positive_integer', 'ru', '❌ Введите целое число > 0:', 'telegram'),
            ('telegram.agent.enter_positive_integer', 'uz', '❌ 0 dan katta butun son kiriting:', 'telegram'),
            ('telegram.agent.enter_positive_integer', 'en', '❌ Enter an integer greater than 0:', 'telegram'),
            ('telegram.agent.added', 'ru', 'Добавлено:', 'telegram'),
            ('telegram.agent.added', 'uz', 'Qo''shildi:', 'telegram'),
            ('telegram.agent.added', 'en', 'Added:', 'telegram'),
            ('telegram.agent.add_more', 'ru', 'Добавить ещё товар?', 'telegram'),
            ('telegram.agent.add_more', 'uz', 'Yana mahsulot qo''shilsinmi?', 'telegram'),
            ('telegram.agent.add_more', 'en', 'Add another product?', 'telegram'),
            ('telegram.agent.order_location_received_photo_next', 'ru', '✅ Координаты: {lat}, {lon}\n\n📸 *Фото клиента* (обязательно)\nОтправьте фото (вывеска, точка доставки).', 'telegram'),
            ('telegram.agent.order_location_received_photo_next', 'uz', '✅ Koordinatalar: {lat}, {lon}\n\n📸 *Mijoz fotosi* (majburiy)\nFoto yuboring (peshlavha, yetkazish nuqtasi).', 'telegram'),
            ('telegram.agent.order_location_received_photo_next', 'en', '✅ Coordinates: {lat}, {lon}\n\n📸 *Customer photo* (required)\nSend a photo (signboard, delivery point).', 'telegram'),
            ('telegram.agent.send_image_only', 'ru', '❌ Отправьте изображение (JPG, PNG, WEBP).', 'telegram'),
            ('telegram.agent.send_image_only', 'uz', '❌ Rasm yuboring (JPG, PNG, WEBP).', 'telegram'),
            ('telegram.agent.send_image_only', 'en', '❌ Send an image (JPG, PNG, WEBP).', 'telegram'),
            ('telegram.agent.file_too_large_10mb', 'ru', '❌ Файл слишком большой (макс. 10 МБ).', 'telegram'),
            ('telegram.agent.file_too_large_10mb', 'uz', '❌ Fayl juda katta (maks. 10 MB).', 'telegram'),
            ('telegram.agent.file_too_large_10mb', 'en', '❌ File is too large (max 10 MB).', 'telegram'),
            ('telegram.agent.send_location_via_button', 'ru', '❌ Пожалуйста, отправьте геолокацию через кнопку 📎', 'telegram'),
            ('telegram.agent.send_location_via_button', 'uz', '❌ Iltimos, geolokatsiyani 📎 tugmasi orqali yuboring', 'telegram'),
            ('telegram.agent.send_location_via_button', 'en', '❌ Please send geolocation using the 📎 button', 'telegram'),
            ('telegram.common.enter_value', 'ru', 'Введите значение:', 'telegram'),
            ('telegram.common.enter_value', 'uz', 'Qiymatni kiriting:', 'telegram'),
            ('telegram.common.enter_value', 'en', 'Enter a value:', 'telegram')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_048'
        """
    )


def downgrade() -> None:
    pass
