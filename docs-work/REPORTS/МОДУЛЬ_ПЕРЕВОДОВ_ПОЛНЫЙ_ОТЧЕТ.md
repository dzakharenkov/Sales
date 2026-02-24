# МОДУЛЬ ПЕРЕВОДОВ SDS — ПОЛНЫЙ ОТЧЕТ О ДОКУМЕНТИРОВАНИИ

**Дата:** 2026-02-21  
**Статус:** ✅ COMPLETE  
**Контур:** Web UI + Backend API + Telegram Bot

## 1. Что задокументировано
Полностью описаны:
1. Структура БД модуля переводов (таблицы, поля, ограничения, индексы).
2. Справочник элементов переводов (ключи, категории, namespace, покрытие по языкам).
3. Полный API модуля переводов.
4. Механика переключателя языка в интерфейсе.
5. Алгоритм подтягивания переводов из таблицы `"Sales".translations`.
6. Fallback-логика и кеширование.
7. Telegram-i18n (включая алиасы и совместимость со старыми литералами).
8. SQL-чек-листы контроля качества переводов.

## 2. Основные файлы документации
| Файл | Роль |
|---|---|
| `docs-work/GUIDES/TRANSLATIONS_MODULE_FULL.md` | Основной единый документ по модулю переводов |
| `docs-work/REPORTS/translations_metrics_detailed.json` | Фактические цифры инвентаризации переводов |
| `docs-work/REPORTS/023-documentation.md` | Данный подробный отчет |

## 3. БД: таблицы и структура
Схема: `"Sales"`.

### 3.1 Таблица `translation_categories`
Источник: `src/database/models.py`.

| Поле | Тип | Ограничения |
|---|---|---|
| `id` | UUID | PK |
| `code` | varchar(100) | UNIQUE, NOT NULL |
| `name_ru` | varchar(255) | NOT NULL |
| `name_uz` | varchar(255) | NOT NULL |
| `name_en` | varchar(255) | NOT NULL |
| `description` | text | NULL |
| `active` | bool | default true |
| `created_at` | timestamptz | default now() |
| `updated_at` | timestamptz | default now() |

### 3.2 Таблица `translations`
Источник: `src/database/models.py`.

| Поле | Тип | Ограничения |
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
| `updated_at` | timestamptz | default now() |

Уникальность:
- `uq_translations_key_lang` по (`translation_key`, `language_code`).

Индексы:
- `idx_translations_key`
- `idx_translations_language`
- `idx_translations_category`
- `idx_translations_updated_at`
- `idx_translations_lang_category_key` (миграционный composite)

## 4. Инвентаризация элементов переводов (факт)
Источник: `docs-work/REPORTS/translations_metrics_detailed.json`.

### 4.1 Общие цифры
| Метрика | Значение |
|---|---:|
| Уникальных ключей всего | 426 |
| Ключей telegram.* | 159 |
| Ключей без полного RU/UZ/EN набора | 0 |

### 4.2 По языкам
| Язык | Строк переводов |
|---|---:|
| RU | 426 |
| UZ | 426 |
| EN | 426 |

### 4.3 По namespace (translation_key до первой точки)
| Namespace | RU | UZ | EN |
|---|---:|---:|---:|
| `app` | 3 | 3 | 3 |
| `button` | 13 | 13 | 13 |
| `field` | 51 | 51 | 51 |
| `label` | 21 | 21 | 21 |
| `menu` | 36 | 36 | 36 |
| `message` | 3 | 3 | 3 |
| `operation_type` | 13 | 13 | 13 |
| `payment_type` | 3 | 3 | 3 |
| `status` | 5 | 5 | 5 |
| `telegram` | 159 | 159 | 159 |
| `ui` | 119 | 119 | 119 |

### 4.4 По category (метаданные)
| Category | RU | UZ | EN |
|---|---:|---:|---:|
| `buttons` | 26 | 26 | 26 |
| `fields` | 145 | 144 | 143 |
| `menu` | 39 | 38 | 38 |
| `messages` | 36 | 38 | 39 |
| `operation_types` | 13 | 13 | 13 |
| `payment_types` | 3 | 3 | 3 |
| `statuses` | 5 | 5 | 5 |
| `telegram` | 159 | 159 | 159 |

Примечание: различия в `category` не нарушают резолв по ключу. Резолв работает по (`translation_key`, `language_code`).

## 5. Полный API модуля переводов
Файл: `src/api/v1/routers/translations.py`  
Prefix: `/api/v1/translations`

