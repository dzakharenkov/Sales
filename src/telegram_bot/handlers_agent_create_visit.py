"""
Обработчик создания визита (FSM).

Архитектура:
- Линейный диалог: Выбор клиента → Дата → Время → Статус → Комментарий → Подтверждение
- Автопривязка responsible_login и created_by из сессии
- Кнопки Назад/Пропустить/Отмена на каждом шаге
- Подробное логирование
"""
import logging
import re
from datetime import datetime, date, time as dt_time

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ContextTypes, ConversationHandler, CallbackQueryHandler, MessageHandler, filters,
)
from telegram.error import TelegramError

from .session import get_session, touch_session, delete_session
from .sds_api import api, SDSApiError
from .i18n import t, localize_reply_markup

logger = logging.getLogger(__name__)

# FSM States
(
    SELECT_CUSTOMER,
    ASK_DATE,
    ASK_TIME,
    ASK_STATUS,
    ASK_COMMENT,
    CONFIRM,
) = range(6)

# User data keys prefix
PREFIX = "new_visit_"


# ============================================================================
# Helpers
# ============================================================================
async def tr(update: Update | None, context: ContextTypes.DEFAULT_TYPE | None, key: str, default: str, **params) -> str:
    """Read text from translations table with safe fallback."""
    text = await t(update, context, key, **params)
    if text == key:
        text = default.format(**params) if params else default
    return text


VISIT_I18N_MAP = {
    "🆕 *Создание визита*": ("telegram.visit_create.title", "🆕 *Создание визита*"),
    "📝 Шаг 1 из 5: Введите *название клиента* или *ИНН* для поиска:": ("telegram.visit_create.step1", "📝 Шаг 1 из 5: Введите *название клиента* или *ИНН* для поиска:"),
    "📝 Шаг 2 из 5: Введите *дату визита* (ДД.ММ.ГГГГ или ДД.ММ):": ("telegram.visit_create.step2", "📝 Шаг 2 из 5: Введите *дату визита* (ДД.ММ.ГГГГ или ДД.ММ):"),
    "⚠️ _Обязательное поле_": ("telegram.visit_create.required_field", "⚠️ _Обязательное поле_"),
    "📝 Шаг 3 из 5: Введите *время визита* (ЧЧ:ММ) или нажмите Пропустить:": ("telegram.visit_create.step3", "📝 Шаг 3 из 5: Введите *время визита* (ЧЧ:ММ) или нажмите Пропустить:"),
    "📝 Шаг 4 из 5: Выберите *статус визита*:": ("telegram.visit_create.step4", "📝 Шаг 4 из 5: Выберите *статус визита*:"),
    "📝 Шаг 5 из 5: Введите *комментарий* или нажмите Пропустить:": ("telegram.visit_create.step5", "📝 Шаг 5 из 5: Введите *комментарий* или нажмите Пропустить:"),
    "✅ *Проверьте данные:*": ("telegram.visit_create.check_data", "✅ *Проверьте данные:*"),
    "Всё верно?": ("telegram.visit_create.all_correct", "Всё верно?"),
    "❌ Сессия истекла. Нажмите /start.": ("telegram.auth.session_expired", "❌ Сессия истекла. Нажмите /start."),
    "❌ Создание визита отменено.\n\nНажмите /start для возврата в главное меню.": ("telegram.visit_create.cancelled", "❌ Создание визита отменено.\n\nНажмите /start для возврата в главное меню."),
    "❌ *Ошибка:* Введите минимум 2 символа для поиска.\n\nПопробуйте еще раз:": ("telegram.visit_create.error_min_search", "❌ *Ошибка:* Введите минимум 2 символа для поиска.\n\nПопробуйте еще раз:"),
    "❌ *Ошибка:* Неверный формат даты.\n\nВведите дату в формате *ДД.ММ.ГГГГ* или *ДД.ММ*:\nНапример: 25.12.2026 или 25.12": ("telegram.visit_create.error_date_format", "❌ *Ошибка:* Неверный формат даты.\n\nВведите дату в формате *ДД.ММ.ГГГГ* или *ДД.ММ*:\nНапример: 25.12.2026 или 25.12"),
    "❌ *Ошибка:* Неверный формат времени.\n\nВведите время в формате *ЧЧ:ММ*:\nНапример: 14:30": ("telegram.visit_create.error_time_format", "❌ *Ошибка:* Неверный формат времени.\n\nВведите время в формате *ЧЧ:ММ*:\nНапример: 14:30"),
    "🔍 Изменить поиск": ("telegram.visit_create.change_search", "🔍 Изменить поиск"),
    "🔍 *Найдено клиентов:*": ("telegram.visit_create.found_customers", "🔍 *Найдено клиентов:*"),
    "Выберите клиента:": ("telegram.visit_create.select_customer", "Выберите клиента:"),
    "✅ Создать визит": ("telegram.visit_create.create_visit_btn", "✅ Создать визит"),
    "📅 Запланирован": ("telegram.visit_create.status_planned", "📅 Запланирован"),
    "✅ Выполнен": ("telegram.visit_create.status_completed", "✅ Выполнен"),
    "❌ Отменён": ("telegram.visit_create.status_cancelled", "❌ Отменён"),
    "⏸ Перенесён": ("telegram.visit_create.status_postponed", "⏸ Перенесён"),
}


