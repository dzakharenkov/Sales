# Technical Design — Sales & Distribution System (SDS)

## 1. Component Structure

### 1.1 FastAPI Application Bootstrap (`src/main.py`)
**Responsibilities:**
- Register all 14 API routers under `/api/v1/`
- Configure CORS (currently allows all origins — tighten in production)
- Serve static files: login page at `/login`, SPA at `/app`, photos at `/photo/`
- Lifespan hook: validate DB connection + run data integrity checks on startup
- Sentry initialization

**Dependencies:**
- All router modules
- `database/connection.py` for startup checks
- `core/sentry_setup.py`

### 1.2 Authentication & Authorization

**JWT Strategy:**
```python
# Payload structure
{
    "sub": "user_login",    # username (PK in users table)
    "role": "agent",        # role string
    "exp": 1234567890       # unix timestamp
}

# Token generation (src/core/security.py)
create_access_token(data={"sub": login, "role": role}, expires_delta=timedelta(minutes=60))
```

**Role Hierarchy:**
| Role | Uzbek | Scope |
|---|---|---|
| `admin` | Администратор | Full system access |
| `agent` | Агент | Customers, visits, orders (own) |
| `expeditor` | Экспедитор | Visits, orders, operations, stock |
| `stockman` | Кладовщик | Operations, stock, reports |
| `paymaster` | Кассир | Operations, finances, reports |

**Dependency Injection:**
```python
# src/core/deps.py
async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)) -> User
async def require_admin(user: User = Depends(get_current_user)) -> User
```

**Access Control Points:**
1. JWT validation on every protected endpoint
2. User status check (`status == "активен"`)
3. Admin-only routes use `require_admin` dependency
4. Role-specific logic inside handlers (e.g., agent sees only own customers)
5. Dynamic menu visibility via `role_menu_access` table

### 1.3 Database Layer Design

**Connection Strategy:**
```python
# src/database/connection.py
DATABASE_URL = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{db}"
engine = create_async_engine(DATABASE_URL, poolclass=NullPool)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
```

**Current Issue:** `NullPool` creates a new connection on every request. Suitable for low traffic; at scale, switch to `AsyncAdaptedQueuePool` with `pool_size=10, max_overflow=20`.

**Session Pattern:**
```python
async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

**ORM Model Conventions:**
- All models: `__table_args__ = {"schema": "Sales"}`
- UUIDs: `Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)` for most entities
- Serial: `Column(Integer, autoincrement=True, primary_key=True)` for customers, orders, visits
- Timestamps: `server_default=func.now()` for created_at, nullable `updated_at`
- Foreign keys: reference schema-qualified tables

### 1.4 API Design Conventions

**URL Structure:**
```
/api/v1/{resource}              # Collection endpoints
/api/v1/{resource}/{id}         # Item endpoints
/api/v1/dictionary/{resource}   # Reference data
/api/v1/reports/{report_type}   # Reports
/api/v1/finances/{resource}     # Financial data
/api/v1/admin/{resource}        # Admin-only operations
```

**Request/Response Patterns:**
- All request bodies: Pydantic models with `Optional` fields for updates
- List endpoints: return arrays directly (no pagination wrapper — **gap to fix**)
- Error responses: `HTTPException(status_code=4xx, detail="message")`
- Success responses: entity dict or list of dicts
- Missing: standardized response envelope, pagination, cursor-based navigation

**HTTP Status Codes in Use:**
| Code | When |
|---|---|
| 200 | Success (all GET, successful PUT) |
| 201 | Created (POST) |
| 400 | Bad request / validation error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 500 | Unhandled server error |

---

## 2. Database Design

### 2.1 Schema: `"Sales"`

```
users ──────────────────────────────────────────────────────────
  login (PK, VARCHAR)       role (VARCHAR)       status (VARCHAR)
  fio, telegram_username, phone, email, password
  │
  ├── customers.login_agent ──► customers
  │     id (SERIAL PK)          name_client, firm_name
  │     category_client         address, city_id, territory_id
  │     lat, lon                tax_id, bank_details
  │     main_photo_id ──────────► customer_photo.id
  │     │
  │     ├── customers_visits.customer_id ──► customers_visits
  │     │     id (SERIAL PK)     visit_date, visit_time
  │     │     status             responsible_login
  │     │     public_token, comment
  │     │
  │     ├── customer_photo.customer_id ──► customer_photo
  │     │     id (SERIAL PK)     photo_path, original_filename
  │     │     file_size, mime_type, download_token
  │     │     is_main, uploaded_by, photo_datetime
  │     │
  │     └── orders.customer_id ──► orders
  │           order_no (SERIAL PK) order_date, status_code
  │           total_amount, payment_type_code
  │           scheduled_delivery_at, closed_at
  │           │
  │           └── items.order_id ──► items
  │                 id (UUID PK)    product_code (FK)
  │                 quantity, price
  │
