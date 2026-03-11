"""
Функционал агента v2.2: Добавить клиента, Мои визиты, Фото клиента, Создать заказ.
"""
import logging
import re
from datetime import date, datetime

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, CallbackQueryHandler, MessageHandler, filters, ApplicationHandlerStop

from .session import get_session, touch_session, log_action, delete_session
from .sds_api import api, SDSApiError
from .helpers import (
    fmt_money, fmt_date, date_picker_keyboard, calendar_keyboard,
    back_button, get_cached_products, get_cached_payment_types, fmt_product_name,
)
from .i18n import t, localize_literal, localize_reply_markup
from .handlers_agent_v3_add_customer import get_add_customer_v3_handler
from .handlers_agent_create_visit import get_create_visit_handler

logger = logging.getLogger(__name__)


async def _loc(update: Update, context: ContextTypes.DEFAULT_TYPE, text: str) -> str:
    return await localize_literal(update, context, text)


async def _edit_loc(q, update: Update, context: ContextTypes.DEFAULT_TYPE, text: str, **kwargs):
    if "reply_markup" in kwargs and kwargs["reply_markup"] is not None:
        kwargs["reply_markup"] = await localize_reply_markup(update, context, kwargs["reply_markup"])
    return await q.edit_message_text(await _loc(update, context, text), **kwargs)


async def _reply_loc(msg, update: Update, context: ContextTypes.DEFAULT_TYPE, text: str, **kwargs):
    if "reply_markup" in kwargs and kwargs["reply_markup"] is not None:
        kwargs["reply_markup"] = await localize_reply_markup(update, context, kwargs["reply_markup"])
    return await msg.reply_text(await _loc(update, context, text), **kwargs)



async def _status_label(update: Update, context: ContextTypes.DEFAULT_TYPE, status_code: str) -> str:
    code = (status_code or "").strip()
    if not code:
        return "—"
    value = await t(update, context, f"status.{code}")
    return value if value != f"status.{code}" else code


async def _payment_label(update: Update, context: ContextTypes.DEFAULT_TYPE, payment_code: str) -> str:
    code = (payment_code or "").strip()
    if not code:
        return "—"
    value = await t(update, context, f"payment_type.{code}")
    return value if value != f"payment_type.{code}" else code


