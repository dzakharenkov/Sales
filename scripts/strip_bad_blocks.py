import os
import sys

target = "d:/Python/Sales/src/telegram_bot/handlers_expeditor.py"
with open(target, 'r', encoding='utf-8') as f:
    text = f.read()

bad_rec_block = """    except Exception as e:
        import traceback; traceback.print_exc()
        await _edit_loc(q, update, context, f"Внутренняя ошибка (Полученная оплата): {e}", reply_markup=back_button())"""

bad_pay_block = """    except Exception as e:
        import traceback; traceback.print_exc()
        await _edit_loc(q, update, context, f"Внутренняя ошибка (Получить оплату): {e}", reply_markup=back_button())"""

text = text.replace(bad_rec_block, "")
text = text.replace(bad_pay_block, "")

# Now find where cb_exp_payment and cb_exp_received_payments end and properly add the except block.
# Actually, since I removed the bad blocks, let's just do a clean regex or string find.
# Or better yet, we can examine the file manually right after stripping them.

with open(target, 'w', encoding='utf-8') as f:
    f.write(text)
print("Removed bad blocks.")
