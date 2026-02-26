# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7282307740  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7282307740/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
UnicodeEncodeError: 'charmap' codec can't encode character '\u2705' in position 204: character maps to <undefined>

**Тип исключения:** UnicodeEncodeError  
**Сообщение об ошибке:** 'charmap' codec can't encode character '\u2705' in position 204: character maps to <undefined>  

**Статистика:**
- Кол-во возникновений: **1**
- Первое появление: 2026-02-21T16:06:10Z
- Последнее появление: 2026-02-21T16:06:10Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`encodings\cp1252.py:19`
в функции: `encode`

### Полный стектрейс:

#### Фрейм 6
- **Файл:** `encodings\cp1252.py`
- **Строка:** 19
- **Функция:** `encode`
- **Контекст кода:**

```python
    def decode(self,input,errors='strict'):
        return codecs.charmap_decode(input,errors,decoding_table)

class IncrementalEncoder(codecs.IncrementalEncoder):
    def encode(self, input, final=False):
        return codecs.charmap_encode(input,self.errors,encoding_table)[0]

class IncrementalDecoder(codecs.IncrementalDecoder):
    def decode(self, input, final=False):
        return codecs.charmap_decode(input,self.errors,decoding_table)[0]

```

#### Фрейм 5
- **Файл:** `<stdin>`
- **Строка:** 45
- **Функция:** `main`
- **Контекст кода:**

```python
```

#### Фрейм 4
- **Файл:** `asyncio\base_events.py`
- **Строка:** 719
- **Функция:** `run_until_complete`
- **Контекст кода:**

```python
        finally:
            future.remove_done_callback(_run_until_complete_cb)
        if not future.done():
            raise RuntimeError('Event loop stopped before Future completed.')

        return future.result()

    def stop(self):
        """Stop running the event loop.

        Every callback already scheduled will still run.  This simply informs
```

#### Фрейм 3
- **Файл:** `asyncio\runners.py`
- **Строка:** 118
- **Функция:** `run`
- **Контекст кода:**

```python
        else:
            sigint_handler = None

        self._interrupt_count = 0
        try:
            return self._loop.run_until_complete(task)
        except exceptions.CancelledError:
            if self._interrupt_count > 0:
                uncancel = getattr(task, "uncancel", None)
                if uncancel is not None and uncancel() == 0:
                    raise KeyboardInterrupt()
```

#### Фрейм 2
- **Файл:** `asyncio\runners.py`
- **Строка:** 195
- **Функция:** `run`
- **Контекст кода:**

```python
        # fail fast with short traceback
        raise RuntimeError(
            "asyncio.run() cannot be called from a running event loop")

    with Runner(debug=debug, loop_factory=loop_factory) as runner:
        return runner.run(main)


def _cancel_all_tasks(loop):
    to_cancel = tasks.all_tasks(loop)
    if not to_cancel:
```

#### Фрейм 1
- **Файл:** `<stdin>`
- **Строка:** 47
- **Функция:** `<module>`
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