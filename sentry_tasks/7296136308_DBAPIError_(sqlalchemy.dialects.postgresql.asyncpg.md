# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7296136308  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7296136308/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
DBAPIError: (sqlalchemy.dialects.postgresql.asyncpg.Error) <class 'asyncpg.exceptions.NumericValueOutOfRangeError'>: numeric field overflow

**Тип исключения:** NumericValueOutOfRangeError  
**Сообщение об ошибке:** numeric field overflow  

**Статистика:**
- Кол-во возникновений: **3**
- Первое появление: 2026-02-27T10:23:20Z
- Последнее появление: 2026-02-27T10:23:33Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`asyncpg/protocol/protocol.pyx:205`
в функции: `bind_execute`

### Полный стектрейс:

#### Фрейм 5
- **Файл:** `asyncpg/protocol/protocol.pyx`
- **Строка:** 205
- **Функция:** `bind_execute`
- **Контекст кода:**

```python
            self.queries_count += 1
        except Exception as ex:
            waiter.set_exception(ex)
            self._coreproto_error()
        finally:
            return await waiter

    async def bind_execute_many(
        self,
        state: PreparedStatementState,
        args,
```

#### Фрейм 4
- **Файл:** `asyncpg/prepared_stmt.py`
- **Строка:** 257
- **Функция:** `__do_execute`
- **Контекст кода:**

```python
            ))

    async def __do_execute(self, executor):
        protocol = self._connection._protocol
        try:
            return await executor(protocol)
        except exceptions.OutdatedSchemaCacheError:
            await self._connection.reload_schema_state()
            # We can not find all manually created prepared statements, so just
            # drop known cached ones in the `self._connection`.
            # Other manually created prepared statements will fail and
```

#### Фрейм 3
- **Файл:** `asyncpg/prepared_stmt.py`
- **Строка:** 268
- **Функция:** `__bind_execute`
- **Контекст кода:**

```python
            # invalidate themselves (unfortunately, clearing caches again).
            self._state.mark_closed()
            raise

    async def __bind_execute(self, args, limit, timeout):
        data, status, _ = await self.__do_execute(
            lambda protocol: protocol.bind_execute(
                self._state, args, '', limit, True, timeout))
        self._last_status = status
        return data

```

#### Фрейм 2
- **Файл:** `asyncpg/prepared_stmt.py`
- **Строка:** 177
- **Функция:** `fetch`
- **Контекст кода:**

```python
        :param args: Query arguments
        :param float timeout: Optional timeout value in seconds.

        :return: A list of :class:`Record` instances.
        """
        data = await self.__bind_execute(args, 0, timeout)
        return data

    @connresource.guarded
    async def fetchval(self, *args, column=0, timeout=None):
        """Execute the statement and return a value in the first row.
```

#### Фрейм 1
- **Файл:** `sqlalchemy/dialects/postgresql/asyncpg.py`
- **Строка:** 550
- **Функция:** `_prepare_and_execute`
- **Контекст кода:**

```python

                if self.server_side:
                    self._cursor = await prepared_stmt.cursor(*parameters)
                    self.rowcount = -1
                else:
                    self._rows = deque(await prepared_stmt.fetch(*parameters))
                    status = prepared_stmt.get_statusmsg()

                    reg = re.match(
                        r"(?:SELECT|UPDATE|DELETE|INSERT \d+) (\d+)",
                        status or "",
```

---

## Контекстная информация

### Информация о пользователе
- **User ID:** None
- **Email:** None
- **IP Address:** 95.214.210.254

### Теги
```json
{
  "browser": "Chrome 145",
  "browser.name": "Chrome",
  "client_os": "Windows",
  "client_os.name": "Windows",
  "environment": "production",
  "handled": "yes",
  "level": "error",
  "logger": "src.core.exception_handlers",
  "mechanism": "logging",
  "runtime": "CPython 3.12.3",
  "runtime.name": "CPython",
  "server_name": "sales-api",
  "transaction": "/api/v1/customers",
  "url": "http://sales.zakharenkov.ru/api/v1/customers",
  "user": "ip:95.214.210.254"
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


Комментарий решения: 


Создано: 2026-02-27 19:20:35