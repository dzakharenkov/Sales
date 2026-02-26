-- Add executor role to operation types and backfill mappings.
ALTER TABLE "Sales".operation_types
ADD COLUMN IF NOT EXISTS executor_role TEXT;

ALTER TABLE "Sales".operation_types
ALTER COLUMN executor_role SET DEFAULT 'admin';

-- Backfill known operation role ownership.
UPDATE "Sales".operation_types
SET executor_role = CASE code
    WHEN 'warehouse_receipt' THEN 'stockman'
    WHEN 'allocation' THEN 'stockman'
    WHEN 'transfer' THEN 'stockman'
    WHEN 'write_off' THEN 'stockman'
    WHEN 'delivery' THEN 'expeditor'
    WHEN 'payment_receipt_from_customer' THEN 'expeditor'
    WHEN 'cash_receipt' THEN 'paymaster'
    ELSE COALESCE(NULLIF(executor_role, ''), 'admin')
END;

UPDATE "Sales".operation_types
SET executor_role = 'admin'
WHERE executor_role IS NULL OR executor_role = '';

ALTER TABLE "Sales".operation_types
ALTER COLUMN executor_role SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'operation_types_executor_role_check'
          AND conrelid = '"Sales".operation_types'::regclass
    ) THEN
        ALTER TABLE "Sales".operation_types
        ADD CONSTRAINT operation_types_executor_role_check
        CHECK (executor_role IN ('admin', 'expeditor', 'agent', 'stockman', 'paymaster'));
    END IF;
END $$;

