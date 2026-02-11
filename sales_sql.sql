-- Схема БД Sales (актуальное состояние)
-- Обновлено: 2026-02-11. Таблицы: users, product_type, product, batches,
-- product_batches, warehouse, warehouse_stock, customers, operation_types,
-- operation_config, expiry_date_config, payment_type, status, orders,
-- items, operations, customers_visits, customer_photo.
-- VIEW: v_warehouse_stock, v_financial_ledger, v_operations_lifecycle, v_visits_statistics, v_upcoming_visits, v_customers_without_photos.
-- Функция: generate_operation_number(). Миграции: migrations/add_photo_datetime.sql
-- ============================================================

-- Расширение для UUID (PostgreSQL 13+ можно использовать gen_random_uuid() без расширения)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS "Sales";

-- Роли пользователей (в БД хранятся как TEXT)
-- CREATE TYPE "Sales".user_role AS ENUM ('admin', 'expeditor', 'agent', 'stockman', 'paymaster');

-- Пользователи
CREATE TABLE "Sales".users (
  login TEXT PRIMARY KEY,
  fio TEXT NOT NULL,
  telegram_username TEXT,
  role TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  password TEXT,
  last_login_at TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Типы продукции
CREATE TABLE "Sales".product_type (
  name TEXT PRIMARY KEY,
  description TEXT NOT NULL
);

-- Валюта
CREATE TABLE IF NOT EXISTS "Sales".currency (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  symbol TEXT,
  is_default BOOLEAN DEFAULT FALSE
);

-- Базовая валюта: сум (Узбекистан)
INSERT INTO "Sales".currency (code, name, country, symbol, is_default)
VALUES ('sum', 'сум', 'Узбекистан', 'сум', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Товары
CREATE TABLE "Sales".product (
  code VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  type_id TEXT REFERENCES "Sales".product_type(name),
  weight_g INT,
  unit TEXT,
  price DECIMAL(18,2),
  expiry_days INT,
  active BOOLEAN DEFAULT TRUE,
  last_updated_by_login TEXT REFERENCES "Sales".users(login),
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  currency_code TEXT REFERENCES "Sales".currency(code)
);

-- Партии
CREATE TABLE "Sales".batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_code VARCHAR(50) REFERENCES "Sales".product(code),
  batch_code VARCHAR(50),
  production_date DATE,
  expiry_days INT,
  expiry_date DATE,
  stock_qty INT DEFAULT 0,
  owner VARCHAR(100)
);

-- Связь партий и товаров
CREATE TABLE "Sales".product_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES "Sales".batches(id),
  product_code VARCHAR(50) REFERENCES "Sales".product(code),
  production_date DATE,
  expiry_date DATE,
  quantity INT,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- Склады
CREATE TABLE "Sales".warehouse (
  code VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  storekeeper TEXT REFERENCES "Sales".users(login),
  agent TEXT,
  expeditor_login TEXT REFERENCES "Sales".users(login)
);

-- Остатки по складам
CREATE TABLE "Sales".warehouse_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_code VARCHAR(50) NOT NULL REFERENCES "Sales".warehouse(code),
  product_code VARCHAR(50) NOT NULL REFERENCES "Sales".product(code),
  batch_id UUID REFERENCES "Sales".batches(id),
  quantity INT DEFAULT 0,
  reserved_qty INT DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT now()
);

-- Клиенты
CREATE TABLE "Sales".customers (
  id SERIAL PRIMARY KEY,
  name_client TEXT,
  firm_name TEXT,
  category_client TEXT,
  address TEXT,
  city TEXT,
  territory TEXT,
  landmark TEXT,
  phone TEXT,
  contact_person TEXT,
  tax_id TEXT,
  status TEXT,
  login_agent TEXT REFERENCES "Sales".users(login),
  login_expeditor TEXT REFERENCES "Sales".users(login),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  pinfl TEXT,
  contract_no TEXT,
  account_no TEXT,
  bank TEXT,
  mfo TEXT,
  oked TEXT,
  vat_code TEXT
);

