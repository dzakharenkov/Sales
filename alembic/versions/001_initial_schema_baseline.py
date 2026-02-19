"""initial schema baseline

Revision ID: 001_initial_schema_baseline
Revises:
Create Date: 2026-02-19 23:50:00
"""

from pathlib import Path
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema_baseline"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    root = Path(__file__).resolve().parents[2]
    baseline_sql = (root / "sales_sql.sql").read_text(encoding="utf-8")
    bind = op.get_bind()
    bind.exec_driver_sql('CREATE SCHEMA IF NOT EXISTS "Sales";')
    bind.exec_driver_sql(baseline_sql)


def downgrade() -> None:
    op.execute('DROP SCHEMA IF EXISTS "Sales" CASCADE;')
