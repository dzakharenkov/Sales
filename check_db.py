"""Проверка таблиц cities и territories в БД."""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

async def check_db():
    """Проверить наличие таблиц и данных."""
    db_host = os.getenv("DATABASE_HOST", "45.141.76.83")
    db_port = int(os.getenv("DATABASE_PORT", "5433"))
    db_name = os.getenv("DATABASE_NAME", "localdb")
    db_user = os.getenv("DATABASE_USER", "postgres")
    db_password = os.getenv("DATABASE_PASSWORD")

    print(f"Connecting to {db_host}:{db_port}/{db_name} as {db_user}...")

    try:
        conn = await asyncpg.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password,
        )

        print("[OK] Connected successfully!\n")

        # Проверяем таблицу cities
        print("=== Checking cities table ===")
        try:
            cities = await conn.fetch('SELECT id, name, is_active FROM "Sales".cities ORDER BY id')
            print(f"[OK] Cities table exists, rows: {len(cities)}")
            for city in cities:
                print(f"  {city['id']}: {city['name']} (active={city['is_active']})")
        except Exception as e:
            print(f"[ERROR] querying cities: {e}")

        print()

        # Проверяем таблицу territories
        print("=== Checking territories table ===")
        try:
            territories = await conn.fetch('SELECT id, name, is_active FROM "Sales".territories ORDER BY id')
            print(f"[OK] Territories table exists, rows: {len(territories)}")
            for terr in territories:
                print(f"  {terr['id']}: {terr['name']} (active={terr['is_active']})")
        except Exception as e:
            print(f"[ERROR] querying territories: {e}")

        print()

        # Проверяем колонки в customers
        print("=== Checking customers table columns ===")
        try:
            columns = await conn.fetch("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_schema = 'Sales' AND table_name = 'customers'
                  AND column_name IN ('city_id', 'territory_id', 'city', 'territory', 'city_old', 'territory_old')
                ORDER BY column_name
            """)
            print(f"[OK] Columns in customers:")
            for col in columns:
                print(f"  {col['column_name']}: {col['data_type']}")
        except Exception as e:
            print(f"[ERROR] checking customers columns: {e}")

        await conn.close()

    except Exception as e:
        print(f"[ERROR] CONNECTION: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
