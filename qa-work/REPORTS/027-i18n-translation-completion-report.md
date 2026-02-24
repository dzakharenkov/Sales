# QA Report: 027 ? SDS i18n completion (UI + Telegram)

**Date:** 2026-02-21  
**Status:** ?? PARTIAL PASS (i18n fixed, one existing test failure, dependency vulnerabilities present)

## 1) Translation coverage (database)

- Distinct translation keys: **270**
- Rows per language:
  - `ru`: **270**
  - `uz`: **270**
  - `en`: **270**
- Missing keys by language (cross-check on all distinct keys): **0 / 0 / 0**
- RU broken placeholders with double question marks (`??`) after fixes: **0**

### Key domain counters (RU)

- `menu.*`: **36**
- `ui.*`: **88**
- `telegram.*`: **52**

### RU category distribution

- `fields`: 115
- `telegram`: 52
- `menu`: 37
- `buttons`: 28
- `messages`: 17
- `operation_types`: 13
- `statuses`: 5
- `payment_types`: 3

## 2) What was fixed in this pass

- Added and synced missing UI keys (`ru/uz/en`), including:
  - `button.add`, `button.export`
  - full block `ui.customers.col.*` (actions/address/territory/contact/status/login/photo/lat/lon/account/bank/mfo/oked/vat/contract/category/landmark/pinfl)
- Repaired corrupted RU values that were displayed as `????`.
- Strengthened literal localization in frontend (`src/static/app.html`):
  - normalization for mojibake text,
  - expanded literal mapping for menu/table/buttons/report strings from user screenshots,
  - placeholder mapping (`??.??.????`, `? ??????`, etc.).
- Telegram auth i18n improvements (already done and revalidated):
  - language picker with flags on `/start` and `/lang`,
  - newline normalization for texts loaded from translations.

## 3) Execution checks

### Syntax / static checks

- `node --check qa-work/REPORTS/tmp_app_inline.js` ? ? pass
- `python -m py_compile src/telegram_bot/i18n.py src/telegram_bot/handlers_auth.py` ? ? pass

### Tests

- `PYTHONPATH=. pytest tests -q`
  - Result: **1 failed, 60 passed, 9 skipped**
  - Failing test:
    - `tests/test_logging_middleware.py::test_extract_user_login_unknown_for_invalid_token`
    - expected `unknown`, actual `anonymous`
  - This failure is outside translation module scope.

### Security

- `bandit -r src -q` ? ? no high/critical findings in output (only warnings about `nosec` markers)
- `safety check` ? ? **18 vulnerabilities** in environment dependencies
  - Affected packages include: `urllib3`, `torch`, `starlette`, `requests`, `pyasn1`, `pillow`, `peewee`, `jinja2`, `fonttools`, `ecdsa`.

## 4) Files changed in this pass

- `alembic/versions/023_fix_ru_and_complete_ui_keys.py`
- `alembic/versions/024_ensure_ru_text_integrity.py`
- `src/static/app.html`
- `src/telegram_bot/i18n.py`
- `src/telegram_bot/handlers_auth.py`

## 5) Notes

- UI translation coverage in DB is now parity-complete (`ru=uz=en=270`).
- Remaining visual mismatches (if any) should now be isolated to hardcoded strings not yet mapped in specific render branches; current literal normalizer and map were significantly expanded to catch these cases.


## 6) Alembic state

- Current revision: `024_ensure_ru_text_integrity (head)`
- This guarantees RU text repair via hex-safe updates on new environments.
