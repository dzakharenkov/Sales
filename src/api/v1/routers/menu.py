"""Menu by role: GET /menu, GET/POST /admin/roles/{role}/menu-access."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.connection import get_db_session
from src.database.models import User
from src.core.deps import get_current_user, require_admin

router = APIRouter()
ALLOWED_ROLES = ("admin", "agent", "expeditor", "stockman", "paymaster")
ALLOWED_ACCESS = ("none", "view", "full")

@router.get("/menu")
async def get_menu(session: AsyncSession = Depends(get_db_session), user: User = Depends(get_current_user)):
    role = (user.role or "").strip().lower() or "agent"
    q = text("""SELECT mi.id, mi.code, mi.label, mi.icon, mi.url, mi.sort_order, rma.access_level
        FROM "Sales".menu_items mi JOIN "Sales".role_menu_access rma ON mi.id = rma.menu_item_id
        WHERE rma.role = :role AND rma.access_level != 'none' AND COALESCE(mi.is_active, TRUE) = TRUE
        ORDER BY mi.sort_order""")
    result = await session.execute(q, {"role": role})
    rows = result.fetchall()
    menu = [{"id": r[0], "code": r[1], "label": r[2], "icon": r[3] or "", "url": r[4] or r[1], "sort_order": r[5] or 0, "access_level": r[6] or "view"} for r in rows]
    return {"menu": menu}

@router.get("/admin/roles/{role}/menu-access")
async def get_role_menu_access(role: str, session: AsyncSession = Depends(get_db_session), _: User = Depends(require_admin)):
    role_lower = role.strip().lower()
    if role_lower not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    q = text("""SELECT mi.id, mi.code, mi.label, COALESCE(rma.access_level, 'none')
        FROM "Sales".menu_items mi
        LEFT JOIN "Sales".role_menu_access rma ON rma.menu_item_id = mi.id AND rma.role = :role
        WHERE COALESCE(mi.is_active, TRUE) = TRUE ORDER BY mi.sort_order""")
    result = await session.execute(q, {"role": role_lower})
    rows = result.fetchall()
    return {"role": role_lower, "menu_access": [{"menu_item_id": r[0], "menu_code": r[1], "menu_label": r[2], "access_level": r[3] or "none"} for r in rows]}

class MenuAccessItem(BaseModel):
    menu_item_id: int
    access_level: str

class RoleMenuAccessBody(BaseModel):
    menu_access: List[MenuAccessItem]

@router.post("/admin/roles/{role}/menu-access")
async def save_role_menu_access(role: str, body: RoleMenuAccessBody, session: AsyncSession = Depends(get_db_session), _: User = Depends(require_admin)):
    role_lower = role.strip().lower()
    if role_lower not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    for item in body.menu_access:
        if item.access_level not in ALLOWED_ACCESS:
            raise HTTPException(status_code=400, detail="Invalid access_level")
    await session.execute(text('DELETE FROM "Sales".role_menu_access WHERE role = :role'), {"role": role_lower})
    for item in body.menu_access:
        await session.execute(text('INSERT INTO "Sales".role_menu_access (role, menu_item_id, access_level) VALUES (:role, :mid, :al)'), {"role": role_lower, "mid": item.menu_item_id, "al": item.access_level})
    await session.commit()
    return {"success": True, "message": "Права обновлены"}
