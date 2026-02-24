# QA Report: 039 — SDS i18n hardening (Web + Telegram)

**Status:** ✅ IMPLEMENTED (with noted pre-existing project-wide lint/type debt)
**Date:** 2026-02-21

## 1) Что исправлено

- Восстановлен модуль локализации Telegram: `src/telegram_bot/i18n.py` (файл был пустой, 0 байт).
- Убраны прямые hardcoded-строки из runtime-диалогов в:
  - `src/telegram_bot/handlers_agent.py`
  - `src/telegram_bot/handlers_expeditor.py`
  - `src/telegram_bot/handlers_agent_v3_add_customer.py`
- Добавлены/исправлены миграции переводов:
  - `alembic/versions/037_fix_mojibake_and_missing_keys.py`
  - `alembic/versions/038_tg_text_fix.py`
  - `alembic/versions/039_tg_processing_key.py`
- Фронтенд `src/static/app.html`:
  - добавлен ключ `ui.customers.create.title` в preload-список;
  - добавлены маппинги для mojibake-форм (`�Д клиента`, `�НН`, `П�НФЛ`), чтобы автоматически переводились;
  - заголовок/кнопки раздела `customers_create` переведены на key-based `tUi(...)`.

## 2) Миграции

- `alembic upgrade head` выполнен успешно до `039_tg_processing_key`.
- Исправлен блокер Alembic: длинный `revision id` > 32 символов (из-за ограничения `Sales.alembic_version.version_num varchar(32)`).

## 3) Метрики переводов (БД)

Источник: `qa-work/REPORTS/039-i18n-summary.json`

- Всего ключей: **426**
- По языкам:
  - `ru`: **426**
  - `uz`: **426**
  - `en`: **426**
- Telegram-ключей: **159**
- Telegram по языкам:
  - `ru`: **159**
  - `uz`: **159**
  - `en`: **159**
- Ключей с неполным языковым набором (`ru/uz/en`): **0**

## 4) Telegram hardcode scan

Источник: `qa-work/REPORTS/039-telegram-literal-scan.json`

- `handlers_auth.py`: 0 direct literal calls
- `handlers_agent.py`: 0 direct literal calls
- `handlers_expeditor.py`: 0 direct literal calls
- `handlers_agent_create_visit.py`: 0 direct literal calls
- `handlers_agent_v3_add_customer.py`: 0 direct literal calls

## 5) Прогон тестов и проверок

- `pytest tests -q` → **61 passed, 9 skipped**
  - лог: `qa-work/REPORTS/039-pytest.log`
- `python -m py_compile ...` по измененным файлам → **OK**
- `node --check` для inline JS `app.html` → **OK**
  - файл: `qa-work/REPORTS/038-app-inline.js`
- `bandit -r src -q` → **без найденных уязвимостей**, только warning по `nosec`
  - лог: `qa-work/REPORTS/039-bandit.log`
- `safety check` → **0 vulnerabilities**
  - лог: `qa-work/REPORTS/039-safety.log`

## 6) Остаточный техдолг (не из этого изменения)

- `flake8 src tests` падает на pre-existing проблемах в тестовых файлах (`tests/postgres.py`, `tests/test_runner.py`).
  - лог: `qa-work/REPORTS/039-flake8.log`
- `mypy src` падает на большом количестве pre-existing ошибок типизации (включая `models.py`, `telegram_bot/*`, `core/*`).
  - лог: `qa-work/REPORTS/039-mypy.log`

## 7) Важные артефакты

- `qa-work/REPORTS/038-i18n-metrics.json`
- `qa-work/REPORTS/039-i18n-summary.json`
- `qa-work/REPORTS/039-telegram-literal-scan.json`
- `qa-work/REPORTS/039-pytest.log`
- `qa-work/REPORTS/039-flake8.log`
- `qa-work/REPORTS/039-mypy.log`
- `qa-work/REPORTS/039-bandit.log`
- `qa-work/REPORTS/039-safety.log`

## 8) Итог

- Переводы выровнены по `ru/uz/en` без пропусков.
- `????`/битые значения в ключевых UI/Telegram ключах исправлены через миграции.
- Внутренние диалоги Telegram переведены на таблицу переводов (без прямого хардкода строк в основных handlers).
- Проверки безопасности (`safety`, `bandit`) пройдены.
