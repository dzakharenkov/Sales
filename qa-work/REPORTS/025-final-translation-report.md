# Final Translation Report (Sprint 025)

**Date:** 2026-02-20
**Project:** SDS (Sales schema)

## 1) Database translation totals

After applying migrations up to `020_ui_full_labels`:

- `ru`: **249** rows
- `uz`: **249** rows
- `en`: **249** rows
- Unique translation keys: **249**
- Keys with missing language rows: **0**

## 2) Delta from previous state

Previous state (after 019):
- `ru/en/uz`: **168 / 168 / 168**
- Unique keys: **168**

Current state (after 020):
- `ru/en/uz`: **249 / 249 / 249**
- Unique keys: **249**

Added in this iteration:
- New unique keys: **+81**
- New language rows total: **+243**

## 3) UI key coverage used by app.html

Parsed keys used in `src/static/app.html` (`uiTr(...)` + runtime literal map):
- Total keys used: **81**
- Missing in DB: **0**

This specifically fixes raw key leaks like:
- `button.about`
- `button.logout`
- unresolved `field.*`, `ui.*`, `status.planned` labels from tabs

## 4) What was fixed functionally

- `uiTr` fallback now avoids showing unresolved keys as visible text.
- Added extended runtime mapping in `app.html` to translate headings/buttons/table labels/placeholders from all listed tabs.
- Added migration `020_ui_full_labels` with 3-language rows for all new keys.

## 5) Tests run

- `PYTHONPATH=. pytest -q`
- Result: **1 failed, 60 passed, 9 skipped**
- Failing test (existing):
  - `tests/test_logging_middleware.py::test_extract_user_login_unknown_for_invalid_token`
  - expected `unknown`, actual `anonymous`

Log: `qa-work/REPORTS/025-pytest.log`

## 6) Remaining technical debt (not fully zero-hardcode yet)

Static literal scan snapshot:
- `src/static/app.html`: **810** Cyrillic literals
- `src/telegram_bot/*`: **866** Cyrillic literals

These counts include many backend strings, prompts, comments, and non-UI text; full “zero hardcode” requires additional sweep.

## 7) Artifacts

- `alembic/versions/020_ui_full_labels.py`
- `qa-work/REPORTS/025-alembic-upgrade-020.log`
- `qa-work/REPORTS/025-pytest.log`
- `qa-work/REPORTS/025-hardcode-counts.txt`
