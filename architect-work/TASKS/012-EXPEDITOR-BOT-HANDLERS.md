# Task: Complete Expeditor Telegram Bot Handlers

**Task ID:** 012
**Category:** Feature
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 8 hours
**Dependencies:** 009 (settings), 007 (response schemas help with API client)

---

## Description

The file `src/telegram_bot/handlers_expeditor.py` exists but its implementation completeness is unclear. Expeditors are a key user role — they handle delivery routes, confirm deliveries, and manage warehouse operations. This task ensures the expeditor bot flow is complete and production-ready.

**Expeditor responsibilities:**
- View today's delivery route (orders with delivery status)
- Confirm deliveries to customers
- Create warehouse operations (allocation, shipment)
- View stock levels
- View assigned customers/visits

---

## Acceptance Criteria

- [x] Expeditor can log in via Telegram bot
- [x] Expeditor sees role-appropriate main menu after login
- [x] "Мой маршрут" (My Route) — shows today's scheduled deliveries sorted by customer
- [x] "Подтвердить доставку" (Confirm Delivery) — step-by-step confirmation of order delivery
- [x] "Остатки склада" (Stock Levels) — view current warehouse stock
- [x] "Создать операцию" (Create Operation) — create warehouse operation (allocation/shipment)
- [x] "Визиты" (Visits) — view and create visits to customers
- [x] All bot messages use Russian language
- [x] Error messages are user-friendly (no technical details)
- [x] All conversation flows have a "Назад" (Back) button and "Отмена" (Cancel) option
- [x] Handler properly cleans up conversation state on completion or cancellation

---

## Technical Details

### Conversation State Machine for Expeditor

```python
# States
class ExpeditorState:
    MAIN_MENU = "expeditor_main"
    VIEW_ROUTE = "expeditor_route"
    CONFIRM_DELIVERY_SELECT = "expeditor_delivery_select"
    CONFIRM_DELIVERY_CONFIRM = "expeditor_delivery_confirm"
    VIEW_STOCK = "expeditor_stock"
    CREATE_OPERATION_TYPE = "expeditor_op_type"
    CREATE_OPERATION_WAREHOUSE = "expeditor_op_warehouse"
    CREATE_OPERATION_PRODUCT = "expeditor_op_product"
    CREATE_OPERATION_QUANTITY = "expeditor_op_quantity"
    CREATE_OPERATION_CONFIRM = "expeditor_op_confirm"
```

### Main Menu Handler

```python
async def show_expeditor_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("🗺 Мой маршрут", callback_data="exp:route")],
        [InlineKeyboardButton("✅ Подтвердить доставку", callback_data="exp:delivery")],
        [InlineKeyboardButton("📦 Остатки склада", callback_data="exp:stock")],
        [InlineKeyboardButton("⚙️ Создать операцию", callback_data="exp:operation")],
        [InlineKeyboardButton("📋 Визиты", callback_data="exp:visits")],
        [InlineKeyboardButton("🚪 Выйти", callback_data="exp:logout")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    text = f"👋 Привет, {context.user_data['fio']}!\n\n📌 Выберите действие:"
    await update.callback_query.edit_message_text(text, reply_markup=reply_markup)
```

### Route View Handler

```python
async def show_expeditor_route(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show today's delivery orders for this expeditor."""
    token = context.user_data["token"]
    today = datetime.now(tz=TIMEZONE).strftime("%Y-%m-%d")

    try:
        orders = await api.get_orders(
            token=token,
            delivery_date=today,
            expeditor=context.user_data["login"],
            status="delivery",
        )
    except SDSApiError as e:
        await update.callback_query.answer(f"Ошибка: {e.message}")
        return

    if not orders:
        text = f"📭 На {fmt_date(today)} нет плановых доставок."
    else:
        text = f"🗺 Маршрут на {fmt_date(today)} — {len(orders)} заказов:\n\n"
        for i, order in enumerate(orders, 1):
            text += (
                f"{i}. #{order['order_no']} — {order['customer_name']}\n"
                f"   📍 {order.get('address', 'адрес не указан')}\n"
                f"   💰 {fmt_money(order['total_amount'])}\n\n"
            )

    keyboard = [[InlineKeyboardButton("◀️ Назад", callback_data="exp:menu")]]
    await update.callback_query.edit_message_text(
        text, reply_markup=InlineKeyboardMarkup(keyboard)
    )
```

