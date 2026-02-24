# Модуль переводов SDS (RU/UZ/EN) — Полная техническая документация

## 1. Назначение
Модуль переводов обеспечивает централизованную мультиязычность для:
- Web UI (`/app`)
- Backend API (перевод справочников/меню/статусов)
- Telegram-бота (меню, диалоги, ошибки)

Поддерживаемые языки: `ru`, `uz`, `en`.

## 2. Текущее состояние (production-ready)
| Метрика | Значение |
|---|---:|
| Ключей переводов всего | 426 |
| Строк переводов RU | 426 |
| Строк переводов UZ | 426 |
| Строк переводов EN | 426 |
| Telegram-ключей | 159 |
| Telegram RU/UZ/EN | 159 / 159 / 159 |
| Ключей с неполным языковым набором | 0 |

Источник метрик: `qa-work/REPORTS/041-i18n-metrics.json`.

## 3. Конфигурация окружения
Файл: `.env`

| Переменная | Назначение | Пример |
|---|---|---|
| `ENABLED_LANGUAGES` | Доступные языки | `ru,uz,en` |
| `DEFAULT_LANGUAGE` | Язык по умолчанию | `ru` |
| `CACHE_TTL` | TTL кеша переводов (сек) | `3600` |
| `TIMEZONE` | Часовой пояс | `Asia/Tashkent` |

Код: `src/core/config.py` (`enabled_languages_list`, `effective_default_language`).

## 4. Архитектура БД
Схема: `"Sales"`

### 4.1 Таблица категорий
Модель: `src/database/models.py:328`

Таблица: `"Sales".translation_categories`

| Колонка | Тип | Ограничения |
|---|---|---|
| `id` | UUID | PK |
| `code` | varchar(100) | UNIQUE, NOT NULL |
| `name_ru` | varchar(255) | NOT NULL |
| `name_uz` | varchar(255) | NOT NULL |
| `name_en` | varchar(255) | NOT NULL |
| `description` | text | NULL |
| `active` | bool | NOT NULL, default true |
| `created_at` | timestamptz | default now() |
| `updated_at` | timestamptz | default now(), on update |

### 4.2 Таблица переводов
Модель: `src/database/models.py:343`

Таблица: `"Sales".translations`

| Колонка | Тип | Ограничения |
|---|---|---|
| `id` | UUID | PK |
| `translation_key` | varchar(255) | NOT NULL |
| `language_code` | varchar(5) | NOT NULL |
| `translation_text` | text | NOT NULL |
| `category` | varchar(100) | FK -> `translation_categories.code`, NULL |
| `notes` | text | NULL |
| `created_by` | varchar(100) | NULL |
| `created_at` | timestamptz | default now() |
| `updated_by` | varchar(100) | NULL |
| `updated_at` | timestamptz | default now(), on update |

Уникальность:
- `uq_translations_key_lang`: (`translation_key`, `language_code`)

Индексы:
- `idx_translations_key` (`translation_key`)
- `idx_translations_language` (`language_code`)
- `idx_translations_category` (`category`)
- `idx_translations_updated_at` (`updated_at`)
- миграционный composite индекс: `idx_translations_lang_category_key` (`language_code`, `category`, `translation_key`)

## 5. Ключевые категории переводов
| Категория | Назначение |
|---|---|
| `menu` | меню приложения |
| `buttons` | кнопки интерфейса |
| `fields` | подписи полей и колонок |
| `messages` | системные сообщения |
| `statuses` | статусы заказов/визитов/операций |
| `operation_types` | типы операций |
| `payment_types` | типы оплат |
| `telegram` | тексты и кнопки Telegram-бота |

## 6. API модуля переводов
Роутер: `src/api/v1/routers/translations.py`  
Prefix: `/api/v1/translations`

### 6.1 Получить конфигурацию языков
`GET /config/languages` (auth required)

Response:
```json
{
  "enabled_languages": ["ru", "uz", "en"],
  "default_language": "ru"
}
```

### 6.2 Получить статистику переводов
`GET /stats` (admin only)

