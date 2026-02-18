-- Миграция: Справочники городов и территорий с ID
-- Дата: 2026-02-17
-- Заменяет старые таблицы city и territory на новые cities и territories с INTEGER ID

-- 0. Удаление старых таблиц (если существуют)
DROP TABLE IF EXISTS "Sales".city CASCADE;
DROP TABLE IF EXISTS "Sales".territory CASCADE;

-- 1. Создание таблицы справочника городов
CREATE TABLE IF NOT EXISTS "Sales".cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Создание таблицы справочника территорий
CREATE TABLE IF NOT EXISTS "Sales".territories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Перенос существующих данных из customers в справочники
-- Используем DO блок с динамическим SQL для обработки переименованных колонок
DO $$
DECLARE
    city_column_name TEXT;
    territory_column_name TEXT;
BEGIN
    -- Определяем имя колонки города
    SELECT column_name INTO city_column_name
    FROM information_schema.columns
    WHERE table_schema = 'Sales' AND table_name = 'customers'
      AND column_name IN ('city', 'city_old')
    ORDER BY CASE WHEN column_name = 'city' THEN 1 ELSE 2 END
    LIMIT 1;

    -- Определяем имя колонки территории
    SELECT column_name INTO territory_column_name
    FROM information_schema.columns
    WHERE table_schema = 'Sales' AND table_name = 'customers'
      AND column_name IN ('territory', 'territory_old')
    ORDER BY CASE WHEN column_name = 'territory' THEN 1 ELSE 2 END
    LIMIT 1;

    -- Переносим города если колонка найдена
    IF city_column_name IS NOT NULL THEN
        EXECUTE format('
            INSERT INTO "Sales".cities (name)
            SELECT DISTINCT %I
            FROM "Sales".customers
            WHERE %I IS NOT NULL AND %I != ''''
            ON CONFLICT (name) DO NOTHING
        ', city_column_name, city_column_name, city_column_name);
    END IF;

    -- Переносим территории если колонка найдена
    IF territory_column_name IS NOT NULL THEN
        EXECUTE format('
            INSERT INTO "Sales".territories (name)
            SELECT DISTINCT %I
            FROM "Sales".customers
            WHERE %I IS NOT NULL AND %I != ''''
            ON CONFLICT (name) DO NOTHING
        ', territory_column_name, territory_column_name, territory_column_name);
    END IF;
END $$;

-- 4. Добавление новых колонок с foreign key
ALTER TABLE "Sales".customers
ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES "Sales".cities(id),
ADD COLUMN IF NOT EXISTS territory_id INTEGER REFERENCES "Sales".territories(id);

-- 5. Заполнение новых колонок данными из старых
DO $$
DECLARE
    city_column_name TEXT;
    territory_column_name TEXT;
BEGIN
    -- Определяем имя колонки города
    SELECT column_name INTO city_column_name
    FROM information_schema.columns
    WHERE table_schema = 'Sales' AND table_name = 'customers'
      AND column_name IN ('city', 'city_old')
    ORDER BY CASE WHEN column_name = 'city' THEN 1 ELSE 2 END
    LIMIT 1;

    -- Определяем имя колонки территории
    SELECT column_name INTO territory_column_name
    FROM information_schema.columns
    WHERE table_schema = 'Sales' AND table_name = 'customers'
      AND column_name IN ('territory', 'territory_old')
    ORDER BY CASE WHEN column_name = 'territory' THEN 1 ELSE 2 END
    LIMIT 1;

    -- Заполняем city_id
    IF city_column_name IS NOT NULL THEN
        EXECUTE format('
            UPDATE "Sales".customers c
            SET city_id = (SELECT id FROM "Sales".cities WHERE name = c.%I)
            WHERE c.%I IS NOT NULL AND c.%I != ''''
        ', city_column_name, city_column_name, city_column_name);
    END IF;

    -- Заполняем territory_id
    IF territory_column_name IS NOT NULL THEN
        EXECUTE format('
            UPDATE "Sales".customers c
            SET territory_id = (SELECT id FROM "Sales".territories WHERE name = c.%I)
            WHERE c.%I IS NOT NULL AND c.%I != ''''
        ', territory_column_name, territory_column_name, territory_column_name);
    END IF;
END $$;

-- 6. Переименование старых колонок (сохраняем для отката) - только если они еще не переименованы
DO $$
BEGIN
    -- Переименовываем city в city_old если колонка city существует
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'city') THEN
        ALTER TABLE "Sales".customers RENAME COLUMN city TO city_old;
    END IF;

    -- Переименовываем territory в territory_old если колонка territory существует
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'territory') THEN
        ALTER TABLE "Sales".customers RENAME COLUMN territory TO territory_old;
    END IF;
END $$;

-- ОТКАТ (если нужно):
-- ALTER TABLE "Sales".customers RENAME COLUMN city_old TO city;
-- ALTER TABLE "Sales".customers RENAME COLUMN territory_old TO territory;
-- ALTER TABLE "Sales".customers DROP COLUMN city_id;
-- ALTER TABLE "Sales".customers DROP COLUMN territory_id;
-- DROP TABLE "Sales".cities;
-- DROP TABLE "Sales".territories;

COMMENT ON TABLE "Sales".cities IS 'Справочник городов';
COMMENT ON TABLE "Sales".territories IS 'Справочник территорий';
COMMENT ON COLUMN "Sales".customers.city_id IS 'Ссылка на справочник городов';
COMMENT ON COLUMN "Sales".customers.territory_id IS 'Ссылка на справочник территорий';
