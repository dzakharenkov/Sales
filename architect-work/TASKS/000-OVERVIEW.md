# Development Tasks Overview

**Project:** Sales & Distribution System (SDS) — Узбекская система управления продажами
**Priority:** CRITICAL
**Status:** NOT STARTED
**Total Estimated Time:** ~138 hours across 22 tasks

---

## Description

The SDS is a production-grade sales management system for a distribution company in Uzbekistan. The system is functional at version 0.5, serving multiple user roles (admin, agent, expeditor, stockman, paymaster) through a web SPA and a Telegram bot.

This task set addresses the critical gaps identified in the architecture analysis:
1. **Security hardening** — exposed credentials, no rate limiting, SQL injection risks
2. **Database improvements** — connection pooling, migrations system, missing indexes
3. **Feature completion** — cities/territories API, expeditor bot handlers, PDF export
4. **Code quality** — service layer, test suite, linting setup
5. **Infrastructure** — CI/CD, structured logging, monitoring

---

## Success Criteria

- [ ] All critical security vulnerabilities resolved (credentials, rate limiting, CORS)
- [ ] Database connection pooling active (NullPool replaced)
- [ ] Alembic migrations configured and all SQL migrations converted
- [ ] Comprehensive test suite with >60% coverage
- [ ] Cities/territories CRUD API implemented
- [ ] Expeditor Telegram bot handlers complete
- [ ] CI/CD pipeline running tests on every push
- [ ] Structured logging across all layers
- [ ] All API endpoints have Pydantic response schemas
- [ ] Code passes linting (ruff/black/mypy) without errors

---

## Task Phases

### Phase 1: Security & Foundation (Tasks 001-010) — ~36 hours
**Must complete before any new features**
- 001: Secrets management & credential rotation (CRITICAL, 3h)
- 002: API rate limiting (CRITICAL, 2h)
- 003: CORS hardening (HIGH, 1h)
- 004: Fix SQL injection risks (CRITICAL, 4h)
- 005: Structured error handling (HIGH, 4h)
- 006: Database connection pooling (CRITICAL, 3h)
- 007: Database indexes (HIGH, 3h)
- 008: Alembic migrations setup (HIGH, 6h)
- 009: Code linting & formatting setup (MEDIUM, 2h)
- 010: Structured logging setup (HIGH, 3h)

### Phase 2: Architecture Improvements (Tasks 011-020) — ~36 hours
**Refactoring for maintainability**
- 011: Pydantic response schemas for all endpoints (HIGH, 6h)
- 012: Service layer extraction (MEDIUM, 8h)
- 013: API pagination (HIGH, 4h)
- 014: Settings module with pydantic-settings (HIGH, 2h)
- 015: Async file I/O for photo uploads (MEDIUM, 2h)
- 016: Bot webhook mode migration (MEDIUM, 4h)
- 017: Transaction management for operations flow (HIGH, 3h)

### Phase 3: Feature Completion (Tasks 021-030) — ~36 hours
**Complete missing functionality**
- 021: Cities & territories CRUD API (HIGH, 4h)
- 022: Expeditor Telegram bot handlers (HIGH, 8h)
- 023: Password self-service reset (MEDIUM, 3h)
- 024: PDF report export (MEDIUM, 5h)
- 025: Bulk import with validation reporting (MEDIUM, 4h)
- 026: Real-time notifications via Telegram (MEDIUM, 4h)
- 027: Mobile-responsive web UI (LOW, 6h)
- 028: API documentation (Swagger enhancements + Postman) (MEDIUM, 2h)

### Phase 4: Quality & Testing (Tasks 031-040) — ~30 hours
**Test coverage and code quality**
- 031: Unit test suite setup (HIGH, 4h)
- 032: API integration tests (HIGH, 6h)
- 033: Test database setup (isolated from production) (CRITICAL, 3h)
- 034: Playwright UI test improvements (MEDIUM, 4h)
- 035: Performance profiling & N+1 fix (HIGH, 5h)
- 036: CI/CD pipeline (GitHub Actions) (HIGH, 4h)
- 037: Security audit automation (MEDIUM, 2h)
- 038: Load testing (MEDIUM, 2h)

---

## Related Documents

- [ARCHITECTURE.md](../ARCHITECTURE.md) — System architecture overview
- [TECHNICAL_DESIGN.md](../TECHNICAL_DESIGN.md) — Detailed technical design
- [CURRENT_STATE.md](../CURRENT_STATE.md) — Current strengths/weaknesses analysis
- [TASKS/INDEX.md](INDEX.md) — Task execution index

---

## Developer Instructions

1. Read `ARCHITECTURE.md` (5 min) — understand the system structure
2. Read `TECHNICAL_DESIGN.md` (15 min) — understand design decisions and patterns
3. Read `CURRENT_STATE.md` (10 min) — understand what exists and what's broken
4. Start with Task 001 (CRITICAL security fix — must be first)
5. Follow dependency chain (each task lists its dependencies)
6. Check all acceptance criteria before marking a task done
7. Create a commit per task with message: `[TASK-XXX] Brief description`
8. Update task status to COMPLETED in the task file when done

---

## Alembic Commands

```bash
# Apply all migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Rollback to base
alembic downgrade base

# Current revision
alembic current

# History
alembic history --verbose

# Create a new migration
alembic revision --autogenerate -m "describe_change"

# Render SQL only (safe preview)
alembic upgrade head --sql
```
