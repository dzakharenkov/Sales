"""add photo_datetime column

Revision ID: 006_add_photo_datetime
Revises: 005_add_missing_submenu_items
Create Date: 2026-02-19 23:55:00
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "006_add_photo_datetime"
down_revision: Union[str, Sequence[str], None] = "005_add_missing_submenu_items"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('ALTER TABLE "Sales".customer_photo ADD COLUMN IF NOT EXISTS photo_datetime TIMESTAMPTZ;')
    op.execute(
        "COMMENT ON COLUMN \"Sales\".customer_photo.photo_datetime IS "
        "'Дата и время съёмки фотографии';"
    )


def downgrade() -> None:
    op.execute('ALTER TABLE "Sales".customer_photo DROP COLUMN IF EXISTS photo_datetime;')

