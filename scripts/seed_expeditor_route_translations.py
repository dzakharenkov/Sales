import asyncio
import sys
import os

# Добавляем корневую директорию проекта в sys.path для импорта модулей
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.connection import async_session
from src.database.models import Translation

KEYS = {
    "telegram.button.today": {
        "ru": "Сегодня",
        "en": "Today",
        "uz": "Bugun"
    },
    "telegram.button.tomorrow": {
        "ru": "Завтра",
        "en": "Tomorrow",
        "uz": "Ertaga"
    },
    "telegram.button.pick_date": {
        "ru": "Выбрать дату",
        "en": "Pick date",
        "uz": "Sanani tanlash"
    },
    "telegram.expeditor.route_title": {
        "ru": "Мой маршрут",
        "en": "My Route",
        "uz": "Mening yo'nalishim"
    },
    "telegram.expeditor.choose_date": {
        "ru": "Выберите дату:",
        "en": "Choose a date:",
        "uz": "Sanani tanlang:"
    },
    "telegram.expeditor.route_for": {
        "ru": "Маршрут на",
        "en": "Route for",
        "uz": "Yo'nalish sanasi"
    },
    "telegram.expeditor.no_orders": {
        "ru": "Нет заказов.",
        "en": "No orders.",
        "uz": "Buyurtmalar yo'q."
    },
    "telegram.expeditor.orders_count": {
        "ru": "заказов",
        "en": "orders",
        "uz": "buyurtma"
    },
    "telegram.expeditor.no_coords_route": {
        "ru": "❌ Нет координат клиентов для построения маршрута.\nУбедитесь, что у клиентов заполнены координаты.",
        "en": "❌ No customer coordinates for routing.\nMake sure customers have coordinates filled.",
        "uz": "❌ Yo'nalish yaratish uchun mijoz koordinatalari yo'q.\nMijozlarda koordinatalar to'ldirilganligini tekshiring."
    },
    "telegram.expeditor.points_count": {
        "ru": "Точек",
        "en": "Points",
        "uz": "Nuqtalar"
    },
    "telegram.expeditor.route_built_all": {
        "ru": "Маршрут построен через все точки по порядку списка.",
        "en": "Route built through all points according to the list order.",
        "uz": "Yo'nalish ro'yxat tartibida barcha nuqtalar bo'ylab qurildi."
    },
    "telegram.expeditor.open_map": {
        "ru": "📍 Открыть в Яндекс.Картах",
        "en": "📍 Open in Yandex.Maps",
        "uz": "📍 Yandex.Xaritalarda ochish"
    },
    "telegram.expeditor.order_title": {
        "ru": "Заказ №",
        "en": "Order #",
        "uz": "Buyurtma №"
    },
    "telegram.expeditor.client": {
        "ru": "Клиент:",
        "en": "Client:",
        "uz": "Mijoz:"
    },
    "telegram.expeditor.phone": {
        "ru": "Телефон:",
        "en": "Phone:",
        "uz": "Telefon:"
    },
    "telegram.expeditor.address": {
        "ru": "Адрес:",
        "en": "Address:",
        "uz": "Manzil:"
    },
    "telegram.expeditor.status": {
        "ru": "Статус:",
        "en": "Status:",
        "uz": "Holati:"
    },
    "telegram.expeditor.goods": {
        "ru": "Товары:",
        "en": "Goods:",
        "uz": "Tovarlar:"
    },
    "telegram.expeditor.total": {
        "ru": "Итого:",
        "en": "Total:",
        "uz": "Jami:"
    },
    "telegram.expeditor.payment": {
        "ru": "Оплата:",
        "en": "Payment:",
        "uz": "To'lov:"
    },
    "telegram.agent.coordinates": {
        "ru": "📍 Координаты:",
        "en": "📍 Coordinates:",
        "uz": "📍 Koordinatalari:"
    },
    "telegram.expeditor.deliver_order": {
        "ru": "🚚 Доставить заказ",
        "en": "🚚 Deliver order",
        "uz": "🚚 Buyurtmani yetkazish"
    },
    "telegram.expeditor.delivered": {
        "ru": "✅ Доставлен",
        "en": "✅ Delivered",
        "uz": "✅ Yetkazib berildi"
    },
    "telegram.expeditor.payment_recorded": {
        "ru": "✅ Оплата зафиксирована по заказу №",
        "en": "✅ Payment recorded for order #",
        "uz": "✅ To'lov qabul qilindi buyurtma №"
    },
    "telegram.expeditor.sum": {
        "ru": "Сумма",
        "en": "Sum",
        "uz": "Summa"
    },
    "telegram.expeditor.status_not_changed": {
        "ru": "Статус заказа не изменён.",
        "en": "Order status has not changed.",
        "uz": "Buyurtma holati o'zgartirilmadi."
    }
}

async def seed_translations():
    print(f"Adding {len(KEYS)} route/payment translation keys for Expeditor Bot...")
    added_count = 0
    updated_count = 0
    async with async_session() as session:
        for key, trans in KEYS.items():
            for lang, text_val in trans.items():
                if not text_val:
                    continue
                
                stmt = select(Translation).where(
                    Translation.translation_key == key,
                    Translation.language_code == lang
                )
                existing = (await session.execute(stmt)).scalars().first()
                if not existing:
                    t = Translation(
                        translation_key=key,
                        language_code=lang,
                        translation_text=text_val,
                        category="telegram",
                        notes="Expeditor Route mapping"
                    )
                    session.add(t)
                    added_count += 1
                elif existing.translation_text != text_val:
                    existing.translation_text = text_val
                    updated_count += 1
        
        await session.commit()
    print(f"Done seeding new keys! Added: {added_count}, Updated: {updated_count}")


if __name__ == "__main__":
    asyncio.run(seed_translations())
