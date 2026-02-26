# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** ai_realty  
**ID Ошибки:** 7277080697  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7277080697/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
DBAPIError: (sqlalchemy.dialects.postgresql.asyncpg.Error) <class 'asyncpg.exceptions.DataError'>: invalid input for query argument $2: 15 (expected str, got int)

**Тип исключения:** TypeError  
**Сообщение об ошибке:** expected str, got int  

**Статистика:**
- Кол-во возникновений: **4**
- Первое появление: 2026-02-19T17:12:09Z
- Последнее появление: 2026-02-19T17:16:44Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`asyncpg/pgproto/codecs/text.pyx:12`
в функции: `asyncpg.pgproto.pgproto.as_pg_string_and_size`

### Полный стектрейс:

#### Фрейм 5
- **Файл:** `asyncpg/pgproto/codecs/text.pyx`
- **Строка:** 12
- **Функция:** `asyncpg.pgproto.pgproto.as_pg_string_and_size`
- **Контекст кода:**

```python

cdef inline as_pg_string_and_size(
        CodecContext settings, obj, char **cstr, ssize_t *size):

    if not cpython.PyUnicode_Check(obj):
        raise TypeError('expected str, got {}'.format(type(obj).__name__))

    if settings.is_encoding_utf8():
        cstr[0] = <char*>cpythonx.PyUnicode_AsUTF8AndSize(obj, size)
    else:
        encoded = settings.get_text_codec().encode(obj)[0]
```

#### Фрейм 4
- **Файл:** `asyncpg/pgproto/codecs/text.pyx`
- **Строка:** 29
- **Функция:** `asyncpg.pgproto.pgproto.text_encode`
- **Контекст кода:**

```python
cdef text_encode(CodecContext settings, WriteBuffer buf, obj):
    cdef:
        char *str
        ssize_t size

    as_pg_string_and_size(settings, obj, &str, &size)

    buf.write_int32(<int32_t>size)
    buf.write_cstr(str, size)


```

#### Фрейм 3
- **Файл:** `asyncpg/protocol/codecs/base.pyx`
- **Строка:** 153
- **Функция:** `asyncpg.protocol.protocol.Codec.encode_scalar`
- **Контекст кода:**

```python

        return codec

    cdef encode_scalar(self, ConnectionSettings settings, WriteBuffer buf,
                       object obj):
        self.c_encoder(settings, buf, obj)

    cdef encode_array(self, ConnectionSettings settings, WriteBuffer buf,
                      object obj):
        array_encode(settings, buf, obj, self.element_codec.oid,
                     codec_encode_func_ex,
```

#### Фрейм 2
- **Файл:** `asyncpg/protocol/codecs/base.pyx`
- **Строка:** 251
- **Функция:** `asyncpg.protocol.protocol.Codec.encode`
- **Контекст кода:**

```python
            raise exceptions.InternalClientError(
                'unexpected exchange format: {}'.format(self.xformat))

    cdef encode(self, ConnectionSettings settings, WriteBuffer buf,
                object obj):
        return self.encoder(self, settings, buf, obj)

    cdef decode_scalar(self, ConnectionSettings settings, FRBuffer *buf):
        return self.c_decoder(settings, buf)

    cdef decode_array(self, ConnectionSettings settings, FRBuffer *buf):
```

#### Фрейм 1
- **Файл:** `asyncpg/protocol/prepared_stmt.pyx`
- **Строка:** 175
- **Функция:** `asyncpg.protocol.protocol.PreparedStatementState._encode_bind_msg`
- **Контекст кода:**

```python
            if arg is None:
                writer.write_int32(-1)
            else:
                codec = <Codec>(self.args_codecs[idx])
                try:
                    codec.encode(self.settings, writer, arg)
                except (AssertionError, exceptions.InternalClientError):
                    # These are internal errors and should raise as-is.
                    raise
                except exceptions.InterfaceError as e:
                    # This is already a descriptive error, but annotate
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
  "browser": "Microsoft Edge 145",
  "browser.name": "Microsoft Edge",
  "client_os": "Windows",
  "client_os.name": "Windows",
  "environment": "development",
  "handled": "no",
  "level": "error",
  "mechanism": "starlette",
  "release": "f2c0939bf2b58cabba17541a6dcf8bd9a1bb805f",
  "runtime": "CPython 3.13.3",
  "runtime.name": "CPython",
  "server_name": "Sokol",
  "transaction": "/api/v1/auth/login",
  "url": "http://127.0.0.1:8002/api/v1/auth/login",
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