### Delivery Confirmation Flow

```python
async def start_confirm_delivery(update, context):
    """Step 1: Show list of orders to confirm."""
    token = context.user_data["token"]
    orders = await api.get_orders(token=token, status="delivery", ...)

    buttons = []
    for order in orders:
        label = f"#{order['order_no']} — {order['customer_name'][:20]}"
        buttons.append([InlineKeyboardButton(label, callback_data=f"exp:conf:{order['order_no']}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="exp:menu")])

    await update.callback_query.edit_message_text(
        "✅ Выберите заказ для подтверждения доставки:",
        reply_markup=InlineKeyboardMarkup(buttons)
    )


async def confirm_delivery_selected(update, context):
    """Step 2: Show order details and confirm button."""
    order_no = int(update.callback_query.data.split(":")[2])
    token = context.user_data["token"]
    order = await api.get_order(token=token, order_no=order_no)

    items_text = "\n".join(
        f"  • {item['product_name']}: {item['quantity']} шт."
        for item in order["items"]
    )

    text = (
        f"📦 Заказ #{order['order_no']}\n"
        f"👤 Клиент: {order['customer_name']}\n"
        f"📍 Адрес: {order.get('address', '—')}\n"
        f"💰 Сумма: {fmt_money(order['total_amount'])}\n\n"
        f"Товары:\n{items_text}\n\n"
        f"❓ Подтвердить доставку?"
    )

    keyboard = [
        [InlineKeyboardButton("✅ Подтвердить", callback_data=f"exp:conf_ok:{order_no}")],
        [InlineKeyboardButton("❌ Отмена", callback_data="exp:delivery")],
    ]
    await update.callback_query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(keyboard))


async def confirm_delivery_done(update, context):
    """Step 3: Update order status to completed."""
    order_no = int(update.callback_query.data.split(":")[2])
    token = context.user_data["token"]

    await api.update_order_status(token=token, order_no=order_no, status="completed")
    await update.callback_query.answer("✅ Доставка подтверждена!")
    await show_expeditor_menu(update, context)
```

### Register Handlers in `bot.py`

```python
from src.telegram_bot.handlers_expeditor import (
    show_expeditor_route,
    start_confirm_delivery,
    confirm_delivery_selected,
    confirm_delivery_done,
    show_stock,
    start_create_operation,
    # ...
)

# In application.add_handler():
application.add_handler(CallbackQueryHandler(show_expeditor_route, pattern="^exp:route$"))
application.add_handler(CallbackQueryHandler(start_confirm_delivery, pattern="^exp:delivery$"))
application.add_handler(CallbackQueryHandler(confirm_delivery_selected, pattern="^exp:conf:\\d+$"))
application.add_handler(CallbackQueryHandler(confirm_delivery_done, pattern="^exp:conf_ok:\\d+$"))
```

---

## Testing Requirements

- Log in as expeditor via Telegram — should see expeditor menu (not agent menu)
- "Мой маршрут" with no deliveries today — shows "нет плановых доставок" message
- "Мой маршрут" with deliveries — shows formatted order list
- Confirm delivery flow: select order → see details → confirm → order status changes to completed
- "Остатки склада" — shows current stock for expeditor's warehouse
- "Назад" button always returns to previous menu
- "Отмена" during any flow returns to main menu

---

## Related Documentation

- [ARCHITECTURE.md — Telegram Bot Architecture](../ARCHITECTURE.md)
- [TECHNICAL_DESIGN.md — Telegram Bot Architecture](../TECHNICAL_DESIGN.md)
- `src/telegram_bot/handlers_agent.py` — reference implementation for agent role
