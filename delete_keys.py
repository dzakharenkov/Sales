import os
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL')
res = urlparse(db_url)
conn = psycopg2.connect(dbname=res.path[1:], user=res.username, password=res.password, host=res.hostname, port=res.port)
cur = conn.cursor()

keys_to_delete = [
    'shown_on_map', 'ui.shown_on_map', 
    'of_lbl', 'ui.of_lbl', 
    'yandex_key_required', 'ui.yandex_key_required', 
    'comment_completed_hint', 'ui.comment_completed_hint', 
    'comment_completed_hint_req', 'ui.comment_completed_hint_req', 
    'ops_search_hint_empty', 'ui.ops_search_hint_empty'
]

cur.execute("DELETE FROM \"Sales\".translations WHERE translation_key = ANY(%s)", (keys_to_delete,))
print(f"Deleted rows: {cur.rowcount}")

conn.commit()
cur.close()
conn.close()