async def _localize_visit_text(update: Update | None, context: ContextTypes.DEFAULT_TYPE, text: str) -> str:
    if not text:
        return text
    out = text
    for src, (key, default) in VISIT_I18N_MAP.items():
        if src in out:
            out = out.replace(src, await tr(update, context, key, default))
    return out


async def _reply_i18n(message_obj, update: Update | None, context: ContextTypes.DEFAULT_TYPE, text: str, **kwargs):
    if "reply_markup" in kwargs and kwargs["reply_markup"] is not None:
        kwargs["reply_markup"] = await localize_reply_markup(update, context, kwargs["reply_markup"])
    return await message_obj.reply_text(await _localize_visit_text(update, context, text), **kwargs)


async def _edit_i18n(query_obj, update: Update | None, context: ContextTypes.DEFAULT_TYPE, text: str, **kwargs):
    if "reply_markup" in kwargs and kwargs["reply_markup"] is not None:
        kwargs["reply_markup"] = await localize_reply_markup(update, context, kwargs["reply_markup"])
    return await query_obj.edit_message_text(await _localize_visit_text(update, context, text), **kwargs)


def _escape_markdown(text: str) -> str:
    """Экранирует спецсимволы Markdown."""
    if not text:
        return text
    text = str(text)
    escape_chars = ['_', '*', '[', ']', '`']
    for char in escape_chars:
        text = text.replace(char, '\\' + char)
    return text


async def _get_summary(update: Update | None, context: ContextTypes.DEFAULT_TYPE) -> str:
    """Build localized summary for visit confirmation."""
    customer_name = context.user_data.get(f"{PREFIX}customer_name", "")
    visit_date = context.user_data.get(f"{PREFIX}visit_date", "")
    visit_time = context.user_data.get(f"{PREFIX}visit_time", "")
    status = context.user_data.get(f"{PREFIX}status", "")
    comment = context.user_data.get(f"{PREFIX}comment", "")

    status_map = {
        "planned": await tr(update, context, "status.planned", "Запланирован"),
        "completed": await tr(update, context, "status.completed", "Завершён"),
        "cancelled": await tr(update, context, "status.canceled", "Отменён"),
        "postponed": await tr(update, context, "status.postponed", "На рассмотрении"),
    }
    status_label = status_map.get(status, status)

    lines = []
    if customer_name:
        lines.append(f"👤 *{await tr(update, context, 'field.customer', 'Клиент')}:* {_escape_markdown(customer_name)}")
    if visit_date:
        lines.append(f"📅 *{await tr(update, context, 'field.date', 'Дата')}:* {visit_date}")
    if visit_time:
        lines.append(f"🕐 *{await tr(update, context, 'field.time', 'Время')}:* {visit_time}")
    if status:
        lines.append(f"📌 *{await tr(update, context, 'field.status', 'Статус')}:* {status_label}")
    if comment:
        lines.append(f"💬 *{await tr(update, context, 'field.comment', 'Комментарий')}:* {_escape_markdown(comment)}")

    return "\n".join(lines) if lines else await tr(update, context, "ui.common.no_data", "Нет данных")


