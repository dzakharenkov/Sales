# 🐛 Задача: Исправить ошибку

## Общая информация

**Проект:** sales  
**ID Ошибки:** 7278663074  
**Ссылка в Sentry:** https://zakharenkov.sentry.io/issues/7278663074/  
**Статус:** ❌ НЕ ИСПРАВЛЕНО  

---

## Описание проблемы

**Название ошибки:**
AttributeError: 'str' object has no attribute 'get'

**Тип исключения:** AttributeError  
**Сообщение об ошибке:** 'str' object has no attribute 'get'  

**Статистика:**
- Кол-во возникновений: **23**
- Первое появление: 2026-02-20T07:41:35Z
- Последнее появление: 2026-02-24T06:16:02Z
- Серьёзность: **ERROR**

---

## Стектрейс (Stack Trace)

### Основная строка ошибки:
`src/telegram_bot/handlers_expeditor.py:104`
в функции: `_get_paid_order_ids`

### Полный стектрейс:

#### Фрейм 4
- **Файл:** `src/telegram_bot/handlers_expeditor.py`
- **Строка:** 104
- **Функция:** `_get_paid_order_ids`
- **Контекст кода:**

```python
    except SDSApiError:
        return set()

    paid_order_ids: set[int] = set()
    for op in (operations or []):
        status = (op.get("status") or "").strip().lower()
        if status in ("cancelled", "canceled"):
            continue
        order_id = op.get("order_id")
        if order_id is None:
            continue
```

#### Фрейм 3
- **Файл:** `src/telegram_bot/handlers_expeditor.py`
- **Строка:** 702
- **Функция:** `cb_exp_payment`
- **Контекст кода:**

```python
    all_orders = data if isinstance(data, list) else (data.get("orders") or data.get("data") or [])
    pay_orders = [
        o for o in all_orders
        if o.get("status_code") in ("delivery", "completed")
    ]
    paid_order_ids = await _get_paid_order_ids(token, session.login)
    pay_orders = [o for o in pay_orders if int(o.get("order_no") or 0) not in paid_order_ids]

    if not pay_orders:
        lbl_title = await t(update, context, "telegram.expeditor.receive_payment", fallback="Получить оплату")
        lbl_no_orders = await t(update, context, "telegram.expeditor.no_orders_for_payment", fallback="Нет заказов, ожидающих оплаты (без уже оплаченных).")
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