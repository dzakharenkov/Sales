"""
ÐÐ²Ñ‚Ð¾Ñ€Ð¸Ð·Ð°Ñ†Ð¸Ñ: /start, Ð²Ð²Ð¾Ð´ Ð»Ð¾Ð³Ð¸Ð½Ð°/Ð¿Ð°Ñ€Ð¾Ð»Ñ, Ð¿Ñ€Ð¾Ð²ÐµÑ€ÐºÐ° Ñ‚Ð¾ÐºÐµÐ½Ð°, Ð²Ñ‹Ñ…Ð¾Ð´.
"""
import logging

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
from telegram.ext import (
    ContextTypes, CommandHandler, MessageHandler, CallbackQueryHandler, ConversationHandler, filters,
)

from .sds_api import api, SDSApiError
from .session import (
    get_session, save_session, delete_session, touch_session,
    count_recent_failures, record_attempt, log_action, UserSession,
)
from .config import MAX_LOGIN_ATTEMPTS, LOGIN_BLOCK_MINUTES
from .helpers import ROLE_RU

logger = logging.getLogger(__name__)

# States
ASK_LOGIN, ASK_PASSWORD = range(2)


# ---------- Main menu ----------

def main_menu_keyboard(role: str) -> InlineKeyboardMarkup:
    role_lower = (role or "").lower()
    buttons = []
    if role_lower == "expeditor":
        buttons.append([InlineKeyboardButton("ðŸ—º ÐœÐ¾Ð¹ Ð¼Ð°Ñ€ÑˆÑ€ÑƒÑ‚", callback_data="exp_orders")])
        buttons.append([InlineKeyboardButton("ðŸ“¦ ÐœÐ¾Ð¸ Ð·Ð°ÐºÐ°Ð·Ñ‹ Ð½Ð° ÑÐµÐ³Ð¾Ð´Ð½Ñ", callback_data="exp_orders_today")])
        buttons.append([InlineKeyboardButton("âœ… Ð’Ñ‹Ð¿Ð¾Ð»Ð½ÐµÐ½Ð½Ñ‹Ðµ ÑÐµÐ³Ð¾Ð´Ð½Ñ", callback_data="exp_orders_done_today")])
        buttons.append([InlineKeyboardButton("ðŸ“Š ÐœÐ¾Ð¸ Ð¾ÑÑ‚Ð°Ñ‚ÐºÐ¸", callback_data="exp_my_stock")])
        buttons.append([InlineKeyboardButton("ðŸ’° ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ Ð¾Ð¿Ð»Ð°Ñ‚Ñƒ", callback_data="exp_payment")])
        buttons.append([InlineKeyboardButton("ðŸ’µ ÐŸÐ¾Ð»ÑƒÑ‡ÐµÐ½Ð½Ð°Ñ Ð¾Ð¿Ð»Ð°Ñ‚Ð°", callback_data="exp_received_payments")])
    elif role_lower == "agent":
        buttons.append([InlineKeyboardButton("ðŸ†• Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð²Ð¸Ð·Ð¸Ñ‚", callback_data="agent_create_visit")])
        buttons.append([InlineKeyboardButton("ðŸ“‹ ÐœÐ¾Ð¸ Ð²Ð¸Ð·Ð¸Ñ‚Ñ‹", callback_data="agent_visits")])
        buttons.append([InlineKeyboardButton("âž• Ð”Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð°", callback_data="agent_add_customer_v3")])
        buttons.append([InlineKeyboardButton("ðŸ“ ÐžÐ±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ Ð»Ð¾ÐºÐ°Ñ†Ð¸ÑŽ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð°", callback_data="agent_update_location")])
        buttons.append([InlineKeyboardButton("ðŸ“¸ Ð—Ð°Ð³Ñ€ÑƒÐ·Ð¸Ñ‚ÑŒ Ñ„Ð¾Ñ‚Ð¾ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð°", callback_data="agent_photo")])
        buttons.append([InlineKeyboardButton("ðŸ›’ Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð·Ð°ÐºÐ°Ð·", callback_data="agent_order")])
    else:
        # admin Ð¸ Ð´Ñ€. â€” Ð²ÑÐµ ÐºÐ½Ð¾Ð¿ÐºÐ¸
        buttons.append([InlineKeyboardButton("ðŸ—º ÐœÐ¾Ð¹ Ð¼Ð°Ñ€ÑˆÑ€ÑƒÑ‚", callback_data="exp_orders")])
        buttons.append([InlineKeyboardButton("ðŸ’° ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ Ð¾Ð¿Ð»Ð°Ñ‚Ñƒ", callback_data="exp_payment")])
        buttons.append([InlineKeyboardButton("ðŸ’µ ÐŸÐ¾Ð»ÑƒÑ‡ÐµÐ½Ð½Ð°Ñ Ð¾Ð¿Ð»Ð°Ñ‚Ð°", callback_data="exp_received_payments")])
        buttons.append([InlineKeyboardButton("ðŸ†• Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð²Ð¸Ð·Ð¸Ñ‚", callback_data="agent_create_visit")])
        buttons.append([InlineKeyboardButton("ðŸ“‹ ÐœÐ¾Ð¸ Ð²Ð¸Ð·Ð¸Ñ‚Ñ‹", callback_data="agent_visits")])
        buttons.append([InlineKeyboardButton("âž• Ð”Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð°", callback_data="agent_add_customer")])
        buttons.append([InlineKeyboardButton("ðŸ“¸ Ð—Ð°Ð³Ñ€ÑƒÐ·Ð¸Ñ‚ÑŒ Ñ„Ð¾Ñ‚Ð¾ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð°", callback_data="agent_photo")])
        buttons.append([InlineKeyboardButton("ðŸ›’ Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ Ð·Ð°ÐºÐ°Ð·", callback_data="agent_order")])
    buttons.append([InlineKeyboardButton("ðŸ‘¤ ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ", callback_data="profile")])
    buttons.append([InlineKeyboardButton("ðŸšª Ð’Ñ‹Ñ…Ð¾Ð´", callback_data="logout")])
    return InlineKeyboardMarkup(buttons)


