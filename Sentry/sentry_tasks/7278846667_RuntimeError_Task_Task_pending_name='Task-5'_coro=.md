# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7278846667  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7278846667/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
RuntimeError: Task <Task pending name='Task-5' coro=<AsyncAdapt_asyncpg_connection._terminate_graceful_close() running at C:\Users\bauma\AppData\Local\Programs\Python\Python313\Lib\site-packages\sqlalchemy\dialects\postgresql\asyncpg.py:912> cb=[shield.<locals>._inne...

**Тип исключения:** RuntimeError  
**Сообщение об ошибке:** Task <Task pending name='Task-5' coro=<AsyncAdapt_asyncpg_connection._terminate_graceful_close() running at C:\Users\bauma\AppData\Local\Programs\Python\Python313\Lib\site-packages\sqlalchemy\dialects\postgresql\asyncpg.py:912> cb=[shield.<locals>._inner_done_callback() at C:\Users\bauma\AppData\Local\Programs\Python\Python313\Lib\asyncio\tasks.py:958]> got Future <Future pending> attached to a different loop  

**Статистика:**
- Кол-во возникновений: **2**
- Первое появление: 2026-02-20T09:11:41Z
- Последнее появление: 2026-02-20T09:17:30Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`asyncpg/protocol/protocol.pyx:618`
в функции: `close`

### Полный стектрейс:

#### Фрейм 8
- **Файл:** `asyncpg/protocol/protocol.pyx`
- **Строка:** 618
- **Функция:** `close`
- **Контекст кода:**

```python
            await self.cancel_waiter

        if self.waiter is not None:
            # If there is a query running, cancel it
            self._request_cancel()
            await self.cancel_sent_waiter
            self.cancel_sent_waiter = None
            if self.cancel_waiter is not None:
                await self.cancel_waiter

        assert self.waiter is None
```

#### Фрейм 7
- **Файл:** `asyncpg\connection.py`
- **Строка:** 1513
- **Функция:** `close`
- **Контекст кода:**

```python
        .. versionchanged:: 0.14.0
           Added the *timeout* parameter.
        """
        try:
            if not self.is_closed():
                await self._protocol.close(timeout)
        except (Exception, asyncio.CancelledError):
            # If we fail to close gracefully, abort the connection.
            self._abort()
            raise
        finally:
```

#### Фрейм 6
- **Файл:** `sqlalchemy\dialects\postgresql\asyncpg.py`
- **Строка:** 912
- **Функция:** `_terminate_graceful_close`
- **Контекст кода:**

```python
            self.dbapi.asyncpg.PostgresError,
        )

    async def _terminate_graceful_close(self) -> None:
        # timeout added in asyncpg 0.14.0 December 2017
        await self._connection.close(timeout=2)
        self._started = False

    def _terminate_force_close(self) -> None:
        self._connection.terminate()
        self._started = False
```

#### Фрейм 5
- **Файл:** `sqlalchemy\util\_concurrency_py3k.py`
- **Строка:** 196
- **Функция:** `greenlet_spawn`
- **Контекст кода:**

```python
    while not context.dead:
        switch_occurred = True
        try:
            # wait for a coroutine from await_only and then return its
            # result back to it.
            value = await result
        except BaseException:
            # this allows an exception to be raised within
            # the moderated greenlet so that it can continue
            # its expected flow.
            result = context.throw(*sys.exc_info())
```

#### Фрейм 4
- **Файл:** `sqlalchemy\util\_concurrency_py3k.py`
- **Строка:** 132
- **Функция:** `await_only`
- **Контекст кода:**

```python

    # returns the control to the driver greenlet passing it
    # a coroutine to run. Once the awaitable is done, the driver greenlet
    # switches back to this greenlet with the result of awaitable that is
    # then returned to the caller (or raised as error)
    return current.parent.switch(awaitable)  # type: ignore[no-any-return,attr-defined] # noqa: E501


def await_fallback(awaitable: Awaitable[_T]) -> _T:
    """Awaits an async function in a sync method.

```

#### Фрейм 3
- **Файл:** `sqlalchemy\connectors\asyncio.py`
- **Строка:** 402
- **Функция:** `terminate`
- **Контекст кода:**

```python
    def terminate(self) -> None:
        if in_greenlet():
            # in a greenlet; this is the connection was invalidated case.
            try:
                # try to gracefully close; see #10717
                self.await_(asyncio.shield(self._terminate_graceful_close()))  # type: ignore[attr-defined] # noqa: E501
            except self._terminate_handled_exceptions() as e:
                # in the case where we are recycling an old connection
                # that may have already been disconnected, close() will
                # fail.  In this case, terminate
                # the connection without any further waiting.
```

#### Фрейм 2
- **Файл:** `sqlalchemy\dialects\postgresql\asyncpg.py`
- **Строка:** 1127
- **Функция:** `do_terminate`
- **Контекст кода:**

```python

    def get_deferrable(self, connection):
        return connection.deferrable

    def do_terminate(self, dbapi_connection) -> None:
        dbapi_connection.terminate()

    def create_connect_args(self, url):
        opts = url.translate_connect_args(username="user")
        multihosts, multiports = self._split_multihost_from_url(url)

```

#### Фрейм 1
- **Файл:** `sqlalchemy\pool\base.py`
- **Строка:** 372
- **Функция:** `_close_connection`
- **Контекст кода:**

```python
            "Hard-closing" if terminate else "Closing",
            connection,
        )
        try:
            if terminate:
                self._dialect.do_terminate(connection)
            else:
                self._dialect.do_close(connection)
        except BaseException as e:
            self.logger.error(
                f"Exception {'terminating' if terminate else 'closing'} "
```

---

## Контекстная информация

### Информация о пользователе
- **User ID:** None
- **Email:** None
- **IP Address:** None

### Теги
```json
{
  "environment": "production",
  "handled": "yes",
  "level": "error",
  "logger": "sqlalchemy.pool.impl.AsyncAdaptedQueuePool",
  "mechanism": "logging",
  "release": "285e370809ffe979ece7fa65865b10a7c65bd245",
  "runtime": "CPython 3.13.3",
  "runtime.name": "CPython",
  "server_name": "sales-api"
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


Создано: 2026-02-23 11:21:18