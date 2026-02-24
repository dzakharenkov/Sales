# Project Architecture — Sales & Distribution System (SDS)

## Overview

**Project:** Узбекская система управления продажами и дистрибуцией (Uzbek Sales & Distribution System)
**Version:** 0.5 (active development)
**Language:** Python 3.13+
**Type:** Full-Stack Web Application + Telegram Bot

### Business Goals
- Manage a distributed sales network of agents, expeditors, warehouse staff, and paymasters in Uzbekistan
- Track customers, visits, orders, warehouse operations, and finances through a unified system
- Provide both a web interface (for office/admin) and a Telegram bot (mobile-first for field agents)
- Generate analytical reports for management decision-making

### Key Features
- Multi-role user management (admin, agent, expeditor, stockman, paymaster)
- Customer CRM with geographic tracking, photos, and visit history
- Warehouse inventory management with batch tracking and stock transfers
- Sales order lifecycle management from creation to delivery
- Role-based dynamic menu and access control (RBAC)
- Dual-channel UI: Web SPA + Telegram Bot
- Comprehensive reporting and Excel export

---

## Architecture Pattern

### Pattern: Layered Monolith (Backend-for-Frontend)

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│  ┌──────────────────────┐    ┌───────────────────────────┐  │
│  │   Web SPA (Vanilla   │    │    Telegram Bot            │  │
│  │   JS + HTML/CSS)     │    │  (python-telegram-bot 21)  │  │
│  └──────────┬───────────┘    └────────────┬──────────────┘  │
└─────────────┼──────────────────────────────┼────────────────┘
              │ HTTP/REST (JWT)              │ HTTP/REST (JWT)
              ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (FastAPI)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   src/api/v1/routers/ (14 routers, 50+ endpoints)   │   │
