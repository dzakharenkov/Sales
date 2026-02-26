# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7278665192  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7278665192/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
OSError: [WinError 121] The semaphore timeout period has expired

**Тип исключения:** OSError  
**Сообщение об ошибке:** [WinError 121] The semaphore timeout period has expired  

**Статистика:**
- Кол-во возникновений: **1**
- Первое появление: 2026-02-20T07:43:27Z
- Последнее появление: 2026-02-20T07:43:27Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`asyncio\windows_events.py:600`
в функции: `finish_connect`

### Полный стектрейс:

#### Фрейм 23
- **Файл:** `asyncio\windows_events.py`
- **Строка:** 600
- **Функция:** `finish_connect`
- **Контекст кода:**

```python
                raise
        ov = _overlapped.Overlapped(NULL)
        ov.ConnectEx(conn.fileno(), address)

        def finish_connect(trans, key, ov):
            ov.getresult()
            # Use SO_UPDATE_CONNECT_CONTEXT so getsockname() etc work.
            conn.setsockopt(socket.SOL_SOCKET,
                            _overlapped.SO_UPDATE_CONNECT_CONTEXT, 0)
            return conn

```

#### Фрейм 22
- **Файл:** `asyncio\windows_events.py`
- **Строка:** 804
- **Функция:** `_poll`
- **Контекст кода:**

```python
                f.cancel()
            # Don't call the callback if _register() already read the result or
            # if the overlapped has been cancelled
            elif not f.done():
                try:
                    value = callback(transferred, key, ov)
                except OSError as e:
                    f.set_exception(e)
                    self._results.append(f)
                else:
                    f.set_result(value)
```

#### Фрейм 21
- **Файл:** `asyncio\proactor_events.py`
- **Строка:** 726
- **Функция:** `sock_connect`
- **Контекст кода:**

```python
        return await self._proactor.sendto(sock, data, 0, address)

    async def sock_connect(self, sock, address):
        if self._debug and sock.gettimeout() != 0:
            raise ValueError("the socket must be non-blocking")
        return await self._proactor.connect(sock, address)

    async def sock_accept(self, sock):
        return await self._proactor.accept(sock)

    async def _sock_sendfile_native(self, sock, file, offset, count):
```

#### Фрейм 20
- **Файл:** `asyncio\base_events.py`
- **Строка:** 1038
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

#### Фрейм 19
- **Файл:** `asyncio\base_events.py`
- **Строка:** 1135
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

#### Фрейм 18
- **Файл:** `asyncio\base_events.py`
- **Строка:** 1160
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

#### Фрейм 17
- **Файл:** `asyncpg\connect_utils.py`
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

#### Фрейм 16
- **Файл:** `asyncpg\connect_utils.py`
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

#### Фрейм 15
- **Файл:** `asyncpg\connect_utils.py`
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

#### Фрейм 14
- **Файл:** `asyncpg\connect_utils.py`
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

#### Фрейм 13
- **Файл:** `asyncpg\connect_utils.py`
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

#### Фрейм 12
- **Файл:** `asyncpg\connection.py`
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

#### Фрейм 11
- **Файл:** `asyncpg\pool.py`
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

#### Фрейм 10
- **Файл:** `asyncpg\pool.py`
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

#### Фрейм 9
- **Файл:** `asyncpg\pool.py`
- **Строка:** 161
- **Функция:** `acquire`
- **Контекст кода:**

```python
        self._setup_inactive_callback()

    async def acquire(self) -> PoolConnectionProxy:
        if self._con is None or self._con.is_closed():
            self._con = None
            await self.connect()

        elif self._generation != self._pool._generation:
            # Connections have been expired, re-connect the holder.
            self._pool._loop.create_task(
                self._con.close(timeout=self._timeout))
```

#### Фрейм 8
- **Файл:** `asyncpg\pool.py`
- **Строка:** 881
- **Функция:** `_acquire_impl`
- **Контекст кода:**

