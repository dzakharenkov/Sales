"""Fix agents report i18n labels and mojibake values.

Revision ID: 041_fix_agents_report_i18n
Revises: 040_orders_i18n_keys
Create Date: 2026-02-21
"""

from alembic import op
import sqlalchemy as sa
from uuid import uuid4


revision = "041_fix_agents_report_i18n"
down_revision = "040_orders_i18n_keys"
branch_labels = None
depends_on = None


ROWS = [
    ("ui.report.agents.title", "ru", "Отчёт: Эффективность агентов", "messages"),
    ("ui.report.agents.title", "uz", "Hisobot: Agentlar samaradorligi", "messages"),
    ("ui.report.agents.title", "en", "Report: Agent performance", "messages"),
    ("ui.common.export_excel", "ru", "Выгрузить в Excel", "buttons"),
    ("ui.common.export_excel", "uz", "Excelga eksport", "buttons"),
    ("ui.common.export_excel", "en", "Export to Excel", "buttons"),
    ("field.to", "ru", "по", "fields"),
    ("field.to", "uz", "gacha", "fields"),
    ("field.to", "en", "to", "fields"),
    ("field.login", "ru", "Логин", "fields"),
    ("field.login", "uz", "Login", "fields"),
    ("field.login", "en", "Login", "fields"),
    ("field.fio", "ru", "ФИО", "fields"),
    ("field.fio", "uz", "F.I.Sh.", "fields"),
    ("field.fio", "en", "Full name", "fields"),
    ("ui.report.agents.col.customers", "ru", "Клиентов", "messages"),
    ("ui.report.agents.col.customers", "uz", "Mijozlar", "messages"),
    ("ui.report.agents.col.customers", "en", "Customers", "messages"),
    ("ui.report.agents.col.visits", "ru", "Визитов", "messages"),
    ("ui.report.agents.col.visits", "uz", "Tashriflar", "messages"),
    ("ui.report.agents.col.visits", "en", "Visits", "messages"),
    ("ui.report.agents.col.completed", "ru", "Завершено", "messages"),
    ("ui.report.agents.col.completed", "uz", "Yakunlangan", "messages"),
    ("ui.report.agents.col.completed", "en", "Completed", "messages"),
    ("ui.report.agents.col.visit_completion_pct", "ru", "% завершённости визитов", "messages"),
    ("ui.report.agents.col.visit_completion_pct", "uz", "Tashriflar yakunlanish %", "messages"),
    ("ui.report.agents.col.visit_completion_pct", "en", "Visit completion %", "messages"),
    ("ui.report.agents.col.order_amount", "ru", "Сумма заказов", "messages"),
    ("ui.report.agents.col.order_amount", "uz", "Buyurtmalar summasi", "messages"),
    ("ui.report.agents.col.order_amount", "en", "Order amount", "messages"),
    ("ui.report.agents.col.orders_count", "ru", "Кол-во заказов", "messages"),
    ("ui.report.agents.col.orders_count", "uz", "Buyurtmalar soni", "messages"),
    ("ui.report.agents.col.orders_count", "en", "Orders count", "messages"),
    ("ui.report.agents.col.order_completion_pct", "ru", "% завершённости заказов", "messages"),
    ("ui.report.agents.col.order_completion_pct", "uz", "Buyurtmalar yakunlanish %", "messages"),
    ("ui.report.agents.col.order_completion_pct", "en", "Order completion %", "messages"),
    ("ui.report.agents.total_agents", "ru", "Итого агентов", "messages"),
    ("ui.report.agents.total_agents", "uz", "Jami agentlar", "messages"),
    ("ui.report.agents.total_agents", "en", "Total agents", "messages"),
]


def upgrade() -> None:
    bind = op.get_bind()
    stmt = sa.text(
        """
        INSERT INTO "Sales".translations (id, translation_key, language_code, translation_text, category, created_by, updated_by)
        VALUES (:id, :k, :l, :t, :c, 'migration_041', 'migration_041')
        ON CONFLICT (translation_key, language_code)
        DO UPDATE SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_by = 'migration_041',
          updated_at = NOW()
        """
    )
    for key, lang, text_value, category in ROWS:
        bind.execute(stmt, {"id": str(uuid4()), "k": key, "l": lang, "t": text_value, "c": category})


def downgrade() -> None:
    bind = op.get_bind()
    stmt = sa.text('DELETE FROM "Sales".translations WHERE translation_key = :k')
    keys = sorted({row[0] for row in ROWS})
    for key in keys:
        bind.execute(stmt, {"k": key})
