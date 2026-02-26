# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7278760989  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7278760989/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
RuntimeError: Database connection failed

**Тип исключения:** RuntimeError  
**Сообщение об ошибке:** Database connection failed  

**Статистика:**
- Кол-во возникновений: **4**
- Первое появление: 2026-02-20T08:32:38Z
- Последнее появление: 2026-02-23T20:27:14Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`src/main.py:62`
в функции: `lifespan`

### Полный стектрейс:

#### Фрейм 43
- **Файл:** `src/main.py`
- **Строка:** 62
- **Функция:** `lifespan`
- **Контекст кода:**

```python
        settings.sentry_environment,
    )
    ok = await test_connection()
    if not ok:
        logger.critical("Cannot start without database connection")
        raise RuntimeError("Database connection failed")
    log_pool_status()
    await verify_postgres_max_connections()
    await get_schema_info()
    await check_data_integrity()
    logger.info("Application startup complete")
```

#### Фрейм 42
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 41
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 40
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 39
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 38
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 37
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 36
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 35
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 34
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 33
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 32
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 31
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 30
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 29
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 28
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 27
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 26
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 25
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 24
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 23
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 22
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 21
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 20
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 19
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 18
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 17
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 16
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 15
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 14
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 13
- **Файл:** `fastapi/routing.py`
- **Строка:** 211
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
) -> Lifespan[Any]:
    @asynccontextmanager
    async def merged_lifespan(
        app: AppType,
    ) -> AsyncIterator[Optional[Mapping[str, Any]]]:
        async with original_context(app) as maybe_original_state:
            async with nested_context(app) as maybe_nested_state:
                if maybe_nested_state is None and maybe_original_state is None:
                    yield None  # old ASGI compatibility
                else:
                    yield {**(maybe_nested_state or {}), **(maybe_original_state or {})}
```

#### Фрейм 12
- **Файл:** `contextlib.py`
- **Строка:** 210
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
    async def __aenter__(self):
        # do not keep args and kwds alive unnecessarily
        # they are only needed for recreation, which is not possible anymore
        del self.args, self.kwds, self.func
        try:
            return await anext(self.gen)
        except StopAsyncIteration:
            raise RuntimeError("generator didn't yield") from None

    async def __aexit__(self, typ, value, traceback):
        if typ is None:
```

#### Фрейм 11
- **Файл:** `starlette/routing.py`
- **Строка:** 692
- **Функция:** `lifespan`
- **Контекст кода:**

```python
        """
        started = False
        app: typing.Any = scope.get("app")
        await receive()
        try:
            async with self.lifespan_context(app) as maybe_state:
                if maybe_state is not None:
                    if "state" not in scope:
                        raise RuntimeError('The server does not support "state" in the lifespan scope.')
                    scope["state"].update(maybe_state)
                await send({"type": "lifespan.startup.complete"})
```

#### Фрейм 10
- **Файл:** `starlette/routing.py`
- **Строка:** 723
- **Функция:** `app`
- **Контекст кода:**

```python

        if "router" not in scope:
            scope["router"] = self

        if scope["type"] == "lifespan":
            await self.lifespan(scope, receive, send)
            return

        partial = None

        for route in self.routes:
```

#### Фрейм 9
- **Файл:** `starlette/routing.py`
- **Строка:** 714
- **Функция:** `__call__`
- **Контекст кода:**

```python

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        """
        The main entry point to the Router class.
        """
        await self.middleware_stack(scope, receive, send)

    async def app(self, scope: Scope, receive: Receive, send: Send) -> None:
        assert scope["type"] in ("http", "websocket", "lifespan")

        if "router" not in scope:
```

#### Фрейм 8
- **Файл:** `fastapi/middleware/asyncexitstack.py`
- **Строка:** 18
- **Функция:** `__call__`
- **Контекст кода:**

```python
        self.context_name = context_name

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        async with AsyncExitStack() as stack:
            scope[self.context_name] = stack
            await self.app(scope, receive, send)
```

#### Фрейм 7
- **Файл:** `starlette/middleware/exceptions.py`
- **Строка:** 48
- **Функция:** `__call__`
- **Контекст кода:**

```python
            assert issubclass(exc_class_or_status_code, Exception)
            self._exception_handlers[exc_class_or_status_code] = handler

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] not in ("http", "websocket"):
            await self.app(scope, receive, send)
            return

        scope["starlette.exception_handlers"] = (
            self._exception_handlers,
            self._status_handlers,
```

#### Фрейм 6
- **Файл:** `starlette/middleware/base.py`
- **Строка:** 100
- **Функция:** `__call__`
- **Контекст кода:**

```python
        self.app = app
        self.dispatch_func = self.dispatch if dispatch is None else dispatch

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = _CachedRequest(scope, receive)
        wrapped_receive = request.wrapped_receive
        response_sent = anyio.Event()
```

#### Фрейм 5
- **Файл:** `starlette/middleware/cors.py`
- **Строка:** 77
- **Функция:** `__call__`
- **Контекст кода:**

```python
        self.simple_headers = simple_headers
        self.preflight_headers = preflight_headers

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":  # pragma: no cover
            await self.app(scope, receive, send)
            return

        method = scope["method"]
        headers = Headers(scope=scope)
        origin = headers.get("origin")
```

#### Фрейм 4
- **Файл:** `starlette/middleware/base.py`
- **Строка:** 100
- **Функция:** `__call__`
- **Контекст кода:**

```python
        self.app = app
        self.dispatch_func = self.dispatch if dispatch is None else dispatch

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = _CachedRequest(scope, receive)
        wrapped_receive = request.wrapped_receive
        response_sent = anyio.Event()
```

#### Фрейм 3
- **Файл:** `starlette/middleware/base.py`
- **Строка:** 100
- **Функция:** `__call__`
- **Контекст кода:**

```python
        self.app = app
        self.dispatch_func = self.dispatch if dispatch is None else dispatch

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = _CachedRequest(scope, receive)
        wrapped_receive = request.wrapped_receive
        response_sent = anyio.Event()
```

#### Фрейм 2
- **Файл:** `starlette/middleware/errors.py`
- **Строка:** 152
- **Функция:** `__call__`
- **Контекст кода:**

```python
        self.handler = handler
        self.debug = debug

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        response_started = False

        async def _send(message: Message) -> None:
```

#### Фрейм 1
- **Файл:** `starlette/applications.py`
- **Строка:** 112
- **Функция:** `__call__`
- **Контекст кода:**

```python

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        scope["app"] = self
        if self.middleware_stack is None:
            self.middleware_stack = self.build_middleware_stack()
        await self.middleware_stack(scope, receive, send)

    def on_event(self, event_type: str) -> typing.Callable:  # type: ignore[type-arg]
        return self.router.on_event(event_type)  # pragma: no cover

    def mount(self, path: str, app: ASGIApp, name: str | None = None) -> None:
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
  "mechanism": "starlette",
  "runtime": "CPython 3.12.3",
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


Создано: 2026-02-24 21:00:51