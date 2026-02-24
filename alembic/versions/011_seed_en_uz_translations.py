"""seed en/uz translations

Revision ID: 011_seed_en_uz_translations
Revises: 010_add_translations_module
Create Date: 2026-02-20 23:55:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "011_seed_en_uz_translations"
down_revision: Union[str, Sequence[str], None] = "010_add_translations_module"
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
          'migration_011'
        FROM (
          VALUES
            ('operation_type.warehouse_receipt', 'en', 'Warehouse Receipt', 'operation_types'),
            ('operation_type.allocation', 'en', 'Allocation to Expeditor', 'operation_types'),
            ('operation_type.transfer', 'en', 'Transfer', 'operation_types'),
            ('operation_type.delivery', 'en', 'Delivery to Customer', 'operation_types'),
            ('operation_type.return_from_customer', 'en', 'Return from Customer', 'operation_types'),
            ('operation_type.promotional_sample', 'en', 'Promotional Sample', 'operation_types'),
            ('operation_type.cash_receipt', 'en', 'Cash Receipt', 'operation_types'),
            ('operation_type.cash_return', 'en', 'Cash Return', 'operation_types'),
            ('operation_type.write_off', 'en', 'Write-off', 'operation_types'),
            ('operation_type.damage', 'en', 'Damaged Goods', 'operation_types'),
            ('operation_type.inventory', 'en', 'Inventory', 'operation_types'),
            ('status.open', 'en', 'Open', 'statuses'),
            ('status.delivery', 'en', 'Delivery', 'statuses'),
            ('status.completed', 'en', 'Completed', 'statuses'),
            ('status.canceled', 'en', 'Canceled', 'statuses'),
            ('payment_type.cash_sum', 'en', 'Cash (UZS)', 'payment_types'),
            ('payment_type.bank_sum', 'en', 'Bank Transfer (UZS)', 'payment_types'),
            ('payment_type.card_sum', 'en', 'Card (UZS)', 'payment_types'),
            ('menu.users', 'en', 'Users', 'menu'),
            ('menu.references', 'en', 'References', 'menu'),
            ('menu.customers', 'en', 'Customers', 'menu'),
            ('menu.visits', 'en', 'Visits', 'menu'),
            ('menu.orders', 'en', 'Orders', 'menu'),
            ('menu.operations', 'en', 'Operations', 'menu'),
            ('menu.balances', 'en', 'Balances', 'menu'),
            ('menu.cashier', 'en', 'Cashier', 'menu'),
            ('menu.reports', 'en', 'Reports', 'menu'),
            ('menu.ref_payment', 'en', 'Payment Types', 'menu'),
            ('menu.ref_products', 'en', 'Product Types', 'menu'),
            ('menu.ref_operations', 'en', 'Operation Types', 'menu'),
            ('menu.ref_currency', 'en', 'Currencies', 'menu'),
            ('menu.warehouses', 'en', 'Warehouses', 'menu'),
            ('menu.products', 'en', 'Products', 'menu'),
            ('menu.ref_cities', 'en', 'Cities', 'menu'),
            ('menu.ref_territories', 'en', 'Territories', 'menu'),
            ('operation_type.warehouse_receipt', 'uz', 'Omborga kirim', 'operation_types'),
            ('operation_type.allocation', 'uz', 'Ekspeditorga berish', 'operation_types'),
            ('operation_type.transfer', 'uz', 'Ko''chirish', 'operation_types'),
            ('operation_type.delivery', 'uz', 'Mijozga yetkazib berish', 'operation_types'),
            ('operation_type.return_from_customer', 'uz', 'Mijozdan qaytarish', 'operation_types'),
            ('operation_type.promotional_sample', 'uz', 'Namunaviy tarqatish', 'operation_types'),
            ('operation_type.cash_receipt', 'uz', 'Naqd pul qabul qilish', 'operation_types'),
            ('operation_type.cash_return', 'uz', 'Pulni qaytarish', 'operation_types'),
            ('operation_type.write_off', 'uz', 'Hisobdan chiqarish', 'operation_types'),
            ('operation_type.damage', 'uz', 'Shikastlangan mahsulot', 'operation_types'),
            ('operation_type.inventory', 'uz', 'Inventarizatsiya', 'operation_types'),
            ('status.open', 'uz', 'Ochiq', 'statuses'),
            ('status.delivery', 'uz', 'Yetkazib berish', 'statuses'),
            ('status.completed', 'uz', 'Yakunlandi', 'statuses'),
            ('status.canceled', 'uz', 'Bekor qilindi', 'statuses'),
            ('payment_type.cash_sum', 'uz', 'Naqd pul (so''m)', 'payment_types'),
            ('payment_type.bank_sum', 'uz', 'Bank o''tkazmasi (so''m)', 'payment_types'),
            ('payment_type.card_sum', 'uz', 'Karta (so''m)', 'payment_types'),
            ('menu.users', 'uz', 'Foydalanuvchilar', 'menu'),
            ('menu.references', 'uz', 'Spravochniklar', 'menu'),
            ('menu.customers', 'uz', 'Mijozlar', 'menu'),
            ('menu.visits', 'uz', 'Tashriflar', 'menu'),
            ('menu.orders', 'uz', 'Buyurtmalar', 'menu'),
            ('menu.operations', 'uz', 'Operatsiyalar', 'menu'),
            ('menu.balances', 'uz', 'Qoldiqlar', 'menu'),
            ('menu.cashier', 'uz', 'Kassa', 'menu'),
            ('menu.reports', 'uz', 'Hisobotlar', 'menu'),
            ('menu.ref_payment', 'uz', 'To''lov turlari', 'menu'),
            ('menu.ref_products', 'uz', 'Mahsulot turlari', 'menu'),
            ('menu.ref_operations', 'uz', 'Operatsiya turlari', 'menu'),
            ('menu.ref_currency', 'uz', 'Valyutalar', 'menu'),
            ('menu.warehouses', 'uz', 'Omborlar', 'menu'),
            ('menu.products', 'uz', 'Mahsulotlar', 'menu'),
            ('menu.ref_cities', 'uz', 'Shaharlar', 'menu'),
            ('menu.ref_territories', 'uz', 'Hududlar', 'menu')
        ) AS x(translation_key, language_code, translation_text, category)
        ON CONFLICT (translation_key, language_code) DO UPDATE
        SET
          translation_text = EXCLUDED.translation_text,
          category = EXCLUDED.category,
          updated_at = now(),
          updated_by = 'migration_011'
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM "Sales".translations
        WHERE created_by = 'migration_011'
           OR updated_by = 'migration_011'
        """
    )