CREATE TABLE "Sales".operation_types (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Конфигурация операций (правила для каждого типа операции)
CREATE TABLE "Sales".operation_config (
  id SERIAL PRIMARY KEY,
  operation_type_code TEXT NOT NULL UNIQUE REFERENCES "Sales".operation_types(code),
  default_status TEXT NOT NULL DEFAULT 'completed',
  required_fields TEXT NOT NULL,
  optional_fields TEXT NOT NULL DEFAULT '[]',
  hidden_fields TEXT NOT NULL DEFAULT '[]',
  readonly_fields TEXT NOT NULL DEFAULT '["operation_number","type_code","status","operation_date","created_by","created_at"]',
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Конфигурация «светофора» по сроку годности
CREATE TABLE IF NOT EXISTS "Sales".expiry_date_config (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL CHECK (color IN ('GREEN', 'YELLOW', 'RED', 'BLACK')),
  min_days INTEGER NOT NULL,
  max_days INTEGER NOT NULL,
  alert_level VARCHAR(20) NOT NULL CHECK (alert_level IN ('INFO', 'WARNING', 'CRITICAL', 'ERROR')),
  description VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Типы оплаты
CREATE TABLE "Sales".payment_type (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Статусы заказов
CREATE TABLE "Sales".status (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Заказы (order_no — целочисленный PK, без отдельного id)
CREATE TABLE "Sales".orders (
  order_no SERIAL PRIMARY KEY,
  customer_id INT REFERENCES "Sales".customers(id),
  order_date TIMESTAMPTZ DEFAULT now(),
  status_code TEXT REFERENCES "Sales".status(code),
  total_amount DECIMAL(18,2),
  payment_type_code TEXT REFERENCES "Sales".payment_type(code),
  created_by TEXT REFERENCES "Sales".users(login),
  scheduled_delivery_at TIMESTAMPTZ,
  status_delivery_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  last_updated_by TEXT REFERENCES "Sales".users(login)
);

-- Позиции заказа
CREATE TABLE "Sales".items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id INT REFERENCES "Sales".orders(order_no),
  product_code VARCHAR(50) REFERENCES "Sales".product(code),
  quantity INT,
  price DECIMAL(18,2),
  last_updated_by TEXT REFERENCES "Sales".users(login),
  last_updated_at TIMESTAMPTZ DEFAULT now()
);

-- Операции (новая структура: operation_number, склады, статус, тип оплаты и др.)
CREATE TABLE "Sales".operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_number VARCHAR(50) UNIQUE NOT NULL,
  type_code TEXT NOT NULL REFERENCES "Sales".operation_types(code),
  operation_date TIMESTAMPTZ DEFAULT now(),
  completed_date TIMESTAMPTZ,
  warehouse_from VARCHAR(50) REFERENCES "Sales".warehouse(code),
  warehouse_to VARCHAR(50) REFERENCES "Sales".warehouse(code),
  product_code VARCHAR(50) REFERENCES "Sales".product(code),
  batch_id UUID REFERENCES "Sales".batches(id),
  quantity INT CHECK (quantity IS NULL OR quantity > 0),
  amount DECIMAL(18,2),
  payment_type_code TEXT REFERENCES "Sales".payment_type(code),
  customer_id INT REFERENCES "Sales".customers(id) ON DELETE SET NULL,
  order_id INT REFERENCES "Sales".orders(order_no) ON DELETE SET NULL,
  created_by TEXT NOT NULL REFERENCES "Sales".users(login),
  expeditor_login TEXT REFERENCES "Sales".users(login),
  cashier_login TEXT REFERENCES "Sales".users(login),
  storekeeper_login TEXT REFERENCES "Sales".users(login),
  related_operation_id UUID REFERENCES "Sales".operations(id),
  status TEXT DEFAULT 'pending',
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_operations_number ON "Sales".operations(operation_number);
CREATE INDEX idx_operations_type ON "Sales".operations(type_code);
CREATE INDEX idx_operations_customer ON "Sales".operations(customer_id);
CREATE INDEX idx_operations_order ON "Sales".operations(order_id);
CREATE INDEX idx_operations_warehouse ON "Sales".operations(warehouse_from, warehouse_to);
CREATE INDEX idx_operations_related ON "Sales".operations(related_operation_id);
CREATE INDEX idx_operations_status ON "Sales".operations(status);
CREATE INDEX idx_operations_date ON "Sales".operations(operation_date DESC);
CREATE INDEX idx_operations_batch ON "Sales".operations(batch_id);

CREATE SEQUENCE IF NOT EXISTS "Sales".seq_operation_number START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION "Sales".generate_operation_number()
RETURNS VARCHAR AS $$
DECLARE
  year_month VARCHAR := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  seq_num INT;
  op_num VARCHAR;
BEGIN
  seq_num := nextval('"Sales".seq_operation_number');
  op_num := 'OP-' || year_month || '-' || LPAD(seq_num::TEXT, 6, '0');
  RETURN op_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- ============================================================

-- Типы операций (актуальный перечень)
INSERT INTO "Sales".operation_types (code, name, description) VALUES
  ('warehouse_receipt', 'Приход на склад', 'Поступление товара от производителя на основной склад'),
  ('allocation', 'Выдача экспедитору', 'Выдача товара экспедитору со основного склада на его витрину'),
  ('transfer', 'Перемещение между складами', 'Перемещение товара между складами'),
  ('delivery', 'Доставка клиенту', 'Доставка товара клиенту экспедитором'),
  ('return_from_customer', 'Возврат от клиента', 'Возврат товара от клиента'),
  ('promotional_sample', 'Раздача образцов', 'Раздача товара в качестве образца (без оплаты)'),
  ('cash_receipt', 'Приём наличных', 'Приём наличных денег в кассу'),
  ('cash_return', 'Возврат денег', 'Возврат денег клиенту'),
  ('write_off', 'Списание', 'Списание товара (порча, брак, истечение)'),
  ('damage', 'Повреждение', 'Товар повреждён'),
  ('inventory', 'Инвентаризация', 'Проверка остатков товара');

-- Конфигурация операций (правила для каждого типа операции)
INSERT INTO "Sales".operation_config (
  operation_type_code,
  default_status,
  required_fields,
  optional_fields,
  hidden_fields,
  readonly_fields,
  description,
  active
) VALUES
  ('warehouse_receipt', 'completed', '["warehouse_to","product_code","quantity","expiry_date","created_by"]', '["comment"]', '["warehouse_from","customer_id","amount","payment_type_code","expeditor_login","cashier_login","order_id","related_operation_id","batch_code"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Поступление товара от производителя на основной склад', TRUE),
  ('allocation', 'completed', '["warehouse_from","warehouse_to","product_code","batch_code","quantity","expeditor_login","created_by"]', '["comment"]', '["customer_id","amount","payment_type_code","cashier_login","order_id","related_operation_id"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Выдача товара экспедитору со основного склада на его витрину', TRUE),
  ('delivery', 'pending', '["warehouse_from","product_code","batch_code","quantity","customer_id","amount","payment_type_code","expeditor_login","created_by"]', '["order_id","comment"]', '["cashier_login"]', '["operation_number","type_code","status","operation_date","created_by","created_at","related_operation_id"]', 'Доставка товара клиенту экспедитором (ожидание оплаты)', TRUE),
  ('cash_receipt', 'completed', '["customer_id","amount","payment_type_code","related_operation_id","cashier_login","created_by"]', '["expeditor_login","comment"]', '["warehouse_from","warehouse_to","product_code","batch_id","quantity","order_id"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Приём платежа от клиента за доставку', TRUE),
  ('return_from_customer', 'completed', '["warehouse_to","product_code","batch_code","quantity","customer_id","related_operation_id","expeditor_login","created_by"]', '["amount","comment"]', '["warehouse_from","payment_type_code","cashier_login","order_id"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Возврат товара от клиента (брак, порча, перепроизводство)', TRUE),
  ('cash_return', 'completed', '["customer_id","amount","payment_type_code","related_operation_id","cashier_login","created_by"]', '["comment"]', '["warehouse_from","warehouse_to","product_code","batch_id","quantity","order_id","expeditor_login"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Возврат денег клиенту', TRUE),
  ('transfer', 'completed', '["warehouse_from","warehouse_to","product_code","batch_code","quantity","created_by"]', '["comment"]', '["customer_id","amount","payment_type_code","expeditor_login","cashier_login","order_id","related_operation_id"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Перемещение товара между складами', TRUE),
  ('promotional_sample', 'completed', '["warehouse_from","product_code","batch_code","quantity","expeditor_login","created_by"]', '["comment"]', '["warehouse_to","customer_id","amount","payment_type_code","cashier_login","order_id","related_operation_id"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Раздача товара в качестве образца (без оплаты)', TRUE),
  ('write_off', 'completed', '["warehouse_from","product_code","batch_code","quantity","created_by"]', '["comment"]', '["warehouse_to","customer_id","amount","payment_type_code","expeditor_login","cashier_login","order_id","related_operation_id"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Списание товара (порча, брак, истечение срока)', TRUE),
  ('damage', 'completed', '["warehouse_from","product_code","batch_code","quantity","created_by"]', '["comment"]', '["warehouse_to","customer_id","amount","payment_type_code","expeditor_login","cashier_login","order_id","related_operation_id"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Фиксация повреждённого товара', TRUE),
  ('inventory', 'completed', '["warehouse_from","product_code","created_by"]', '["comment"]', '["warehouse_to","batch_code","quantity","customer_id","amount","payment_type_code","expeditor_login","cashier_login","order_id","related_operation_id"]', '["operation_number","type_code","status","operation_date","created_by","created_at"]', 'Проверка остатков товара на складе', TRUE);

-- Конфигурация светофоров по сроку годности
INSERT INTO "Sales".expiry_date_config
  (name, color, min_days, max_days, alert_level, description, is_active, sort_order)
VALUES
  ('Товар в норме', 'GREEN', 7, 999, 'INFO', 'Дней ≥ 7', TRUE, 1),
  ('Внимание', 'YELLOW', 3, 6, 'WARNING', '3 ≤ Дней < 7', TRUE, 2),
  ('Критичный срок', 'RED', 1, 2, 'CRITICAL', '0 < Дней < 3', TRUE, 3),
  ('Просроченный', 'BLACK', -999, 0, 'ERROR', 'Дней ≤ 0', TRUE, 4);

-- Пользователи
INSERT INTO "Sales".users (login, fio, role, status) VALUES
  ('test_exp', 'test_exp', 'expeditor', 'активен'),
  ('dzakharenkov', 'Захаренков Дмитрий', 'admin', 'активен'),
  ('stockman', 'test_stockman', 'stockman', 'активен'),
  ('paymaster', 'test_paymaster', 'paymaster', 'активен'),
  ('agent', 'test_agent', 'agent', 'активен');

-- Типы продукции
INSERT INTO "Sales".product_type (name, description) VALUES
  ('Yogurt', 'Йогурт'),
  ('Tvorog', 'Творог'),
  ('Tara', 'Ящик');

-- Товары
INSERT INTO "Sales".product (code, name, type_id, weight_g, unit, price, expiry_days, active, last_updated_by_login, last_updated_at) VALUES
  ('1', 'Йогурт клубничный', 'Yogurt', 110, 'ШТ', 6000, 12, TRUE, NULL, now()),
  ('2', 'Йогурт малиновый', 'Yogurt', 110, 'ШТ', 6000, 12, TRUE, NULL, now()),
  ('3', 'Йогурт персиковый', 'Yogurt', 110, 'ШТ', 6000, 12, TRUE, NULL, now()),
  ('4', 'Йогурт вишневый', 'Yogurt', 110, 'ШТ', 6000, 10, TRUE, NULL, now()),
  ('5', 'Йогурт груша и злаки', 'Yogurt', 110, 'ШТ', 6000, 10, TRUE, NULL, now()),
  ('6', 'Йогурт манго маракуйя', 'Yogurt', 110, 'ШТ', 6000, 12, TRUE, NULL, now()),
  ('7', 'Йогурт клубничный', 'Yogurt', 110, 'ШТ', 6000, 12, TRUE, NULL, now()),
  ('8', 'Йогурт малиновый', 'Yogurt', 200, 'ШТ', 10000, 12, TRUE, NULL, now()),
  ('9', 'Йогурт персиковый', 'Yogurt', 200, 'ШТ', 10000, 10, TRUE, NULL, now()),
  ('10', 'Йогурт вишнёвый', 'Yogurt', 200, 'ШТ', 10000, 10, TRUE, NULL, now()),
  ('11', 'Йогурт груша и злаки', 'Yogurt', 200, 'ШТ', 10000, 12, TRUE, NULL, now()),
  ('12', 'Йогурт манго маракуйя', 'Yogurt', 200, 'ШТ', 10000, 12, TRUE, NULL, now()),
  ('13', 'Творог с кусочками клубники', 'Tvorog', 200, 'ШТ', 10000, 12, TRUE, NULL, now()),
  ('14', 'Творог с кусочками малины', 'Tvorog', 160, 'ШТ', 10000, 12, TRUE, NULL, now()),
  ('15', 'Творог с кусочками персика', 'Tvorog', 160, 'ШТ', 10000, 12, TRUE, NULL, now()),
  ('16', 'Творог с кусочками вишни', 'Tvorog', 160, 'ШТ', 10000, 12, TRUE, NULL, now()),
  ('17', 'Творог с кусочками груши', 'Tvorog', 160, 'ШТ', 10000, 10, TRUE, NULL, now()),
  ('18', 'Творог с кусочками изюма', 'Tvorog', 160, 'ШТ', 10000, 10, TRUE, NULL, now()),
  ('19', 'Ящик', 'Tara', 0, 'ШТ', 0, NULL, TRUE, NULL, now());

-- Склады
INSERT INTO "Sales".warehouse (code, name, type, storekeeper, agent) VALUES
  ('w_main', 'основной склад', 'Склад реализации', 'stockman', 'Все агенты'),
  ('w_return', 'склад возврата', 'Склад возврата', 'stockman', 'Все агенты'),
  ('w_vs_abdulhamid', 'склад-vs (abdulhamid shayx-olmazor vansell)', 'Склад реализации', NULL, 'Abdulhamid shayx-olmazor Vansell'),
  ('w_vs_akrom', 'склад-vs (akrom-vansel)', 'Склад реализации', NULL, 'Akrom - vansel'),
  ('w_vs_bahodirjon', 'склад-vs (bahodirjon yunsobod)', 'Склад реализации', NULL, 'Bahodirjon Yunsobod-vansel'),
  ('w_vs_baxrom', 'склад-vs (baxrom chilonzor vansell)', 'Склад реализации', NULL, 'Baxrom chilonzor vansell'),
  ('w_vs_burxon', 'склад-vs (burxon sergeli yangihayot-vansell)', 'Склад реализации', NULL, 'Burxon sergeli yangihayot-vansell'),
  ('w_vs_fotihbek', 'склад-vs (fotihbek yashnobod-vansel)', 'Склад реализации', NULL, 'Fotihbek Yashnobod-vansel'),
  ('w_vs_ilhom', 'склад-vs (ilhom mirobod yakkasaroy-vansel)', 'Склад реализации', NULL, 'Ilhom mirobod Yakkasaroy-vansel'),
  ('w_vs_javohir', 'склад-vs (javohir uchtepa-vansel)', 'Склад реализации', NULL, 'Агент не закреплен'),
  ('w_vs_muhriddin', 'склад-vs (muhriddin mirzo ulug''bek-vansell)', 'Склад реализации', NULL, 'Muhriddin Mirzo ulug''bek-vansell'),
  ('w_vs_muzrob', 'склад-vs (muzrob)', 'Склад реализации', NULL, 'Muzrob'),
  ('w_vs_xoji', 'склад-vs (xojimuhammad chirchiq - vansel)', 'Склад реализации', NULL, 'Xojimuhammad Chirchiq - vansel');

-- Статусы заказов
INSERT INTO "Sales".status (code, name, description) VALUES
  ('open', 'Создана', 'Клиент заинтересован в покупке. Но не определен окончательно объем или дата поставки'),
  ('delivery', 'Доставка', 'Назначена дата доставки продукции клиенту. Объем согласован'),
  ('completed', 'Доставлен', 'Доставка выполнена'),
  ('canceled', 'Отменен', 'Заявка отменена агентом');

-- Типы оплаты
INSERT INTO "Sales".payment_type (code, name, description) VALUES
  ('cash_sum', 'Наличные, сум', 'Оплата наличными средствами'),
  ('bank_sum', 'Безналичные, сум', 'Оплата безналичным переводом'),
  ('card_sum', 'Карта, сум', 'Оплата карточкой');

-- ============================================================
-- VIEW: Остатки на складах (по операциям)
-- Приход: warehouse_receipt, return_from_customer (status=completed).
-- Расход: allocation, delivery, promotional_sample (уход со склада при создании операции).
-- ============================================================
CREATE OR REPLACE VIEW "Sales".v_warehouse_stock AS
SELECT
  wh.code AS warehouse_code,
  wh.name AS warehouse_name,
  p.code AS product_code,
  p.name AS product_name,
  b.id AS batch_id,
  b.batch_code,
  (COALESCE(SUM(CASE WHEN o.type_code IN ('warehouse_receipt', 'return_from_customer') AND o.status = 'completed' AND (o.warehouse_to = wh.code OR (o.warehouse_to IS NULL AND o.warehouse_from = wh.code)) THEN o.quantity ELSE 0 END), 0)
   + COALESCE(SUM(CASE WHEN o.type_code = 'allocation' AND o.warehouse_to = wh.code THEN o.quantity ELSE 0 END), 0)
   - COALESCE(SUM(CASE WHEN o.type_code IN ('allocation', 'delivery', 'promotional_sample') AND o.warehouse_from = wh.code THEN o.quantity ELSE 0 END), 0)) AS total_qty
FROM "Sales".warehouse wh
CROSS JOIN "Sales".product p
LEFT JOIN "Sales".batches b ON p.code = b.product_code
LEFT JOIN "Sales".operations o ON o.product_code = p.code AND (b.id IS NULL OR o.batch_id = b.id)
WHERE p.active = TRUE
GROUP BY wh.code, wh.name, p.code, p.name, b.id, b.batch_code
HAVING (COALESCE(SUM(CASE WHEN o.type_code IN ('warehouse_receipt', 'return_from_customer') AND o.status = 'completed' AND (o.warehouse_to = wh.code OR (o.warehouse_to IS NULL AND o.warehouse_from = wh.code)) THEN o.quantity ELSE 0 END), 0)
   + COALESCE(SUM(CASE WHEN o.type_code = 'allocation' AND o.warehouse_to = wh.code THEN o.quantity ELSE 0 END), 0)
   - COALESCE(SUM(CASE WHEN o.type_code IN ('allocation', 'delivery', 'promotional_sample') AND o.warehouse_from = wh.code THEN o.quantity ELSE 0 END), 0)) != 0
ORDER BY warehouse_code, product_code;

-- ============================================================
-- VIEW: Финансовый реестр
-- ============================================================
CREATE OR REPLACE VIEW "Sales".v_financial_ledger AS
SELECT
  o.operation_number,
  o.type_code,
  ot.name AS operation_type_name,
  o.operation_date,
  o.customer_id,
  c.name_client AS customer_name,
  o.amount,
  CASE WHEN o.type_code = 'cash_receipt' THEN 'ПРИХОД' WHEN o.type_code = 'cash_return' THEN 'РАСХОД' WHEN o.type_code = 'delivery' AND o.amount > 0 THEN 'К ПОЛУЧЕНИЮ' END AS movement_type,
  o.payment_type_code,
  pt.name AS payment_type_name,
  o.status,
  o.created_by,
  o.cashier_login
FROM "Sales".operations o
LEFT JOIN "Sales".operation_types ot ON o.type_code = ot.code
LEFT JOIN "Sales".customers c ON o.customer_id = c.id
LEFT JOIN "Sales".payment_type pt ON o.payment_type_code = pt.code
WHERE o.type_code IN ('cash_receipt', 'cash_return', 'delivery') AND o.status = 'completed'
ORDER BY o.operation_date DESC;

-- ============================================================
-- VIEW: Жизненный цикл операций
-- ============================================================
CREATE OR REPLACE VIEW "Sales".v_operations_lifecycle AS
SELECT
  o.operation_number,
  o.type_code,
  ot.name AS operation_type_name,
  o.product_code,
  p.name AS product_name,
  o.batch_id,
  b.batch_code,
  o.quantity,
  o.amount,
  o.operation_date,
  o.status,
  o.customer_id,
  c.name_client AS customer_name,
  o.order_id,
  o.related_operation_id,
  related_op.operation_number AS related_operation_number
FROM "Sales".operations o
LEFT JOIN "Sales".operation_types ot ON o.type_code = ot.code
LEFT JOIN "Sales".product p ON o.product_code = p.code
LEFT JOIN "Sales".batches b ON o.batch_id = b.id
LEFT JOIN "Sales".customers c ON o.customer_id = c.id
LEFT JOIN "Sales".operations related_op ON o.related_operation_id = related_op.id
ORDER BY o.operation_date DESC;

-- ============================================================
-- Визиты клиентам и фотографии клиентов (ТЗ 1.3, 2026-02-11)
-- ============================================================

-- Таблица customers_visits
CREATE TABLE IF NOT EXISTS "Sales".customers_visits (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES "Sales".customers(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_time TIME,
  status TEXT NOT NULL CHECK (status IN ('planned', 'completed', 'cancelled', 'postponed')),
  responsible_login TEXT REFERENCES "Sales".users(login) ON DELETE SET NULL,
  comment TEXT,
  public_token TEXT UNIQUE NOT NULL DEFAULT md5(random()::text),
  created_by TEXT NOT NULL REFERENCES "Sales".users(login),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT REFERENCES "Sales".users(login),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_visits_customer_id ON "Sales".customers_visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_visits_status ON "Sales".customers_visits(status);
CREATE INDEX IF NOT EXISTS idx_customers_visits_date ON "Sales".customers_visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_visits_customer_date ON "Sales".customers_visits(customer_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_visits_responsible ON "Sales".customers_visits(responsible_login);
CREATE INDEX IF NOT EXISTS idx_customers_visits_created_at ON "Sales".customers_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_visits_public_token ON "Sales".customers_visits(public_token);

-- Таблица customer_photo (фото привязано только к клиенту, папка /photo/, имя: КОД_ДДММГГГГ_ЧЧММСС.ext)
CREATE TABLE IF NOT EXISTS "Sales".customer_photo (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES "Sales".customers(id) ON DELETE CASCADE,
  photo_path TEXT NOT NULL,
  original_filename TEXT,
  file_size INT,
  mime_type TEXT,
  description TEXT,
  download_token TEXT UNIQUE NOT NULL DEFAULT md5(random()::text),
  is_main BOOLEAN DEFAULT FALSE,
  uploaded_by TEXT NOT NULL REFERENCES "Sales".users(login),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  photo_datetime TIMESTAMPTZ
);
-- Миграция для существующих БД: ALTER TABLE "Sales".customer_photo ADD COLUMN IF NOT EXISTS photo_datetime TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_customer_photo_customer_id ON "Sales".customer_photo(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_photo_is_main ON "Sales".customer_photo(customer_id, is_main) WHERE is_main = TRUE;
CREATE INDEX IF NOT EXISTS idx_customer_photo_uploaded_at ON "Sales".customer_photo(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_photo_download_token ON "Sales".customer_photo(download_token);

-- Поле main_photo_id в customers
ALTER TABLE "Sales".customers ADD COLUMN IF NOT EXISTS main_photo_id INT;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'customers_main_photo_id_fkey'
    AND table_schema = 'Sales' AND table_name = 'customers'
  ) THEN
    ALTER TABLE "Sales".customers ADD CONSTRAINT customers_main_photo_id_fkey
      FOREIGN KEY (main_photo_id) REFERENCES "Sales".customer_photo(id) ON DELETE SET NULL;
  END IF;
END $$;

-- VIEW статистики визитов
CREATE OR REPLACE VIEW "Sales".v_visits_statistics AS
SELECT
  c.id AS customer_id,
  c.name_client,
  c.firm_name,
  COUNT(cv.id) AS total_visits,
  SUM(CASE WHEN cv.status = 'completed' THEN 1 ELSE 0 END) AS completed_visits,
  SUM(CASE WHEN cv.status = 'planned' THEN 1 ELSE 0 END) AS planned_visits,
  SUM(CASE WHEN cv.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_visits,
  MAX(cv.visit_date) AS last_visit_date,
  MIN(cv.visit_date) AS first_visit_date
FROM "Sales".customers c
LEFT JOIN "Sales".customers_visits cv ON c.id = cv.customer_id
GROUP BY c.id, c.name_client, c.firm_name
ORDER BY last_visit_date DESC NULLS LAST;

-- VIEW предстоящие визиты
CREATE OR REPLACE VIEW "Sales".v_upcoming_visits AS
SELECT
  cv.id,
  cv.public_token,
  cv.customer_id,
  c.name_client,
  c.phone,
  cv.visit_date,
  cv.visit_time,
  cv.status,
  cv.responsible_login,
  cv.comment,
  u.fio AS responsible_name
FROM "Sales".customers_visits cv
JOIN "Sales".customers c ON cv.customer_id = c.id
LEFT JOIN "Sales".users u ON cv.responsible_login = u.login
WHERE cv.visit_date >= CURRENT_DATE
  AND cv.status IN ('planned', 'completed')
ORDER BY cv.visit_date ASC, cv.visit_time ASC NULLS LAST;

-- ============================================================
-- VIEWs для отчётности (ТЗ: меню и отчётность)
-- ============================================================

-- Дополнительная миграция: валюты и поле currency_code в product
ALTER TABLE "Sales".product ADD COLUMN IF NOT EXISTS currency_code TEXT;
UPDATE "Sales".product SET currency_code = 'sum' WHERE currency_code IS NULL;

-- 1. По клиентам
CREATE OR REPLACE VIEW "Sales".v_report_customers AS
SELECT
  c.id,
  c.name_client,
  c.firm_name,
  c.login_agent,
  COUNT(DISTINCT cv.id) AS total_visits,
  SUM(CASE WHEN cv.status = 'completed' THEN 1 ELSE 0 END) AS completed_visits,
  SUM(CASE WHEN cv.status = 'planned' THEN 1 ELSE 0 END) AS planned_visits,
  SUM(CASE WHEN cv.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_visits,
  MAX(cv.visit_date) AS last_visit_date,
  CASE
    WHEN MAX(cv.visit_date) >= CURRENT_DATE - INTERVAL '30 days' THEN 'Активен'
    ELSE 'Неактивен'
  END AS status,
  COUNT(DISTINCT cp.id) AS total_photos
FROM "Sales".customers c
LEFT JOIN "Sales".customers_visits cv ON c.id = cv.customer_id
LEFT JOIN "Sales".customer_photo cp ON c.id = cp.customer_id
GROUP BY c.id, c.name_client, c.firm_name, c.login_agent;

-- 2. По агентам — эффективность
CREATE OR REPLACE VIEW "Sales".v_report_agents AS
SELECT
  u.login,
  u.fio,
  COUNT(DISTINCT cv.customer_id) AS customer_count,
  COUNT(DISTINCT cv.id) AS total_visits,
  SUM(CASE WHEN cv.status = 'completed' THEN 1 ELSE 0 END) AS completed_visits,
  SUM(CASE WHEN cv.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_visits,
  ROUND(
    SUM(CASE WHEN cv.status = 'completed' THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(DISTINCT cv.id), 0) * 100,
    1
  ) AS completion_rate,
  MAX(cv.visit_date) AS last_visit_date,
  ROUND(
    COUNT(DISTINCT cv.id)::NUMERIC / NULLIF((MAX(cv.visit_date) - MIN(cv.visit_date)) + 1, 0),
    2
  ) AS avg_visits_per_day
FROM "Sales".users u
LEFT JOIN "Sales".customers_visits cv ON u.login = cv.responsible_login
WHERE LOWER(u.role::text) IN ('agent', 'expeditor', 'admin')
GROUP BY u.login, u.fio;

-- 3. По визитам — статистика по датам
CREATE OR REPLACE VIEW "Sales".v_report_visits_stats AS
SELECT
  DATE(cv.visit_date) AS visit_date,
  EXTRACT(DOW FROM cv.visit_date) AS day_of_week,
  TO_CHAR(cv.visit_date, 'Day') AS day_name,
  COUNT(*) AS total_visits,
  SUM(CASE WHEN cv.status = 'completed' THEN 1 ELSE 0 END) AS completed,
  SUM(CASE WHEN cv.status = 'planned' THEN 1 ELSE 0 END) AS planned,
  SUM(CASE WHEN cv.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
  COUNT(DISTINCT cv.customer_id) AS unique_customers,
  COUNT(DISTINCT cv.responsible_login) AS unique_agents
FROM "Sales".customers_visits cv
GROUP BY DATE(cv.visit_date), EXTRACT(DOW FROM cv.visit_date), TO_CHAR(cv.visit_date, 'Day')
ORDER BY visit_date DESC;

-- 4. Клиенты без фотографий
CREATE OR REPLACE VIEW "Sales".v_customers_without_photos AS
SELECT
  c.id,
  c.name_client,
  c.firm_name,
  c.login_agent,
  COUNT(DISTINCT cv.id) AS visit_count,
  MAX(cv.visit_date) AS last_visit
FROM "Sales".customers c
LEFT JOIN "Sales".customers_visits cv ON c.id = cv.customer_id
LEFT JOIN "Sales".customer_photo cp ON c.id = cp.customer_id
WHERE cp.id IS NULL
GROUP BY c.id, c.name_client, c.firm_name, c.login_agent
ORDER BY visit_count DESC;

-- 5. Статистика фотографий по дате и загрузившему
CREATE OR REPLACE VIEW "Sales".v_report_photos_stats AS
SELECT
  DATE(cp.uploaded_at) AS upload_date,
  cp.uploaded_by,
  u.fio,
  COUNT(*) AS photos_count,
  COUNT(DISTINCT cp.customer_id) AS unique_customers,
  SUM(cp.file_size) AS total_size_bytes
FROM "Sales".customer_photo cp
LEFT JOIN "Sales".users u ON cp.uploaded_by = u.login
GROUP BY DATE(cp.uploaded_at), cp.uploaded_by, u.fio
ORDER BY upload_date DESC;

-- 6. Неактивные клиенты (30+ дней без визитов)
CREATE OR REPLACE VIEW "Sales".v_inactive_customers AS
SELECT
  c.id,
  c.name_client,
  c.firm_name,
  c.login_agent,
  MAX(cv.visit_date) AS last_visit_date,
  (CURRENT_DATE - MAX(cv.visit_date)) AS days_since_visit,
  COUNT(DISTINCT cv.id) AS total_visits_all_time
FROM "Sales".customers c
LEFT JOIN "Sales".customers_visits cv ON c.id = cv.customer_id
GROUP BY c.id, c.name_client, c.firm_name, c.login_agent
HAVING (CURRENT_DATE - MAX(cv.visit_date)) >= 30 OR MAX(cv.visit_date) IS NULL
ORDER BY days_since_visit DESC;

-- ============================================================
-- Конец файла
-- ============================================================
