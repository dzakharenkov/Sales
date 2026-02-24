# QA Report: 032 — Target Re-Scan (Customers + Create Customer + Map + Telegram dialogs)

Date: 2026-02-21
Status: ✅ Completed

## Implemented in this pass
- Added DB keys for customer sections and map labels:
  - `field.city`, `field.phone`, `field.landmark`, `field.category_client`, `field.status`, `field.agent_login`
  - `ui.customers.map.title`, `ui.customers.map.provider`, `ui.customers.map.yandex`, `ui.customers.map.displayed_prefix`
  - `ui.common.of`
- Fixed/normalized RU text for `field.contact_person`.
- Updated `src/static/app.html`:
  - extended literal mapping for customer table/form labels and `— Все — / — Не выбрано — / — Не назначен`
  - map section now renders header/provider/yandex/title via `uiTr(...)`
  - map counter prefix uses translation key (`ui.customers.map.displayed_prefix`)
- Telegram internal dialogs stay DB-driven through:
  - `src/telegram_bot/handlers_agent_create_visit.py`
  - `src/telegram_bot/handlers_agent_v3_add_customer.py`
  - all `telegram.customer_create.*` keys from handler mapping are present in DB for `ru/uz/en`.

## Migration state
- Current head: `032_ui_common_of`

## Translation metrics (current DB)
- By language:
  - ru: **375**
  - uz: **375**
  - en: **375**
- Distinct keys: **375**
- Keys missing any of ru/uz/en: **0**

## Targeted coverage checks
- Customers related keyset checked: **33 keys**
- Full 3-language coverage for target keyset: **33/33**
- Missing in target keyset: **0**

## Telegram internal dialog checks
- `telegram.customer_create.*` keys referenced in code: **48**
- Missing 3-language rows among those keys: **0**

## Automated checks
- `PYTHONPATH=. pytest tests -q`:
  - **61 passed**, **9 skipped**, **0 failed**
- `bandit -r src -q`:
  - no failing findings (only informational warnings on existing `# nosec`)
- `safety check --short-report`:
  - **0 vulnerabilities**

## Files changed in this pass
- `src/static/app.html`
- `alembic/versions/031_ui_customers_sections_i18n.py`
- `alembic/versions/032_ui_common_of_key.py`

## Artifacts
- `qa-work/REPORTS/031-customers-telegram-scan.json`
- `qa-work/REPORTS/032-qa-target-rescan-customers-telegram.md`
