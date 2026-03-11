"""Authentication and top-level menu handlers for Telegram bot."""

from __future__ import annotations

import logging

from telegram import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    ReplyKeyboardRemove,
    Update,
)
from telegram.ext import (
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

from .config import LOGIN_BLOCK_MINUTES, MAX_LOGIN_ATTEMPTS
from .i18n import detect_language, set_user_language, t
from .sds_api import SDSApiError, api
from .session import (
    UserSession,
    count_recent_failures,
    delete_session,
    get_session,
    log_action,
    record_attempt,
    save_session,
    touch_session,
)

logger = logging.getLogger(__name__)

ASK_LANGUAGE, ASK_LOGIN, ASK_PASSWORD = range(3)


async def _role_label(update: Update, context: ContextTypes.DEFAULT_TYPE, role: str) -> str:
    return await t(update, context, f"role.{(role or '').strip().lower() or 'agent'}")


async def _menu_button(update: Update, context: ContextTypes.DEFAULT_TYPE, key: str) -> InlineKeyboardButton:
    return InlineKeyboardButton(await t(update, context, key), callback_data=key)


AUTH_EDIT_LOGIN = "auth_edit_login"
AUTH_CANCEL = "auth_cancel"


def _language_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton("🇷🇺 RU", callback_data="setlang_ru"),
                InlineKeyboardButton("🇺🇿 UZ", callback_data="setlang_uz"),
                InlineKeyboardButton("🇬🇧 EN", callback_data="setlang_en"),
            ]
        ]
    )


async def main_menu_keyboard(update: Update, context: ContextTypes.DEFAULT_TYPE, role: str) -> InlineKeyboardMarkup:
    role_lower = (role or "").lower()
    buttons: list[list[InlineKeyboardButton]] = []

    if role_lower == "expeditor":
        buttons.extend(
            [
                [InlineKeyboardButton(await t(update, context, "telegram.button.route"), callback_data="exp_orders")],
                [
                    InlineKeyboardButton(
                        await t(update, context, "telegram.button.my_orders_today"),
                        callback_data="exp_orders_today",
                    )
                ],
                [
                    InlineKeyboardButton(
                        await t(update, context, "telegram.button.done_today"),
                        callback_data="exp_orders_done_today",
                    )
                ],
                [InlineKeyboardButton(await t(update, context, "telegram.button.my_stock"), callback_data="exp_my_stock")],
                [InlineKeyboardButton(await t(update, context, "telegram.button.get_payment"), callback_data="exp_payment")],
                [
                    InlineKeyboardButton(
                        await t(update, context, "telegram.button.received_payments"),
                        callback_data="exp_received_payments",
                    )
                ],
            ]
        )
    elif role_lower == "agent":
        buttons.extend(
            [
                [InlineKeyboardButton(await t(update, context, "telegram.button.create_visit"), callback_data="agent_create_visit")],
                [InlineKeyboardButton(await t(update, context, "telegram.button.my_visits"), callback_data="agent_visits")],
                [InlineKeyboardButton(await t(update, context, "telegram.button.add_customer"), callback_data="agent_add_customer_v3")],
                [
                    InlineKeyboardButton(
                        await t(update, context, "telegram.button.update_customer_location"),
                        callback_data="agent_update_location",
                    )
                ],
                [
                    InlineKeyboardButton(
                        await t(update, context, "telegram.button.upload_customer_photo"),
                        callback_data="agent_photo",
                    )
                ],
                [InlineKeyboardButton(await t(update, context, "telegram.button.create_order"), callback_data="agent_order")],
            ]
        )
    else:
        buttons.extend(
            [
                [InlineKeyboardButton(await t(update, context, "telegram.button.route"), callback_data="exp_orders")],
                [InlineKeyboardButton(await t(update, context, "telegram.button.get_payment"), callback_data="exp_payment")],
                [
                    InlineKeyboardButton(
                        await t(update, context, "telegram.button.received_payments"),
                        callback_data="exp_received_payments",
                    )
                ],
                [InlineKeyboardButton(await t(update, context, "telegram.button.create_visit"), callback_data="agent_create_visit")],
                [InlineKeyboardButton(await t(update, context, "telegram.button.my_visits"), callback_data="agent_visits")],
                [InlineKeyboardButton(await t(update, context, "telegram.button.add_customer"), callback_data="agent_add_customer_v3")],
                [
                    InlineKeyboardButton(
                        await t(update, context, "telegram.button.upload_customer_photo"),
                        callback_data="agent_photo",
                    )
                ],
                [InlineKeyboardButton(await t(update, context, "telegram.button.create_order"), callback_data="agent_order")],
            ]
        )

    buttons.append([InlineKeyboardButton(await t(update, context, "telegram.button.profile"), callback_data="profile")])
    buttons.append([InlineKeyboardButton(await t(update, context, "telegram.button.logout"), callback_data="logout")])
    return InlineKeyboardMarkup(buttons)


