# Current State Analysis — Sales & Distribution System (SDS)

## Strengths

### Architecture
- **Clean separation of concerns** — API layer, database layer, and bot are logically independent
- **Async-first design** — All DB operations and HTTP calls are async (asyncpg + httpx)
- **FastAPI framework** — Excellent for rapid API development; auto-generates OpenAPI docs
- **Dual-channel access** — Web SPA and Telegram bot share one API (no code duplication)
- **Role-based architecture** — Clear role taxonomy (5 roles) with menu-level access control

### Code Quality
- **Pydantic validation** — All request bodies validated with Pydantic v2 models
- **Dependency injection** — Consistent use of FastAPI `Depends()` for auth and DB sessions
- **ORM + raw SQL mix** — ORM for simple CRUD, raw SQL for complex queries (pragmatic approach)
- **Environment configuration** — `.env` + `.env.example` pattern established
- **Error monitoring** — Sentry integrated for both API and bot

### Features
- **Smart operation suggestion engine** — Auto-suggests warehouse allocation items by delivery date
- **Dynamic RBAC menu** — Per-role menu visibility configurable from admin UI
- **Customer visit tracking** — Calendar-based with status workflow and audit trail
- **Excel export** — All major entities exportable (customers, orders, visits, operations, reports)
- **Photo management** — Customer photos with download tokens and EXIF datetime extraction
- **Multi-role Telegram bot** — Agent and expeditor flows with conversation state management
- **Batch tracking** — Product batches with expiry dates in warehouse operations
- **Comprehensive reporting** — Performance reports for agents, expeditors, and management

### Infrastructure
- **Git version control** — Active commits with meaningful commit messages
- **Deployment scripts** — Windows batch scripts + Ubuntu shell scripts
- **Lock file** — Bot prevents duplicate instances via file lock
- **Health endpoint** — Basic availability check at `/health`
- **Data integrity checks** — Startup validation of orphaned records

---

## Weaknesses

### Critical Security Issues

1. **Hardcoded credentials in source code**
   - File: `src/database/connection.py` lines 10-15
   - DB password `!Tesla11` and host `45.141.76.83` hardcoded as defaults
   - Anyone who reads the source code gets DB access

2. **JWT secret not secured**
   - `.env` contains `JWT_SECRET_KEY=your-super-secret-key-change-this-in-production`
   - Weak secret, not rotated

3. **No rate limiting on auth endpoints**
   - `/auth/login` allows unlimited brute-force attempts
   - Bot has login attempt limiting (5 tries, 10-min block) — API does not

4. **Raw exception messages exposed**
   - `except Exception as e: raise HTTPException(status_code=500, detail=str(e))`
   - Internal DB errors, table names, stack traces leak to clients

5. **SQL injection risk in raw queries**
   - Some routers build text() queries with f-strings using user-provided values
   - Should use parameterized queries exclusively

6. **Overly permissive CORS**
   - `allow_origins=["*"]` in production — should restrict to `sales.zakharenkov.ru`

### Architecture Issues

1. **No connection pooling**
   - `NullPool` creates a new DB connection on every HTTP request
   - Each request: connect → query → disconnect (~5-15ms overhead per request)
   - At 50 concurrent users: 50 simultaneous DB connections, no reuse

2. **No pagination on list endpoints**
   - `GET /customers` can return thousands of rows
   - `GET /orders` same issue
   - Frontend fetches all records and filters client-side (breaks at scale)

3. **Single-instance bot design**
   - Bot uses polling (not webhooks) — cannot scale horizontally
   - In-memory cache lost on restart
   - Lock file mechanism is fragile (stale lock if bot crashes)

4. **No transaction management on complex operations**
   - Multi-step operations (`POST /operations/flow`) don't have explicit transaction boundaries
   - Partial failures can leave DB in inconsistent state

5. **Frontend is a monolith**
   - `app.js` is ~3000+ lines, single file with all business logic, DOM manipulation, API calls
   - No module system, no component architecture
   - Extremely difficult to maintain and extend

### Technical Debt

1. **Migration system: raw SQL files only**
   - 7 migration files in `/migrations/` with no tracking system
   - No rollback capability
   - Can't tell which migrations have been applied to which environment
   - Alembic is in `requirements.txt` but not configured

2. **Inconsistent use of ORM vs raw SQL**
   - Some routers use SQLAlchemy ORM, others use raw `text()` queries
   - No consistent data access pattern

3. **No standardized response schema**
   - Some endpoints return dicts, some return lists, some return custom objects
   - No envelope (`{data: [...], meta: {total, page}}`)
   - No API versioning beyond the `/v1/` prefix

4. **No input sanitization for file uploads**
   - `customer_photos.py` checks content-type but no file size limit
   - No image format validation
   - No virus/malware scanning

5. **No structured logging**
   - `loguru` in requirements but minimal usage
   - Bot logs to a single flat file `telegram_bot.log`
   - No log rotation, no log levels per module
   - Can't trace a request through all layers

6. **Deployment: no CI/CD**
   - Manual `save_to_github.bat` + SSH + manual pull on server
   - No automated tests on commit
   - No deployment rollback mechanism

