import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def update_file():
    target = Path("d:/Python/Sales/src/telegram_bot/handlers_expeditor.py")
    content = target.read_text("utf-8")
    
    # 1. Translate _exp_orders_list_today
    old_code_1 = """    all_orders = data if isinstance(data, list) else (data.get("orders") or data.get("data") or [])
    if completed_only:
        title = "✅ *Выполненные заказы сегодня*\\n\\n"
    else:
        title = "📦 *Мои заказы на сегодня*\\n\\n"
    if not all_orders:
        await q.edit_message_text(
            title + "Нет заказов.",
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return"""

    new_code_1 = """    all_orders = data if isinstance(data, list) else (data.get("orders") or data.get("data") or [])
    if completed_only:
        lbl_title = await t(update, context, "telegram.expeditor.completed_today", fallback="Выполненные заказы сегодня")
        title = f"✅ *{lbl_title}*\\n\\n"
    else:
        lbl_title = await t(update, context, "telegram.expeditor.my_orders_today", fallback="Мои заказы на сегодня")
        title = f"📦 *{lbl_title}*\\n\\n"
    if not all_orders:
        lbl_no_orders = await t(update, context, "telegram.expeditor.no_orders", fallback="Нет заказов.")
        await _edit_loc(q, update, context,
            title + lbl_no_orders,
            reply_markup=back_button(),
            parse_mode="Markdown",
        )
        return"""

    content = content.replace(old_code_1, new_code_1)

    old_code_2 = """    if all_completed:
        lines.append("Все заказы завершены!\\n")"""

    new_code_2 = """    if all_completed:
        lbl_all_done = await t(update, context, "telegram.expeditor.all_done", fallback="Все заказы завершены!")
        lines.append(f"{lbl_all_done}\\n")"""
        
    content = content.replace(old_code_2, new_code_2)

    old_code_3 = """    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    await q.edit_message_text(
        "\\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )"""

    new_code_3 = """    btn_back = await t(update, context, "telegram.button.back", fallback="◀️ Назад")
    buttons.append([InlineKeyboardButton(btn_back, callback_data="main_menu")])
    await _edit_loc(q, update, context,
        "\\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )"""

    content = content.replace(old_code_3, new_code_3)

    # Wrap cb_exp_payment in try-except
    old_pay_1 = """async def cb_exp_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return
    today = date.today().isoformat()
    today_end = (date.today() + timedelta(days=1)).isoformat()"""

    new_pay_1 = """async def cb_exp_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    try:
        session, token = await _get_auth(update)
        if not session:
            return
        today = date.today().isoformat()
        today_end = (date.today() + timedelta(days=1)).isoformat()"""
        
    old_pay_end = """    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    await q.edit_message_text(
        "\\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )"""

    new_pay_end = """    buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="main_menu")])
    await _edit_loc(q, update, context,
        "\\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )
    except Exception as e:
        import traceback; traceback.print_exc()
        await _edit_loc(q, update, context, f"Внутренняя ошибка (Получить оплату): {e}", reply_markup=back_button())"""
        
    content = content.replace(old_pay_1, new_pay_1)
    content = content.replace(old_pay_end, new_pay_end)
    
    # Wrap cb_exp_received_payments in try-except
    old_rec_1 = """async def cb_exp_received_payments(update: Update, context: ContextTypes.DEFAULT_TYPE):
    \"\"\"Список операций получения оплаты от клиента экспедитором.\"\"\"
    q = update.callback_query
    await q.answer()
    session, token = await _get_auth(update)
    if not session:
        return

    try:
        # Получить операции "получение оплаты от клиента" для текущего экспедитора
        operations = await api.get_operations("""

    new_rec_1 = """async def cb_exp_received_payments(update: Update, context: ContextTypes.DEFAULT_TYPE):
    \"\"\"Список операций получения оплаты от клиента экспедитором.\"\"\"
    q = update.callback_query
    await q.answer()
    try:
        session, token = await _get_auth(update)
        if not session:
            return

        # Получить операции "получение оплаты от клиента" для текущего экспедитора
        operations = await api.get_operations("""

    old_rec_end = """    await q.edit_message_text(
        "\\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )"""

    new_rec_end = """    await _edit_loc(q, update, context,
        "\\n".join(lines), reply_markup=InlineKeyboardMarkup(buttons), parse_mode="Markdown"
    )
    except Exception as e:
        import traceback; traceback.print_exc()
        await _edit_loc(q, update, context, f"Внутренняя ошибка (Полученная оплата): {e}", reply_markup=back_button())"""
        
    content = content.replace(old_rec_1, new_rec_1)
    content = content.replace(old_rec_end, new_rec_end)
    
    target.write_text(content, "utf-8")
    print("Replacements done in handlers_expeditor.py")

if __name__ == "__main__":
    update_file()
