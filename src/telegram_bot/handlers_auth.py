"""
Авторизация: /start, ввод логина/пароля, проверка токена, выход.
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
        buttons.append([InlineKeyboardButton("🗺 Мой маршрут", callback_data="exp_orders")])
        buttons.append([InlineKeyboardButton("📦 Мои заказы на сегодня", callback_data="exp_orders_today")])
        buttons.append([InlineKeyboardButton("✅ Выполненные сегодня", callback_data="exp_orders_done_today")])
        buttons.append([InlineKeyboardButton("💰 Получить оплату", callback_data="exp_payment")])
        buttons.append([InlineKeyboardButton("💵 Полученная оплата", callback_data="exp_received_payments")])
    elif role_lower == "agent":
        buttons.append([InlineKeyboardButton("🆕 Создать визит", callback_data="agent_create_visit")])
        buttons.append([InlineKeyboardButton("📋 Мои визиты", callback_data="agent_visits")])
        buttons.append([InlineKeyboardButton("➕ Добавить клиента", callback_data="agent_add_customer")])
        buttons.append([InlineKeyboardButton("📸 Загрузить фото клиента", callback_data="agent_photo")])
        buttons.append([InlineKeyboardButton("🛒 Создать заказ", callback_data="agent_order")])
    else:
        # admin и др. — все кнопки
        buttons.append([InlineKeyboardButton("🗺 Мой маршрут", callback_data="exp_orders")])
        buttons.append([InlineKeyboardButton("💰 Получить оплату", callback_data="exp_payment")])
        buttons.append([InlineKeyboardButton("💵 Полученная оплата", callback_data="exp_received_payments")])
        buttons.append([InlineKeyboardButton("🆕 Создать визит", callback_data="agent_create_visit")])
        buttons.append([InlineKeyboardButton("📋 Мои визиты", callback_data="agent_visits")])
        buttons.append([InlineKeyboardButton("➕ Добавить клиента", callback_data="agent_add_customer")])
        buttons.append([InlineKeyboardButton("📸 Загрузить фото клиента", callback_data="agent_photo")])
        buttons.append([InlineKeyboardButton("🛒 Создать заказ", callback_data="agent_order")])
    buttons.append([InlineKeyboardButton("👤 Профиль", callback_data="profile")])
    buttons.append([InlineKeyboardButton("🚪 Выход", callback_data="logout")])
    return InlineKeyboardMarkup(buttons)


async def show_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE, session: UserSession):
    role_ru = ROLE_RU.get(session.role, session.role)
    text = f"🏠 *Главное меню*\n\n{session.fio} ({role_ru})"
    kb = main_menu_keyboard(session.role)
    # Убираем reply-клавиатуру если была
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
        # Проверяем токен
        try:
            user_data = await api.me(session.jwt_token)
            # Обновить роль если изменилась
            new_role = user_data.get("role", session.role)
            if new_role != session.role:
                session.role = new_role
                session.fio = user_data.get("fio", session.fio)
                await save_session(session)
                await update.message.reply_text(
                    f"⚠️ Ваша роль изменена на: {ROLE_RU.get(new_role, new_role)}"
                )
            await touch_session(tg_id)
            await show_main_menu(update, context, session)
            return ConversationHandler.END
        except SDSApiError as e:
            if e.status == 401:
                await delete_session(tg_id)
                await update.message.reply_text("Сессия истекла. Нажмите /start для повторной авторизации.")
                return ConversationHandler.END
            else:
                logger.warning("Token check failed: %s", e)
                await delete_session(tg_id)

    # Проверка блокировки
    failures = await count_recent_failures(tg_id)
    if failures >= MAX_LOGIN_ATTEMPTS:
        await update.message.reply_text(
            f"⛔ Слишком много неудачных попыток входа.\n"
            f"Подождите {LOGIN_BLOCK_MINUTES} минут и попробуйте снова."
        )
        return ConversationHandler.END

    # Не авторизован
    await update.message.reply_text(
        "👋 Добро пожаловать в *бот системы управления продажами и дистрибуцией*!\n\n"
        "Для начала работы необходимо авторизоваться.\n\n"
        "Введите ваш *логин*:",
        parse_mode="Markdown",
    )
    return ASK_LOGIN


async def ask_login(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Обработка кнопки «Отмена»
    if update.message.text.strip() == "❌ Отмена":
        await update.message.reply_text(
            "Авторизация отменена. Нажмите /start чтобы начать.",
            reply_markup=ReplyKeyboardRemove(),
        )
        return ConversationHandler.END

    login = update.message.text.strip()
    if not login:
        await update.message.reply_text("Введите логин:")
        return ASK_LOGIN

    context.user_data["login"] = login

    # Кнопки: Изменить логин / Отмена
    kb = ReplyKeyboardMarkup(
        [[KeyboardButton("✏️ Изменить логин"), KeyboardButton("❌ Отмена")]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await update.message.reply_text(
        f"Логин: *{login}*\n\nВведите *пароль*:",
        parse_mode="Markdown",
        reply_markup=kb,
    )
    return ASK_PASSWORD


async def ask_password(update: Update, context: ContextTypes.DEFAULT_TYPE):
    tg_id = update.effective_user.id
    text = update.message.text.strip()

    # Кнопка «Изменить логин»
    if text == "✏️ Изменить логин":
        context.user_data.pop("login", None)
        await update.message.reply_text(
            "Введите *логин*:",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove(),
        )
        return ASK_LOGIN

    # Кнопка «Отмена»
    if text == "❌ Отмена":
        context.user_data.clear()
        await update.message.reply_text(
            "Авторизация отменена. Нажмите /start чтобы начать.",
            reply_markup=ReplyKeyboardRemove(),
        )
        return ConversationHandler.END

    password = text
    login = context.user_data.get("login", "")

    # Проверка блокировки
    failures = await count_recent_failures(tg_id)
    if failures >= MAX_LOGIN_ATTEMPTS:
        await update.message.reply_text(
            f"⛔ Слишком много попыток. Подождите {LOGIN_BLOCK_MINUTES} минут.",
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

        # Удалить сообщение с паролем
        try:
            await update.message.delete()
        except Exception:
            pass

        if remaining <= 0:
            await update.effective_chat.send_message(
                f"❌ Неверные данные. Вход заблокирован на {LOGIN_BLOCK_MINUTES} мин.",
                reply_markup=ReplyKeyboardRemove(),
            )
            return ConversationHandler.END

        kb = ReplyKeyboardMarkup(
            [[KeyboardButton("✏️ Изменить логин"), KeyboardButton("❌ Отмена")]],
            resize_keyboard=True,
            one_time_keyboard=True,
        )
        await update.effective_chat.send_message(
            f"❌ Неверный логин или пароль.\n"
            f"Осталось попыток: *{remaining}* из {MAX_LOGIN_ATTEMPTS}\n\n"
            f"Логин: *{login}*\n"
            f"Введите *пароль* или нажмите «✏️ Изменить логин»:",
            parse_mode="Markdown",
            reply_markup=kb,
        )
        return ASK_PASSWORD

    # Успешный вход
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

    # Удалить сообщение с паролем (безопасность)
    try:
        await update.message.delete()
    except Exception:
        pass

    # Убираем reply-клавиатуру и показываем меню
    await update.effective_chat.send_message(
        f"✅ Авторизация успешна! Добро пожаловать, *{fio}*!",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )
    await show_main_menu(update, context, session)
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data.clear()
    await update.message.reply_text(
        "Авторизация отменена. Нажмите /start чтобы начать.",
        reply_markup=ReplyKeyboardRemove(),
    )
    return ConversationHandler.END


# ---------- Callbacks ----------

async def cb_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session = await get_session(q.from_user.id)
    if not session:
        await q.edit_message_text("Сессия не найдена. Нажмите /start.")
        return
    await touch_session(q.from_user.id)
    await show_main_menu(update, context, session)


async def cb_profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session = await get_session(q.from_user.id)
    if not session:
        await q.edit_message_text("Сессия не найдена. Нажмите /start.")
        return
    role_ru = ROLE_RU.get(session.role, session.role)
    text = (
        f"👤 *Профиль*\n\n"
        f"*ФИО:* {session.fio}\n"
        f"*Логин:* {session.login}\n"
        f"*Роль:* {role_ru}\n"
    )
    kb = InlineKeyboardMarkup([[InlineKeyboardButton("◀️ Назад", callback_data="main_menu")]])
    await q.edit_message_text(text, reply_markup=kb, parse_mode="Markdown")


async def cb_logout(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("✅ Да, выйти", callback_data="logout_confirm")],
        [InlineKeyboardButton("◀️ Назад", callback_data="main_menu")],
    ])
    await q.edit_message_text("Вы действительно хотите выйти?", reply_markup=kb)


async def cb_logout_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id
    session = await get_session(tg_id)
    if session:
        await log_action(tg_id, session.login, session.role, "logout")
    await delete_session(tg_id)
    context.user_data.clear()
    await q.edit_message_text("👋 До свидания!\n\nДля входа нажмите /start.")


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
