"""Update warehouse stock view movements to include write-off/damage/transfer.

Revision ID: 044_stock_view_fix
Revises: 043_report_locations_menu_i18n
Create Date: 2026-02-26
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "044_stock_view_fix"
down_revision = "043_report_locations_menu_i18n"
branch_labels = None
depends_on = None


NEW_VIEW_SQL = '''
CREATE OR REPLACE VIEW "Sales".v_warehouse_stock AS
SELECT
  wh.code AS warehouse_code,
  wh.name AS warehouse_name,
  p.code AS product_code,
  p.name AS product_name,
  b.id AS batch_id,
  b.batch_code,
  b.expiry_date,
  (
    COALESCE(SUM(CASE
      WHEN o.type_code IN ('warehouse_receipt', 'return_from_customer')
        AND o.status = 'completed'
        AND (o.warehouse_to = wh.code OR (o.warehouse_to IS NULL AND o.warehouse_from = wh.code))
      THEN o.quantity ELSE 0 END), 0)
    + COALESCE(SUM(CASE
      WHEN o.type_code IN ('allocation', 'transfer')
        AND o.warehouse_to = wh.code
        AND (o.status IS NULL OR lower(trim(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled'))
      THEN o.quantity ELSE 0 END), 0)
    - COALESCE(SUM(CASE
      WHEN o.type_code IN ('allocation', 'delivery', 'promotional_sample', 'write_off', 'damage', 'transfer')
        AND o.warehouse_from = wh.code
        AND (o.status IS NULL OR lower(trim(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled'))
      THEN o.quantity ELSE 0 END), 0)
  ) AS total_qty
FROM "Sales".warehouse wh
CROSS JOIN "Sales".product p
LEFT JOIN "Sales".batches b ON p.code = b.product_code
LEFT JOIN "Sales".operations o ON o.product_code = p.code AND (b.id IS NULL OR o.batch_id = b.id)
WHERE p.active = TRUE
GROUP BY wh.code, wh.name, p.code, p.name, b.id, b.batch_code, b.expiry_date
HAVING (
    COALESCE(SUM(CASE
      WHEN o.type_code IN ('warehouse_receipt', 'return_from_customer')
        AND o.status = 'completed'
        AND (o.warehouse_to = wh.code OR (o.warehouse_to IS NULL AND o.warehouse_from = wh.code))
      THEN o.quantity ELSE 0 END), 0)
    + COALESCE(SUM(CASE
      WHEN o.type_code IN ('allocation', 'transfer')
        AND o.warehouse_to = wh.code
        AND (o.status IS NULL OR lower(trim(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled'))
      THEN o.quantity ELSE 0 END), 0)
    - COALESCE(SUM(CASE
      WHEN o.type_code IN ('allocation', 'delivery', 'promotional_sample', 'write_off', 'damage', 'transfer')
        AND o.warehouse_from = wh.code
        AND (o.status IS NULL OR lower(trim(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled'))
      THEN o.quantity ELSE 0 END), 0)
  ) != 0
ORDER BY warehouse_code, product_code;
'''


OLD_VIEW_SQL = '''
CREATE OR REPLACE VIEW "Sales".v_warehouse_stock AS
SELECT
  wh.code AS warehouse_code,
  wh.name AS warehouse_name,
  p.code AS product_code,
  p.name AS product_name,
  b.id AS batch_id,
  b.batch_code,
  b.expiry_date,
  (
    COALESCE(SUM(CASE
      WHEN o.type_code IN ('warehouse_receipt', 'return_from_customer')
        AND o.status = 'completed'
        AND (o.warehouse_to = wh.code OR (o.warehouse_to IS NULL AND o.warehouse_from = wh.code))
      THEN o.quantity ELSE 0 END), 0)
    + COALESCE(SUM(CASE
      WHEN o.type_code = 'allocation'
        AND o.warehouse_to = wh.code
        AND (o.status IS NULL OR lower(trim(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled'))
      THEN o.quantity ELSE 0 END), 0)
    - COALESCE(SUM(CASE
      WHEN o.type_code IN ('allocation', 'delivery', 'promotional_sample')
        AND o.warehouse_from = wh.code
        AND (o.status IS NULL OR lower(trim(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled'))
      THEN o.quantity ELSE 0 END), 0)
  ) AS total_qty
FROM "Sales".warehouse wh
CROSS JOIN "Sales".product p
LEFT JOIN "Sales".batches b ON p.code = b.product_code
LEFT JOIN "Sales".operations o ON o.product_code = p.code AND (b.id IS NULL OR o.batch_id = b.id)
WHERE p.active = TRUE
GROUP BY wh.code, wh.name, p.code, p.name, b.id, b.batch_code, b.expiry_date
HAVING (
    COALESCE(SUM(CASE
      WHEN o.type_code IN ('warehouse_receipt', 'return_from_customer')
        AND o.status = 'completed'
        AND (o.warehouse_to = wh.code OR (o.warehouse_to IS NULL AND o.warehouse_from = wh.code))
      THEN o.quantity ELSE 0 END), 0)
    + COALESCE(SUM(CASE
      WHEN o.type_code = 'allocation'
        AND o.warehouse_to = wh.code
        AND (o.status IS NULL OR lower(trim(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled'))
      THEN o.quantity ELSE 0 END), 0)
    - COALESCE(SUM(CASE
      WHEN o.type_code IN ('allocation', 'delivery', 'promotional_sample')
        AND o.warehouse_from = wh.code
        AND (o.status IS NULL OR lower(trim(COALESCE(o.status, ''))) NOT IN ('cancelled', 'canceled'))
      THEN o.quantity ELSE 0 END), 0)
  ) != 0
ORDER BY warehouse_code, product_code;
'''


def upgrade() -> None:
    op.execute(NEW_VIEW_SQL)


def downgrade() -> None:
    op.execute(OLD_VIEW_SQL)
