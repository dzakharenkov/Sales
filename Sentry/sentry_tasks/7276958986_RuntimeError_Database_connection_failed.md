# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** ai_realty  
**ID Ошибки:** 7276958986  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7276958986/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
RuntimeError: Database connection failed

**Тип исключения:** RuntimeError  
**Сообщение об ошибке:** Database connection failed  

**Статистика:**
- Кол-во возникновений: **2**
- Первое появление: 2026-02-19T16:19:39Z
- Последнее появление: 2026-02-19T16:24:48Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`app\main.py:79`
в функции: `lifespan`

### Полный стектрейс:

#### Фрейм 57
- **Файл:** `app\main.py`
- **Строка:** 79
- **Функция:** `lifespan`
- **Контекст кода:**

```python
    logger.info("Starting AI REALTY Application...")
    settings.validate_security()
    ok = await test_connection()
    if not ok:
        logger.critical("Cannot start without database connection")
        raise RuntimeError("Database connection failed")
    await ensure_admin_user()
    await get_schema_info()
    logger.info("Application startup complete")
    yield
    logger.info("Shutting down AI REALTY Application...")
```

#### Фрейм 56
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 55
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 54
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 53
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 52
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 51
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 50
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 49
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 48
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 47
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 46
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 45
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 44
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 43
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 42
- **Файл:** `contextlib.py`
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
        async with original_context(app) as maybe_original_state:
```

#### Фрейм 32
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 31
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
        async with original_context(app) as maybe_original_state:
```

#### Фрейм 30
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 29
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
        async with original_context(app) as maybe_original_state:
```

#### Фрейм 28
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 27
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
        async with original_context(app) as maybe_original_state:
```

#### Фрейм 26
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 25
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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
- **Строка:** 214
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
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 10
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 9
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 8
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 7
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
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

#### Фрейм 6
- **Файл:** `contextlib.py`
- **Строка:** 214
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

#### Фрейм 5
- **Файл:** `startup_smoke.py`
- **Строка:** 8
- **Функция:** `_run`
- **Контекст кода:**

```python
    async with app.router.lifespan_context(app):
```

#### Фрейм 4
- **Файл:** `asyncio\base_events.py`
- **Строка:** 719
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

#### Фрейм 3
- **Файл:** `asyncio\runners.py`
- **Строка:** 118
- **Функция:** `run`
- **Контекст кода:**

```python
        else:
            sigint_handler = None

        self._interrupt_count = 0
        try:
            return self._loop.run_until_complete(task)
        except exceptions.CancelledError:
            if self._interrupt_count > 0:
                uncancel = getattr(task, "uncancel", None)
                if uncancel is not None and uncancel() == 0:
                    raise KeyboardInterrupt()
```

#### Фрейм 2
- **Файл:** `asyncio\runners.py`
- **Строка:** 195
- **Функция:** `run`
- **Контекст кода:**

```python
        # fail fast with short traceback
        raise RuntimeError(
            "asyncio.run() cannot be called from a running event loop")

    with Runner(debug=debug, loop_factory=loop_factory) as runner:
        return runner.run(main)


def _cancel_all_tasks(loop):
    to_cancel = tasks.all_tasks(loop)
    if not to_cancel:
```

#### Фрейм 1
- **Файл:** `startup_smoke.py`
- **Строка:** 13
- **Функция:** `<module>`
- **Контекст кода:**

```python
    async with app.router.lifespan_context(app):
        print("API_STARTUP_OK")


if __name__ == "__main__":
    asyncio.run(_run())

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
  "environment": "development",
  "handled": "no",
  "level": "error",
  "mechanism": "excepthook",
  "release": "700e3966983f218d83b5d134c7797050426b6095",
  "runtime": "CPython 3.13.3",
  "runtime.name": "CPython",
  "server_name": "Sokol"
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