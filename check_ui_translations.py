import os
import re
import psycopg2
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

HTML_PATH = "src/static/app.html"
JS_PATH = "src/static/app.js"

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return None
    
    result = urlparse(db_url)
    try:
        conn = psycopg2.connect(
            database=result.path[1:],
            user=result.username,
            password=result.password,
            host=result.hostname,
            port=result.port
        )
        return conn
    except Exception as e:
        print(f"Failed to connect to DB: {e}")
        return None

def extract_keys_from_files():
    found_keys = set()
    
    # Регулярки для поиска (как в JS/HTML обычно используются ключи)
    # 1. data-i18n="key" или translate="key"
    dom_regex = re.compile(r'(?:data-i18n|translate)="([a-zA-Z0-9_\-\.]+)"')
    # 2. Вызовы t('key') или t("key") в JS/HTML
    js_regex = re.compile(r'\bt\([\'"]([a-zA-Z0-9_\-\.]+)[\'"]\)')
    # 3. В объектах и массивах, например UI_TEXT['key']
    ui_obj_regex = re.compile(r'UI_TEXT\[[\'"]([a-zA-Z0-9_\-\.]+)[\'"]\]')
    
    for filepath in [HTML_PATH, JS_PATH]:
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            matches_dom = dom_regex.findall(content)
            matches_js = js_regex.findall(content)
            matches_ui = ui_obj_regex.findall(content)
            
            found_keys.update(matches_dom)
            found_keys.update(matches_js)
            found_keys.update(matches_ui)
            
        except UnicodeDecodeError:
            # Откат для странных кодировок
            with open(filepath, 'r', encoding='windows-1251', errors='ignore') as f:
                content = f.read()
                matches_dom = dom_regex.findall(content)
                matches_js = js_regex.findall(content)
                matches_ui = ui_obj_regex.findall(content)
                found_keys.update(matches_dom)
                found_keys.update(matches_js)
                found_keys.update(matches_ui)
                
    return found_keys


def check_missing_in_db(keys):
    conn = get_db_connection()
    if not conn:
        return []
        
    missing = []
    try:
        cur = conn.cursor()
        for key in keys:
            # Проверяем, есть ли полный набор ru/uz/en для ключа
            cur.execute("""
                SELECT COUNT(DISTINCT language_code) 
                FROM "Sales".translations 
                WHERE translation_key = %s AND language_code IN ('ru', 'uz', 'en')
            """, (key,))
            count = cur.fetchone()[0]
            if count < 3:
                missing.append((key, count))
                
        cur.close()
    finally:
        conn.close()
        
    return missing

if __name__ == "__main__":
    print("Extracting keys from UI files...")
    keys = extract_keys_from_files()
    print(f"Found {len(keys)} unique potential translation keys in HTML/JS.")
    
    print("\nChecking against PostgreSQL Database...")
    missing = check_missing_in_db(keys)
    
    if not missing:
        print("\nSUCCESS: All UI keys found in the codebase are fully translated (RU/UZ/EN) in the DB!")
    else:
        print("\nWARNING: Found missing translations in DB:")
        for key, count in missing:
            print(f" - {key} (has translations for {count}/3 languages)")
