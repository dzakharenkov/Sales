-- Добавление недостающих пунктов подменю для справочников
-- Дата: 2026-02-17

-- Обновляем sequence чтобы избежать конфликтов
SELECT setval(pg_get_serial_sequence('"Sales".menu_items', 'id'),
              COALESCE((SELECT MAX(id) FROM "Sales".menu_items), 1),
              true);

-- Добавляем пункты подменю справочников
INSERT INTO "Sales".menu_items (code, label, icon, url, sort_order, is_active) VALUES
  ('ref_payment', 'Типы оплат', NULL, 'ref_payment', 21, TRUE),
  ('ref_products', 'Типы продуктов', NULL, 'ref_products', 22, TRUE),
  ('ref_operations', 'Типы операций', NULL, 'ref_operations', 23, TRUE),
  ('ref_currency', 'Валюта', NULL, 'ref_currency', 24, TRUE),
  ('warehouses', 'Склады', NULL, 'warehouses', 25, TRUE),
  ('products', 'Товары', NULL, 'products', 26, TRUE)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  url = EXCLUDED.url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Обновляем sort_order для городов и территорий чтобы они были после остальных
UPDATE "Sales".menu_items SET sort_order = 27 WHERE code = 'ref_cities';
UPDATE "Sales".menu_items SET sort_order = 28 WHERE code = 'ref_territories';

-- Получаем ID добавленных пунктов и настраиваем права
DO $$
DECLARE
  payment_id INT;
  products_id INT;
  operations_id INT;
  currency_id INT;
  warehouses_id INT;
  goods_id INT;
BEGIN
  SELECT id INTO payment_id FROM "Sales".menu_items WHERE code = 'ref_payment';
  SELECT id INTO products_id FROM "Sales".menu_items WHERE code = 'ref_products';
  SELECT id INTO operations_id FROM "Sales".menu_items WHERE code = 'ref_operations';
  SELECT id INTO currency_id FROM "Sales".menu_items WHERE code = 'ref_currency';
  SELECT id INTO warehouses_id FROM "Sales".menu_items WHERE code = 'warehouses';
  SELECT id INTO goods_id FROM "Sales".menu_items WHERE code = 'products';

  -- Права доступа для admin (полный доступ)
  INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
  VALUES
    ('admin', payment_id, 'full'),
    ('admin', products_id, 'full'),
    ('admin', operations_id, 'full'),
    ('admin', currency_id, 'full'),
    ('admin', warehouses_id, 'full'),
    ('admin', goods_id, 'full')
  ON CONFLICT (role, menu_item_id) DO UPDATE SET access_level = EXCLUDED.access_level;

  -- Права для остальных ролей (скрыто по умолчанию, можно настроить)
  INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
  VALUES
    ('agent', payment_id, 'none'), ('agent', products_id, 'none'), ('agent', operations_id, 'none'),
    ('agent', currency_id, 'none'), ('agent', warehouses_id, 'none'), ('agent', goods_id, 'none'),
    ('expeditor', payment_id, 'none'), ('expeditor', products_id, 'none'), ('expeditor', operations_id, 'none'),
    ('expeditor', currency_id, 'none'), ('expeditor', warehouses_id, 'none'), ('expeditor', goods_id, 'none'),
    ('stockman', payment_id, 'none'), ('stockman', products_id, 'none'), ('stockman', operations_id, 'none'),
    ('stockman', currency_id, 'none'), ('stockman', warehouses_id, 'none'), ('stockman', goods_id, 'none'),
    ('paymaster', payment_id, 'none'), ('paymaster', products_id, 'none'), ('paymaster', operations_id, 'none'),
    ('paymaster', currency_id, 'none'), ('paymaster', warehouses_id, 'none'), ('paymaster', goods_id, 'none')
  ON CONFLICT (role, menu_item_id) DO UPDATE SET access_level = EXCLUDED.access_level;
END $$;

-- Проверка
SELECT mi.code, mi.label, mi.sort_order
FROM "Sales".menu_items mi
WHERE mi.code IN ('ref_payment', 'ref_products', 'ref_operations', 'ref_currency', 'ref_cities', 'ref_territories', 'warehouses', 'products')
ORDER BY mi.sort_order;