product ──────────────────────────────────────────────────────────
  code (VARCHAR PK)    name, type_id (FK)
  weight_g, unit, price, expiry_days, active, currency_code
  │
  └── batches.product (FK) ──► batches
        id (UUID PK)         batch_code, production_date, expiry_date
        stock_qty, owner

warehouse ─────────────────────────────────────────────────────────
  code (VARCHAR PK)    name, type
  storekeeper, agent, expeditor_login (FK to users)
  │
  └── warehouse_stock ──► warehouse_stock
        id (UUID PK)        warehouse_code (FK)
        product_code (FK)   batch_id (FK)
        quantity, reserved_qty

operations ────────────────────────────────────────────────────────
  id (UUID PK)            operation_number (UNIQUE)
  type_code (FK)          warehouse_from (FK), warehouse_to (FK)
  product_code (FK)       batch_id (FK)
  quantity, amount        customer_id (FK), order_id (FK)
  status                  created_by, expeditor_login
  created_at, updated_at

menu_items / role_menu_access ──────────────────────────────────
  RBAC: role → menu_item_id → access_level (none/view/full)
```

### 2.2 Key Relationships
- One User → Many Customers (as agent)
- One Customer → Many Orders, Visits, Photos
- One Order → Many Items (each item = one product line)
- One Warehouse → Many WarehouseStock entries (product × batch)
- One Operation → references Warehouse, Product, Batch, Customer, Order

### 2.3 Missing / Planned Tables
- `cities` — reference table for customer cities (migration exists, no CRUD API)
- `territories` — sales territories (migration exists, no API)
- `telegram_sessions` — bot session state (migration exists)
- Audit/changelog table — not yet created

---

## 3. API Design Detail

### 3.1 Authentication Endpoints
```
POST /api/v1/auth/login
  Body: {login: str, password: str}
  Returns: {access_token: str, token_type: "bearer", user: {login, fio, role, ...}}

GET /api/v1/auth/me
  Header: Authorization: Bearer <token>
  Returns: {login, fio, role, phone, email, status, ...}

GET /api/v1/config
  Public (no auth)
  Returns: {yandex_maps_api_key: str}
```

### 3.2 Notable Endpoint Details

**GET /api/v1/customers** — Search & filter
```
Query params:
  search=str          # Name/firm/phone/address text search
  agent=str           # Filter by agent login
  status=str          # Filter by customer status
  city_id=int         # Filter by city
  territory_id=int    # Filter by territory
  limit=int           # Max results (default 100, no enforcement)
  offset=int          # Pagination offset
```

**GET /api/v1/operations/allocation/suggest-by-delivery-date**
Smart suggestion engine:
```
Query params:
  delivery_date=YYYY-MM-DD   # Target delivery date
  expeditor_login=str         # Optional expeditor filter
  warehouse_code=str          # Source warehouse

Algorithm:
  1. Find orders with scheduled_delivery_at == delivery_date (status=active)
  2. Group items by product_code (sum quantities)
  3. Check warehouse_stock for availability
  4. Return suggested operation items with quantities
