# Task: Atomic Transaction Management for Operations

**Task ID:** 017
**Category:** Architecture
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 3 hours
**Dependencies:** 004 (connection pooling), 015 (error handling)

---

## Description

The `POST /operations/flow` endpoint executes a multi-step warehouse operation (e.g., allocate items from warehouse to delivery route). If a step fails midway, the database is left in an inconsistent state (partial allocation). All multi-step operations must be wrapped in explicit database transactions with atomic commit/rollback.

---

## Acceptance Criteria

- [x] `POST /operations/flow` executes all steps in a single atomic transaction
- [x] Any failure in any step rolls back ALL previous steps in the same request
- [x] Stock reservation (`reserved_qty`) updated atomically with operation record creation
- [x] Concurrent operation on the same product/warehouse uses SELECT FOR UPDATE to prevent race conditions
- [x] Transaction failures return clear error indicating operation was not saved

---

## Technical Details

### Current Pattern (Problematic)

```python
# Current: separate DB calls, no explicit transaction boundary
@router.post("/operations/flow")
async def create_operation_flow(body: OperationFlowRequest, db = Depends(get_db)):
    for step in body.steps:
        # Step 1: Create operation record
        await db.execute(insert_operation_query, step)  # â† committed?

        # Step 2: Update stock
        await db.execute(update_stock_query, step)     # â† if this fails, step 1 already committed!

        # Step 3: Update order status
        await db.execute(update_order_query, step)     # â† partial state if this fails
    await db.commit()  # â† may not roll back all steps
```

### Correct Atomic Pattern

```python
# AFTER: explicit transaction with rollback on any failure
@router.post("/operations/flow")
async def create_operation_flow(
    body: OperationFlowRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    async with db.begin():  # Explicit transaction â€” auto-rollback on exception
        for step in body.steps:
            # Lock the stock row to prevent concurrent modification
            stock_row = await db.execute(
                text("""
                    SELECT id, quantity, reserved_qty
                    FROM "Sales".warehouse_stock
                    WHERE warehouse_code = :wh AND product_code = :prod
                    FOR UPDATE  -- Prevents concurrent operations on same product
                """).bindparams(wh=step.warehouse_from, prod=step.product_code)
            ).fetchone()

            if not stock_row:
                raise ValidationError(f"Ð¢Ð¾Ð²Ð°Ñ€ {step.product_code} Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½ Ð½Ð° ÑÐºÐ»Ð°Ð´Ðµ {step.warehouse_from}")

            available = stock_row.quantity - stock_row.reserved_qty
            if available < step.quantity:
                raise ValidationError(
                    f"ÐÐµÐ´Ð¾ÑÑ‚Ð°Ñ‚Ð¾Ñ‡Ð½Ð¾ Ñ‚Ð¾Ð²Ð°Ñ€Ð° {step.product_code}: Ð´Ð¾ÑÑ‚ÑƒÐ¿Ð½Ð¾ {available}, Ñ‚Ñ€ÐµÐ±ÑƒÐµÑ‚ÑÑ {step.quantity}"
                )

            # Create operation record
            await db.execute(
                text("""
                    INSERT INTO "Sales".operations
                    (id, operation_number, type_code, warehouse_from, warehouse_to,
                     product_code, quantity, status, created_by, created_at)
                    VALUES (:id, :op_no, :type, :from, :to, :prod, :qty, 'active', :user, NOW())
                """).bindparams(...)
            )

            # Update stock atomically
            await db.execute(
                text("""
                    UPDATE "Sales".warehouse_stock
                    SET quantity = quantity - :qty
                    WHERE warehouse_code = :wh AND product_code = :prod
                """).bindparams(qty=step.quantity, wh=step.warehouse_from, prod=step.product_code)
            )

        # All steps succeeded â€” transaction commits automatically at end of `async with db.begin()`

    return {"success": True, "message": "ÐžÐ¿ÐµÑ€Ð°Ñ†Ð¸Ñ ÑÐ¾Ð·Ð´Ð°Ð½Ð° ÑƒÑÐ¿ÐµÑˆÐ½Ð¾"}
```

### Deadlock Prevention

```python
# Always lock rows in a consistent order to prevent deadlocks:
# Sort operations by warehouse_code + product_code before acquiring locks
sorted_steps = sorted(body.steps, key=lambda s: (s.warehouse_from, s.product_code))
for step in sorted_steps:
    # Lock and process
```

### Idempotency (Bonus)

```python
# Accept optional idempotency key to prevent duplicate operations:
@router.post("/operations/flow")
async def create_operation_flow(
    body: OperationFlowRequest,
    idempotency_key: str | None = Header(None, alias="Idempotency-Key"),
    ...
):
    if idempotency_key:
        # Check if operation with this key already exists
        existing = await db.execute(
            text("SELECT id FROM 'Sales'.operations WHERE idempotency_key = :key"),
            {"key": idempotency_key}
        ).fetchone()
        if existing:
            return {"success": True, "message": "ÐžÐ¿ÐµÑ€Ð°Ñ†Ð¸Ñ ÑƒÐ¶Ðµ Ð²Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½Ð°", "operation_id": str(existing.id)}
```

---

## Testing Requirements

- Submit operation flow that fails on step 2 (e.g., insufficient stock on second item)
  â†’ First item's operation must NOT exist in database (rolled back)
- Submit concurrent operations on same product from two requests simultaneously
  â†’ One should succeed, other should get a clear error (not a race condition/corrupt state)
- Submit valid 5-step operation flow â†’ all 5 operations created, stock updated correctly
- Verify `SELECT FOR UPDATE` actually prevents concurrent modification (use two DB sessions in test)

---

## Related Documentation

- [TECHNICAL_DESIGN.md â€” Database Design](../TECHNICAL_DESIGN.md)
- [CURRENT_STATE.md â€” Architecture Issues: No Transaction Management](../CURRENT_STATE.md)
- Task 004 (DB Connection Pooling â€” needed for session management)

