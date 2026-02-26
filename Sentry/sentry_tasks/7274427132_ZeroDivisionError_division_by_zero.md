# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** ai_realty  
**ID Ошибки:** 7274427132  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7274427132/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
ZeroDivisionError: division by zero

**Тип исключения:** ZeroDivisionError  
**Сообщение об ошибке:** division by zero  

**Статистика:**
- Кол-во возникновений: **1**
- Первое появление: 2026-02-18T16:19:25Z
- Последнее появление: 2026-02-18T16:19:25Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`app\main.py:244`
в функции: `trigger_error`

### Полный стектрейс:

#### Фрейм 17
- **Файл:** `app\main.py`
- **Строка:** 244
- **Функция:** `trigger_error`
- **Контекст кода:**

```python


@app.get("/sentry-debug")
async def trigger_error():
    """Тестовый роут для проверки Sentry. Вызывает ошибку деления на ноль."""
    division_by_zero = 1 / 0


# Роутеры
from app.api.v1.routers import (
    auth, properties, portfolio, tenants, expenses, analytics, reports, users,
```

#### Фрейм 16
- **Файл:** `fastapi\routing.py`
- **Строка:** 212
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

#### Фрейм 15
- **Файл:** `fastapi\routing.py`
- **Строка:** 301
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

#### Фрейм 14
- **Файл:** `starlette\routing.py`
- **Строка:** 73
- **Функция:** `app`
- **Контекст кода:**

```python

    async def app(scope: Scope, receive: Receive, send: Send) -> None:
        request = Request(scope, receive, send)

        async def app(scope: Scope, receive: Receive, send: Send) -> None:
            response = await f(request)
            await response(scope, receive, send)

        await wrap_app_handling_exceptions(app, request)(scope, receive, send)

    return app
```

#### Фрейм 13
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

#### Фрейм 12
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

#### Фрейм 11
- **Файл:** `starlette\routing.py`
- **Строка:** 76
- **Функция:** `app`
- **Контекст кода:**

```python

        async def app(scope: Scope, receive: Receive, send: Send) -> None:
            response = await f(request)
            await response(scope, receive, send)

        await wrap_app_handling_exceptions(app, request)(scope, receive, send)

    return app


def websocket_session(
```

#### Фрейм 10
- **Файл:** `starlette\routing.py`
- **Строка:** 288
- **Функция:** `handle`
- **Контекст кода:**

```python
                raise HTTPException(status_code=405, headers=headers)
            else:
                response = PlainTextResponse("Method Not Allowed", status_code=405, headers=headers)
            await response(scope, receive, send)
        else:
            await self.app(scope, receive, send)

    def __eq__(self, other: typing.Any) -> bool:
        return (
            isinstance(other, Route)
            and self.path == other.path
```

#### Фрейм 9
- **Файл:** `starlette\routing.py`
- **Строка:** 734
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

#### Фрейм 8
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

#### Фрейм 7
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

#### Фрейм 6
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

#### Фрейм 5
- **Файл:** `starlette\middleware\exceptions.py`
- **Строка:** 62
- **Функция:** `__call__`
- **Контекст кода:**

```python
        if scope["type"] == "http":
            conn = Request(scope, receive, send)
        else:
            conn = WebSocket(scope, receive, send)

        await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)

    def http_exception(self, request: Request, exc: Exception) -> Response:
        assert isinstance(exc, HTTPException)
        if exc.status_code in {204, 304}:
            return Response(status_code=exc.status_code, headers=exc.headers)
```

#### Фрейм 4
- **Файл:** `starlette\middleware\cors.py`
- **Строка:** 85
- **Функция:** `__call__`
- **Контекст кода:**

```python
        method = scope["method"]
        headers = Headers(scope=scope)
        origin = headers.get("origin")

        if origin is None:
            await self.app(scope, receive, send)
            return

        if method == "OPTIONS" and "access-control-request-method" in headers:
            response = self.preflight_response(request_headers=headers)
            await response(scope, receive, send)
```

#### Фрейм 3
- **Файл:** `starlette\middleware\errors.py`
- **Строка:** 165
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

#### Фрейм 2
- **Файл:** `starlette\middleware\errors.py`
- **Строка:** 187
- **Функция:** `__call__`
- **Контекст кода:**

```python
                await response(scope, receive, send)

            # We always continue to raise the exception.
            # This allows servers to log the error, or allows test clients
            # to optionally raise the error within the test case.
            raise exc

    def format_line(self, index: int, line: str, frame_lineno: int, frame_index: int) -> str:
        values = {
            # HTML escape - line could contain < or >
            "line": html.escape(line).replace(" ", "&nbsp"),
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
- **IP Address:** 127.0.0.1

### Теги
```json
{
  "browser": "Chrome 144",
  "browser.name": "Chrome",
  "client_os": "Windows",
  "client_os.name": "Windows",
  "environment": "development",
  "handled": "no",
  "level": "error",
  "mechanism": "starlette",
  "runtime": "CPython 3.13.3",
  "runtime.name": "CPython",
  "server_name": "Sokol",
  "transaction": "/sentry-debug",
  "url": "http://localhost:8002/sentry-debug",
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