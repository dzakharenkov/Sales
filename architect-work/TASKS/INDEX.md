# Tasks Index — Sales & Distribution System (SDS)

## Quick Stats

| Metric | Value |
|---|---|
| **Total Tasks** | 22 |
| **Critical Priority** | 5 |
| **High Priority** | 12 |
| **Medium Priority** | 5 |
| **Estimated Total Time** | ~105 hours |

---

## Task List by Priority

### CRITICAL (Must do first)
| ID | Task | Hours | Status |
|---|---|---|---|
| [001](001-SECRETS-MANAGEMENT.md) | Secrets Management & Credential Rotation | 3h | NOT STARTED |
| [002](002-RATE-LIMITING.md) | API Rate Limiting | 2h | NOT STARTED |
| [003](003-SQL-INJECTION-FIX.md) | Fix SQL Injection Risks | 4h | NOT STARTED |
| [004](004-DB-CONNECTION-POOLING.md) | Database Connection Pooling | 3h | NOT STARTED |
| [017](017-OPERATION-TRANSACTIONS.md) | Atomic Transaction Management | 3h | NOT STARTED |

### HIGH PRIORITY
| ID | Task | Hours | Status |
|---|---|---|---|
| [005](005-ALEMBIC-MIGRATIONS.md) | Alembic Migrations Setup | 6h | NOT STARTED |
| [006](006-STRUCTURED-LOGGING.md) | Structured Logging Setup | 3h | NOT STARTED |
| [007](007-PYDANTIC-RESPONSE-SCHEMAS.md) | Pydantic Response Schemas | 6h | NOT STARTED |
| [008](008-API-PAGINATION.md) | API Pagination | 4h | NOT STARTED |
| [009](009-SETTINGS-MODULE.md) | Centralized Settings Module | 2h | NOT STARTED |
| [011](011-CITIES-TERRITORIES-API.md) | Cities & Territories CRUD API | 4h | NOT STARTED |
| [012](012-EXPEDITOR-BOT-HANDLERS.md) | Complete Expeditor Bot Handlers | 8h | NOT STARTED |
| [013](013-DB-INDEXES.md) | Database Performance Indexes | 3h | NOT STARTED |
| [014](014-TEST-SUITE.md) | Unit & Integration Test Suite | 8h | NOT STARTED |
| [015](015-ERROR-HANDLING.md) | Standardized Error Handling | 4h | NOT STARTED |
| [016](016-CORS-HARDENING.md) | CORS Hardening & Security Headers | 1h | NOT STARTED |
| [019](019-CICD-PIPELINE.md) | CI/CD Pipeline (GitHub Actions) | 4h | NOT STARTED |

### MEDIUM PRIORITY
| ID | Task | Hours | Status |
|---|---|---|---|
| [010](010-CODE-QUALITY-TOOLS.md) | Code Linting & Formatting Setup | 2h | NOT STARTED |
| [018](018-PDF-EXPORT.md) | PDF Report Export | 5h | NOT STARTED |
| [020](020-TELEGRAM-NOTIFICATIONS.md) | Real-time Telegram Notifications | 4h | NOT STARTED |
| [021](021-SERVICE-LAYER.md) | Service Layer Extraction | 8h | NOT STARTED |
| [022](022-ASYNC-PHOTO-UPLOAD.md) | Fix Async Photo Upload | 2h | NOT STARTED |

---

## Task Execution Path

### Phase 1: Security Hardening (Week 1)
**Goal:** Fix all critical security vulnerabilities. Nothing else should be worked on until these are complete.

```
Day 1-2:
  [001] Secrets Management (3h) ──────────────────────────────► FIRST
        ↓
  [016] CORS Hardening (1h) ──────────┐
  [002] Rate Limiting (2h) ───────────┤ Can be done in parallel after 001
  [003] SQL Injection Fix (4h) ───────┘

Day 3-4:
  [004] DB Connection Pooling (3h) — after 001
  [015] Error Handling (4h) — after 007 (or simplified version first)
```

### Phase 2: Foundation (Week 2)
**Goal:** Set up infrastructure for sustainable development.

```
Day 5-6:
  [009] Settings Module (2h) ─────────────────────────────────► FIRST
        ↓
  [005] Alembic Migrations (6h)
  [010] Code Quality Tools (2h) ────────────────────► Parallel with 005
  [006] Structured Logging (3h) ────────────────────► Parallel with 005

Day 7-8:
  [014] Test Suite (8h) — requires 010 (pytest config)
```

### Phase 3: API Quality (Week 3)
**Goal:** Clean up API contracts and performance.

```
Day 9-10:
  [007] Pydantic Response Schemas (6h) ──► FIRST in phase
        ↓
  [008] API Pagination (4h) — requires 007
  [013] DB Indexes (3h) — requires 005 (Alembic)

Day 11:
  [017] Operation Transactions (3h) — requires 004
```

### Phase 4: Feature Completion (Week 4)
**Goal:** Complete missing business features.

```
Day 12-13:
  [011] Cities & Territories API (4h)
  [012] Expeditor Bot Handlers (8h) ────► Most complex, needs full day

Day 14:
  [022] Async Photo Upload (2h)
  [020] Telegram Notifications (4h) — requires 012
```

### Phase 5: Quality & Polish (Week 5+)
**Goal:** Refactoring, monitoring, documentation.

```
  [021] Service Layer Extraction (8h) — requires 014 (tests)
  [018] PDF Export (5h)
  [019] CI/CD Pipeline (4h) — requires 010, 014
```

---

## Dependency Map

```
001 ──► 002, 003, 004, 006, 009, 016
009 ──► 006, 012, 020, 022
004 ──► 017
005 ──► 011, 013
007 ──► 008, 011, 015, 021
010 ──► 014, 019
014 ──► 019, 021
007 + 009 ──► 012
```

---

## How Developers Should Use This

1. **Read first (30 min):**
   - [ARCHITECTURE.md](../ARCHITECTURE.md) — System overview
   - [TECHNICAL_DESIGN.md](../TECHNICAL_DESIGN.md) — Design patterns
   - [CURRENT_STATE.md](../CURRENT_STATE.md) — What exists and what's broken

2. **Start with Task 001** — Security first, always

3. **Follow the dependency chain** — Check each task's "Dependencies" section

4. **One task at a time** — Mark in_progress in the task file before starting

5. **Check acceptance criteria** — Every checkbox must be ticked before marking done

6. **Commit format:** `git commit -m "[TASK-001] Remove hardcoded credentials from connection.py"`

7. **Update task status** — Change `Status: NOT STARTED` to `Status: COMPLETED` in the task file

---

## Time Estimates by Category

| Category | Tasks | Hours |
|---|---|---|
| Security | 001, 002, 003, 016 | 10h |
| Database | 004, 005, 013, 017 | 15h |
| Architecture | 006, 007, 008, 009, 015, 021, 022 | 27h |
| Features | 011, 012, 018, 020 | 21h |
| Quality/Testing | 010, 014, 019 | 10h |
| **TOTAL** | **22 tasks** | **~103h** |
