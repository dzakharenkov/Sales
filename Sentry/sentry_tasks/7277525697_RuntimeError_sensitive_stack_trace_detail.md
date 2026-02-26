# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7277525697  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7277525697/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
RuntimeError: sensitive stack trace detail

**Тип исключения:** RuntimeError  
**Сообщение об ошибке:** sensitive stack trace detail  

**Статистика:**
- Кол-во возникновений: **66**
- Первое появление: 2026-02-19T20:37:43Z
- Последнее появление: 2026-02-21T21:11:24Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`test_error_handlers.py:35`
в функции: `boom`

### Полный стектрейс:

#### Фрейм 15
- **Файл:** `test_error_handlers.py`
- **Строка:** 35
- **Функция:** `boom`
- **Контекст кода:**

```python
    async def http500():
        raise HTTPException(status_code=500, detail="internal details")

    @app.get("/boom")
    async def boom():
        raise RuntimeError("sensitive stack trace detail")

    @app.get("/integrity")
    async def integrity():
        raise IntegrityError("INSERT ...", {}, Exception("unique violation"))

```

#### Фрейм 14
- **Файл:** `fastapi\routing.py`
- **Строка:** 290
- **Функция:** `run_endpoint_function`
- **Контекст кода:**

```python
    # Only called by get_request_handler. Has been split into its own function to
    # facilitate profiling endpoints, since inner functions are harder to profile.
    assert dependant.call is not None, "dependant.call must be a function"

    if is_coroutine:
        return await dependant.call(**values)
    else:
        return await run_in_threadpool(dependant.call, **values)


def get_request_handler(
```

#### Фрейм 13
- **Файл:** `fastapi\routing.py`
- **Строка:** 391
- **Функция:** `app`
- **Контекст кода:**

```python
            async_exit_stack=async_exit_stack,
            embed_body_fields=embed_body_fields,
        )
        errors = solved_result.errors
        if not errors:
            raw_response = await run_endpoint_function(
                dependant=dependant,
                values=solved_result.values,
                is_coroutine=is_coroutine,
            )
            if isinstance(raw_response, Response):
```

#### Фрейм 12
- **Файл:** `fastapi\routing.py`
- **Строка:** 111
- **Функция:** `app`
- **Контекст кода:**

```python
            response_awaited = False
            async with AsyncExitStack() as request_stack:
                scope["fastapi_inner_astack"] = request_stack
                async with AsyncExitStack() as function_stack:
                    scope["fastapi_function_astack"] = function_stack
                    response = await f(request)
                await response(scope, receive, send)
                # Continues customization
                response_awaited = True
            if not response_awaited:
                raise FastAPIError(
```

#### Фрейм 11
- **Файл:** `starlette\_exception_handler.py`
- **Строка:** 42
- **Функция:** `wrapped_app`
- **Контекст кода:**

```python
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await app(scope, receive, sender)
        except Exception as exc:
            handler = None

            if isinstance(exc, HTTPException):
                handler = status_handlers.get(exc.status_code)
```

#### Фрейм 10
- **Файл:** `starlette\_exception_handler.py`
- **Строка:** 53
- **Функция:** `wrapped_app`
- **Контекст кода:**

```python

            if handler is None:
                handler = _lookup_exception_handler(exception_handlers, exc)

            if handler is None:
                raise exc

            if response_started:
                raise RuntimeError("Caught handled exception, but response already started.") from exc

            if is_async_callable(handler):
```

#### Фрейм 9
- **Файл:** `fastapi\routing.py`
- **Строка:** 125
- **Функция:** `app`
- **Контекст кода:**

```python
                    "and is not raising the exception again. Read more about it in the "
                    "docs: https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/#dependencies-with-yield-and-except"
                )

        # Same as in Starlette
        await wrap_app_handling_exceptions(app, request)(scope, receive, send)

    return app


# Copy of starlette.routing.websocket_session modified to include the
```

#### Фрейм 8
- **Файл:** `starlette\routing.py`
- **Строка:** 290
- **Функция:** `handle`
- **Контекст кода:**

```python
                raise HTTPException(status_code=405, headers=headers)
            else:
                response = PlainTextResponse("Method Not Allowed", status_code=405, headers=headers)
            await response(scope, receive, send)
        else:
            await self.app(scope, receive, send)

    def __eq__(self, other: Any) -> bool:
        return (
            isinstance(other, Route)
            and self.path == other.path
```

#### Фрейм 7
- **Файл:** `starlette\routing.py`
- **Строка:** 736
- **Функция:** `app`
- **Контекст кода:**

```python
            # Determine if any route matches the incoming scope,
            # and hand over to the matching route if found.
            match, child_scope = route.matches(scope)
            if match == Match.FULL:
                scope.update(child_scope)
                await route.handle(scope, receive, send)
                return
            elif match == Match.PARTIAL and partial is None:
                partial = route
                partial_scope = child_scope

```

#### Фрейм 6
- **Файл:** `starlette\routing.py`
- **Строка:** 716
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
- **Файл:** `fastapi\middleware\asyncexitstack.py`
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

#### Фрейм 4
- **Файл:** `starlette\_exception_handler.py`
- **Строка:** 42
- **Функция:** `wrapped_app`
- **Контекст кода:**

```python
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await app(scope, receive, sender)
        except Exception as exc:
            handler = None

            if isinstance(exc, HTTPException):
                handler = status_handlers.get(exc.status_code)
```

#### Фрейм 3
- **Файл:** `starlette\_exception_handler.py`
- **Строка:** 53
- **Функция:** `wrapped_app`
- **Контекст кода:**

```python

            if handler is None:
                handler = _lookup_exception_handler(exception_handlers, exc)

            if handler is None:
                raise exc

            if response_started:
                raise RuntimeError("Caught handled exception, but response already started.") from exc

            if is_async_callable(handler):
```

#### Фрейм 2
- **Файл:** `starlette\middleware\exceptions.py`
- **Строка:** 63
- **Функция:** `__call__`
- **Контекст кода:**

```python
        if scope["type"] == "http":
            conn = Request(scope, receive, send)
        else:
            conn = WebSocket(scope, receive, send)

        await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)

    async def http_exception(self, request: Request, exc: Exception) -> Response:
        assert isinstance(exc, HTTPException)
        if exc.status_code in {204, 304}:
            return Response(status_code=exc.status_code, headers=exc.headers)
```

#### Фрейм 1
- **Файл:** `starlette\middleware\errors.py`
- **Строка:** 164
- **Функция:** `__call__`
- **Контекст кода:**

```python
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, receive, _send)
        except Exception as exc:
            request = Request(scope)
            if self.debug:
                # In debug mode, return traceback responses.
                response = self.debug_response(request, exc)
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
  "logger": "src.core.exception_handlers",
  "mechanism": "logging",
  "release": "285e370809ffe979ece7fa65865b10a7c65bd245",
  "runtime": "CPython 3.13.3",
  "runtime.name": "CPython",
  "server_name": "sales-api",
  "transaction": "/boom",
  "url": "http://testserver/boom"
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