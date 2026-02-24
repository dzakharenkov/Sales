# QA Report: 024 — SDS Multilanguage (UI + Telegram + Translations Module)

**Status:** ❌ REJECTED (not ready for merge)  
**Date:** 2026-02-20  
**Time Spent:** 2h+

## Test Results Summary

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| `pytest` | pass | import error (`src` not found in test env) | ❌ |
| `mypy src` | pass | 1367 errors in existing codebase | ❌ |
| `flake8 src tests` | pass | multiple existing lint issues in tests | ❌ |
| `bandit -r src` | no issues | no issues | ✅ |
| `safety check` | no vulns | 18 vulns in deps | ❌ |

## Executed Commands

- `pytest -q`
- `PYTHONPATH=. pytest -q`
- `mypy src`
- `flake8 src tests`
- `bandit -r src`
- `safety check`

Logs:
- `qa-work/REPORTS/024-pytest.log`
- `qa-work/REPORTS/024-mypy.log`
- `qa-work/REPORTS/024-flake8.log`
- `qa-work/REPORTS/024-bandit.log`
- `qa-work/REPORTS/024-safety.log`
- `qa-work/REPORTS/024-tool-exit-codes.txt`

## Translation Coverage / Counts

Source report: `qa-work/REPORTS/024-translation-inventory-report.md`

- Static seed rows (migrations 011/012/013/016/017/018/019): `467`
- Unique translation keys: `168`
- Static by language before 019 backfill execution:
  - `ru`: `131`
  - `uz`: `168`
  - `en`: `168`

Important: migration `019_ui_i18n_backfill` adds SQL backfill so after applying migration in DB, each key should have all 3 languages (`ru/uz/en`).

Live DB verification after migration:
- language rows: `en=168`, `ru=168`, `uz=168`
- unique keys: `168`
- keys missing any language: `0`

## Findings

1. **Critical:** Full test suite is not green (`tests/test_logging_middleware.py::test_extract_user_login_unknown_for_invalid_token`).
2. **Critical:** Existing typing debt (`mypy`) is very high and not related only to this task.
3. **High:** Dependency security scan reports 18 vulnerabilities (`safety`).
4. **High:** Zero-hardcode objective is not fully complete yet; still visible literals remain in `src/static/app.html` and Telegram handlers.

## Implemented in this pass

- Added migration: `alembic/versions/019_fill_ui_translations_and_backfill_langs.py`
  - New UI/menu/app keys for `ru/uz/en`.
  - Backfill SQL for missing languages per key.
- Frontend i18n fixes in `src/static/app.html`:
  - Fixed `menu.*` normalization in sidebar child labels (prevents raw `menu.cash_pending` display).
  - Fixed `loadUiTranslations` broken block and expanded loaded key set.
  - Parent menu labels now resolved through `menu.<code>` translation keys.
  - Added runtime literal-localization helper for untranslated labels/buttons/placeholders.

## Decision

Release is **not approved** until:
- environment/test config is fixed (`pytest` import path),
- baseline lint/type issues are addressed or scoped,
- security vulnerabilities are triaged,
- remaining UI/Telegram hardcoded strings are migrated to `Sales.translations`.

## Hardcode Snapshot

- `src/static/app.html`: `810` Cyrillic literals still present
- `src/telegram_bot/*`: `866` Cyrillic literals still present

