# Test Plan: 012 ? Complete Expeditor Telegram Bot Handlers

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] E2E tests (if applicable)
- [x] Performance tests (baseline)
- [x] Security tests
- [x] Edge cases

## Acceptance Criteria Under Test
1. Expeditor can log in via Telegram bot
2. Expeditor sees role-appropriate main menu after login
3. "Мой маршрут" (My Route) — shows today's scheduled deliveries sorted by customer
4. "Подтвердить доставку" (Confirm Delivery) — step-by-step confirmation of order delivery
5. "Остатки склада" (Stock Levels) — view current warehouse stock
6. "Создать операцию" (Create Operation) — create warehouse operation (allocation/shipment)
7. "Визиты" (Visits) — view and create visits to customers
8. All bot messages use Russian language
9. Error messages are user-friendly (no technical details)
10. All conversation flows have a "Назад" (Back) button and "Отмена" (Cancel) option
11. Handler properly cleans up conversation state on completion or cancellation

## Executed Checks
1. `pytest tests/ -v --cov=src --cov-report=html --cov-report=term`
2. `mypy src`
3. `flake8 src`
4. `bandit -r src -f json`
5. `safety check --json`

## Global Metrics Snapshot
- Pytest: 61 passed, 9 skipped
- Coverage: 22%
- mypy errors: 1353
- flake8 issues: 1795
- bandit: 28 findings
- safety: 19 vulnerabilities
