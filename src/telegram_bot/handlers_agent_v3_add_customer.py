"""
Обработчик добавления клиента v3 (FSM) с полным набором полей.

Архитектура:
- Линейный диалог: Название → ИНН → Фирма → Телефон → Контакт → Адрес → Город → Территория → Р/с → Экспедитор → Геолокация → Подтверждение
- Показ уже введённых данных с галочками после каждого шага
- Кнопки Назад/Пропустить/Отмена на каждом шаге
- Автопривязка login_agent из сессии
- Выбор login_expeditor из списка
- Опциональная геолокация (latitude/longitude)
- Все сообщения в конец чата (reply_text, не edit)
- Полная обработка ошибок и логирование
"""
import logging
import re
import traceback

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import (
    ContextTypes, ConversationHandler, CallbackQueryHandler, MessageHandler, filters,
)
from telegram.error import TelegramError

from .session import get_session, touch_session, delete_session
from .sds_api import api, SDSApiError
from .helpers import get_cached_user_logins
from .i18n import t, localize_literal

logger = logging.getLogger(__name__)

# FSM States
(
    ASK_NAME,
    ASK_TAX_ID,
    ASK_FIRM_NAME,
    ASK_PHONE,
    ASK_CONTACT_PERSON,
    ASK_ADDRESS,
    ASK_CITY,
    ASK_TERRITORY,
    ASK_ACCOUNT_NO,
    ASK_EXPEDITOR,
    ASK_LOCATION,
    CONFIRM,
) = range(12)

# User data keys prefix
PREFIX = "new_customer_v3_"


async def tr(
    update: Update | None,
    context: ContextTypes.DEFAULT_TYPE | None,
    key: str,
    default: str,
    **params,
) -> str:
    text = await t(update, context, key, **params)
    if text == key:
        text = default.format(**params) if params else default
    return text


CUSTOMER_I18N_MAP = {
    "❌ Отмена": ("telegram.button.cancel", "❌ Отмена"),
    "◀️ Назад": ("telegram.button.back", "◀️ Назад"),
    "⏩ Пропустить": ("telegram.button.skip", "⏩ Пропустить"),
    "✅ Создать клиента": ("telegram.customer_create.create_btn", "✅ Создать клиента"),
    "🔄 Обновить": ("telegram.button.refresh", "🔄 Обновить"),
    "📍 Отправить геолокацию": ("telegram.customer_create.send_location_btn", "📍 Отправить геолокацию"),
    "➕ *Добавление нового клиента*": ("telegram.customer_create.title", "➕ *Добавление нового клиента*"),
    "📝 Шаг 1 из 11: Введите *название клиента* (минимум 2 символа):": ("telegram.customer_create.step1", "📝 Шаг 1 из 11: Введите *название клиента* (минимум 2 символа):"),
    "📝 Шаг 2 из 11: Введите ИНН (9-12 цифр):": ("telegram.customer_create.step2_required_inn", "📝 Шаг 2 из 11: Введите ИНН (9-12 цифр):"),
    "📝 Шаг 3 из 11: Введите *название фирмы* или нажмите Пропустить:": ("telegram.customer_create.step3", "📝 Шаг 3 из 11: Введите *название фирмы* или нажмите Пропустить:"),
    "📝 Шаг 4 из 11: Введите *телефон* или нажмите Пропустить:": ("telegram.customer_create.step4", "📝 Шаг 4 из 11: Введите *телефон* или нажмите Пропустить:"),
    "📝 Шаг 5 из 11: Введите *контактное лицо* или нажмите Пропустить:": ("telegram.customer_create.step5", "📝 Шаг 5 из 11: Введите *контактное лицо* или нажмите Пропустить:"),
    "📝 Шаг 6 из 11: Введите *адрес* или нажмите Пропустить:": ("telegram.customer_create.step6", "📝 Шаг 6 из 11: Введите *адрес* или нажмите Пропустить:"),
    "📝 Шаг 7 из 11: Выберите *город* (обязательно):": ("telegram.customer_create.step7", "📝 Шаг 7 из 11: Выберите *город* (обязательно):"),
    "📝 Шаг 8 из 11: Выберите *территорию* (обязательно):": ("telegram.customer_create.step8", "📝 Шаг 8 из 11: Выберите *территорию* (обязательно):"),
    "📝 Шаг 9 из 11: Введите *расчётный счёт* или нажмите Пропустить:": ("telegram.customer_create.step9", "📝 Шаг 9 из 11: Введите *расчётный счёт* или нажмите Пропустить:"),
    "📝 Шаг 10 из 11: Выберите *экспедитора* или нажмите Пропустить:": ("telegram.customer_create.step10", "📝 Шаг 10 из 11: Выберите *экспедитора* или нажмите Пропустить:"),
    "📝 Шаг 11 из 11: Отправьте *геолокацию клиента*\n⚠️ _Обязательное поле_ - используйте кнопку ниже:": ("telegram.customer_create.step11", "📝 Шаг 11 из 11: Отправьте *геолокацию клиента*\n⚠️ _Обязательное поле_ - используйте кнопку ниже:"),
    "✅ *Проверьте введённые данные:*": ("telegram.customer_create.check_data", "✅ *Проверьте введённые данные:*"),
    "Всё верно?": ("telegram.customer_create.all_correct", "Всё верно?"),
    "⚠️ _Обязательное поле_": ("telegram.customer_create.required_field", "⚠️ _Обязательное поле_"),
    "❌ Сессия истекла. Нажмите /start.": ("telegram.auth.session_expired", "❌ Сессия истекла. Нажмите /start."),
    "❌ Добавление клиента отменено.\n\nНажмите /start для возврата в главное меню.": ("telegram.customer_create.cancelled", "❌ Добавление клиента отменено.\n\nНажмите /start для возврата в главное меню."),
    "❌ *Ошибка:* Название должно содержать минимум 2 символа.\n\nПопробуйте еще раз:": ("telegram.customer_create.error_name_min", "❌ *Ошибка:* Название должно содержать минимум 2 символа.\n\nПопробуйте еще раз:"),
    "❌ *Ошибка:* ИНН должен содержать от 9 до 12 цифр.\n\nПопробуйте еще раз:": ("telegram.customer_create.error_inn_format", "❌ *Ошибка:* ИНН должен содержать от 9 до 12 цифр.\n\nПопробуйте еще раз:"),
    "❌ *Ошибка:* Телефон должен содержать минимум 5 символов.\n\nПопробуйте еще раз:": ("telegram.customer_create.error_phone_min", "❌ *Ошибка:* Телефон должен содержать минимум 5 символов.\n\nПопробуйте еще раз:"),
    "❌ *Ошибка:* Геолокация обязательна!\n\nНажмите кнопку 📍 для отправки координат:": ("telegram.customer_create.error_location_required", "❌ *Ошибка:* Геолокация обязательна!\n\nНажмите кнопку 📍 для отправки координат:"),
    "❌ Невозможно продолжить: в справочнике нет городов.\nГород обязателен при создании клиента.\n\nПопросите администратора заполнить справочник и повторите попытку.": ("telegram.customer_create.error_no_cities", "❌ Невозможно продолжить: в справочнике нет городов.\nГород обязателен при создании клиента.\n\nПопросите администратора заполнить справочник и повторите попытку."),
    "❌ Невозможно продолжить: в справочнике нет территорий.\nТерритория обязательна при создании клиента.\n\nПопросите администратора заполнить справочник и повторите попытку.": ("telegram.customer_create.error_no_territories", "❌ Невозможно продолжить: в справочнике нет территорий.\nТерритория обязательна при создании клиента.\n\nПопросите администратора заполнить справочник и повторите попытку."),
    "⚠️ У вас уже активен диалог создания визита.\nПожалуйста, завершите его (нажмите Отмена) перед добавлением клиента.": ("telegram.customer_create.error_active_visit_dialog", "⚠️ У вас уже активен диалог создания визита.\nПожалуйста, завершите его (нажмите Отмена) перед добавлением клиента."),
    "⚠️ Экспедиторы не найдены в системе.": ("telegram.customer_create.expeditors_not_found", "⚠️ Экспедиторы не найдены в системе."),
    "📎 Нажмите на кнопку Скрепка 📎 для отправки локации клиента:": ("telegram.customer_create.attach_prompt", "📎 Нажмите на кнопку Скрепка 📎 для отправки локации клиента:"),
    "📎 *Нажмите на кнопку Скрепка 📎 для отправки локации клиента:*": ("telegram.customer_create.attach_prompt_md", "📎 *Нажмите на кнопку Скрепка 📎 для отправки локации клиента:*"),
    "👇 *Нажмите кнопку для отправки координат:*": ("telegram.customer_create.send_coords_prompt", "👇 *Нажмите кнопку для отправки координат:*"),
    "❌ Нельзя сохранить клиента.": ("telegram.customer_create.error_required_missing_head", "❌ Нельзя сохранить клиента."),
    "Обязательные поля не выбраны:": ("telegram.customer_create.error_required_missing_list", "Обязательные поля не выбраны:"),
    "Вернитесь назад и заполните их.": ("telegram.customer_create.error_required_missing_tail", "Вернитесь назад и заполните их."),
    "✅ *Клиент успешно создан!*": ("telegram.customer_create.success", "✅ *Клиент успешно создан!*"),
    "❌ *Ошибка при создании клиента:*": ("telegram.customer_create.error_create", "❌ *Ошибка при создании клиента:*"),
    "❌ *Неожиданная ошибка:*": ("telegram.customer_create.error_unexpected", "❌ *Неожиданная ошибка:*"),
    "Поле «Город» обязательно": ("telegram.customer_create.city_required_alert", "Поле «Город» обязательно"),
    "Поле «Территория» обязательно": ("telegram.customer_create.territory_required_alert", "Поле «Территория» обязательно"),
    "Название:": ("telegram.customer_create.summary.name", "Название:"),
    "ИНН:": ("telegram.customer_create.summary.tax_id", "ИНН:"),
    "Название фирмы:": ("telegram.customer_create.summary.firm_name", "Название фирмы:"),
    "Телефон:": ("telegram.customer_create.summary.phone", "Телефон:"),
    "Контактное лицо:": ("telegram.customer_create.summary.contact_person", "Контактное лицо:"),
    "Адрес:": ("telegram.customer_create.summary.address", "Адрес:"),
    "Город:": ("telegram.customer_create.summary.city", "Город:"),
    "Территория:": ("telegram.customer_create.summary.territory", "Территория:"),
    "Р/с:": ("telegram.customer_create.summary.account_no", "Р/с:"),
    "Экспедитор:": ("telegram.customer_create.summary.expeditor", "Экспедитор:"),
    "Координаты:": ("telegram.customer_create.summary.coords", "Координаты:"),
}


