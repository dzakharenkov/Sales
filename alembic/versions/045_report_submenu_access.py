"""add report submenu items for per-role access control

Revision ID: 045_report_submenu_access
Revises: 044_stock_view_fix
Create Date: 2026-02-26
"""

from alembic import op


revision = "045_report_submenu_access"
down_revision = "044_stock_view_fix"
branch_labels = None
depends_on = None


REPORT_ITEMS = [
    ("report_customers", "По клиентам", 91),
    ("report_agents", "По агентам", 92),
    ("report_expeditors", "По экспедиторам", 93),
    ("report_visits", "По визитам", 94),
    ("report_dashboard", "Сводная аналитика", 95),
    ("report_photos", "Фотографии клиентов", 96),
]


def upgrade() -> None:
    for code, label, sort_order in REPORT_ITEMS:
        op.execute(
            f'''
            INSERT INTO "Sales".menu_items (code, label, icon, url, sort_order, is_active)
            SELECT '{code}', '{label}', NULL, '{code}', {sort_order}, TRUE
            WHERE NOT EXISTS (
                SELECT 1 FROM "Sales".menu_items WHERE code = '{code}'
            )
            '''
        )

    op.execute(
        '''
        INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level)
        SELECT roles.role, child.id, COALESCE(parent_access.access_level, 'none')
        FROM (SELECT DISTINCT role FROM "Sales".role_menu_access) AS roles
        JOIN "Sales".menu_items child
          ON child.code IN ('report_customers','report_agents','report_expeditors','report_visits','report_dashboard','report_photos')
        LEFT JOIN "Sales".menu_items parent
          ON parent.code = 'reports'
        LEFT JOIN "Sales".role_menu_access parent_access
          ON parent_access.role = roles.role
         AND parent_access.menu_item_id = parent.id
        LEFT JOIN "Sales".role_menu_access existing
          ON existing.role = roles.role
         AND existing.menu_item_id = child.id
        WHERE existing.menu_item_id IS NULL
        '''
    )


def downgrade() -> None:
    op.execute(
        '''
        DELETE FROM "Sales".role_menu_access
        WHERE menu_item_id IN (
            SELECT id FROM "Sales".menu_items
            WHERE code IN ('report_customers','report_agents','report_expeditors','report_visits','report_dashboard','report_photos')
        )
        '''
    )
    op.execute(
        '''
        DELETE FROM "Sales".menu_items
        WHERE code IN ('report_customers','report_agents','report_expeditors','report_visits','report_dashboard','report_photos')
        '''
    )
