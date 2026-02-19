"""role menu access

Revision ID: 002_role_menu_access
Revises: 001_initial_schema_baseline
Create Date: 2026-02-19 23:51:00
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002_role_menu_access"
down_revision: Union[str, Sequence[str], None] = "001_initial_schema_baseline"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DROP TABLE IF EXISTS "Sales".role_menu_access CASCADE;
        DROP TABLE IF EXISTS "Sales".menu_items CASCADE;

        CREATE TABLE "Sales".menu_items (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          label TEXT NOT NULL,
          icon VARCHAR(50),
          url TEXT,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT now()
        );

        CREATE TABLE "Sales".role_menu_access (
          id SERIAL PRIMARY KEY,
          role TEXT NOT NULL,
          menu_item_id INT NOT NULL REFERENCES "Sales".menu_items(id) ON DELETE CASCADE,
          access_level VARCHAR(20) NOT NULL DEFAULT 'none',
          UNIQUE(role, menu_item_id)
        );

        CREATE INDEX idx_role_menu_access_role ON "Sales".role_menu_access(role);
        CREATE INDEX idx_role_menu_access_menu ON "Sales".role_menu_access(menu_item_id);

        INSERT INTO "Sales".menu_items (id, code, label, icon, url, sort_order, is_active) VALUES
          (1, 'users', 'Пользователи', 'users', 'users', 10, TRUE),
          (2, 'references', 'Справочники', 'folder', 'ref_parent', 20, TRUE),
          (3, 'customers', 'Клиенты', 'building', 'customers_parent', 30, TRUE),
          (4, 'visits', 'Визиты', 'calendar', 'visits_parent', 40, TRUE),
          (5, 'orders', 'Заказы', 'shopping-cart', 'orders_parent', 50, TRUE),
          (6, 'operations', 'Операции', 'truck', 'ops_parent', 60, TRUE),
          (7, 'balances', 'Остатки', 'box', 'stock', 70, TRUE),
          (8, 'cashier', 'Касса', 'dollar', 'cash_parent', 80, TRUE),
          (9, 'reports', 'Отчётность', 'chart', 'reports_parent', 90, TRUE);

        SELECT setval(pg_get_serial_sequence('"Sales".menu_items', 'id'), 9);

        INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level) VALUES
          ('admin', 1, 'full'), ('admin', 2, 'full'), ('admin', 3, 'full'), ('admin', 4, 'full'),
          ('admin', 5, 'full'), ('admin', 6, 'full'), ('admin', 7, 'full'), ('admin', 8, 'full'), ('admin', 9, 'full'),
          ('agent', 1, 'none'), ('agent', 2, 'none'), ('agent', 3, 'full'), ('agent', 4, 'full'),
          ('agent', 5, 'full'), ('agent', 6, 'none'), ('agent', 7, 'none'), ('agent', 8, 'none'), ('agent', 9, 'view'),
          ('expeditor', 1, 'none'), ('expeditor', 2, 'none'), ('expeditor', 3, 'view'), ('expeditor', 4, 'full'),
          ('expeditor', 5, 'full'), ('expeditor', 6, 'full'), ('expeditor', 7, 'view'), ('expeditor', 8, 'view'), ('expeditor', 9, 'view'),
          ('stockman', 1, 'none'), ('stockman', 2, 'none'), ('stockman', 3, 'view'), ('stockman', 4, 'none'),
          ('stockman', 5, 'view'), ('stockman', 6, 'full'), ('stockman', 7, 'full'), ('stockman', 8, 'none'), ('stockman', 9, 'full'),
          ('paymaster', 1, 'none'), ('paymaster', 2, 'none'), ('paymaster', 3, 'none'), ('paymaster', 4, 'none'),
          ('paymaster', 5, 'none'), ('paymaster', 6, 'full'), ('paymaster', 7, 'none'), ('paymaster', 8, 'full'), ('paymaster', 9, 'view');
        """
    )


def downgrade() -> None:
    op.execute('DROP TABLE IF EXISTS "Sales".role_menu_access CASCADE;')
    op.execute('DROP TABLE IF EXISTS "Sales".menu_items CASCADE;')

