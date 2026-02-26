# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7278376250  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7278376250/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
TypeError: AsyncClient.__init__() got an unexpected keyword argument 'proxies'

**Тип исключения:** TypeError  
**Сообщение об ошибке:** AsyncClient.__init__() got an unexpected keyword argument 'proxies'  

**Статистика:**
- Кол-во возникновений: **3**
- Первое появление: 2026-02-20T04:53:23Z
- Последнее появление: 2026-02-20T05:12:05Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`telegram\request\_httpxrequest.py:159`
в функции: `_build_client`

### Полный стектрейс:

#### Фрейм 9
- **Файл:** `telegram\request\_httpxrequest.py`
- **Строка:** 159
- **Функция:** `_build_client`
- **Контекст кода:**

```python
        .. versionadded:: 20.2
        """
        return self._http_version

    def _build_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(**self._client_kwargs)  # type: ignore[arg-type]

    async def initialize(self) -> None:
        """See :meth:`BaseRequest.initialize`."""
        if self._client.is_closed:
            self._client = self._build_client()
```

#### Фрейм 8
- **Файл:** `telegram\request\_httpxrequest.py`
- **Строка:** 134
- **Функция:** `__init__`
- **Контекст кода:**

```python
            http1=http1,
            http2=not http1,
        )

        try:
            self._client = self._build_client()
        except ImportError as exc:
            if "httpx[http2]" not in str(exc) and "httpx[socks]" not in str(exc):
                raise exc

            if "httpx[socks]" in str(exc):
```

#### Фрейм 7
- **Файл:** `telegram\ext\_applicationbuilder.py`
- **Строка:** 237
- **Функция:** `_build_request`
- **Контекст кода:**

```python
            key: value for key, value in timeouts.items() if not isinstance(value, DefaultValue)
        }

        http_version = DefaultValue.get_value(getattr(self, f"{prefix}http_version")) or "1.1"

        return HTTPXRequest(
            connection_pool_size=connection_pool_size,
            proxy_url=proxy_url,
            http_version=http_version,
            **effective_timeouts,
        )
```

#### Фрейм 6
- **Файл:** `telegram\ext\_applicationbuilder.py`
- **Строка:** 256
- **Функция:** `_build_ext_bot`
- **Контекст кода:**

```python
            base_file_url=DefaultValue.get_value(self._base_file_url),
            private_key=DefaultValue.get_value(self._private_key),
            private_key_password=DefaultValue.get_value(self._private_key_password),
            defaults=DefaultValue.get_value(self._defaults),
            arbitrary_callback_data=DefaultValue.get_value(self._arbitrary_callback_data),
            request=self._build_request(get_updates=False),
            get_updates_request=self._build_request(get_updates=True),
            rate_limiter=DefaultValue.get_value(self._rate_limiter),
            local_mode=DefaultValue.get_value(self._local_mode),
        )

```

#### Фрейм 5
- **Файл:** `telegram\ext\_applicationbuilder.py`
- **Строка:** 286
- **Функция:** `build`
- **Контекст кода:**

```python
        job_queue = DefaultValue.get_value(self._job_queue)
        persistence = DefaultValue.get_value(self._persistence)
        # If user didn't set updater
        if isinstance(self._updater, DefaultValue) or self._updater is None:
            if isinstance(self._bot, DefaultValue):  # and didn't set a bot
                bot: Bot = self._build_ext_bot()  # build a bot
            else:
                bot = self._bot
            # now also build an updater/update_queue for them
            update_queue = DefaultValue.get_value(self._update_queue)

```

#### Фрейм 4
- **Файл:** `bot.py`
- **Строка:** 143
- **Функция:** `run_bot`
- **Контекст кода:**

```python
    app = (
        Application.builder()
        .token(BOT_TOKEN)
        .post_init(post_init)
        .post_shutdown(post_shutdown)
        .build()
    )

    register_auth_handlers(app)
    register_expeditor_handlers(app)
    register_agent_handlers(app)
```

#### Фрейм 3
- **Файл:** `bot.py`
- **Строка:** 156
- **Функция:** `<module>`
- **Контекст кода:**

```python
    logger.info("Bot handlers registered. Starting polling...")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    run_bot()
```

#### Фрейм 2
- **Файл:** `<frozen runpy>`
- **Строка:** 88
- **Функция:** `_run_code`
- **Контекст кода:**

```python
```

#### Фрейм 1
- **Файл:** `<frozen runpy>`
- **Строка:** 198
- **Функция:** `_run_module_as_main`
- **Контекст кода:**

```python
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
  "mechanism": "excepthook",
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