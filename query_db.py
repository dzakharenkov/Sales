import psycopg2

conn = psycopg2.connect('postgresql://postgres:!Tesla11@45.141.76.83:5433/localdb')
cur = conn.cursor()

with open('db_results.txt', 'w', encoding='utf-8') as f:
    cur.execute('SELECT translation_key, language_code, translation_text FROM "Sales".translations WHERE translation_key LIKE \'telegram.visit_create%\' ORDER BY translation_key;')
    rows = cur.fetchall()
    for r in rows:
        f.write(str(r) + '\n')
        
    cur.execute('SELECT translation_key, language_code, translation_text FROM "Sales".translations WHERE translation_text LIKE \'%Uuuu%\' OR translation_text LIKE \'%Новый визит%\' ORDER BY translation_key;')
    rows = cur.fetchall()
    f.write("\n--- Other UI keys ---\n")
    for r in rows:
        f.write(str(r) + '\n')
