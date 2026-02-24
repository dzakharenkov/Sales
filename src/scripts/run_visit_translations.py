import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from dotenv import load_dotenv
load_dotenv()

from src.database.connection import async_session
from sqlalchemy import text

SQL = """
INSERT INTO "Sales".translations (translation_key, language_code, translation_text, category, created_by)
VALUES
('telegram.visit_create.create_visit_search_prompt', 'ru', '🆕 *Создать визит*\n\nВведите название клиента или ИНН для поиска:', 'telegram', 'system'),
('telegram.visit_create.create_visit_search_prompt', 'uz', '🆕 *Vizit yaratish*\n\nMijoz nomini yoki INN ni qidirish uchun kiriting:', 'telegram', 'system'),
('telegram.visit_create.create_visit_search_prompt', 'en', '🆕 *Create visit*\n\nEnter customer name or TIN to search:', 'telegram', 'system'),

('telegram.visit_create.customer_selected_enter_date', 'ru', '🆕 *Создать визит*\n\nКлиент: #{cid}\n\nВведите *дату визита* (ДД.ММ.ГГГГ):', 'telegram', 'system'),
('telegram.visit_create.customer_selected_enter_date', 'uz', '🆕 *Vizit yaratish*\n\nMijoz: #{cid}\n\n*Vizit sanasini* kiriting (KK.OO.YYYY):', 'telegram', 'system'),
('telegram.visit_create.customer_selected_enter_date', 'en', '🆕 *Create visit*\n\nCustomer: #{cid}\n\nEnter *visit date* (DD.MM.YYYY):', 'telegram', 'system'),

('telegram.visit_create.invalid_date_format', 'ru', '❌ Неверный формат даты. Введите дату в формате ДД.ММ.ГГГГ (например, 25.12.2024):', 'telegram', 'system'),
('telegram.visit_create.invalid_date_format', 'uz', '❌ Noto''g''ri sana formati. Sanani KK.OO.YYYY formatida kiriting (masalan, 25.12.2024):', 'telegram', 'system'),
('telegram.visit_create.invalid_date_format', 'en', '❌ Invalid date format. Enter date as DD.MM.YYYY (e.g. 25.12.2024):', 'telegram', 'system'),

('telegram.visit_create.date_ok_enter_time', 'ru', '✅ Дата: {date}\n\nВведите *время визита* (ЧЧ:ММ) или нажмите /skip чтобы пропустить:', 'telegram', 'system'),
('telegram.visit_create.date_ok_enter_time', 'uz', '✅ Sana: {date}\n\n*Vizit vaqtini* kiriting (SS:DD) yoki o''tkazib yuborish uchun /skip bosing:', 'telegram', 'system'),
('telegram.visit_create.date_ok_enter_time', 'en', '✅ Date: {date}\n\nEnter *visit time* (HH:MM) or press /skip to skip:', 'telegram', 'system'),

('telegram.visit_create.invalid_time_format', 'ru', '❌ Неверный формат времени. Введите время в формате ЧЧ:ММ (например, 14:30) или /skip:', 'telegram', 'system'),
('telegram.visit_create.invalid_time_format', 'uz', '❌ Noto''g''ri vaqt formati. Vaqtni SS:DD formatida kiriting (masalan, 14:30) yoki /skip:', 'telegram', 'system'),
('telegram.visit_create.invalid_time_format', 'en', '❌ Invalid time format. Enter time as HH:MM (e.g. 14:30) or /skip:', 'telegram', 'system'),

('telegram.visit_create.confirm_header', 'ru', '📋 *Подтверждение визита:*\n', 'telegram', 'system'),
('telegram.visit_create.confirm_header', 'uz', '📋 *Vizitni tasdiqlash:*\n', 'telegram', 'system'),
('telegram.visit_create.confirm_header', 'en', '📋 *Confirm visit:*\n', 'telegram', 'system'),

('telegram.visit_create.label_client', 'ru', '*Клиент:*', 'telegram', 'system'),
('telegram.visit_create.label_client', 'uz', '*Mijoz:*', 'telegram', 'system'),
('telegram.visit_create.label_client', 'en', '*Customer:*', 'telegram', 'system'),

('telegram.visit_create.label_date', 'ru', '*Дата:*', 'telegram', 'system'),
('telegram.visit_create.label_date', 'uz', '*Sana:*', 'telegram', 'system'),
('telegram.visit_create.label_date', 'en', '*Date:*', 'telegram', 'system'),

('telegram.visit_create.label_time', 'ru', '*Время:*', 'telegram', 'system'),
('telegram.visit_create.label_time', 'uz', '*Vaqt:*', 'telegram', 'system'),
('telegram.visit_create.label_time', 'en', '*Time:*', 'telegram', 'system'),

('telegram.visit_create.visit_created_ok', 'ru', '✅ *Визит создан!*\n\nВизит #{visit_id}\nКлиент: #{cid}\nДата: {date}\nВремя: {time}', 'telegram', 'system'),
('telegram.visit_create.visit_created_ok', 'uz', '✅ *Vizit yaratildi!*\n\nVizit #{visit_id}\nMijoz: #{cid}\nSana: {date}\nVaqt: {time}', 'telegram', 'system'),
('telegram.visit_create.visit_created_ok', 'en', '✅ *Visit created!*\n\nVisit #{visit_id}\nCustomer: #{cid}\nDate: {date}\nTime: {time}', 'telegram', 'system'),

('telegram.agent.visit_complete_enter_comment', 'ru', 'Визит #{vid}\n\nВведите комментарий (минимум 10 символов):', 'telegram', 'system'),
('telegram.agent.visit_complete_enter_comment', 'uz', 'Vizit #{vid}\n\nIzoh kiriting (kamida 10 belgi):', 'telegram', 'system'),
('telegram.agent.visit_complete_enter_comment', 'en', 'Visit #{vid}\n\nEnter comment (minimum 10 characters):', 'telegram', 'system'),

('telegram.agent.visit_cancel_enter_reason', 'ru', 'Визит #{vid}\n\nВведите причину (или «-» чтобы пропустить):', 'telegram', 'system'),
('telegram.agent.visit_cancel_enter_reason', 'uz', 'Vizit #{vid}\n\nSababni kiriting (yoki o''tkazib yuborish uchun «-» kiriting):', 'telegram', 'system'),
('telegram.agent.visit_cancel_enter_reason', 'en', 'Visit #{vid}\n\nEnter reason (or «-» to skip):', 'telegram', 'system'),

('telegram.agent.visit_comment_too_short', 'ru', '❌ Комментарий минимум 10 символов. Введите снова:', 'telegram', 'system'),
('telegram.agent.visit_comment_too_short', 'uz', '❌ Izoh kamida 10 belgi bo''lishi kerak. Qayta kiriting:', 'telegram', 'system'),
('telegram.agent.visit_comment_too_short', 'en', '❌ Comment must be at least 10 characters. Enter again:', 'telegram', 'system')

ON CONFLICT (translation_key, language_code) DO NOTHING;
"""


async def main():
    async with async_session() as session:
        await session.execute(text(SQL))
        await session.commit()
        result = await session.execute(text(
            """SELECT COUNT(*) FROM "Sales".translations
               WHERE translation_key LIKE 'telegram.visit_create.%'
                  OR translation_key IN (
                      'telegram.agent.visit_complete_enter_comment',
                      'telegram.agent.visit_cancel_enter_reason',
                      'telegram.agent.visit_comment_too_short'
                  )"""
        ))
        count = result.scalar()
        print(f"OK: {count} translation rows for visit creation flow in DB")


asyncio.run(main())
