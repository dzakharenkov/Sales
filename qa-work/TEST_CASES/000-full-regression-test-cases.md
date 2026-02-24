# Test Plan: Full Regression (Tasks 001-022)

## Scope
- [x] Automated tests (`pytest` + coverage)
- [x] Static quality checks (`flake8`, `mypy`)
- [x] Security checks (`bandit`, `safety`)
- [x] Telegram bot role/menu smoke checks (agent/expeditor)
- [x] Task/report inventory validation (architect/developer files)

## Environment
- OS: Windows 11
- Python: 3.13.3
- Date: 2026-02-20
- Workspace: `d:\Python\Sales`

## Execution Order (by task IDs)
1. 001-010: foundation/security/platform checks by unit/integration + static analysis
2. 011-017: API/features checks by tests and source inspection
3. 019-022: deployment/integration/async features checked by available automated artifacts
4. Telegram bot: separate role regression (expeditor/agent)

## Key Test Cases

### TC-01: Baseline automated tests
- Command: `PYTHONPATH=. pytest tests -q`
- Expected: all tests pass

### TC-02: Coverage gate
- Command: `PYTHONPATH=. pytest tests -q --cov=src --cov-report=term`
- Expected: >= 90%

### TC-03: Lint/type/security quality
- Commands:
  - `flake8 src`
  - `mypy src`
  - `bandit -r src -f json`
  - `safety check --json`
- Expected: no blocking errors, no critical vulnerabilities

### TC-04: Telegram expeditor role menu isolation
- Validate callbacks in `main_menu_keyboard('expeditor')`
- Expected: no `agent_create_visit` and no `agent_visits`

### TC-05: Telegram agent role menu
- Validate callbacks in `main_menu_keyboard('agent')`
- Expected: includes visit/create-visit callbacks, no expeditor payment callbacks

### TC-06: Telegram auth flow readiness
- Validate auth `ConversationHandler` states include `ASK_LOGIN` and `ASK_PASSWORD`
- Expected: password step is registered and reachable

### TC-07: Telegram payment buttons wiring (expeditor)
- Validate `register_expeditor_handlers()` patterns
- Expected: handlers for `^exp_payment$` and `^exp_received_payments$` are registered

### TC-08: Customer search fallback in bot API client
- Unit-like check `SDSApi.search_customers()` for `search` -> fallback by `tax_id` / `name_client` / `firm_name`
- Expected: list result for both INN and name scenario
