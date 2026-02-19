# Task: Real-time Telegram Notifications

**Task ID:** 020
**Category:** Feature
**Priority:** MEDIUM
**Status:** NOT STARTED
**Estimated Time:** 4 hours
**Dependencies:** 009 (settings), 012 (expeditor bot handlers), 007 (response schemas)

---

## Description

Currently there's no way for the system to proactively notify users of important events. When an agent creates a new order, the expeditor doesn't know about it. When an order status changes, the customer's agent isn't notified. Implement push notifications via Telegram for key business events.

---

## Acceptance Criteria

- [x] New order created â†’ assigned expeditor receives Telegram notification
- [x] Order status changed to "delivery" â†’ agent who created it receives notification
- [x] Order status changed to "completed" â†’ agent receives delivery confirmation
- [x] New customer visit created â†’ responsible person notified (if they have Telegram)
- [x] Notifications are sent asynchronously (don't block the API response)
- [x] Users without a linked Telegram account skip notification gracefully
- [x] Notifications include relevant details (order number, customer name, amount)
- [x] Notification can be disabled per user via settings (future feature flag)

---

## Technical Details

### Notification Service (`src/core/notifications.py`)

```python
from telegram import Bot
from loguru import logger
from src.core.config import settings

# Reuse the bot instance
_bot: Bot | None = None

def get_bot() -> Bot:
    global _bot
    if _bot is None:
        _bot = Bot(token=settings.telegram_bot_token)
    return _bot


async def send_notification(telegram_username: str, message: str) -> bool:
    """
    Send a Telegram notification to a user by username.
    Returns True if sent successfully, False otherwise.

    Note: Requires the user to have previously started the bot
    (we need their chat_id, not just username).
    """
    try:
        # Lookup chat_id from sessions table (stored when user starts bot)
        # See schema: telegram_sessions table
        from src.database.connection import async_session
        from sqlalchemy import text

        async with async_session() as db:
            result = await db.execute(
                text('SELECT chat_id FROM "Sales".telegram_sessions WHERE telegram_username = :username'),
                {"username": telegram_username}
            )
            row = result.fetchone()

        if not row:
            logger.debug(f"No Telegram session for {telegram_username!r}, skipping notification")
            return False

        bot = get_bot()
        await bot.send_message(chat_id=row.chat_id, text=message, parse_mode="HTML")
        logger.info(f"Notification sent to {telegram_username}")
        return True

    except Exception as e:
        logger.warning(f"Failed to send notification to {telegram_username}: {e}")
        return False


async def notify_new_order(order: dict, expeditor_username: str | None):
    """Notify expeditor about a new order."""
    if not expeditor_username:
        return

    message = (
        f"ðŸ“¦ <b>ÐÐ¾Ð²Ñ‹Ð¹ Ð·Ð°ÐºÐ°Ð· #{order['order_no']}</b>\n"
        f"ðŸ‘¤ ÐšÐ»Ð¸ÐµÐ½Ñ‚: {order['customer_name']}\n"
        f"ðŸ’° Ð¡ÑƒÐ¼Ð¼Ð°: {order['total_amount']:,.0f} ÑÑžÐ¼\n"
        f"ðŸ“… ÐŸÐ»Ð°Ð½Ð¾Ð²Ð°Ñ Ð´Ð¾ÑÑ‚Ð°Ð²ÐºÐ°: {order.get('scheduled_delivery_at', 'Ð½Ðµ ÑƒÐºÐ°Ð·Ð°Ð½Ð°')}"
    )
    await send_notification(expeditor_username, message)


async def notify_order_status_changed(order: dict, agent_username: str | None, new_status: str):
    """Notify agent when order status changes."""
    if not agent_username:
        return

    status_messages = {
        "delivery": f"ðŸšš Ð—Ð°ÐºÐ°Ð· #{order['order_no']} Ð¿ÐµÑ€ÐµÐ´Ð°Ð½ Ð² Ð´Ð¾ÑÑ‚Ð°Ð²ÐºÑƒ",
        "completed": f"âœ… Ð—Ð°ÐºÐ°Ð· #{order['order_no']} Ð´Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ñƒ {order['customer_name']}",
        "cancelled": f"âŒ Ð—Ð°ÐºÐ°Ð· #{order['order_no']} Ð¾Ñ‚Ð¼ÐµÐ½Ñ‘Ð½",
    }

    message_prefix = status_messages.get(new_status, f"ðŸ“‹ Ð¡Ñ‚Ð°Ñ‚ÑƒÑ Ð·Ð°ÐºÐ°Ð·Ð° #{order['order_no']} Ð¸Ð·Ð¼ÐµÐ½Ñ‘Ð½ Ð½Ð°: {new_status}")
    message = f"{message_prefix}\nðŸ’° Ð¡ÑƒÐ¼Ð¼Ð°: {order['total_amount']:,.0f} ÑÑžÐ¼"

    await send_notification(agent_username, message)
```

### Store chat_id in Sessions Table

```python
# In handlers_auth.py â€” when user logs in via bot:
async def authenticated_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_user.id
    username = update.effective_user.username
    user_login = context.user_data["login"]

    # Save chat_id for future notifications
    async with async_session() as db:
        await db.execute(
            text("""
                INSERT INTO "Sales".telegram_sessions (login, chat_id, telegram_username, last_seen)
                VALUES (:login, :chat_id, :username, NOW())
                ON CONFLICT (login) DO UPDATE
                SET chat_id = :chat_id, telegram_username = :username, last_seen = NOW()
            """),
            {"login": user_login, "chat_id": chat_id, "username": username}
        )
        await db.commit()
```

### Integrate into Order Endpoints

```python
# src/api/v1/routers/orders.py
import asyncio
from src.core.notifications import notify_new_order, notify_order_status_changed

@router.post("/orders", status_code=201)
async def create_order(body: OrderCreate, db = Depends(get_db), current_user = Depends(get_current_user)):
    # Create order
    order = await _create_order_in_db(body, db, current_user)

    # Get expeditor's Telegram username
    expeditor = await _get_user(db, order.get("login_expeditor"))
    expeditor_username = expeditor.get("telegram_username") if expeditor else None

    # Send notification asynchronously (don't await â€” fire and forget)
    if expeditor_username:
        asyncio.create_task(notify_new_order(order, expeditor_username))

    return order


@router.put("/orders/{order_no}")
async def update_order(order_no: int, body: OrderUpdate, db = Depends(get_db), current_user = Depends(get_current_user)):
    old_order = await _get_order(db, order_no)
    updated_order = await _update_order_in_db(body, db, current_user)

    # Notify if status changed
    if body.status_code and body.status_code != old_order["status_code"]:
        agent = await _get_user(db, old_order.get("login_agent"))
        agent_username = agent.get("telegram_username") if agent else None
        if agent_username:
            asyncio.create_task(
                notify_order_status_changed(updated_order, agent_username, body.status_code)
            )

    return updated_order
```

### Telegram Sessions Table (verify migration exists)

```sql
-- Should exist from migrations/add_telegram_tables.sql:
CREATE TABLE IF NOT EXISTS "Sales".telegram_sessions (
    login VARCHAR(100) PRIMARY KEY REFERENCES "Sales".users(login),
    chat_id BIGINT NOT NULL,
    telegram_username VARCHAR(100),
    last_seen TIMESTAMP DEFAULT NOW()
);
```

---

## Testing Requirements

- Create order assigned to expeditor who has bot session â†’ expeditor receives Telegram message within 5 seconds
- Create order with no expeditor â†’ no error, no notification sent
- Update order status to "completed" â†’ agent receives "âœ… Ð—Ð°ÐºÐ°Ð· Ð´Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½" message
- Notification failure (bot blocked by user) â†’ API still returns success, error logged

---

## Related Documentation

- [ARCHITECTURE.md â€” Telegram Bot Architecture](../ARCHITECTURE.md)
- Task 012 (Expeditor bot handlers)
- Migration file: `migrations/add_telegram_tables.sql`

