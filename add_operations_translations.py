"""
Add operations form translations to "Sales".translations table.
Keys use ui.op.* namespace per the translation module docs.
Each key is inserted for ru, uz, en.
"""
import os
import uuid
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ['DATABASE_URL']

# All translations: (key, ru, uz, en, category)
TRANSLATIONS = [
    # ── Generic operation form ─────────────────────────────────────────────
    ("ui.op.form.create_title",     "Создание операции",           "Operatsiya yaratish",             "Create operation",                "fields"),
    ("ui.op.form.edit_prefix",      "Редактирование ",             "Tahrirlash ",                     "Edit ",                           "fields"),
    ("ui.op.form.date_lbl",         "Дата операции",               "Operatsiya sanasi",               "Operation date",                  "fields"),
    ("ui.op.form.type_lbl",         "Тип операции",                "Operatsiya turi",                 "Operation type",                  "fields"),
    ("ui.op.form.type_placeholder", "— Выберите тип —",            "— Turni tanlang —",               "— Select type —",                 "fields"),
    ("ui.op.form.status_lbl",       "Статус",                      "Holat",                           "Status",                          "fields"),
    ("ui.op.form.wh_from_lbl",      "Склад от",                    "Ombordan",                        "Warehouse from",                  "fields"),
    ("ui.op.form.wh_to_lbl",        "Склад в",                     "Omborgacha",                      "Warehouse to",                    "fields"),
    ("ui.op.form.customer_lbl",     "Клиент",                      "Mijoz",                           "Customer",                        "fields"),
    ("ui.op.form.product_lbl",      "Товар",                       "Mahsulot",                        "Product",                         "fields"),
    ("ui.op.form.quantity_lbl",     "Количество",                  "Miqdor",                          "Quantity",                        "fields"),
    ("ui.op.form.amount_lbl",       "Сумма",                       "Summa",                           "Amount",                          "fields"),
    ("ui.op.form.payment_type_lbl", "Тип оплаты",                  "To'lov turi",                     "Payment type",                    "fields"),
    ("ui.op.form.order_no_lbl",     "Заказ №",                     "Buyurtma №",                      "Order #",                         "fields"),
    ("ui.op.form.expeditor_lbl",    "Экспедитор",                  "Ekspeditor",                      "Expeditor",                       "fields"),
    ("ui.op.form.cashier_lbl",      "Кассир",                      "Kassir",                          "Cashier",                         "fields"),
    ("ui.op.form.storekeeper_lbl",  "Кладовщик",                   "Omborchi",                        "Storekeeper",                     "fields"),
    ("ui.op.form.comment_lbl",      "Комментарий",                 "Izoh",                            "Comment",                         "fields"),
    ("ui.op.form.created_by_lbl",   "Кто создал",                  "Kim yaratdi",                     "Created by",                      "fields"),
    ("ui.op.form.optional",         "необяз.",                     "ixtiyoriy",                       "optional",                        "fields"),
    ("ui.op.form.not_specified",    "— Не указан —",               "— Belgilanmagan —",               "— Not specified —",               "fields"),
    ("ui.op.form.select_wh",        "— Выберите склад —",          "— Ombor tanlang —",               "— Select warehouse —",            "fields"),
    ("ui.op.form.select_product",   "— Выберите товар —",          "— Mahsulot tanlang —",            "— Select product —",              "fields"),
    ("ui.op.form.select_batch",     "— Выберите партию —",         "— Partiyani tanlang —",           "— Select batch —",                "fields"),
    ("ui.op.form.no_data",          "— нет данных —",              "— ma'lumot yo'q —",               "— no data —",                     "fields"),
    # ── Buttons ───────────────────────────────────────────────────────────
    ("ui.op.form.save_btn",         "Сохранить операцию",          "Operatsiyani saqlash",            "Save operation",                  "buttons"),
    ("ui.op.form.save_ops_btn",     "Сохранить операции",          "Operatsiyalarni saqlash",         "Save operations",                 "buttons"),
    # ── Messages ──────────────────────────────────────────────────────────
    ("ui.op.form.saving",           "Сохранение...",               "Saqlanmoqda...",                  "Saving...",                       "messages"),
    ("ui.op.form.saved",            "Операция сохранена.",         "Operatsiya saqlandi.",            "Operation saved.",                "messages"),
    ("ui.op.form.ops_created",      "Операции созданы: ",          "Operatsiyalar yaratildi: ",       "Operations created: ",            "messages"),
    # ── Errors ────────────────────────────────────────────────────────────
    ("ui.op.form.err_select_type",  "Выберите тип операции.",      "Operatsiya turini tanlang.",      "Please select operation type.",   "messages"),
    ("ui.op.form.err_unknown",      "Неизвестная ошибка",          "Noma'lum xato",                   "Unknown error",                   "messages"),
    # ── Allocation form (Выдача экспедитору) ──────────────────────────────
    ("ui.alloc.form.create_title",      "Создание операции: ",            "Operatsiya yaratish: ",            "Create operation: ",              "fields"),
    ("ui.alloc.form.op_name",           "Выдача экспедитору",             "Ekspeditorga berish",              "Expeditor dispatch",              "fields"),
    ("ui.alloc.form.wh_from_lbl",       "Склад от",                       "Ombordan",                         "Warehouse from",                  "fields"),
    ("ui.alloc.form.expeditor_lbl",     "Экспедитор",                     "Ekspeditor",                       "Expeditor",                       "fields"),
    ("ui.alloc.form.wh_to_lbl",         "Склад в",                        "Omborgacha",                       "Warehouse to",                    "fields"),
    ("ui.alloc.form.delivery_date_lbl", "Дата поставки",                  "Yetkazib berish sanasi",           "Delivery date",                   "fields"),
    ("ui.alloc.form.pull_btn",          "Подтянуть товары по дате поставки", "Mahsulotlarni sana bo'yicha yuklash", "Load products by delivery date", "buttons"),
    ("ui.alloc.form.pulling",           "Подтягиваем...",                 "Yuklanmoqda...",                   "Loading...",                      "messages"),
    ("ui.alloc.form.products_lbl",      "Товары",                         "Mahsulotlar",                      "Products",                        "fields"),
    ("ui.alloc.form.col_product",       "Товар",                          "Mahsulot",                         "Product",                         "fields"),
    ("ui.alloc.form.col_batch",         "Партия",                         "Partiya",                          "Batch",                           "fields"),
    ("ui.alloc.form.col_expiry",        "Срок годности",                  "Yaroqlilik muddati",               "Expiry date",                     "fields"),
    ("ui.alloc.form.col_days",          "Дней осталось",                  "Qolgan kunlar",                    "Days left",                       "fields"),
    ("ui.alloc.form.col_available",     "Доступно",                       "Mavjud",                           "Available",                       "fields"),
    ("ui.alloc.form.col_qty",           "Количество",                     "Miqdor",                           "Quantity",                        "fields"),
    ("ui.alloc.form.col_weight",        "Вес",                            "Vazn",                             "Weight",                          "fields"),
    ("ui.alloc.form.col_price",         "Цена",                           "Narx",                             "Price",                           "fields"),
    ("ui.alloc.form.col_sum",           "Сумма",                          "Summa",                            "Amount",                          "fields"),
    ("ui.alloc.form.total",             "Итого:",                         "Jami:",                            "Total:",                          "fields"),
    ("ui.alloc.form.add_row_btn",       "+ Добавить товар",               "+ Mahsulot qo'shish",              "+ Add product",                   "buttons"),
    ("ui.alloc.form.remove_btn",        "Удалить",                        "O'chirish",                        "Remove",                          "buttons"),
    ("ui.alloc.form.save_btn",          "Сохранить операции",             "Operatsiyalarni saqlash",          "Save operations",                 "buttons"),
    ("ui.alloc.form.products_loaded",   "Товары успешно подтянуты по дате поставки.", "Mahsulotlar muvaffaqiyatli yuklandi.", "Products loaded successfully by delivery date.", "messages"),
    ("ui.alloc.form.loaded_from",       "Подтянуто из заказов:",          "Buyurtmalardan yuklandi:",         "Pulled from orders:",             "messages"),
    ("ui.alloc.form.ops_created",       "Операции созданы: ",             "Operatsiyalar yaratildi: ",        "Operations created: ",            "messages"),
    ("ui.alloc.form.err_select_wh",     "Выберите склады от и в.",        "Omborlarni tanlang.",              "Please select warehouses from and to.", "messages"),
    ("ui.alloc.form.err_expeditor",     "Выберите экспедитора.",          "Ekspeditorni tanlang.",            "Please select expeditor.",        "messages"),
    ("ui.alloc.form.err_wh_from",       "Выберите склад от.",             "Manba ombori tanlanmagan.",        "Please select source warehouse.", "messages"),
    ("ui.alloc.form.err_date",          "Выберите дату поставки.",        "Yetkazib berish sanasini tanlang.", "Please select delivery date.",  "messages"),
    ("ui.alloc.form.err_no_product",    "Добавьте хотя бы один товар.",   "Kamida bitta mahsulot qo'shing.", "Please add at least one product.", "messages"),
    ("ui.alloc.form.err_pull",          "Ошибка автоподтягивания товаров.", "Mahsulotlarni avtomatik yuklash xatosi.", "Error auto-loading products.", "messages"),
    ("ui.alloc.form.change_date_confirm", "Изменить дату поставки? Текущие позиции будут заменены.", "Sana o'zgartiriladimi? Mavjud pozitsiyalar o'zgartiriladi.", "Change delivery date? Current items will be replaced.", "messages"),
    ("ui.alloc.form.replace_confirm",   "Заменить существующие позиции новыми?", "Mavjud pozitsiyalarni yangilari bilan almashtirasizmi?", "Replace existing items with new ones?", "messages"),
    ("ui.alloc.form.err_save",          "Ошибка сохранения",              "Saqlash xatosi",                  "Save error",                      "messages"),
    ("ui.alloc.form.kg_unit",           " кг",                            " kg",                             " kg",                             "fields"),
    ("ui.alloc.form.days_unit",         " дн.",                           " kun",                            " d.",                             "fields"),
    # ── Warehouse receipt form (Приход на склад) ───────────────────────────
    ("ui.wh_receipt.form.op_name",       "Приход на склад",               "Ombor qabuli",                    "Warehouse receipt",               "fields"),
    ("ui.wh_receipt.form.wh_to_lbl",     "Склад в",                       "Omborgacha",                      "Warehouse to",                    "fields"),
    ("ui.wh_receipt.form.products_lbl",  "Товары",                        "Mahsulotlar",                     "Products",                        "fields"),
    ("ui.wh_receipt.form.col_product",   "Товар",                         "Mahsulot",                        "Product",                         "fields"),
    ("ui.wh_receipt.form.col_expiry",    "Срок годности",                 "Yaroqlilik muddati",              "Expiry date",                     "fields"),
    ("ui.wh_receipt.form.col_qty",       "Количество",                    "Miqdor",                          "Quantity",                        "fields"),
    ("ui.wh_receipt.form.col_price",     "Цена (из справочника)",         "Narx (ma'lumotnomadan)",          "Price (from catalog)",            "fields"),
    ("ui.wh_receipt.form.col_sum",       "Сумма",                         "Summa",                           "Amount",                          "fields"),
    ("ui.wh_receipt.form.col_batch",     "Код партии (авто)",             "Partiya kodi (avto)",             "Batch code (auto)",               "fields"),
    ("ui.wh_receipt.form.total",         "Итого:",                        "Jami:",                           "Total:",                          "fields"),
    ("ui.wh_receipt.form.add_row_btn",   "+ Добавить товар",              "+ Mahsulot qo'shish",             "+ Add product",                   "buttons"),
    ("ui.wh_receipt.form.remove_btn",    "Удалить",                       "O'chirish",                       "Remove",                          "buttons"),
    ("ui.wh_receipt.form.save_btn",      "Сохранить операцию",            "Operatsiyani saqlash",            "Save operation",                  "buttons"),
    ("ui.wh_receipt.form.ops_created",   "Операции созданы: ",            "Operatsiyalar yaratildi: ",       "Operations created: ",            "messages"),
    ("ui.wh_receipt.form.err_wh",        "Выберите склад",                "Ombor tanlang",                   "Please select a warehouse",       "messages"),
    ("ui.wh_receipt.form.err_no_item",   "Добавьте хотя бы один товар",  "Kamida bitta mahsulot qo'shing",  "Add at least one product",        "messages"),
    ("ui.wh_receipt.form.err_fill",      "Заполните все поля для всех товаров", "Barcha maydonlarni to'ldiring", "Fill all fields for all products", "messages"),
    ("ui.wh_receipt.form.saving",        "Сохранение...",                 "Saqlanmoqda...",                  "Saving...",                       "messages"),
    ("ui.wh_receipt.form.err_save",      "Ошибка сохранения",             "Saqlash xatosi",                  "Save error",                      "messages"),
    ("ui.wh_receipt.form.sum_unit",      " сум",                          " so'm",                           "",                                "fields"),
]

def get_conn():
    # Support both standard DSN and psycopg2 style
    url = DATABASE_URL
    if url.startswith("postgresql+psycopg2://"):
        url = url.replace("postgresql+psycopg2://", "postgresql://", 1)
    return psycopg2.connect(url)

def main():
    conn = get_conn()
    try:
        cur = conn.cursor()
        inserted = 0
        skipped = 0
        for key, ru, uz, en, category in TRANSLATIONS:
            for lang, text in [("ru", ru), ("uz", uz), ("en", en)]:
                # Check if already exists
                cur.execute(
                    'SELECT id FROM "Sales".translations WHERE translation_key=%s AND language_code=%s',
                    (key, lang)
                )
                if cur.fetchone():
                    skipped += 1
                    continue
                cur.execute(
                    '''INSERT INTO "Sales".translations
                       (id, translation_key, language_code, translation_text, category, created_by)
                       VALUES (%s, %s, %s, %s, %s, %s)''',
                    (str(uuid.uuid4()), key, lang, text, category, "migration_script")
                )
                inserted += 1
        conn.commit()
        print(f"Done. Inserted: {inserted}, Skipped (already exist): {skipped}")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
