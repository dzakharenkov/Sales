"""Normalize remaining RU mojibake values in translations.

Revision ID: 042_fix_remaining_ru_mojibake
Revises: 041_fix_agents_report_i18n
Create Date: 2026-02-22
"""

from alembic import op
import sqlalchemy as sa


revision = "042_fix_remaining_ru_mojibake"
down_revision = "041_fix_agents_report_i18n"
branch_labels = None
depends_on = None


def _looks_broken(text_value: str, key: str) -> bool:
    if text_value is None:
        return True
    value = str(text_value)
    trimmed = value.strip()
    if not trimmed or trimmed == key:
        return True
    if "??" in value:
        return True
    return any(ord(ch) in (208, 209, 65533) for ch in value)


def _decode_mojibake(text_value: str) -> str:
    value = str(text_value)
    return value.encode("latin1").decode("utf-8")


def upgrade() -> None:
    bind = op.get_bind()

    rows = bind.execute(
        sa.text(
            """
            SELECT id, translation_key, translation_text
            FROM "Sales".translations
            WHERE language_code = 'ru'
            """
        )
    ).mappings().all()

    update_stmt = sa.text(
        """
        UPDATE "Sales".translations
           SET translation_text = :text_value,
               updated_by = 'migration_042',
               updated_at = NOW()
         WHERE id = :id
        """
    )

    for row in rows:
        key = str(row["translation_key"])
        text_value = str(row["translation_text"])
        if not _looks_broken(text_value, key):
            continue
        try:
            decoded = _decode_mojibake(text_value)
        except Exception:
            continue
        if decoded and decoded != text_value:
            bind.execute(update_stmt, {"id": row["id"], "text_value": decoded})

    bind.execute(
        sa.text(
            """
            UPDATE "Sales".translations
               SET translation_text = x.translation_text,
                   updated_by = 'migration_042',
                   updated_at = NOW()
              FROM (
                VALUES
                  ('field.order_date', 'Дата заказа'),
                  ('field.order_delivery_date', 'Дата поставки заказа'),
                  ('field.orders_count', 'Количество заказов'),
                  ('field.product', 'Товар'),
                  ('field.quantity', 'Количество'),
                  ('field.amount', 'Сумма'),
                  ('field.created_at', 'Дата создания'),
                  ('field.customers_count', 'Количество клиентов'),
                  ('field.delivery_date_from', 'Дата поставки с'),
                  ('field.delivery_date_to', 'Дата поставки по'),
                  ('field.updated_by', 'Кто изменил')
              ) AS x(translation_key, translation_text)
             WHERE "Sales".translations.translation_key = x.translation_key
               AND "Sales".translations.language_code = 'ru'
            """
        )
    )


def downgrade() -> None:
    return None
