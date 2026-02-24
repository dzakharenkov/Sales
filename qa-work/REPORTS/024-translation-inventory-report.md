# Translation Inventory Report (after migration 019)

**Date:** 2026-02-20
**Source:** static seed tuples in migrations 011,012,013,016,017,018,019 + 019 backfill policy

## Static seed totals
- Total rows in seeds: `467`
- Unique key+language pairs: `467`
- Unique translation keys: `168`

### By language
- `ru`: `131`
- `uz`: `168`
- `en`: `168`

### By category
- `buttons`: `39`
- `fields`: `108`
- `menu`: `94`
- `messages`: `30`
- `operation_types`: `26`
- `payment_types`: `6`
- `statuses`: `8`
- `telegram`: `156`

### By migration
- `011_seed_en_uz_translations.py`: `70`
- `012_seed_ui_translations_and_menu_item.py`: `45`
- `013_finalize_translations.py`: `4`
- `016_seed_menu_telegram_keys.py`: `63`
- `017_seed_system_title.py`: `3`
- `018_seed_telegram_auth_i18n.py`: `120`
- `019_fill_ui_translations_and_backfill_langs.py`: `162`

## Why ru/uz/en were not equal before
- Earlier static seeds had many `uz/en` rows while `ru` baseline was expected from dynamic migration `010` (from existing dictionaries/menu).
- That produced asymmetry like `ru=77`, `uz=114`, `en=114` in static-only check.

## What migration 019 changes
- Adds missing UI/menu keys used by frontend (`app.*`, `label.*`, `ui.currency.*`, `ui.customers.*`, `ui.dashboard.*`, `menu.report_*`, `menu.cash_*`).
- Runs SQL backfill: for **every existing `translation_key`** creates missing rows for `ru/uz/en`.
- After applying `019`, expected DB invariant: each key has 3 languages (`ru`,`uz`,`en`).

## Remaining gap
- There are still hardcoded user-visible strings in `src/static/app.html` and Telegram handlers.
- Full zero-hardcode target requires additional sweep and moving all those literals to `Sales.translations`.

## Live DB check (after `alembic upgrade head`)
- `en`: `168`
- `ru`: `168`
- `uz`: `168`
- Unique keys: `168`
- Keys with missing language rows: `0`
