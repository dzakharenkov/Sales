# QA Report: 030 — SDS i18n Completion (Web + Telegram)

**Status:** ✅ APPROVED (implementation + checks complete)
**Date:** 2026-02-21

## Scope
- Web UI literal i18n hardening for forms/cards/table headers (including visit/customer creation contexts).
- Telegram internal dialogs i18n completion for `create_visit` and `add_customer_v3`.
- Translation keys moved to DB-backed configurable table (`"Sales".translations`), no new hardcoded display-only strings introduced.
- Security/test re-run after changes.

## Implemented Changes

1. Telegram i18n
- Updated `src/telegram_bot/handlers_agent_create_visit.py`:
  - fixed fallback defaults to readable values (removed `????` fallbacks),
  - aligned button/status labels with translation keys.
- Updated `src/telegram_bot/handlers_agent_v3_add_customer.py`:
  - added centralized translation resolver wrapper for message text and button labels,
  - added runtime localization for `InlineKeyboardMarkup` and `ReplyKeyboardMarkup`,
  - mapped internal flow prompts/errors/summary labels to `telegram.customer_create.*` keys,
  - ensured session/error/cancel/create prompts resolve via translations.

2. DB Migrations
- `alembic/versions/028_seed_customer_create_i18n.py` (`revision=028_customer_i18n`)
  - base customer-create telegram keys (steps/buttons/check/cancel).
- `alembic/versions/029_seed_missing_ui_translation_keys.py` (`revision=029_ui_i18n`)
  - missing UI keys for visit/customer form labels and city/territory add actions.
- `alembic/versions/030_tg_customer_create_extra_i18n.py` (`revision=030_tg_cust_i18n`)
  - extended customer-create telegram keys (validation errors, required alerts, no-directory errors, attach/location prompts, summary labels, success/error blocks).

3. Web UI i18n hardening
- Updated `src/static/app.html`:
  - expanded literal-to-key mapping for missing labels from reported screens,
  - added observer-based auto-apply for dynamic content (`MutationObserver`) so async-rendered blocks also get localized,
  - kept language switcher code as `RU/UZ/EN` and menu key normalization flow intact.

## Database Translation Metrics
Source: `qa-work/REPORTS/030-i18n-metrics.json`

- Total distinct keys: **364**
- Records by language:
  - ru: **364**
  - uz: **364**
  - en: **364**
- Keys missing any of ru/uz/en: **0**
- Telegram keys:
  - distinct: **127**
  - ru/uz/en rows: **127 / 127 / 127**
- `telegram.customer_create.*`:
  - distinct: **48**
  - missing language rows: **0**

## Migration State
- `alembic current`: **030_tg_cust_i18n (head)**

## Test Execution Results

### Functional/Unit
Command:
```bash
PYTHONPATH=. pytest tests -q
```
Result:
- **61 passed**
- **9 skipped**
- **0 failed**
- 1 deprecation warning (Pydantic Config style)

### Security Static Scan
Command:
```bash
bandit -r src -q
```
Result:
- No failing findings.
- 3 informational `# nosec` warnings only.

### Dependency Vulnerability Scan
Command:
```bash
safety check --short-report
```
Result:
- **0 vulnerabilities**

## Acceptance Criteria Check
- [x] All requested languages ru/uz/en are fully represented in DB translations.
- [x] Internal Telegram create flows now rely on translation table keys.
- [x] Missing UI labels from reported visit/customer/table contexts were mapped and key-backed.
- [x] Migrations applied successfully to latest head.
- [x] Tests and security checks re-run and passing.

## Notes / Residual Risk
- `src/static/app.html` remains a large legacy inline script; localization is now robust for dynamic updates, but further refactor to explicit key-based templates would reduce long-term maintenance risk.

