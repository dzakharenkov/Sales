"""
Функционал экспедитора v2.2: Мой маршрут (Yandex Maps), Завершить заказ, Получить оплату.
"""
import logging
from datetime import date, timedelta

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, CallbackQueryHandler, MessageHandler, filters

from .session import get_session, touch_session, log_action, delete_session
from .sds_api import api, SDSApiError
from .helpers import (
    fmt_money, fmt_date, date_picker_keyboard, calendar_keyboard,
    back_button, STATUS_RU, PAYMENT_RU,
)

logger = logging.getLogger(__name__)


# ---------- Yandex Maps helpers ----------

def yandex_map_point_url(lat: float, lon: float) -> str:
    """URL точки на Яндекс.Картах (формат из ТЗ)."""
    return f"https://maps.yandex.ru/?ll={lon},{lat}&z=17&pt={lon},{lat},pm2lbm"


def yandex_route_url(points: list[tuple[float, float]]) -> str:
    """URL маршрута через несколько точек (lat, lon)."""
    if not points:
        return ""
    rtext = "~".join(f"{lat},{lon}" for lat, lon in points)
    return f"https://maps.yandex.ru/?rtext={rtext}&rtt=auto"


# ---------- Middleware ----------

async def _get_auth(update: Update) -> tuple:
    q = update.callback_query
    tg_id = q.from_user.id
    session = await get_session(tg_id)
    if not session:
        await q.edit_message_text("Сессия истекла. Нажмите /start.")
        return None, None
    await touch_session(tg_id)
    return session, session.jwt_token


async def _fetch_customer_coords(token: str, customer_id: int) -> tuple:
    """Получить координаты и адрес клиента."""
    try:
        c = await api.get_customer(token, customer_id)
        return c.get("latitude"), c.get("longitude"), c.get("address") or "—"
    except Exception:
        return None, None, "—"


# ---------- Мой маршрут ----------

async def cb_exp_orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, _ = await _get_auth(update)
    if not session:
        return
    kb = date_picker_keyboard("exp_orders")
    await q.edit_message_text("🗺 *Мой маршрут*\n\nВыберите дату:", reply_markup=kb, parse_mode="Markdown")