async def _localize_customer_text(
    update: Update | None,
    context: ContextTypes.DEFAULT_TYPE | None,
    text: str,
) -> str:
    if not text:
        return text
    out = text
    for src, (key, default) in CUSTOMER_I18N_MAP.items():
        if src in out:
            out = out.replace(src, await tr(update, context, key, default))
    return out


async def _localize_reply_markup(
    update: Update | None,
    context: ContextTypes.DEFAULT_TYPE | None,
    reply_markup,
):
    if isinstance(reply_markup, InlineKeyboardMarkup):
        rows = []
        for row in (reply_markup.inline_keyboard or []):
            new_row = []
            for btn in row:
                text = await _localize_customer_text(update, context, btn.text or "")
                text = await localize_literal(update, context, text)
                new_row.append(InlineKeyboardButton(text, callback_data=btn.callback_data, url=btn.url))
            rows.append(new_row)
        return InlineKeyboardMarkup(rows)
    if isinstance(reply_markup, ReplyKeyboardMarkup):
        rows = []
        for row in (reply_markup.keyboard or []):
            new_row = []
            for btn in row:
                text = await _localize_customer_text(update, context, getattr(btn, "text", "") or "")
                text = await localize_literal(update, context, text)
                new_row.append(KeyboardButton(text, request_location=getattr(btn, "request_location", None)))
            rows.append(new_row)
        return ReplyKeyboardMarkup(
            rows,
            resize_keyboard=reply_markup.resize_keyboard,
            one_time_keyboard=reply_markup.one_time_keyboard,
            selective=reply_markup.selective,
            input_field_placeholder=reply_markup.input_field_placeholder,
            is_persistent=reply_markup.is_persistent,
        )
    return reply_markup


# ============================================================================
# Helper: Escape Markdown (ИСПРАВЛЕНО)
# ============================================================================

def _escape_markdown(text: str) -> str:
    """
    Экранирует спецсимволы Markdown для безопасного отображения.

    ВАЖНО: Экранируем только те символы, которые действительно ломают Markdown.
    Не трогаем цифры, буквы, пробелы, и обычные символы в телефонах/счетах.
    """
    if not text:
        return text

    text = str(text)

    # Экранируем только критичные спецсимволы Markdown
    # НЕ экранируем: цифры, буквы, пробелы, +, -, (, ), точки в номерах
    escape_chars = ['_', '*', '[', ']', '`']

    for char in escape_chars:
        text = text.replace(char, '\\' + char)

    return text


# ============================================================================
# Helper: Safe send message with logging
# ============================================================================

async def _safe_send_message(
    update: Update | None,
    context: ContextTypes.DEFAULT_TYPE | None,
    message_obj,
    text: str,
    **kwargs,
) -> bool:
    """
    Безопасная отправка сообщения с логированием.

    Returns:
        True если сообщение отправлено, False если ошибка
    """
    try:
        logger.info(f"[SEND] Attempting to send message (length={len(text)})")
        logger.info(f"[SEND] text repr: {repr(text)}")
        logger.info(f"[SEND] text bytes (first 500): {text[:500].encode('utf-8')}")
        logger.info(f"[SEND] FULL TEXT:\n'''{text}'''")
        logger.info(f"[SEND] kwargs: {kwargs}")

        localized = await _localize_customer_text(update, context, text)
        if "reply_markup" in kwargs and kwargs["reply_markup"] is not None:
            kwargs["reply_markup"] = await _localize_reply_markup(update, context, kwargs["reply_markup"])
        result = await message_obj.reply_text(localized, **kwargs)

        logger.info(f"[SEND] Message sent successfully, message_id={result.message_id}")
        return True

    except TelegramError as e:
        logger.error(f"[SEND ERROR] Telegram API error: {e}")
        logger.error(f"[SEND ERROR] Message text: {text}")
        logger.error(f"[SEND ERROR] kwargs: {kwargs}")
        logger.error(f"[SEND ERROR] Traceback: {traceback.format_exc()}")
        return False
    except Exception as e:
        logger.error(f"[SEND ERROR] Unexpected error: {e}")
        logger.error(f"[SEND ERROR] Traceback: {traceback.format_exc()}")
        return False


