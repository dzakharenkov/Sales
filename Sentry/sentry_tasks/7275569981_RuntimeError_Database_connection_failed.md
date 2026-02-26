# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** ai_realty  
**ID Ошибки:** 7275569981  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7275569981/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
RuntimeError: Database connection failed

**Тип исключения:** RuntimeError  
**Сообщение об ошибке:** Database connection failed  

**Статистика:**
- Кол-во возникновений: **6**
- Первое появление: 2026-02-19T03:35:28Z
- Последнее появление: 2026-02-19T16:19:24Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`app\main.py:79`
в функции: `lifespan`

### Полный стектрейс:

#### Фрейм 60
- **Файл:** `app\main.py`
- **Строка:** 79
- **Функция:** `lifespan`
- **Контекст кода:**

```python
        raise RuntimeError("Database connection failed")
```

#### Фрейм 59
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

#### Фрейм 58
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

#### Фрейм 57
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

#### Фрейм 56
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

#### Фрейм 55
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

#### Фрейм 54
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

#### Фрейм 53
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

#### Фрейм 52
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

#### Фрейм 51
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

#### Фрейм 50
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

#### Фрейм 49
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

#### Фрейм 48
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

#### Фрейм 47
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

#### Фрейм 46
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

#### Фрейм 45
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

#### Фрейм 44
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

#### Фрейм 43
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

#### Фрейм 42
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

#### Фрейм 41
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

#### Фрейм 40
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

#### Фрейм 39
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

#### Фрейм 38
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

#### Фрейм 37
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

#### Фрейм 36
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

#### Фрейм 35
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 34
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
        async with original_context(app) as maybe_original_state:
```

#### Фрейм 33
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 32
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
        async with original_context(app) as maybe_original_state:
```

#### Фрейм 31
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 30
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
        async with original_context(app) as maybe_original_state:
```

#### Фрейм 29
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 28
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
        async with original_context(app) as maybe_original_state:
```

#### Фрейм 27
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 26
- **Файл:** `fastapi\routing.py`
- **Строка:** 133
- **Функция:** `merged_lifespan`
- **Контекст кода:**

```python
        async with original_context(app) as maybe_original_state:
```

#### Фрейм 25
- **Файл:** `contextlib.py`
- **Строка:** 214
- **Функция:** `__aenter__`
- **Контекст кода:**

```python
            return await anext(self.gen)
```

#### Фрейм 24
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

#### Фрейм 23
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

#### Фрейм 22
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

#### Фрейм 21
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

#### Фрейм 20
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

#### Фрейм 19
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

#### Фрейм 18
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

#### Фрейм 17
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

#### Фрейм 16
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

#### Фрейм 15
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

#### Фрейм 14
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

#### Фрейм 13
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

#### Фрейм 12
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

#### Фрейм 11
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

#### Фрейм 10
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

#### Фрейм 9
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

#### Фрейм 8
- **Файл:** `starlette\routing.py`
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

#### Фрейм 7
- **Файл:** `starlette\routing.py`
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

#### Фрейм 6
- **Файл:** `starlette\routing.py`
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

#### Фрейм 5
- **Файл:** `starlette\middleware\exceptions.py`
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

#### Фрейм 4
- **Файл:** `starlette\middleware\cors.py`
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

#### Фрейм 3
- **Файл:** `starlette\middleware\base.py`
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
- **Файл:** `starlette\middleware\errors.py`
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
- **Файл:** `starlette\applications.py`
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
  "environment": "development",
  "handled": "no",
  "level": "error",
  "mechanism": "starlette",
  "release": "83535c977f911d1fe4f89070dd96b480a4e23455",
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