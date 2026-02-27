# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7279797572  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7279797572/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
ConnectionRefusedError: [Errno 111] Connect call failed ('45.141.76.83', 5433)

**Тип исключения:** ConnectionRefusedError  
**Сообщение об ошибке:** [Errno 111] Connect call failed ('45.141.76.83', 5433)  

**Статистика:**
- Кол-во возникновений: **7**
- Первое появление: 2026-02-20T16:09:03Z
- Последнее появление: 2026-02-27T06:08:16Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`asyncio/selector_events.py:691`
в функции: `_sock_connect_cb`

### Полный стектрейс:

#### Фрейм 24
- **Файл:** `asyncio/selector_events.py`
- **Строка:** 691
- **Функция:** `_sock_connect_cb`
- **Контекст кода:**

```python

        try:
            err = sock.getsockopt(socket.SOL_SOCKET, socket.SO_ERROR)
            if err != 0:
                # Jump to any except clause below.
                raise OSError(err, f'Connect call failed {address}')
        except (BlockingIOError, InterruptedError):
            # socket is still registered, the callback will be retried later
            pass
        except (SystemExit, KeyboardInterrupt):
            raise
```

#### Фрейм 23
- **Файл:** `asyncio/selector_events.py`
- **Строка:** 651
- **Функция:** `sock_connect`
- **Контекст кода:**

```python
            _, _, _, _, address = resolved[0]

        fut = self.create_future()
        self._sock_connect(fut, sock, address)
        try:
            return await fut
        finally:
            # Needed to break cycles when an exception occurs.
            fut = None

    def _sock_connect(self, fut, sock, address):
```

#### Фрейм 22
- **Файл:** `asyncio/base_events.py`
- **Строка:** 1007
- **Функция:** `_connect_sock`
- **Контекст кода:**

```python
                else:  # all bind attempts failed
                    if my_exceptions:
                        raise my_exceptions.pop()
                    else:
                        raise OSError(f"no matching local address with {family=} found")
            await self.sock_connect(sock, address)
            return sock
        except OSError as exc:
            my_exceptions.append(exc)
            if sock is not None:
                sock.close()
```

#### Фрейм 21
- **Файл:** `asyncio/base_events.py`
- **Строка:** 1104
- **Функция:** `create_connection`
- **Контекст кода:**

```python
            exceptions = []
            if happy_eyeballs_delay is None:
                # not using happy eyeballs
                for addrinfo in infos:
                    try:
                        sock = await self._connect_sock(
                            exceptions, addrinfo, laddr_infos)
                        break
                    except OSError:
                        continue
            else:  # using happy eyeballs
```

#### Фрейм 20
- **Файл:** `asyncio/base_events.py`
- **Строка:** 1122
- **Функция:** `create_connection`
- **Контекст кода:**

```python
                exceptions = [exc for sub in exceptions for exc in sub]
                try:
                    if all_errors:
                        raise ExceptionGroup("create_connection failed", exceptions)
                    if len(exceptions) == 1:
                        raise exceptions[0]
                    else:
                        # If they all have the same str(), raise one.
                        model = str(exceptions[0])
                        if all(str(exc) == model for exc in exceptions):
                            raise exceptions[0]
```

#### Фрейм 19
- **Файл:** `asyncpg/connect_utils.py`
- **Строка:** 969
- **Функция:** `_create_ssl_connection`
- **Контекст кода:**

```python
    loop: asyncio.AbstractEventLoop,
    ssl_context: ssl_module.SSLContext,
    ssl_is_advisory: bool = False,
) -> typing.Tuple[asyncio.Transport, _ProctolFactoryR]:

    tr, pr = await loop.create_connection(
        lambda: TLSUpgradeProto(loop, host, port,
                                ssl_context, ssl_is_advisory),
        host, port)

    tr.write(struct.pack('!ll', 8, 80877103))  # SSLRequest message.
```

