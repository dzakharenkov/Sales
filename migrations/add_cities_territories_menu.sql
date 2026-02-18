-- Добавление пунктов меню для справочников городов и территорий
-- Дата: 2026-02-17

-- Обновляем sequence чтобы избежать конфликтов
SELECT setval(pg_get_serial_sequence('"Sales".menu_items', 'id'),
              COALESCE((SELECT MAX(id) FROM "Sales".menu_items), 1),
              true);

-- Добавляем пункты меню
INSERT INTO "Sales".menu_items (code, label, icon, url, sort_order, is_active) VALUES
  ('ref_cities', 'Города', NULL, 'cities', 21, TRUE),
  ('ref_territories', 'Территории', NULL, 'territories', 22, TRUE)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  url = EXCLUDED.url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Получаем ID добавленных пунктов
DO $$
DECLARE
  cities_id INT;
  territories_id INT;
BEGIN
  SELECT id INTO cities_id FROM "Sales".menu_items WHERE code = 'ref_cities';
  SELECT id INTO territories_id FROM "Sales".menu_items WHERE code = 'ref_territories';

  -- Права доступа для admin (полный доступ)
  INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
  VALUES ('admin', cities_id, 'full'), ('admin', territories_id, 'full')
  ON CONFLICT (role, menu_item_id) DO UPDATE SET access_level = EXCLUDED.access_level;

  -- Остальные роли - скрыто
  INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
  VALUES
    ('agent', cities_id, 'none'), ('agent', territories_id, 'none'),
    ('expeditor', cities_id, 'none'), ('expeditor', territories_id, 'none'),
    ('stockman', cities_id, 'none'), ('stockman', territories_id, 'none'),
    ('paymaster', cities_id, 'none'), ('paymaster', territories_id, 'none')
  ON CONFLICT (role, menu_item_id) DO UPDATE SET access_level = EXCLUDED.access_level;
END $$;

-- Проверка
SELECT mi.code, mi.label, mi.sort_order, rma.role, rma.access_level
FROM "Sales".menu_items mi
JOIN "Sales".role_menu_access rma ON mi.id = rma.menu_item_id
WHERE mi.code IN ('ref_cities', 'ref_territories')
ORDER BY mi.sort_order, rma.role;
