# Test Plan: 029 — SDS i18n Full Validation

## Scope
- [x] Translation data completeness (`ru/uz/en`)
- [x] UI translation resolution and menu rendering
- [x] Telegram translation resolution and newline formatting
- [x] Backend/API regression tests
- [x] Security scan and dependency health

## Automated Checks
- Translation coverage queries in DB (`Sales.translations`)
- `alembic upgrade head` / `alembic current`
- `pytest tests -q`
- `bandit -r src -q`
- `safety check --short-report`
- `python -m pip check`

## Acceptance Criteria
- [x] Language counts are equal (`ru == uz == en`)
- [x] No missing translations for keys used in `src/static/app.html`
- [x] No missing translations for keys used in Telegram handlers
- [x] No literal `\\n` in Telegram translation text
- [x] Tests pass with no failures
- [x] Security scan reports 0 vulnerabilities
