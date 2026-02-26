# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7278663445  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7278663445/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
AttributeError: 'str' object has no attribute 'get'

**Тип исключения:** AttributeError  
**Сообщение об ошибке:** 'str' object has no attribute 'get'  

**Статистика:**
- Кол-во возникновений: **8**
- Первое появление: 2026-02-20T07:41:53Z
- Последнее появление: 2026-02-24T06:16:08Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`src/telegram_bot/handlers_expeditor.py:929`
в функции: `cb_exp_received_payments`

### Полный стектрейс:

#### Фрейм 3
- **Файл:** `src/telegram_bot/handlers_expeditor.py`
- **Строка:** 929
- **Функция:** `cb_exp_received_payments`
- **Контекст кода:**

```python
        return

    # Не показываем отменённые операции в блоке "Полученная оплата"
    visible_operations = [
        op for op in (operations or [])
        if (op.get("status") or "").strip().lower() not in ("cancelled", "canceled")
    ]

    lbl_title = await t(update, context, "telegram.expeditor.rcv_payment_title", fallback="Полученная оплата")
    if not visible_operations:
        lbl_no_ops = await t(update, context, "telegram.expeditor.no_operations", fallback="Нет операций получения оплаты от клиентов.")
```

#### Фрейм 2
- **Файл:** `telegram/ext/_handlers/basehandler.py`
- **Строка:** 158
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
- **Файл:** `telegram/ext/_application.py`
- **Строка:** 1343
- **Функция:** `process_update`
- **Контекст кода:**

```python
                                f":{handler}"
                            ),
                        )
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


Создано: 2026-02-24 21:00:51