# QA Report: 023 - Multilingual Translations (UI + API + Telegram Bot)

**Status:** REJECTED
**Date:** 2026-02-21
**Time Spent:** 1h 05m

## Inputs Review
- `architect-work/TASKS/023-*.md`: not found
- `developer-work/REPORTS/023-*.md`: not found

QA validated against current codebase state and explicit user acceptance criteria in chat.

## Test Results Summary

| Metric | Target | Actual | Status |
|---|---:|---:|---|
| Unit/Integration tests | 100% pass | 60 passed, 1 failed, 9 skipped | FAIL |
| Coverage | >= 90% | 22% | FAIL |
| mypy | 0 errors | 1376 errors | FAIL |
| flake8 | 0 issues | 0 issues | PASS |
| bandit | 0 issues | 0 issues | PASS |
| safety | 0 vulnerabilities | 18 vulnerabilities | FAIL |
| Localization externalization | 100% user text via translations | Hardcoded UI+bot strings remain | FAIL |

## Automated Execution Details

### 1. Pytest
Command:
`$env:PYTHONPATH='.'; pytest tests/ -v --cov=src --cov-report=html --cov-report=term`

Result:
- 1 failed, 60 passed, 9 skipped
- Failure: `tests/test_logging_middleware.py::test_extract_user_login_unknown_for_invalid_token`
- Coverage: 22%

### 2. Type checks
Command:
`mypy src`

Result:
- 1376 errors (majorly in `src/telegram_bot/*` and `src/database/models.py`)

### 3. Lint
Command:
`flake8 src`

Result:
- 0 issues

### 4. Security static checks
Commands:
- `bandit -r src -f txt`
- `safety check`

Result:
- Bandit: no issues
- Safety: 18 vulnerabilities

## Localization Audit (Key Finding)
Static scan shows untranslated hardcoded literals still widespread:
- `src/static/app.html`: 811 Cyrillic matches
- `src/telegram_bot/*`: 946 Cyrillic matches

Critical examples:
- `src/static/app.html:6`
- `src/static/app.html:159`
- `src/telegram_bot/handlers_expeditor.py:42`
- `src/telegram_bot/handlers_expeditor.py:92`

This directly contradicts requirement to move all relevant strings (including Telegram bot) into the "Translations" module.

## Acceptance Criteria Validation
- [ ] RU/UZ/EN switch fully covers UI labels
- [ ] System title resolved from translations only
- [ ] "References -> Translations" and admin access validated end-to-end
- [ ] Telegram bot text cataloged in translations
- [ ] Translation API and DB content fully cover all visible strings
- [ ] Quality gates passed for commercial readiness

## Bugs Found
1. `qa-work/BUG_REPORTS/006-localization-not-fully-externalized.md` (HIGH)
2. `qa-work/BUG_REPORTS/007-pytest-failure-logging-middleware.md` (MEDIUM)
3. `qa-work/BUG_REPORTS/008-security-dependencies-safety.md` (HIGH)

## Evidence Files
- `qa-work/ARTIFACTS/pytest_cov_023.txt`
- `qa-work/ARTIFACTS/pytest_cov_023_with_pythonpath.txt`
- `qa-work/ARTIFACTS/mypy_023.txt`
- `qa-work/ARTIFACTS/flake8_023.txt`
- `qa-work/ARTIFACTS/bandit_023.txt`
- `qa-work/ARTIFACTS/safety_023.txt`

## Final Decision
REJECTED for release.

Release is blocked until:
1. Localization coverage is completed for web UI and Telegram bot.
2. Failing pytest is fixed.
3. Security dependency vulnerabilities are remediated or formally risk-accepted with policy.
4. Quality baseline (tests/coverage/type checks) is brought to release threshold.
