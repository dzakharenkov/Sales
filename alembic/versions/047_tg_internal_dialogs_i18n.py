"""add missing telegram internal dialog i18n keys

Revision ID: 047_tg_internal_dialogs_i18n
Revises: 046_cash_received_columns_i18n
Create Date: 2026-03-11
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op


revision: str = "047_tg_internal_dialogs_i18n"
down_revision: Union[str, Sequence[str], None] = "046_cash_received_columns_i18n"
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
          'migration_047'
        FROM (
          VALUES
            ('telegram.agent.order_search_prompt', 'ru', '🛒 *Создать заказ*\n\nВведите название клиента или ИНН для поиска:', 'telegram'),
            ('telegram.agent.order_search_prompt', 'uz', '🛒 *Buyurtma yaratish*\n\nQidirish uchun mijoz nomi yoki STIRni kiriting:', 'telegram'),
            ('telegram.agent.order_search_prompt', 'en', '🛒 *Create order*\n\nEnter customer name or Tax ID to search:', 'telegram'),

            ('telegram.agent.payment_label', 'ru', 'Оплата:', 'telegram'),
            ('telegram.agent.payment_label', 'uz', 'To''lov:', 'telegram'),
            ('telegram.agent.payment_label', 'en', 'Payment:', 'telegram'),

            ('telegram.expeditor.payment_full_question', 'ru', '💰 Заказ №{order_no}\nСумма: {amount}\n\nВы получили полную сумму?', 'telegram'),
            ('telegram.expeditor.payment_full_question', 'uz', '💰 Buyurtma №{order_no}\nSumma: {amount}\n\nTo''liq summani oldingizmi?', 'telegram'),
            ('telegram.expeditor.payment_full_question', 'en', '💰 Order #{order_no}\nAmount: {amount}\n\nDid you receive the full amount?', 'telegram'),

            ('telegram.expeditor.full_amount', 'ru', 'Полная сумма', 'telegram'),
            ('telegram.expeditor.full_amount', 'uz', 'To''liq summa', 'telegram'),
            ('telegram.expeditor.full_amount', 'en', 'Full amount', 'telegram'),

            ('telegram.expeditor.payment_recorded', 'ru', '✅ Оплата зафиксирована по заказу №', 'telegram'),
            ('telegram.expeditor.payment_recorded', 'uz', '✅ To''lov buyurtma № bo''yicha qayd etildi ', 'telegram'),
            ('telegram.expeditor.payment_recorded', 'en', '✅ Payment recorded for order #', 'telegram'),

            ('telegram.expeditor.sum', 'ru', 'Сумма', 'telegram'),
            ('telegram.expeditor.sum', 'uz', 'Summa', 'telegram'),
            ('telegram.expeditor.sum', 'en', 'Amount', 'telegram'),

            ('telegram.expeditor.status_not_changed', 'ru', 'Статус заказа не изменён.', 'telegram'),
            ('telegram.expeditor.status_not_changed', 'uz', 'Buyurtma holati o''zgarmadi.', 'telegram'),
            ('telegram.expeditor.status_not_changed', 'en', 'Order status was not changed.', 'telegram'),

            ('telegram.expeditor.payment_already_recorded', 'ru', '⚠️ По заказу №{order_no} оплата уже была зафиксирована ранее.\nПовторное получение оплаты запрещено.', 'telegram'),
            ('telegram.expeditor.payment_already_recorded', 'uz', '⚠️ Buyurtma №{order_no} bo''yicha to''lov avval qayd etilgan.\nTo''lovni qayta qabul qilish taqiqlanadi.', 'telegram'),
            ('telegram.expeditor.payment_already_recorded', 'en', '⚠️ Payment for order #{order_no} was already recorded earlier.\nReceiving payment again is not allowed.', 'telegram'),

            ('telegram.expeditor.enter_received_amount', 'ru', 'Введите полученную сумму по заказу №{order_no}:', 'telegram'),
            ('telegram.expeditor.enter_received_amount', 'uz', 'Buyurtma №{order_no} bo''yicha olingan summani kiriting:', 'telegram'),
            ('telegram.expeditor.enter_received_amount', 'en', 'Enter the amount received for order #{order_no}:', 'telegram'),

            ('telegram.expeditor.enter_positive_number', 'ru', '❌ Введите число > 0:', 'telegram'),
            ('telegram.expeditor.enter_positive_number', 'uz', '❌ 0 dan katta son kiriting:', 'telegram'),
            ('telegram.expeditor.enter_positive_number', 'en', '❌ Enter a number greater than 0:', 'telegram'),

            ('telegram.expeditor.amount_must_be_positive', 'ru', '❌ Сумма должна быть > 0:', 'telegram'),
            ('telegram.expeditor.amount_must_be_positive', 'uz', '❌ Summa 0 dan katta bo''lishi kerak:', 'telegram'),
            ('telegram.expeditor.amount_must_be_positive', 'en', '❌ Amount must be greater than 0:', 'telegram'),

            ('telegram.expeditor.amount_limit_exceeded', 'ru', '❌ Сумма не может превышать {amount}. Введите снова:', 'telegram'),
            ('telegram.expeditor.amount_limit_exceeded', 'uz', '❌ Summa {amount} dan oshmasligi kerak. Qayta kiriting:', 'telegram'),
            ('telegram.expeditor.amount_limit_exceeded', 'en', '❌ Amount cannot exceed {amount}. Enter it again:', 'telegram')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_047'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE translation_key IN (
          'telegram.agent.order_search_prompt',
          'telegram.agent.payment_label',
          'telegram.expeditor.payment_full_question',
          'telegram.expeditor.full_amount',
          'telegram.expeditor.payment_recorded',
          'telegram.expeditor.sum',
          'telegram.expeditor.status_not_changed',
          'telegram.expeditor.payment_already_recorded',
          'telegram.expeditor.enter_received_amount',
          'telegram.expeditor.enter_positive_number',
          'telegram.expeditor.amount_must_be_positive',
          'telegram.expeditor.amount_limit_exceeded'
        )
        """
    )
