import os
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
res = urlparse(db_url)
conn = psycopg2.connect(dbname=res.path[1:], user=res.username, password=res.password, host=res.hostname, port=res.port)
cur = conn.cursor()

def q(text, fh):
    cur.execute("SELECT translation_key, translation_text FROM \"Sales\".translations WHERE language_code='ru' AND translation_text ILIKE %s", ('%' + text + '%',))
    fh.write(f"--- {text} ---\n")
    for row in cur.fetchall():
        if row[0] not in ('shown_on_map', 'of_lbl', 'yandex_key_required', 'comment_completed_hint', 'comment_completed_hint_req', 'ops_search_hint_empty', 'ui.shown_on_map', 'ui.of_lbl', 'ui.yandex_key_required', 'ui.comment_completed_hint', 'ui.comment_completed_hint_req', 'ui.ops_search_hint_empty'):
            fh.write(f"{row[0]} \n {row[1]}\n")

with open('keys_out.txt', 'w', encoding='utf-8') as f:
    q("Отображено кли", f)
    q("Яндекс.К", f)
    q("При статусе «Завершён» укажите", f)
    q("При статусе «Завершён» обязательно", f)
    q("Укажите критерии поиска и нажмите", f)

cur.close()
conn.close()
