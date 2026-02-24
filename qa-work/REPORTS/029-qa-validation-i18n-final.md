# QA Report: 029 — SDS i18n Completion (UI + Telegram + Security)

**Status:** ✅ APPROVED
**Date:** 2026-02-21

## 1) Реализовано

- Закрыты оставшиеся непереведённые UI-строки через таблицу переводов + literal-map в `src/static/app.html`.
- Убраны кейсы, когда в меню отображались сырьевые ключи (`menu.*`) — добавлена нормализация кодов и динамическая догрузка `menu.*`-ключей из API.
- Добавлены недостающие ключи переводов (`ru/uz/en`) для проблемных экранов (Visits/Orders/Reports).
- Telegram:
  - покрытие ключей в коде = 100%,
  - исправлен вывод `\n` как текста (теперь реальные переносы строк).
- Приведена безопасность окружения к чистому состоянию (`safety = 0`).

## 2) Миграции

- `alembic/versions/026_fill_remaining_ui_labels.py`
- `alembic/versions/027_fix_telegram_newlines.py`

Текущее состояние БД:
- `alembic current` → `027_fix_telegram_newlines (head)`

## 3) Цифры по переводам

### 3.1 Общий итог

- Уникальных ключей: **313**
- По языкам:
  - `ru`: **313**
  - `uz`: **313**
  - `en`: **313**
- Пропусков между языками: **0**

### 3.2 Покрытие по коду

- Ключи из `src/static/app.html` (menu/ui/button/field/label/status/app): **179**
- Пропуски для этих ключей: **0**
- Telegram ключи в коде: **67**
- Telegram ключи в БД (distinct): **78**
- Telegram пропуски `ru/uz/en`: **0**
- Telegram строк с буквальным `\\n`: **0**

### 3.3 По категориям (rows)

- `buttons`: en 28 / ru 28 / uz 28
- `fields`: en 132 / ru 132 / uz 133
- `menu`: en 37 / ru 37 / uz 37
- `messages`: en 17 / ru 17 / uz 16
- `operation_types`: en 13 / ru 13 / uz 13
- `payment_types`: en 3 / ru 3 / uz 3
- `statuses`: en 5 / ru 5 / uz 5
- `telegram`: en 78 / ru 78 / uz 78

Примечание: разные значения в `fields/messages` — историческое распределение `category`; на полноту переводов не влияет (итог 313/313/313).

## 4) Тесты и проверки

### 4.1 Автотесты

Команда:
- `$env:PYTHONPATH='.'; pytest tests -q`

Результат:
- **61 passed, 9 skipped, 0 failed**

### 4.2 Синтаксис и миграции

- `node --check qa-work/REPORTS/tmp_app_inline.js` → OK
- `python -m py_compile ...` (изменённые py-файлы) → OK
- `alembic upgrade head` → OK

### 4.3 Security

- `bandit -r src -q` → без падений
- `safety check --short-report` → **0 vulnerabilities**
- `python -m pip check` → **No broken requirements found**

## 5) Изменённые файлы

- `src/static/app.html`
- `src/telegram_bot/handlers_agent_create_visit.py`
- `src/core/middleware.py`
- `alembic/versions/026_fill_remaining_ui_labels.py`
- `alembic/versions/027_fix_telegram_newlines.py`
- `requirements.txt`

## 6) Ключевые фиксы безопасности окружения

- Обновлены версии уязвимых пакетов (`requests`, `urllib3`, `jinja2`, `pillow`, `fonttools`, `pyasn1`, `peewee`, `starlette`).
- Удалены неиспользуемые конфликтующие пакеты, мешавшие `pip check`/security-cleanup (`pyppeteer`, `requests-html`, `python-jose`, `torchaudio`, `torch`, `ecdsa`).

## 7) Итог

Задача доведена до рабочего коммерческого состояния по заявленному объёму:
- переводов достаточно для UI/Telegram,
- численно языки выровнены,
- миграции применены,
- тесты зелёные,
- security-скан чистый.