Response:
```json
{
  "languages": ["ru", "uz", "en"],
  "overall": {"by_language": {"ru": 426, "uz": 426, "en": 426}, "total_keys": 426},
  "telegram": {"by_language": {"ru": 159, "uz": 159, "en": 159}, "total_keys": 159},
  "missing_any_language_keys": 0
}
```

### 6.3 Список переводов
`GET /` (admin only)

Query:
- `category`
- `language`
- `key_like`
- `text_like`
- `limit` (1..1000)
- `offset`

### 6.4 Создать перевод
`POST /` (admin only)

Body:
```json
{
  "translation_key": "ui.customers.title",
  "language_code": "ru",
  "translation_text": "Клиенты",
  "category": "menu",
  "notes": "UI customers"
}
```

Ошибки:
- `400` unsupported language
- `409` duplicate `(translation_key, language_code)`

### 6.5 Обновить перевод
`PUT /{translation_id}` (admin only)

### 6.6 Удалить перевод
`DELETE /{translation_id}` (admin only)

### 6.7 Пакетное разрешение ключей
`POST /resolve` (auth required)

Body:
```json
{
  "keys": ["menu.users", "button.save", "ui.customers.title"],
  "language": "ru"
}
```

Response:
```json
{
  "language": "ru",
  "data": {
    "menu.users": "Пользователи",
    "button.save": "Сохранить",
    "ui.customers.title": "Клиенты"
  }
}
```

## 7. Бизнес-логика TranslationService
Файл: `src/api/v1/services/translation_service.py`

### 7.1 Нормализация языка
- Если язык пустой или не входит в `ENABLED_LANGUAGES` -> используется `DEFAULT_LANGUAGE`.

### 7.2 Resolve алгоритм
Для `resolve_key`:
1. Ищем в in-memory cache (`(key, lang)`) с TTL.
2. Ищем точный перевод в БД по `(translation_key, language_code)`.
3. Если не найдено и `lang != default` -> fallback на default language.
4. Если не найдено вообще -> возвращаем сам ключ.

Для `resolve_many`:
1. Один batched SELECT по списку ключей и языку.
2. Отдельный batched fallback SELECT только для missing.
3. Возврат полной map по запрошенному списку.

### 7.3 Кеш
- Структура: `dict[(key, lang)] -> (expires_at, value)`
- TTL: `CACHE_TTL`
- Полная очистка кеша на `create/update/delete`.

## 8. Web UI интеграция
Файл: `src/static/app.html`

### 8.1 Источники текста
Приоритет отображения:
1. `window._uiTranslations[key]` (данные из БД через `/translations/resolve`)
2. Локальный `UI_TEXT` fallback
3. RU аварийный fallback (`RU_KEY_FALLBACK`)
4. `fallback` аргумент функции

### 8.2 Защита от смешивания языков
Используются sequence guards для асинхронных загрузок:
- `translationLoadSeq`
- `menuLoadSeq`

Старые (stale) ответы отбрасываются, если язык уже переключён.

### 8.3 Переключение языка
- UI selector справа в header (`RU/UZ/EN`).
- Значение текущего языка хранится в `localStorage.sds_lang`.
- При смене языка фронтенд вызывает `POST /api/v1/translations/resolve` с `language=<выбранный_язык>` и пакетом ключей.
- Для меню дополнительно вызывается `GET /api/v1/menu?language=<выбранный_язык>`.
- Все подписи, кнопки, заголовки и пункты меню подтягиваются из таблицы `"Sales".translations` по:
  - `translation_key`
  - `language_code = выбранный язык`
- Если точного перевода нет: fallback на `DEFAULT_LANGUAGE`, затем (в крайнем случае) возврат ключа.
- После загрузки переводов перерисовываются меню и текущий раздел без смешивания языков.

### 8.4 Обязательное поведение переключателя
- При выбранном языке `RU` UI должен показывать значения из `"Sales".translations` только для `language_code='ru'`.
- При выбранном `UZ` — только `language_code='uz'`.
- При выбранном `EN` — только `language_code='en'`.
- Любое смешение языков на одном экране считается дефектом и подлежит исправлению.

## 9. Telegram i18n интеграция
Файл: `src/telegram_bot/i18n.py`

### 9.1 Основная функция
`async t(update, context, key, fallback=None, **params)`