async def _cancel_keyboard(update: Update | None, context: ContextTypes.DEFAULT_TYPE) -> InlineKeyboardMarkup:
    """Cancel keyboard."""
    return InlineKeyboardMarkup(
        [[InlineKeyboardButton(await tr(update, context, "telegram.button.cancel", "❌ Отмена"), callback_data="create_visit_cancel")]]
    )


async def _skip_back_cancel_keyboard(
    update: Update | None,
    context: ContextTypes.DEFAULT_TYPE,
    skip_text: str | None = None,
) -> InlineKeyboardMarkup:
    """Skip/back/cancel keyboard."""
    if skip_text is None:
        skip_text = await tr(update, context, "telegram.button.skip", "⏩ Пропустить")
    back_text = await tr(update, context, "telegram.button.back", "◀️ Назад")
    cancel_text = await tr(update, context, "telegram.button.cancel", "❌ Отмена")
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(skip_text, callback_data="create_visit_skip")],
        [InlineKeyboardButton(back_text, callback_data="create_visit_back")],
        [InlineKeyboardButton(cancel_text, callback_data="create_visit_cancel")],
    ])


async def _back_cancel_keyboard(update: Update | None, context: ContextTypes.DEFAULT_TYPE) -> InlineKeyboardMarkup:
    """Back/cancel keyboard."""
    back_text = await tr(update, context, "telegram.button.back", "◀️ Назад")
    cancel_text = await tr(update, context, "telegram.button.cancel", "❌ Отмена")
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(back_text, callback_data="create_visit_back")],
        [InlineKeyboardButton(cancel_text, callback_data="create_visit_cancel")],
    ])


# ============================================================================
# Entry point
# ============================================================================
# Entry point
# ============================================================================

async def start_create_visit(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Начало диалога создания визита."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[CREATE VISIT START] User {tg_id} started create visit dialog")

    # Проверка на активный диалог добавления клиента
    active_customer_keys = [k for k in context.user_data.keys() if k.startswith("new_customer_v3_")]
    if active_customer_keys:
        logger.warning(f"[CREATE VISIT START] User {tg_id} has active add customer dialog, blocking create visit")
        await _edit_i18n(q, update, context, 
            "⚠️ У вас уже активен диалог добавления клиента.\n"
            "Пожалуйста, завершите его (нажмите Отмена) перед созданием визита."
        )
        return ConversationHandler.END

    session = await get_session(tg_id)
    if not session:
        logger.warning(f"[CREATE VISIT START] User {tg_id} has no session")
        await _edit_i18n(q, update, context, "❌ Сессия истекла. Нажмите /start.")
        return ConversationHandler.END

    await touch_session(tg_id)

    # Очистка старых данных
    keys_to_clear = [k for k in context.user_data.keys() if k.startswith(PREFIX)]
    for key in keys_to_clear:
        context.user_data.pop(key, None)

    logger.debug(f"[CREATE VISIT START] Cleared {len(keys_to_clear)} old keys")

    text = (
        "🆕 *Создание визита*\n\n"
        "📝 Шаг 1 из 5: Введите *название клиента* или *ИНН* для поиска:"
    )

    await _edit_i18n(q, update, context, text, reply_markup=await _cancel_keyboard(update, context), parse_mode="Markdown")

    return SELECT_CUSTOMER


# ============================================================================
# State: SELECT_CUSTOMER
# ============================================================================

