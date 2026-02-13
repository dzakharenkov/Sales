"""
Функционал агента v2.2: Добавить клиента, Мои визиты, Фото клиента, Создать заказ.
"""
import logging
import re
from datetime import date, datetime

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, CallbackQueryHandler, MessageHandler, filters

from .session import get_session, touch_session, log_action, delete_session
from .sds_api import api, SDSApiError
from .helpers import (
    fmt_money, fmt_date, date_picker_keyboard, calendar_keyboard,
    back_button, STATUS_RU, PAYMENT_RU, get_cached_products, get_cached_payment_types,
)

logger = logging.getLogger(__name__)


async def _get_auth(update: Update):
    q = update.callback_query
    tg_id = q.from_user.id
    session = await get_session(tg_id)
    if not session:
        await q.edit_message_text("Сессия истекла. Нажмите /start.")
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
        "order_cart", "order_customer_id", "order_payment", "order_lat",
        "order_lon", "order_photo_uploaded", "products_page",
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
        await update.message.reply_text("Сессия истекла. Нажмите /start.")
        return True

    if step == "name":
        name = update.message.text.strip()
        if len(name) < 2:
            await update.message.reply_text("❌ Название минимум 2 символа. Введите снова:")
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
        # Валидация ИНН: 9-12 цифр
        if not re.match(r"^\d{9,12}$", inn):
            await update.message.reply_text(
                "❌ ИНН должен содержать от 9 до 12 цифр. Введите снова:",
                reply_markup=InlineKeyboardMarkup([
                    [InlineKeyboardButton("⏭ Пропустить", callback_data="agent_addcust_skip_inn")],
                ]),
            )
            return True
        context.user_data["add_cust_inn"] = inn
        context.user_data["add_cust_step"] = "fields"
        await _show_add_customer_fields_menu(update, context, is_callback=False)
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
    await q.edit_message_text(prompt, parse_mode="Markdown")


