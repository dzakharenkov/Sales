-- Миграция: добавление статуса 'postponed' для таблицы customers_visits
-- 1. Обновляет CHECK-ограничение по статусу, чтобы разрешить 'postponed'
-- 2. Безопасно для многократного запуска

DO $$
DECLARE
  chk_name text;
BEGIN
  SELECT tc.constraint_name
  INTO chk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
  WHERE tc.table_schema = 'Sales'
    AND tc.table_name = 'customers_visits'
    AND tc.constraint_type = 'CHECK'
    AND cc.check_clause LIKE '%status IN (''planned'', ''completed'', ''cancelled'')%';

  IF chk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "Sales".customers_visits DROP CONSTRAINT %I', chk_name);
  END IF;
END $$;

ALTER TABLE "Sales".customers_visits
  ADD CONSTRAINT customers_visits_status_check
  CHECK (status IN ('planned', 'completed', 'cancelled', 'postponed'));