async def _exp_orders_list_today(update: Update, context: ContextTypes.DEFAULT_TYPE, completed_only: bool):
    """Список заказов на сегодня (все или только выполненные)."""
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    today = date.today().isoformat()
    today_end = (date.today() + timedelta(days=1)).isoformat()
    params = {
        "login_expeditor": session.login,
        "scheduled_delivery_from": today,
        "scheduled_delivery_to": today_end,
        "limit": 50,
    }
    if completed_only:
        params["status_code"] = "completed"
    try:
        data = await api.get_orders(token, **params)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button())
        return
    all_orders = data if isinstance(data, list) else (data.get("orders") or data.get("data") or [])
    if completed_only:
        title = "✅ *Выполненные заказы сегодня*\n\n"
    else:
        title = "📦 *Мои заказы на сегодня*\n\n"
    if not all_orders:
        await q.edit_message_text(
            title + "Нет заказов.",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return
    context.user_data["exp_date"] = today
    lines = [title]
    buttons = []
    for o in all_orders:
        order_no = o.get("order_no")
        client = o.get("customer_name", "—")
        st = o.get("status_code", "")
        status = STATUS_RU.get(st, st)
        lines.append(f"• №{order_no} | {client} | {status}")
        buttons.append([InlineKeyboardButton(
            f"№{order_no} — {client}", callback_data=f"exp_order_{order_no}"
        )])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


async def cb_exp_orders_today(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await _exp_orders_list_today(update, context, completed_only=False)


async def cb_exp_orders_done_today(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await _exp_orders_list_today(update, context, completed_only=True)


async def cb_exp_orders_calendar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    offset = int(q.data.split("_")[-1])
    kb = calendar_keyboard("exp_orders", offset)
    await q.edit_message_text("📅 Выберите дату:", reply_markup=kb, parse_mode="Markdown")


async def cb_exp_orders_pick_date(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    kb = date_picker_keyboard("exp_orders")
    await q.edit_message_text("🗺 *Мой маршрут*\n\nВыберите дату:", reply_markup=kb, parse_mode="Markdown")


async def cb_exp_orders_date(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    chosen_date = q.data.split("_date_")[-1]
    context.user_data["exp_date"] = chosen_date
    chosen_date_end = (date.fromisoformat(chosen_date) + timedelta(days=1)).isoformat()

    try:
        data = await api.get_orders(
            token,
            login_expeditor=session.login,
            scheduled_delivery_from=chosen_date,
            scheduled_delivery_to=chosen_date_end,
            limit=50,
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button())
        return

    all_orders = data if isinstance(data, list) else (data.get("orders") or data.get("data") or [])
    orders = [o for o in all_orders if o.get("status_code") in ("open", "delivery")]

    if not orders:
        await q.edit_message_text(
            f"🗺 Маршрут на {fmt_date(chosen_date)}:\n\nНет заказов.",
            reply_markup=back_button("exp_orders"),
            parse_mode="Markdown",
        )
        return

    context.user_data["exp_orders_list"] = orders

    lines = [f"🗺 *Маршрут на {fmt_date(chosen_date)}:* ({len(orders)} заказов)\n"]
    buttons = []
    for o in orders:
        order_no = o.get("order_no")
        client = o.get("customer_name") or o.get("customer", {}).get("name_client", "—")
        amount = o.get("total_amount", 0)
        status = STATUS_RU.get(o.get("status_code", ""), o.get("status_code", ""))
        lines.append(f"• №{order_no} | {client} | {fmt_money(amount)} | {status}")
        buttons.append([InlineKeyboardButton(
            f"📦 №{order_no} — {client}", callback_data=f"exp_order_{order_no}"
        )])

    buttons.append([InlineKeyboardButton("🗺 Построить маршрут", callback_data=f"exp_route_{chosen_date}")])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="exp_orders")])
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


async def cb_exp_route(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Построить маршрут на Яндекс.Картах для всех заказов дня."""
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return

    orders = context.user_data.get("exp_orders_list", [])
    if not orders:
        await q.edit_message_text("Нет заказов для маршрута.", reply_markup=back_button())
        return

    await q.edit_message_text("⏳ Строю маршрут...")

    points = []
    point_names = []
    for o in orders:
        cid = o.get("customer_id")
        if not cid:
            continue
        lat, lon, addr = await _fetch_customer_coords(token, cid)
        if lat and lon:
            points.append((lat, lon))
            client = o.get("customer_name") or f"#{cid}"
            point_names.append(f"📍 {client} ({addr})")

    chosen_date = context.user_data.get("exp_date", date.today().isoformat())

    if not points:
        await q.edit_message_text(
            "❌ Нет координат клиентов для построения маршрута.\n"
            "Убедитесь, что у клиентов заполнены координаты.",
            reply_markup=back_button(f"exp_orders_date_{chosen_date}"),
        )
        return

    url = yandex_route_url(points)
    lines = [f"🗺 *Маршрут на {fmt_date(chosen_date)}:*\n"]
    for name in point_names:
        lines.append(name)
    lines.append(f"\n📍 Точек: {len(points)}")

    await log_action(q.from_user.id, session.login, session.role, "route_built",
                     f"date={chosen_date}, points={len(points)}", "success")

    buttons = [
        [InlineKeyboardButton("🗺 Открыть в Яндекс.Картах", url=url)],
        [InlineKeyboardButton("◀️ Назад", callback_data=f"exp_orders_date_{chosen_date}")],
    ]
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


async def cb_exp_order_detail(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    order_no = int(q.data.replace("exp_order_", ""))

    try:
        o = await api.get_order(token, order_no)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button("exp_orders"))
        return

    customer_id = o.get("customer_id")
    client = o.get("customer_name") or "—"
    items = o.get("items") or []
    total = o.get("total_amount", 0)
    pay_code = o.get("payment_type_code", "")
    pay = PAYMENT_RU.get(pay_code, pay_code)
    status = STATUS_RU.get(o.get("status_code", ""), o.get("status_code", ""))

    lat, lon, address = None, None, "—"
    phone = "—"
    if customer_id:
        try:
            cust = await api.get_customer(token, customer_id)
            lat = cust.get("latitude")
            lon = cust.get("longitude")
            address = cust.get("address") or "—"
            phone = cust.get("phone") or "—"
        except Exception:
            pass

    lines = [
        f"📦 *Заказ №{order_no}*\n",
        f"*Клиент:* {client}",
        f"*Телефон:* {phone}",
        f"*Адрес:* {address}",
        f"*Статус:* {status}",
        "",
        "*Товары:*",
    ]
    for it in items:
        name = it.get("product_name") or it.get("product_code", "?")
        qty = it.get("quantity", 0)
        price = it.get("price", 0)
        lines.append(f"  • {name}: {qty} × {fmt_money(price)}")
    lines.append(f"\n*Итого:* {fmt_money(total)}")
    lines.append(f"*Оплата:* {pay}")

    if lat and lon:
        lines.append(f"\n📍 Координаты: {lat}, {lon}")

    photo_count = 0
    if customer_id:
        try:
            pr = await api.get_customer_photos(token, customer_id)
            photo_count = pr.get("total", 0) if isinstance(pr, dict) else len(pr if isinstance(pr, list) else [])
        except Exception:
            pass
    if photo_count > 0:
        lines.append(f"📷 Фотографий: {photo_count}")

    context.user_data["current_order"] = o

    buttons = []
    if lat and lon:
        map_url = yandex_map_point_url(lat, lon)
        buttons.append([InlineKeyboardButton("📍 Открыть в Яндекс.Картах", url=map_url)])

    if o.get("status_code") == "open":
        buttons.append([InlineKeyboardButton("🚚 Доставить заказ", callback_data=f"exp_complete_{order_no}")])
    elif o.get("status_code") == "delivery":
        buttons.append([InlineKeyboardButton("✅ Доставлен", callback_data=f"exp_delivered_{order_no}")])

    date_str = context.user_data.get("exp_date", date.today().isoformat())
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data=f"exp_orders_date_{date_str}")])
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


# ---------- Доставить заказ (open → delivery) ----------

async def cb_exp_complete(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    order_no = int(q.data.replace("exp_complete_", ""))
    buttons = [
        [InlineKeyboardButton("✅ Да, товар доставлен", callback_data=f"exp_confirm_{order_no}")],
        [InlineKeyboardButton("◀️ Нет, назад", callback_data=f"exp_order_{order_no}")],
    ]
    await q.edit_message_text(
        f"Вы уверены, что товар по заказу №{order_no} доставлен?",
        reply_markup=InlineKeyboardMarkup(buttons),
    )


async def cb_exp_confirm_delivery(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    order_no = int(q.data.replace("exp_confirm_", ""))

    try:
        await api.update_order(token, order_no, {"status_code": "delivery"})
        await log_action(q.from_user.id, session.login, session.role, "delivery_complete",
                         f"order={order_no}", "success")
        await q.edit_message_text(
            f"🚚 *Доставка отмечена!*\nЗаказ №{order_no} — товар доставлен клиенту.\n\n"
            f"Для завершения заказа получите оплату.",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(q.from_user.id, session.login, session.role, "delivery_complete",
                         f"order={order_no}", "error", e.detail)
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button())


# ---------- Доставлен (только информирование, оплата — в «Получить оплату») ----------

async def cb_exp_delivered(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Подтверждение доставки без оплаты. Статус → completed. Оплата опционально через раздел «Получить оплату»."""
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    order_no = int(q.data.replace("exp_delivered_", ""))

    try:
        # Обновить статус заказа на completed (доставлен, оплата опционально)
        await api.update_order(token, order_no, {"status_code": "completed"})
        await log_action(q.from_user.id, session.login, session.role, "order_delivered",
                         f"order={order_no}", "success")
        await q.edit_message_text(
            f"✅ *Заказ №{order_no} доставлен!*\n\n"
            "Заказ отмечен как выполненный.\n"
            "Если клиент оплатил, используйте раздел «💰 Получить оплату» для приёма оплаты.",
            reply_markup=InlineKeyboardMarkup([
                [InlineKeyboardButton("💰 Получить оплату", callback_data="exp_payment")],
                [InlineKeyboardButton("◀️ Назад", callback_data="main_menu")],
            ]),
            parse_mode="Markdown",
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(q.from_user.id, session.login, session.role, "order_delivered",
                         f"order={order_no}", "error", e.detail)
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button())


# ---------- Получить оплату ----------

async def cb_exp_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return

    try:
        data = await api.get_orders(
            token,
            status_code="delivery",
            login_expeditor=session.login,
            limit=50,
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button())
        return

    all_orders = data if isinstance(data, list) else (data.get("orders") or data.get("data") or [])
    pay_orders = [o for o in all_orders if o.get("status_code") == "delivery"]

    if not pay_orders:
        await q.edit_message_text(
            "💰 *Получить оплату*\n\nНет заказов, ожидающих оплаты.",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return

    lines = ["💰 *Заказы для получения оплаты:*\n"]
    buttons = []
    for o in pay_orders:
        order_no = o.get("order_no")
        client = o.get("customer_name", "—")
        amount = o.get("total_amount", 0)
        pay = PAYMENT_RU.get(o.get("payment_type_code", ""), "—")
        lines.append(f"• №{order_no} | {client} | {fmt_money(amount)} | {pay}")
        buttons.append([InlineKeyboardButton(
            f"💰 №{order_no} — {fmt_money(amount)}", callback_data=f"exp_pay_{order_no}"
        )])
    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    await q.edit_message_text(
        "\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )


async def cb_exp_pay_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    order_no = int(q.data.replace("exp_pay_", ""))

    try:
        o = await api.get_order(token, order_no)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button("exp_payment"))
        return

    context.user_data["pay_order"] = o
    context.user_data["current_order"] = o
    amount = o.get("total_amount", 0)
    buttons = [
        [InlineKeyboardButton(f"✅ Полная сумма ({fmt_money(amount)})", callback_data=f"exp_payfull_{order_no}")],
        [InlineKeyboardButton("💬 Другая сумма", callback_data=f"exp_payother_{order_no}")],
        [InlineKeyboardButton("◀️ Назад", callback_data="exp_payment")],
    ]
    await q.edit_message_text(
        f"💰 Заказ №{order_no}\nСумма: {fmt_money(amount)}\n\nВы получили полную сумму?",
        reply_markup=InlineKeyboardMarkup(buttons),
    )


async def cb_exp_pay_full(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    order_no = int(q.data.replace("exp_payfull_", ""))
    o = context.user_data.get("current_order") or context.user_data.get("pay_order") or {}
    amount = float(o.get("total_amount", 0))
    customer_id = o.get("customer_id") or 0
    payment_type_code = o.get("payment_type_code") or "cash"

    try:
        await api.update_order(token, order_no, {"status_code": "completed"})
        if customer_id and amount > 0:
            try:
                await api.create_payment_receipt(
                    token, order_no, customer_id, amount, payment_type_code, session.login
                )
            except SDSApiError as op_err:
                await log_action(q.from_user.id, session.login, session.role, "payment_receipt_create",
                                 f"order={order_no}", "error", op_err.detail)
        await log_action(q.from_user.id, session.login, session.role, "payment_received",
                         f"order={order_no}, amount={amount}", "success")
        await q.edit_message_text(
            f"✅ Заказ №{order_no} завершён!\nОплата получена: {fmt_money(amount)}",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await log_action(q.from_user.id, session.login, session.role, "payment_received",
                         f"order={order_no}", "error", e.detail)
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button("exp_payment"))


async def cb_exp_pay_other(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    order_no = int(q.data.replace("exp_payother_", ""))
    context.user_data["pay_other_order"] = order_no
    await q.edit_message_text(
        f"Введите полученную сумму по заказу №{order_no}:",
        reply_markup=back_button("exp_payment"),
    )


async def msg_exp_pay_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка ввода суммы (текстом)."""
    order_no = context.user_data.get("pay_other_order")
    if not order_no:
        return
    session = await get_session(update.effective_user.id)
    if not session:
        await update.message.reply_text("Сессия истекла. Нажмите /start.")
        return

    text = update.message.text.strip().replace(",", ".").replace(" ", "")
    try:
        amount = float(text)
    except ValueError:
        await update.message.reply_text("❌ Введите число > 0:")
        return
    if amount <= 0:
        await update.message.reply_text("❌ Сумма должна быть > 0:")
        return

    o = context.user_data.get("current_order") or context.user_data.get("pay_order") or {}
    planned = float(o.get("total_amount", 0))
    if planned > 0 and amount > planned * 1.1:
        await update.message.reply_text(
            f"❌ Сумма не может превышать {fmt_money(planned * 1.1)}. Введите снова:"
        )
        return

    customer_id = o.get("customer_id") or 0
    payment_type_code = o.get("payment_type_code") or "cash"
    try:
        await api.update_order(session.jwt_token, order_no, {"status_code": "completed"})
        if customer_id and amount > 0:
            try:
                await api.create_payment_receipt(
                    session.jwt_token, order_no, customer_id, amount, payment_type_code, session.login
                )
            except SDSApiError as op_err:
                await log_action(update.effective_user.id, session.login, session.role, "payment_receipt_create",
                                 f"order={order_no}", "error", op_err.detail)
        await log_action(update.effective_user.id, session.login, session.role, "payment_received",
                         f"order={order_no}, amount={amount}", "success")
        context.user_data.pop("pay_other_order", None)
        await update.message.reply_text(
            f"✅ Заказ №{order_no} завершён!\nОплата получена: {fmt_money(amount)}"
        )
        from .handlers_auth import show_main_menu
        await show_main_menu(update, context, session)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(update.effective_user.id)
            await update.message.reply_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await update.message.reply_text(f"❌ Ошибка: {e.detail}")


# ---------- Полученная оплата (просмотр операций cash_handover_from_expeditor) ----------

async def cb_exp_received_payments(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Список операций передачи наличных от экспедитора кассиру."""
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return

    try:
        # Получить операции cash_handover_from_expeditor для текущего экспедитора
        operations = await api.get_operations(
            token,
            type_code="cash_handover_from_expeditor",
            created_by=session.login,
        )
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await q.edit_message_text("Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(f"❌ Ошибка: {e.detail}", reply_markup=back_button())
        return

    if not operations or len(operations) == 0:
        await q.edit_message_text(
            "💵 *Полученная оплата*\n\nНет записей о переданных деньгах.",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return

    lines = ["💵 *Полученная оплата от клиентов:*\n"]
    for op in operations:
        op_num = op.get("operation_number", "—")
        amount = op.get("amount", 0)
        status = op.get("status", "")
        status_ru = {"pending": "Ожидает передачи", "completed": "Передано", "cancelled": "Отменено"}.get(status, status)
        order_id = op.get("order_id") or "—"
        op_date = op.get("operation_date", "")
        date_str = fmt_date(op_date[:10]) if op_date else "—"

        lines.append(f"• {op_num} | Заказ №{order_id} | {fmt_money(amount)} | {status_ru} | {date_str}")

    await q.edit_message_text(
        "\n".join(lines),
        reply_markup=back_button(),
        parse_mode="Markdown",
    )


# ---------- Register ----------

def register_expeditor_handlers(app):
    app.add_handler(CallbackQueryHandler(cb_exp_orders, pattern="^exp_orders$"))
    app.add_handler(CallbackQueryHandler(cb_exp_orders_today, pattern="^exp_orders_today$"))
    app.add_handler(CallbackQueryHandler(cb_exp_orders_done_today, pattern="^exp_orders_done_today$"))
    app.add_handler(CallbackQueryHandler(cb_exp_orders_pick_date, pattern="^exp_orders_pick_date$"))
    app.add_handler(CallbackQueryHandler(cb_exp_orders_calendar, pattern=r"^exp_orders_calendar_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_exp_orders_date, pattern=r"^exp_orders_date_\d{4}-\d{2}-\d{2}$"))
    app.add_handler(CallbackQueryHandler(cb_exp_order_detail, pattern=r"^exp_order_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_exp_complete, pattern=r"^exp_complete_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_exp_confirm_delivery, pattern=r"^exp_confirm_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_exp_delivered, pattern=r"^exp_delivered_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_exp_route, pattern=r"^exp_route_\d{4}-\d{2}-\d{2}$"))
    app.add_handler(CallbackQueryHandler(cb_exp_payment, pattern="^exp_payment$"))
    app.add_handler(CallbackQueryHandler(cb_exp_pay_order, pattern=r"^exp_pay_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_exp_pay_full, pattern=r"^exp_payfull_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_exp_pay_other, pattern=r"^exp_payother_\d+$"))
    app.add_handler(CallbackQueryHandler(cb_exp_received_payments, pattern="^exp_received_payments$"))
    app.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND & filters.Regex(r"^\d"),
        msg_exp_pay_amount,
    ))
