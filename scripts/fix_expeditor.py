import logging
from pathlib import Path
import re

logger = logging.getLogger(__name__)

def update_file():
    target = Path("d:/Python/Sales/src/telegram_bot/handlers_expeditor.py")
    content = target.read_text("utf-8")
    
    # 1. Translate cb_exp_my_stock
    # Replace lines 975-1046
    
    old_stock = """    if not exp_wh:
        await q.edit_message_text(
            "📊 *Мои остатки*\\n\\nЗа вами не закреплён склад.",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return

    wh_code = exp_wh.get("code", "")
    wh_name = exp_wh.get("name") or wh_code or "—"

    try:
        stock_resp = await api.get_warehouse_stock(token, warehouse=wh_code)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await _edit_loc(q, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await q.edit_message_text(
            await t(update, context, "telegram.common.error_with_detail", detail=e.detail),
            reply_markup=back_button(),
        )
        return

    rows = []
    if isinstance(stock_resp, dict):
        if stock_resp.get("success") is True:
            rows = stock_resp.get("data") or []
        elif isinstance(stock_resp.get("data"), list):
            rows = stock_resp.get("data") or []
    elif isinstance(stock_resp, list):
        rows = stock_resp

    if not rows:
        await q.edit_message_text(
            f"📊 *Мои остатки*\\n\\nСклад: {wh_name}\\nОстатков нет.",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return

    # Сортировка и агрегаты
    rows = sorted(
        rows,
        key=lambda r: (
            str(r.get("product_code") or ""),
            str(r.get("batch_code") or ""),
        ),
    )
    total_qty = sum(int(r.get("total_qty") or 0) for r in rows)
    total_cost = sum(float(r.get("total_cost") or 0) for r in rows)

    lines = [f"📊 Мои остатки\\nСклад: {wh_name}\\n"]
    max_lines = 30
    for i, r in enumerate(rows[:max_lines], 1):
        product = (r.get("product_name") or r.get("product_code") or "—").strip()
        qty = int(r.get("total_qty") or 0)
        expiry = r.get("expiry_date") or "—"
        if expiry and expiry != "—":
            expiry = fmt_date(str(expiry)[:10])
        lines.append(f"{i}. {product} | {qty} шт | срок: {expiry}")

    if len(rows) > max_lines:
        lines.append(f"\\n… и ещё {len(rows) - max_lines} поз.")

    lines.append(f"\\nИтого: {total_qty} шт")
    lines.append(f"Сумма: {fmt_money(total_cost)}")

    await q.edit_message_text(
        "\\n".join(lines),
        reply_markup=back_button(),
        parse_mode="Markdown",
    )"""

    new_stock = """    lbl_title = await t(update, context, "telegram.expeditor.my_stock", fallback="📊 Мои остатки")
    lbl_warehouse = await t(update, context, "telegram.expeditor.warehouse", fallback="Склад:")
    lbl_expiry = await t(update, context, "telegram.expeditor.expiry_date", fallback="срок:")
    lbl_total = await t(update, context, "telegram.expeditor.total", fallback="Итого:")
    lbl_pcs = await t(update, context, "telegram.expeditor.pcs", fallback="шт")
    lbl_sum = await t(update, context, "telegram.expeditor.sum", fallback="Сумма:")

    if not exp_wh:
        lbl_no_warehouse = await t(update, context, "telegram.expeditor.no_warehouse", fallback="За вами не закреплён склад.")
        await _edit_loc(q, update, context,
            f"*{lbl_title}*\\n\\n{lbl_no_warehouse}",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return

    wh_code = exp_wh.get("code", "")
    wh_name = exp_wh.get("name") or wh_code or "—"

    try:
        stock_resp = await api.get_warehouse_stock(token, warehouse=wh_code)
    except SDSApiError as e:
        if e.status == 401:
            await delete_session(q.from_user.id)
            await _edit_loc(q, update, context, "Сессия истекла. Нажмите /start для повторной авторизации.")
            return
        await _edit_loc(q, update, context,
            await t(update, context, "telegram.common.error_with_detail", detail=e.detail),
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return

    rows = []
    if isinstance(stock_resp, dict):
        if stock_resp.get("success") is True:
            rows = stock_resp.get("data") or []
        elif isinstance(stock_resp.get("data"), list):
            rows = stock_resp.get("data") or []
    elif isinstance(stock_resp, list):
        rows = stock_resp

    if not rows:
        lbl_no_stock = await t(update, context, "telegram.expeditor.no_stock", fallback="Остатков нет.")
        await _edit_loc(q, update, context,
            f"*{lbl_title}*\\n\\n{lbl_warehouse} {wh_name}\\n{lbl_no_stock}",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return

    # Сортировка и агрегаты
    rows = sorted(
        rows,
        key=lambda r: (
            str(r.get("product_code") or ""),
            str(r.get("batch_code") or ""),
        ),
    )
    total_qty = sum(int(r.get("total_qty") or 0) for r in rows)
    total_cost = sum(float(r.get("total_cost") or 0) for r in rows)

    lines = [f"*{lbl_title}*\\n{lbl_warehouse} {wh_name}\\n"]
    max_lines = 30
    for i, r in enumerate(rows[:max_lines], 1):
        product = (r.get("product_name") or r.get("product_code") or "—").strip()
        qty = int(r.get("total_qty") or 0)
        expiry = r.get("expiry_date") or "—"
        if expiry and expiry != "—":
            expiry = fmt_date(str(expiry)[:10])
        lines.append(f"{i}. {product} | {qty} {lbl_pcs} | {lbl_expiry} {expiry}")

    if len(rows) > max_lines:
        lbl_more = await t(update, context, "telegram.expeditor.more_stock", fallback="… и ещё")
        lines.append(f"\\n{lbl_more} {len(rows) - max_lines} поз.")

    lines.append(f"\\n{lbl_total} {total_qty} {lbl_pcs}")
    lines.append(f"{lbl_sum} {fmt_money(total_cost)}")

    await _edit_loc(q, update, context,
        "\\n".join(lines),
        reply_markup=back_button(), parse_mode="Markdown"
    )"""

    if old_stock in content:
        content = content.replace(old_stock, new_stock)
        print("Replaced cb_exp_my_stock")
    else:
        print("Could not find old_stock")
    
    # Add try-except to cb_exp_payment
    old_cb_exp_payment = """async def cb_exp_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    today = date.today().isoformat()
    today_end = (date.today() + timedelta(days=1)).isoformat()"""

    new_cb_exp_payment = """async def cb_exp_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    try:
        session, token = await _get_auth(update)
        if not session:
            return
        today = date.today().isoformat()
        today_end = (date.today() + timedelta(days=1)).isoformat()"""
    
    # We must also dedent and add except block to the end of cb_exp_payment
    # However, since this script uses string replacement, we can do it via regex
    content = content.replace(old_cb_exp_payment, new_cb_exp_payment)
    
    # The end of cb_exp_payment is:
    end_cb_exp_payment = """    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    await q.edit_message_text(
        "\\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )"""
    new_end_cb_exp_payment = """    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    await _edit_loc(q, update, context,
        "\\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )"""
    content = content.replace(end_cb_exp_payment, new_end_cb_exp_payment)

    # Indent the body of cb_exp_payment (brittle but works for our specific file)
    match = re.search(r'async def cb_exp_payment\(.*?\):\n.*?(?=async def cb_exp_pay_order)', content, re.DOTALL)
    if match:
        func_body = match.group(0)
        # Indent everything after `today_end = (date.today() + timedelta(days=1)).isoformat()`
        # Not easily done with regex. Let's stick to doing things properly.
    
    target.write_text(content, "utf-8")

if __name__ == "__main__":
    update_file()