│  │   Auth │ Menu │ Users │ Customers │ Orders │ Visits  │   │
│  │   Operations │ Stock │ Warehouse │ Reports │ Finances│   │
│  └──────────────────────────┬───────────────────────────┘   │
│  ┌──────────────────────────▼───────────────────────────┐   │
│  │        Core (deps.py, security.py, sentry_setup.py)  │   │
│  └──────────────────────────┬───────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    DATABASE LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/database/ (connection.py + models.py)           │   │
│  │  AsyncPG + SQLAlchemy 2.0 ORM                        │   │
│  └──────────────────────────┬───────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│              PostgreSQL 13+ (schema: "Sales")                │
│              19 tables — remote server 45.141.76.83:5433    │
└─────────────────────────────────────────────────────────────┘
```

### Justification
The layered monolith was appropriate for the current team size and project maturity. FastAPI provides clean async handling. The bot is logically a second client of the same API, enabling code reuse without duplication.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Python | 3.13+ | Core language |
| Web Framework | FastAPI | ≥0.104.1 | REST API |
| ASGI Server | Uvicorn | ≥0.24.0 | Production server |
| Database ORM | SQLAlchemy | 2.0+ | ORM models |
| DB Driver | AsyncPG | ≥0.29.0 | Async PostgreSQL |
| Database | PostgreSQL | 13+ | Primary data store |
| Auth | python-jose + passlib | 3.3+ / 1.7+ | JWT + bcrypt |
| Config | python-dotenv | ≥1.0.0 | Env vars |
| Validation | Pydantic | ≥2.5, <3 | Request/response models |
| Bot | python-telegram-bot | ≥21.0 | Telegram interface |
| HTTP Client | httpx | ≥0.27.0 | Bot → API calls |
| Export | openpyxl | ≥3.1.0 | Excel generation |
| Monitoring | sentry-sdk | ≥2.0.0 | Error tracking |
| Testing | Playwright | ≥1.40.0 | UI automation tests |
| Frontend | Vanilla JS / HTML | ES2020 | SPA web interface |

---

## System Components

### 1. FastAPI Application (`src/main.py`)
Entry point. Handles lifecycle (startup DB check), CORS, static file serving, router registration, and data integrity validation on boot.

### 2. API Routers (`src/api/v1/routers/`)
14 router modules, each encapsulating a business domain:

| Router | Endpoints | Domain |
|---|---|---|
| `auth.py` | 3 | Authentication & config |
| `menu.py` | 3 | Role-based menu access |
| `users.py` | 4 | User management |
| `customers.py` | 7 | Customer CRM |
| `orders.py` | 8 | Order lifecycle |
| `visits.py` | 6 | Customer visit tracking |
| `operations.py` | 7 | Warehouse operations |
| `operations_flow.py` | 2 | Operation workflows |
| `stock.py` | 1 | Stock queries |
| `warehouse.py` | 3 | Warehouse management |
| `finances.py` | 2 | Financial summaries |
| `dictionary.py` | 8 | Reference data |
| `reports.py` | 6 | Analytics & reports |
| `customer_photos.py` | 4 | Photo management |

### 3. Core Utilities (`src/core/`)
- `security.py` — bcrypt hashing + JWT creation/validation
- `deps.py` — FastAPI dependency injection (current user, admin guard)
- `sentry_setup.py` — Error monitoring initialization

### 4. Database Layer (`src/database/`)
- `connection.py` — AsyncPG connection pool, session factory, integrity checks
- `models.py` — SQLAlchemy ORM models (19 tables in `"Sales"` schema)

### 5. Telegram Bot (`src/telegram_bot/`)
- `bot.py` — Entry point, handler registration, single-instance lock
- `sds_api.py` — HTTP client wrapper for all API calls
- `session.py` — User session state management
- `helpers.py` — Formatting utilities, in-memory cache, calendar builder
- `config.py` — Bot-specific settings
- `handlers_auth.py` — Login/logout conversation
- `handlers_agent.py` — Agent-role conversation flows
- `handlers_agent_v3_add_customer.py` — Customer registration flow
- `handlers_agent_create_visit.py` — Visit creation flow
- `handlers_expeditor.py` — Expeditor-role conversation flows

### 6. Web Frontend (`src/static/`)
- `app.html` — SPA shell
- `app.js` — ~3000-line vanilla JS SPA (all sections, role logic, API calls)
- `login.html` — Login page

### 7. Database Schema (`sales_sql.sql` + `migrations/`)
- Complete schema: 19 tables, UUIDs, serial IDs, timestamps
- Migration files for schema evolution

---

## Data Flow

### Web User Request Flow
```
User (browser)
  → GET/POST /api/v1/{endpoint} with Authorization: Bearer <JWT>
  → FastAPI middleware validates JWT
  → deps.py: get_current_user() extracts user + role from JWT
  → Router handler executes business logic
  → database/connection.py: async_session() opens AsyncPG connection
  → SQL query (ORM or raw) executes against PostgreSQL
  → Response JSON returned to browser
  → app.js updates DOM
```

### Telegram Bot Request Flow
```
Telegram User → sends message
  → python-telegram-bot polling receives update
  → Handler checks user session (DB lookup)
  → If not authenticated: handlers_auth.py conversation
  → If authenticated: role-specific handler
  → sds_api.py: HTTP POST to FastAPI /api/v1/{endpoint} with JWT
  → FastAPI processes and returns JSON
  → Handler formats response → sends Telegram message
```

### Authentication Flow
```
POST /auth/login {login, password}
  → Verify password (bcrypt against DB hash)
  → Check user status == "активен"
  → create_access_token({sub: login, role: role, exp: now+60min})
  → Return {access_token, token_type, user_info}
  → Client stores token in localStorage (web) or session DB (bot)
```

---

## Dependencies

### External Services
| Service | Purpose | Config |
|---|---|---|
| PostgreSQL | Primary database | `DATABASE_URL` env var |
| Telegram API | Bot communication | `TELEGRAM_BOT_TOKEN` |
| Yandex Maps API | Customer location maps | `YANDEX_MAPS_API_KEY` |
| Sentry | Error monitoring | `SENTRY_DSN` |

### Key Python Libraries
See Technology Stack table above.

### Infrastructure
- **Development:** Windows 11, Python 3.13
- **Production:** Ubuntu Linux, same PostgreSQL server
- **Deployment:** Manual scripts (`.bat` for Windows, shell scripts for Ubuntu)
