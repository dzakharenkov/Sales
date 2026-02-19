# test_db_connection.py
import psycopg2
from psycopg2 import sql, Error
from datetime import datetime

# 🔌 Параметры подключения
DB_CONFIG = {
    'host': '45.141.76.83',
    'port': 5433,
    'database': 'localdb',
    'user': 'postgres',
    'password': '!Tesla11'
}


def test_connection():
    """Тест базового подключения"""
    try:
        print("=" * 60)
        print("🔗 ТЕСТ ПОДКЛЮЧЕНИЯ К БАЗЕ ДАННЫХ")
        print("=" * 60)

        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # Проверка версии PostgreSQL
        cur.execute('SELECT version();')
        version = cur.fetchone()
        print(f"\n✅ Подключение успешно!")
        print(f"📌 PostgreSQL версия: {version[0]}\n")

        conn.close()
        return True

    except Error as e:
        print(f"\n❌ Ошибка подключения: {e}")
        return False


def test_schema_sales():
    """Проверка наличия схемы Sales и её таблиц"""
    try:
        print("=" * 60)
        print("📋 ПРОВЕРКА СХЕМЫ 'Sales'")
        print("=" * 60)

        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # 1️⃣ Проверка наличия схемы
        cur.execute("""
            SELECT EXISTS(
                SELECT 1 FROM information_schema.schemata 
                WHERE schema_name = 'Sales'
            );
        """)
        schema_exists = cur.fetchone()[0]

        if schema_exists:
            print("\n✅ Схема 'Sales' существует!\n")
        else:
            print("\n❌ Схема 'Sales' НЕ найдена!")
            conn.close()
            return False

        # 2️⃣ Список всех таблиц в схеме Sales
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'Sales'
            ORDER BY table_name;
        """)
        tables = cur.fetchall()

        print(f"📊 Таблицы в схеме 'Sales' ({len(tables)} шт):\n")
        for i, table in enumerate(tables, 1):
            print(f"  {i}. {table[0]}")

        conn.close()
        return True

    except Error as e:
        print(f"\n❌ Ошибка при проверке схемы: {e}")
        return False


def test_users_table():
    """Проверка таблицы users"""
    try:
        print("\n" + "=" * 60)
        print("👥 ПРОВЕРКА ТАБЛИЦЫ 'users'")
        print("=" * 60)

        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # Структура таблицы
        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'Sales' AND table_name = 'users'
            ORDER BY ordinal_position;
        """)
        columns = cur.fetchall()

        print("\n📐 Структура таблицы:\n")
        print(f"{'Поле':<20} {'Тип данных':<20} {'Null':<10}")
        print("-" * 50)
        for col in columns:
            null_status = "✓" if col[2] == "YES" else "✗"
            print(f"{col[0]:<20} {col[1]:<20} {null_status:<10}")

        # Количество пользователей
        cur.execute("SELECT COUNT(*) FROM \"Sales\".users;")
        count = cur.fetchone()[0]
        print(f"\n👤 Всего пользователей: {count}\n")

        # Список пользователей
        if count > 0:
            cur.execute("""
                SELECT login, fio, role, status 
                FROM "Sales".users 
                LIMIT 10;
            """)
            users = cur.fetchall()

            print("Список пользователей:")
            print(f"{'Login':<20} {'ФИО':<30} {'Role':<15} {'Status':<10}")
            print("-" * 75)
            for user in users:
                print(f"{user[0]:<20} {user[1]:<30} {user[2]:<15} {user[3]:<10}")

        conn.close()
        return True

    except Error as e:
        print(f"\n❌ Ошибка при чтении таблицы users: {e}")
        return False


