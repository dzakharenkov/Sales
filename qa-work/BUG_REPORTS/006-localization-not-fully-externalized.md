# Bug Report: Localization not fully externalized (UI + Telegram bot)

**Task:** 023
**Severity:** HIGH
**Status:** OPEN

## Description
Multilingual implementation is incomplete: many user-facing strings remain hardcoded in source files instead of being resolved via translation keys from the translations module.

This violates the requirement "translate everything including Telegram bot" and causes mixed-language UI when switching to UZ/EN.

## Steps to Reproduce
1. Open `src/static/app.html` and inspect content with static search for Cyrillic literals.
2. Run: `rg -n "[?-??-???]" src/static/app.html`.
3. Run: `rg -n "[?-??-???]" src/telegram_bot`.
4. In UI, switch to UZ/EN and navigate through sections/forms.

## Expected Result
All user-facing texts are loaded from translation keys, including:
- top header/system title
- menu labels
- buttons, statuses, table headers, modal labels
- Telegram bot prompts and messages

## Actual Result
Large amount of hardcoded RU strings remains in both web UI and Telegram bot code.

## Evidence
- `src/static/app.html:6` and `src/static/app.html:159` contain hardcoded system title literal.
- `src/static/app.html` has 811 Cyrillic matches.
- `src/telegram_bot` has 946 Cyrillic matches.
- Example bot literals: `src/telegram_bot/handlers_expeditor.py:42`, `src/telegram_bot/handlers_expeditor.py:92`.

## Environment
- OS: Windows
- Python: 3.13.3
- App path: `D:\Python\Sales`
