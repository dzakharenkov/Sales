"""Fix broken RU translations and add missing UI keys

Revision ID: 023_fix_ru_and_complete_ui_keys
Revises: 022_fix_header_ru_buttons
Create Date: 2026-02-21 17:00:00
"""

from __future__ import annotations

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "023_fix_ru_and_complete_ui_keys"
down_revision: Union[str, Sequence[str], None] = "022_fix_header_ru_buttons"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROWS = [
    [
        "button.reset",
        "ru",
        "????????",
        "ui"
    ],
    [
        "button.show",
        "ru",
        "????????",
        "ui"
    ],
    [
        "field.account_no",
        "ru",
        "?/?",
        "ui"
    ],
    [
        "field.active_fem",
        "ru",
        "???????",
        "ui"
    ],
    [
        "field.agent_required",
        "ru",
        "????? (?????????????) *",
        "ui"
    ],
    [
        "field.amount",
        "ru",
        "?????",
        "ui"
    ],
    [
        "field.comment",
        "ru",
        "???????????",
        "ui"
    ],
    [
        "field.contact_person",
        "ru",
        "?????????? ????",
        "ui"
    ],
    [
        "field.created_at",
        "ru",
        "???? ????????",
        "ui"
    ],
    [
        "field.customer_required",
        "ru",
        "?????? *",
        "ui"
    ],
    [
        "field.customers_count",
        "ru",
        "?????????? ????????",
        "ui"
    ],
    [
        "field.date_from",
        "ru",
        "???? ??",
        "ui"
    ],
    [
        "field.date_time",
        "ru",
        "???? ? ?????",
        "ui"
    ],
    [
        "field.delivery_date_from",
        "ru",
        "???? ???????? ?",
        "ui"
    ],
    [
        "field.delivery_date_to",
        "ru",
        "???? ???????? ??",
        "ui"
    ],
    [
        "field.expeditor_login",
        "ru",
        "?????????? (login)",
        "ui"
    ],
    [
        "field.expiry",
        "ru",
        "????",
        "ui"
    ],
    [
        "field.last_update",
        "ru",
        "????????? ?????????",
        "ui"
    ],
    [
        "field.operation_type_required",
        "ru",
        "??? ???????? *",
        "ui"
    ],
    [
        "field.order_date",
        "ru",
        "???? ??????",
        "ui"
    ],
    [
        "field.order_delivery_date",
        "ru",
        "???? ???????? ??????",
        "ui"
    ],
    [
        "field.orders_count",
        "ru",
        "?????????? ???????",
        "ui"
    ],
    [
        "field.payment_confirmed",
        "ru",
        "?????? ????????????",
        "ui"
    ],
    [
        "field.payment_type",
        "ru",
        "??? ??????",
        "ui"
    ],
    [
        "field.product",
        "ru",
        "?????",
        "ui"
    ],
    [
        "field.quantity",
        "ru",
        "??????????",
        "ui"
    ],
    [
        "field.responsible",
        "ru",
        "?????????????",
        "ui"
    ],
    [
        "field.status_required",
        "ru",
        "?????? *",
        "ui"
    ],
    [
        "field.storekeeper",
        "ru",
        "?????????",
        "ui"
    ],
    [
        "field.tax_id",
        "ru",
        "???",
        "ui"
    ],
    [
        "field.to",
        "ru",
        "??",
        "ui"
    ],
    [
        "field.unit",
        "ru",
        "??.",
        "ui"
    ],
    [
        "field.updated_by",
        "ru",
        "??? ???????",
        "ui"
    ],
    [
        "field.visit_datetime_required",
        "ru",
        "???? ? ????? ?????? *",
        "ui"
    ],
    [
        "field.weight",
        "ru",
        "???",
        "ui"
    ],
    [
        "status.planned",
        "ru",
        "????????????",
        "ui"
    ],
    [
        "telegram.auth.logout_confirm",
        "ru",
        "?? ????????????? ?????? ??????",
        "ui"
    ],
    [
        "ui.cashier_orders.title",
        "ru",
        "?????? ??? ????????????? ??????",
        "ui"
    ],
    [
        "ui.cash.pending.title",
        "ru",
        "????????? ???????? ?? ????????????",
        "ui"
    ],
    [
        "ui.cash.received.title",
        "ru",
        "???????? ?????? ?? ??????",
        "ui"
    ],
    [
        "ui.cities.add",
        "ru",
        "???????? ?????",
        "ui"
    ],
    [
        "ui.common.all",
        "ru",
        "???",
        "ui"
    ],
    [
        "ui.common.all_staff",
        "ru",
        "??? ??????????",
        "ui"
    ],
    [
        "ui.common.export_excel",
        "ru",
        "????????? ? Excel",
        "ui"
    ],
    [
        "ui.common.not_selected",
        "ru",
        "?? ??????",
        "ui"
    ],
    [
        "ui.common.results",
        "ru",
        "??????????",
        "ui"
    ],
    [
        "ui.common.select_customer",
        "ru",
        "??????? ???????",
        "ui"
    ],
    [
        "ui.common.total",
        "ru",
        "?????",
        "ui"
    ],
    [
        "ui.customers.col.city",
        "ru",
        "?????",
        "ui"
    ],
    [
        "ui.customers.col.firm",
        "ru",
        "???????? ?????",
        "ui"
    ],
    [
        "ui.customers.col.id",
        "ru",
        "ID ???????",
        "ui"
    ],
    [
        "ui.customers.col.name",
        "ru",
        "???????? ???????",
        "ui"
    ],
    [
        "ui.customers.col.phone",
        "ru",
        "???????",
        "ui"
    ],
    [
        "ui.customers.col.tax_id",
        "ru",
        "???",
        "ui"
    ],
    [
        "ui.dashboard.no_category_data",
        "ru",
        "??? ?????? ?? ??????????.",
        "ui"
    ],
    [
        "ui.operations.create.title",
        "ru",
        "???????? ????????",
        "ui"
    ],
    [
        "ui.order_items.export",
        "ru",
        "??????? ??????? ? Excel",
        "ui"
    ],
    [
        "ui.order_items.title",
        "ru",
        "??????? ???????",
        "ui"
    ],
    [
        "ui.orders.create",
        "ru",
        "??????? ?????",
        "ui"
    ],
    [
        "ui.orders.export",
        "ru",
        "??????? ?????? ? Excel",
        "ui"
    ],
    [
        "ui.orders.save_order",
        "ru",
        "????????? ?????",
        "ui"
    ],
    [
        "ui.orders.save_variant",
        "ru",
        "????????? ???????",
        "ui"
    ],
    [
        "ui.placeholder.date",
        "ru",
        "??.??.????",
        "ui"
    ],
    [
        "ui.placeholder.datetime",
        "ru",
        "??.??.???? ??:??",
        "ui"
    ],
    [
        "ui.placeholder.order_no",
        "ru",
        "? ??????",
        "ui"
    ],
    [
        "ui.products.add",
        "ru",
        "???????? ?????",
        "ui"
    ],
    [
        "ui.report.agents.title",
        "ru",
        "?????: ????????????? ???????",
        "ui"
    ],
    [
        "ui.report.customers.title",
        "ru",
        "?????: ?? ????????",
        "ui"
    ],
    [
        "ui.report.expeditors.title",
        "ru",
        "?????: ????????????? ???????????? (?? ???????)",
        "ui"
    ],
    [
        "ui.report.photos.customers_without_photos",
        "ru",
        "??????? ??? ????",
        "ui"
    ],
    [
        "ui.report.photos.title",
        "ru",
        "?????: ?????????? ????????",
        "ui"
    ],
    [
        "ui.report.visits.title",
        "ru",
        "?????: ????????? ???????",
        "ui"
    ],
    [
        "ui.stock.title",
        "ru",
        "??????? ?? ??????",
        "ui"
    ],
    [
        "ui.territories.add",
        "ru",
        "???????? ??????????",
        "ui"
    ],
    [
        "ui.translations.text_contains",
        "ru",
        "????? ????????...",
        "ui"
    ],
    [
        "ui.visits_calendar.title",
        "ru",
        "????????? ???????",
        "ui"
    ],
    [
        "ui.visits_create.title",
        "ru",
        "??????? ?????",
        "ui"
    ],
    [
        "ui.visits_search.customer_name_or_tax",
        "ru",
        "???????? ??? ???",
        "ui"
    ],
    [
        "ui.visits_search.title",
        "ru",
        "????? ??????",
        "ui"
    ],
    [
        "button.add",
        "ru",
        "????????",
        "buttons"
    ],
    [
        "button.add",
        "uz",
        "Qo'shish",
        "buttons"
    ],
    [
        "button.add",
        "en",
        "Add",
        "buttons"
    ],
    [
        "button.export",
        "ru",
        "???????",
        "buttons"
    ],
    [
        "button.export",
        "uz",
        "Eksport",
        "buttons"
    ],
    [
        "button.export",
        "en",
        "Export",
        "buttons"
    ],
    [
        "ui.customers.col.actions",
        "ru",
        "????????",
        "fields"
    ],
    [
        "ui.customers.col.actions",
        "uz",
        "Amallar",
        "fields"
    ],
    [
        "ui.customers.col.actions",
        "en",
        "Actions",
        "fields"
    ],
    [
        "ui.customers.col.address",
        "ru",
        "?????",
        "fields"
    ],
    [
        "ui.customers.col.address",
        "uz",
        "Manzil",
        "fields"
    ],
    [
        "ui.customers.col.address",
        "en",
        "Address",
        "fields"
    ],
    [
        "ui.customers.col.territory",
        "ru",
        "??????????",
        "fields"
    ],
    [
        "ui.customers.col.territory",
        "uz",
        "Hudud",
        "fields"
    ],
    [
        "ui.customers.col.territory",
        "en",
        "Territory",
        "fields"
    ],
    [
        "ui.customers.col.contact",
        "ru",
        "?????????? ????",
        "fields"
    ],
    [
        "ui.customers.col.contact",
        "uz",
        "Aloqa shaxsi",
        "fields"
    ],
    [
        "ui.customers.col.contact",
        "en",
        "Contact person",
        "fields"
    ],
    [
        "ui.customers.col.status",
        "ru",
        "??????",
        "fields"
    ],
    [
        "ui.customers.col.status",
        "uz",
        "Holat",
        "fields"
    ],
    [
        "ui.customers.col.status",
        "en",
        "Status",
        "fields"
    ],
    [
        "ui.customers.col.agent_login",
        "ru",
        "login ??????",
        "fields"
    ],
    [
        "ui.customers.col.agent_login",
        "uz",
        "Agent login",
        "fields"
    ],
    [
        "ui.customers.col.agent_login",
        "en",
        "Agent login",
        "fields"
    ],
    [
        "ui.customers.col.expeditor_login",
        "ru",
        "login ???????????",
        "fields"
    ],
    [
        "ui.customers.col.expeditor_login",
        "uz",
        "Ekspeditor login",
        "fields"
    ],
    [
        "ui.customers.col.expeditor_login",
        "en",
        "Expeditor login",
        "fields"
    ],
    [
        "ui.customers.col.has_photo",
        "ru",
        "????",
        "fields"
    ],
    [
        "ui.customers.col.has_photo",
        "uz",
        "Rasm",
        "fields"
    ],
    [
        "ui.customers.col.has_photo",
        "en",
        "Photo",
        "fields"
    ],
    [
        "ui.customers.col.lat",
        "ru",
        "??????",
        "fields"
    ],
    [
        "ui.customers.col.lat",
        "uz",
        "Kenglik",
        "fields"
    ],
    [
        "ui.customers.col.lat",
        "en",
        "Latitude",
        "fields"
    ],
    [
        "ui.customers.col.lon",
        "ru",
        "???????",
        "fields"
    ],
    [
        "ui.customers.col.lon",
        "uz",
        "Uzunlik",
        "fields"
    ],
    [
        "ui.customers.col.lon",
        "en",
        "Longitude",
        "fields"
    ],
    [
        "ui.customers.col.account",
        "ru",
        "?/?",
        "fields"
    ],
    [
        "ui.customers.col.account",
        "uz",
        "Hisob raqami",
        "fields"
    ],
    [
        "ui.customers.col.account",
        "en",
        "Account",
        "fields"
    ],
    [
        "ui.customers.col.bank",
        "ru",
        "????",
        "fields"
    ],
    [
        "ui.customers.col.bank",
        "uz",
        "Bank",
        "fields"
    ],
    [
        "ui.customers.col.bank",
        "en",
        "Bank",
        "fields"
    ],
    [
        "ui.customers.col.mfo",
        "ru",
        "???",
        "fields"
    ],
    [
        "ui.customers.col.mfo",
        "uz",
        "MFO",
        "fields"
    ],
    [
        "ui.customers.col.mfo",
        "en",
        "MFO",
        "fields"
    ],
    [
        "ui.customers.col.oked",
        "ru",
        "????",
        "fields"
    ],
    [
        "ui.customers.col.oked",
        "uz",
        "OKED",
        "fields"
    ],
    [
        "ui.customers.col.oked",
        "en",
        "OKED",
        "fields"
    ],
    [
        "ui.customers.col.vat_code",
        "ru",
        "??????????????? ??? ??????????? ???",
        "fields"
    ],
    [
        "ui.customers.col.vat_code",
        "uz",
        "QQS to'lovchi ro'yxat kodi",
        "fields"
    ],
    [
        "ui.customers.col.vat_code",
        "en",
        "VAT registration code",
        "fields"
    ],
    [
        "ui.customers.col.contract",
        "ru",
        "??????? ?",
        "fields"
    ],
    [
        "ui.customers.col.contract",
        "uz",
        "Shartnoma ?",
        "fields"
    ],
    [
        "ui.customers.col.contract",
        "en",
        "Contract No.",
        "fields"
    ],
    [
        "ui.customers.col.category",
        "ru",
        "????????? ???????",
        "fields"
    ],
    [
        "ui.customers.col.category",
        "uz",
        "Mijoz toifasi",
        "fields"
    ],
    [
        "ui.customers.col.category",
        "en",
        "Customer category",
        "fields"
    ],
    [
        "ui.customers.col.landmark",
        "ru",
        "????????",
        "fields"
    ],
    [
        "ui.customers.col.landmark",
        "uz",
        "Mo'ljal",
        "fields"
    ],
    [
        "ui.customers.col.landmark",
        "en",
        "Landmark",
        "fields"
    ],
    [
        "ui.customers.col.pinfl",
        "ru",
        "?????",
        "fields"
    ],
    [
        "ui.customers.col.pinfl",
        "uz",
        "PINFL",
        "fields"
    ],
    [
        "ui.customers.col.pinfl",
        "en",
        "PINFL",
        "fields"
    ]
]


def upgrade() -> None:
    conn = op.get_bind()
    for key, lang, text, category in ROWS:
        category_value = None if category == "ui" else category
        conn.execute(
            sa.text(
                '''
                INSERT INTO "Sales".translations
                    (id, translation_key, language_code, translation_text, category, created_by, updated_by, created_at, updated_at)
                VALUES
                    (gen_random_uuid(), :key, :lang, :text, :category, 'migration_023', 'migration_023', now(), now())
                ON CONFLICT (translation_key, language_code)
                DO UPDATE SET
                    translation_text = EXCLUDED.translation_text,
                    category = COALESCE(EXCLUDED.category, "Sales".translations.category),
                    updated_by = 'migration_023',
                    updated_at = now()
                '''
            ),
            {"key": key, "lang": lang, "text": text, "category": category_value},
        )


def downgrade() -> None:
    pass
