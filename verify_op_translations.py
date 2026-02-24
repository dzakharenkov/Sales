import os, psycopg2
from dotenv import load_dotenv
load_dotenv()
url = os.environ['DATABASE_URL'].replace('postgresql+psycopg2://', 'postgresql://')
conn = psycopg2.connect(url)
cur = conn.cursor()

cur.execute("SELECT language_code, COUNT(*) FROM \"Sales\".translations GROUP BY language_code ORDER BY language_code")
print("All translations by language:")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

for prefix in ('ui.op.', 'ui.alloc.', 'ui.wh_receipt.'):
    cur.execute("SELECT COUNT(DISTINCT translation_key) FROM \"Sales\".translations WHERE translation_key LIKE %s", (prefix + '%',))
    print(f"{prefix}* distinct keys: {cur.fetchone()[0]}")

cur.close()
conn.close()
