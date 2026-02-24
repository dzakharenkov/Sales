"""seed menu child and telegram translation keys

Revision ID: 016_seed_menu_telegram_keys
Revises: 015_sync_numeric_prefixes
Create Date: 2026-02-21 03:10:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

revision: str = "016_seed_menu_telegram_keys"
down_revision: Union[str, Sequence[str], None] = "015_sync_numeric_prefixes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO "Sales".translation_categories
          (id, code, name_ru, name_uz, name_en, description, active)
        VALUES
          (md5(random()::text || clock_timestamp()::text)::uuid, 'telegram', 'Телеграм-бот', 'Telegram bot', 'Telegram bot', 'Telegram bot interface strings', TRUE)
        ON CONFLICT (code) DO UPDATE SET
          name_ru = EXCLUDED.name_ru,
          name_uz = EXCLUDED.name_uz,
          name_en = EXCLUDED.name_en,
          description = EXCLUDED.description,
          active = EXCLUDED.active
        """
    )

    op.execute(
        """
        INSERT INTO "Sales".translations
          (id, translation_key, language_code, translation_text, category, created_by)
        SELECT
          md5(random()::text || clock_timestamp()::text)::uuid,
          x.translation_key,
          x.language_code,
          x.translation_text,
          x.category,
          'migration_016'
        FROM (
          VALUES
            ('menu.customers_search','ru','Поиск клиента','menu'),
            ('menu.customers_search','uz','Mijoz qidirish','menu'),
            ('menu.customers_search','en','Customer Search','menu'),
            ('menu.customers_create','ru','Создать клиента','menu'),
            ('menu.customers_create','uz','Mijoz yaratish','menu'),
            ('menu.customers_create','en','Create Customer','menu'),
            ('menu.customers_map','ru','Клиенты на карте','menu'),
            ('menu.customers_map','uz','Xaritadagi mijozlar','menu'),
            ('menu.customers_map','en','Customers on Map','menu'),
            ('menu.visits_search','ru','Поиск визита','menu'),
            ('menu.visits_search','uz','Tashrif qidirish','menu'),
            ('menu.visits_search','en','Visit Search','menu'),
            ('menu.visits_create','ru','Создать визит','menu'),
            ('menu.visits_create','uz','Tashrif yaratish','menu'),
            ('menu.visits_create','en','Create Visit','menu'),
            ('menu.visits_calendar','ru','Календарь визитов','menu'),
            ('menu.visits_calendar','uz','Tashriflar taqvimi','menu'),
            ('menu.visits_calendar','en','Visits Calendar','menu'),
            ('menu.orders_create','ru','Создать заказ','menu'),
            ('menu.orders_create','uz','Buyurtma yaratish','menu'),
            ('menu.orders_create','en','Create Order','menu'),
            ('menu.order_items','ru','Поиск позиций заказов','menu'),
            ('menu.order_items','uz','Buyurtma pozitsiyalari qidiruvi','menu'),
            ('menu.order_items','en','Order Items Search','menu'),
            ('menu.operations_create','ru','Создать операцию','menu'),
            ('menu.operations_create','uz','Operatsiya yaratish','menu'),
            ('menu.operations_create','en','Create Operation','menu'),

            ('telegram.start.welcome','ru','Добро пожаловать в SDS-бот','telegram'),
            ('telegram.start.welcome','uz','SDS botiga xush kelibsiz','telegram'),
            ('telegram.start.welcome','en','Welcome to SDS bot','telegram'),
            ('telegram.auth.request_phone','ru','Отправьте номер телефона для входа','telegram'),
            ('telegram.auth.request_phone','uz','Kirish uchun telefon raqamingizni yuboring','telegram'),
            ('telegram.auth.request_phone','en','Send your phone number to sign in','telegram'),
            ('telegram.auth.code_sent','ru','Код подтверждения отправлен','telegram'),
            ('telegram.auth.code_sent','uz','Tasdiqlash kodi yuborildi','telegram'),
            ('telegram.auth.code_sent','en','Verification code has been sent','telegram'),
            ('telegram.auth.invalid_code','ru','Неверный код','telegram'),
            ('telegram.auth.invalid_code','uz','Noto''g''ri kod','telegram'),
            ('telegram.auth.invalid_code','en','Invalid code','telegram'),
            ('telegram.menu.main','ru','Главное меню','telegram'),
            ('telegram.menu.main','uz','Asosiy menyu','telegram'),
            ('telegram.menu.main','en','Main menu','telegram'),
            ('telegram.menu.orders','ru','Заказы','telegram'),
            ('telegram.menu.orders','uz','Buyurtmalar','telegram'),
            ('telegram.menu.orders','en','Orders','telegram'),
            ('telegram.menu.customers','ru','Клиенты','telegram'),
            ('telegram.menu.customers','uz','Mijozlar','telegram'),
            ('telegram.menu.customers','en','Customers','telegram'),
            ('telegram.menu.visits','ru','Визиты','telegram'),
            ('telegram.menu.visits','uz','Tashriflar','telegram'),
            ('telegram.menu.visits','en','Visits','telegram'),
            ('telegram.action.back','ru','Назад','telegram'),
            ('telegram.action.back','uz','Orqaga','telegram'),
            ('telegram.action.back','en','Back','telegram'),
            ('telegram.action.cancel','ru','Отмена','telegram'),
            ('telegram.action.cancel','uz','Bekor qilish','telegram'),
            ('telegram.action.cancel','en','Cancel','telegram'),
            ('telegram.error.not_authorized','ru','Нет доступа. Авторизуйтесь заново.','telegram'),
            ('telegram.error.not_authorized','uz','Ruxsat yo''q. Qayta avtorizatsiyadan o''ting.','telegram'),
            ('telegram.error.not_authorized','en','Access denied. Please sign in again.','telegram'),
            ('telegram.error.server','ru','Ошибка сервера. Попробуйте позже.','telegram'),
            ('telegram.error.server','uz','Server xatosi. Keyinroq urinib ko''ring.','telegram'),
            ('telegram.error.server','en','Server error. Please try again later.','telegram')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_016'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE created_by = 'migration_016' OR updated_by = 'migration_016'
        """
    )
    op.execute(
        """
        DELETE FROM "Sales".translation_categories
        WHERE code = 'telegram'
        """
    )