async def _safe_edit_message(
    update: Update | None,
    context: ContextTypes.DEFAULT_TYPE | None,
    query,
    text: str,
    **kwargs,
) -> bool:
    """
    Безопасное редактирование сообщения с логированием.

    Returns:
        True если сообщение отредактировано, False если ошибка
    """
    try:
        logger.info(f"[EDIT] Attempting to edit message (length={len(text)})")
        logger.debug(f"[EDIT] Message text preview: {text[:200]}...")
        logger.debug(f"[EDIT] kwargs: {kwargs}")

        localized = await _localize_customer_text(update, context, text)
        if "reply_markup" in kwargs and kwargs["reply_markup"] is not None:
            kwargs["reply_markup"] = await _localize_reply_markup(update, context, kwargs["reply_markup"])
        result = await query.edit_message_text(localized, **kwargs)

        logger.info(f"[EDIT] Message edited successfully")
        return True

    except TelegramError as e:
        logger.error(f"[EDIT ERROR] Telegram API error: {e}")
        logger.error(f"[EDIT ERROR] Message text: {text}")
        logger.error(f"[EDIT ERROR] kwargs: {kwargs}")
        logger.error(f"[EDIT ERROR] Traceback: {traceback.format_exc()}")
        return False
    except Exception as e:
        logger.error(f"[EDIT ERROR] Unexpected error: {e}")
        logger.error(f"[EDIT ERROR] Traceback: {traceback.format_exc()}")
        return False


# ============================================================================
# Helper: Summary с галочками
# ============================================================================

def _get_summary(context: ContextTypes.DEFAULT_TYPE, show_all: bool = False) -> str:
    """
    Формирует summary уже введённых данных с галочками.

    Args:
        context: Контекст пользователя
        show_all: Если True, показывать все поля (даже пустые)

    Returns:
        Строка с форматированным списком полей
    """
    logger.debug("[SUMMARY] Building summary...")

    name = context.user_data.get(f"{PREFIX}name_client", "")
    tax_id = context.user_data.get(f"{PREFIX}tax_id", "")
    firm_name = context.user_data.get(f"{PREFIX}firm_name", "")
    phone = context.user_data.get(f"{PREFIX}phone", "")
    contact_person = context.user_data.get(f"{PREFIX}contact_person", "")
    address = context.user_data.get(f"{PREFIX}address", "")
    city = context.user_data.get(f"{PREFIX}city", "")
    territory = context.user_data.get(f"{PREFIX}territory", "")
    account_no = context.user_data.get(f"{PREFIX}account_no", "")
    expeditor_name = context.user_data.get(f"{PREFIX}expeditor_name", "")
    latitude = context.user_data.get(f"{PREFIX}latitude")
    longitude = context.user_data.get(f"{PREFIX}longitude")

    has_location = latitude is not None and longitude is not None

    logger.debug(f"[SUMMARY] name={name}, tax_id={tax_id}, phone={phone}, account_no={account_no}")
    logger.debug(f"[SUMMARY] tax_id type={type(tax_id)}, repr={repr(tax_id)}")
    logger.debug(f"[SUMMARY] phone type={type(phone)}, repr={repr(phone)}")

    lines = []
    if name or show_all:
        lines.append(f"{'✅' if name else '⬜'} Название: {_escape_markdown(name) if name else '—'}")
    if tax_id or show_all:
        lines.append(f"{'✅' if tax_id else '⬜'} ИНН: {_escape_markdown(str(tax_id)) if tax_id else '—'}")
    if firm_name or show_all:
        lines.append(f"{'✅' if firm_name else '⬜'} Название фирмы: {_escape_markdown(firm_name) if firm_name else '—'}")
    if phone or show_all:
        lines.append(f"{'✅' if phone else '⬜'} Телефон: {_escape_markdown(str(phone)) if phone else '—'}")
    if contact_person or show_all:
        lines.append(f"{'✅' if contact_person else '⬜'} Контактное лицо: {_escape_markdown(contact_person) if contact_person else '—'}")
    if address or show_all:
        lines.append(f"{'✅' if address else '⬜'} Адрес: {_escape_markdown(address) if address else '—'}")
    if city or show_all:
        lines.append(f"{'✅' if city else '⬜'} Город: {_escape_markdown(city) if city else '—'}")
    if territory or show_all:
        lines.append(f"{'✅' if territory else '⬜'} Территория: {_escape_markdown(territory) if territory else '—'}")
    if account_no or show_all:
        lines.append(f"{'✅' if account_no else '⬜'} Р/с: {_escape_markdown(str(account_no)) if account_no else '—'}")
    if expeditor_name or show_all:
        lines.append(f"{'✅' if expeditor_name else '⬜'} Экспедитор: {_escape_markdown(expeditor_name) if expeditor_name else '—'}")
    if has_location or show_all:
        loc_text = f"{latitude}, {longitude}" if has_location else "—"
        lines.append(f"{'✅' if has_location else '⬜'} Координаты: {loc_text}")

    result = "\n".join(lines)
    logger.debug(f"[SUMMARY] Built summary with {len(lines)} lines")

    return result


# ============================================================================
# Helper: Keyboards
# ============================================================================

