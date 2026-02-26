# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7278662961  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7278662961/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
AttributeError: 'str' object has no attribute 'get'

**Тип исключения:** AttributeError  
**Сообщение об ошибке:** 'str' object has no attribute 'get'  

**Статистика:**
- Кол-во возникновений: **1**
- Первое появление: 2026-02-20T07:41:29Z
- Последнее появление: 2026-02-20T07:41:29Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`src\telegram_bot\handlers_expeditor.py:471`
в функции: `cb_exp_delivered`

### Полный стектрейс:

#### Фрейм 3
- **Файл:** `src\telegram_bot\handlers_expeditor.py`
- **Строка:** 471
- **Функция:** `cb_exp_delivered`
- **Контекст кода:**

```python
            return

        existing_ops = await api.get_operations(token, type_code="delivery", created_by=session.login)
        existing_for_order = [
            op for op in (existing_ops or [])
            if int(op.get("order_id") or 0) == order_no
            and (op.get("status") or "").strip().lower() not in ("cancelled", "canceled")
        ]
        if existing_for_order:
            await q.edit_message_text(
                f"ℹ️ По заказу №{order_no} уже есть операции «Доставка клиенту».\n"
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
  "logger": "__main__",
  "mechanism": "logging",
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