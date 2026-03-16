"""Asynchronous Telegram notifications for key business events."""

from __future__ import annotations

import asyncio
import logging
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import text
from telegram import Bot

from src.core.config import settings
from src.database.connection import async_session

logger = logging.getLogger(__name__)

_bot: Bot | None = None
_user_notifications_column_exists: bool | None = None
_user_language_column_exists: bool | None = None


def get_bot() -> Bot:
    global _bot
    if _bot is None:
        _bot = Bot(token=settings.telegram_bot_token)
    return _bot


def schedule_notification(coro: asyncio.Future) -> None:
    task = asyncio.create_task(coro)

    def _done_callback(done_task: asyncio.Task) -> None:
        try:
            done_task.result()
        except Exception:
            logger.exception("Notification task failed")

    task.add_done_callback(_done_callback)


def _format_amount(value: Decimal | float | int | None) -> str:
    if value is None:
        return "—"
    try:
        amount = float(value)
    except (TypeError, ValueError):
        return "—"
    return f"{amount:,.0f} сум"


def _format_date(value: datetime | date | str | None) -> str:
    if value is None:
        return "не указана"
    if isinstance(value, datetime):
        return value.strftime("%d.%m.%Y %H:%M")
    if isinstance(value, date):
        return value.strftime("%d.%m.%Y")
    return str(value)


async def _has_notifications_enabled(login: str) -> bool:
    global _user_notifications_column_exists

    async with async_session() as session:
        if _user_notifications_column_exists is None:
            result = await session.execute(
                text(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'Sales'
                          AND table_name = 'users'
                          AND column_name = 'notifications_enabled'
                    )
                    """
                )
            )
            _user_notifications_column_exists = bool(result.scalar())

        if not _user_notifications_column_exists:
            return True

        row = await session.execute(
            text('SELECT COALESCE(notifications_enabled, TRUE) FROM "Sales".users WHERE login = :login'),
            {"login": login},
        )
        value = row.scalar()
        return bool(value) if value is not None else True


async def _resolve_chat_id(login: str) -> int | None:
    async with async_session() as session:
        row = await session.execute(
            text(
                """
                SELECT telegram_user_id
                FROM "Sales".telegram_sessions
                WHERE login = :login
                  AND last_activity_at >= now() - make_interval(mins => :ttl_minutes)
                ORDER BY last_activity_at DESC NULLS LAST
                LIMIT 1
                """
            ),
            {"login": login, "ttl_minutes": max(int(settings.telegram_session_ttl_minutes or 0), 1)},
        )
        chat_id = row.scalar()
        return int(chat_id) if chat_id is not None else None


async def send_notification(login: str | None, message: str) -> bool:
    if not login:
        return False
    if not settings.telegram_bot_token:
        logger.debug("Telegram token is empty, skip notification for %s", login)
        return False
    if not await _has_notifications_enabled(login):
        logger.debug("Notifications disabled for user %s", login)
        return False

    chat_id = await _resolve_chat_id(login)
    if chat_id is None:
        logger.debug("No Telegram session for user %s", login)
        return False

    try:
        await get_bot().send_message(chat_id=chat_id, text=message, parse_mode="HTML")
        logger.info("Notification sent to login=%s chat_id=%s", login, chat_id)
        return True
    except Exception:
        logger.warning("Failed to send Telegram notification to login=%s", login, exc_info=True)
        return False


async def notify_new_order(
    order_no: int,
    customer_name: str,
    total_amount: Decimal | float | int | None,
    scheduled_delivery_at: datetime | date | str | None,
    expeditor_login: str | None,
) -> bool:
    message = (
        f"📦 <b>Новый заказ #{order_no}</b>\n"
        f"👤 Клиент: {customer_name or '—'}\n"
        f"💰 Сумма: {_format_amount(total_amount)}\n"
        f"📅 Доставка: {_format_date(scheduled_delivery_at)}"
    )
    return await send_notification(expeditor_login, message)


async def notify_order_status_changed(
    order_no: int,
    customer_name: str,
    total_amount: Decimal | float | int | None,
    agent_login: str | None,
    new_status: str,
) -> bool:
    status_key = (new_status or "").strip().lower()
    if status_key in {"delivery", "2", "доставка"}:
        title = "🚚 Заказ передан в доставку"
    elif status_key in {"completed", "3", "доставлен"}:
        title = "✅ Заказ доставлен"
    else:
        title = f"📋 Статус заказа изменён: {new_status}"

    message = (
        f"{title}\n"
        f"🧾 Заказ: #{order_no}\n"
        f"👤 Клиент: {customer_name or '—'}\n"
        f"💰 Сумма: {_format_amount(total_amount)}"
    )
    return await send_notification(agent_login, message)


async def _get_user_language(login: str) -> str:
    global _user_language_column_exists
    async with async_session() as session:
        if _user_language_column_exists is None:
            result = await session.execute(
                text(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'Sales'
                          AND table_name = 'users'
                          AND column_name = 'language_code'
                    )
                    """
                )
            )
            _user_language_column_exists = bool(result.scalar())

        if not _user_language_column_exists:
            return "ru"

        row = await session.execute(
            text('SELECT language_code FROM "Sales".users WHERE login = :login'),
            {"login": login},
        )
        lang = row.scalar()
        if not lang or lang not in ["ru", "en", "uz"]:
            return "ru"
        return lang


async def _translate(key: str, lang: str, fallback: str, **kwargs) -> str:
    from src.database.connection import async_session
    from sqlalchemy import text
    async with async_session() as session:
        val = await session.scalar(
            text('SELECT translation_text FROM "Sales".translations WHERE translation_key = :k AND language_code = :l LIMIT 1'),
            {"k": key, "l": lang}
        )
    text_val = val if val else fallback
    if kwargs:
        try:
            return text_val.format(**kwargs)
        except Exception:
            pass
    return text_val


async def notify_new_visit(
    visit_id: int,
    customer_name: str,
    visit_date: date | datetime | str | None,
    responsible_login: str | None,
) -> bool:
    lang = await _get_user_language(responsible_login) if responsible_login else "ru"
    
    t_new = await _translate("telegram.visit_notify.new_visit", lang, f"📅 <b>Новый визит #{visit_id}</b>", id=visit_id)
    t_client = await _translate("telegram.visit_notify.client", lang, f"👤 Клиент: {customer_name or '—'}", client=customer_name or '—')
    t_date = await _translate("telegram.visit_notify.date", lang, f"🕒 Дата: {_format_date(visit_date)}", date=_format_date(visit_date))
    
    message = (
        f"{t_new}\n"
        f"{t_client}\n"
        f"{t_date}"
    )
    return await send_notification(responsible_login, message)