async def cb_agent_addcust_finish(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Завершить заведение клиента — сохранить в БД."""
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    name = (context.user_data.get("add_cust_name") or "").strip()
    if len(name) < 2:
        await q.edit_message_text("❌ Заполните хотя бы *название клиента* (минимум 2 символа).", parse_mode="Markdown")
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
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button())


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
            await update.message.reply_text("❌ Отправьте изображение (JPG, PNG, WEBP).")
            return True
        if file.file_size and file.file_size > 10 * 1024 * 1024:
            await update.message.reply_text("❌ Файл слишком большой (макс. 10 МБ).")
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
        await update.message.reply_text("❌ Отправьте изображение (JPG, PNG, WEBP).")
        return True
    if file.file_size and file.file_size > 10 * 1024 * 1024:
        await update.message.reply_text("❌ Файл слишком большой (макс. 10 МБ).")
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
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(q.from_user.id, session.login, session.role,
                         "customer_created", f"name={name}", "error", e.detail)
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button())


# ====================== МОИ ВИЗИТЫ ======================

async def cb_agent_visits(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    _clear_agent_state(context)
    kb = date_picker_keyboard("agent_visits")
    await q.edit_message_text("📋 *Мои визиты*\n\nВыберите дату:", reply_markup=kb, parse_mode="Markdown")


async def cb_agent_visits_calendar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    offset = int(q.data.split("_")[-1])
    kb = calendar_keyboard("agent_visits", offset)
    await q.edit_message_text("📅 Выберите дату:", reply_markup=kb, parse_mode="Markdown")


async def cb_agent_visits_pick_date(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    kb = date_picker_keyboard("agent_visits")
    await q.edit_message_text("📋 *Мои визиты*\n\nВыберите дату:", reply_markup=kb, parse_mode="Markdown")


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
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button("agent_visits"))
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
        status = STATUS_RU.get(v.get("status", ""), v.get("status", ""))
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
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button("agent_visits"))
        return

    context.user_data["current_visit"] = v
    client = v.get("customer_name", "—")
    phone = v.get("phone", "—")
    address = v.get("address", "—")
    visit_date = fmt_date(v.get("visit_date"))
    visit_time = v.get("visit_time", "—")
    status = STATUS_RU.get(v.get("status", ""), v.get("status", ""))
    comment = v.get("comment") or "—"
    customer_id = v.get("customer_id")

    photo_count = 0
    if customer_id:
        try:
            pr = await api.get_customer_photos(token, customer_id)
            photo_count = pr.get("total", 0) if isinstance(pr, dict) else len(pr if isinstance(pr, list) else [])
        except Exception:
            pass

    lines = [
        f"📋 *Визит #{vid}*\n",
        f"*Клиент:* {client}",
        f"*Телефон:* {phone}",
        f"*Адрес:* {address}",
        f"*Дата:* {visit_date}",
        f"*Время:* {visit_time}",
        f"*Статус:* {status}",
        f"*Комментарий:* {comment}",
        f"📷 Фотографий: {photo_count}",
    ]

    buttons = []
    if v.get("status") in ("planned", "in_progress"):
        buttons.append([InlineKeyboardButton("✅ Отметить выполнено", callback_data=f"agent_vcomplete_{vid}")])
        buttons.append([InlineKeyboardButton("❌ Отметить не выполнено", callback_data=f"agent_vcancel_{vid}")])
    if customer_id:
        buttons.append([InlineKeyboardButton("📸 Фотографии", callback_data=f"agent_vphotos_{customer_id}")])
    date_str = context.user_data.get("agent_date", date.today().isoformat())
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data=f"agent_visits_date_{date_str}")])
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
        f"Визит #{vid}\n\nВведите комментарий (минимум 10 символов):",
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
        await update.message.reply_text("❌ Комментарий минимум 10 символов. Введите снова:")
        return True
    try:
        await api.update_visit(session.jwt_token, vid, {"status": "completed", "comment": comment})
        await log_action(update.effective_user.id, session.login, session.role,
                         "visit_completed", f"visit={vid}", "success")
        context.user_data.pop("vcomplete_id", None)
        await update.message.reply_text(f"✅ Визит #{vid} отмечен выполненным!")
        from .handlers_auth import show_main_menu
        await show_main_menu(update, context, session)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await update.message.reply_text("Сессия истекла. Нажмите /start для повторной авторизации.")
        else:
            await update.message.reply_text(f"❌ Ошибка: {e.detail}")
    return True


# ---------- Отметить не выполнено ----------

async def cb_agent_vcancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    vid = int(q.data.replace("agent_vcancel_", ""))
    _clear_agent_state(context)
    context.user_data["vcancel_id"] = vid
    await q.edit_message_text(
        f"Визит #{vid}\n\nВведите причину (или «-» чтобы пропустить):",
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
        await update.message.reply_text(f"❌ Визит #{vid} отмечен как не выполненный.")
        from .handlers_auth import show_main_menu
        await show_main_menu(update, context, session)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await update.message.reply_text("Сессия истекла. Нажмите /start для повторной авторизации.")
        else:
            await update.message.reply_text(f"❌ Ошибка: {e.detail}")
    return True


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
            await update.message.reply_text("Сессия истекла. Нажмите /start для повторной авторизации.")
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
        customers = await api.search_customers(session.jwt_token, name_client=query, limit=10)
    except SDSApiError as e:
        if getattr(e, "status", None) == 401:
            await delete_session(update.effective_user.id)
            await update.message.reply_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return True
        customers = []
    if not customers or not isinstance(customers, list) or len(customers) == 0:
        await update.message.reply_text("Клиенты не найдены. Попробуйте другой запрос:")
        return True
    buttons = []
    for c in customers:
        cid = c.get("id")
        name = c.get("name_client") or c.get("firm_name") or f"#{cid}"
        buttons.append([InlineKeyboardButton(name, callback_data=f"agent_vphotos_{cid}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    context.user_data.pop("photo_search", None)
    await update.message.reply_text("Выберите клиента:", reply_markup=InlineKeyboardMarkup(buttons))
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
        await update.message.reply_text("❌ Отправьте изображение (JPG, PNG, WEBP, макс. 10 МБ).")
        return
    if file.file_size and file.file_size > 10 * 1024 * 1024:
        await update.message.reply_text("❌ Файл слишком большой (макс. 10 МБ).")
        return

    now = datetime.now()
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    auto_filename = f"{customer_id}_{now.strftime('%d%m%Y_%H%M%S')}.{ext}"
    file_bytes = await file.download_as_bytearray()

    try:
        await api.upload_photo(session.jwt_token, customer_id, bytes(file_bytes), auto_filename)
        await log_action(update.effective_user.id, session.login, session.role,
                         "photo_upload", f"customer={customer_id}", "success")
        await update.message.reply_text(f"✅ Фото загружено! ({auto_filename})")
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await update.message.reply_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(update.effective_user.id, session.login, session.role,
                         "photo_upload", f"customer={customer_id}", "error", e.detail)
        await update.message.reply_text(f"❌ Ошибка загрузки: {e.detail}")


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
        customers = await api.search_customers(session.jwt_token, name_client=query, limit=10)
    except SDSApiError as e:
        if getattr(e, "status", None) == 401:
            await delete_session(update.effective_user.id)
            await update.message.reply_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return True
        customers = []
    if not customers or not isinstance(customers, list) or len(customers) == 0:
        await update.message.reply_text("Клиенты не найдены. Попробуйте другой запрос:")
        return True
    buttons = []
    for c in customers:
        cid = c.get("id")
        name = c.get("name_client") or c.get("firm_name") or f"#{cid}"
        buttons.append([InlineKeyboardButton(name, callback_data=f"agent_ordercust_{cid}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    context.user_data.pop("order_search", None)
    await update.message.reply_text("Выберите клиента:", reply_markup=InlineKeyboardMarkup(buttons))
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
    start = page * 5
    end = start + 5
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
        cart_text = "\n🛒 *Корзина:*\n" + "\n".join(cart_lines) + f"\n*Итого:* {fmt_money(total_sum)}\n"

    lines = [f"📦 *Выберите товар* (стр. {page + 1}/{(total + 4) // 5}){cart_text}\n"]
    buttons = []
    for p in page_items:
        code = p.get("code")
        name = p.get("name", "?")
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
        buttons.append([InlineKeyboardButton("✅ Оформить заказ", callback_data="agent_ordercheckout")])
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
        await q.edit_message_text("Товар не найден.", reply_markup=back_button())
        return
    _clear_agent_state(context)
    context.user_data["adding_product"] = product
    await q.edit_message_text(
        f"📦 *{product['name']}*\nЦена: {fmt_money(product.get('price', 0))}\n\nВведите количество:",
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
        await update.message.reply_text("❌ Введите целое число > 0:")
        return True
    cart = context.user_data.get("order_cart", [])
    cart.append({
        "product_code": product.get("code"),
        "name": product.get("name", "?"),
        "price": float(product.get("price", 0)),
        "qty": qty,
    })
    context.user_data["order_cart"] = cart
    context.user_data.pop("adding_product", None)
    total = sum(i["qty"] * i["price"] for i in cart)
    buttons = [
        [InlineKeyboardButton("✅ Добавить ещё", callback_data=f"agent_ordercust_{context.user_data.get('order_customer_id', 0)}")],
        [InlineKeyboardButton("🛒 Оформить заказ", callback_data="agent_ordercheckout")],
    ]
    await update.message.reply_text(
        f"✅ Добавлено: {product['name']} × {qty}\n🛒 Итого: {fmt_money(total)}\n\nДобавить ещё товар?",
        reply_markup=InlineKeyboardMarkup(buttons),
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
        name = PAYMENT_RU.get(code, pt.get("name", code))
        buttons.append([InlineKeyboardButton(name, callback_data=f"agent_orderpay_{code}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data=f"agent_ordercust_{context.user_data.get('order_customer_id', 0)}")])

    cart = context.user_data.get("order_cart", [])
    total = sum(i["qty"] * i["price"] for i in cart)
    lines = ["🛒 *Корзина:*\n"]
    for item in cart:
        lines.append(f"• {item['name']}: {item['qty']} × {fmt_money(item['price'])}")
    lines.append(f"\n*Итого:* {fmt_money(total)}")
    lines.append("\nВыберите *тип оплаты*:")
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


async def cb_agent_order_pay(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """После выбора оплаты — запрос геолокации (обязательно по ТЗ)."""
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    pay_code = q.data.replace("agent_orderpay_", "")
    context.user_data["order_payment"] = pay_code
    context.user_data["order_geo_step"] = True
    await q.edit_message_text(
        "📍 *Геолокация доставки* (обязательно)\n\n"
        "Отправьте геолокацию через Telegram\n"
        "(нажмите 📎 → Геолокация)",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("◀️ Назад", callback_data="agent_ordercheckout")],
        ]),
        parse_mode="Markdown",
    )


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
        await update.message.reply_text("❌ Отправьте изображение (JPG, PNG, WEBP).")
        return
    if file.file_size and file.file_size > 10 * 1024 * 1024:
        await update.message.reply_text("❌ Файл слишком большой (макс. 10 МБ).")
        return

    now = datetime.now()
    auto_filename = f"{customer_id}_{now.strftime('%d%m%Y_%H%M%S')}.jpg"
    file_bytes = await file.download_as_bytearray()

    try:
        await api.upload_photo(session.jwt_token, customer_id, bytes(file_bytes), auto_filename)
        context.user_data["order_photo_uploaded"] = True
        await update.message.reply_text(f"✅ Фото загружено! ({auto_filename})")
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await update.message.reply_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await update.message.reply_text(f"⚠️ Не удалось загрузить фото: {e.detail}")

    context.user_data.pop("order_photo_step", None)
    await _show_order_confirm(update, context, is_callback=False)


async def _show_order_confirm(update, context, is_callback: bool):
    cart = context.user_data.get("order_cart", [])
    total = sum(i["qty"] * i["price"] for i in cart)
    cid = context.user_data.get("order_customer_id")
    pay_code = context.user_data.get("order_payment", "cash_sum")
    pay_name = PAYMENT_RU.get(pay_code, pay_code)
    lat = context.user_data.get("order_lat")
    lon = context.user_data.get("order_lon")

    lines = [
        "📋 *Подтверждение заказа:*\n",
        f"*Клиент:* #{cid}",
    ]
    for item in cart:
        lines.append(f"• {item['name']}: {item['qty']} × {fmt_money(item['price'])}")
    lines.append(f"\n*Итого:* {fmt_money(total)}")
    lines.append(f"*Оплата:* {pay_name}")
    if lat and lon:
        lines.append(f"📍 Координаты: {lat:.6f}, {lon:.6f}")
    if context.user_data.get("order_photo_uploaded"):
        lines.append("📷 Фото: ✅")

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
    lat = context.user_data.get("order_lat")
    lon = context.user_data.get("order_lon")

    try:
        order = await api.create_order(token, {
            "customer_id": cid,
            "status_code": "open",
            "payment_type_code": pay_code,
        })
        order_no = order.get("order_no") or order.get("id")

        for item in cart:
            await api.add_order_item(token, order_no, {
                "product_code": item["product_code"],
                "quantity": item["qty"],
                "price": item["price"],
            })
        await api.update_order_total(token, order_no, total)

        # Обновить координаты клиента если получены
        if lat and lon and cid:
            try:
                await api.update_customer(token, cid, {"latitude": lat, "longitude": lon})
            except Exception:
                pass

        coord_info = f", lat={lat}, lon={lon}" if lat else ""
        await log_action(q.from_user.id, session.login, session.role,
                         "order_created", f"order={order_no}, total={total}{coord_info}", "success")

        for k in ["order_cart", "order_customer_id", "order_payment",
                   "order_lat", "order_lon", "order_photo_uploaded",
                   "order_photo_step", "order_geo_step", "products_page"]:
            context.user_data.pop(k, None)

        await q.edit_message_text(
            f"✅ *Заказ №{order_no} создан!*\n\nКлиент: #{cid}\nСумма: {fmt_money(total)}",
            reply_markup=back_button(), parse_mode="Markdown",
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(q.from_user.id, session.login, session.role,
                         "order_created", f"customer={cid}", "error", e.detail)
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button())


# ====================== ОБЩИЙ ТЕКСТОВЫЙ ДИСПЕТЧЕР ======================

async def msg_agent_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Единый обработчик текстовых сообщений агента."""
    if context.user_data.get("add_cust_step") in ("name", "inn", "fields"):
        if await _handle_add_customer_text(update, context):
            return
    if context.user_data.get("vcomplete_id"):
        if await _handle_vcomplete_comment(update, context):
            return
    if context.user_data.get("vcancel_id"):
        if await _handle_vcancel_comment(update, context):
            return
    if context.user_data.get("photo_search"):
        if await _handle_photo_search(update, context):
            return
    if context.user_data.get("order_search"):
        if await _handle_order_search(update, context):
            return
    if context.user_data.get("adding_product"):
        if await _handle_product_qty(update, context):
            return


async def msg_agent_location(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик геолокации."""
    if context.user_data.get("add_cust_step") == "fields":
        await _handle_add_customer_location(update, context)
        return
    if context.user_data.get("order_geo_step"):
        await _handle_order_location(update, context)
        return


# ---------- Register ----------

def register_agent_handlers(app):
    # Добавить клиента
    app.add_handler(CallbackQueryHandler(cb_agent_add_customer, pattern="^agent_add_customer$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_skip_inn, pattern="^agent_addcust_skip_inn$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_skip_geo, pattern="^agent_addcust_skip_geo$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_skip_photo, pattern="^agent_addcust_skip_photo$"))
    app.add_handler(CallbackQueryHandler(cb_agent_addcust_field, pattern="^agent_addcust_field_.+$"))
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
    # Единый текстовый обработчик
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, msg_agent_text))
    # Геолокация
    app.add_handler(MessageHandler(filters.LOCATION, msg_agent_location))
    # Фото upload
    app.add_handler(MessageHandler(filters.PHOTO | filters.Document.IMAGE, msg_agent_photo_upload))