---

## Missing Components

### Functional
1. **Cities/Territories API** — Tables exist (`migrations/add_cities_territories_menu.sql`), no CRUD endpoints
2. **Expeditor Telegram handlers** — `handlers_expeditor.py` exists but implementation unclear
3. **Real-time notifications** — No way for system to push alerts to users (new order, delivery status change)
4. **Password reset flow** — Admin can change passwords but no self-service reset
5. **Multi-language support** — UI is Russian-only; Uzbek language not implemented
6. **Mobile web interface** — SPA is not responsive/mobile-optimized
7. **PDF export** — Only Excel export; no PDF for invoices, acts, reports
8. **Bulk import validation** — Excel import exists for customers but errors not clearly reported

### Infrastructure
1. **Database migrations system** — Alembic not configured despite being in requirements
2. **CI/CD pipeline** — No automated build, test, or deploy
3. **Backup system** — No automated DB backup documented
4. **SSL/TLS in dev** — Local dev runs HTTP; production runs HTTPS but no enforcement
5. **Request/response logging** — No middleware to log all API requests
6. **API rate limiting** — No request rate limiting
7. **Load balancer config** — Not configured (Nginx not documented for API proxying)

### Testing
1. **Unit tests** — No unit tests exist (only Playwright UI tests)
2. **API integration tests** — No automated API testing (only manual)
3. **Code linting/formatting** — No `.flake8`, `.black`, `mypy.ini` config files
4. **Test database** — Tests run against production DB (from `test_config.py`)
5. **Mock/fixture system** — No test fixtures or factories

---

## Code Quality Issues

### SOLID Violations

**Single Responsibility:**
- Router files handle both HTTP parsing AND business logic AND DB queries — should be split into service layer
- `app.js` handles UI, state management, API calls, formatting all in one file

**Open/Closed:**
- Operation type behavior is hard-coded in router logic rather than being data-driven (despite `operation_config` table existing)

**Dependency Inversion:**
- Routers directly import and use `get_db` — no service interface abstraction
- Bot handlers directly call `SDSAPI` methods — no abstraction for testing

### Anti-Patterns

1. **God file:** `src/static/app.js` (~3000 lines, single file for entire frontend)
2. **Magic strings:** Role names, status values, operation types as plain strings throughout code
3. **Hardcoded business logic:** Delivery status detection: `if "delivery" in status_code.lower()`
4. **Premature data exposure:** API returns complete DB rows including internal fields
5. **Inconsistent error handling:** Mix of `raise HTTPException`, `return None`, and silent failures

### DRY Violations
- Date parsing logic duplicated across multiple routers
- Excel export structure repeated in each router that exports
- Formatting functions exist in both `helpers.py` and inline in various routers
- Config loading repeated in bot files and API files

### Naming Inconsistencies
- Some columns: `login_agent` vs `responsible_login` vs `created_by` (inconsistent FK naming)
- API paths: some use dashes (`/customer-photos`), some use underscores, some camelCase in params
- Python variables: mix of Russian (rarely) and English

---

## Performance Issues

### Identified Bottlenecks

1. **No DB connection pooling** (NullPool) — most critical for throughput
2. **N+1 queries in reports** — Multiple sequential DB queries where JOINs should be used
3. **No query result caching** — Same reference data (products, warehouses) fetched repeatedly
4. **Large payload responses** — No field selection, always returns all columns
5. **Blocking file I/O** — Photo uploads use sync `open()` calls inside async handlers
6. **Bot polling mode** — Less efficient than webhooks at scale

### Database Missing Indexes
Based on common query patterns, these indexes are likely missing:
```sql
-- Customer listing by agent
CREATE INDEX idx_customers_login_agent ON "Sales".customers(login_agent);

-- Order listing by status and date
CREATE INDEX idx_orders_status_date ON "Sales".orders(status_code, order_date);

-- Operation listing by warehouse and date
CREATE INDEX idx_operations_warehouse_date ON "Sales".operations(warehouse_from, created_at);

-- Visit calendar queries
CREATE INDEX idx_visits_date_responsible ON "Sales".customers_visits(visit_date, responsible_login);

-- Stock by warehouse
CREATE INDEX idx_stock_warehouse ON "Sales".warehouse_stock(warehouse_code);
```

---

## Summary Assessment

| Category | Score | Notes |
|---|---|---|
| Feature Completeness | 7/10 | Core workflows working; cities API, expeditor bot missing |
| Code Quality | 5/10 | Good patterns but no tests, hardcoded values, DRY violations |
| Security | 4/10 | Auth works but credentials exposed, no rate limiting |
| Performance | 5/10 | Functional but no pooling, no caching, N+1 risks |
| Maintainability | 5/10 | Router files reasonable; frontend JS is a major debt item |
| Test Coverage | 2/10 | Only Playwright UI tests against production DB |
| Documentation | 6/10 | Good ТЗ docs; no API docs, no developer setup guide |
| DevOps/Infrastructure | 4/10 | Manual deployment; no CI/CD, no monitoring beyond Sentry |

**Overall: 4.75/10** — System is functional and in active use, but has critical security gaps and significant technical debt that will slow future development.
