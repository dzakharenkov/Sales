# Test Plan: 030 — SDS i18n completion

## Scope
- Web labels: forms, table headers, action buttons in visit/customer/order/operation sections.
- Telegram internal dialogs: create visit, add customer (all steps/errors/buttons).
- Translation DB consistency for ru/uz/en.

## Cases
1. Verify translation parity in DB
- Query `"Sales".translations` grouped by `language_code`.
- Expected: equal counts for `ru`, `uz`, `en`; no missing language rows per key.

2. Verify Telegram customer flow keys
- Query `translation_key LIKE 'telegram.customer_create.%'`.
- Expected: 3 rows per key (`ru`,`uz`,`en`).

3. Verify Telegram visit flow keys
- Query `translation_key LIKE 'telegram.visit_create.%'`.
- Expected: 3 rows per key and no `\\n` literals.

4. Run Python tests
- `PYTHONPATH=. pytest tests -q`
- Expected: no failures.

5. Run security scans
- `bandit -r src -q`
- `safety check --short-report`
- Expected: no critical/failing issues.

6. JS syntax guard for app.html inline script
- Extract inline JS and run `node --check`.
- Expected: valid syntax.
