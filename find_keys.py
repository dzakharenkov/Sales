import os
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
res = urlparse(db_url)
conn = psycopg2.connect(dbname=res.path[1:], user=res.username, password=res.password, host=res.hostname, port=res.port)
cur = conn.cursor()

def q(text):
    cur.execute("SELECT translation_key, translation_text FROM \"Sales\".translations WHERE language_code='ru' AND translation_text ILIKE %s", ('%' + text + '%',))
    print(f"--- {text} ---")
    for row in cur.fetchall():
        if row[0] not in ('shown_on_map', 'of_lbl', 'yandex_key_required', 'comment_completed_hint', 'comment_completed_hint_req', 'ops_search_hint_empty', 'ui.shown_on_map', 'ui.of_lbl', 'ui.yandex_key_required', 'ui.comment_completed_hint', 'ui.comment_completed_hint_req', 'ui.ops_search_hint_empty'):
            print(row[0], ":", row[1])

q("Отображено кли")
q("Яндекс.К")
q("При статусе «Завершён» укажите")
q("При статусе «Завершён» обязательно")
q("Укажите критерии поиска и нажмите")
q("из")

cur.close()
conn.close()
