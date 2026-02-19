# Task: Database Performance Indexes

**Task ID:** 013
**Category:** Architecture / Performance
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 3 hours
**Dependencies:** 005 (Alembic — add as migration)

---

## Description

The database schema likely only has indexes on primary keys and some foreign keys. High-frequency query patterns (customer listing by agent, order filtering, visit calendar, stock by warehouse) need composite indexes. This task identifies and creates all missing indexes.

---

## Acceptance Criteria

- [x] All indexes added via Alembic migration (not raw SQL)
- [x] `EXPLAIN ANALYZE` run before/after each index to verify improvement
- [x] Index creation done with `CREATE INDEX CONCURRENTLY` to avoid locking production
- [x] No duplicate indexes (check existing before creating)
- [x] Index names follow convention: `idx_{table}_{columns}`

---

## Technical Details

### Audit Existing Indexes

```sql
-- Check existing indexes in Sales schema:
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'Sales'
ORDER BY tablename, indexname;
```

### Missing Indexes to Create

```sql
-- 1. Customers by agent (most common agent query)
CREATE INDEX CONCURRENTLY idx_customers_login_agent
    ON "Sales".customers(login_agent)
    WHERE login_agent IS NOT NULL;

-- 2. Customers by expeditor
CREATE INDEX CONCURRENTLY idx_customers_login_expeditor
    ON "Sales".customers(login_expeditor)
    WHERE login_expeditor IS NOT NULL;

-- 3. Customers text search (name/firm)
-- Full-text search index (GIN for ILIKE patterns):
CREATE INDEX CONCURRENTLY idx_customers_name_gin
    ON "Sales".customers
    USING gin(to_tsvector('russian', coalesce(name_client, '') || ' ' || coalesce(firm_name, '')));

-- 4. Orders by customer and status
CREATE INDEX CONCURRENTLY idx_orders_customer_status
    ON "Sales".orders(customer_id, status_code);

-- 5. Orders by delivery date (for expeditor route planning)
CREATE INDEX CONCURRENTLY idx_orders_delivery_date
    ON "Sales".orders(scheduled_delivery_at)
    WHERE scheduled_delivery_at IS NOT NULL;

-- 6. Orders by date (for listing/filtering)
CREATE INDEX CONCURRENTLY idx_orders_order_date
    ON "Sales".orders(order_date DESC);

-- 7. Operations by warehouse (common filter)
CREATE INDEX CONCURRENTLY idx_operations_warehouse_from
    ON "Sales".operations(warehouse_from, created_at DESC)
    WHERE warehouse_from IS NOT NULL;

-- 8. Operations by created_by and date
CREATE INDEX CONCURRENTLY idx_operations_created_by_date
    ON "Sales".operations(created_by, created_at DESC);

-- 9. Visit calendar (date + responsible person)
CREATE INDEX CONCURRENTLY idx_visits_date_responsible
    ON "Sales".customers_visits(visit_date, responsible_login);

-- 10. Visit by customer (for customer detail view)
CREATE INDEX CONCURRENTLY idx_visits_customer_id
    ON "Sales".customers_visits(customer_id, visit_date DESC);

-- 11. Warehouse stock by warehouse (most critical for stock queries)
CREATE INDEX CONCURRENTLY idx_stock_warehouse_code
    ON "Sales".warehouse_stock(warehouse_code);

-- 12. Warehouse stock by product in warehouse
CREATE INDEX CONCURRENTLY idx_stock_warehouse_product
    ON "Sales".warehouse_stock(warehouse_code, product_code);

-- 13. Customer photos by customer (for photo loading)
CREATE INDEX CONCURRENTLY idx_photos_customer_id
    ON "Sales".customer_photo(customer_id);

-- 14. Batches by product and expiry (for expiry queries)
CREATE INDEX CONCURRENTLY idx_batches_expiry
    ON "Sales".batches(expiry_date)
    WHERE expiry_date IS NOT NULL;
```

### Alembic Migration for Indexes

```python
# alembic/versions/XXX_add_performance_indexes.py

def upgrade() -> None:
    # Use execute for CONCURRENTLY (can't be in transaction block)
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_login_agent
        ON "Sales".customers(login_agent)
        WHERE login_agent IS NOT NULL
    """)
    op.execute("""
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_status
        ON "Sales".orders(customer_id, status_code)
    """)
    # ... all other indexes

def downgrade() -> None:
    op.execute('DROP INDEX CONCURRENTLY IF EXISTS "Sales".idx_customers_login_agent')
    # ... drop all
```

**Note:** `CREATE INDEX CONCURRENTLY` cannot run inside a transaction. Alembic runs migrations in transactions by default. Use this pattern:

```python
# alembic/versions/XXX_add_indexes.py
from alembic import op

def upgrade() -> None:
    # Disable transaction for CONCURRENTLY
    op.get_bind().execution_options(isolation_level="AUTOCOMMIT")
    op.execute("CREATE INDEX CONCURRENTLY IF NOT EXISTS ...")
```

### Verify Improvements

```sql
-- Before/after comparison:
EXPLAIN ANALYZE
SELECT * FROM "Sales".customers
WHERE login_agent = 'agent_login'
ORDER BY id DESC;

-- Should see: "Index Scan using idx_customers_login_agent"
-- NOT: "Seq Scan on customers"
```

### Full-Text Search (GIN Index Enhancement)

```python
# If using GIN index for customer search, update search query:
# OLD:
WHERE name_client ILIKE :search

# NEW (uses GIN index):
WHERE to_tsvector('russian', coalesce(name_client,'') || ' ' || coalesce(firm_name,''))
      @@ plainto_tsquery('russian', :search)
```

---

## Testing Requirements

- Run `EXPLAIN ANALYZE` on top 5 most-used queries before and after — verify "Index Scan" instead of "Seq Scan"
- Customer listing by agent should run in <10ms with 10,000 customer records
- Order listing by delivery date should run in <20ms with 50,000 orders
- Verify no index creation caused table locks (use CONCURRENTLY)

---

## Related Documentation

- [TECHNICAL_DESIGN.md — Performance Considerations](../TECHNICAL_DESIGN.md)
- [CURRENT_STATE.md — Database Missing Indexes](../CURRENT_STATE.md)
- Task 005 (Alembic — migration tool)

---

## Notes

- Run on a staging environment first to measure impact
- Monitor index size after creation: `SELECT pg_size_pretty(pg_indexes_size('Sales.customers'))`
- Partial indexes (WHERE clause) are smaller and faster when filtering by common non-null columns
- Consider `pg_stat_user_indexes` to identify unused indexes after 30 days
