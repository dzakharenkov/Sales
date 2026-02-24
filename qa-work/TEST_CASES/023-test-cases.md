# Test Plan: 023 - Multilingual Translations (UI + API + Telegram Bot)

## Task Context
Requested validation scope:
1. Translation module end-to-end for RU/UZ/EN
2. All translation values inserted into "Sales" translation tables
3. UI language switcher and labels
4. Telegram bot texts included in translation objects
5. Full automated quality gates and QA report

## Test Scope
- [x] Unit tests validation
- [x] Integration tests
- [x] API regression checks
- [x] Static typing checks
- [x] Lint checks
- [x] Security checks
- [x] Localization completeness audit (static + runtime indicators)

## Acceptance Criteria Under Test
1. Language switcher works for RU/UZ/EN and shows EN (not GB)
2. "References -> Translations" visible and admin-accessible
3. All user-facing UI labels moved to translations table (no hardcoded RU leftovers)
4. System title is translated through translation keys
5. Telegram bot messages are represented in translations data model
6. Translation API CRUD and resolve endpoints are functional
7. Quality gates:
   - pytest green
   - coverage >= 90%
   - mypy 0 errors
   - flake8 0 issues
   - bandit 0 issues
   - safety 0 vulnerabilities

## Executed Automated Checks
1. `pytest tests/ -v --cov=src --cov-report=html --cov-report=term` (failed initially: missing PYTHONPATH)
2. `$env:PYTHONPATH='.'; pytest tests/ -v --cov=src --cov-report=html --cov-report=term`
3. `mypy src`
4. `flake8 src`
5. `bandit -r src -f txt`
6. `safety check`
7. Static localization scan:
   - `rg -n "[?-??-???]" src/static/app.html`
   - `rg -n "[?-??-???]" src/telegram_bot`

## Results Snapshot
- Pytest: 60 passed, 1 failed, 9 skipped
- Coverage: 22%
- mypy: 1376 errors
- flake8: 0 issues (empty output)
- bandit: 0 issues
- safety: 18 vulnerabilities
- Localization hardcoded-string indicators:
  - `src/static/app.html`: 811 matches with Cyrillic literals
  - `src/telegram_bot/*`: 946 matches with Cyrillic literals

## Artifacts
- `qa-work/ARTIFACTS/pytest_cov_023.txt`
- `qa-work/ARTIFACTS/pytest_cov_023_with_pythonpath.txt`
- `qa-work/ARTIFACTS/mypy_023.txt`
- `qa-work/ARTIFACTS/flake8_023.txt`
- `qa-work/ARTIFACTS/bandit_023.txt`
- `qa-work/ARTIFACTS/safety_023.txt`