async def debug_log_all_messages(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отладочный хендлер - логирует ВСЕ входящие сообщения."""
    if update.message:
        user_id = update.effective_user.id
        text = update.message.text if update.message.text else f"<non-text: {type(update.message).__name__}>"
        logger.info(f"[DEBUG ALL MESSAGES] User {user_id}: '{text}'")
    if update.callback_query:
        user_id = update.effective_user.id
        data = update.callback_query.data
        logger.info(f"[DEBUG ALL CALLBACKS] User {user_id}: '{data}'")


async def _get_auth(update: Update):
    q = update.callback_query
    tg_id = q.from_user.id
    session = await get_session(tg_id)
    if not session:
        await _edit_loc(q, update, context, "Сессия истекла. Нажмите /start.")
        return None, None
    await touch_session(tg_id)
    return session, session.jwt_token


def _clear_agent_state(context: ContextTypes.DEFAULT_TYPE):
    """Очистить все state-флаги агента."""
    keys = [
        "add_cust_step", "add_cust_name", "add_cust_inn", "add_cust_lat",
        "add_cust_lon", "add_cust_photo_bytes", "add_cust_photo_name",
        "add_cust_address", "add_cust_city", "add_cust_territory", "add_cust_phone",
        "add_cust_contact", "add_cust_firm_name", "add_cust_account_no", "add_cust_editing_field",
        "photo_search", "photo_customer_id", "order_search", "adding_product",
        "vcomplete_id", "vcancel_id", "order_geo_step", "order_photo_step",
        "create_visit_search", "create_visit_customer_id", "create_visit_date",
        "create_visit_time", "create_visit_date_input", "create_visit_time_input",
    ]
    for k in keys:
        context.user_data.pop(k, None)


# ====================== ДОБАВИТЬ КЛИЕНТА ======================

async def cb_agent_add_customer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Начало добавления клиента."""
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    _clear_agent_state(context)
    context.user_data["add_cust_step"] = "name"
    buttons = [[InlineKeyboardButton("❌ Отмена", callback_data="main_menu")]]
    await q.edit_message_text(
        "➕ *Добавить клиента*\n\nВведите *название клиента* (минимум 2 символа):",
        reply_markup=InlineKeyboardMarkup(buttons),
        parse_mode="Markdown",
    )


async def _handle_add_customer_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка текстового ввода при добавлении клиента."""
    step = context.user_data.get("add_cust_step")
    if not step:
        return False

    session = await get_session(update.effective_user.id)
    if not session:
        await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start.")
        return True

    if step == "name":
        name = update.message.text.strip()
        if len(name) < 2:
            await _reply_loc(update.message, update, context, "❌ Название минимум 2 символа. Введите снова:")
            return True
        context.user_data["add_cust_name"] = name
        context.user_data["add_cust_step"] = "inn"
        buttons = [[InlineKeyboardButton("⏭ Пропустить", callback_data="agent_addcust_skip_inn")]]
        await update.message.reply_text(
            f"✅ Название: *{name}*\n\nВведите *ИНН* (9–12 цифр) или нажмите Пропустить:",
            reply_markup=InlineKeyboardMarkup(buttons),
            parse_mode="Markdown",
        )
        return True

    elif step == "inn":
        inn = update.message.text.strip()
        logger.info(f"User {update.effective_user.id} entered INN: {inn}")
        # Валидация ИНН: 9-12 цифр
        if not re.match(r"^\d{9,12}$", inn):
            logger.warning(f"Invalid INN format: {inn}")
            await update.message.reply_text(
                "❌ ИНН должен содержать от 9 до 12 цифр. Введите снова:",
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("⏭ Пропустить", callback_data="agent_addcust_skip_inn")],
                ]),
            )
            return True
        context.user_data["add_cust_inn"] = inn
        context.user_data["add_cust_step"] = "fields"
        logger.info(f"User {update.effective_user.id}: INN validated, showing fields menu")
        await _show_add_customer_fields_menu(update, context, is_callback=False)
        logger.info(f"User {update.effective_user.id}: Fields menu sent")
        return True

    if step == "fields":
        editing = context.user_data.get("add_cust_editing_field")
        if not editing:
            return True
        text_val = update.message.text.strip()
        if editing == "name":
            context.user_data["add_cust_name"] = text_val if len(text_val) >= 2 else context.user_data.get("add_cust_name", "")
        elif editing == "inn":
            context.user_data["add_cust_inn"] = text_val if re.match(r"^\d{9,12}$", text_val) else context.user_data.get("add_cust_inn")
        elif editing == "address":
            context.user_data["add_cust_address"] = text_val
        elif editing == "city":
            context.user_data["add_cust_city"] = text_val
        elif editing == "territory":
            context.user_data["add_cust_territory"] = text_val
        elif editing == "phone":
            context.user_data["add_cust_phone"] = text_val
        elif editing == "contact":
            context.user_data["add_cust_contact"] = text_val
        elif editing == "firm_name":
            context.user_data["add_cust_firm_name"] = text_val
        elif editing == "account_no":
            context.user_data["add_cust_account_no"] = text_val
        context.user_data["add_cust_editing_field"] = None
        await _show_add_customer_fields_menu(update, context, is_callback=False)
        return True

    return False


async def cb_agent_addcust_skip_inn(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    context.user_data["add_cust_inn"] = None
    context.user_data["add_cust_step"] = "fields"
    await _show_add_customer_fields_menu(update, context, is_callback=True)


def _field_btn(label: str, field_key: str, value) -> list:
    check = " ✓" if value else ""
    return [InlineKeyboardButton(label + check, callback_data=f"agent_addcust_field_{field_key}")]


async def _show_add_customer_fields_menu(update, context, is_callback: bool):
    """Меню полей клиента с галочками для заполненных. После ИНН."""
    user_id = update.effective_user.id if update.effective_user else "unknown"
    logger.info(f"User {user_id}: Showing fields menu (is_callback={is_callback})")

    name = context.user_data.get("add_cust_name", "")
    inn = context.user_data.get("add_cust_inn") or ""
    address = context.user_data.get("add_cust_address", "")
    city = context.user_data.get("add_cust_city", "")
    territory = context.user_data.get("add_cust_territory", "")
    phone = context.user_data.get("add_cust_phone", "")
    contact = context.user_data.get("add_cust_contact", "")
    firm_name = context.user_data.get("add_cust_firm_name", "")
    account_no = context.user_data.get("add_cust_account_no", "")
    lat = context.user_data.get("add_cust_lat")
    lon = context.user_data.get("add_cust_lon")
    has_geo = lat is not None and lon is not None
    has_photo = context.user_data.get("add_cust_photo_bytes") is not None

    logger.info(f"User {user_id}: Fields - name={bool(name)}, inn={bool(inn)}, address={bool(address)}")

    lines = ["📋 *Заполните данные клиента*\nНажмите на поле, введите значение и отправьте. Для координат — отправьте геолокацию.\n"]
    buttons = []
    buttons.append(_field_btn("Название", "name", name))
    buttons.append(_field_btn("ИНН", "inn", inn))
    buttons.append(_field_btn("Название фирмы", "firm_name", firm_name))
    buttons.append(_field_btn("Р/с", "account_no", account_no))
    buttons.append(_field_btn("Адрес", "address", address))
    buttons.append(_field_btn("Город", "city", city))
    buttons.append(_field_btn("Территория", "territory", territory))
    buttons.append(_field_btn("Телефон", "phone", phone))
    buttons.append(_field_btn("Контактное лицо", "contact", contact))
    buttons.append(_field_btn("📍 Координаты (геолокация)", "geo", has_geo))
    buttons.append(_field_btn("📸 Фото", "photo", has_photo))
    buttons.append([InlineKeyboardButton("✅ Завершить заведение клиента", callback_data="agent_addcust_finish")])
    buttons.append([InlineKeyboardButton("❌ Отмена", callback_data="main_menu")])

    text = "\n".join(lines)
    kb = InlineKeyboardMarkup(buttons)
    if is_callback:
        await update.callback_query.edit_message_text(text, reply_markup=kb, parse_mode="Markdown")
    else:
        await update.message.reply_text(text, reply_markup=kb, parse_mode="Markdown")


async def cb_agent_addcust_field(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Выбор поля для ввода."""
    q = update.callback_query
    await q.answer()
    field = q.data.replace("agent_addcust_field_", "")
    context.user_data["add_cust_editing_field"] = field

    prompts = {
        "name": "Введите *название клиента* (минимум 2 символа):",
        "inn": "Введите *ИНН* (9–12 цифр):",
        "firm_name": "Введите *название фирмы*:",
        "account_no": "Введите *расчётный счёт* (р/с):",
        "address": "Введите *адрес*:",
        "city": "Введите *город*:",
        "territory": "Введите *территорию*:",
        "phone": "Введите *телефон*:",
        "contact": "Введите *контактное лицо*:",
        "geo": "📍 Отправьте *геолокацию* (нажмите 📎 → Геолокация):",
        "photo": "📸 Отправьте *фото* клиента (вывеска, магазин):",
    }
    prompt = prompts.get(field, "Введите значение:")
    back_kb = InlineKeyboardMarkup([[InlineKeyboardButton("◀️ Назад к меню полей", callback_data="agent_addcust_back_to_fields")]])
    await q.edit_message_text(prompt, parse_mode="Markdown", reply_markup=back_kb)


async def cb_agent_addcust_back_to_fields(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Возврат к меню полей без ввода значения."""
    q = update.callback_query
    await q.answer()
    context.user_data["add_cust_editing_field"] = None
    await _show_add_customer_fields_menu(update, context, is_callback=True)


async def cb_agent_addcust_finish(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Завершить заведение клиента — сохранить в БД."""
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    name = (context.user_data.get("add_cust_name") or "").strip()
    if len(name) < 2:
        await _edit_loc(q, update, context, "❌ Заполните хотя бы *название клиента* (минимум 2 символа).", parse_mode="Markdown")
        return

    body = {"name_client": name, "status": "Активный", "login_agent": session.login}
    if context.user_data.get("add_cust_inn"):
        body["tax_id"] = context.user_data["add_cust_inn"]
    if context.user_data.get("add_cust_firm_name"):
        body["firm_name"] = context.user_data["add_cust_firm_name"]
    if context.user_data.get("add_cust_address"):
        body["address"] = context.user_data["add_cust_address"]
    if context.user_data.get("add_cust_city"):
        body["city"] = context.user_data["add_cust_city"]
    if context.user_data.get("add_cust_territory"):
        body["territory"] = context.user_data["add_cust_territory"]
    if context.user_data.get("add_cust_phone"):
        body["phone"] = context.user_data["add_cust_phone"]
    if context.user_data.get("add_cust_contact"):
        body["contact_person"] = context.user_data["add_cust_contact"]
    if context.user_data.get("add_cust_account_no"):
        body["account_no"] = context.user_data["add_cust_account_no"]
    lat = context.user_data.get("add_cust_lat")
    lon = context.user_data.get("add_cust_lon")
    if lat is not None and lon is not None:
        body["latitude"] = lat
        body["longitude"] = lon

    try:
        customer = await api.create_customer(token, body)
        cid = customer.get("id")
        photo_bytes = context.user_data.get("add_cust_photo_bytes")
        photo_name = context.user_data.get("add_cust_photo_name", "photo.jpg")
        if photo_bytes and cid:
            ext = photo_name.rsplit(".", 1)[-1] if "." in photo_name else "jpg"
            auto_filename = f"{cid}_{datetime.now().strftime('%d%m%Y_%H%M%S')}.{ext}"
            try:
                await api.upload_photo(token, cid, photo_bytes, auto_filename)
            except Exception as e:
                logger.warning("Не удалось загрузить фото нового клиента %s: %s", cid, e)
        await log_action(q.from_user.id, session.login, session.role, "customer_created", f"customer_id={cid}, name={name}", "success")
        _clear_agent_state(context)
        await q.edit_message_text(
            f"✅ *Клиент создан!*\n\n*ID:* {cid}\n*Название:* {name}",
            reply_markup=back_button(), parse_mode="Markdown",
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await _edit_loc(q, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(
            await t(update, context, "telegram.common.error_with_detail", detail=e.detail),
            reply_markup=back_button(),
        )


async def cb_agent_addcust_skip_geo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    context.user_data["add_cust_lat"] = None
    context.user_data["add_cust_lon"] = None
    context.user_data["add_cust_step"] = "fields"
    await _show_add_customer_fields_menu(update, context, is_callback=True)


async def cb_agent_addcust_skip_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    context.user_data["add_cust_photo_bytes"] = None
    context.user_data["add_cust_step"] = "fields"
    await _show_add_customer_fields_menu(update, context, is_callback=True)


async def _handle_add_customer_location(update: Update, context: ContextTypes.DEFAULT_TYPE):
    step = context.user_data.get("add_cust_step")
    if step != "fields":
        return False
    loc = update.message.location
    context.user_data["add_cust_lat"] = loc.latitude
    context.user_data["add_cust_lon"] = loc.longitude
    context.user_data["add_cust_editing_field"] = None
    await _show_add_customer_fields_menu(update, context, is_callback=False)
    return True


async def _handle_add_customer_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    step = context.user_data.get("add_cust_step")
    editing = context.user_data.get("add_cust_editing_field")
    if step == "fields" and editing == "photo":
        photo = update.message.photo[-1] if update.message.photo else None
        doc = update.message.document if not photo and update.message.document else None
        if photo:
            file = await photo.get_file()
            filename = "photo.jpg"
        elif doc and doc.mime_type and (doc.mime_type.startswith("image/")):
            file = await doc.get_file()
            filename = doc.file_name or "photo.jpg"
        else:
            await _reply_loc(update.message, update, context, "❌ Отправьте изображение (JPG, PNG, WEBP).")
            return True
        if file.file_size and file.file_size > 10 * 1024 * 1024:
            await _reply_loc(update.message, update, context, "❌ Файл слишком большой (макс. 10 МБ).")
            return True
        file_bytes = await file.download_as_bytearray()
        context.user_data["add_cust_photo_bytes"] = bytes(file_bytes)
        context.user_data["add_cust_photo_name"] = filename
        context.user_data["add_cust_editing_field"] = None
        await _show_add_customer_fields_menu(update, context, is_callback=False)
        return True
    if step != "photo":
        return False
    photo = update.message.photo[-1] if update.message.photo else None
    doc = update.message.document if not photo and update.message.document else None
    if photo:
        file = await photo.get_file()
        filename = "photo.jpg"
    elif doc and doc.mime_type and doc.mime_type.startswith("image/"):
        file = await doc.get_file()
        filename = doc.file_name or "photo.jpg"
    else:
        await _reply_loc(update.message, update, context, "❌ Отправьте изображение (JPG, PNG, WEBP).")
        return True
    if file.file_size and file.file_size > 10 * 1024 * 1024:
        await _reply_loc(update.message, update, context, "❌ Файл слишком большой (макс. 10 МБ).")
        return True
    file_bytes = await file.download_as_bytearray()
    context.user_data["add_cust_photo_bytes"] = bytes(file_bytes)
    context.user_data["add_cust_photo_name"] = filename
    await _show_add_customer_confirm(update, context, is_callback=False)
    return True


async def cb_agent_addcust_skip_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    context.user_data["add_cust_photo_bytes"] = None
    context.user_data["add_cust_step"] = "fields"
    await _show_add_customer_fields_menu(update, context, is_callback=True)


async def _show_add_customer_confirm(update, context, is_callback: bool):
    name = context.user_data.get("add_cust_name", "—")
    inn = context.user_data.get("add_cust_inn") or "—"
    lat = context.user_data.get("add_cust_lat")
    lon = context.user_data.get("add_cust_lon")
    has_photo = context.user_data.get("add_cust_photo_bytes") is not None
    lines = [
        "📋 *Подтверждение нового клиента:*\n",
        f"*Название:* {name}",
        f"*ИНН:* {inn}",
        f"*Координаты:* {f'{lat:.6f}, {lon:.6f}' if lat else '—'}",
        f"*Фото:* {'✅ Прикреплено' if has_photo else '—'}",
    ]
    context.user_data["add_cust_step"] = "confirm"
    buttons = [
        [InlineKeyboardButton("✅ Создать клиента", callback_data="agent_addcust_confirm")],
        [InlineKeyboardButton("❌ Отмена", callback_data="main_menu")],
    ]
    text = "\n".join(lines)
    if is_callback:
        await update.callback_query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")
    else:
        await update.message.reply_text(text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")


async def cb_agent_addcust_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    name = context.user_data.get("add_cust_name", "")
    inn = context.user_data.get("add_cust_inn")
    lat = context.user_data.get("add_cust_lat")
    lon = context.user_data.get("add_cust_lon")
    photo_bytes = context.user_data.get("add_cust_photo_bytes")
    photo_name = context.user_data.get("add_cust_photo_name", "photo.jpg")

    try:
        body = {"name_client": name, "status": "Активный", "login_agent": session.login}
        if inn:
            body["tax_id"] = inn
        if lat and lon:
            body["latitude"] = lat
            body["longitude"] = lon
        customer = await api.create_customer(token, body)
        cid = customer.get("id")

        if photo_bytes and cid:
            now = datetime.now()
            ext = photo_name.rsplit(".", 1)[-1] if "." in photo_name else "jpg"
            auto_filename = f"{cid}_{now.strftime('%d%m%Y_%H%M%S')}.{ext}"
            try:
                await api.upload_photo(token, cid, photo_bytes, auto_filename)
            except Exception as e:
                logger.warning("Не удалось загрузить фото нового клиента %s: %s", cid, e)

        coord_info = f", lat={lat}, lon={lon}" if lat else ""
        await log_action(q.from_user.id, session.login, session.role,
                         "customer_created", f"customer_id={cid}, name={name}{coord_info}", "success")
        _clear_agent_state(context)
        await q.edit_message_text(
            f"✅ *Клиент создан!*\n\n*ID:* {cid}\n*Название:* {name}",
            reply_markup=back_button(), parse_mode="Markdown",
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await _edit_loc(q, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(q.from_user.id, session.login, session.role,
                         "customer_created", f"name={name}", "error", e.detail)
        await q.edit_message_text(
            await t(update, context, "telegram.common.error_with_detail", detail=e.detail),
            reply_markup=back_button(),
        )


# ====================== МОИ ВИЗИТЫ ======================

async def cb_agent_visits(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    _clear_agent_state(context)
    kb = date_picker_keyboard(
        "agent_visits",
        text_today=await t(update, context, "telegram.common.today", fallback="Сегодня"),
        text_tomorrow=await t(update, context, "telegram.common.tomorrow", fallback="Завтра"),
        text_choose=await t(update, context, "telegram.common.choose_date_btn", fallback="Выбрать дату"),
        text_back=await t(update, context, "telegram.button.back", fallback="◀️ Назад")
    )
    title = await t(update, context, "telegram.button.my_visits", fallback="Мои визиты")
    choose_prompt = await t(update, context, "telegram.common.choose_date", fallback="Выберите дату:")
    await _edit_loc(q, update, context, f"📋 *{title}*\n\n{choose_prompt}", reply_markup=kb, parse_mode="Markdown")


async def cb_agent_visits_calendar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    offset = int(q.data.split("_")[-1])
    kb = calendar_keyboard("agent_visits", offset)
    await _edit_loc(q, update, context, "📅 Выберите дату:", reply_markup=kb, parse_mode="Markdown")


async def cb_agent_visits_pick_date(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    kb = date_picker_keyboard(
        "agent_visits",
        text_today=await t(update, context, "telegram.common.today", fallback="Сегодня"),
        text_tomorrow=await t(update, context, "telegram.common.tomorrow", fallback="Завтра"),
        text_choose=await t(update, context, "telegram.common.choose_date_btn", fallback="Выбрать дату"),
        text_back=await t(update, context, "telegram.button.back", fallback="◀️ Назад")
    )
    title = await t(update, context, "telegram.button.my_visits", fallback="Мои визиты")
    choose_prompt = await t(update, context, "telegram.common.choose_date", fallback="Выберите дату:")
    await _edit_loc(q, update, context, f"📋 *{title}*\n\n{choose_prompt}", reply_markup=kb, parse_mode="Markdown")


async def cb_agent_visits_date(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    chosen_date = q.data.split("_date_")[-1]
    context.user_data["agent_date"] = chosen_date

    try:
        data = await api.search_visits(
            token,
            responsible_login=session.login,
            from_date=chosen_date,
            to_date=chosen_date,
            status="planned,in_progress",
            limit=50,
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await _edit_loc(q, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(
            await t(update, context, "telegram.common.error_with_detail", detail=e.detail),
            reply_markup=back_button("agent_visits"),
        )
        return

    visits = data.get("data") or [] if isinstance(data, dict) else data
    if not visits:
        await q.edit_message_text(
            f"📋 Визиты на {fmt_date(chosen_date)}:\n\nНет визитов.",
            reply_markup=back_button("agent_visits"),
        )
        return

    lines = [f"📋 *Визиты на {fmt_date(chosen_date)}:*\n"]
    buttons = []
    for v in visits:
        vid = v.get("id")
        client = v.get("customer_name", "—")
        time_str = v.get("visit_time", "—")
        status_code = v.get("status", "")
        status = await _status_label(update, context, status_code)
        lines.append(f"• {time_str} | {client} | {status}")
        buttons.append([InlineKeyboardButton(
            f"{time_str} — {client}", callback_data=f"agent_visit_{vid}"
        )])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="agent_visits")])
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


async def cb_agent_visit_detail(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    vid = int(q.data.replace("agent_visit_", ""))

    try:
        v = await api.get_visit(token, vid)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await _edit_loc(q, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(
            await t(update, context, "telegram.common.error_with_detail", detail=e.detail),
            reply_markup=back_button("agent_visits"),
        )
        return

    context.user_data["current_visit"] = v
    client = v.get("customer_name", "—")
    phone = v.get("phone", "—")
    address = v.get("address", "—")
    visit_date = fmt_date(v.get("visit_date"))
    visit_time = v.get("visit_time", "—")
    status_code = v.get("status", "")
    status = await _status_label(update, context, status_code)
    comment = v.get("comment") or "—"
    customer_id = v.get("customer_id")

    photo_count = 0
    if customer_id:
        try:
            pr = await api.get_customer_photos(token, customer_id)
            photo_count = pr.get("total", 0) if isinstance(pr, dict) else len(pr if isinstance(pr, list) else [])
        except Exception as photos_error:
            logger.debug("Failed to load customer photos for visit detail: %s", photos_error)

    t_title = await t(update, context, "telegram.visit_card.title", fallback=f"📋 *Визит #{vid}*", id=vid)
    t_client = await t(update, context, "telegram.visit_card.client", fallback=f"*Клиент:* {client}", client=client)
    t_phone = await t(update, context, "telegram.visit_card.phone", fallback=f"*Телефон:* {phone}", phone=phone)
    t_addr = await t(update, context, "telegram.visit_card.address", fallback=f"*Адрес:* {address}", address=address)
    t_date = await t(update, context, "telegram.visit_card.date", fallback=f"*Дата:* {visit_date}", date=visit_date)
    t_time = await t(update, context, "telegram.visit_card.time", fallback=f"*Время:* {visit_time}", time=visit_time)
    t_status = await t(update, context, "telegram.visit_card.status", fallback=f"*Статус:* {status}", status=status)
    t_comment = await t(update, context, "telegram.visit_card.comment", fallback=f"*Комментарий:* {comment}", comment=comment)
    t_photos = await t(update, context, "telegram.visit_card.photos", fallback=f"📷 Фотографий: {photo_count}", count=photo_count)

    lines = [
        f"{t_title}\n",
        t_client,
        t_phone,
        t_addr,
        t_date,
        t_time,
        t_status,
        t_comment,
        t_photos,
    ]

    buttons = []
    if v.get("status") in ("planned", "in_progress"):
        btn_complete = await t(update, context, "telegram.visit_card.completed_btn", fallback="✅ Отметить выполнено")
        btn_cancel = await t(update, context, "telegram.visit_card.cancelled_btn", fallback="❌ Отметить не выполнено")
        buttons.append([InlineKeyboardButton(btn_complete, callback_data=f"agent_vcomplete_{vid}")])
        buttons.append([InlineKeyboardButton(btn_cancel, callback_data=f"agent_vcancel_{vid}")])
    if customer_id:
        btn_photos = await t(update, context, "telegram.visit_card.photos_btn", fallback="📸 Фотографии")
        buttons.append([InlineKeyboardButton(btn_photos, callback_data=f"agent_vphotos_{customer_id}")])
    date_str = context.user_data.get("agent_date", date.today().isoformat())
    btn_back = await t(update, context, "telegram.button.back", fallback="◀️ Назад")
    buttons.append([InlineKeyboardButton(btn_back, callback_data=f"agent_visits_date_{date_str}")])
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


# ---------- Отметить выполнено ----------

async def cb_agent_vcomplete(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    vid = int(q.data.replace("agent_vcomplete_", ""))
    _clear_agent_state(context)
    context.user_data["vcomplete_id"] = vid
    await q.edit_message_text(
        await t(update, context, "telegram.agent.visit_complete_enter_comment", fallback=f"Визит #{vid}\n\nВведите комментарий (минимум 10 символов):", vid=vid),
        reply_markup=back_button(f"agent_visit_{vid}"),
    )


async def _handle_vcomplete_comment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    vid = context.user_data.get("vcomplete_id")
    if not vid:
        return False
    session = await get_session(update.effective_user.id)
    if not session:
        return True
    comment = update.message.text.strip()
    if len(comment) < 10:
        await _reply_loc(update.message, update, context, "❌ Комментарий минимум 10 символов. Введите снова:")
        return True
    try:
        await api.update_visit(session.jwt_token, vid, {"status": "completed", "comment": comment})

        # Получить информацию о визите для вывода
        visit_info = await api.get_visit(session.jwt_token, vid)
        customer_id = visit_info.get("customer_id")
        customer = await api.get_customer(session.jwt_token, customer_id)
        customer_name = customer.get("name_client", "—")
        customer_inn = customer.get("tax_id", "—")
        visit_date = visit_info.get("visit_date", "—")
        visit_time = visit_info.get("visit_time", "—")

        await log_action(update.effective_user.id, session.login, session.role,
                         "visit_completed", f"visit={vid}", "success")
        context.user_data.pop("vcomplete_id", None)

        text = (
            f"✅ *Визит завершен!*\n\n"
            f"📋 *ID визита:* {vid}\n"
            f"👤 *Клиент:* {customer_name}\n"
            f"🔢 *ИНН:* {customer_inn}\n"
            f"📅 *Дата:* {visit_date}\n"
            f"⏰ *Время:* {visit_time}\n"
        )

        await update.message.reply_text(text, parse_mode="Markdown")
        from .handlers_auth import show_main_menu
        await show_main_menu(update, context, session)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
        else:
            await update.message.reply_text(
                await t(update, context, "telegram.common.error_with_detail", detail=e.detail)
            )
    return True


# ---------- Отметить не выполнено ----------

async def cb_agent_vcancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    vid = int(q.data.replace("agent_vcancel_", ""))
    _clear_agent_state(context)
    context.user_data["vcancel_id"] = vid
    await q.edit_message_text(
        await t(update, context, "telegram.agent.visit_cancel_enter_reason", fallback=f"Визит #{vid}\n\nВведите причину (или «-» чтобы пропустить):", vid=vid),
        reply_markup=back_button(f"agent_visit_{vid}"),
    )


async def _handle_vcancel_comment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    vid = context.user_data.get("vcancel_id")
    if not vid:
        return False
    session = await get_session(update.effective_user.id)
    if not session:
        return True
    comment = update.message.text.strip()
    if comment == "-":
        comment = ""
    try:
        await api.update_visit(session.jwt_token, vid, {"status": "cancelled", "comment": comment or None})
        await log_action(update.effective_user.id, session.login, session.role,
                         "visit_cancelled", f"visit={vid}", "success")
        context.user_data.pop("vcancel_id", None)
        await update.message.reply_text(
            await t(update, context, "telegram.agent.visit_mark_not_done", id=vid)
        )
        from .handlers_auth import show_main_menu
        await show_main_menu(update, context, session)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
        else:
            await update.message.reply_text(
                await t(update, context, "telegram.common.error_with_detail", detail=e.detail)
            )
    return True


# ====================== СОЗДАТЬ ВИЗИТ ======================

async def cb_agent_create_visit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Начало создания визита."""
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    _clear_agent_state(context)
    context.user_data["create_visit_search"] = True
    logger.info(f"User {q.from_user.id}: Starting visit creation, create_visit_search=True")
    await q.edit_message_text(
        "🆕 *Создать визит*\n\nВведите название клиента или ИНН для поиска:",
        reply_markup=back_button(), parse_mode="Markdown",
    )


async def _handle_create_visit_search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Поиск клиента для создания визита."""
    if not context.user_data.get("create_visit_search"):
        return False
    logger.info(f"User {update.effective_user.id}: Handling create visit search")
    session = await get_session(update.effective_user.id)
    if not session:
        logger.warning(f"User {update.effective_user.id}: No session found")
        return True
    query = update.message.text.strip()
    logger.info(f"User {update.effective_user.id}: Searching customers with query: {query}")
    try:
        customers = await api.search_customers(session.jwt_token, search=query, limit=10)
        logger.info(f"User {update.effective_user.id}: Found {len(customers) if customers else 0} customers")
    except SDSApiError as e:
        logger.error(f"User {update.effective_user.id}: API error searching customers: {e}")
        if getattr(e, "status", None) == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return True
        customers = []
    if not customers or not isinstance(customers, list) or len(customers) == 0:
        logger.info(f"User {update.effective_user.id}: No customers found")
        await _reply_loc(update.message, update, context, "Клиенты не найдены. Попробуйте другой запрос:")
        return True
    buttons = []
    for c in customers:
        cid = c.get("id")
        name = c.get("name_client") or c.get("firm_name") or f"#{cid}"
        buttons.append([InlineKeyboardButton(name, callback_data=f"agent_createvisit_cust_{cid}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    context.user_data.pop("create_visit_search", None)
    logger.info(f"User {update.effective_user.id}: Sending {len(customers)} customer buttons")
    await _reply_loc(update.message, update, context, "Выберите клиента:", reply_markup=InlineKeyboardMarkup(buttons))
    return True


async def cb_agent_create_visit_customer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Клиент выбран, запрос даты визита."""
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    cid = int(q.data.replace("agent_createvisit_cust_", ""))
    context.user_data["create_visit_customer_id"] = cid
    context.user_data["create_visit_date_input"] = True
    await q.edit_message_text(
        await t(update, context, "telegram.visit_create.customer_selected_enter_date", fallback=f"🆕 *Создать визит*\n\nКлиент: #{cid}\n\nВведите *дату визита* (ДД.ММ.ГГГГ):", cid=cid),
        reply_markup=back_button("main_menu"), parse_mode="Markdown",
    )


async def _handle_create_visit_date(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка ввода даты визита."""
    if not context.user_data.get("create_visit_date_input"):
        return False
    session = await get_session(update.effective_user.id)
    if not session:
        return True
    date_str = update.message.text.strip()
    # Парсим дату ДД.ММ.ГГГГ
    try:
        parts = date_str.split(".")
        if len(parts) != 3:
            raise ValueError
        day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
        visit_date = date(year, month, day)
    except (ValueError, IndexError):
        await _reply_loc(update.message, update, context, "❌ Неверный формат даты. Введите дату в формате ДД.ММ.ГГГГ (например, 25.12.2024):")
        return True

    context.user_data["create_visit_date"] = visit_date.isoformat()
    context.user_data.pop("create_visit_date_input", None)
    context.user_data["create_visit_time_input"] = True
    await update.message.reply_text(
        await t(update, context, "telegram.visit_create.date_ok_enter_time", fallback=f"✅ Дата: {fmt_date(visit_date.isoformat())}\n\nВведите *время визита* (ЧЧ:ММ) или нажмите /skip чтобы пропустить:", date=fmt_date(visit_date.isoformat())),
        parse_mode="Markdown",
    )
    return True


async def _handle_create_visit_time(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка ввода времени визита."""
    if not context.user_data.get("create_visit_time_input"):
        return False
    session = await get_session(update.effective_user.id)
    if not session:
        return True

    time_str = update.message.text.strip()

    # Проверка команды skip
    if time_str.lower() == "/skip":
        context.user_data["create_visit_time"] = None
        context.user_data.pop("create_visit_time_input", None)
        await _show_create_visit_confirm(update, context, is_callback=False)
        return True

    # Парсим время ЧЧ:ММ
    if not re.match(r"^\d{1,2}:\d{2}$", time_str):
        await _reply_loc(update.message, update, context, "❌ Неверный формат времени. Введите время в формате ЧЧ:ММ (например, 14:30) или /skip:")
        return True

    context.user_data["create_visit_time"] = time_str
    context.user_data.pop("create_visit_time_input", None)
    await _show_create_visit_confirm(update, context, is_callback=False)
    return True


async def _show_create_visit_confirm(update, context, is_callback: bool):
    """Показать подтверждение создания визита."""
    cid = context.user_data.get("create_visit_customer_id")
    visit_date = context.user_data.get("create_visit_date")
    visit_time = context.user_data.get("create_visit_time")

    header = await t(update, context, "telegram.visit_create.confirm_header", fallback="📋 *Подтверждение визита:*\n")
    lbl_client = await t(update, context, "telegram.visit_create.label_client", fallback="*Клиент:*")
    lbl_date = await t(update, context, "telegram.visit_create.label_date", fallback="*Дата:*")
    lbl_time = await t(update, context, "telegram.visit_create.label_time", fallback="*Время:*")
    btn_create = await t(update, context, "telegram.visit_create.create_visit_btn", fallback="✅ Создать визит")
    btn_back = await t(update, context, "telegram.action.back", fallback="◀️ Назад")

    lines = [
        header,
        f"{lbl_client} #{cid}",
        f"{lbl_date} {fmt_date(visit_date)}",
        f"{lbl_time} {visit_time or '—'}",
    ]

    buttons = [
        [InlineKeyboardButton(btn_create, callback_data="agent_createvisit_confirm")],
        [InlineKeyboardButton(btn_back, callback_data="main_menu")],
    ]
    text = "\n".join(lines)
    if is_callback:
        await update.callback_query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")
    else:
        await update.message.reply_text(text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")


async def cb_agent_create_visit_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Подтверждение создания визита."""
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return

    cid = context.user_data.get("create_visit_customer_id")
    visit_date = context.user_data.get("create_visit_date")
    visit_time = context.user_data.get("create_visit_time")

    try:
        visit = await api.create_visit(token, {
            "customer_id": cid,
            "visit_date": visit_date,
            "visit_time": visit_time,
            "status": "planned",
            "responsible_login": session.login,
        })
        visit_id = visit.get("id")

        await log_action(q.from_user.id, session.login, session.role,
                         "visit_created", f"visit={visit_id}, customer={cid}", "success")

        for k in ["create_visit_customer_id", "create_visit_date", "create_visit_time",
                   "create_visit_date_input", "create_visit_time_input"]:
            context.user_data.pop(k, None)

        await q.edit_message_text(
            await t(update, context, "telegram.visit_create.visit_created_ok", fallback=f"✅ *Визит создан!*\n\nВизит #{visit_id}\nКлиент: #{cid}\nДата: {fmt_date(visit_date)}\nВремя: {visit_time or '—'}", visit_id=visit_id, cid=cid, date=fmt_date(visit_date), time=visit_time or '—'),
            reply_markup=back_button(), parse_mode="Markdown",
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await _edit_loc(q, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(q.from_user.id, session.login, session.role,
                         "visit_created", f"customer={cid}", "error", e.detail)
        await q.edit_message_text(
            await t(update, context, "telegram.common.error_with_detail", detail=e.detail),
            reply_markup=back_button(),
        )


# ====================== ФОТОГРАФИИ ======================

async def cb_agent_photo_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    _clear_agent_state(context)
    context.user_data["photo_search"] = True
    await q.edit_message_text(
        "📸 Введите название клиента или ИНН для поиска:",
        reply_markup=back_button(),
    )


async def cb_agent_vphotos(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    customer_id = int(q.data.replace("agent_vphotos_", ""))
    context.user_data["photo_customer_id"] = customer_id

    try:
        pr = await api.get_customer_photos(token, customer_id)
        data = pr.get("data", []) if isinstance(pr, dict) else (pr if isinstance(pr, list) else [])
    except SDSApiError as e:
        if getattr(e, "status", None) == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return True
        data = []

    lines = [f"📷 *Фотографии клиента #{customer_id}*\n"]
    if data:
        for p in data[:10]:
            desc = p.get("description") or p.get("file_name") or "—"
            dt = fmt_date(p.get("uploaded_at"))
            lines.append(f"• {desc} ({dt})")
    else:
        lines.append("Нет фотографий.")
    lines.append("\n📸 Отправьте изображение, чтобы загрузить новое фото.")

    buttons = [[InlineKeyboardButton("◀️ Назад", callback_data="main_menu")]]
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


async def _handle_photo_search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.user_data.get("photo_search"):
        return False
    session = await get_session(update.effective_user.id)
    if not session:
        return True
    query = update.message.text.strip()
    try:
        customers = await api.search_customers(session.jwt_token, search=query, limit=10)
    except SDSApiError as e:
        if getattr(e, "status", None) == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return True
        customers = []
    if not customers or not isinstance(customers, list) or len(customers) == 0:
        await _reply_loc(update.message, update, context, "Клиенты не найдены. Попробуйте другой запрос:")
        return True
    buttons = []
    for c in customers:
        cid = c.get("id")
        name = c.get("name_client") or c.get("firm_name") or f"#{cid}"
        tax_id = c.get("tax_id", "")
        display = f"{name}" + (f" ({tax_id})" if tax_id else "")
        buttons.append([InlineKeyboardButton(display, callback_data=f"agent_vphotos_{cid}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    context.user_data.pop("photo_search", None)
    await _reply_loc(update.message, update, context, "Выберите клиента:", reply_markup=InlineKeyboardMarkup(buttons))
    return True


async def msg_agent_photo_upload(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка отправки фото (добавление клиента / заказ / клиент)."""
    # Добавление клиента
    if context.user_data.get("add_cust_step") == "photo" or (
        context.user_data.get("add_cust_step") == "fields"
        and context.user_data.get("add_cust_editing_field") == "photo"
    ):
        await _handle_add_customer_photo(update, context)
        return
    # Фото для заказа
    if context.user_data.get("order_photo_step"):
        await _handle_order_photo(update, context)
        return
    # Фото для клиента
    customer_id = context.user_data.get("photo_customer_id")
    if not customer_id:
        return
    session = await get_session(update.effective_user.id)
    if not session:
        return

    photo = update.message.photo[-1] if update.message.photo else None
    doc = update.message.document if not photo and update.message.document else None
    if photo:
        file = await photo.get_file()
        filename = f"{customer_id}_photo.jpg"
    elif doc and doc.mime_type and doc.mime_type.startswith("image/"):
        file = await doc.get_file()
        filename = doc.file_name or f"{customer_id}_photo.jpg"
    else:
        await _reply_loc(update.message, update, context, "❌ Отправьте изображение (JPG, PNG, WEBP, макс. 10 МБ).")
        return
    if file.file_size and file.file_size > 10 * 1024 * 1024:
        await _reply_loc(update.message, update, context, "❌ Файл слишком большой (макс. 10 МБ).")
        return

    now = datetime.now()
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    auto_filename = f"{customer_id}_{now.strftime('%d%m%Y_%H%M%S')}.{ext}"
    file_bytes = await file.download_as_bytearray()

    try:
        await api.upload_photo(session.jwt_token, customer_id, bytes(file_bytes), auto_filename)
        await log_action(update.effective_user.id, session.login, session.role,
                         "photo_upload", f"customer={customer_id}", "success")
        await update.message.reply_text(
            await t(update, context, "telegram.agent.photo_uploaded", filename=auto_filename)
        )
        # Показать главное меню после загрузки фото
        from .handlers_auth import show_main_menu
        await show_main_menu(update, context, session)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(update.effective_user.id, session.login, session.role,
                         "photo_upload", f"customer={customer_id}", "error", e.detail)
        await update.message.reply_text(
            await t(update, context, "telegram.agent.photo_upload_failed", detail=e.detail)
        )


# ====================== СОЗДАТЬ ЗАКАЗ ======================

async def cb_agent_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    _clear_agent_state(context)
    context.user_data["order_search"] = True
    context.user_data["order_cart"] = []
    await q.edit_message_text(
        "🛒 *Создать заказ*\n\nВведите название клиента или ИНН для поиска:",
        reply_markup=back_button(), parse_mode="Markdown",
    )


async def _handle_order_search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.user_data.get("order_search"):
        return False
    session = await get_session(update.effective_user.id)
    if not session:
        return True
    query = update.message.text.strip()
    try:
        customers = await api.search_customers(session.jwt_token, search=query, limit=10)
    except SDSApiError as e:
        if getattr(e, "status", None) == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return True
        customers = []
    if not customers or not isinstance(customers, list) or len(customers) == 0:
        await _reply_loc(update.message, update, context, await t(update, context, "telegram.common.customers_not_found_try", fallback="Клиенты не найдены. Попробуйте другой запрос:"))
        return True
    buttons = []
    for c in customers:
        cid = c.get("id")
        name = c.get("name_client") or c.get("firm_name") or f"#{cid}"
        tax_id = c.get("tax_id", "")
        display = f"{name}" + (f" ({tax_id})" if tax_id else "")
        buttons.append([InlineKeyboardButton(display, callback_data=f"agent_ordercust_{cid}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    context.user_data.pop("order_search", None)
    await _reply_loc(update.message, update, context, "Выберите клиента:", reply_markup=InlineKeyboardMarkup(buttons))
    return True


async def cb_agent_order_customer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    cid = int(q.data.replace("agent_ordercust_", ""))
    context.user_data["order_customer_id"] = cid
    context.user_data["order_cart"] = context.user_data.get("order_cart") or []
    context.user_data["products_page"] = 0
    await _show_products_page(q, context, session)


async def _show_products_page(q, context, session):
    page = context.user_data.get("products_page", 0)
    products = await get_cached_products(session.jwt_token)
    total = len(products)
    PAGE_SIZE = 10
    start = page * PAGE_SIZE
    end = start + PAGE_SIZE
    page_items = products[start:end]

    cart = context.user_data.get("order_cart", [])
    cart_text = ""
    if cart:
        cart_lines = []
        total_sum = 0
        for item in cart:
            s = item["qty"] * item["price"]
            total_sum += s
            cart_lines.append(f"  • {item['name']}: {item['qty']} × {fmt_money(item['price'])}")
        cart_title = await t(update, context, "telegram.agent.cart_title", fallback="🛒 *Корзина:*")
        total_lbl = await t(update, context, "telegram.agent.total", fallback="Итого:")
        cart_text = f"\n{cart_title}\n" + "\n".join(cart_lines) + f"\n*{total_lbl}* {fmt_money(total_sum)}\n"

    total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE
    lines = [f"📦 *Выберите товар* (стр. {page + 1}/{total_pages}){cart_text}\n"]
    buttons = []
    for p in page_items:
        code = p.get("code")
        name = fmt_product_name(p)
        price = p.get("price", 0)
        buttons.append([InlineKeyboardButton(
            f"{name} — {fmt_money(price)}", callback_data=f"agent_prod_{code}"
        )])
    nav = []
    if page > 0:
        nav.append(InlineKeyboardButton("⬅️", callback_data="agent_prodpage_prev"))
    if end < total:
        nav.append(InlineKeyboardButton("➡️", callback_data="agent_prodpage_next"))
    if nav:
        buttons.append(nav)
    if cart:
        create_order_btn = await t(update, context, "telegram.button.create_order", fallback="🛒 Оформить заказ")
        buttons.append([InlineKeyboardButton(create_order_btn, callback_data="agent_ordercheckout")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


async def cb_agent_prodpage(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    if "next" in q.data:
        context.user_data["products_page"] = context.user_data.get("products_page", 0) + 1
    else:
        context.user_data["products_page"] = max(0, context.user_data.get("products_page", 0) - 1)
    await _show_products_page(q, context, session)


async def cb_agent_prod_select(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    code = q.data.replace("agent_prod_", "")
    products = await get_cached_products(session.jwt_token)
    product = next((p for p in products if str(p.get("code")) == code), None)
    if not product:
        await _edit_loc(q, update, context, "Товар не найден.", reply_markup=back_button())
        return
    _clear_agent_state(context)
    context.user_data["adding_product"] = product
    enter_qty = await t(update, context, "telegram.agent.enter_qty", fallback="Введите количество:")
    product_name = fmt_product_name(product)
    await q.edit_message_text(
        f"📦 *{product_name}*\nЦена: {fmt_money(product.get('price', 0))}\n\n{enter_qty}",
        parse_mode="Markdown",
    )


async def _handle_product_qty(update: Update, context: ContextTypes.DEFAULT_TYPE):
    product = context.user_data.get("adding_product")
    if not product:
        return False
    session = await get_session(update.effective_user.id)
    if not session:
        return True
    try:
        qty = int(update.message.text.strip())
        if qty <= 0:
            raise ValueError
    except ValueError:
        await _reply_loc(update.message, update, context, "❌ Введите целое число > 0:")
        return True
    cart = context.user_data.get("order_cart", [])
    product_name = fmt_product_name(product)
    cart.append({
        "product_code": product.get("code"),
        "name": product_name,
        "price": float(product.get("price", 0)),
        "qty": qty,
    })
    context.user_data["order_cart"] = cart
    context.user_data.pop("adding_product", None)
    total = sum(i["qty"] * i["price"] for i in cart)

    # Формируем список товаров в корзине
    cart_lines = []
    for item in cart:
        s = item["qty"] * item["price"]
        cart_lines.append(f"  • {item['name']}: {item['qty']} × {fmt_money(item['price'])} = {fmt_money(s)}")

    cart_title = await t(update, context, "telegram.agent.cart_title", fallback="🛒 *Корзина:*")
    total_lbl = await t(update, context, "telegram.agent.total", fallback="Итого:")
    cart_text = f"{cart_title}\n" + "\n".join(cart_lines) + f"\n\n*{total_lbl}* {fmt_money(total)}"

    btn_add = await t(update, context, "button.add", fallback="✅ Добавить ещё")
    btn_checkout = await t(update, context, "telegram.button.create_order", fallback="🛒 Оформить заказ")
    buttons = [
        [InlineKeyboardButton(btn_add, callback_data=f"agent_ordercust_{context.user_data.get('order_customer_id', 0)}")],
        [InlineKeyboardButton(btn_checkout, callback_data="agent_ordercheckout")],
    ]
    
    added_lbl = await t(update, context, "telegram.agent.added", fallback="Добавлено:")
    add_more_lbl = await t(update, context, "telegram.agent.add_more", fallback="Добавить ещё товар?")
    await update.message.reply_text(
        f"✅ {added_lbl} {product_name} × {qty}\n\n{cart_text}\n\n{add_more_lbl}",
        reply_markup=InlineKeyboardMarkup(buttons),
        parse_mode="Markdown",
    )
    return True


# ---------- Оформление ----------

async def cb_agent_checkout(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    pay_types = await get_cached_payment_types(token)
    buttons = []
    for pt in pay_types:
        code = pt.get("code")
        translated_name = await _payment_label(update, context, code)
        name = translated_name if translated_name != "—" else pt.get("name", code)
        buttons.append([InlineKeyboardButton(name, callback_data=f"agent_orderpay_{code}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data=f"agent_ordercust_{context.user_data.get('order_customer_id', 0)}")])

    cart = context.user_data.get("order_cart", [])
    total = sum(i["qty"] * i["price"] for i in cart)
    cart_title = await t(update, context, "telegram.agent.cart_title", fallback="🛒 *Корзина:*")
    total_lbl = await t(update, context, "telegram.agent.total", fallback="Итого:")
    lines = [f"{cart_title}\n"]
    for item in cart:
        lines.append(f"• {item['name']}: {item['qty']} × {fmt_money(item['price'])}")
    lines.append(f"\n*{total_lbl}* {fmt_money(total)}")
    lines.append("\n" + await t(update, context, "telegram.agent.choose_payment", fallback="Выберите *тип оплаты*:"))
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


async def cb_agent_order_pay(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """После выбора оплаты — сразу подтверждение заказа."""
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    pay_code = q.data.replace("agent_orderpay_", "")
    context.user_data["order_payment"] = pay_code
    await _show_order_confirm(update, context, is_callback=True)


async def _handle_order_location(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.user_data.get("order_geo_step"):
        return False
    loc = update.message.location
    context.user_data["order_lat"] = loc.latitude
    context.user_data["order_lon"] = loc.longitude
    context.user_data.pop("order_geo_step", None)
    context.user_data["order_photo_step"] = True
    await update.message.reply_text(
        f"✅ Координаты: {loc.latitude:.6f}, {loc.longitude:.6f}\n\n"
        f"📸 *Фото клиента* (обязательно)\n"
        f"Отправьте фото (вывеска, точка доставки).",
        parse_mode="Markdown",
    )
    return True


async def _handle_order_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.user_data.get("order_photo_step"):
        return
    customer_id = context.user_data.get("order_customer_id")
    session = await get_session(update.effective_user.id)
    if not session or not customer_id:
        return

    photo = update.message.photo[-1] if update.message.photo else None
    doc = update.message.document if not photo and update.message.document else None
    if photo:
        file = await photo.get_file()
    elif doc and doc.mime_type and doc.mime_type.startswith("image/"):
        file = await doc.get_file()
    else:
        await _reply_loc(update.message, update, context, "❌ Отправьте изображение (JPG, PNG, WEBP).")
        return
    if file.file_size and file.file_size > 10 * 1024 * 1024:
        await _reply_loc(update.message, update, context, "❌ Файл слишком большой (макс. 10 МБ).")
        return

    now = datetime.now()
    auto_filename = f"{customer_id}_{now.strftime('%d%m%Y_%H%M%S')}.jpg"
    file_bytes = await file.download_as_bytearray()

    try:
        await api.upload_photo(session.jwt_token, customer_id, bytes(file_bytes), auto_filename)
        context.user_data["order_photo_uploaded"] = True
        await update.message.reply_text(
            await t(update, context, "telegram.agent.photo_uploaded", filename=auto_filename)
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await update.message.reply_text(
            await t(update, context, "telegram.agent.photo_upload_warning", detail=e.detail)
        )

    context.user_data.pop("order_photo_step", None)
    await _show_order_confirm(update, context, is_callback=False)


async def _show_order_confirm(update, context, is_callback: bool):
    cart = context.user_data.get("order_cart", [])
    total = sum(i["qty"] * i["price"] for i in cart)
    cid = context.user_data.get("order_customer_id")
    pay_code = context.user_data.get("order_payment", "cash_sum")
    pay_name = await _payment_label(update, context, pay_code)

    lines = [
        "📋 *Подтверждение заказа:*\n",
        f"*Клиент:* #{cid}",
    ]
    for item in cart:
        lines.append(f"• {item['name']}: {item['qty']} × {fmt_money(item['price'])}")
    lines.append(f"\n*Итого:* {fmt_money(total)}")
    lines.append(f"*Оплата:* {pay_name}")

    buttons = [
        [InlineKeyboardButton("✅ Подтвердить", callback_data="agent_orderconfirm")],
        [InlineKeyboardButton("◀️ Назад", callback_data="agent_ordercheckout")],
    ]
    text = "\n".join(lines)
    if is_callback:
        await update.callback_query.edit_message_text(text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")
    else:
        await update.message.reply_text(text, reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown")


async def cb_agent_order_confirm(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return

    cid = context.user_data.get("order_customer_id")
    cart = context.user_data.get("order_cart", [])
    pay_code = context.user_data.get("order_payment", "cash_sum")
    total = sum(i["qty"] * i["price"] for i in cart)

    try:
        order = await api.create_order(token, {
            "customer_id": cid,
            "status_code": "open",
            "payment_type_code": pay_code,
            # Expeditor bot screens are date-based; default new Telegram orders to today's route.
            "scheduled_delivery_at": date.today().isoformat(),
        })
        order_no = order.get("order_no") or order.get("id")

        for item in cart:
            await api.add_order_item(token, order_no, {
                "product_code": item["product_code"],
                "quantity": item["qty"],
                "price": item["price"],
            })
        await api.update_order_total(token, order_no, total)

        await log_action(q.from_user.id, session.login, session.role,
                         "order_created", f"order={order_no}, total={total}", "success")

        for k in ["order_cart", "order_customer_id", "order_payment", "products_page"]:
            context.user_data.pop(k, None)

        # Получить информацию о клиенте
        try:
            customer = await api.get_customer(token, cid)
            customer_name = customer.get("name_client", "—")
            customer_inn = customer.get("tax_id", "—")
        except Exception:
            customer_name = f"#{cid}"
            customer_inn = "—"

        # Формируем детали заказа
        order_lines = [
            "✅ *Заказ успешно создан!*",
            f"",
            f"📋 *Номер заказа:* {order_no}",
            f"👤 *Клиент:* {customer_name}",
            f"🔢 *ИНН:* {customer_inn}",
            f"",
            f"🛒 *Товары:*",
        ]

        for item in cart:
            s = item["qty"] * item["price"]
            order_lines.append(f"  • {item['name']}")
            order_lines.append(f"    {item['qty']} × {fmt_money(item['price'])} = {fmt_money(s)}")

        order_lines.append(f"")
        order_lines.append(f"💰 *Сумма:* {fmt_money(total)}")

        btn_main = await t(update, context, "telegram.button.main_menu", fallback="🏠 Главное меню")
        kb = InlineKeyboardMarkup([[InlineKeyboardButton(btn_main, callback_data="main_menu")]])

        await q.edit_message_text(
            "\n".join(order_lines),
            parse_mode="Markdown",
            reply_markup=kb,
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await _edit_loc(q, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(q.from_user.id, session.login, session.role,
                         "order_created", f"customer={cid}", "error", e.detail)
        await q.edit_message_text(
            await t(update, context, "telegram.common.error_with_detail", detail=e.detail),
            reply_markup=back_button(),
        )


# ====================== ОБЩИЙ ТЕКСТОВЫЙ ДИСПЕТЧЕР ======================

async def msg_agent_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Единый обработчик текстовых сообщений агента."""
    user_id = update.effective_user.id
    text_preview = update.message.text[:50] if update.message and update.message.text else ""
    logger.debug(f"User {user_id}: Text message received: '{text_preview}'")

    # Log current states
    states = {
        "add_cust_step": context.user_data.get("add_cust_step"),
        "create_visit_search": context.user_data.get("create_visit_search"),
        "create_visit_date_input": context.user_data.get("create_visit_date_input"),
        "create_visit_time_input": context.user_data.get("create_visit_time_input"),
    }
    logger.debug(f"User {user_id}: Active states: {states}")

    if context.user_data.get("add_cust_step") in ("name", "inn", "fields"):
        if await _handle_add_customer_text(update, context):
            raise ApplicationHandlerStop
    if context.user_data.get("vcomplete_id"):
        if await _handle_vcomplete_comment(update, context):
            raise ApplicationHandlerStop
    if context.user_data.get("vcancel_id"):
        if await _handle_vcancel_comment(update, context):
            raise ApplicationHandlerStop
    if context.user_data.get("create_visit_search"):
        if await _handle_create_visit_search(update, context):
            raise ApplicationHandlerStop
    if context.user_data.get("create_visit_date_input"):
        if await _handle_create_visit_date(update, context):
            raise ApplicationHandlerStop
    if context.user_data.get("create_visit_time_input"):
        if await _handle_create_visit_time(update, context):
            raise ApplicationHandlerStop
    if context.user_data.get("photo_search"):
        if await _handle_photo_search(update, context):
            raise ApplicationHandlerStop
    if context.user_data.get("order_search"):
        if await _handle_order_search(update, context):
            raise ApplicationHandlerStop
    if context.user_data.get("adding_product"):
        if await _handle_product_qty(update, context):
            raise ApplicationHandlerStop
    if context.user_data.get("location_search"):
        if await _handle_location_search(update, context):
            raise ApplicationHandlerStop


async def msg_agent_location(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик геолокации."""
    if context.user_data.get("add_cust_step") == "fields":
        await _handle_add_customer_location(update, context)
        return
    if context.user_data.get("order_geo_step"):
        await _handle_order_location(update, context)
        return
    if context.user_data.get("update_location_step"):
        await _handle_update_location(update, context)
        return


# ====================== ОБНОВИТЬ ЛОКАЦИЮ КЛИЕНТА ======================

async def cb_agent_update_location(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Начало процесса обновления локации клиента."""
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    _clear_agent_state(context)
    context.user_data["location_search"] = True
    title = await t(update, context, "telegram.agent.update_location_prompt", fallback="📍 *Обновить локацию клиента*\n\nВведите ИНН или название клиента для поиска:")
    await q.edit_message_text(
        title,
        reply_markup=back_button(), parse_mode="Markdown",
    )


async def _handle_location_search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Поиск клиента для обновления локации."""
    if not context.user_data.get("location_search"):
        return False
    session = await get_session(update.effective_user.id)
    if not session:
        return True
    query = update.message.text.strip()
    try:
        customers = await api.search_customers(session.jwt_token, search=query, limit=10)
    except SDSApiError as e:
        if getattr(e, "status", None) == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return True
        customers = []
    if not customers or not isinstance(customers, list) or len(customers) == 0:
        await _reply_loc(update.message, update, context, "Клиенты не найдены. Попробуйте другой запрос:")
        return True
    buttons = []
    for c in customers:
        cid = c.get("id")
        name = c.get("name_client") or c.get("firm_name") or f"#{cid}"
        tax_id = c.get("tax_id", "")
        display = f"{name}" + (f" ({tax_id})" if tax_id else "")
        buttons.append([InlineKeyboardButton(display, callback_data=f"agent_updloc_{cid}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    context.user_data.pop("location_search", None)
    await _reply_loc(update.message, update, context, "Выберите клиента:", reply_markup=InlineKeyboardMarkup(buttons))
    return True


async def cb_agent_update_loc_customer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Выбор клиента для обновления локации."""
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    cid = int(q.data.replace("agent_updloc_", ""))
    context.user_data["update_location_customer_id"] = cid
    context.user_data["update_location_step"] = True

    prompt = await t(update, context, "telegram.agent.send_location_prompt", fallback="📍 *Отправьте геолокацию*\n\nНажмите кнопку 📎 → Геолокация для отправки координат")
    btn_back = await t(update, context, "telegram.button.back", fallback="◀️ Назад")

    await q.edit_message_text(
        prompt,
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton(btn_back, callback_data="main_menu")],
        ]),
        parse_mode="Markdown",
    )


async def _handle_update_location(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка геолокации для обновления локации клиента."""
    if not context.user_data.get("update_location_step"):
        return False

    cid = context.user_data.get("update_location_customer_id")
    session = await get_session(update.effective_user.id)
    if not session or not cid:
        return False

    loc = update.message.location
    if not loc:
        await _reply_loc(update.message, update, context, "❌ Пожалуйста, отправьте геолокацию через кнопку 📎")
        return True

    try:
        # Получить информацию о клиенте
        customer = await api.get_customer(session.jwt_token, cid)
        customer_name = customer.get("name_client", "—")
        customer_inn = customer.get("tax_id", "—")

        # Обновить координаты клиента
        await api.update_customer(session.jwt_token, cid, {
            "latitude": loc.latitude,
            "longitude": loc.longitude,
        })

        context.user_data.pop("update_location_step", None)
        context.user_data.pop("update_location_customer_id", None)

        updated_title = await t(update, context, "telegram.agent.location_updated_success", fallback="✅ *Локация обновлена!*\n\n")
        client_label = await t(update, context, "telegram.profile.fio", fallback="👤 Клиент:")
        inn_label = await t(update, context, "telegram.customer_create.tax_id", fallback="🔢 ИНН:")
        coords_label = await t(update, context, "telegram.agent.coordinates", fallback="📍 *Координаты:*")

        text = (
            f"{updated_title}"
            f"*{client_label}* {customer_name}\n"
            f"*{inn_label}* {customer_inn}\n"
            f"{coords_label} {loc.latitude:.6f}, {loc.longitude:.6f}\n"
        )

        await log_action(update.effective_user.id, session.login, session.role,
                         "location_updated", f"customer={cid}, lat={loc.latitude}, lon={loc.longitude}", "success")

        await update.message.reply_text(text, parse_mode="Markdown")
        from .handlers_auth import show_main_menu
        await show_main_menu(update, context, session)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await _reply_loc(update.message, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return True
        await update.message.reply_text(
            await t(update, context, "telegram.common.error_with_detail", detail=e.detail)
        )
    except Exception as e:
        logger.error(f"Error updating location: {e}")
        await update.message.reply_text(
            await t(update, context, "telegram.agent.location_update_error", detail=str(e))
        )

    return True


# ---------- Register ----------

def register_agent_handlers(app):
    # Добавить клиента v3 (FSM) - ПЕРВЫМ в группе 0!
    app.add_handler(get_add_customer_v3_handler())

    # ОТЛАДКА: Логировать ВСЕ входящие сообщения в группе 1 (ПОСЛЕ ConversationHandlers)
    from telegram.ext import MessageHandler, CallbackQueryHandler
    app.add_handler(MessageHandler(filters.ALL, debug_log_all_messages), group=1)
    app.add_handler(CallbackQueryHandler(debug_log_all_messages), group=1)

    # Создать визит (FSM)
    app.add_handler(get_create_visit_handler())

    # Добавить клиента (старая версия, оставлена для совместимости)
    app.add_handler(CallbackQueryHandler(cb_agent_add_customer, pattern="^agent_add_customer$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_skip_inn, pattern="^agent_addcust_skip_inn$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_skip_geo, pattern="^agent_addcust_skip_geo$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_skip_photo, pattern="^agent_addcust_skip_photo$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_field, pattern="^agent_addcust_field_.+$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_back_to_fields, pattern="^agent_addcust_back_to_fields$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_finish, pattern="^agent_addcust_finish$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_confirm, pattern="^agent_addcust_confirm$"))
    # Визиты
    app.add_handler(CallbackQueryHandler(cb_agent_visits, pattern="^agent_visits$"))
    app.add_handler(CallbackQueryHandler(cb_agent_visits_pick_date, pattern="^agent_visits_pick_date$"))
    app.add_handler(CallbackQueryHandler(cb_agent_visits_calendar, pattern=r"^agent_visits_calendar_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_agent_visits_date, pattern=r"^agent_visits_date_\d{4}-\d{2}-\d{2}$"))
    app.add_handler(CallbackQueryHandler(cb_agent_visit_detail, pattern=r"^agent_visit_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_agent_vcomplete, pattern=r"^agent_vcomplete_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_agent_vcancel, pattern=r"^agent_vcancel_\d+$"))
    # Создать визит
    app.add_handler(CallbackQueryHandler(cb_agent_create_visit, pattern="^agent_create_visit$"))
    app.add_handler(CallbackQueryHandler(cb_agent_create_visit_customer, pattern=r"^agent_createvisit_cust_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_agent_create_visit_confirm, pattern="^agent_createvisit_confirm$"))
    # Фото
    app.add_handler(CallbackQueryHandler(cb_agent_photo_menu, pattern="^agent_photo$"))
    app.add_handler(CallbackQueryHandler(cb_agent_vphotos, pattern=r"^agent_vphotos_\d+$"))
    # Заказ
    app.add_handler(CallbackQueryHandler(cb_agent_order, pattern="^agent_order$"))
    app.add_handler(CallbackQueryHandler(cb_agent_order_customer, pattern=r"^agent_ordercust_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_agent_prodpage, pattern=r"^agent_prodpage_(prev|next)$"))
    app.add_handler(CallbackQueryHandler(cb_agent_prod_select, pattern=r"^agent_prod_.+$"))
    app.add_handler(CallbackQueryHandler(cb_agent_checkout, pattern="^agent_ordercheckout$"))
    app.add_handler(CallbackQueryHandler(cb_agent_order_pay, pattern=r"^agent_orderpay_.+$"))
    app.add_handler(CallbackQueryHandler(cb_agent_order_confirm, pattern="^agent_orderconfirm$"))
    # Обновить локацию клиента
    app.add_handler(CallbackQueryHandler(cb_agent_update_location, pattern="^agent_update_location$"))
    app.add_handler(CallbackQueryHandler(cb_agent_update_loc_customer, pattern=r"^agent_updloc_\d+$"))
    # Единый текстовый обработчик (group=5: после ConversationHandlers group=0, но до expeditor group=10)
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, msg_agent_text), group=5)
    # Геолокация
    app.add_handler(MessageHandler(filters.LOCATION, msg_agent_location))
    # Фото upload
    app.add_handler(MessageHandler(filters.PHOTO | filters.Document.IMAGE, msg_agent_photo_upload))
