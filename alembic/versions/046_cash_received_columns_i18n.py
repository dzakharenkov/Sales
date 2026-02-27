"""add i18n keys for cash received table columns

Revision ID: 046_cash_received_columns_i18n
Revises: 045_report_submenu_access
Create Date: 2026-02-26
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op


revision: str = "046_cash_received_columns_i18n"
down_revision: Union[str, Sequence[str], None] = "045_report_submenu_access"
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
          'migration_046'
        FROM (
          VALUES
            ('ui.cash.received.col.operation_no', 'ru', '№ операции', 'fields'),
            ('ui.cash.received.col.operation_no', 'uz', 'Operatsiya №', 'fields'),
            ('ui.cash.received.col.operation_no', 'en', 'Operation #', 'fields'),

            ('ui.cash.received.col.order_no', 'ru', '№ заказа', 'fields'),
            ('ui.cash.received.col.order_no', 'uz', 'Buyurtma №', 'fields'),
            ('ui.cash.received.col.order_no', 'en', 'Order #', 'fields'),

            ('ui.cash.received.col.customer', 'ru', 'Клиент', 'fields'),
            ('ui.cash.received.col.customer', 'uz', 'Mijoz', 'fields'),
            ('ui.cash.received.col.customer', 'en', 'Customer', 'fields'),

            ('ui.cash.received.col.tax_id', 'ru', 'ИНН', 'fields'),
            ('ui.cash.received.col.tax_id', 'uz', 'STIR', 'fields'),
            ('ui.cash.received.col.tax_id', 'en', 'Tax ID', 'fields'),

            ('ui.cash.received.col.amount', 'ru', 'Сумма', 'fields'),
            ('ui.cash.received.col.amount', 'uz', 'Summa', 'fields'),
            ('ui.cash.received.col.amount', 'en', 'Amount', 'fields'),

            ('ui.cash.received.col.payment_type', 'ru', 'Тип оплаты', 'fields'),
            ('ui.cash.received.col.payment_type', 'uz', 'To''lov turi', 'fields'),
            ('ui.cash.received.col.payment_type', 'en', 'Payment type', 'fields'),

            ('ui.cash.received.col.cashier', 'ru', 'Кассир', 'fields'),
            ('ui.cash.received.col.cashier', 'uz', 'Kassir', 'fields'),
            ('ui.cash.received.col.cashier', 'en', 'Cashier', 'fields'),

            ('ui.cash.received.col.source', 'ru', 'Источник', 'fields'),
            ('ui.cash.received.col.source', 'uz', 'Manba', 'fields'),
            ('ui.cash.received.col.source', 'en', 'Source', 'fields'),

            ('ui.cash.received.col.date', 'ru', 'Дата', 'fields'),
            ('ui.cash.received.col.date', 'uz', 'Sana', 'fields'),
            ('ui.cash.received.col.date', 'en', 'Date', 'fields')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_046'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE translation_key IN (
          'ui.cash.received.col.operation_no',
          'ui.cash.received.col.order_no',
          'ui.cash.received.col.customer',
          'ui.cash.received.col.tax_id',
          'ui.cash.received.col.amount',
          'ui.cash.received.col.payment_type',
          'ui.cash.received.col.cashier',
          'ui.cash.received.col.source',
          'ui.cash.received.col.date'
        )
        """
    )