```python

    async def _acquire(self, timeout):
        async def _acquire_impl():
            ch = await self._queue.get()  # type: PoolConnectionHolder
            try:
                proxy = await ch.acquire()  # type: PoolConnectionProxy
            except (Exception, asyncio.CancelledError):
                self._queue.put_nowait(ch)
                raise
            else:
                # Record the timeout, as we will apply it by default
```

#### Фрейм 7
- **Файл:** `asyncpg\pool.py`
- **Строка:** 896
- **Функция:** `_acquire`
- **Контекст кода:**

```python
        if self._closing:
            raise exceptions.InterfaceError('pool is closing')
        self._check_init()

        if timeout is None:
            return await _acquire_impl()
        else:
            return await compat.wait_for(
                _acquire_impl(), timeout=timeout)

    async def release(self, connection, *, timeout=None):
```

#### Фрейм 6
- **Файл:** `asyncpg\pool.py`
- **Строка:** 1056
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
        self.done = False

    async def __aenter__(self):
        if self.connection is not None or self.done:
            raise exceptions.InterfaceError('a connection is already acquired')
        self.connection = await self.pool._acquire(self.timeout)
        return self.connection

    async def __aexit__(
        self,
        exc_type: Optional[Type[BaseException]] = None,
```

#### Фрейм 5
- **Файл:** `asyncpg\pool.py`
- **Строка:** 591
- **Функция:** `execute`
- **Контекст кода:**

```python
        that, it behaves identically to
        :meth:`Connection.execute() <asyncpg.connection.Connection.execute>`.

        .. versionadded:: 0.10.0
        """
        async with self.acquire() as con:
            return await con.execute(query, *args, timeout=timeout)

    async def executemany(
        self,
        command: str,
```

#### Фрейм 4
- **Файл:** `src\telegram_bot\session.py`
- **Строка:** 101
- **Функция:** `touch_session`
- **Контекст кода:**

```python


async def touch_session(tg_user_id: int):
    """Обновить last_activity_at."""
    pool = _pool_or_raise()
    await pool.execute(
        'UPDATE "Sales".telegram_sessions SET last_activity_at = now() WHERE telegram_user_id = $1',
        tg_user_id,
    )
    if tg_user_id in _sessions:
        _sessions[tg_user_id].last_activity_at = datetime.now(timezone.utc)
```

#### Фрейм 3
- **Файл:** `src\telegram_bot\handlers_auth.py`
- **Строка:** 271
- **Функция:** `cb_main_menu`
- **Контекст кода:**

```python
    await q.answer()
    session = await get_session(q.from_user.id)
    if not session:
        await q.edit_message_text("Сессия не найдена. Нажмите /start.")
        return
    await touch_session(q.from_user.id)
    await show_main_menu(update, context, session)


async def cb_profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
```

#### Фрейм 2
- **Файл:** `telegram\ext\_handler.py`
- **Строка:** 141
- **Функция:** `handle_update`
- **Контекст кода:**

```python
            context (:class:`telegram.ext.CallbackContext`): The context as provided by
                the application.

        """
        self.collect_additional_context(context, update, application, check_result)
        return await self.callback(update, context)

    def collect_additional_context(
        self,
        context: CCT,
        update: UT,
```

#### Фрейм 1
- **Файл:** `telegram\ext\_application.py`
- **Строка:** 1124
- **Функция:** `process_update`
- **Контекст кода:**

```python
                            and not self.bot.defaults.block
                        ):
                            self.create_task(coroutine, update=update)
                        else:
                            any_blocking = True
                            await coroutine
                        break  # Only a max of 1 handler per group is handled

            # Stop processing with any other handler.
            except ApplicationHandlerStop:
                _LOGGER.debug("Stopping further handlers due to ApplicationHandlerStop")
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
  "logger": "__main__",
  "mechanism": "logging",
  "release": "285e370809ffe979ece7fa65865b10a7c65bd245",
  "runtime": "CPython 3.13.3",
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


Создано: 2026-02-23 11:21:18