async def show_main_menu(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE,
    session: UserSession,
    *,
    force_reply: bool = False,
) -> None:
    role_label = await _role_label(update, context, session.role)
    title = await t(update, context, "telegram.menu.main")
    text = await t(
        update,
        context,
        "telegram.menu.main_text",
        title=title,
        fio=session.fio,
        role=role_label,
    )
    kb = await main_menu_keyboard(update, context, session.role)
    if update.callback_query and not force_reply:
        await update.callback_query.edit_message_text(text, reply_markup=kb, parse_mode="Markdown")
    else:
        await update.effective_message.reply_text(text, reply_markup=kb, parse_mode="Markdown")


async def _auth_keyboard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> InlineKeyboardMarkup:
    edit_text = await t(update, context, "telegram.button.edit_login")
    cancel_text = await t(update, context, "telegram.button.cancel")
    return InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(f"✏️ {edit_text}", callback_data=AUTH_EDIT_LOGIN),
                InlineKeyboardButton(f"❌ {cancel_text}", callback_data=AUTH_CANCEL),
            ]
        ]
    )


async def _is_cancel_pressed(update: Update, context: ContextTypes.DEFAULT_TYPE, text: str) -> bool:
    cancel = await t(update, context, "telegram.button.cancel")
    return text.startswith("❌") or text.strip().lower() == cancel.strip().lower()


async def _is_edit_login_pressed(update: Update, context: ContextTypes.DEFAULT_TYPE, text: str) -> bool:
    edit = await t(update, context, "telegram.button.edit_login")
    return text.startswith("✏️") or text.strip().lower() == edit.strip().lower()


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    tg_id = update.effective_user.id
    current_lang = context.user_data.get("language")
    context.user_data.clear()
    
    # Restore language if it was previously set, else detect it
    if current_lang:
        set_user_language(context, current_lang)
    else:
        set_user_language(context, detect_language(update, context))

    session = await get_session(tg_id)

    if session:
        try:
            user_data = await api.me(session.jwt_token)
            new_role = user_data.get("role", session.role)
            if new_role != session.role:
                session.role = new_role
                session.fio = user_data.get("fio", session.fio)
                await save_session(session)
                role_label = await _role_label(update, context, new_role)
                await update.message.reply_text(await t(update, context, "telegram.auth.role_changed_to", role=role_label))
            await touch_session(tg_id)
            await show_main_menu(update, context, session)
            return ConversationHandler.END
        except SDSApiError as exc:
            if exc.status == 401:
                await delete_session(tg_id)
                await update.message.reply_text(await t(update, context, "telegram.auth.session_expired"))
                return ConversationHandler.END
            logger.warning("Token check failed: %s", exc)
            await delete_session(tg_id)

    failures = await count_recent_failures(tg_id)
    if failures >= MAX_LOGIN_ATTEMPTS:
        await update.message.reply_text(
            await t(update, context, "telegram.auth.too_many_attempts", minutes=LOGIN_BLOCK_MINUTES)
        )
        return ConversationHandler.END

    await update.message.reply_text(await t(update, context, "telegram.lang.choose"), reply_markup=_language_keyboard())
    return ASK_LANGUAGE

