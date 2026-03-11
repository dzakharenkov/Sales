# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7299667604  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7299667604/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
NetworkError: Bad Gateway

**Тип исключения:** NetworkError  
**Сообщение об ошибке:** Bad Gateway  

**Статистика:**
- Кол-во возникновений: **3**
- Первое появление: 2026-02-28T23:22:48Z
- Последнее появление: 2026-03-01T00:01:46Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`telegram/request/_baserequest.py:387`
в функции: `_request_wrapper`

### Полный стектрейс:

#### Фрейм 10
- **Файл:** `telegram/request/_baserequest.py`
- **Строка:** 387
- **Функция:** `_request_wrapper`
- **Контекст кода:**

```python
        if code == HTTPStatus.BAD_REQUEST:  # 400
            raise BadRequest(message)
        if code == HTTPStatus.CONFLICT:  # 409
            raise Conflict(message)
        if code == HTTPStatus.BAD_GATEWAY:  # 502
            raise NetworkError(description or "Bad Gateway")
        raise NetworkError(f"{message} ({code})")

    @staticmethod
    def parse_json_payload(payload: bytes) -> JSONDict:
        """Parse the JSON returned from Telegram.
```

#### Фрейм 9
- **Файл:** `telegram/request/_baserequest.py`
- **Строка:** 202
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

#### Фрейм 8
- **Файл:** `telegram/_bot.py`
- **Строка:** 720
- **Функция:** `_do_post`
- **Контекст кода:**

```python
        )

        request = self._request[0] if endpoint == "getUpdates" else self._request[1]

        self._LOGGER.debug("Calling Bot API endpoint `%s` with parameters `%s`", endpoint, data)
        result = await request.post(
            url=f"{self._base_url}/{endpoint}",
            request_data=request_data,
            read_timeout=read_timeout,
            write_timeout=write_timeout,
            connect_timeout=connect_timeout,
```

#### Фрейм 7
- **Файл:** `telegram/ext/_extbot.py`
- **Строка:** 362
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

#### Фрейм 6
- **Файл:** `telegram/_bot.py`
- **Строка:** 691
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

#### Фрейм 5
- **Файл:** `telegram/_bot.py`
- **Строка:** 4605
- **Функция:** `get_updates`
- **Контекст кода:**

```python
        # * Long polling poses a different problem: the connection might have been dropped while
        #   waiting for the server to return and there's no way of knowing the connection had been
        #   dropped in real time.
        result = cast(
            list[JSONDict],
            await self._post(
                "getUpdates",
                data,
                read_timeout=arg_read_timeout + timeout if timeout else arg_read_timeout,
                write_timeout=write_timeout,
                connect_timeout=connect_timeout,
```

#### Фрейм 4
- **Файл:** `telegram/ext/_extbot.py`
- **Строка:** 658
- **Функция:** `get_updates`
- **Контекст кода:**

```python
        write_timeout: ODVInput[float] = DEFAULT_NONE,
        connect_timeout: ODVInput[float] = DEFAULT_NONE,
        pool_timeout: ODVInput[float] = DEFAULT_NONE,
        api_kwargs: Optional[JSONDict] = None,
    ) -> tuple[Update, ...]:
        updates = await super().get_updates(
            offset=offset,
            limit=limit,
            timeout=timeout,
            allowed_updates=allowed_updates,
            read_timeout=read_timeout,
```

#### Фрейм 3
- **Файл:** `telegram/ext/_updater.py`
- **Строка:** 376
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
- **Файл:** `telegram/ext/_utils/networkloop.py`
- **Строка:** 108
- **Функция:** `do_action`
- **Контекст кода:**

```python

        if stop_task in done:
            _LOGGER.debug("%s Cancelled", log_prefix)
            return False

        return action_cb_task.result()

    _LOGGER.debug("%s Starting", log_prefix)
    cur_interval = interval
    retries = 0
    while effective_is_running():
```

#### Фрейм 1
- **Файл:** `telegram/ext/_utils/networkloop.py`
- **Строка:** 115
- **Функция:** `network_retry_loop`
- **Контекст кода:**

```python
    _LOGGER.debug("%s Starting", log_prefix)
    cur_interval = interval
    retries = 0
    while effective_is_running():
        try:
            if not await do_action():
                break
        except RetryAfter as exc:
            slack_time = 0.5
            _LOGGER.info(
                "%s %s. Adding %s seconds to the specified time.", log_prefix, exc, slack_time
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


Создано: 2026-03-10 10:04:24