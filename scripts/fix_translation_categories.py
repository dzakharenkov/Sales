"""
Обновляет category='telegram' для всех переводов с ключом telegram.*,
у которых category пустая или NULL.
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import select, update
from src.database.connection import async_session
from src.database.models import Translation


async def fix_categories():
    async with async_session() as session:
        # Выбираем все telegram.* записи без категории
        stmt = select(Translation).where(
            Translation.translation_key.like("telegram.%"),
            (Translation.category == None) | (Translation.category == "")
        )
        result = await session.execute(stmt)
        rows = result.scalars().all()

        if not rows:
            print("Нет записей без категории — всё уже заполнено.")
            return

        for row in rows:
            row.category = "telegram"

        await session.commit()
        print(f"Обновлено записей: {len(rows)}")


if __name__ == "__main__":
    asyncio.run(fix_categories())