#### Фрейм 18
- **Файл:** `asyncpg/connect_utils.py`
- **Строка:** 1099
- **Функция:** `__connect_addr`
- **Контекст кода:**

```python
            proto_factory, *addr, loop=loop, ssl_context=params.ssl,
            ssl_is_advisory=params.sslmode == SSLMode.prefer)
    else:
        connector = loop.create_connection(proto_factory, *addr)

    tr, pr = await connector

    try:
        await connected
    except (
        exceptions.InvalidAuthorizationSpecificationError,
```

#### Фрейм 17
- **Файл:** `asyncpg/connect_utils.py`
- **Строка:** 1054
- **Функция:** `_connect_addr`
- **Контекст кода:**

```python
        # skip retry if we don't have to
        return await __connect_addr(params, False, *args)

    # first attempt
    try:
        return await __connect_addr(params, True, *args)
    except _RetryConnectSignal:
        pass

    # second attempt
    return await __connect_addr(params_retry, False, *args)
```

#### Фрейм 16
- **Файл:** `asyncpg/connect_utils.py`
- **Строка:** 1218
- **Функция:** `_connect`
- **Контекст кода:**

```python
    chosen_connection = None
    last_error = None
    try:
        for addr in addrs:
            try:
                conn = await _connect_addr(
                    addr=addr,
                    loop=loop,
                    params=params,
                    config=config,
                    connection_class=connection_class,
```

#### Фрейм 15
- **Файл:** `asyncpg/connect_utils.py`
- **Строка:** 1249
- **Функция:** `_connect`
- **Контекст кода:**

```python
                _close_candidates(candidates, chosen_connection))

    if chosen_connection:
        return chosen_connection

    raise last_error or exceptions.TargetServerAttributeNotMatched(
        'None of the hosts match the target attribute requirement '
        '{!r}'.format(target_attr)
    )


```

#### Фрейм 14
- **Файл:** `asyncpg/connection.py`
- **Строка:** 2443
- **Функция:** `connect`
- **Контекст кода:**

```python

    if loop is None:
        loop = asyncio.get_event_loop()

    async with compat.timeout(timeout):
        return await connect_utils._connect(
            loop=loop,
            connection_class=connection_class,
            record_class=record_class,
            dsn=dsn,
            host=host,
```

#### Фрейм 13
- **Файл:** `asyncpg/pool.py`
- **Строка:** 538
- **Функция:** `_get_new_connection`
- **Контекст кода:**

```python

        self._connect_args = [dsn]
        self._connect_kwargs = connect_kwargs

    async def _get_new_connection(self):
        con = await self._connect(
            *self._connect_args,
            loop=self._loop,
            connection_class=self._connection_class,
            record_class=self._record_class,
            **self._connect_kwargs,
```

#### Фрейм 12
- **Файл:** `asyncpg/pool.py`
- **Строка:** 153
- **Функция:** `connect`
- **Контекст кода:**

```python
        if self._con is not None:
            raise exceptions.InternalClientError(
                'PoolConnectionHolder.connect() called while another '
                'connection already exists')

        self._con = await self._pool._get_new_connection()
        self._generation = self._pool._generation
        self._maybe_cancel_inactive_callback()
        self._setup_inactive_callback()

    async def acquire(self) -> PoolConnectionProxy:
```

#### Фрейм 11
- **Файл:** `asyncpg/pool.py`
- **Строка:** 466
- **Функция:** `_initialize`
- **Контекст кода:**

```python
            # `self._holders` in reverse.

            # Connect the first connection holder in the queue so that
            # any connection issues are visible early.
            first_ch = self._holders[-1]  # type: PoolConnectionHolder
            await first_ch.connect()

            if self._minsize > 1:
                connect_tasks = []
                for i, ch in enumerate(reversed(self._holders[:-1])):
                    # `minsize - 1` because we already have first_ch
```

#### Фрейм 10
- **Файл:** `asyncpg/pool.py`
- **Строка:** 439
- **Функция:** `_async__init__`
- **Контекст кода:**