async def select_customer(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Поиск и выбор клиента."""
    tg_id = update.effective_user.id
    search_query = update.message.text.strip()

    logger.info(f"[SELECT_CUSTOMER] User {tg_id} searching for: '{search_query}'")

    if len(search_query) < 2:
        logger.warning(f"[SELECT_CUSTOMER] User {tg_id}: Search query too short")
        await _reply_i18n(update.message, update, context, 
            "❌ *Ошибка:* Введите минимум 2 символа для поиска.\n\n"
            "Попробуйте еще раз:",
            reply_markup=await _cancel_keyboard(update, context),
            parse_mode="Markdown",
        )
        return SELECT_CUSTOMER

    session = await get_session(tg_id)
    if not session:
        await _reply_i18n(update.message, update, context, "❌ Сессия истекла. Нажмите /start.")
        return ConversationHandler.END

    # Поиск клиентов через API
    try:
        logger.info(f"[SELECT_CUSTOMER API] Searching customers with query: {search_query}")
        customers = await api.search_customers(session.jwt_token, search=search_query, limit=10)
        logger.info(f"[SELECT_CUSTOMER API] Found {len(customers)} customers")

    except SDSApiError as e:
        logger.error(f"[SELECT_CUSTOMER API ERROR] {e}")
        if e.status == 401:
            await delete_session(tg_id)
            await _reply_i18n(update.message, update, context, "❌ Сессия истекла. Нажмите /start.")
            return ConversationHandler.END

        await _reply_i18n(update.message, update, context, 
            f"❌ *Ошибка API:* {e.detail}\n\nПопробуйте снова:",
            reply_markup=await _cancel_keyboard(update, context),
            parse_mode="Markdown",
        )
        return SELECT_CUSTOMER

    if not customers:
        logger.warning(f"[SELECT_CUSTOMER] No customers found for query: {search_query}")
        await _reply_i18n(update.message, update, context, 
            f"⚠️ Клиенты не найдены по запросу: *{_escape_markdown(search_query)}*\n\n"
            f"Попробуйте изменить запрос:",
            reply_markup=await _cancel_keyboard(update, context),
            parse_mode="Markdown",
        )
        return SELECT_CUSTOMER

    # Показать список клиентов для выбора
    buttons = []
    for cust in customers:
        cust_id = cust.get("id")
        name = cust.get("name_client", "Без названия")
        tax_id = cust.get("tax_id", "")
        display = f"{name}" + (f" ({tax_id})" if tax_id else "")
        buttons.append([InlineKeyboardButton(display, callback_data=f"visit_cust_{cust_id}")])

    buttons.append([InlineKeyboardButton("🔍 Изменить поиск", callback_data="visit_search_again")])
    buttons.append([InlineKeyboardButton("❌ Отмена", callback_data="create_visit_cancel")])

    text = (
        f"🔍 *Найдено клиентов:* {len(customers)}\n\n"
        f"Выберите клиента:"
    )

    await _reply_i18n(update.message, update, context, 
        text,
        reply_markup=InlineKeyboardMarkup(buttons),
        parse_mode="Markdown",
    )

    return SELECT_CUSTOMER


async def customer_selected(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка выбора клиента."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    customer_id = int(q.data.replace("visit_cust_", ""))

    logger.info(f"[CUSTOMER_SELECTED] User {tg_id} selected customer: {customer_id}")

    session = await get_session(tg_id)
    if not session:
        await _edit_i18n(q, update, context, "❌ Сессия истекла. Нажмите /start.")
        return ConversationHandler.END

    # Получить данные клиента
    try:
        customer = await api.get_customer(session.jwt_token, customer_id)
        customer_name = customer.get("name_client", "Без названия")
        logger.info(f"[CUSTOMER_SELECTED] Customer name: {customer_name}")

    except SDSApiError as e:
        logger.error(f"[CUSTOMER_SELECTED API ERROR] {e}")
        await _edit_i18n(q, update, context, 
            f"❌ *Ошибка получения данных клиента:* {e.detail}",
            parse_mode="Markdown",
        )
        return ConversationHandler.END

    context.user_data[f"{PREFIX}customer_id"] = customer_id
    context.user_data[f"{PREFIX}customer_name"] = customer_name

    summary = await _get_summary(update, context)

    text = (
        f"🆕 *Создание визита*\n\n"
        f"{summary}\n\n"
        f"📝 Шаг 2 из 5: Введите *дату визита* (ДД.ММ.ГГГГ или ДД.ММ):\n"
        f"⚠️ _Обязательное поле_"
    )

    await _edit_i18n(q, update, context, text, reply_markup=await _back_cancel_keyboard(update, context), parse_mode="Markdown")

    return ASK_DATE


async def search_again(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Повторный поиск клиента."""
    q = update.callback_query
    await q.answer()

    text = (
        "🆕 *Создание визита*\n\n"
        "📝 Шаг 1 из 5: Введите *название клиента* или *ИНН* для поиска:"
    )

    await _edit_i18n(q, update, context, text, reply_markup=await _cancel_keyboard(update, context), parse_mode="Markdown")

    return SELECT_CUSTOMER


# ============================================================================
# State: ASK_DATE
# ============================================================================

async def ask_date(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода даты."""
    tg_id = update.effective_user.id
    date_text = update.message.text.strip()

    logger.info(f"[ASK_DATE] User {tg_id} entered date: '{date_text}'")

    # Парсинг даты (ДД.ММ.ГГГГ или ДД.ММ)
    parsed_date = None
    try:
        if re.match(r"^\d{1,2}\.\d{1,2}\.\d{4}$", date_text):
            parsed_date = datetime.strptime(date_text, "%d.%m.%Y").date()
        elif re.match(r"^\d{1,2}\.\d{1,2}$", date_text):
            # Добавить текущий год
            current_year = datetime.now().year
            parsed_date = datetime.strptime(f"{date_text}.{current_year}", "%d.%m.%Y").date()
        else:
            raise ValueError("Неверный формат")
    except ValueError:
        logger.warning(f"[ASK_DATE] Invalid date format: {date_text}")
        await _reply_i18n(update.message, update, context, 
            "❌ *Ошибка:* Неверный формат даты.\n\n"
            "Введите дату в формате *ДД.ММ.ГГГГ* или *ДД.ММ*:\n"
            "Например: 25.12.2026 или 25.12",
            reply_markup=await _back_cancel_keyboard(update, context),
            parse_mode="Markdown",
        )
        return ASK_DATE

    context.user_data[f"{PREFIX}visit_date"] = parsed_date.isoformat()
    logger.info(f"[ASK_DATE] Date saved: {parsed_date}")

    summary = await _get_summary(update, context)

    text = (
        f"🆕 *Создание визита*\n\n"
        f"{summary}\n\n"
        f"📝 Шаг 3 из 5: Введите *время визита* (ЧЧ:ММ) или нажмите Пропустить:"
    )

    await _reply_i18n(update.message, update, context, 
        text,
        reply_markup=await _skip_back_cancel_keyboard(update, context, await tr(update, context, "telegram.button.skip_time", "⏩ Пропустить время")),
        parse_mode="Markdown",
    )

    return ASK_TIME


async def back_to_customer(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к выбору клиента."""
    q = update.callback_query
    await q.answer()

    text = (
        "🆕 *Создание визита*\n\n"
        "📝 Шаг 1 из 5: Введите *название клиента* или *ИНН* для поиска:"
    )

    await _edit_i18n(q, update, context, text, reply_markup=await _cancel_keyboard(update, context), parse_mode="Markdown")

    return SELECT_CUSTOMER


# ============================================================================
# State: ASK_TIME
# ============================================================================

async def ask_time(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода времени."""
    tg_id = update.effective_user.id
    time_text = update.message.text.strip()

    logger.info(f"[ASK_TIME] User {tg_id} entered time: '{time_text}'")

    # Парсинг времени (ЧЧ:ММ)
    parsed_time = None
    try:
        if re.match(r"^\d{1,2}:\d{2}$", time_text):
            parsed_time = datetime.strptime(time_text, "%H:%M").time()
        else:
            raise ValueError("Неверный формат")
    except ValueError:
        logger.warning(f"[ASK_TIME] Invalid time format: {time_text}")
        await _reply_i18n(update.message, update, context, 
            "❌ *Ошибка:* Неверный формат времени.\n\n"
            "Введите время в формате *ЧЧ:ММ*:\n"
            "Например: 14:30",
            reply_markup=await _skip_back_cancel_keyboard(update, context, await tr(update, context, "telegram.button.skip_time", "⏩ Пропустить время")),
            parse_mode="Markdown",
        )
        return ASK_TIME

    context.user_data[f"{PREFIX}visit_time"] = parsed_time.isoformat()
    logger.info(f"[ASK_TIME] Time saved: {parsed_time}")

    return await _show_status_selection(update, context, is_callback=False)


async def skip_time(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск времени."""
    q = update.callback_query
    await q.answer()

    context.user_data.pop(f"{PREFIX}visit_time", None)
    logger.info(f"[SKIP] Time skipped")

    return await _show_status_selection(update, context, is_callback=True)


async def back_to_date(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу даты."""
    q = update.callback_query
    await q.answer()

    summary = await _get_summary(update, context)

    text = (
        f"🆕 *Создание визита*\n\n"
        f"{summary}\n\n"
        f"📝 Шаг 2 из 5: Введите *дату визита* (ДД.ММ.ГГГГ или ДД.ММ):\n"
        f"⚠️ _Обязательное поле_"
    )

    await _edit_i18n(q, update, context, text, reply_markup=await _back_cancel_keyboard(update, context), parse_mode="Markdown")

    return ASK_DATE


# ============================================================================
# State: ASK_STATUS
# ============================================================================

async def _show_status_selection(update: Update, context: ContextTypes.DEFAULT_TYPE, is_callback: bool) -> int:
    """Показать кнопки выбора статуса."""

    summary = await _get_summary(update, context)

    text = (
        f"🆕 *Создание визита*\n\n"
        f"{summary}\n\n"
        f"📝 Шаг 4 из 5: Выберите *статус визита*:"
    )

    buttons = [
        [InlineKeyboardButton(await tr(update, context, "telegram.visit_create.status_planned", "📅 Запланирован"), callback_data="visit_status_planned")],
        [InlineKeyboardButton(await tr(update, context, "telegram.visit_create.status_completed", "✅ Выполнен"), callback_data="visit_status_completed")],
        [InlineKeyboardButton(await tr(update, context, "telegram.visit_create.status_cancelled", "❌ Отменён"), callback_data="visit_status_cancelled")],
        [InlineKeyboardButton(await tr(update, context, "telegram.visit_create.status_postponed", "⏸ Перенесён"), callback_data="visit_status_postponed")],
        [InlineKeyboardButton(await tr(update, context, "telegram.button.back", "◀️ Назад"), callback_data="create_visit_back")],
        [InlineKeyboardButton(await tr(update, context, "telegram.button.cancel", "❌ Отмена"), callback_data="create_visit_cancel")],
    ]

    if is_callback:
        await _edit_i18n(update.callback_query, update, context, 
            text,
            reply_markup=InlineKeyboardMarkup(buttons),
            parse_mode="Markdown",
        )
    else:
        await _reply_i18n(update.message, update, context, 
            text,
            reply_markup=InlineKeyboardMarkup(buttons),
            parse_mode="Markdown",
        )

    return ASK_STATUS


async def select_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка выбора статуса."""
    q = update.callback_query
    await q.answer()

    status = q.data.replace("visit_status_", "")

    logger.info(f"[SELECT_STATUS] Status selected: {status}")

    context.user_data[f"{PREFIX}status"] = status

    summary = await _get_summary(update, context)

    text = (
        f"🆕 *Создание визита*\n\n"
        f"{summary}\n\n"
        f"📝 Шаг 5 из 5: Введите *комментарий* или нажмите Пропустить:"
    )

    await _edit_i18n(q, update, context, 
        text,
        reply_markup=await _skip_back_cancel_keyboard(update, context, await tr(update, context, "telegram.button.skip_comment", "⏩ Пропустить комментарий")),
        parse_mode="Markdown",
    )

    return ASK_COMMENT


async def back_to_time(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу времени."""
    q = update.callback_query
    await q.answer()

    summary = await _get_summary(update, context)

    text = (
        f"🆕 *Создание визита*\n\n"
        f"{summary}\n\n"
        f"📝 Шаг 3 из 5: Введите *время визита* (ЧЧ:ММ) или нажмите Пропустить:"
    )

    await _edit_i18n(q, update, context, 
        text,
        reply_markup=await _skip_back_cancel_keyboard(update, context, await tr(update, context, "telegram.button.skip_time", "⏩ Пропустить время")),
        parse_mode="Markdown",
    )

    return ASK_TIME


# ============================================================================
# State: ASK_COMMENT
# ============================================================================

async def ask_comment(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода комментария."""
    tg_id = update.effective_user.id
    comment = update.message.text.strip()

    logger.info(f"[ASK_COMMENT] User {tg_id} entered comment (length={len(comment)})")

    context.user_data[f"{PREFIX}comment"] = comment

    return await _show_confirm(update, context, is_callback=False)


async def skip_comment(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск комментария."""
    q = update.callback_query
    await q.answer()

    context.user_data.pop(f"{PREFIX}comment", None)
    logger.info(f"[SKIP] Comment skipped")

    return await _show_confirm(update, context, is_callback=True)


async def back_to_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к выбору статуса."""
    q = update.callback_query
    await q.answer()

    return await _show_status_selection(update, context, is_callback=True)


# ============================================================================
# State: CONFIRM
# ============================================================================

async def _show_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE, is_callback: bool) -> int:
    """Показать экран подтверждения."""

    summary = await _get_summary(update, context)

    text = (
        f"🆕 *Создание визита*\n\n"
        f"✅ *Проверьте данные:*\n"
        f"{summary}\n\n"
        f"Всё верно?"
    )

    buttons = [
        [InlineKeyboardButton(await tr(update, context, "telegram.visit_create.create_visit_btn", "✅ Создать визит"), callback_data="create_visit_save")],
        [InlineKeyboardButton(await tr(update, context, "telegram.button.back", "◀️ Назад"), callback_data="create_visit_back")],
        [InlineKeyboardButton(await tr(update, context, "telegram.button.cancel", "❌ Отмена"), callback_data="create_visit_cancel")],
    ]

    if is_callback:
        await _edit_i18n(update.callback_query, update, context, 
            text,
            reply_markup=InlineKeyboardMarkup(buttons),
            parse_mode="Markdown",
        )
    else:
        await _reply_i18n(update.message, update, context, 
            text,
            reply_markup=InlineKeyboardMarkup(buttons),
            parse_mode="Markdown",
        )

    return CONFIRM


async def save_visit(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Сохранение визита через API."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[SAVE VISIT] User {tg_id} saving visit...")

    session = await get_session(tg_id)
    if not session:
        await _edit_i18n(q, update, context, "❌ Сессия истекла. Нажмите /start.")
        return ConversationHandler.END

    # Собрать данные визита
    visit_data = {
        "customer_id": context.user_data.get(f"{PREFIX}customer_id"),
        "visit_date": context.user_data.get(f"{PREFIX}visit_date"),
        "visit_time": context.user_data.get(f"{PREFIX}visit_time"),
        "status": context.user_data.get(f"{PREFIX}status"),
        "comment": context.user_data.get(f"{PREFIX}comment"),
        "responsible_login": session.login,  # Автопривязка
    }

    # Удалить None значения
    visit_data = {k: v for k, v in visit_data.items() if v is not None}

    logger.info(f"[SAVE VISIT API] Creating visit with data: {visit_data}")

    try:
        result = await api.create_visit(session.jwt_token, visit_data)
        visit_id = result.get("id")

        logger.info(f"[SAVE VISIT SUCCESS] Visit created, ID={visit_id}")

        customer_name = context.user_data.get(f"{PREFIX}customer_name", "")
        customer_inn = context.user_data.get(f"{PREFIX}customer_inn", "—")
        visit_date = context.user_data.get(f"{PREFIX}visit_date", "—")
        visit_time = context.user_data.get(f"{PREFIX}visit_time", "—")

        text = (
            f"✅ *Визит успешно создан!*\n\n"
            f"📋 *ID визита:* {visit_id}\n"
            f"👤 *Клиент:* {_escape_markdown(customer_name)}\n"
            f"🔢 *ИНН:* {customer_inn}\n"
            f"📅 *Дата:* {visit_date}\n"
            f"⏰ *Время:* {visit_time}\n"
        )

        await q.message.reply_text(
            await _localize_visit_text(update, context, text),
            parse_mode="Markdown",
        )

        # Очистка данных
        keys_to_clear = [k for k in context.user_data.keys() if k.startswith(PREFIX)]
        for key in keys_to_clear:
            context.user_data.pop(key, None)

        logger.info(f"[SAVE VISIT] Cleared {len(keys_to_clear)} context keys")

        # Показать главное меню
        from .handlers_auth import show_main_menu
        await show_main_menu(update, context, session, force_reply=True)

        return ConversationHandler.END

    except SDSApiError as e:
        logger.error(f"[SAVE VISIT API ERROR] {e}")

        if e.status == 401:
            await delete_session(tg_id)
            await _edit_i18n(q, update, context, "❌ Сессия истекла. Нажмите /start.")
            return ConversationHandler.END

        await _edit_i18n(q, update, context, 
            f"❌ *Ошибка при создании визита:*\n\n{e.detail}\n\nПопробуйте снова или нажмите /start.",
            parse_mode="Markdown",
        )

        return ConversationHandler.END


async def back_to_comment(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу комментария."""
    q = update.callback_query
    await q.answer()

    summary = await _get_summary(update, context)

    text = (
        f"🆕 *Создание визита*\n\n"
        f"{summary}\n\n"
        f"📝 Шаг 5 из 5: Введите *комментарий* или нажмите Пропустить:"
    )

    await _edit_i18n(q, update, context, 
        text,
        reply_markup=await _skip_back_cancel_keyboard(update, context, await tr(update, context, "telegram.button.skip_comment", "⏩ Пропустить комментарий")),
        parse_mode="Markdown",
    )

    return ASK_COMMENT


# ============================================================================
# Cancel dialog
# ============================================================================

async def cancel_dialog(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Отмена диалога создания визита."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[CANCEL] User {tg_id} cancelled create visit")

    # Очистка данных
    keys_to_clear = [k for k in context.user_data.keys() if k.startswith(PREFIX)]
    for key in keys_to_clear:
        context.user_data.pop(key, None)

    await _edit_i18n(q, update, context, 
        "❌ Создание визита отменено.\n\nНажмите /start для возврата в главное меню."
    )

    return ConversationHandler.END


# ============================================================================
# ConversationHandler registration
# ============================================================================

def get_create_visit_handler():
    """Получить ConversationHandler для создания визита."""
    logger.info("[HANDLER] Registering create visit handler")

    return ConversationHandler(
        entry_points=[
            CallbackQueryHandler(start_create_visit, pattern="^agent_create_visit$"),
        ],
        states={
            SELECT_CUSTOMER: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, select_customer),
                CallbackQueryHandler(customer_selected, pattern="^visit_cust_\\d+$"),
                CallbackQueryHandler(search_again, pattern="^visit_search_again$"),
                CallbackQueryHandler(cancel_dialog, pattern="^create_visit_cancel$"),
            ],
            ASK_DATE: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_date),
                CallbackQueryHandler(back_to_customer, pattern="^create_visit_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^create_visit_cancel$"),
            ],
            ASK_TIME: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_time),
                CallbackQueryHandler(skip_time, pattern="^create_visit_skip$"),
                CallbackQueryHandler(back_to_date, pattern="^create_visit_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^create_visit_cancel$"),
            ],
            ASK_STATUS: [
                CallbackQueryHandler(select_status, pattern="^visit_status_.+$"),
                CallbackQueryHandler(back_to_time, pattern="^create_visit_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^create_visit_cancel$"),
            ],
            ASK_COMMENT: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_comment),
                CallbackQueryHandler(skip_comment, pattern="^create_visit_skip$"),
                CallbackQueryHandler(back_to_status, pattern="^create_visit_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^create_visit_cancel$"),
            ],
            CONFIRM: [
                CallbackQueryHandler(save_visit, pattern="^create_visit_save$"),
                CallbackQueryHandler(back_to_comment, pattern="^create_visit_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^create_visit_cancel$"),
            ],
        },
        fallbacks=[CallbackQueryHandler(cancel_dialog, pattern="^create_visit_cancel$")],
        per_chat=True,
        per_user=True,
        per_message=False,
        name="create_visit_conv",
    )

