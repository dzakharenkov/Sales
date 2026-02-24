# QA Report: 034 ? RU language integrity for Translations section

**Status:** ? APPROVED  
**Date:** 2026-02-21 15:59

## Root Cause Analysis

1. `src/static/app.html` section `loadSectionTranslations()` contained hardcoded English labels (`References: Translations`, `All translations`, `Quality`, `Edit`, `Delete`, etc.).
2. Even with `currentLanguage=ru`, these labels were not taken from DB translations, so UI stayed mixed RU/EN.
3. Missing DB keys for translation-management labels made full localization impossible without fallback.

## Fix Implemented

- Reworked `loadSectionTranslations()` to use DB-backed keys via `tUi(...)` for:
  - section title
  - stats cards
  - filters/placeholders
  - table headers
  - modal titles/labels
  - error/confirm messages
  - action buttons
- Added migration `alembic/versions/034_translations_ui_labels.py` with RU/UZ/EN values for all new keys.
- Extended `loadUiTranslations()` requested key set for new `ui.translations.*` and `label.*` keys.

## Validation

- `alembic upgrade head`: ? (applied `034_translations_ui_labels`)
- `pytest tests -q` (`PYTHONPATH=.`): ? 61 passed, 9 skipped
- JS syntax check (`node --check`): ?

## Translation Coverage (DB)

- Total translations:
  - ru: **393**
  - uz: **393**
  - en: **393**
- Missing keys by language set: **0**
- Telegram translations:
  - ru: **127**
  - uz: **127**
  - en: **127**

## Notes

- Console output in Windows PowerShell may display Russian text as `????` because of codepage rendering; DB values are present and queried for all three languages.