Особенности:
- определяет язык пользователя (`context.user_data['lang']` -> Telegram user locale -> default)
- читает `"Sales".translations`
- поддерживает alias-ключи (`telegram.button.back` -> `telegram.action.back`)
- поддерживает шаблоны с параметрами (`{login}`, `{minutes}`)
- декодирует `\n` в реальные переносы строк

### 9.2 Совместимость со старыми литералами
`_LITERAL_KEY_MAP` связывает старые hardcoded фразы с ключами переводов для мягкой миграции.

## 10. Миграции (история i18n)
Основные миграции модуля:
- `010_add_translations_module.py` — базовые таблицы + constraints + индексы
- `011..017` — первичное наполнение UI/menu/system keys
- `018..036` — Telegram auth/dialog/button keys и расширение UI ключей
- `037_fix_mojibake_and_missing_keys.py` — исправления mojibake + отсутствующих ключей
- `038_tg_text_fix.py` — корректировки telegram-текстов
- `039_tg_processing_key.py` — дополнительные telegram ключи

## 11. Операционный контроль и SQL
### 11.1 Проверка полноты языковых наборов
```sql
SELECT translation_key,
       COUNT(DISTINCT language_code) AS langs
FROM "Sales".translations
WHERE language_code IN ('ru','uz','en')
GROUP BY translation_key
HAVING COUNT(DISTINCT language_code) < 3;
```

### 11.2 Проверка количества по языкам
```sql
SELECT language_code, COUNT(*)
FROM "Sales".translations
GROUP BY language_code
ORDER BY language_code;
```

### 11.3 Проверка Telegram-покрытия
```sql
SELECT language_code, COUNT(*)
FROM "Sales".translations
WHERE translation_key LIKE 'telegram.%'
GROUP BY language_code
ORDER BY language_code;
```

### 11.4 Поиск хардкода в коде
```bash
rg -n "[А-Яа-яA-Za-z].*" src/telegram_bot | rg -v "await t\(|localize_literal\(|logger|comment"
```

## 12. Роли и доступ
| Операция | Admin | Agent | Expeditor | Stockman | Paymaster |
|---|---|---|---|---|---|
| Открыть раздел `Переводы` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /translations` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST/PUT/DELETE /translations` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /translations/resolve` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /translations/config/languages` | ✅ | ✅ | ✅ | ✅ | ✅ |

## 13. Типовые инциденты и решение
| Симптом | Причина | Действие |
|---|---|---|
| RU выбран, виден EN/UZ текст | stale frontend bundle / fallback leak | hard refresh (`Ctrl+F5`), очистка кэша сайта |
| в UI отображается ключ `menu.xxx` | отсутствует запись в `translations` | добавить ключ в 3 языках |
| Telegram показывает `\n` | некорректная строка в БД | обновить `translation_text`, проверить `_normalize_text` |
| 409 при создании перевода | дубликат key+lang | использовать PUT для обновления |

## 14. Правила добавления новых переводов
1. Добавлять ключи сразу в `ru`, `uz`, `en`.
2. Использовать namespace:
   - `menu.*`
   - `button.*`
   - `field.*`
   - `ui.*`
   - `telegram.*`
3. Не хранить пользовательские тексты в коде как литералы.
4. Для Telegram использовать только `await t(...)` / `localize_literal(...)`.
5. После добавления ключей обновлять тест/QA-метрики (`/translations/stats`).

## 15. Acceptance checklist
- [x] Все ключи имеют RU/UZ/EN
- [x] Telegram ключи синхронизированы по языкам
- [x] `missing_any_language_keys = 0`
- [x] Раздел `Переводы` доступен только admin
- [x] UI при RU показывает RU (без EN fallback leakage)
- [x] Нет критичных уязвимостей (`safety: 0`, `bandit: pass`)

## 16. Ссылки на исходники
- `src/database/models.py`
- `src/api/v1/routers/translations.py`
- `src/api/v1/services/translation_service.py`
- `src/static/app.html`
- `src/telegram_bot/i18n.py`
- `alembic/versions/010_add_translations_module.py`
- `alembic/versions/037_fix_mojibake_and_missing_keys.py`
- `alembic/versions/038_tg_text_fix.py`
- `alembic/versions/039_tg_processing_key.py`