def _cancel_keyboard() -> InlineKeyboardMarkup:
    """Только кнопка Отмена."""
    return InlineKeyboardMarkup([[InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")]])


def _skip_back_cancel_keyboard(skip_text: str = "⏩ Пропустить") -> InlineKeyboardMarkup:
    """Кнопки Пропустить/Назад/Отмена."""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(skip_text, callback_data="addcust_v3_skip")],
        [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
        [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
    ])


def _location_keyboard() -> ReplyKeyboardMarkup:
    """Reply-клавиатура с кнопкой отправки геолокации."""
    return ReplyKeyboardMarkup(
        [[KeyboardButton("📍 Отправить геолокацию", request_location=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


# ============================================================================
# Entry point
# ============================================================================

async def start_add_customer(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Начало диалога добавления клиента."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[START] User {tg_id} started add customer v3 dialog")

    # Проверка на активный диалог создания визита
    active_visit_keys = [k for k in context.user_data.keys() if k.startswith("new_visit_")]
    if active_visit_keys:
        logger.warning(f"[START] User {tg_id} has active visit dialog, blocking add customer")
        await _safe_edit_message(update, context, 
            q,
            "⚠️ У вас уже активен диалог создания визита.\n"
            "Пожалуйста, завершите его (нажмите Отмена) перед добавлением клиента."
        )
        return ConversationHandler.END

    session = await get_session(tg_id)
    if not session:
        logger.warning(f"[START] User {tg_id} has no session")
        await _safe_edit_message(update, context, q, "❌ Сессия истекла. Нажмите /start.")
        return ConversationHandler.END

    await touch_session(tg_id)

    # Очистка старых данных
    keys_to_clear = [k for k in context.user_data.keys() if k.startswith(PREFIX)]
    for key in keys_to_clear:
        context.user_data.pop(key, None)

    logger.debug(f"[START] Cleared {len(keys_to_clear)} old keys from context")

    text = (
        "➕ *Добавление нового клиента*\n\n"
        "📝 Шаг 1 из 11: Введите *название клиента* (минимум 2 символа):"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_cancel_keyboard(), parse_mode="Markdown")

    return ASK_NAME


# ============================================================================
# State: ASK_NAME
# ============================================================================

async def ask_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода названия клиента."""
    logger.info(f"[ASK_NAME] !!! FUNCTION CALLED !!! Update: {update}")
    logger.info(f"[ASK_NAME] Has message: {update.message is not None}")
    if update.message:
        logger.info(f"[ASK_NAME] Message text: '{update.message.text}'")

    tg_id = update.effective_user.id
    name = update.message.text.strip()

    logger.info(f"[ASK_NAME] User {tg_id} entered name: '{name}'")

    if len(name) < 2:
        logger.warning(f"[ASK_NAME] User {tg_id}: Name too short")
        await _safe_send_message(update, context, 
            update.message,
            "❌ *Ошибка:* Название должно содержать минимум 2 символа.\n\n"
            "Попробуйте еще раз:",
            reply_markup=_cancel_keyboard(),
            parse_mode="Markdown",
        )
        return ASK_NAME

    context.user_data[f"{PREFIX}name_client"] = name
    logger.info(f"[ASK_NAME] User {tg_id}: Name saved")

    summary = _get_summary(context)

    text = (
        f"➕ Добавление нового клиента\n"
        f"{summary}\n\n"
        f"📝 Шаг 2 из 11: Введите ИНН (9-12 цифр):\n"
        f"⚠️ Обязательное поле"
    )

    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
        [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
    ])

    success = await _safe_send_message(update, context, 
        update.message,
        text,
        reply_markup=kb,
        parse_mode="Markdown",
    )

    if not success:
        logger.error(f"[ASK_NAME] Failed to send message requesting tax_id!")
        return ASK_NAME

    logger.info(f"[ASK_NAME→ASK_TAX_ID] Transitioning to ASK_TAX_ID state")
    return ASK_TAX_ID


# ============================================================================
# State: ASK_TAX_ID (ИНН)
# ============================================================================

async def ask_tax_id(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода ИНН."""
    tg_id = update.effective_user.id
    tax_id = update.message.text.strip()

    logger.info(f"[ASK_TAX_ID] User {tg_id} entered tax_id: '{tax_id}'")
    logger.info(f"[ASK_TAX_ID] tax_id type: {type(tax_id)}, length: {len(tax_id)}")
    logger.info(f"[ASK_TAX_ID] tax_id repr: {repr(tax_id)}")
    logger.info(f"[ASK_TAX_ID] tax_id bytes: {tax_id.encode('utf-8')}")

    # Валидация: 9-12 цифр (ОБЯЗАТЕЛЬНОЕ ПОЛЕ)
    if not re.match(r"^\d{9,12}$", tax_id):
        logger.warning(f"[ASK_TAX_ID] User {tg_id}: Invalid tax_id format")

        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
            [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
        ])

        await _safe_send_message(update, context, 
            update.message,
            "❌ *Ошибка:* ИНН должен содержать от 9 до 12 цифр.\n\n"
            "Попробуйте еще раз:",
            reply_markup=kb,
            parse_mode="Markdown",
        )
        return ASK_TAX_ID

    context.user_data[f"{PREFIX}tax_id"] = tax_id
    logger.info(f"[ASK_TAX_ID] User {tg_id}: Tax ID saved")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 3 из 11: Введите *название фирмы* или нажмите Пропустить:"
    )

    await _safe_send_message(update, context, 
        update.message,
        text,
        reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"),
        parse_mode="Markdown",
    )

    return ASK_FIRM_NAME


async def skip_tax_id(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск ИНН."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    context.user_data.pop(f"{PREFIX}tax_id", None)
    logger.info(f"[SKIP] User {tg_id}: Skipped tax_id")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 3 из 11: Введите *название фирмы* или нажмите Пропустить:"
    )

    await _safe_send_message(update, context, 
        q,
        text,
        reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"),
        parse_mode="Markdown",
    )

    return ASK_FIRM_NAME


async def back_to_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу названия."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to name from tax_id")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 1 из 11: Введите *название клиента* (минимум 2 символа):"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_cancel_keyboard(), parse_mode="Markdown")

    return ASK_NAME


# ИНН - обязательное поле, пропуск удален


# ============================================================================
# State: ASK_FIRM_NAME
# ============================================================================

async def ask_firm_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода названия фирмы."""
    tg_id = update.effective_user.id
    firm_name = update.message.text.strip()

    logger.info(f"[ASK_FIRM_NAME] User {tg_id} entered firm_name: '{firm_name}'")

    context.user_data[f"{PREFIX}firm_name"] = firm_name
    logger.info(f"[ASK_FIRM_NAME] User {tg_id}: Firm name saved")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 4 из 11: Введите *телефон* или нажмите Пропустить:"
    )

    await _safe_send_message(update, context, 
        update.message,
        text,
        reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"),
        parse_mode="Markdown",
    )

    return ASK_PHONE


async def back_to_tax_id(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу ИНН."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to tax_id from firm_name")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 2 из 11: Введите *ИНН* (9-12 цифр) или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить ИНН"), parse_mode="Markdown")

    return ASK_TAX_ID


async def skip_firm_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск названия фирмы."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    context.user_data.pop(f"{PREFIX}firm_name", None)
    logger.info(f"[SKIP] User {tg_id}: Skipped firm_name")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 4 из 11: Введите *телефон* или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"), parse_mode="Markdown")

    return ASK_PHONE


# ============================================================================
# State: ASK_PHONE
# ============================================================================

async def ask_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода телефона."""
    tg_id = update.effective_user.id
    phone = update.message.text.strip()

    logger.info(f"[ASK_PHONE] User {tg_id} entered phone: '{phone}'")
    logger.info(f"[ASK_PHONE] phone type: {type(phone)}, length: {len(phone)}")
    logger.info(f"[ASK_PHONE] phone repr: {repr(phone)}")
    logger.info(f"[ASK_PHONE] phone bytes: {phone.encode('utf-8')}")

    # Валидация телефона (минимум 5 символов, ОБЯЗАТЕЛЬНОЕ ПОЛЕ)
    if len(phone) < 5:
        logger.warning(f"[ASK_PHONE] User {tg_id}: Phone too short")

        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
            [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
        ])

        await _safe_send_message(update, context, 
            update.message,
            "❌ *Ошибка:* Телефон должен содержать минимум 5 символов.\n\n"
            "Попробуйте еще раз:",
            reply_markup=kb,
            parse_mode="Markdown",
        )
        return ASK_PHONE

    context.user_data[f"{PREFIX}phone"] = phone
    logger.info(f"[ASK_PHONE] User {tg_id}: Phone saved")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 5 из 11: Введите *контактное лицо* или нажмите Пропустить:"
    )

    await _safe_send_message(update, context, 
        update.message,
        text,
        reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"),
        parse_mode="Markdown",
    )

    return ASK_CONTACT_PERSON


async def skip_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск телефона."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    context.user_data.pop(f"{PREFIX}phone", None)
    logger.info(f"[SKIP] User {tg_id}: Skipped phone")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 5 из 11: Введите *контактное лицо* или нажмите Пропустить:"
    )

    await _safe_send_message(update, context, 
        q,
        text,
        reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"),
        parse_mode="Markdown",
    )

    return ASK_CONTACT_PERSON


async def back_to_firm_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу названия фирмы."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to firm_name from phone")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 3 из 11: Введите *название фирмы* или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"), parse_mode="Markdown")

    return ASK_FIRM_NAME


# Телефон - обязательное поле, пропуск удален


# ============================================================================
# State: ASK_CONTACT_PERSON
# ============================================================================