```

**POST /api/v1/operations/flow**
Multi-step operation workflow:
```
Body: {
    operation_type: str,
    steps: [{warehouse_from, warehouse_to, product_code, quantity, ...}]
}
Validates each step, executes atomically (or should — see gaps)
```

### 3.3 Missing API Features
- Pagination headers (X-Total-Count, Link)
- Cursor-based pagination for large result sets
- Bulk endpoints (bulk update, bulk delete)
- Webhook/callback system
- WebSocket for real-time updates
- Standardized error response schema

---

## 4. Error Handling Strategy

### Current Implementation
```python
# Typical pattern in routers:
try:
    result = await db.execute(query)
    return result.fetchall()
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

**Issues:**
- Raw exception messages exposed to client (security risk)
- No error codes (client can't distinguish errors programmatically)
- Sentry captures exceptions but no structured logging
- Bot handlers have try/except with Russian user messages

### Recommended Error Schema
```json
{
    "error": {
        "code": "CUSTOMER_NOT_FOUND",
        "message": "Клиент не найден",
        "details": {"id": 123},
        "request_id": "uuid"
    }
}
```

### Error Recovery
- Database connection failures: no retry logic (FastAPI returns 500)
- Bot API failures: SDSApiError with user-friendly message
- File upload failures: partial cleanup not guaranteed

---

## 5. Security Design

### 5.1 Implemented Security
| Mechanism | Implementation |
|---|---|
| Password hashing | bcrypt via passlib (cost factor default ~12) |
| Session tokens | JWT HS256, 60-min expiry |
| Input validation | Pydantic models on all request bodies |
| Role enforcement | Dependency injection on admin routes |
| User status check | `status == "активен"` on every auth check |
| CORS | Configured (currently allows all origins) |

### 5.2 Security Gaps (Critical)
1. **Credentials in Source Code** — `connection.py` has hardcoded DB password as defaults
2. **Weak JWT Secret** — `.env` has `your-super-secret-key-change-this-in-production`
3. **All Origins CORS** — `allow_origins=["*"]` should be restricted to production domain
4. **No Rate Limiting** — `/auth/login` can be brute-forced
5. **Raw Exception Messages** — Internal errors exposed in HTTP responses
6. **No HTTPS Enforcement** — No redirect or HSTS headers
7. **Photo Access** — Download tokens exist but no expiry
8. **SQL Injection Risk** — Some endpoints use `f"...{user_input}..."` in text() queries

### 5.3 Authorization Matrix
| Endpoint Category | admin | agent | expeditor | stockman | paymaster |
|---|---|---|---|---|---|
| Users CRUD | FULL | - | - | - | - |
| Customers | FULL | FULL | VIEW | VIEW | - |
| Orders | FULL | FULL | FULL | VIEW | - |
| Visits | FULL | FULL | FULL | - | - |
| Operations | FULL | - | FULL | FULL | FULL |
| Stock | FULL | - | VIEW | FULL | - |
| Finances | FULL | - | VIEW | - | FULL |
| Reports | FULL | VIEW | VIEW | FULL | FULL |
| Dictionary | FULL | VIEW | VIEW | VIEW | VIEW |

---

## 6. Performance Considerations

### 6.1 Current Performance Profile
- **Request throughput:** Single-worker Uvicorn, no load balancing
- **Database:** NullPool — new connection per request (connection overhead per request)
- **Bot caching:** In-memory dict with TTL (lost on restart, not shared across instances)
- **No query optimization:** No indexes documented beyond PKs and FKs

### 6.2 Known N+1 Query Risks
- `GET /customers` — Fetches customers, then photos separately
- `GET /orders` — Items loaded per order in some endpoints
- `GET /reports` — Multiple sequential queries instead of JOINs

### 6.3 Optimization Opportunities

**Database Connection Pooling:**
```python
# Replace NullPool with:
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
)
```

**Caching Strategy:**
```
In-memory dict in bot (current):
  - Works for single instance only
  - Lost on restart
  - Sufficient for current scale
```

**Query Optimization:**
- Add composite indexes on frequently filtered columns:
  - `customers(login_agent, status)` for agent filtering
  - `orders(customer_id, status_code)` for order listing
  - `operations(warehouse_from, created_at)` for operation history
  - `customers_visits(customer_id, visit_date)` for visit calendar

### 6.4 Scalability Approach
- Current: Single server, single process
- Near-term: Multiple Uvicorn workers (`--workers 4`)
- Mid-term: Separate API and bot processes (already separated)
- Long-term: Move to webhook mode for bot, horizontal scaling with load balancer

---

## 7. Configuration Management

### Current Approach
```python
# .env file loaded via python-dotenv
from dotenv import load_dotenv
load_dotenv()
DATABASE_HOST = os.getenv("DATABASE_HOST", "45.141.76.83")  # DANGER: hardcoded default
```

### Recommended Approach
```python
# Use pydantic-settings (already in requirements.txt)
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str          # Required, no default
    jwt_secret_key: str        # Required, no default
    telegram_bot_token: str    # Required, no default
    sentry_dsn: str = ""       # Optional
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()  # Fails fast if required vars missing
```

### Environment Files
- `.env` — Production secrets (gitignored) ✅
- `.env.example` — Template with placeholder values ✅
- Missing: `.env.test` for test environment

---

## 8. Telegram Bot Architecture

### Session Management
```
User sends message
  → Look up telegram_id in sessions table
  → Load conversation state (current step, temp data)
  → Execute handler for current state
  → Save updated state
  → Send response to user
```

### Conversation State Machine
```
AUTH flow:
  START → ASK_LOGIN → ASK_PASSWORD → AUTHENTICATED → MAIN_MENU

AGENT flow:
  MAIN_MENU → {
    CREATE_CUSTOMER → ADD_CUSTOMER_NAME → ... → CONFIRM → SAVE,
    CREATE_VISIT → SELECT_CUSTOMER → SET_DATE → ... → SAVE,
    CREATE_ORDER → SELECT_CUSTOMER → ADD_ITEMS → SET_PAYMENT → SAVE,
    VIEW_REPORTS → SELECT_REPORT_TYPE → SHOW_DATA
  }

EXPEDITOR flow:
  MAIN_MENU → {
    VIEW_ROUTE → SHOW_DELIVERIES,
    CONFIRM_DELIVERY → SELECT_ORDER → CONFIRM,
    CREATE_OPERATION → ... → SAVE
  }
```

### API Client (`sds_api.py`)
```python
class SDSAPI:
    base_url: str
    timeout: int = 30

    async def _request(self, method, endpoint, token, **kwargs) -> dict
    async def login(self, username, password) -> dict
    async def get_customers(self, token, search=None) -> list
    # ... 20+ methods
```

**Error Handling:**
```python
class SDSApiError(Exception):
    status_code: int
    message: str
```

---

## 9. File Storage Design

### Current Implementation
- Photos stored on local filesystem at `UPLOAD_DIR`
- Filename pattern: `{customer_id}_{date}_{time}.{ext}`
- Served via FastAPI `StaticFiles` mount at `/photo/`
- Download tokens: UUID stored in DB for secure access

### Production Setup
- Photos stored at `/var/www/sales.zakharenkov.ru/html/photo/`
- Served via web server (Nginx) directly

### Gaps
- No file size enforcement (only by content-type check)
- No image optimization/thumbnail generation
- No cloud backup
- Single-server storage (not scalable)

---

## 10. Monitoring & Observability

### Current Setup
- **Sentry:** Error capture with traces (sample rate 1.0 in production)
- **Logs:** `telegram_bot.log` file, no structured logging
- **Health endpoint:** `GET /health` returns basic status

### Missing
- Structured logging (loguru is in requirements but barely used)
- Request/response logging middleware
- Performance metrics (request duration, DB query time)
- Alerting rules (error rate thresholds)
- Dashboard for API metrics (Grafana/Prometheus)