| Метод | Endpoint | Доступ | Назначение |
|---|---|---|---|
| GET | `/config/languages` | авторизованный пользователь | вернуть `enabled_languages`, `default_language` |
| GET | `/stats` | admin | статистика переводов и полноты наборов |
| GET | `/` | admin | список переводов с фильтрами |
| POST | `/` | admin | создать перевод |
| PUT | `/{translation_id}` | admin | обновить перевод |
| DELETE | `/{translation_id}` | admin | удалить перевод |
| POST | `/resolve` | авторизованный пользователь | пакетно получить тексты по ключам и языку |

### 5.1 Контракты фильтрации списка
`GET /api/v1/translations`

Query params:
- `category`
- `language`
- `key_like`
- `text_like`
- `limit` (1..1000)
- `offset`

### 5.2 Контракт resolve
`POST /api/v1/translations/resolve`

Request:
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

## 6. Переключатель языка (обязательное поведение)
Источник: `src/static/app.html`.

### 6.1 Механика
1. Пользователь меняет язык в selector (`RU/UZ/EN`) в хедере.
2. Новый язык сохраняется в `localStorage.sds_lang`.
3. Фронт отправляет `POST /api/v1/translations/resolve` с `language=<выбранный>` и набором ключей.
4. Для меню отдельно вызывается `GET /api/v1/menu?language=<выбранный>`.
5. UI перерисовывает текущую секцию.

### 6.2 Источник данных перевода
Элементы UI должны подтягиваться из таблицы `"Sales".translations` по:
- `translation_key`
- `language_code = выбранный язык`

### 6.3 Fallback
Если нет точного перевода:
1. fallback на `DEFAULT_LANGUAGE`;
2. при отсутствии fallback — возврат ключа.

### 6.4 Что считается дефектом
- При выбранном RU отображаются EN/UZ значения при наличии RU-перевода в БД.
- На одном экране одновременно смешаны RU/UZ/EN для однотипных UI-элементов.

## 7. Сервисная логика (backend)
Файл: `src/api/v1/services/translation_service.py`.

| Метод | Назначение |
|---|---|
| `normalize_language()` | нормализация языка, fallback на default |
| `resolve_key()` | resolve одного ключа с fallback |
| `resolve_many()` | batched resolve множества ключей |
| `list_items()` | выборка с фильтрами |
| `create_item()/update_item()/delete_item()` | CRUD + очистка кеша |

Кеш:
- In-memory dictionary с TTL (`CACHE_TTL`), ключ кеша: `(translation_key, language_code)`.
- На мутациях кеш очищается.

## 8. Telegram: элементы переводов и загрузка
Файл: `src/telegram_bot/i18n.py`.

### 8.1 Функции
| Функция | Назначение |
|---|---|
| `t(...)` | получить перевод по ключу с параметрами |
| `detect_language(...)` | определить язык пользователя |
| `set_user_language(...)` | сохранить выбранный язык в user_data |
| `localize_literal(...)` | совместимость со старыми literal-текстами |

### 8.2 Telegram-элементы
- namespace `telegram.*`
- покрытие: `159/159/159` по RU/UZ/EN.
- алиасы кнопок (`telegram.button.back` -> `telegram.action.back`) задокументированы.

## 9. Контроль качества и эксплуатационные SQL
### 9.1 Полнота языков
```sql
SELECT translation_key,
       COUNT(DISTINCT language_code) AS langs
FROM "Sales".translations
WHERE language_code IN ('ru','uz','en')
GROUP BY translation_key
HAVING COUNT(DISTINCT language_code) < 3;
```

### 9.2 Подсчёт по языкам
```sql
SELECT language_code, COUNT(*)
FROM "Sales".translations
GROUP BY language_code
ORDER BY language_code;
```

### 9.3 Подсчёт по telegram
```sql
SELECT language_code, COUNT(*)
FROM "Sales".translations
WHERE translation_key LIKE 'telegram.%'
GROUP BY language_code
ORDER BY language_code;
```

### 9.4 Подсчёт по namespace
```sql
SELECT split_part(translation_key,'.',1) AS namespace,
       language_code,
       COUNT(*)
FROM "Sales".translations
GROUP BY split_part(translation_key,'.',1), language_code
ORDER BY 1,2;
```

## 10. Что исправлено в документации по требованию
1. Отчёт расширен до полного формата (не краткая справка).
2. Явно описаны таблицы БД с полями/ограничениями/индексами.
3. Добавлена инвентаризация элементов переводов (категории + namespace + метрики).
4. Полностью описан API.
5. Отдельно и жёстко зафиксировано требование по переключателю языка и подтягиванию переводов из таблицы.

## 11. Итог
Документация по модулю переводов приведена к формату коммерческого уровня:
- полная,
- структурированная,
- с цифрами,
- с эксплуатационными запросами,
- с точной привязкой к коду и БД.
