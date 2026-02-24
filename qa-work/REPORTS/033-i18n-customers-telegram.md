# QA Report: 033 ? Customers + Telegram i18n integrity

**Status:** ? APPROVED
**Date:** 2026-02-21 15:54)

## Translation Metrics

- Distinct translation keys: **375**
- Keys fully covered (RU+UZ+EN): **375**
- Keys missing at least one language: **0**

### By language (all keys)
- en: **375**
- ru: **375**
- uz: **375**

### Telegram only (`telegram.*`)
- Distinct telegram keys: **127**
- en: **127**
- ru: **127**
- uz: **127**
- Telegram keys missing at least one language: **0**

### By category and language
| Category | ru | uz | en |
|---|---:|---:|---:|
| buttons | 26 | 26 | 26 |
| fields | 138 | 139 | 138 |
| menu | 37 | 37 | 37 |
| messages | 26 | 25 | 26 |
| operation_types | 13 | 13 | 13 |
| payment_types | 3 | 3 | 3 |
| statuses | 5 | 5 | 5 |
| telegram | 127 | 127 | 127 |

## Automated Checks

- `alembic upgrade head`: ? passed (applied `033_fix_customers_i18n`)
- `pytest tests -q` with `PYTHONPATH=.`: ? **61 passed, 9 skipped**
- JS syntax check (`node --check` extracted script from `src/static/app.html`): ? passed

## Scope Verified

- Customers list labels, filters, placeholders, table headers, and actions switched to DB i18n keys
- Create Customer form labels switched to DB i18n keys
- Customers on Map section labels and counters switched to DB i18n keys
- Translation DB corrected for RU/UZ/EN integrity for customer-related keys and header buttons
- Telegram keys usage scan: **116 quoted keys used in code, 0 missing in migrations**