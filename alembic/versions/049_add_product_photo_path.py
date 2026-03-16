"""add product photo path

Revision ID: 049_add_product_photo_path
Revises: 048_tg_agent_legacy_i18n
Create Date: 2026-03-12 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "049_add_product_photo_path"
down_revision: Union[str, Sequence[str], None] = "048_tg_agent_legacy_i18n"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('ALTER TABLE "Sales".product ADD COLUMN IF NOT EXISTS photo_path TEXT;')
    op.execute(
        'COMMENT ON COLUMN "Sales".product.photo_path IS '
        "'Имя файла фотографии товара в папке photo/'"
    )


def downgrade() -> None:
    op.execute('ALTER TABLE "Sales".product DROP COLUMN IF EXISTS photo_path;')
