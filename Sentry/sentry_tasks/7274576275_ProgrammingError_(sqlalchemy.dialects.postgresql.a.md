# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** ai_realty  
**ID Ошибки:** 7274576275  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7274576275/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 'asyncpg.exceptions.DatatypeMismatchError'>: column "subscription_tier" is of type subscription_tier_enum but expression is of type ai_realty.subscription_tier_enum

**Тип исключения:** DatatypeMismatchError  
**Сообщение об ошибке:** column "subscription_tier" is of type subscription_tier_enum but expression is of type ai_realty.subscription_tier_enum  

**Статистика:**
- Кол-во возникновений: **1**
- Первое появление: 2026-02-18T17:30:01Z
- Последнее появление: 2026-02-18T17:30:01Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`asyncpg/protocol/protocol.pyx:165`
в функции: `prepare`

### Полный стектрейс:

#### Фрейм 6
- **Файл:** `asyncpg/protocol/protocol.pyx`
- **Строка:** 165
- **Функция:** `prepare`
- **Контекст кода:**

```python
            self.statement = state
        except Exception as ex:
            waiter.set_exception(ex)
            self._coreproto_error()
        finally:
            return await waiter

    async def bind_execute(
        self,
        state: PreparedStatementState,
        args,
```

#### Фрейм 5
- **Файл:** `asyncpg\connection.py`
- **Строка:** 443
- **Функция:** `_get_statement`
- **Контекст кода:**

```python
        elif use_cache or named:
            stmt_name = self._get_unique_id('stmt')
        else:
            stmt_name = ''

        statement = await self._protocol.prepare(
            stmt_name,
            query,
            timeout,
            record_class=record_class,
            ignore_custom_codec=ignore_custom_codec,
```

#### Фрейм 4
- **Файл:** `asyncpg\connection.py`
- **Строка:** 657
- **Функция:** `_prepare`
- **Контекст кода:**

```python
        record_class=None
    ):
        self._check_open()
        if name is None:
            name = self._stmt_cache_enabled
        stmt = await self._get_statement(
            query,
            timeout,
            named=name,
            use_cache=use_cache,
            record_class=record_class,
```

#### Фрейм 3
- **Файл:** `asyncpg\connection.py`
- **Строка:** 638
- **Функция:** `prepare`
- **Контекст кода:**

```python
            Added the *record_class* parameter.

        .. versionchanged:: 0.25.0
            Added the *name* parameter.
        """
        return await self._prepare(
            query,
            name=name,
            timeout=timeout,
            record_class=record_class,
        )
```

#### Фрейм 2
- **Файл:** `sqlalchemy\dialects\postgresql\asyncpg.py`
- **Строка:** 773
- **Функция:** `_prepare`
- **Контекст кода:**

```python
            # changes such as size of a VARCHAR changing, so there is also
            # a cross-connection invalidation timestamp
            if cached_timestamp > invalidate_timestamp:
                return prepared_stmt, attributes

        prepared_stmt = await self._connection.prepare(
            operation, name=self._prepared_statement_name_func()
        )
        attributes = prepared_stmt.get_attributes()
        cache[operation] = (prepared_stmt, attributes, time.time())

```

#### Фрейм 1
- **Файл:** `sqlalchemy\dialects\postgresql\asyncpg.py`
- **Строка:** 526
- **Функция:** `_prepare_and_execute`
- **Контекст кода:**

```python

            if parameters is None:
                parameters = ()

            try:
                prepared_stmt, attributes = await adapt_connection._prepare(
                    operation, self._invalidate_schema_cache_asof
                )

                if attributes:
                    self.description = [
```

---

## Контекстная информация

### Информация о пользователе
- **User ID:** None
- **Email:** None
- **IP Address:** 127.0.0.1

### Теги
```json
{
  "browser": "WindowsPowerShell 5.1.26100",
  "browser.name": "WindowsPowerShell",
  "client_os": "Windows >=10",
  "client_os.name": "Windows",
  "environment": "development",
  "handled": "no",
  "level": "error",
  "mechanism": "starlette",
  "release": "HEAD",
  "runtime": "CPython 3.13.3",
  "runtime.name": "CPython",
  "server_name": "Sokol",
  "transaction": "/api/v1/clients",
  "url": "http://127.0.0.1:8002/api/v1/clients",
  "user": "ip:127.0.0.1"
}
```

---

## Инструкции для исправления

**Воспроизведение ошибки:**
1. Перейти по ссылке в Sentry для просмотра деталей
2. Понять сценарий, при котором происходит ошибка
3. Попытаться воспроизвести локально

**Анализ кода:**
1. Открыть файл на строке, указанной в стектрейсе
2. Проанализировать логику и найти причину
3. Проверить граничные случаи и исключения

**Исправление:**
1. Написать патч/исправление
2. Добавить проверку входных данных, если необходимо
3. Убедиться, что обработка исключений корректна

**Тестирование:**
1. Написать юнит-тест, покрывающий этот сценарий
2. Провести ручное тестирование
3. Убедиться, что ошибка больше не возникает

**После исправления:**
1. Создать commit с описанием
2. Развернуть в production
3. Отметить статус в Excel как ✅ ИСПРАВЛЕНО

---

## Статус выполнения

- [ ] Ошибка воспроизведена
- [ ] Найдена причина
- [ ] Написано исправление
- [ ] Написаны тесты
- [ ] Code review пройден
- [ ] Развёрнуто в production
- [ ] Проверено в Sentry (ошибка исчезла)

**Статус:** ❌ НЕ НАЧИНАЛОСЬ


Создано: 2026-02-24 21:00:51