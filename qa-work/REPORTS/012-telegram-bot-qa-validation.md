# QA Report: 012 — Telegram Bot (Expeditor & Agent)

**Status:** ✅ APPROVED  
**Date:** 2026-02-20 14:35

## Summary
- Total test cases: 9
- Passed: 9
- Failed: 0
- Method: automated scenario/smoke validation + callback wiring checks.

## Expeditor Scenarios
- ✅ `bot_expeditor_menu_no_agent_items`
- ✅ `bot_expeditor_menu_payment_items_present`
- ✅ `bot_expeditor_callbacks_have_handlers`

## Agent Scenarios
- ✅ `bot_agent_menu_role_items_correct`
- ✅ `bot_agent_callbacks_have_handlers`

## Authorization
- ✅ `bot_auth_conversation_states_present`
- ✅ `bot_auth_login_password_flow_success`

## Customer Search
- ✅ `bot_customer_search_by_name_fallback`
- ✅ `bot_customer_search_by_inn_fallback`

## Notes
- PTB warning (`per_message=False`) informational only.
- Live end-to-end chat flow was not executed in this automated report.
- Live Telegram API connectivity check (`getMe`) passed after dependency upgrade.

## Evidence
- `qa-work/ARTIFACTS/bot_detailed_tests.json`
- `qa-work/ARTIFACTS/bot_smoke_after_fixes.json`
- `qa-work/ARTIFACTS/pytest_integration_after_fixes.txt`
- `qa-work/ARTIFACTS/telegram_getme_after_upgrade.json`
