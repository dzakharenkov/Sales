import psycopg2
import uuid
import datetime

conn = psycopg2.connect('postgresql://postgres:!Tesla11@45.141.76.83:5433/localdb')
cur = conn.cursor()

new_translations = [
    # Новое уведомление о визите
    ('telegram.visit_notify.new_visit', 'en', '📅 <b>New visit #{id}</b>', 'telegram'),
    ('telegram.visit_notify.new_visit', 'ru', '📅 <b>Новый визит #{id}</b>', 'telegram'),
    ('telegram.visit_notify.new_visit', 'uz', '📅 <b>Yangi tashrif #{id}</b>', 'telegram'),
    
    ('telegram.visit_notify.client', 'en', '👤 Client: {client}', 'telegram'),
    ('telegram.visit_notify.client', 'ru', '👤 Клиент: {client}', 'telegram'),
    ('telegram.visit_notify.client', 'uz', '👤 Mijoz: {client}', 'telegram'),
    
    ('telegram.visit_notify.date', 'en', '🕒 Date: {date}', 'telegram'),
    ('telegram.visit_notify.date', 'ru', '🕒 Дата: {date}', 'telegram'),
    ('telegram.visit_notify.date', 'uz', '🕒 Sana: {date}', 'telegram'),

    # Карточка "Мои визиты" (detail)
    ('telegram.visit_card.title', 'en', '📋 *Visit #{id}*', 'telegram'),
    ('telegram.visit_card.title', 'ru', '📋 *Визит #{id}*', 'telegram'),
    ('telegram.visit_card.title', 'uz', '📋 *Tashrif #{id}*', 'telegram'),

    ('telegram.visit_card.client', 'en', '*Client:* {client}', 'telegram'),
    ('telegram.visit_card.client', 'ru', '*Клиент:* {client}', 'telegram'),
    ('telegram.visit_card.client', 'uz', '*Mijoz:* {client}', 'telegram'),

    ('telegram.visit_card.phone', 'en', '*Phone:* {phone}', 'telegram'),
    ('telegram.visit_card.phone', 'ru', '*Телефон:* {phone}', 'telegram'),
    ('telegram.visit_card.phone', 'uz', '*Telefon:* {phone}', 'telegram'),

    ('telegram.visit_card.address', 'en', '*Address:* {address}', 'telegram'),
    ('telegram.visit_card.address', 'ru', '*Адрес:* {address}', 'telegram'),
    ('telegram.visit_card.address', 'uz', '*Manzil:* {address}', 'telegram'),

    ('telegram.visit_card.date', 'en', '*Date:* {date}', 'telegram'),
    ('telegram.visit_card.date', 'ru', '*Дата:* {date}', 'telegram'),
    ('telegram.visit_card.date', 'uz', '*Sana:* {date}', 'telegram'),

    ('telegram.visit_card.time', 'en', '*Time:* {time}', 'telegram'),
    ('telegram.visit_card.time', 'ru', '*Время:* {time}', 'telegram'),
    ('telegram.visit_card.time', 'uz', '*Vaqt:* {time}', 'telegram'),

    ('telegram.visit_card.status', 'en', '*Status:* {status}', 'telegram'),
    ('telegram.visit_card.status', 'ru', '*Статус:* {status}', 'telegram'),
    ('telegram.visit_card.status', 'uz', '*Holat:* {status}', 'telegram'),

    ('telegram.visit_card.comment', 'en', '*Comment:* {comment}', 'telegram'),
    ('telegram.visit_card.comment', 'ru', '*Комментарий:* {comment}', 'telegram'),
    ('telegram.visit_card.comment', 'uz', '*Izoh:* {comment}', 'telegram'),

    ('telegram.visit_card.photos', 'en', '📷 Photos: {count}', 'telegram'),
    ('telegram.visit_card.photos', 'ru', '📷 Фотографий: {count}', 'telegram'),
    ('telegram.visit_card.photos', 'uz', '📷 Rasmlar: {count}', 'telegram'),
    
    ('telegram.visit_card.completed_btn', 'en', '✅ Mark as done', 'telegram'),
    ('telegram.visit_card.completed_btn', 'ru', '✅ Отметить выполнено', 'telegram'),
    ('telegram.visit_card.completed_btn', 'uz', '✅ Bajarildi deb belgilash', 'telegram'),
    
    ('telegram.visit_card.cancelled_btn', 'en', '❌ Mark as not done', 'telegram'),
    ('telegram.visit_card.cancelled_btn', 'ru', '❌ Отметить не выполнено', 'telegram'),
    ('telegram.visit_card.cancelled_btn', 'uz', '❌ Bajarilmadi deb belgilash', 'telegram'),
    
    ('telegram.visit_card.photos_btn', 'en', '📸 Photos', 'telegram'),
    ('telegram.visit_card.photos_btn', 'ru', '📸 Фотографии', 'telegram'),
    ('telegram.visit_card.photos_btn', 'uz', '📸 Rasmlar', 'telegram'),
]

for key, lang, text, category in new_translations:
    cur.execute('''
        INSERT INTO "Sales".translations (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, 'sys', 'sys', now(), now())
        ON CONFLICT (translation_key, language_code) 
        DO UPDATE SET translation_text = EXCLUDED.translation_text, updated_at = now()
    ''', (str(uuid.uuid4()), key, lang, text, category))
    
conn.commit()
print("Translations inserted successfully.")
