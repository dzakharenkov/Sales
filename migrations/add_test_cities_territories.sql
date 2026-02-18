-- Добавление тестовых данных для городов и территорий
-- Дата: 2026-02-17

-- 1. Создание таблиц (если не существуют)
CREATE TABLE IF NOT EXISTS "Sales".cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Sales".territories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Добавление колонок в customers (если не существуют)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'city_id') THEN
        ALTER TABLE "Sales".customers ADD COLUMN city_id INTEGER REFERENCES "Sales".cities(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'Sales' AND table_name = 'customers' AND column_name = 'territory_id') THEN
        ALTER TABLE "Sales".customers ADD COLUMN territory_id INTEGER REFERENCES "Sales".territories(id);
    END IF;
END $$;

-- 3. Добавление тестовых городов
INSERT INTO "Sales".cities (name, is_active) VALUES
    ('Ташкент', TRUE),
    ('Самарканд', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 4. Добавление тестовых территорий
INSERT INTO "Sales".territories (name, is_active) VALUES
    ('Центральный район', TRUE),
    ('Северный район', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 5. Проверка
SELECT 'Cities:' as info;
SELECT id, name, is_active FROM "Sales".cities ORDER BY id;

SELECT 'Territories:' as info;
SELECT id, name, is_active FROM "Sales".territories ORDER BY id;
