import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database.connection import async_session
from src.database.models import Translation

# Ключи для перевода: Date Picker и Обновление локации
NEW_TRANSLATIONS = {
    # Date Picker
    "telegram.common.today": {
        "ru": "Сегодня",
        "uz": "Bugun",
        "en": "Today"
    },
    "telegram.common.tomorrow": {
        "ru": "Завтра",
        "uz": "Ertaga",
        "en": "Tomorrow"
    },
    "telegram.common.choose_date_btn": {
        "ru": "Выбрать дату",
        "uz": "Sanani tanlang",
        "en": "Select date"
    },
    
    # Update Location flow
    "telegram.agent.update_location_prompt": {
        "ru": "📍 *Обновить локацию клиента*\n\nВведите ИНН или название клиента для поиска:",
        "uz": "📍 *Mijoz manzilini yangilash*\n\nQidirish uchun INN yoki mijoz nomini kiriting:",
        "en": "📍 *Update customer location*\n\nEnter INN or customer name to search:"
    },
    "telegram.agent.send_location_prompt": {
        "ru": "📍 *Отправьте геолокацию*\n\nНажмите кнопку 📎 → Геолокация для отправки координат",
        "uz": "📍 *Geolokatsiyani yuboring*\n\nKoordinatalarni yuborish uchun 📎 → Geolokatsiya tugmasini bosing",
        "en": "📍 *Send geolocation*\n\nPress the 📎 → Geolocation button to send coordinates"
    },
    "telegram.agent.location_updated_success": {
        "ru": "✅ *Локация обновлена!*\n\n",
        "uz": "✅ *Manzil yangilandi!*\n\n",
        "en": "✅ *Location updated!*\n\n"
    },
    "telegram.agent.coordinates": {
        "ru": "📍 *Координаты:*",
        "uz": "📍 *Koordinatalar:*",
        "en": "📍 *Coordinates:*"
    },
}

async def add_missing_translations():
    print("Iniziating translation injection for Date Picker and Update Location...")
    added_count = 0
    updated_count = 0
    
    async with async_session() as session:
        for key, langs in NEW_TRANSLATIONS.items():
            for lang_code, text in langs.items():
                from sqlalchemy import select
                stmt = select(Translation).where(
                    Translation.language_code == lang_code,
                    Translation.translation_key == key
                )
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()

                if not existing:
                    new_t = Translation(language_code=lang_code, translation_key=key, translation_text=text)
                    session.add(new_t)
                    added_count += 1
                else:
                    if existing.translation_text != text:
                        existing.translation_text = text
                        updated_count += 1
                    
        await session.commit()
    
    print(f"Injection complete! Added: {added_count}, Updated: {updated_count}")

if __name__ == "__main__":
    asyncio.run(add_missing_translations())
