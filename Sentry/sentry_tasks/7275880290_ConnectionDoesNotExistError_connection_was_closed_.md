# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7275880290  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7275880290/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
ConnectionDoesNotExistError: connection was closed in the middle of operation

**Тип исключения:** OSError  
**Сообщение об ошибке:** [WinError 121] The semaphore timeout period has expired  

**Статистика:**
- Кол-во возникновений: **2**
- Первое появление: 2026-02-19T07:40:23Z
- Последнее появление: 2026-02-19T09:49:05Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`asyncio\windows_events.py:463`
в функции: `finish_socket_func`

### Полный стектрейс:

#### Фрейм 3
- **Файл:** `asyncio\windows_events.py`
- **Строка:** 463
- **Функция:** `finish_socket_func`
- **Контекст кода:**

```python
        return fut

    @staticmethod
    def finish_socket_func(trans, key, ov):
        try:
            return ov.getresult()
        except OSError as exc:
            if exc.winerror in (_overlapped.ERROR_NETNAME_DELETED,
                                _overlapped.ERROR_OPERATION_ABORTED):
                raise ConnectionResetError(*exc.args)
            else:
```

#### Фрейм 2
- **Файл:** `asyncio\windows_events.py`
- **Строка:** 804
- **Функция:** `_poll`
- **Контекст кода:**

```python
                f.cancel()
            # Don't call the callback if _register() already read the result or
            # if the overlapped has been cancelled
            elif not f.done():
                try:
                    value = callback(transferred, key, ov)
                except OSError as e:
                    f.set_exception(e)
                    self._results.append(f)
                else:
                    f.set_result(value)
```

#### Фрейм 1
- **Файл:** `asyncio\proactor_events.py`
- **Строка:** 286
- **Функция:** `_loop_reading`
- **Контекст кода:**

```python
                assert self._read_fut is fut or (self._read_fut is None and
                                                 self._closing)
                self._read_fut = None
                if fut.done():
                    # deliver data later in "finally" clause
                    length = fut.result()
                    if length == 0:
                        # we got end-of-file so no need to reschedule a new read
                        return

                    # It's a new slice so make it immutable so protocols upstream don't have problems
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