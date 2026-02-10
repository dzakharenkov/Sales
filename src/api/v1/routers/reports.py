"""
Отчётность: по клиентам, агентам, визитам, дашборд, фотографии.
"""
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from openpyxl import Workbook
from sqlalchemy import select, func, Integer, and_, case
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import Customer, CustomerVisit, CustomerPhoto, User, Order
from src.core.deps import get_current_user

router = APIRouter()


@router.get("/reports/customers")
async def report_customers(
    agent_login: str | None = Query(None),
    status: str | None = Query(None, description="active|inactive|all"),
    month: str | None = Query(None, description="YYYY-MM"),
    limit: int = Query(50, le=500),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Отчёт по клиентам: визиты, последний визит, статус активен/неактивен."""
    # Подсчёт по клиентам через подзапросы
    sub_visits = (
        select(
            CustomerVisit.customer_id,
            func.count(CustomerVisit.id).label("total_visits"),
            func.sum(
                case((CustomerVisit.status == "completed", 1), else_=0)
            ).label("completed_visits"),
            func.max(CustomerVisit.visit_date).label("last_visit_date"),
        )
        .group_by(CustomerVisit.customer_id)
    ).subquery()
    sub_photos = (
        select(CustomerPhoto.customer_id, func.count(CustomerPhoto.id).label("total_photos")).group_by(CustomerPhoto.customer_id)
    ).subquery()
    sub_orders = (
        select(
            Order.customer_id,
            func.count(Order.order_no).label("orders_count"),
            func.coalesce(func.sum(Order.total_amount), 0).label("orders_amount"),
        )
        .group_by(Order.customer_id)
    ).subquery()
    q = (
        select(
            Customer.id,
            Customer.name_client,
            Customer.firm_name,
            Customer.login_agent,
            func.coalesce(sub_visits.c.total_visits, 0).label("total_visits"),
            func.coalesce(sub_visits.c.completed_visits, 0).label("completed_visits"),
            sub_visits.c.last_visit_date,
            func.coalesce(sub_photos.c.total_photos, 0).label("total_photos"),
            func.coalesce(sub_orders.c.orders_count, 0).label("orders_count"),
            func.coalesce(sub_orders.c.orders_amount, 0).label("orders_amount"),
        )
        .outerjoin(sub_visits, Customer.id == sub_visits.c.customer_id)
        .outerjoin(sub_photos, Customer.id == sub_photos.c.customer_id)
        .outerjoin(sub_orders, Customer.id == sub_orders.c.customer_id)
    )
    if agent_login:
        q = q.where(Customer.login_agent == agent_login)
    if month:
        try:
            y, m = map(int, month.split("-"))
            first = date(y, m, 1)
            last = date(y, 12, 31) if m == 12 else date(y, m + 1, 1) - timedelta(days=1)
            sub_month = select(CustomerVisit.customer_id).where(
                CustomerVisit.visit_date >= first,
                CustomerVisit.visit_date <= last,
            ).distinct()
            q = q.where(Customer.id.in_(sub_month))
        except Exception:
            pass
    if status == "active":
        q = q.where(sub_visits.c.last_visit_date >= date.today() - timedelta(days=30))
    elif status == "inactive":
        q = q.where(
            (sub_visits.c.last_visit_date < date.today() - timedelta(days=30))
            | (sub_visits.c.last_visit_date.is_(None))
        )
    q = q.order_by(sub_visits.c.last_visit_date.desc().nulls_last())
    count_q = select(func.count()).select_from(q.subquery())
    total = (await session.execute(count_q)).scalar() or 0
    q = q.offset(offset).limit(limit)
    result = await session.execute(q)
    rows = result.all()
    agent_logins = {r.login_agent for r in rows if r.login_agent}
    users_map = {}
    if agent_logins:
        ures = await session.execute(select(User.login, User.fio).where(User.login.in_(agent_logins)))
        for login, fio in ures:
            users_map[login] = fio or login
    data = []
    for r in rows:
        last_visit = r.last_visit_date.isoformat() if r.last_visit_date else None
        status_val = "Активен" if (r.last_visit_date and (date.today() - r.last_visit_date).days <= 30) else "Неактивен"
        data.append({
            "id": r.id,
            "name_client": r.name_client,
            "firm_name": r.firm_name,
            "agent_login": r.login_agent,
            "agent_name": users_map.get(r.login_agent) or r.login_agent,
            "total_visits": r.total_visits or 0,
            "completed_visits": r.completed_visits or 0,
            "orders_count": getattr(r, "orders_count", 0) or 0,
            "orders_amount": float(getattr(r, "orders_amount", 0) or 0),
            "last_visit_date": last_visit,
            "status": status_val,
            "total_photos": r.total_photos or 0,
        })
    return {"total": total, "data": data}


@router.get("/reports/customers/export")
async def export_report_customers(
    agent_login: str | None = Query(None),
    status: str | None = Query(None, description="active|inactive|all"),
    month: str | None = Query(None, description="YYYY-MM"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Экспорт отчёта по клиентам в Excel (xlsx)."""
    res = await report_customers(
        agent_login=agent_login,
        status=status,
        month=month,
        limit=5000,
        offset=0,
        session=session,
        user=user,
    )
    data = res.get("data") or []
    wb = Workbook()
    ws = wb.active
    ws.title = "Клиенты"
    headers = [
        "ID клиента",
        "Клиент",
        "Агент",
        "Визитов (всего)",
        "Завершено визитов",
        "Кол-во заказов",
        "Сумма заказов",
        "Последний визит",
        "Статус",
        "Фото (шт.)",
    ]
    for col, h in enumerate(headers, start=1):
        ws.cell(row=1, column=col, value=h)
    for row_idx, r in enumerate(data, start=2):
        ws.cell(row=row_idx, column=1, value=r.get("id"))
        ws.cell(row=row_idx, column=2, value=r.get("name_client") or r.get("firm_name") or "")
        ws.cell(row=row_idx, column=3, value=r.get("agent_login") or "")
        ws.cell(row=row_idx, column=4, value=r.get("total_visits") or 0)
        ws.cell(row=row_idx, column=5, value=r.get("completed_visits") or 0)
        ws.cell(row=row_idx, column=6, value=r.get("orders_count") or 0)
        ws.cell(row=row_idx, column=7, value=float(r.get("orders_amount") or 0))
        ws.cell(row=row_idx, column=8, value=r.get("last_visit_date") or "")
        ws.cell(row=row_idx, column=9, value=r.get("status") or "")
        ws.cell(row=row_idx, column=10, value=r.get("total_photos") or 0)
    buf = bytearray()
    from io import BytesIO
    bio = BytesIO()
    wb.save(bio)
    bio.seek(0)
    buf = bio.read()
    return Response(
        content=buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="report_customers.xlsx"'},
    )


@router.get("/reports/agents")
async def report_agents(
    month: str | None = Query(None),
    sort: str | None = Query("visits", description="visits|completion_rate|rating"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Эффективность агентов (ответственные за визиты)."""
    join_cond = User.login == CustomerVisit.responsible_login
    if month:
        try:
            y, m = map(int, month.split("-"))
            first = date(y, m, 1)
            last = date(y, 12, 31) if m == 12 else date(y, m + 1, 1) - timedelta(days=1)
            join_cond = and_(User.login == CustomerVisit.responsible_login, CustomerVisit.visit_date >= first, CustomerVisit.visit_date <= last)
        except Exception:
            pass
    q = (
        select(
            User.login,
            User.fio,
            func.count(CustomerVisit.id).label("total_visits"),
            func.sum(case((CustomerVisit.status == "completed", 1), else_=0)).label("completed_visits"),
            func.sum(case((CustomerVisit.status == "cancelled", 1), else_=0)).label("cancelled_visits"),
            func.count(func.distinct(CustomerVisit.customer_id)).label("customer_count"),
            func.max(CustomerVisit.visit_date).label("last_visit_date"),
        )
        .outerjoin(CustomerVisit, join_cond)
        .where(func.lower(User.role).in_(["agent", "expeditor", "admin"]))
        .group_by(User.login, User.fio)
    )
    result = await session.execute(q)
    rows = result.all()
    data = []
    for r in rows:
        total_v = r.total_visits or 0
        completed = r.completed_visits or 0
        rate = round(completed * 100.0 / total_v, 1) if total_v else 0
        rating = min(5.0, max(1.0, (rate / 100.0) * 5)) if total_v else 0
        data.append({
            "login": r.login,
            "fio": r.fio or r.login,
            "customer_count": r.customer_count or 0,
            "total_visits": total_v,
            "completed_visits": completed,
            "cancelled_visits": r.cancelled_visits or 0,
            "completion_rate": rate,
            "last_visit_date": r.last_visit_date.isoformat() if r.last_visit_date else None,
            "rating": round(rating, 1),
        })
    if sort == "completion_rate":
        data.sort(key=lambda x: x["completion_rate"], reverse=True)
    elif sort == "rating":
        data.sort(key=lambda x: x["rating"], reverse=True)
    else:
        data.sort(key=lambda x: x["total_visits"], reverse=True)
    return {"data": data}


@router.get("/reports/expeditors")
async def report_expeditors(
    month: str | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Эффективность экспедиторов (фильтр по role=expeditor)."""
    join_cond = User.login == CustomerVisit.responsible_login
    if month:
        try:
            y, m = map(int, month.split("-"))
            first = date(y, m, 1)
            last = date(y, 12, 31) if m == 12 else date(y, m + 1, 1) - timedelta(days=1)
            join_cond = and_(User.login == CustomerVisit.responsible_login, CustomerVisit.visit_date >= first, CustomerVisit.visit_date <= last)
        except Exception:
            pass
    q = (
        select(
            User.login,
            User.fio,
            func.count(CustomerVisit.id).label("total_visits"),
            func.sum(case((CustomerVisit.status == "completed", 1), else_=0)).label("completed_visits"),
            func.count(func.distinct(CustomerVisit.customer_id)).label("customer_count"),
            func.max(CustomerVisit.visit_date).label("last_visit_date"),
        )
        .outerjoin(CustomerVisit, join_cond)
        .where(func.lower(User.role) == "expeditor")
        .group_by(User.login, User.fio)
    )
    result = await session.execute(q)
    rows = result.all()
    data = []
    for r in rows:
        total_v = r.total_visits or 0
        completed = r.completed_visits or 0
        rate = round(completed * 100.0 / total_v, 1) if total_v else 0
        data.append({
            "login": r.login,
            "fio": r.fio or r.login,
            "customer_count": r.customer_count or 0,
            "total_visits": total_v,
            "completed_visits": completed,
            "completion_rate": rate,
            "last_visit_date": r.last_visit_date.isoformat() if r.last_visit_date else None,
        })
    data.sort(key=lambda x: x["total_visits"], reverse=True)
    return {"data": data}


@router.get("/reports/visits")
async def report_visits(
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    status: str | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Аналитика визитов: сводка и по датам."""
    q = select(CustomerVisit).where(1 == 1)
    if from_date:
        q = q.where(CustomerVisit.visit_date >= from_date)
    if to_date:
        q = q.where(CustomerVisit.visit_date <= to_date)
    if status:
        q = q.where(CustomerVisit.status == status)
    result = await session.execute(q)
    visits = result.scalars().all()
    total = len(visits)
    completed = sum(1 for v in visits if v.status == "completed")
    planned = sum(1 for v in visits if v.status == "planned")
    cancelled = sum(1 for v in visits if v.status == "cancelled")
    rate = round(completed * 100.0 / total, 1) if total else 0
    by_date = {}
    for v in visits:
        if v.visit_date:
            d = v.visit_date.isoformat()
            if d not in by_date:
                by_date[d] = {"total_visits": 0, "completed": 0, "planned": 0, "cancelled": 0}
            by_date[d]["total_visits"] += 1
            if v.status == "completed":
                by_date[d]["completed"] += 1
            elif v.status == "planned":
                by_date[d]["planned"] += 1
            else:
                by_date[d]["cancelled"] += 1
    by_date_list = [{"date": k, **v} for k, v in sorted(by_date.items(), reverse=True)[:31]]
    return {
        "summary": {
            "total_visits": total,
            "completed": completed,
            "planned": planned,
            "cancelled": cancelled,
            "completion_rate": rate,
        },
        "by_date": by_date_list,
    }


@router.get("/reports/dashboard")
async def report_dashboard(
    month: str | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Сводная аналитика / дашборд: KPI, топ агентов, топ клиентов, неактивные."""
    today = date.today()
    if month:
        try:
            y, m = map(int, month.split("-"))
            first = date(y, m, 1)
            last = date(y, m + 1, 1) - timedelta(days=1) if m < 12 else date(y, 12, 31)
        except Exception:
            first = today.replace(day=1)
            last = today
    else:
        first = today.replace(day=1)
        last = today
    total_customers = (await session.execute(select(func.count(Customer.id)))).scalar() or 0
    visits_in_month = (
        await session.execute(
            select(func.count(CustomerVisit.id)).where(
                CustomerVisit.visit_date >= first,
                CustomerVisit.visit_date <= last,
            )
        )
    )
    visits_count = (visits_in_month.scalar() or 0) or 0
    completed_in_month = (
        await session.execute(
            select(func.count(CustomerVisit.id)).where(
                CustomerVisit.visit_date >= first,
                CustomerVisit.visit_date <= last,
                CustomerVisit.status == "completed",
            )
        )
    )
    completed_count = (completed_in_month.scalar() or 0) or 0
    completion_rate = round(completed_count * 100.0 / visits_count, 1) if visits_count else 0
    days_in_period = (last - first).days + 1
    avg_per_day = round(visits_count / days_in_period, 1) if days_in_period else 0
    active_customers = (
        await session.execute(
            select(func.count(func.distinct(CustomerVisit.customer_id))).where(
                CustomerVisit.visit_date >= today - timedelta(days=30)
            )
        )
    )
    active_count = (active_customers.scalar() or 0) or 0
    inactive_q = (
        select(Customer.id)
        .outerjoin(CustomerVisit, Customer.id == CustomerVisit.customer_id)
        .group_by(Customer.id)
        .having(
            (func.max(CustomerVisit.visit_date) < today - timedelta(days=30))
            | (func.max(CustomerVisit.visit_date).is_(None))
        )
    )
    inactive_count = (await session.execute(select(func.count()).select_from(inactive_q.subquery()))).scalar() or 0
    top_agents_q = (
        select(
            CustomerVisit.responsible_login,
            func.count(CustomerVisit.id).label("cnt"),
        )
        .where(CustomerVisit.visit_date >= first, CustomerVisit.visit_date <= last, CustomerVisit.status == "completed")
        .group_by(CustomerVisit.responsible_login)
        .order_by(func.count(CustomerVisit.id).desc())
        .limit(5)
    )
    top_agents_rows = (await session.execute(top_agents_q)).all()
    top_agents = [{"login": r[0], "visits": r[1]} for r in top_agents_rows if r[0]]
    top_customers_q = (
        select(CustomerVisit.customer_id, func.count(CustomerVisit.id).label("cnt"))
        .where(CustomerVisit.visit_date >= first, CustomerVisit.visit_date <= last)
        .group_by(CustomerVisit.customer_id)
        .order_by(func.count(CustomerVisit.id).desc())
        .limit(5)
    )
    top_cust_rows = (await session.execute(top_customers_q)).all()
    top_customers = []
    for cid, cnt in top_cust_rows:
        c = await session.get(Customer, cid)
        name = (c.name_client or c.firm_name or f"Клиент #{cid}") if c else f"Клиент #{cid}"
        top_customers.append({"name": name, "visits": cnt})
    return {
        "kpi": {
            "total_customers": total_customers,
            "visits_this_month": visits_count,
            "active_customers": active_count,
            "active_customers_pct": round(active_count * 100.0 / total_customers, 0) if total_customers else 0,
            "avg_visits_per_day": avg_per_day,
            "completion_rate": completion_rate,
        },
        "top_agents": top_agents,
        "top_customers": top_customers,
        "inactive_customers": {"count": inactive_count},
    }


@router.get("/reports/photos")
async def report_photos(
    type: str | None = Query("all"),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Отчёт по фотографиям: статистика, клиенты без фото, последние загрузки."""
    total_photos = (await session.execute(select(func.count(CustomerPhoto.id)))).scalar() or 0
    customers_with_photos = (await session.execute(select(func.count(func.distinct(CustomerPhoto.customer_id))))).scalar() or 0
    total_customers = (await session.execute(select(func.count(Customer.id)))).scalar() or 0
    without_photos = total_customers - customers_with_photos
    avg_photos = round(total_photos / customers_with_photos, 1) if customers_with_photos else 0
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    uploaded_week = (
        await session.execute(
            select(func.count(CustomerPhoto.id)).where(CustomerPhoto.uploaded_at >= week_ago)
        )
    )
    uploaded_week_count = (uploaded_week.scalar() or 0) or 0
    customers_without_list = []
    if type in ("all", "without_photos"):
        sub = (
            select(Customer.id)
            .outerjoin(CustomerPhoto, Customer.id == CustomerPhoto.customer_id)
            .group_by(Customer.id)
            .having(func.count(CustomerPhoto.id) == 0)
        )
        result = await session.execute(sub.offset(offset).limit(limit))
        ids = [r[0] for r in result.all()]
        for cid in ids:
            c = await session.get(Customer, cid)
            if c:
                customers_without_list.append({
                    "id": c.id,
                    "name": c.name_client or c.firm_name or f"Клиент #{c.id}",
                    "agent_login": c.login_agent,
                })
    recent = []
    if type in ("all", "recent"):
        q = (
            select(CustomerPhoto, Customer.name_client, Customer.firm_name)
            .join(Customer, CustomerPhoto.customer_id == Customer.id)
            .order_by(CustomerPhoto.uploaded_at.desc())
            .limit(20)
        )
        result = await session.execute(q)
        for p, nc, fn in result.all():
            recent.append({
                "photo_id": p.id,
                "customer_id": p.customer_id,
                "customer_name": (nc or fn or "").strip() or f"Клиент #{p.customer_id}",
                "uploaded_by": p.uploaded_by,
                "uploaded_at": p.uploaded_at.isoformat() if p.uploaded_at else None,
                "description": p.description,
            })
    return {
        "statistics": {
            "total_photos": total_photos,
            "customers_with_photos": customers_with_photos,
            "customers_without_photos": without_photos,
            "avg_photos_per_customer": avg_photos,
            "uploaded_this_week": uploaded_week_count,
        },
        "customers_without_photos": customers_without_list,
        "recent_uploads": recent,
    }
