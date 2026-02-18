"""
Скрипт для применения SQL миграции к базе данных.
Использование: python apply_migration.py migrations/add_test_cities_territories.sql
"""
import sys
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

async def apply_migration(sql_file: str):
    """Применить SQL миграцию из файла."""
    # Параметры подключения из .env
    db_host = os.getenv("DATABASE_HOST", "45.141.76.83")
    db_port = int(os.getenv("DATABASE_PORT", "5433"))
    db_name = os.getenv("DATABASE_NAME", "localdb")
    db_user = os.getenv("DATABASE_USER", "postgres")
    db_password = os.getenv("DATABASE_PASSWORD", "!Tesla11")

    print(f"Connecting to {db_host}:{db_port}/{db_name} as {db_user}...")

    try:
        # Подключение к БД
        conn = await asyncpg.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
        )

        print(f"Connected successfully!")
        print(f"Reading SQL from: {sql_file}")

        # Читаем SQL из файла
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql = f.read()

        print(f"Executing SQL migration...")

        # Выполняем SQL (используем execute для множественных команд)
        await conn.execute(sql)

        print(f"Migration completed successfully!")

        # Проверяем что данные добавились
        print("\nChecking cities:")
        cities = await conn.fetch('SELECT id, name, is_active FROM "Sales".cities ORDER BY id')
        for city in cities:
            print(f"  {city['id']}: {city['name']} (active={city['is_active']})")

        print("\nChecking territories:")
        territories = await conn.fetch('SELECT id, name, is_active FROM "Sales".territories ORDER BY id')
        for terr in territories:
            print(f"  {terr['id']}: {terr['name']} (active={terr['is_active']})")

        await conn.close()
        print("Connection closed.")

    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python apply_migration.py <sql_file>")
        sys.exit(1)

    sql_file = sys.argv[1]
    if not os.path.exists(sql_file):
        print(f"File not found: {sql_file}")
        sys.exit(1)

    asyncio.run(apply_migration(sql_file))
