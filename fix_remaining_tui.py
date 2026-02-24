path = r'd:\Python\Sales\src\static\app.html'
with open(path, encoding='utf-8') as f:
    content = f.read()

replacements = [
    ("tUi('op_form_select_batch', ", "tr('ui.op.form.select_batch', "),
    ("tUi('select_customer', ", "tr('ui.op.form.not_specified', "),
    ("tUi('select_payment_type', ", "tr('ui.op.form.not_specified', "),
]
count = 0
for old, new in replacements:
    n = content.count(old)
    content = content.replace(old, new)
    count += n
    print(f'Replaced {n}x: {old}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Done. Total replacements: {count}')
