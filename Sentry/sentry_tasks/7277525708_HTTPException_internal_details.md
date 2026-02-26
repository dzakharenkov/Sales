# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7277525708  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7277525708/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
HTTPException: internal details

**Тип исключения:** HTTPException  
**Сообщение об ошибке:** internal details  

**Статистика:**
- Кол-во возникновений: **66**
- Первое появление: 2026-02-19T20:37:43Z
- Последнее появление: 2026-02-21T21:11:24Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`test_error_handlers.py:31`
в функции: `http500`

### Полный стектрейс:

#### Фрейм 5
- **Файл:** `test_error_handlers.py`
- **Строка:** 31
- **Функция:** `http500`
- **Контекст кода:**

```python
    async def http400():
        raise HTTPException(status_code=400, detail="bad request")

    @app.get("/http500")
    async def http500():
        raise HTTPException(status_code=500, detail="internal details")

    @app.get("/boom")
    async def boom():
        raise RuntimeError("sensitive stack trace detail")

```

#### Фрейм 4
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

#### Фрейм 3
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

#### Фрейм 2
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

#### Фрейм 1
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
  "mechanism": "starlette",
  "release": "285e370809ffe979ece7fa65865b10a7c65bd245",
  "runtime": "CPython 3.13.3",
  "runtime.name": "CPython",
  "server_name": "sales-api",
  "transaction": "/http500",
  "url": "http://testserver/http500"
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