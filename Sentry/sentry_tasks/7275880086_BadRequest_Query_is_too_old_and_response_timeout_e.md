# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7275880086  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7275880086/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
BadRequest: Query is too old and response timeout expired or query id is invalid

**Тип исключения:** BadRequest  
**Сообщение об ошибке:** Query is too old and response timeout expired or query id is invalid  

**Статистика:**
- Кол-во возникновений: **1**
- Первое появление: 2026-02-19T07:40:24Z
- Последнее появление: 2026-02-19T07:40:24Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`telegram\request\_baserequest.py:328`
в функции: `_request_wrapper`

### Полный стектрейс:

#### Фрейм 12
- **Файл:** `telegram\request\_baserequest.py`
- **Строка:** 328
- **Функция:** `_request_wrapper`
- **Контекст кода:**

```python
            #   2) correct tokens but non-existing method, e.g. api.tg.org/botTOKEN/unkonwnMethod
            # We can basically rule out 2) since we don't let users make requests manually
            # TG returns 401 Unauthorized for correctly formatted tokens that are not valid
            raise InvalidToken(message)
        if code == HTTPStatus.BAD_REQUEST:  # 400
            raise BadRequest(message)
        if code == HTTPStatus.CONFLICT:  # 409
            raise Conflict(message)
        if code == HTTPStatus.BAD_GATEWAY:  # 502
            raise NetworkError(description or "Bad Gateway")
        raise NetworkError(f"{message} ({code})")
```

#### Фрейм 11
- **Файл:** `telegram\request\_baserequest.py`
- **Строка:** 168
- **Функция:** `post`
- **Контекст кода:**

```python

        Returns:
          The JSON response of the Bot API.

        """
        result = await self._request_wrapper(
            url=url,
            method="POST",
            request_data=request_data,
            read_timeout=read_timeout,
            write_timeout=write_timeout,
```

#### Фрейм 10
- **Файл:** `telegram\_bot.py`
- **Строка:** 497
- **Функция:** `_do_post`
- **Контекст кода:**

```python
            parameters=[RequestParameter.from_input(key, value) for key, value in data.items()],
        )

        request = self._request[0] if endpoint == "getUpdates" else self._request[1]

        return await request.post(
            url=f"{self._base_url}/{endpoint}",
            request_data=request_data,
            read_timeout=read_timeout,
            write_timeout=write_timeout,
            connect_timeout=connect_timeout,
```

#### Фрейм 9
- **Файл:** `telegram\ext\_extbot.py`
- **Строка:** 325
- **Функция:** `_do_post`
- **Контекст кода:**

```python
                "`rate_limit_args` can only be used if a `ExtBot.rate_limiter` is set."
            )

        # getting updates should not be rate limited!
        if endpoint == "getUpdates" or not self.rate_limiter:
            return await super()._do_post(
                endpoint=endpoint,
                data=data,
                write_timeout=write_timeout,
                connect_timeout=connect_timeout,
                pool_timeout=pool_timeout,
```

#### Фрейм 8
- **Файл:** `telegram\_bot.py`
- **Строка:** 469
- **Функция:** `_post`
- **Контекст кода:**

```python
        self._insert_defaults(data)

        # Drop any None values because Telegram doesn't handle them well
        data = {key: value for key, value in data.items() if value is not None}

        return await self._do_post(
            endpoint=endpoint,
            data=data,
            read_timeout=read_timeout,
            write_timeout=write_timeout,
            connect_timeout=connect_timeout,
```

#### Фрейм 7
- **Файл:** `telegram\_bot.py`
- **Строка:** 3306
- **Функция:** `answer_callback_query`
- **Контекст кода:**

```python
            "text": text,
            "show_alert": show_alert,
            "url": url,
        }

        return await self._post(
            "answerCallbackQuery",
            data,
            read_timeout=read_timeout,
            write_timeout=write_timeout,
            connect_timeout=connect_timeout,
```

#### Фрейм 6
- **Файл:** `telegram\_bot.py`
- **Строка:** 381
- **Функция:** `decorator`
- **Контекст кода:**

```python
    def _log(func: Any):  # type: ignore[no-untyped-def] # skipcq: PY-D0003
        @functools.wraps(func)
        async def decorator(self: "Bot", *args: Any, **kwargs: Any) -> Any:
            # pylint: disable=protected-access
            self._LOGGER.debug("Entering: %s", func.__name__)
            result = await func(self, *args, **kwargs)  # skipcq: PYL-E1102
            self._LOGGER.debug(result)
            self._LOGGER.debug("Exiting: %s", func.__name__)
            return result

        return decorator
```

#### Фрейм 5
- **Файл:** `telegram\ext\_extbot.py`
- **Строка:** 773
- **Функция:** `answer_callback_query`
- **Контекст кода:**

```python
        connect_timeout: ODVInput[float] = DEFAULT_NONE,
        pool_timeout: ODVInput[float] = DEFAULT_NONE,
        api_kwargs: JSONDict = None,
        rate_limit_args: RLARGS = None,
    ) -> bool:
        return await super().answer_callback_query(
            callback_query_id=callback_query_id,
            text=text,
            show_alert=show_alert,
            url=url,
            cache_time=cache_time,
```

#### Фрейм 4
- **Файл:** `telegram\_callbackquery.py`
- **Строка:** 180
- **Функция:** `answer`
- **Контекст кода:**

```python

        Returns:
            :obj:`bool`: On success, :obj:`True` is returned.

        """
        return await self.get_bot().answer_callback_query(
            callback_query_id=self.id,
            text=text,
            show_alert=show_alert,
            url=url,
            cache_time=cache_time,
```

#### Фрейм 3
- **Файл:** `src\telegram_bot\handlers_auth.py`
- **Строка:** 269
- **Функция:** `cb_main_menu`
- **Контекст кода:**

```python

# ---------- Callbacks ----------

async def cb_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session = await get_session(q.from_user.id)
    if not session:
        await q.edit_message_text("Сессия не найдена. Нажмите /start.")
        return
    await touch_session(q.from_user.id)
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
  "logger": "telegram.ext.Application",
  "mechanism": "logging",
  "release": "18246f668b6a9fcb582aeb697bc1d0913cb84191",
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