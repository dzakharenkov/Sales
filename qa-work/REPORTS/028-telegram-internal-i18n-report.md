# QA Report: 028 ? Telegram internal dialogs i18n completion

**Date:** 2026-02-21  
**Status:** ? DONE (for auth + create_visit flow)

## What was fixed

1. Removed unresolved Telegram key in UI:
- `telegram.button.back` now exists in DB for `ru/uz/en`.

2. Completed translation coverage for internal visit creation flow:
- Added `telegram.visit_create.*` keys to translations table.
- Wired `src/telegram_bot/handlers_agent_create_visit.py` to localized output via DB keys.
- Added fallback-safe localized keyboard labels for Back/Cancel/Skip.

3. Fixed broken logout confirmation text path:
- `telegram.auth.logout_confirm` verified for `ru/uz/en`.

## Database metrics

- `telegram.*` rows now:
  - `ru`: 78
  - `uz`: 78
  - `en`: 78
- Keys used in `handlers_auth.py` + `handlers_agent_create_visit.py`: **67**
- Missing `(key,language)` rows for those used keys: **0**

## Sample verified keys

- `telegram.button.back`: `Back / ????? / Orqaga`
- `telegram.button.cancel`: `Cancel / ?????? / Bekor qilish`
- `telegram.auth.logout_confirm`: present on all 3 languages
- `telegram.visit_create.step1`: present on all 3 languages
- `telegram.visit_create.step2`: present on all 3 languages

## Code changes

- `src/telegram_bot/handlers_agent_create_visit.py`
  - added DB-backed localizer for internal dialog text
  - added localized wrappers for `reply_text`/`edit_message_text`
  - added localized keyboard helpers for Back/Cancel/Skip

- `alembic/versions/025_tg_dialog_i18n.py`
  - seeds/updates internal Telegram dialog keys (`telegram.button.*`, `telegram.visit_create.*`) via upsert

## Migration state

- Current alembic head: `025_tg_dialog_i18n`

## Verification commands

- `python -m py_compile src/telegram_bot/handlers_agent_create_visit.py src/telegram_bot/handlers_auth.py src/telegram_bot/i18n.py` ?
- DB key completeness query for used telegram keys ?
- `alembic current` => `025_tg_dialog_i18n (head)` ?
