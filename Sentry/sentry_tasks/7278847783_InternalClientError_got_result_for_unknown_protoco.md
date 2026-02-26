# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7278847783  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7278847783/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
InternalClientError: got result for unknown protocol state 3

**Тип исключения:** InternalClientError  
**Сообщение об ошибке:** got result for unknown protocol state 3  

**Статистика:**
- Кол-во возникновений: **2**
- Первое появление: 2026-02-20T09:11:58Z
- Последнее появление: 2026-02-20T09:17:46Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`asyncpg/protocol/protocol.pyx:892`
в функции: `asyncpg.protocol.protocol.BaseProtocol._dispatch_result`

### Полный стектрейс:

#### Фрейм 1
- **Файл:** `asyncpg/protocol/protocol.pyx`
- **Строка:** 892
- **Функция:** `asyncpg.protocol.protocol.BaseProtocol._dispatch_result`
- **Контекст кода:**

```python
                # We are waiting for the connection to drop, so
                # ignore any stray results at this point.
                pass

            else:
                raise apg_exc.InternalClientError(
                    'got result for unknown protocol state {}'.
                    format(self.state))

        except Exception as exc:
            waiter.set_exception(exc)
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
  "logger": "asyncio",
  "mechanism": "logging",
  "release": "285e370809ffe979ece7fa65865b10a7c65bd245",
  "runtime": "CPython 3.13.3",
  "runtime.name": "CPython",
  "server_name": "sales-api"
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