```python
                'pool is being initialized in another task')
        if self._closed:
            raise exceptions.InterfaceError('pool is closed')
        self._initializing = True
        try:
            await self._initialize()
            return self
        finally:
            self._initializing = False
            self._initialized = True

```

#### Фрейм 9
- **Файл:** `src/telegram_bot/session.py`
- **Строка:** 21
- **Функция:** `init_pool`
- **Контекст кода:**

```python
_pool: asyncpg.Pool | None = None


async def init_pool(dsn: str):
    global _pool
    _pool = await asyncpg.create_pool(dsn=dsn, min_size=2, max_size=10)
    logger.info("Telegram bot DB pool created")


async def close_pool():
    global _pool
```

#### Фрейм 8
- **Файл:** `bot.py`
- **Строка:** 103
- **Функция:** `post_init`
- **Контекст кода:**

```python


async def post_init(application: Application):
    if not BOT_DB_DSN:
        raise RuntimeError("Bot DB DSN is not configured")
    await init_pool(BOT_DB_DSN)
    logger.info("Telegram bot initialized, DB pool ready")


async def post_shutdown(application: Application):
    await close_pool()
```

#### Фрейм 7
- **Файл:** `asyncio/base_events.py`
- **Строка:** 687
- **Функция:** `run_until_complete`
- **Контекст кода:**

```python
        finally:
            future.remove_done_callback(_run_until_complete_cb)
        if not future.done():
            raise RuntimeError('Event loop stopped before Future completed.')

        return future.result()

    def stop(self):
        """Stop running the event loop.

        Every callback already scheduled will still run.  This simply informs
```

#### Фрейм 6
- **Файл:** `telegram/ext/_application.py`
- **Строка:** 1089
- **Функция:** `__run`
- **Контекст кода:**

```python
            )

        try:
            loop.run_until_complete(self._bootstrap_initialize(max_retries=bootstrap_retries))
            if self.post_init:
                loop.run_until_complete(self.post_init(self))
            if self.__stop_running_marker.is_set():
                _LOGGER.info("Application received stop signal via `stop_running`. Shutting down.")
                return
            loop.run_until_complete(updater_coroutine)  # one of updater.start_webhook/polling
            loop.run_until_complete(self.start())
```

#### Фрейм 5
- **Файл:** `telegram/ext/_application.py`
- **Строка:** 873
- **Функция:** `run_polling`
- **Контекст кода:**

```python
            )

        def error_callback(exc: TelegramError) -> None:
            self.create_task(self.process_error(error=exc, update=None))

        return self.__run(
            updater_coroutine=self.updater.start_polling(
                poll_interval=poll_interval,
                timeout=timeout,
                bootstrap_retries=bootstrap_retries,
                read_timeout=read_timeout,
```

#### Фрейм 4
- **Файл:** `bot.py`
- **Строка:** 167
- **Функция:** `run_bot`
- **Контекст кода:**

```python
    register_expeditor_handlers(app)
    register_agent_handlers(app)
    app.add_error_handler(on_bot_error)

    logger.info("Bot handlers registered. Starting polling...")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    run_bot()
```

#### Фрейм 3
- **Файл:** `bot.py`
- **Строка:** 171
- **Функция:** `<module>`
- **Контекст кода:**

```python
    logger.info("Bot handlers registered. Starting polling...")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    run_bot()
```

#### Фрейм 2
- **Файл:** `<frozen runpy>`
- **Строка:** 88
- **Функция:** `_run_code`
- **Контекст кода:**

```python
```

#### Фрейм 1
- **Файл:** `<frozen runpy>`
- **Строка:** 198
- **Функция:** `_run_module_as_main`
- **Контекст кода:**

```python
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
  "handled": "no",
  "level": "error",
  "mechanism": "excepthook",
  "runtime": "CPython 3.12.3",
  "runtime.name": "CPython",
  "server_name": "sales-telegram-bot"
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