async def cb_set_language_auth(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    q = update.callback_query
    await q.answer()
    selected = (q.data or "").replace("setlang_", "").strip().lower()
    lang = set_user_language(context, selected)
    await q.edit_message_text(await t(update, context, "telegram.lang.updated", lang=lang.upper()))
    await q.message.reply_text(await t(update, context, "telegram.auth.welcome_prompt"), parse_mode="Markdown")
    return ASK_LOGIN

async def ask_language_fallback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text(await t(update, context, "telegram.lang.choose"), reply_markup=_language_keyboard())
    return ASK_LANGUAGE


async def ask_login(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = (update.message.text or "").strip()
    if await _is_cancel_pressed(update, context, text):
        await update.message.reply_text(await t(update, context, "telegram.auth.canceled"), reply_markup=ReplyKeyboardRemove())
        return ConversationHandler.END

    if not text:
        await update.message.reply_text(await t(update, context, "telegram.auth.enter_login"))
        return ASK_LOGIN

    context.user_data["login"] = text
    kb = await _auth_keyboard(update, context)
    await update.message.reply_text(
        await t(update, context, "telegram.auth.login_saved_enter_password", login=text),
        reply_markup=kb,
    )
    return ASK_PASSWORD


async def ask_password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    tg_id = update.effective_user.id
    text = (update.message.text or "").strip()

    if await _is_edit_login_pressed(update, context, text):
        context.user_data.pop("login", None)
        await update.message.reply_text(await t(update, context, "telegram.auth.enter_login"), reply_markup=ReplyKeyboardRemove())
        return ASK_LOGIN

    if await _is_cancel_pressed(update, context, text):
        context.user_data.clear()
        await update.message.reply_text(await t(update, context, "telegram.auth.canceled"), reply_markup=ReplyKeyboardRemove())
        return ConversationHandler.END

    login = context.user_data.get("login", "")
    password = text

    failures = await count_recent_failures(tg_id)
    if failures >= MAX_LOGIN_ATTEMPTS:
        await update.message.reply_text(
            await t(update, context, "telegram.auth.too_many_attempts_short", minutes=LOGIN_BLOCK_MINUTES),
            reply_markup=ReplyKeyboardRemove(),
        )
        await log_action(tg_id, login, None, "login_blocked", f"failures={failures}")
        return ConversationHandler.END

    try:
        result = await api.login(login, password)
    except SDSApiError as exc:
        await record_attempt(tg_id, False)
        await log_action(tg_id, login, None, "login_fail", exc.detail, "error", exc.detail)
        failures += 1
        remaining = MAX_LOGIN_ATTEMPTS - failures
        try:
            await update.message.delete()
        except Exception as delete_error:
            logger.debug("Failed to delete password message: %s", delete_error)

        if remaining <= 0:
            await update.effective_chat.send_message(
                await t(update, context, "telegram.auth.blocked_now", minutes=LOGIN_BLOCK_MINUTES),
                reply_markup=ReplyKeyboardRemove(),
            )
            return ConversationHandler.END

        kb = await _auth_keyboard(update, context)
        await update.effective_chat.send_message(
            await t(update, context, "telegram.auth.invalid_credentials_retry", remaining=remaining, max_attempts=MAX_LOGIN_ATTEMPTS, login=login),
            parse_mode="Markdown",
            reply_markup=kb,
        )
        return ASK_PASSWORD

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

    try:
        await update.message.delete()
    except Exception as delete_error:
        logger.debug("Failed to delete password message: %s", delete_error)

    await update.effective_chat.send_message(
        await t(update, context, "telegram.auth.login_success", login=login),
        reply_markup=ReplyKeyboardRemove(),
    )
    await show_main_menu(update, context, session)
    return ConversationHandler.END


async def cb_auth_action(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    q = update.callback_query
    await q.answer()

    if q.data == AUTH_EDIT_LOGIN:
        context.user_data.pop("login", None)
        await q.message.reply_text(await t(update, context, "telegram.auth.enter_login"), reply_markup=ReplyKeyboardRemove())
        return ASK_LOGIN

    if q.data == AUTH_CANCEL:
        context.user_data.clear()
        await q.message.reply_text(await t(update, context, "telegram.auth.canceled"), reply_markup=ReplyKeyboardRemove())
        return ConversationHandler.END

    return ASK_PASSWORD


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data.clear()
    await update.message.reply_text(await t(update, context, "telegram.auth.canceled"), reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END


async def cmd_lang(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(await t(update, context, "telegram.lang.choose"), reply_markup=_language_keyboard())


async def cb_set_language(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    selected = (q.data or "").replace("setlang_", "").strip().lower()
    lang = set_user_language(context, selected)
    await q.edit_message_text(await t(update, context, "telegram.lang.updated", lang=lang.upper()))

    session = await get_session(q.from_user.id)
    if session:
        await show_main_menu(update, context, session)
    else:
        await q.message.reply_text(await t(update, context, "telegram.auth.welcome_prompt"), parse_mode="Markdown")


async def cb_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    session = await get_session(q.from_user.id)
    if not session:
        await q.edit_message_text(await t(update, context, "telegram.auth.session_not_found"))
        return
    await touch_session(q.from_user.id)
    await show_main_menu(update, context, session)


async def cb_profile(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    session = await get_session(q.from_user.id)
    if not session:
        await q.edit_message_text(await t(update, context, "telegram.auth.session_not_found"))
        return

    phone = "-"
    email = "-"
    try:
        user_info = await api.get_current_user(session.jwt_token)
        phone = user_info.get("phone", "-") or "-"
        email = user_info.get("email", "-") or "-"
    except Exception as profile_error:
        logger.debug("Failed to load extended profile data: %s", profile_error)

    role_label = await _role_label(update, context, session.role)
    text = await t(
        update,
        context,
        "telegram.profile.card",
        fio_label=await t(update, context, "telegram.profile.fio"),
        fio=session.fio,
        login_label=await t(update, context, "telegram.profile.login"),
        login=session.login,
        role_label=await t(update, context, "telegram.profile.role"),
        role=role_label,
        phone_label=await t(update, context, "telegram.profile.phone"),
        phone=phone,
        email_label=await t(update, context, "telegram.profile.email"),
        email=email,
        title=await t(update, context, "telegram.profile.title"),
    )
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton(await t(update, context, "telegram.lang.choose"), callback_data="change_lang")],
        [InlineKeyboardButton(await t(update, context, "telegram.button.back"), callback_data="main_menu")]
    ])
    await q.edit_message_text(text, reply_markup=kb, parse_mode="Markdown")

async def cb_change_lang_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    await q.edit_message_text(await t(update, context, "telegram.lang.choose"), reply_markup=_language_keyboard())


async def cb_logout(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    kb = InlineKeyboardMarkup(
        [
            [InlineKeyboardButton(await t(update, context, "telegram.button.yes_logout"), callback_data="logout_confirm")],
            [InlineKeyboardButton(await t(update, context, "telegram.button.back"), callback_data="main_menu")],
        ]
    )
    await q.edit_message_text(await t(update, context, "telegram.auth.logout_confirm"), reply_markup=kb)


async def cb_logout_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id
    session = await get_session(tg_id)
    if session:
        await log_action(tg_id, session.login, session.role, "logout")
    await delete_session(tg_id)
    context.user_data.clear()
    await q.edit_message_text(await t(update, context, "telegram.auth.goodbye"))


def register_auth_handlers(app) -> None:
    conv = ConversationHandler(
        entry_points=[CommandHandler("start", cmd_start)],
        states={
            ASK_LANGUAGE: [
                CallbackQueryHandler(cb_set_language_auth, pattern=r"^setlang_(ru|uz|en)$"),
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_language_fallback),
            ],
            ASK_LOGIN: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_login)],
            ASK_PASSWORD: [
                CallbackQueryHandler(cb_auth_action, pattern=r"^auth_(edit_login|cancel)$"),
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_password),
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )
    app.add_handler(conv)
    app.add_handler(CommandHandler("lang", cmd_lang))
    app.add_handler(CallbackQueryHandler(cb_set_language, pattern=r"^setlang_(ru|uz|en)$"))
    app.add_handler(CallbackQueryHandler(cb_main_menu, pattern="^main_menu$"))
    app.add_handler(CallbackQueryHandler(cb_profile, pattern="^profile$"))
    app.add_handler(CallbackQueryHandler(cb_change_lang_menu, pattern="^change_lang$"))
    app.add_handler(CallbackQueryHandler(cb_logout, pattern="^logout$"))
    app.add_handler(CallbackQueryHandler(cb_logout_confirm, pattern="^logout_confirm$"))