async def show_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE, session: UserSession):
    role_ru = ROLE_RU.get(session.role, session.role)
    text = f"ðŸ  *Ð“Ð»Ð°Ð²Ð½Ð¾Ðµ Ð¼ÐµÐ½ÑŽ*\n\n{session.fio} ({role_ru})"
    kb = main_menu_keyboard(session.role)
    # Ð£Ð±Ð¸Ñ€Ð°ÐµÐ¼ reply-ÐºÐ»Ð°Ð²Ð¸Ð°Ñ‚ÑƒÑ€Ñƒ ÐµÑÐ»Ð¸ Ð±Ñ‹Ð»Ð°
    if update.callback_query:
        await update.callback_query.edit_message_text(text, reply_markup=kb, parse_mode="Markdown")
    else:
        await update.effective_message.reply_text(text, reply_markup=kb, parse_mode="Markdown")


# ---------- /start ----------

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    context.user_data.clear()
    session = await get_session(tg_id)

    if session:
        # ÐŸÑ€Ð¾Ð²ÐµÑ€ÑÐµÐ¼ Ñ‚Ð¾ÐºÐµÐ½
        try:
            user_data = await api.me(session.jwt_token)
            # ÐžÐ±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ Ñ€Ð¾Ð»ÑŒ ÐµÑÐ»Ð¸ Ð¸Ð·Ð¼ÐµÐ½Ð¸Ð»Ð°ÑÑŒ
            new_role = user_data.get("role", session.role)
            if new_role != session.role:
                session.role = new_role
                session.fio = user_data.get("fio", session.fio)
                await save_session(session)
                await update.message.reply_text(
                    f"âš ï¸ Ð’Ð°ÑˆÐ° Ñ€Ð¾Ð»ÑŒ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð° Ð½Ð°: {ROLE_RU.get(new_role, new_role)}"
                )
            await touch_session(tg_id)
            await show_main_menu(update, context, session)
            return ConversationHandler.END
        except SDSApiError as e:
            if e.status == 401:
                await delete_session(tg_id)
                await update.message.reply_text("Ð¡ÐµÑÑÐ¸Ñ Ð¸ÑÑ‚ÐµÐºÐ»Ð°. ÐÐ°Ð¶Ð¼Ð¸Ñ‚Ðµ /start Ð´Ð»Ñ Ð¿Ð¾Ð²Ñ‚Ð¾Ñ€Ð½Ð¾Ð¹ Ð°Ð²Ñ‚Ð¾Ñ€Ð¸Ð·Ð°Ñ†Ð¸Ð¸.")
                return ConversationHandler.END
            else:
                logger.warning("Token check failed: %s", e)
                await delete_session(tg_id)

    # ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ° Ð±Ð»Ð¾ÐºÐ¸Ñ€Ð¾Ð²ÐºÐ¸
    failures = await count_recent_failures(tg_id)
    if failures >= MAX_LOGIN_ATTEMPTS:
        await update.message.reply_text(
            f"â›” Ð¡Ð»Ð¸ÑˆÐºÐ¾Ð¼ Ð¼Ð½Ð¾Ð³Ð¾ Ð½ÐµÑƒÐ´Ð°Ñ‡Ð½Ñ‹Ñ… Ð¿Ð¾Ð¿Ñ‹Ñ‚Ð¾Ðº Ð²Ñ…Ð¾Ð´Ð°.\n"
            f"ÐŸÐ¾Ð´Ð¾Ð¶Ð´Ð¸Ñ‚Ðµ {LOGIN_BLOCK_MINUTES} Ð¼Ð¸Ð½ÑƒÑ‚ Ð¸ Ð¿Ð¾Ð¿Ñ€Ð¾Ð±ÑƒÐ¹Ñ‚Ðµ ÑÐ½Ð¾Ð²Ð°."
        )
        return ConversationHandler.END

    # ÐÐµ Ð°Ð²Ñ‚Ð¾Ñ€Ð¸Ð·Ð¾Ð²Ð°Ð½
    await update.message.reply_text(
        "ðŸ‘‹ Ð”Ð¾Ð±Ñ€Ð¾ Ð¿Ð¾Ð¶Ð°Ð»Ð¾Ð²Ð°Ñ‚ÑŒ Ð² *Ð±Ð¾Ñ‚ ÑÐ¸ÑÑ‚ÐµÐ¼Ñ‹ ÑƒÐ¿Ñ€Ð°Ð²Ð»ÐµÐ½Ð¸Ñ Ð¿Ñ€Ð¾Ð´Ð°Ð¶Ð°Ð¼Ð¸ Ð¸ Ð´Ð¸ÑÑ‚Ñ€Ð¸Ð±ÑƒÑ†Ð¸ÐµÐ¹*!\n\n"
        "Ð”Ð»Ñ Ð½Ð°Ñ‡Ð°Ð»Ð° Ñ€Ð°Ð±Ð¾Ñ‚Ñ‹ Ð½ÐµÐ¾Ð±Ñ…Ð¾Ð´Ð¸Ð¼Ð¾ Ð°Ð²Ñ‚Ð¾Ñ€Ð¸Ð·Ð¾Ð²Ð°Ñ‚ÑŒÑÑ.\n\n"
        "Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð²Ð°Ñˆ *Ð»Ð¾Ð³Ð¸Ð½*:",
        parse_mode="Markdown",
    )
    return ASK_LOGIN


