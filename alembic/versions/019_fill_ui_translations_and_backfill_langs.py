"""fill ui translations and backfill missing languages

Revision ID: 019_ui_i18n_backfill
Revises: 018_seed_telegram_auth_i18n
Create Date: 2026-02-21 09:30:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op


revision: str = "019_ui_i18n_backfill"
down_revision: Union[str, Sequence[str], None] = "018_seed_telegram_auth_i18n"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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
          'migration_019'
        FROM (
          VALUES
            ('app.menu_title','ru','Меню','menu'),
            ('app.menu_title','uz','Menyu','menu'),
            ('app.menu_title','en','Menu','menu'),
            ('app.user_logged_in_prefix','ru','Вы вошли: ','messages'),
            ('app.user_logged_in_prefix','uz','Siz tizimga kirdingiz: ','messages'),
            ('app.user_logged_in_prefix','en','Logged in: ','messages'),

            ('menu.cash_pending','ru','Ожидающие передачи от экспедиторов','menu'),
            ('menu.cash_pending','uz','Ekspeditordan kutilayotgan topshiruvlar','menu'),
            ('menu.cash_pending','en','Pending handovers','menu'),
            ('menu.cash_received','ru','Принятые деньги за период','menu'),
            ('menu.cash_received','uz','Davr bo''yicha qabul qilingan pul','menu'),
            ('menu.cash_received','en','Received cash','menu'),
            ('menu.cashier_orders','ru','Заказы для подтверждения оплаты','menu'),
            ('menu.cashier_orders','uz','To''lovni tasdiqlash buyurtmalari','menu'),
            ('menu.cashier_orders','en','Orders for payment confirmation','menu'),
            ('menu.report_customers','ru','По клиентам','menu'),
            ('menu.report_customers','uz','Mijozlar bo''yicha','menu'),
            ('menu.report_customers','en','By customers','menu'),
            ('menu.report_agents','ru','По агентам','menu'),
            ('menu.report_agents','uz','Agentlar bo''yicha','menu'),
            ('menu.report_agents','en','By agents','menu'),
            ('menu.report_expeditors','ru','По экспедиторам','menu'),
            ('menu.report_expeditors','uz','Ekspeditorlar bo''yicha','menu'),
            ('menu.report_expeditors','en','By expeditors','menu'),
            ('menu.report_visits','ru','По визитам','menu'),
            ('menu.report_visits','uz','Tashriflar bo''yicha','menu'),
            ('menu.report_visits','en','By visits','menu'),
            ('menu.report_dashboard','ru','Сводная аналитика','menu'),
            ('menu.report_dashboard','uz','Umumiy analitika','menu'),
            ('menu.report_dashboard','en','Dashboard','menu'),
            ('menu.report_photos','ru','Фотографии клиентов','menu'),
            ('menu.report_photos','uz','Mijoz suratlari','menu'),
            ('menu.report_photos','en','Customer photos','menu'),

            ('button.filter','ru','Фильтр','buttons'),
            ('button.filter','uz','Filtr','buttons'),
            ('button.filter','en','Filter','buttons'),

            ('label.actions','ru','Действия','fields'),
            ('label.actions','uz','Amallar','fields'),
            ('label.actions','en','Actions','fields'),
            ('label.code','ru','Код','fields'),
            ('label.code','uz','Kod','fields'),
            ('label.code','en','Code','fields'),
            ('label.name','ru','Название','fields'),
            ('label.name','uz','Nomi','fields'),
            ('label.name','en','Name','fields'),
            ('label.description','ru','Описание','fields'),
            ('label.description','uz','Tavsif','fields'),
            ('label.description','en','Description','fields'),
            ('label.status','ru','Статус','fields'),
            ('label.status','uz','Holat','fields'),
            ('label.status','en','Status','fields'),
            ('label.country','ru','Страна','fields'),
            ('label.country','uz','Mamlakat','fields'),
            ('label.country','en','Country','fields'),
            ('label.symbol','ru','Символ','fields'),
            ('label.symbol','uz','Belgi','fields'),
            ('label.symbol','en','Symbol','fields'),
            ('label.default','ru','По умолчанию','fields'),
            ('label.default','uz','Standart','fields'),
            ('label.default','en','Default','fields'),
            ('label.yes','ru','Да','fields'),
            ('label.yes','uz','Ha','fields'),
            ('label.yes','en','Yes','fields'),
            ('label.no','ru','Нет','fields'),
            ('label.no','uz','Yo''q','fields'),
            ('label.no','en','No','fields'),
            ('label.search','ru','Поиск','fields'),
            ('label.search','uz','Qidiruv','fields'),
            ('label.search','en','Search','fields'),
            ('label.phone','ru','Телефон','fields'),
            ('label.phone','uz','Telefon','fields'),
            ('label.phone','en','Phone','fields'),
            ('label.city','ru','Город','fields'),
            ('label.city','uz','Shahar','fields'),
            ('label.city','en','City','fields'),
            ('label.category','ru','Категория','fields'),
            ('label.category','uz','Kategoriya','fields'),
            ('label.category','en','Category','fields'),
            ('label.date','ru','Дата','fields'),
            ('label.date','uz','Sana','fields'),
            ('label.date','en','Date','fields'),

            ('ui.common.loading','ru','Загрузка...','messages'),
            ('ui.common.loading','uz','Yuklanmoqda...','messages'),
            ('ui.common.loading','en','Loading...','messages'),
            ('ui.common.no_data','ru','Нет данных.','messages'),
            ('ui.common.no_data','uz','Ma''lumot yo''q.','messages'),
            ('ui.common.no_data','en','No data.','messages'),

            ('ui.currency.title','ru','Валюта','fields'),
            ('ui.currency.title','uz','Valyuta','fields'),
            ('ui.currency.title','en','Currency','fields'),
            ('ui.currency.add','ru','Добавить валюту','buttons'),
            ('ui.currency.add','uz','Valyuta qo''shish','buttons'),
            ('ui.currency.add','en','Add currency','buttons'),
            ('ui.currency.none','ru','Нет валют.','messages'),
            ('ui.currency.none','uz','Valyutalar yo''q.','messages'),
            ('ui.currency.none','en','No currencies.','messages'),
            ('ui.currency.col.code','ru','Код','fields'),
            ('ui.currency.col.code','uz','Kod','fields'),
            ('ui.currency.col.code','en','Code','fields'),
            ('ui.currency.col.name','ru','Название','fields'),
            ('ui.currency.col.name','uz','Nomi','fields'),
            ('ui.currency.col.name','en','Name','fields'),
            ('ui.currency.col.country','ru','Страна','fields'),
            ('ui.currency.col.country','uz','Mamlakat','fields'),
            ('ui.currency.col.country','en','Country','fields'),
            ('ui.currency.col.symbol','ru','Символ','fields'),
            ('ui.currency.col.symbol','uz','Belgi','fields'),
            ('ui.currency.col.symbol','en','Symbol','fields'),
            ('ui.currency.col.default','ru','По умолчанию','fields'),
            ('ui.currency.col.default','uz','Standart','fields'),
            ('ui.currency.col.default','en','Default','fields'),
            ('ui.currency.col.actions','ru','Действия','fields'),
            ('ui.currency.col.actions','uz','Amallar','fields'),
            ('ui.currency.col.actions','en','Actions','fields'),

            ('ui.customers.title','ru','Клиенты','fields'),
            ('ui.customers.title','uz','Mijozlar','fields'),
            ('ui.customers.title','en','Customers','fields'),
            ('ui.customers.add','ru','Добавить клиента','buttons'),
            ('ui.customers.add','uz','Mijoz qo''shish','buttons'),
            ('ui.customers.add','en','Add customer','buttons'),
            ('ui.customers.export','ru','Скачать в Excel всех клиентов','buttons'),
            ('ui.customers.export','uz','Barcha mijozlarni Excelga yuklab olish','buttons'),
            ('ui.customers.export','en','Export all customers to Excel','buttons'),
            ('ui.customers.search','ru','Поиск','fields'),
            ('ui.customers.search','uz','Qidiruv','fields'),
            ('ui.customers.search','en','Search','fields'),
            ('ui.customers.find','ru','Найти','buttons'),
            ('ui.customers.find','uz','Topish','buttons'),
            ('ui.customers.find','en','Find','buttons'),
            ('ui.customers.none','ru','Нет клиентов.','messages'),
            ('ui.customers.none','uz','Mijozlar yo''q.','messages'),
            ('ui.customers.none','en','No customers.','messages'),

            ('ui.dashboard.title','ru','Сводная аналитика','fields'),
            ('ui.dashboard.title','uz','Umumiy analitika','fields'),
            ('ui.dashboard.title','en','Dashboard','fields'),
            ('ui.dashboard.date_from','ru','Дата поставки заказа с','fields'),
            ('ui.dashboard.date_from','uz','Buyurtma yetkazish sanasi (dan)','fields'),
            ('ui.dashboard.date_from','en','Delivery date from','fields'),
            ('ui.dashboard.date_to','ru','Дата поставки заказа по','fields'),
            ('ui.dashboard.date_to','uz','Buyurtma yetkazish sanasi (gacha)','fields'),
            ('ui.dashboard.date_to','en','Delivery date to','fields'),
            ('ui.dashboard.statuses','ru','Статусы','fields'),
            ('ui.dashboard.statuses','uz','Holatlar','fields'),
            ('ui.dashboard.statuses','en','Statuses','fields'),
            ('ui.dashboard.category','ru','Категория','fields'),
            ('ui.dashboard.category','uz','Kategoriya','fields'),
            ('ui.dashboard.category','en','Category','fields'),
            ('ui.dashboard.apply','ru','Применить','buttons'),
            ('ui.dashboard.apply','uz','Qo''llash','buttons'),
            ('ui.dashboard.apply','en','Apply','buttons'),
            ('ui.dashboard.loading','ru','Загрузка...','messages'),
            ('ui.dashboard.loading','uz','Yuklanmoqda...','messages'),
            ('ui.dashboard.loading','en','Loading...','messages'),
            ('ui.dashboard.by_category','ru','По категориям продуктов','fields'),
            ('ui.dashboard.by_category','uz','Mahsulot kategoriyalari bo''yicha','fields'),
            ('ui.dashboard.by_category','en','By product categories','fields'),
            ('ui.dashboard.by_territory','ru','По территориям','fields'),
            ('ui.dashboard.by_territory','uz','Hududlar bo''yicha','fields'),
            ('ui.dashboard.by_territory','en','By territories','fields'),
            ('ui.dashboard.export','ru','Экспорт в Excel','buttons'),
            ('ui.dashboard.export','uz','Excelga eksport','buttons'),
            ('ui.dashboard.export','en','Export to Excel','buttons')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_019';
        """
    )

    op.execute(
        """
        WITH keys AS (
          SELECT DISTINCT translation_key FROM "Sales".translations
        ), langs AS (
          SELECT v.lang::text AS language_code
          FROM (VALUES ('ru'), ('uz'), ('en')) AS v(lang)
        ), base AS (
          SELECT
            t.translation_key,
            max(t.category) FILTER (WHERE t.category IS NOT NULL) AS category,
            max(t.translation_text) FILTER (WHERE t.language_code = 'ru') AS ru_text,
            max(t.translation_text) FILTER (WHERE t.language_code = 'uz') AS uz_text,
            max(t.translation_text) FILTER (WHERE t.language_code = 'en') AS en_text
          FROM "Sales".translations t
          GROUP BY t.translation_key
        )
        INSERT INTO "Sales".translations
          (id, translation_key, language_code, translation_text, category, created_by)
        SELECT
          md5(random()::text || clock_timestamp()::text)::uuid,
          k.translation_key,
          l.language_code,
          COALESCE(b.ru_text, b.en_text, b.uz_text, k.translation_key),
          b.category,
          'migration_019'
        FROM keys k
        CROSS JOIN langs l
        JOIN base b ON b.translation_key = k.translation_key
        LEFT JOIN "Sales".translations t
          ON t.translation_key = k.translation_key
         AND t.language_code = l.language_code
        WHERE t.id IS NULL;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE created_by = 'migration_019';
        """
    )
