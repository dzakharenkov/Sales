-- ============================================================
-- Исправление VIEW v_warehouse_stock для корректного отображения остатков
-- после операций allocation (выдача экспедитору).
-- Отменённые операции (status = 'cancelled') не влияют на остатки — при отмене
-- доставки/выдачи остатки возвращаются (не вычитаются из расчёта).
-- ============================================================

-- Условие: операция учитывается в остатках только если не отменена
-- (NULL или любое значение кроме 'cancelled').
--
-- ВАЖНО: выполните этот скрипт в вашей БД PostgreSQL (например: psql -U user -d dbname -f fix_v_warehouse_stock.sql),
-- чтобы после отмены операций доставки/выдачи остатки на складе экспедитора возвращались.
DROP VIEW IF EXISTS "Sales".v_warehouse_stock CASCADE;

CREATE VIEW "Sales".v_warehouse_stock AS
SELECT
  wh.code AS warehouse_code,
  wh.name AS warehouse_name,
  p.code AS product_code,
  p.name AS product_name,
  b.id AS batch_id,
  b.batch_code,
  b.expiry_date,
  (COALESCE(SUM(CASE WHEN o.type_code IN ('warehouse_receipt', 'return_from_customer') AND o.status = 'completed' AND (o.warehouse_to = wh.code OR (o.warehouse_to IS NULL AND o.warehouse_from = wh.code)) THEN o.quantity ELSE 0 END), 0)
   + COALESCE(SUM(CASE WHEN o.type_code = 'allocation' AND o.warehouse_to = wh.code AND (o.status IS NULL OR LOWER(TRIM(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled')) THEN o.quantity ELSE 0 END), 0)
   - COALESCE(SUM(CASE WHEN o.type_code IN ('allocation', 'delivery', 'promotional_sample') AND o.warehouse_from = wh.code AND (o.status IS NULL OR LOWER(TRIM(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled')) THEN o.quantity ELSE 0 END), 0)) AS total_qty
FROM "Sales".warehouse wh
CROSS JOIN "Sales".product p
LEFT JOIN "Sales".batches b ON p.code = b.product_code
LEFT JOIN "Sales".operations o ON o.product_code = p.code AND (b.id IS NULL OR o.batch_id = b.id)
WHERE p.active = TRUE
GROUP BY wh.code, wh.name, p.code, p.name, b.id, b.batch_code, b.expiry_date
HAVING (COALESCE(SUM(CASE WHEN o.type_code IN ('warehouse_receipt', 'return_from_customer') AND o.status = 'completed' AND (o.warehouse_to = wh.code OR (o.warehouse_to IS NULL AND o.warehouse_from = wh.code)) THEN o.quantity ELSE 0 END), 0)
   + COALESCE(SUM(CASE WHEN o.type_code = 'allocation' AND o.warehouse_to = wh.code AND (o.status IS NULL OR LOWER(TRIM(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled')) THEN o.quantity ELSE 0 END), 0)
   - COALESCE(SUM(CASE WHEN o.type_code IN ('allocation', 'delivery', 'promotional_sample') AND o.warehouse_from = wh.code AND (o.status IS NULL OR LOWER(TRIM(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled')) THEN o.quantity ELSE 0 END), 0)) != 0
ORDER BY warehouse_code, product_code;
