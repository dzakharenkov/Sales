# Task: Database Connection Pooling

**Task ID:** 004
**Category:** Architecture
**Priority:** CRITICAL
**Status:** COMPLETED
**Estimated Time:** 3 hours
**Dependencies:** 001 (clean config), 008 (Alembic ideally, but can do independently)

---

## Description

The current database setup uses `NullPool` which creates and destroys a connection for every HTTP request. This adds 5–15ms latency per request and limits throughput to the max number of connections PostgreSQL allows divided by connection time.

Replace `NullPool` with `AsyncAdaptedQueuePool` with appropriate pool settings.

---

## Acceptance Criteria

- [ ] `NullPool` removed from `src/database/connection.py`
- [ ] `AsyncAdaptedQueuePool` configured with `pool_size=10, max_overflow=20, pool_timeout=30, pool_recycle=1800`
- [ ] Connection pool status logged on startup
- [ ] Pool exhaustion handled gracefully (timeout error, not crash)
- [ ] PostgreSQL `max_connections` verified to support the pool size
- [ ] No "SSL connection has been closed unexpectedly" errors after implementing (set `pool_recycle`)

---

## Technical Details

### Current Code (`src/database/connection.py`):

```python
# Current (NullPool — no pooling):
from sqlalchemy.pool import NullPool

engine = create_async_engine(
    DATABASE_URL,
    poolclass=NullPool,
    echo=False,
)
```

### Replacement:

```python
# New (connection pooling):
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,           # Maintained connections in pool
    max_overflow=20,        # Extra connections beyond pool_size (burst)
    pool_timeout=30,        # Seconds to wait for available connection
    pool_recycle=1800,      # Recycle connections after 30 minutes (prevents stale)
    pool_pre_ping=True,     # Test connection health before use
    echo=False,
)

async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
```

### Pool Size Calculation:

```
PostgreSQL max_connections = 100 (typical default)
Reserve 10 for admin/monitoring
Available = 90

If running single API server:
  pool_size = 10 (baseline always-ready connections)
  max_overflow = 20 (allows burst to 30 total)
  max_overflow should not exceed 90 / num_workers

If running 4 uvicorn workers:
  pool_size per worker = 5
  max_overflow per worker = 10
```

### Health Check Enhancement:

```python
# In startup, log pool info:
async def startup():
    pool = engine.pool
    logger.info(
        f"DB pool: size={pool.size()}, checked_out={pool.checkedout()}, "
        f"overflow={pool.overflow()}, invalid={pool.invalid()}"
    )
```

### Graceful Pool Exhaustion:

```python
# In get_db dependency:
from sqlalchemy.exc import TimeoutError as SQLTimeoutError

async def get_db():
    try:
        async with async_session() as session:
            yield session
    except SQLTimeoutError:
        raise HTTPException(
            status_code=503,
            detail="Database temporarily unavailable. Please try again."
        )
```

### Startup Pool Warmup (optional):

```python
# Pre-create connections to avoid cold start latency:
async def warmup_pool():
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))
    logger.info("Database connection pool warmed up")
```

---

## Testing Requirements

- Run load test: 50 concurrent requests, all should complete in <500ms
- Verify pool reuse by checking PostgreSQL `pg_stat_activity` — should see ≤10 connections (pool_size)
- Kill PostgreSQL connection externally, verify `pool_pre_ping=True` recovers cleanly
- Test pool exhaustion: 35 concurrent requests should queue, not crash (pool_timeout=30)

---

## Related Documentation

- [ARCHITECTURE.md — System Components](../ARCHITECTURE.md)
- [TECHNICAL_DESIGN.md — Performance Considerations](../TECHNICAL_DESIGN.md)
- [CURRENT_STATE.md — Performance Issues](../CURRENT_STATE.md)

---

## Notes

- PostgreSQL server is remote (45.141.76.83) — network latency makes pooling even more critical
- After implementing, monitor `pg_stat_activity` to ensure connections are being released properly
- `pool_recycle=1800` prevents issues with long-running idle connections being killed by firewall
