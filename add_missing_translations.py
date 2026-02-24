import os
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found")
        return None
    result = urlparse(db_url)
    return psycopg2.connect(
        database=result.path[1:],
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port
    )

translations = [
    {
        "key": "shown_on_map",
        "ru": "Отображено клиентов на карте: ",
        "uz": "Xaritada ko'rsatilgan mijozlar: ",
        "en": "Displayed clients on map: "
    },
    {
        "key": "of_lbl",
        "ru": "из",
        "uz": "dan",
        "en": "of"
    },
    {
        "key": "yandex_key_required",
        "ru": "Для Яндекс.Карт задайте YANDEX_MAPS_API_KEY на сервере или выберите OpenStreetMap.",
        "uz": "Yandex.Maps uchun serverda YANDEX_MAPS_API_KEY ni o'rnating yoki OpenStreetMap ni tanlang.",
        "en": "For Yandex.Maps set YANDEX_MAPS_API_KEY on server or select OpenStreetMap."
    },
    {
        "key": "comment_completed_hint",
        "ru": "При статусе «Завершён» укажите, что было сделано (мин. 10 символов)",
        "uz": "«Tugallangan» holatida nima qilinganligini ko'rsating (kamida 10 belgi)",
        "en": "If status is «Completed», indicate what was done (min. 10 characters)"
    },
    {
        "key": "comment_completed_hint_req",
        "ru": "При статусе «Завершён» обязательно укажите, что было сделано (мин. 10 символов)",
        "uz": "«Tugallangan» holatida nima qilinganligini ko'rsatish majburiy (kamida 10 belgi)",
        "en": "If status is «Completed», you must indicate what was done (min. 10 characters)"
    },
    {
        "key": "ops_search_hint_empty",
        "ru": "Укажите критерии поиска и нажмите «Найти» или оставьте поля пустыми и нажмите «Найти» для полного списка. По умолчанию запрос не выполняется автоматически.",
        "uz": "Qidiruv mezonlarini kiriting va «Topish» tugmasini bosing yoki to'liq ro'yxat uchun maydonlarni bo'sh qoldirib, «Topish» tugmasini bosing. Sukut bo'yicha so'rov avtomatik ravishda bajarilmaydi.",
        "en": "Specify search criteria and click «Find» or leave empty and click «Find» for full list. By default, the request is not executed automatically."
    }
]

def main():
    conn = get_db_connection()
    if not conn:
        return
    cur = conn.cursor()
    print("Connected to DB")
    import uuid
    for item in translations:
        key = item['key']
        new_id = str(uuid.uuid4())
        
        try:
            cur.execute('''
                INSERT INTO "Sales"."translations" (id, translation_key, language_code, translation_text)
                VALUES (%s, %s, 'ru', %s), (%s, %s, 'uz', %s), (%s, %s, 'en', %s)
                ON CONFLICT (translation_key, language_code) 
                DO UPDATE SET translation_text = EXCLUDED.translation_text;
            ''', (str(uuid.uuid4()), key, item['ru'], str(uuid.uuid4()), key, item['uz'], str(uuid.uuid4()), key, item['en']))
            print(f"Added {key}")
        except Exception as e:
            print("DB Error:", str(e))
            conn.rollback()
            break
        
    conn.commit()
    cur.close()
    conn.close()
    print("Done.")

if __name__ == "__main__":
    main()