async def ask_contact_person(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода контактного лица."""
    tg_id = update.effective_user.id
    contact_person = update.message.text.strip()

    logger.info(f"[ASK_CONTACT] User {tg_id} entered contact_person: '{contact_person}'")

    context.user_data[f"{PREFIX}contact_person"] = contact_person
    logger.info(f"[ASK_CONTACT] User {tg_id}: Contact person saved")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 6 из 11: Введите *адрес* или нажмите Пропустить:"
    )

    await _safe_send_message(update, context, 
        update.message,
        text,
        reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"),
        parse_mode="Markdown",
    )

    return ASK_ADDRESS


async def back_to_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу телефона."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to phone from contact_person")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 4 из 11: Введите *телефон* или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"), parse_mode="Markdown")

    return ASK_PHONE


async def skip_contact_person(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск контактного лица."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    context.user_data.pop(f"{PREFIX}contact_person", None)
    logger.info(f"[SKIP] User {tg_id}: Skipped contact_person")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 6 из 11: Введите *адрес* или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"), parse_mode="Markdown")

    return ASK_ADDRESS


# ============================================================================
# State: ASK_ADDRESS
# ============================================================================

async def ask_address(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода адреса."""
    tg_id = update.effective_user.id
    address = update.message.text.strip()

    logger.info(f"[ASK_ADDRESS] User {tg_id} entered address: '{address}'")

    context.user_data[f"{PREFIX}address"] = address
    logger.info(f"[ASK_ADDRESS] User {tg_id}: Address saved")

    # Переход к выбору города
    return await _show_city_list(update, context, is_callback=False)


async def back_to_contact_person(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу контактного лица."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to contact_person from address")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 5 из 11: Введите *контактное лицо* или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"), parse_mode="Markdown")

    return ASK_CONTACT_PERSON


async def skip_address(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск адреса."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    context.user_data.pop(f"{PREFIX}address", None)
    logger.info(f"[SKIP] User {tg_id}: Skipped address")

    # Переход к выбору города
    return await _show_city_list(update, context, is_callback=True)


# ============================================================================
# State: ASK_CITY
# ============================================================================

async def _show_city_list(update: Update, context: ContextTypes.DEFAULT_TYPE, is_callback: bool) -> int:
    """Показать список городов для выбора."""
    tg_id = update.effective_user.id

    logger.info(f"[CITY] User {tg_id}: Fetching cities list...")

    session = await get_session(tg_id)
    if not session:
        logger.warning(f"[CITY] User {tg_id}: No session")
        msg = "❌ Сессия истекла. Нажмите /start."
        if is_callback:
            await _safe_edit_message(update, context, update.callback_query, msg)
        else:
            await _safe_send_message(update, context, update.message, msg)
        return ConversationHandler.END

    await touch_session(tg_id)

    # Получить список городов через API
    try:
        logger.info(f"[CITY API] Calling get_cities...")
        cities = await api.get_cities(session.jwt_token)
        logger.info(f"[CITY API] Got {len(cities)} cities: {cities}")

    except SDSApiError as e:
        logger.error(f"[CITY API ERROR] User {tg_id}: API error: {e}, status={e.status}, detail={e.detail}")
        if e.status == 401:
            await delete_session(tg_id)
            msg = "❌ Сессия истекла. Нажмите /start."
            if is_callback:
                await _safe_edit_message(update, context, update.callback_query, msg)
            else:
                await _safe_send_message(update, context, update.message, msg)
            return ConversationHandler.END
        cities = []
    except Exception as e:
        logger.error(f"[CITY API ERROR] User {tg_id}: Unexpected error: {e}")
        logger.error(f"[CITY API ERROR] Traceback: {traceback.format_exc()}")
        cities = []

    summary = _get_summary(context)

    if not cities:
        logger.warning(f"[CITY] User {tg_id}: No cities found, cannot continue")
        text = (
            f"➕ *Добавление нового клиента*\n"
            f"{summary}\n\n"
            f"❌ Невозможно продолжить: в справочнике нет городов.\n"
            f"Город обязателен при создании клиента.\n\n"
            f"Попросите администратора заполнить справочник и повторите попытку."
        )

        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔄 Обновить", callback_data="addcust_v3_retry_city")],
            [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
            [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
        ])

        if is_callback:
            await _safe_edit_message(update, context, update.callback_query, text, reply_markup=kb, parse_mode="Markdown")
        else:
            await _safe_send_message(update, context, update.message, text, reply_markup=kb, parse_mode="Markdown")
        return ASK_CITY

    # Создать кнопки с городами
    logger.info(f"[CITY] Building buttons for {len(cities)} cities")
    buttons = []
    for city in cities:
        city_id = city.get("id")
        city_name = city.get("name", str(city_id))
        logger.debug(f"[CITY] Adding button: {city_name} (id={city_id})")
        buttons.append([InlineKeyboardButton(city_name, callback_data=f"addcust_v3_city_{city_id}")])

    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")])
    buttons.append([InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")])

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 7 из 11: Выберите *город* (обязательно):"
    )

    if is_callback:
        await _safe_edit_message(update, context, update.callback_query, text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")
    else:
        await _safe_send_message(update, context, update.message, text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")

    logger.info(f"[CITY] City selection displayed")

    return ASK_CITY


async def select_city(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка выбора города."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    city_id_str = q.data.replace("addcust_v3_city_", "")
    city_id = int(city_id_str)

    logger.info(f"[SELECT_CITY] User {tg_id} selected city_id: {city_id}")

    # Получить название города для отображения
    session = await get_session(tg_id)
    if session:
        try:
            cities = await api.get_cities(session.jwt_token)
            city = next((c for c in cities if c.get("id") == city_id), None)
            city_name = city.get("name", str(city_id)) if city else str(city_id)
        except Exception as e:
            logger.error(f"[SELECT_CITY] Error fetching city name: {e}")
            city_name = str(city_id)
    else:
        city_name = str(city_id)

    context.user_data[f"{PREFIX}city_id"] = city_id
    context.user_data[f"{PREFIX}city"] = city_name  # Для отображения в summary
    logger.info(f"[SELECT_CITY] User {tg_id}: City saved: id={city_id}, name={city_name}")

    # Переход к территориям
    return await _show_territory_list(update, context, is_callback=True)


async def back_to_address(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу адреса."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to address from city")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 6 из 11: Введите *адрес* или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"), parse_mode="Markdown")

    return ASK_ADDRESS


async def skip_city(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск города запрещён."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[SKIP] User {tg_id}: Skip city blocked (required field)")
    await q.answer(await _localize_customer_text(update, context, "Поле «Город» обязательно"), show_alert=True)
    return await _show_city_list(update, context, is_callback=True)


# ============================================================================
# State: ASK_TERRITORY
# ============================================================================

async def _show_territory_list(update: Update, context: ContextTypes.DEFAULT_TYPE, is_callback: bool) -> int:
    """Показать список территорий для выбора."""
    tg_id = update.effective_user.id

    logger.info(f"[TERRITORY] User {tg_id}: Fetching territories list...")

    session = await get_session(tg_id)
    if not session:
        logger.warning(f"[TERRITORY] User {tg_id}: No session")
        msg = "❌ Сессия истекла. Нажмите /start."
        if is_callback:
            await _safe_edit_message(update, context, update.callback_query, msg)
        else:
            await _safe_send_message(update, context, update.message, msg)
        return ConversationHandler.END

    await touch_session(tg_id)

    # Получить список территорий через API
    try:
        logger.info(f"[TERRITORY API] Calling get_territories...")
        territories = await api.get_territories(session.jwt_token)
        logger.info(f"[TERRITORY API] Got {len(territories)} territories: {territories}")

    except SDSApiError as e:
        logger.error(f"[TERRITORY API ERROR] User {tg_id}: API error: {e}, status={e.status}, detail={e.detail}")
        if e.status == 401:
            await delete_session(tg_id)
            msg = "❌ Сессия истекла. Нажмите /start."
            if is_callback:
                await _safe_edit_message(update, context, update.callback_query, msg)
            else:
                await _safe_send_message(update, context, update.message, msg)
            return ConversationHandler.END
        territories = []
    except Exception as e:
        logger.error(f"[TERRITORY API ERROR] User {tg_id}: Unexpected error: {e}")
        logger.error(f"[TERRITORY API ERROR] Traceback: {traceback.format_exc()}")
        territories = []

    summary = _get_summary(context)

    if not territories:
        logger.warning(f"[TERRITORY] User {tg_id}: No territories found, cannot continue")
        text = (
            f"➕ *Добавление нового клиента*\n"
            f"{summary}\n\n"
            f"❌ Невозможно продолжить: в справочнике нет территорий.\n"
            f"Территория обязательна при создании клиента.\n\n"
            f"Попросите администратора заполнить справочник и повторите попытку."
        )

        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔄 Обновить", callback_data="addcust_v3_retry_territory")],
            [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
            [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
        ])

        if is_callback:
            await _safe_edit_message(update, context, update.callback_query, text, reply_markup=kb, parse_mode="Markdown")
        else:
            await _safe_send_message(update, context, update.message, text, reply_markup=kb, parse_mode="Markdown")

        return ASK_TERRITORY

    # Создать кнопки с территориями
    logger.info(f"[TERRITORY] Building buttons for {len(territories)} territories")
    buttons = []
    for territory in territories:
        territory_id = territory.get("id")
        territory_name = territory.get("name", str(territory_id))
        logger.debug(f"[TERRITORY] Adding button: {territory_name} (id={territory_id})")
        buttons.append([InlineKeyboardButton(territory_name, callback_data=f"addcust_v3_terr_{territory_id}")])

    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")])
    buttons.append([InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")])

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 8 из 11: Выберите *территорию* (обязательно):"
    )

    if is_callback:
        await _safe_edit_message(update, context, update.callback_query, text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")
    else:
        await _safe_send_message(update, context, update.message, text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")

    logger.info(f"[TERRITORY] Territory selection displayed")

    return ASK_TERRITORY


async def select_territory(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка выбора территории."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    territory_id_str = q.data.replace("addcust_v3_terr_", "")
    territory_id = int(territory_id_str)

    logger.info(f"[SELECT_TERRITORY] User {tg_id} selected territory_id: {territory_id}")

    # Получить название территории для отображения
    session = await get_session(tg_id)
    if session:
        try:
            territories = await api.get_territories(session.jwt_token)
            territory = next((t for t in territories if t.get("id") == territory_id), None)
            territory_name = territory.get("name", str(territory_id)) if territory else str(territory_id)
        except Exception as e:
            logger.error(f"[SELECT_TERRITORY] Error fetching territory name: {e}")
            territory_name = str(territory_id)
    else:
        territory_name = str(territory_id)

    context.user_data[f"{PREFIX}territory_id"] = territory_id
    context.user_data[f"{PREFIX}territory"] = territory_name  # Для отображения в summary
    logger.info(f"[SELECT_TERRITORY] User {tg_id}: Territory saved: id={territory_id}, name={territory_name}")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 9 из 11: Введите *расчётный счёт* или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"), parse_mode="Markdown")

    return ASK_ACCOUNT_NO


async def back_to_city(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к выбору города."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to city from territory")

    # Показать список городов снова
    return await _show_city_list(update, context, is_callback=True)


async def skip_territory(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск территории запрещён."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[SKIP] User {tg_id}: Skip territory blocked (required field)")
    await q.answer(await _localize_customer_text(update, context, "Поле «Территория» обязательно"), show_alert=True)
    return await _show_territory_list(update, context, is_callback=True)


async def retry_city(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Повторная загрузка списка городов."""
    q = update.callback_query
    await q.answer()
    return await _show_city_list(update, context, is_callback=True)


async def retry_territory(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Повторная загрузка списка территорий."""
    q = update.callback_query
    await q.answer()
    return await _show_territory_list(update, context, is_callback=True)


# ============================================================================
# State: ASK_ACCOUNT_NO
# ============================================================================

async def ask_account_no(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка ввода расчётного счёта."""
    tg_id = update.effective_user.id
    account_no = update.message.text.strip()

    logger.info(f"[ASK_ACCOUNT] User {tg_id} entered account_no: '{account_no}'")

    context.user_data[f"{PREFIX}account_no"] = account_no
    logger.info(f"[ASK_ACCOUNT] User {tg_id}: Account no saved")

    # Переход к выбору экспедитора
    return await _show_expeditor_list(update, context, is_callback=False)


async def back_to_territory(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу территории."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to territory from account_no")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 8 из 11: Введите *территорию* или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"), parse_mode="Markdown")

    return ASK_TERRITORY


async def skip_account_no(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск расчётного счёта."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    context.user_data.pop(f"{PREFIX}account_no", None)
    logger.info(f"[SKIP] User {tg_id}: Skipped account_no")

    # Переход к выбору экспедитора
    return await _show_expeditor_list(update, context, is_callback=True)


# ============================================================================
# State: ASK_EXPEDITOR
# ============================================================================

async def _show_expeditor_list(update: Update, context: ContextTypes.DEFAULT_TYPE, is_callback: bool) -> int:
    """Показать список экспедиторов для выбора."""
    tg_id = update.effective_user.id

    logger.info(f"[EXPEDITOR] User {tg_id}: Fetching expeditors list...")

    session = await get_session(tg_id)
    if not session:
        logger.warning(f"[EXPEDITOR] User {tg_id}: No session")
        msg = "❌ Сессия истекла. Нажмите /start."
        if is_callback:
            await _safe_edit_message(update, context, update.callback_query, msg)
        else:
            await _safe_send_message(update, context, update.message, msg)
        return ConversationHandler.END

    await touch_session(tg_id)

    # Получить список экспедиторов через API (кэшированный, обновляется каждые 5 минут)
    try:
        logger.info(f"[EXPEDITOR API] Calling get_cached_user_logins...")
        users = await get_cached_user_logins(session.jwt_token)
        logger.info(f"[EXPEDITOR API] Got {len(users)} users total")

        expeditors = [u for u in users if u.get("role") == "expeditor"]
        logger.info(f"[EXPEDITOR API] Found {len(expeditors)} expeditors: {[u.get('login') for u in expeditors]}")

    except SDSApiError as e:
        logger.error(f"[EXPEDITOR API ERROR] User {tg_id}: API error: {e}, status={e.status}, detail={e.detail}")
        if e.status == 401:
            await delete_session(tg_id)
            msg = "❌ Сессия истекла. Нажмите /start."
            if is_callback:
                await _safe_edit_message(update, context, update.callback_query, msg)
            else:
                await _safe_send_message(update, context, update.message, msg)
            return ConversationHandler.END
        expeditors = []
    except Exception as e:
        logger.error(f"[EXPEDITOR API ERROR] User {tg_id}: Unexpected error: {e}")
        logger.error(f"[EXPEDITOR API ERROR] Traceback: {traceback.format_exc()}")
        expeditors = []

    summary = _get_summary(context)

    if not expeditors:
        logger.warning(f"[EXPEDITOR] User {tg_id}: No expeditors found, skipping to location")
        # Переход к геолокации
        text = (
            f"➕ *Добавление нового клиента*\n"
            f"{summary}\n\n"
            f"⚠️ Экспедиторы не найдены в системе.\n\n"
            f"📝 Шаг 11 из 11: Отправьте *геолокацию клиента*\n"
            f"⚠️ _Обязательное поле_ - используйте кнопку ниже:"
        )

        # Геолокация ОБЯЗАТЕЛЬНА - нет кнопки "Пропустить"
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
            [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
        ])

        if is_callback:
            await _safe_edit_message(update, context, update.callback_query, text, reply_markup=kb, parse_mode="Markdown")
        else:
            await _safe_send_message(update, context, update.message, text, reply_markup=kb, parse_mode="Markdown")

        # Отправить reply-клавиатуру с кнопкой геолокации
        await update.effective_chat.send_message(
            "📎 Нажмите на кнопку Скрепка 📎 для отправки локации клиента:",
            reply_markup=_location_keyboard(),
        )

        return ASK_LOCATION

    # Создать кнопки с экспедиторами
    logger.info(f"[EXPEDITOR] Building buttons for {len(expeditors)} expeditors")
    buttons = []
    for exp in expeditors:
        login = exp.get("login", "")
        fio = exp.get("fio", login)
        logger.debug(f"[EXPEDITOR] Adding button: {fio} (login={login})")
        buttons.append([InlineKeyboardButton(fio, callback_data=f"addcust_v3_exp_{login}")])

    buttons.append([InlineKeyboardButton("⏩ Пропустить", callback_data="addcust_v3_skip")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")])
    buttons.append([InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")])

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 10 из 11: Выберите *экспедитора* или нажмите Пропустить:"
    )

    if is_callback:
        await _safe_edit_message(update, context, update.callback_query, text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")
    else:
        await _safe_send_message(update, context, update.message, text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")

    logger.info(f"[EXPEDITOR] Expeditor selection displayed")

    return ASK_EXPEDITOR


async def select_expeditor(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка выбора экспедитора."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    login = q.data.replace("addcust_v3_exp_", "")

    logger.info(f"[SELECT_EXP] User {tg_id} selected expeditor: '{login}'")

    # Получить ФИО экспедитора для отображения
    session = await get_session(tg_id)
    if session:
        try:
            users = await get_cached_user_logins(session.jwt_token)
            expeditor = next((u for u in users if u.get("login") == login), None)
            expeditor_name = expeditor.get("fio", login) if expeditor else login
        except Exception as e:
            logger.error(f"[SELECT_EXP] Error fetching expeditor name: {e}")
            expeditor_name = login
    else:
        expeditor_name = login

    context.user_data[f"{PREFIX}login_expeditor"] = login
    context.user_data[f"{PREFIX}expeditor_name"] = expeditor_name
    logger.info(f"[SELECT_EXP] User {tg_id}: Expeditor saved: {login} ({expeditor_name})")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 11 из 11: Отправьте *геолокацию клиента*\n"
        f"⚠️ _Обязательное поле_ - используйте кнопку ниже:"
    )

    # Геолокация ОБЯЗАТЕЛЬНА - нет кнопки "Пропустить"
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
        [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
    ])

    await _safe_edit_message(update, context, q, text, reply_markup=kb, parse_mode="Markdown")

    # Отправить reply-клавиатуру с кнопкой геолокации
    await q.message.reply_text(
        "📎 *Нажмите на кнопку Скрепка 📎 для отправки локации клиента:*",
        reply_markup=_location_keyboard(),
        parse_mode="Markdown",
    )

    logger.info(f"[SELECT_EXP] Location keyboard sent")

    return ASK_LOCATION


async def back_to_account_no(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к вводу расчётного счёта."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to account_no from expeditor")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 9 из 11: Введите *расчётный счёт* или нажмите Пропустить:"
    )

    await _safe_edit_message(update, context, q, text, reply_markup=_skip_back_cancel_keyboard("⏩ Пропустить"), parse_mode="Markdown")

    return ASK_ACCOUNT_NO


async def skip_expeditor(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск выбора экспедитора."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    context.user_data.pop(f"{PREFIX}login_expeditor", None)
    context.user_data.pop(f"{PREFIX}expeditor_name", None)
    logger.info(f"[SKIP] User {tg_id}: Skipped expeditor")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 11 из 11: Отправьте *геолокацию клиента*\n"
        f"⚠️ _Обязательное поле_ - используйте кнопку ниже:"
    )

    # Геолокация ОБЯЗАТЕЛЬНА - нет кнопки "Пропустить"
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
        [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
    ])

    await _safe_edit_message(update, context, q, text, reply_markup=kb, parse_mode="Markdown")

    # Отправить reply-клавиатуру с кнопкой геолокации
    await q.message.reply_text(
        "📎 *Нажмите на кнопку Скрепка 📎 для отправки локации клиента:*",
        reply_markup=_location_keyboard(),
        parse_mode="Markdown",
    )

    logger.info(f"[SKIP] Location keyboard sent")

    return ASK_LOCATION


# ============================================================================
# State: ASK_LOCATION
# ============================================================================

async def ask_location(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Обработка отправленной геолокации."""
    tg_id = update.effective_user.id
    location = update.message.location

    logger.info(f"[LOCATION] User {tg_id} sent location: {location}")

    # ОБЯЗАТЕЛЬНОЕ ПОЛЕ - геолокация должна быть отправлена
    if not location:
        logger.warning(f"[LOCATION] User {tg_id}: Location is None")

        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
            [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
        ])

        await _safe_send_message(update, context, 
            update.message,
            "❌ *Ошибка:* Геолокация обязательна!\n\n"
            "Нажмите кнопку 📍 для отправки координат:",
            reply_markup=kb,
            parse_mode="Markdown",
        )

        # Отправить reply-клавиатуру снова
        await update.effective_chat.send_message(
            "👇 *Нажмите кнопку для отправки координат:*",
            reply_markup=_location_keyboard(),
            parse_mode="Markdown",
        )

        return ASK_LOCATION

    context.user_data[f"{PREFIX}latitude"] = location.latitude
    context.user_data[f"{PREFIX}longitude"] = location.longitude
    logger.info(f"[LOCATION] User {tg_id}: Location saved: lat={location.latitude}, lon={location.longitude}")

    # Убрать reply-клавиатуру и показать подтверждение
    return await _show_confirm(update, context, is_callback=False)


async def skip_location(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Пропуск геолокации."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    context.user_data.pop(f"{PREFIX}latitude", None)
    context.user_data.pop(f"{PREFIX}longitude", None)
    logger.info(f"[SKIP] User {tg_id}: Skipped location")

    # Показать подтверждение
    return await _show_confirm(q, context, is_callback=True)


async def back_to_expeditor(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к выбору экспедитора."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to expeditor from location")

    # Показать список экспедиторов снова
    return await _show_expeditor_list(update, context, is_callback=True)


# Геолокация - обязательное поле, пропуск удален


async def back_to_location(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Возврат к геолокации с экрана подтверждения."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[BACK] User {tg_id}: Back to location from confirm")

    summary = _get_summary(context)

    text = (
        f"➕ *Добавление нового клиента*\n"
        f"{summary}\n\n"
        f"📝 Шаг 11 из 11: Отправьте *геолокацию клиента*\n"
        f"⚠️ _Обязательное поле_ - используйте кнопку ниже:"
    )

    # Геолокация ОБЯЗАТЕЛЬНА - нет кнопки "Пропустить"
    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
        [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
    ])

    await _safe_edit_message(update, context, q, text, reply_markup=kb, parse_mode="Markdown")

    # Отправить reply-клавиатуру с кнопкой геолокации
    await q.message.reply_text(
        "📎 *Нажмите на кнопку Скрепка 📎 для отправки локации клиента:*",
        reply_markup=_location_keyboard(),
        parse_mode="Markdown",
    )

    return ASK_LOCATION


# ============================================================================
# State: CONFIRM
# ============================================================================

async def _show_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE, is_callback: bool) -> int:
    """Показать экран подтверждения со всеми введёнными данными."""
    tg_id = update.effective_user.id

    logger.info(f"[CONFIRM] User {tg_id}: Showing confirmation screen")

    summary = _get_summary(context, show_all=True)

    text = (
        f"➕ *Добавление нового клиента*\n\n"
        f"✅ *Проверьте введённые данные:*\n"
        f"{summary}\n\n"
        f"Всё верно?"
    )

    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("✅ Создать клиента", callback_data="addcust_v3_save")],
        [InlineKeyboardButton("◀️ Назад", callback_data="addcust_v3_back")],
        [InlineKeyboardButton("❌ Отмена", callback_data="addcust_v3_cancel")],
    ])

    if is_callback:
        await _safe_edit_message(update, context, 
            update.callback_query,
            text, reply_markup=kb, parse_mode="Markdown"
        )
    else:
        # Убрать reply-клавиатуру
        await _safe_send_message(update, context, 
            update.message,
            text, reply_markup=kb, parse_mode="Markdown"
        )
        # Удалить reply-клавиатуру
        try:
            msg = await update.message.reply_text(
                ".", reply_markup=ReplyKeyboardRemove()
            )
            # Удалить сообщение с точкой
            await msg.delete()
        except Exception as e:
            logger.error(f"[CONFIRM] Error removing reply keyboard: {e}")

    logger.info(f"[CONFIRM] Confirmation screen displayed")

    return CONFIRM


async def save_customer(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Сохранение клиента через API."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[SAVE] User {tg_id}: Starting customer save...")

    session = await get_session(tg_id)
    if not session:
        logger.warning(f"[SAVE] User {tg_id}: No session")
        await _safe_edit_message(update, context, q, "❌ Сессия истекла. Нажмите /start.")
        return ConversationHandler.END

    await touch_session(tg_id)

    city_id = context.user_data.get(f"{PREFIX}city_id")
    territory_id = context.user_data.get(f"{PREFIX}territory_id")
    if not city_id or not territory_id:
        missing_fields = []
        if not city_id:
            missing_fields.append("Город")
        if not territory_id:
            missing_fields.append("Территория")
        await _safe_edit_message(update, context, 
            q,
            "❌ Нельзя сохранить клиента.\n"
            f"Обязательные поля не выбраны: *{', '.join(missing_fields)}*.\n"
            "Вернитесь назад и заполните их.",
            parse_mode="Markdown",
        )
        return CONFIRM

    # Собрать данные клиента
    customer_data = {
        "name_client": context.user_data.get(f"{PREFIX}name_client", ""),
        "tax_id": context.user_data.get(f"{PREFIX}tax_id"),
        "firm_name": context.user_data.get(f"{PREFIX}firm_name"),
        "phone": context.user_data.get(f"{PREFIX}phone"),
        "contact_person": context.user_data.get(f"{PREFIX}contact_person"),
        "address": context.user_data.get(f"{PREFIX}address"),
        "city_id": context.user_data.get(f"{PREFIX}city_id"),  # ИЗМЕНЕНО: city_id вместо city
        "territory_id": context.user_data.get(f"{PREFIX}territory_id"),  # ИЗМЕНЕНО: territory_id вместо territory
        "account_no": context.user_data.get(f"{PREFIX}account_no"),
        "login_agent": session.login,  # ВАЖНО: автопривязка агента!
        "login_expeditor": context.user_data.get(f"{PREFIX}login_expeditor"),
        "latitude": context.user_data.get(f"{PREFIX}latitude"),
        "longitude": context.user_data.get(f"{PREFIX}longitude"),
    }

    # Удалить None значения
    customer_data = {k: v for k, v in customer_data.items() if v is not None}

    logger.info(f"[SAVE API] User {tg_id}: Creating customer with data: {customer_data}")

    try:
        result = await api.create_customer(session.jwt_token, customer_data)
        customer_id = result.get("id")

        logger.info(f"[SAVE API SUCCESS] User {tg_id}: Customer created, ID={customer_id}")

        await _safe_edit_message(update, context, 
            q,
            f"✅ *Клиент успешно создан!*\n\n"
            f"ID: *{customer_id}*\n"
            f"Название: *{_escape_markdown(customer_data['name_client'])}*",
            parse_mode="Markdown",
        )

        # Очистка данных
        keys_to_clear = [k for k in context.user_data.keys() if k.startswith(PREFIX)]
        for key in keys_to_clear:
            context.user_data.pop(key, None)

        logger.info(f"[SAVE] User {tg_id}: Cleared {len(keys_to_clear)} context keys")

        # Показать главное меню


        from .handlers_auth import show_main_menu
        await show_main_menu(update, context, session)

        return ConversationHandler.END

    except SDSApiError as e:
        logger.error(f"[SAVE API ERROR] User {tg_id}: API error: {e}, status={e.status}, detail={e.detail}")

        if e.status == 401:
            await delete_session(tg_id)
            await _safe_edit_message(update, context, q, "❌ Сессия истекла. Нажмите /start.")
            return ConversationHandler.END

        error_fmt = _escape_markdown(str(e.detail))
        await _safe_edit_message(update, context, 
            q,
            f"❌ *Ошибка при создании клиента:*\n\n{error_fmt}\n\nПопробуйте снова или нажмите /start.",
            parse_mode="Markdown",
        )

        return ConversationHandler.END

    except Exception as e:
        logger.error(f"[SAVE ERROR] User {tg_id}: Unexpected error: {e}")
        logger.error(f"[SAVE ERROR] Traceback: {traceback.format_exc()}")

        error_fmt = _escape_markdown(str(e))
        await _safe_edit_message(update, context, 
            q,
            f"❌ *Неожиданная ошибка:*\n\n{error_fmt}\n\nПопробуйте снова или нажмите /start.",
            parse_mode="Markdown",
        )

        return ConversationHandler.END


# ============================================================================
# Cancel dialog
# ============================================================================

async def cancel_dialog(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Отмена диалога добавления клиента."""
    q = update.callback_query
    await q.answer()
    tg_id = q.from_user.id

    logger.info(f"[CANCEL] User {tg_id}: Cancelled add customer v3")

    # Очистка данных
    keys_to_clear = [k for k in context.user_data.keys() if k.startswith(PREFIX)]
    for key in keys_to_clear:
        context.user_data.pop(key, None)

    logger.info(f"[CANCEL] Cleared {len(keys_to_clear)} context keys")

    await _safe_edit_message(update, context, 
        q,
        "❌ Добавление клиента отменено.\n\nНажмите /start для возврата в главное меню."
    )

    # Убрать reply-клавиатуру если была
    try:
        msg = await q.message.reply_text(
            await t(update, context, "telegram.common.processing", fallback="..."),
            reply_markup=ReplyKeyboardRemove(),
        )
        await msg.delete()
    except Exception as e:
        logger.error(f"[CANCEL] Error removing reply keyboard: {e}")

    return ConversationHandler.END


# ============================================================================
# ConversationHandler registration
# ============================================================================

def get_add_customer_v3_handler():
    """Получить ConversationHandler для добавления клиента v3."""
    logger.info("[HANDLER] Registering add customer v3 handler")

    return ConversationHandler(
        entry_points=[
            CallbackQueryHandler(start_add_customer, pattern="^agent_add_customer_v3$"),
        ],
        states={
            ASK_NAME: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_name),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_TAX_ID: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_tax_id),
                CallbackQueryHandler(skip_tax_id, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_name, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_FIRM_NAME: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_firm_name),
                CallbackQueryHandler(skip_firm_name, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_tax_id, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_PHONE: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_phone),
                CallbackQueryHandler(skip_phone, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_firm_name, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_CONTACT_PERSON: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_contact_person),
                CallbackQueryHandler(skip_contact_person, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_phone, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_ADDRESS: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_address),
                CallbackQueryHandler(skip_address, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_contact_person, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_CITY: [
                CallbackQueryHandler(select_city, pattern="^addcust_v3_city_.+$"),
                CallbackQueryHandler(retry_city, pattern="^addcust_v3_retry_city$"),
                CallbackQueryHandler(skip_city, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_address, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_TERRITORY: [
                CallbackQueryHandler(select_territory, pattern="^addcust_v3_terr_.+$"),
                CallbackQueryHandler(retry_territory, pattern="^addcust_v3_retry_territory$"),
                CallbackQueryHandler(skip_territory, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_city, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_ACCOUNT_NO: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ask_account_no),
                CallbackQueryHandler(skip_account_no, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_territory, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_EXPEDITOR: [
                CallbackQueryHandler(select_expeditor, pattern="^addcust_v3_exp_.+$"),
                CallbackQueryHandler(skip_expeditor, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_account_no, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            ASK_LOCATION: [
                MessageHandler(filters.LOCATION, ask_location),
                CallbackQueryHandler(skip_location, pattern="^addcust_v3_skip$"),
                CallbackQueryHandler(back_to_expeditor, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
            CONFIRM: [
                CallbackQueryHandler(save_customer, pattern="^addcust_v3_save$"),
                CallbackQueryHandler(back_to_location, pattern="^addcust_v3_back$"),
                CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$"),
            ],
        },
        fallbacks=[CallbackQueryHandler(cancel_dialog, pattern="^addcust_v3_cancel$")],
        per_chat=True,
        per_user=True,
        per_message=False,
        name="add_customer_v3_conv",
    )

