"""Seed missing UI translation keys for forms and table headers

Revision ID: 029_ui_i18n
Revises: 028_customer_i18n
Create Date: 2026-02-22 01:40:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "029_ui_i18n"
down_revision: Union[str, Sequence[str], None] = "028_customer_i18n"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    ("field.customer_required", "ru", "Клиент *", "fields"),
    ("field.customer_required", "uz", "Mijoz *", "fields"),
    ("field.customer_required", "en", "Customer *", "fields"),
    ("field.visit_datetime_required", "ru", "Дата и время визита *", "fields"),
    ("field.visit_datetime_required", "uz", "Tashrif sanasi va vaqti *", "fields"),
    ("field.visit_datetime_required", "en", "Visit date and time *", "fields"),
    ("field.agent_required", "ru", "Агент (ответственный) *", "fields"),
    ("field.agent_required", "uz", "Agent (mas'ul) *", "fields"),
    ("field.agent_required", "en", "Agent (responsible) *", "fields"),
    ("field.status_required", "ru", "Статус *", "fields"),
    ("field.status_required", "uz", "Holat *", "fields"),
    ("field.status_required", "en", "Status *", "fields"),
    ("field.date", "ru", "Дата", "fields"),
    ("field.date", "uz", "Sana", "fields"),
    ("field.date", "en", "Date", "fields"),
    ("field.time", "ru", "Время", "fields"),
    ("field.time", "uz", "Vaqt", "fields"),
    ("field.time", "en", "Time", "fields"),
    ("ui.cities.add", "ru", "Добавить город", "messages"),
    ("ui.cities.add", "uz", "Shahar qo'shish", "messages"),
    ("ui.cities.add", "en", "Add city", "messages"),
    ("ui.territories.add", "ru", "Добавить территорию", "messages"),
    ("ui.territories.add", "uz", "Hudud qo'shish", "messages"),
    ("ui.territories.add", "en", "Add territory", "messages"),
]


def upgrade() -> None:
    conn = op.get_bind()
    for key, lang, text, category in ROWS:
        conn.execute(
            sa.text(
                """
                INSERT INTO "Sales".translations
                    (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
                VALUES
                    (gen_random_uuid(), :key, :lang, :text, :category, 'migration_029', 'migration_029', now(), now())
                ON CONFLICT (translation_key, language_code)
                DO UPDATE SET
                    translation_text = EXCLUDED.translation_text,
                    category = COALESCE(EXCLUDED.category, "Sales".translations.category),
                    updated_by = 'migration_029',
                    updated_at = now()
                """
            ),
            {"key": key, "lang": lang, "text": text, "category": category},
        )


def downgrade() -> None:
    pass
