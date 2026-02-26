# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7275837030  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7275837030/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
Conflict: Conflict: terminated by other getUpdates request; make sure that only one bot instance is running

**Тип исключения:** Conflict  
**Сообщение об ошибке:** Conflict: terminated by other getUpdates request; make sure that only one bot instance is running  

**Статистика:**
- Кол-во возникновений: **24**
- Первое появление: 2026-02-19T07:08:06Z
- Последнее появление: 2026-02-19T07:11:50Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`telegram\request\_baserequest.py:330`
в функции: `_request_wrapper`

### Полный стектрейс:

#### Фрейм 11
- **Файл:** `telegram\request\_baserequest.py`
- **Строка:** 330
- **Функция:** `_request_wrapper`
- **Контекст кода:**

```python
            # TG returns 401 Unauthorized for correctly formatted tokens that are not valid
            raise InvalidToken(message)
        if code == HTTPStatus.BAD_REQUEST:  # 400
            raise BadRequest(message)
        if code == HTTPStatus.CONFLICT:  # 409
            raise Conflict(message)
        if code == HTTPStatus.BAD_GATEWAY:  # 502
            raise NetworkError(description or "Bad Gateway")
        raise NetworkError(f"{message} ({code})")

    @staticmethod
```

#### Фрейм 10
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

#### Фрейм 9
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

#### Фрейм 8
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

#### Фрейм 7
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

#### Фрейм 6
- **Файл:** `telegram\_bot.py`
- **Строка:** 3661
- **Функция:** `get_updates`
- **Контекст кода:**

```python
        # * Long polling poses a different problem: the connection might have been dropped while
        #   waiting for the server to return and there's no way of knowing the connection had been
        #   dropped in real time.
        result = cast(
            List[JSONDict],
            await self._post(
                "getUpdates",
                data,
                read_timeout=read_timeout + timeout if timeout else read_timeout,
                write_timeout=write_timeout,
                connect_timeout=connect_timeout,
```

#### Фрейм 5
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

#### Фрейм 4
- **Файл:** `telegram\ext\_extbot.py`
- **Строка:** 543
- **Функция:** `get_updates`
- **Контекст кода:**

```python
        write_timeout: ODVInput[float] = DEFAULT_NONE,
        connect_timeout: ODVInput[float] = DEFAULT_NONE,
        pool_timeout: ODVInput[float] = DEFAULT_NONE,
        api_kwargs: JSONDict = None,
    ) -> Tuple[Update, ...]:
        updates = await super().get_updates(
            offset=offset,
            limit=limit,
            timeout=timeout,
            allowed_updates=allowed_updates,
            read_timeout=read_timeout,
```

#### Фрейм 3
- **Файл:** `telegram\ext\_updater.py`
- **Строка:** 320
- **Функция:** `polling_action_cb`
- **Контекст кода:**

```python

        _LOGGER.debug("Bootstrap done")

        async def polling_action_cb() -> bool:
            try:
                updates = await self.bot.get_updates(
                    offset=self._last_update_id,
                    timeout=timeout,
                    read_timeout=read_timeout,
                    connect_timeout=connect_timeout,
                    write_timeout=write_timeout,
```

#### Фрейм 2
- **Файл:** `telegram\ext\_updater.py`
- **Строка:** 335
- **Функция:** `polling_action_cb`
- **Контекст кода:**

```python
                # TODO: in py3.8+, CancelledError is a subclass of BaseException, so we can drop
                #  this clause when we drop py3.7
                raise exc
            except TelegramError as exc:
                # TelegramErrors should be processed by the network retry loop
                raise exc
            except Exception as exc:
                # Other exceptions should not. Let's log them for now.
                _LOGGER.critical(
                    "Something went wrong processing the data received from Telegram. "
                    "Received data was *not* processed!",
```

#### Фрейм 1
- **Файл:** `telegram\ext\_updater.py`
- **Строка:** 607
- **Функция:** `_network_loop_retry`
- **Контекст кода:**

```python
        _LOGGER.debug("Start network loop retry %s", description)
        cur_interval = interval
        while self.running:
            try:
                try:
                    if not await action_cb():
                        break
                except RetryAfter as exc:
                    _LOGGER.info("%s", exc)
                    cur_interval = 0.5 + exc.retry_after
                except TimedOut as toe:
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