async def ask_login(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # ÐžÐ±Ñ€Ð°Ð±Ð¾Ñ‚ÐºÐ° ÐºÐ½Ð¾Ð¿ÐºÐ¸ Â«ÐžÑ‚Ð¼ÐµÐ½Ð°Â»
    if update.message.text.strip() == "âŒ ÐžÑ‚Ð¼ÐµÐ½Ð°":
        await update.message.reply_text(
            "ÐÐ²Ñ‚Ð¾Ñ€Ð¸Ð·Ð°Ñ†Ð¸Ñ Ð¾Ñ‚Ð¼ÐµÐ½ÐµÐ½Ð°. ÐÐ°Ð¶Ð¼Ð¸Ñ‚Ðµ /start Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð½Ð°Ñ‡Ð°Ñ‚ÑŒ.",
            reply_markup=ReplyKeyboardRemove(),
        )
        return ConversationHandler.END

    login = update.message.text.strip()
    if not login:
        await update.message.reply_text("Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ Ð»Ð¾Ð³Ð¸Ð½:")
        return ASK_LOGIN

    context.user_data["login"] = login

    # Без промежуточного системного сообщения — сразу ожидаем пароль следующим сообщением.
    return ASK_PASSWORD


async def ask_password(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    text = update.message.text.strip()

    # ÐšÐ½Ð¾Ð¿ÐºÐ° Â«Ð˜Ð·Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð»Ð¾Ð³Ð¸Ð½Â»
    if text == "âœï¸ Ð˜Ð·Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð»Ð¾Ð³Ð¸Ð½":
        context.user_data.pop("login", None)
        await update.message.reply_text(
            "Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ *Ð»Ð¾Ð³Ð¸Ð½*:",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove(),
        )
        return ASK_LOGIN

    # ÐšÐ½Ð¾Ð¿ÐºÐ° Â«ÐžÑ‚Ð¼ÐµÐ½Ð°Â»
    if text == "âŒ ÐžÑ‚Ð¼ÐµÐ½Ð°":
        context.user_data.clear()
        await update.message.reply_text(
            "ÐÐ²Ñ‚Ð¾Ñ€Ð¸Ð·Ð°Ñ†Ð¸Ñ Ð¾Ñ‚Ð¼ÐµÐ½ÐµÐ½Ð°. ÐÐ°Ð¶Ð¼Ð¸Ñ‚Ðµ /start Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð½Ð°Ñ‡Ð°Ñ‚ÑŒ.",
            reply_markup=ReplyKeyboardRemove(),
        )
        return ConversationHandler.END

    password = text
    login = context.user_data.get("login", "")

    # ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ° Ð±Ð»Ð¾ÐºÐ¸Ñ€Ð¾Ð²ÐºÐ¸
    failures = await count_recent_failures(tg_id)
    if failures >= MAX_LOGIN_ATTEMPTS:
        await update.message.reply_text(
            f"â›” Ð¡Ð»Ð¸ÑˆÐºÐ¾Ð¼ Ð¼Ð½Ð¾Ð³Ð¾ Ð¿Ð¾Ð¿Ñ‹Ñ‚Ð¾Ðº. ÐŸÐ¾Ð´Ð¾Ð¶Ð´Ð¸Ñ‚Ðµ {LOGIN_BLOCK_MINUTES} Ð¼Ð¸Ð½ÑƒÑ‚.",
            reply_markup=ReplyKeyboardRemove(),
        )
        await log_action(tg_id, login, None, "login_blocked", f"failures={failures}")
        return ConversationHandler.END

    try:
        result = await api.login(login, password)
    except SDSApiError as e:
        await record_attempt(tg_id, False)
        await log_action(tg_id, login, None, "login_fail", e.detail, "error", e.detail)
        failures += 1
        remaining = MAX_LOGIN_ATTEMPTS - failures

        # Ð£Ð´Ð°Ð»Ð¸Ñ‚ÑŒ ÑÐ¾Ð¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ Ñ Ð¿Ð°Ñ€Ð¾Ð»ÐµÐ¼
        try:
            await update.message.delete()
        except Exception:
            pass

        if remaining <= 0:
            await update.effective_chat.send_message(
                f"âŒ ÐÐµÐ²ÐµÑ€Ð½Ñ‹Ðµ Ð´Ð°Ð½Ð½Ñ‹Ðµ. Ð’Ñ…Ð¾Ð´ Ð·Ð°Ð±Ð»Ð¾ÐºÐ¸Ñ€Ð¾Ð²Ð°Ð½ Ð½Ð° {LOGIN_BLOCK_MINUTES} Ð¼Ð¸Ð½.",
                reply_markup=ReplyKeyboardRemove(),
            )
            return ConversationHandler.END

        kb = ReplyKeyboardMarkup(
            [[KeyboardButton("âœï¸ Ð˜Ð·Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð»Ð¾Ð³Ð¸Ð½"), KeyboardButton("âŒ ÐžÑ‚Ð¼ÐµÐ½Ð°")]],
            resize_keyboard=True,
            one_time_keyboard=True,
        )
        await update.effective_chat.send_message(
            f"âŒ ÐÐµÐ²ÐµÑ€Ð½Ñ‹Ð¹ Ð»Ð¾Ð³Ð¸Ð½ Ð¸Ð»Ð¸ Ð¿Ð°Ñ€Ð¾Ð»ÑŒ.\n"
            f"ÐžÑÑ‚Ð°Ð»Ð¾ÑÑŒ Ð¿Ð¾Ð¿Ñ‹Ñ‚Ð¾Ðº: *{remaining}* Ð¸Ð· {MAX_LOGIN_ATTEMPTS}\n\n"
            f"Ð›Ð¾Ð³Ð¸Ð½: *{login}*\n"
            f"Ð’Ð²ÐµÐ´Ð¸Ñ‚Ðµ *Ð¿Ð°Ñ€Ð¾Ð»ÑŒ* Ð¸Ð»Ð¸ Ð½Ð°Ð¶Ð¼Ð¸Ñ‚Ðµ Â«âœï¸ Ð˜Ð·Ð¼ÐµÐ½Ð¸Ñ‚ÑŒ Ð»Ð¾Ð³Ð¸Ð½Â»:",
            parse_mode="Markdown",
            reply_markup=kb,
        )
        return ASK_PASSWORD

    # Ð£ÑÐ¿ÐµÑˆÐ½Ñ‹Ð¹ Ð²Ñ…Ð¾Ð´
    token = result.get("access_token", "")
    user = result.get("user", {})
    role = user.get("role", "agent")
    fio = user.get("fio", login)

    session = UserSession(
        telegram_user_id=tg_id,
        login=login,
        jwt_token=token,
        role=role,
        fio=fio,
    )
    await save_session(session)
    await record_attempt(tg_id, True)
    await log_action(tg_id, login, role, "login_success", f"fio={fio}")

    # Ð£Ð´Ð°Ð»Ð¸Ñ‚ÑŒ ÑÐ¾Ð¾Ð±Ñ‰ÐµÐ½Ð¸Ðµ Ñ Ð¿Ð°Ñ€Ð¾Ð»ÐµÐ¼ (Ð±ÐµÐ·Ð¾Ð¿Ð°ÑÐ½Ð¾ÑÑ‚ÑŒ)
    try:
        await update.message.delete()
    except Exception:
        pass

    # Ð£Ð±Ð¸Ñ€Ð°ÐµÐ¼ reply-ÐºÐ»Ð°Ð²Ð¸Ð°Ñ‚ÑƒÑ€Ñƒ Ð¸ Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°ÐµÐ¼ Ð¼ÐµÐ½ÑŽ
    await update.effective_chat.send_message(
        f"✅ Вход в систему SDS выполнен: {login}",
        reply_markup=ReplyKeyboardRemove(),
    )
    await show_main_menu(update, context, session)
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data.clear()
    await update.message.reply_text(
        "ÐÐ²Ñ‚Ð¾Ñ€Ð¸Ð·Ð°Ñ†Ð¸Ñ Ð¾Ñ‚Ð¼ÐµÐ½ÐµÐ½Ð°. ÐÐ°Ð¶Ð¼Ð¸Ñ‚Ðµ /start Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð½Ð°Ñ‡Ð°Ñ‚ÑŒ.",
        reply_markup=ReplyKeyboardRemove(),
    )
    return ConversationHandler.END


# ---------- Callbacks ----------

async def cb_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session = await get_session(q.from_user.id)
    if not session:
        await q.edit_message_text("Ð¡ÐµÑÑÐ¸Ñ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð°. ÐÐ°Ð¶Ð¼Ð¸Ñ‚Ðµ /start.")
        return
    await touch_session(q.from_user.id)
    await show_main_menu(update, context, session)


async def cb_profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session = await get_session(q.from_user.id)
    if not session:
        await q.edit_message_text("Ð¡ÐµÑÑÐ¸Ñ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð°. ÐÐ°Ð¶Ð¼Ð¸Ñ‚Ðµ /start.")
        return
    role_ru = ROLE_RU.get(session.role, session.role)

    # ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ Ñ€Ð°ÑÑˆÐ¸Ñ€ÐµÐ½Ð½ÑƒÑŽ Ð¸Ð½Ñ„Ð¾Ñ€Ð¼Ð°Ñ†Ð¸ÑŽ Ð¾ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ðµ
    phone = "â€”"
    email = "â€”"
    try:
        from .sds_api import api
        user_info = await api.get_current_user(session.jwt_token)
        phone = user_info.get("phone", "â€”") or "â€”"
        email = user_info.get("email", "â€”") or "â€”"
    except Exception:
        pass

    text = (
        f"ðŸ‘¤ *ÐŸÑ€Ð¾Ñ„Ð¸Ð»ÑŒ Ð¿Ð¾Ð»ÑŒÐ·Ð¾Ð²Ð°Ñ‚ÐµÐ»Ñ*\n\n"
        f"*Ð¤Ð˜Ðž:* {session.fio}\n"
        f"*Ð›Ð¾Ð³Ð¸Ð½:* {session.login}\n"
        f"*Ð Ð¾Ð»ÑŒ:* {role_ru}\n"
        f"*Ð¢ÐµÐ»ÐµÑ„Ð¾Ð½:* {phone}\n"
        f"*Email:* {email}\n"
    )
    kb = InlineKeyboardMarkup([[InlineKeyboardButton("â—€ï¸ ÐÐ°Ð·Ð°Ð´", callback_data="main_menu")]])
    await q.edit_message_text(text, reply_markup=kb, parse_mode="Markdown")


async def cb_logout(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("âœ… Ð”Ð°, Ð²Ñ‹Ð¹Ñ‚Ð¸", callback_data="logout_confirm")],
        [InlineKeyboardButton("â—€ï¸ ÐÐ°Ð·Ð°Ð´", callback_data="main_menu")],
    ])
    await q.edit_message_text("Ð’Ñ‹ Ð´ÐµÐ¹ÑÑ‚Ð²Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾ Ñ…Ð¾Ñ‚Ð¸Ñ‚Ðµ Ð²Ñ‹Ð¹Ñ‚Ð¸?", reply_markup=kb)


async def cb_logout_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id
    session = await get_session(tg_id)
    if session:
        await log_action(tg_id, session.login, session.role, "logout")
    await delete_session(tg_id)
    context.user_data.clear()
    await q.edit_message_text("ðŸ‘‹ Ð”Ð¾ ÑÐ²Ð¸Ð´Ð°Ð½Ð¸Ñ!\n\nÐ”Ð»Ñ Ð²Ñ…Ð¾Ð´Ð° Ð½Ð°Ð¶Ð¼Ð¸Ñ‚Ðµ /start.")


# ---------- Register ----------

def register_auth_handlers(app):
    conv = ConversationHandler(
        entry_points=[CommandHandler("start", cmd_start)],
        states={
            ASK_LOGIN: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_login)],
            ASK_PASSWORD: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_password)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )
    app.add_handler(conv)
    app.add_handler(CallbackQueryHandler(cb_main_menu, pattern="^main_menu$"))
    app.add_handler(CallbackQueryHandler(cb_profile, pattern="^profile$"))
    app.add_handler(CallbackQueryHandler(cb_logout, pattern="^logout$"))
    app.add_handler(CallbackQueryHandler(cb_logout_confirm, pattern="^logout_confirm$"))
