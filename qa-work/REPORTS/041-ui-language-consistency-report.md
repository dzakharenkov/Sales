# QA Report: 041 — UI Language Consistency + Full i18n Integrity

**Date:** 2026-02-21  
**Status:** ✅ Completed (code + checks)

## Root Cause (why RU showed EN/UZ)
1. `src/static/app.html`: function `tUi()` returned fallback literals (often EN) and did **not** prioritize DB translations (`window._uiTranslations`).
2. Some keys used by `tUi()` were not included in `/translations/resolve` batch, so fallback text leaked into UI.

## Implemented Fix
### Frontend
- File: `src/static/app.html`
- Updated `tUi(key, fallback)` logic:
  - First source: `window._uiTranslations[key]` (DB value for selected language).
  - Broken-value guard added (`key`, `??`, mojibake markers).
  - Then local `UI_TEXT` fallback.
  - RU emergency fallback via `RU_KEY_FALLBACK`.
- Added missing resolve keys in `loadUiTranslations()` batch:
  - `error.export_failed`
  - `error.operation_failed`
  - `menu.visits`
  - `message.confirm_delete`

## Translation DB Metrics
Source: `qa-work/REPORTS/041-i18n-metrics.json`
- Total keys: **426**
- Total rows by language:
  - `ru`: **426**
  - `uz`: **426**
  - `en`: **426**
- Telegram keys: **159**
- Telegram rows by language:
  - `ru`: **159**
  - `uz`: **159**
  - `en`: **159**
- Missing keys in any of RU/UZ/EN sets: **0**

## Validation Commands
1. `pytest tests -q` (with `PYTHONPATH=.`)
- Result: **61 passed, 9 skipped**

2. `flake8 src tests`
- Result: **passed**

3. `mypy src`
- Result: **Success, no issues**

4. `bandit -r src -q`
- Result: no failed findings (only `# nosec` informational warnings)

5. `safety check`
- Result: **0 vulnerabilities**

## Important Runtime Note
Browser can keep stale JS/HTML. After deploy/restart do hard refresh:
- `Ctrl+F5` or clear site cache for `127.0.0.1:8000`.

Without cache reset, old `app.html` can still show mixed-language behavior even after backend/DB is correct.
