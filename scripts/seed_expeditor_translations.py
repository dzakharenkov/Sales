import asyncio
from sqlalchemy import select
from src.database.connection import async_session
from src.database.models import Translation

async def main():
    keys_to_add = [
        # cb_exp_orders_list_today
        ("telegram.expeditor.completed_today", "Выполненные заказы сегодня", "Completed orders today", "Bugun yakunlangan buyurtmalar"),
        ("telegram.expeditor.my_orders_today", "Мои заказы на сегодня", "My orders today", "Bugungi buyurtmalarim"),
        ("telegram.expeditor.no_orders", "Нет заказов.", "No orders.", "Buyurtmalar yo'q."),
        ("telegram.expeditor.all_done", "Все заказы завершены!", "All orders completed!", "Barcha buyurtmalar yakunlandi!"),
        
        # cb_exp_payment
        ("telegram.expeditor.receive_payment", "Получить оплату", "Receive payment", "To'lovni qabul qilish"),
        ("telegram.expeditor.no_orders_for_payment", "Нет заказов, ожидающих оплаты (без уже оплаченных).", "No orders pending payment.", "To'lov kutilayotgan buyurtmalar yo'q."),
        ("telegram.expeditor.orders_for_payment", "Заказы для получения оплаты", "Orders for receiving payment", "To'lovni qabul qilish uchun buyurtmalar"),
        
        # cb_exp_my_stock
        ("telegram.expeditor.my_stock", "Мои остатки", "My stock", "Mening qoldiqlarim"),
        ("telegram.expeditor.no_warehouse", "За вами не закреплён склад.", "No warehouse assigned to you.", "Sizga ombor biriktirilmagan."),
        ("telegram.expeditor.warehouse", "Склад", "Warehouse", "Ombor"),
        ("telegram.expeditor.no_stock", "Остатков нет.", "No stock.", "Qoldiqlar yo'q."),
        ("telegram.expeditor.pcs", "шт", "pcs", "dona"),
        ("telegram.expeditor.expiry", "срок", "expiry", "muddat"),
        ("telegram.expeditor.and_more", "и ещё", "and", "va yana"),
        ("telegram.expeditor.pos", "поз.", "more items", "ta poz."),
        ("telegram.expeditor.total_qty", "Итого", "Total", "Jami"),
        ("telegram.expeditor.total_sum", "Сумма", "Total sum", "Summa"),
        
        # cb_exp_received_payments
        ("telegram.expeditor.rcv_payment_title", "Полученная оплата", "Received payment", "Qabul qilingan to'lov"),
        ("telegram.expeditor.no_operations", "Нет операций получения оплаты от клиентов.", "No payments received from customers.", "Mijozlardan to'lov qabul qilish operatsiyalari yo'q."),
        ("telegram.expeditor.rcv_payment_title_full", "Полученная оплата от клиентов:", "Payments received from customers:", "Mijozlardan qabul qilingan to'lovlar:"),
        ("telegram.expeditor.order_num", "Заказ №", "Order #", "Buyurtma №"),
        ("telegram.expeditor.status_pending", "Ожидает передачи", "Pending transfer", "O'tkazish kutilmoqda"),
        ("telegram.expeditor.status_completed", "Передано", "Transferred", "O'tkazildi"),
        ("telegram.expeditor.status_cancelled", "Отменено", "Cancelled", "Bekor qilingan"),
    ]

    added_count = 0
    async with async_session() as db:
        for code, ru, en, uz in keys_to_add:
            for lang, text in [("ru", ru), ("en", en), ("uz", uz)]:
                stmt = select(Translation).where(
                    Translation.translation_key == code,
                    Translation.language_code == lang
                )
                existing = (await db.execute(stmt)).scalars().first()
                if not existing:
                    t = Translation(
                        translation_key=code,
                        language_code=lang,
                        translation_text=text,
                        category="telegram",
                        notes="Expeditor translation"
                    )
                    db.add(t)
                    added_count += 1
        
        await db.commit()

    print(f"Successfully processed {added_count} translation entries for Expeditor!")

if __name__ == "__main__":
    asyncio.run(main())