def test_product_table():
    """Проверка таблицы product"""
    try:
        print("\n" + "=" * 60)
        print("🛍️  ПРОВЕРКА ТАБЛИЦЫ 'product'")
        print("=" * 60)

        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # Количество продуктов
        cur.execute("SELECT COUNT(*) FROM \"Sales\".product;")
        count = cur.fetchone()[0]
        print(f"\n📦 Всего продуктов: {count}\n")

        # Список продуктов
        if count > 0:
            cur.execute("""
                SELECT code, name, type_id, weight_g, price, expiry_days 
                FROM "Sales".product 
                LIMIT 10;
            """)
            products = cur.fetchall()

            print("Список продуктов:")
            print(f"{'Code':<6} {'Название':<35} {'Тип':<10} {'Вес (г)':<8} {'Цена':<10} {'Срок':<6}")
            print("-" * 90)
            for prod in products:
                name = prod[1][:33] if len(prod[1]) > 33 else prod[1]
                print(
                    f"{prod[0]:<6} {name:<35} {prod[2]:<10} {prod[3] or '-':<8} {prod[4] or '-':<10} {prod[5] or '-':<6}")

        conn.close()
        return True

    except Error as e:
        print(f"\n❌ Ошибка при чтении таблицы product: {e}")
        return False


def test_warehouse_table():
    """Проверка таблицы warehouse"""
    try:
        print("\n" + "=" * 60)
        print("🏭 ПРОВЕРКА ТАБЛИЦЫ 'warehouse'")
        print("=" * 60)

        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # Количество складов
        cur.execute("SELECT COUNT(*) FROM \"Sales\".warehouse;")
        count = cur.fetchone()[0]
        print(f"\n📊 Всего складов: {count}\n")

        # Список складов
        if count > 0:
            cur.execute("""
                SELECT code, name, type, storekeeper, agent 
                FROM "Sales".warehouse 
                LIMIT 10;
            """)
            warehouses = cur.fetchall()

            print("Список складов:")
            print(f"{'Code':<20} {'Название':<35} {'Тип':<20} {'Кладовщик':<15} {'Агент':<20}")
            print("-" * 110)
            for wh in warehouses:
                name = wh[1][:33] if wh[1] and len(wh[1]) > 33 else (wh[1] or '-')
                wh_type = wh[2][:18] if wh[2] and len(wh[2]) > 18 else (wh[2] or '-')
                print(f"{wh[0]:<20} {name:<35} {wh_type:<20} {wh[3] or '-':<15} {wh[4] or '-':<20}")

        conn.close()
        return True

    except Error as e:
        print(f"\n❌ Ошибка при чтении таблицы warehouse: {e}")
        return False


def test_all_tables_count():
    """Вывести количество записей во всех таблицах"""
    try:
        print("\n" + "=" * 60)
        print("📊 СТАТИСТИКА ПО ВСЕМ ТАБЛИЦАМ")
        print("=" * 60)

        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        # Список таблиц
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'Sales'
            ORDER BY table_name;
        """)
        tables = cur.fetchall()

        print("\n")
        total_records = 0

        for table in tables:
            table_name = table[0]
            cur.execute(f'SELECT COUNT(*) FROM "Sales"."{table_name}";')
            count = cur.fetchone()[0]
            total_records += count
            status = "✅" if count > 0 else "⚪"
            print(f"{status} {table_name:<25} - {count:>6} записей")

        print("-" * 50)
        print(f"📈 ВСЕГО записей: {total_records}")

        conn.close()
        return True

    except Error as e:
        print(f"\n❌ Ошибка при подсчёте: {e}")
        return False


def main():
    """Главная функция для запуска всех тестов"""
    print("\n")
    print("🚀 ТЕСТИРОВАНИЕ ПОДКЛЮЧЕНИЯ К DistroFlow DATABASE")
    print(f"🕐 Время запуска: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n")

    # Запуск всех тестов
    results = {
        "Подключение": test_connection(),
        "Схема Sales": test_schema_sales(),
        "Таблица users": test_users_table(),
        "Таблица product": test_product_table(),
        "Таблица warehouse": test_warehouse_table(),
        "Статистика": test_all_tables_count(),
    }

    # Итоги
    print("\n" + "=" * 60)
    print("📋 ИТОГИ ТЕСТИРОВАНИЯ")
    print("=" * 60)
    print()

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")

    print("\n" + "-" * 60)
    print(f"Пройдено: {passed}/{total} тестов")

    if passed == total:
        print("\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО! Готов к разработке DistroFlow!")
    else:
        print(f"\n⚠️  Ошибки обнаружены. Проверь логи выше.")

    print("\n")


if __name__ == "__main__":
    main()