"""
Визиты клиентам (customers_visits). ТЗ 3.0.
"""
from datetime import date, time, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, text, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import CustomerVisit, Customer, User
from src.core.deps import get_current_user

router = APIRouter()


class VisitCreate(BaseModel):
    visit_date: date
    visit_time: time | None = None
    status: str = "planned"
    responsible_login: str | None = None
    comment: str | None = None


class VisitUpdate(BaseModel):
    visit_date: date | None = None
    visit_time: time | None = None
    status: str | None = None
    responsible_login: str | None = None
    comment: str | None = None


def _visit_to_dict(v: CustomerVisit, customer_name: str | None = None, responsible_name: str | None = None) -> dict:
    d = {
        "id": v.id,
        "customer_id": v.customer_id,
        "visit_date": v.visit_date.isoformat() if v.visit_date else None,
        "visit_time": v.visit_time.strftime("%H:%M:%S") if v.visit_time else None,
        "status": v.status,
        "responsible_login": v.responsible_login,
        "comment": v.comment,
        "public_token": v.public_token,
        "created_by": v.created_by,
        "created_at": v.created_at.isoformat() if v.created_at else None,
        "updated_by": v.updated_by,
        "updated_at": v.updated_at.isoformat() if v.updated_at else None,
    }
    if customer_name is not None:
        d["customer_name"] = customer_name
    if responsible_name is not None:
        d["responsible_name"] = responsible_name
    return d


def _validate_comment_for_completed(status: str, comment: str | None) -> None:
    """При статусе Завершён комментарий обязателен: 10–5000 символов."""
    if status != "completed":
        return
    if not comment or not comment.strip():
        raise HTTPException(
            status_code=400,
            detail="При статусе «Завершён» укажите, что было сделано на визите (комментарий обязателен, минимум 10 символов)",
        )
    c = comment.strip()
    if len(c) < 10:
        raise HTTPException(
            status_code=400,
            detail="Комментарий при завершённом визите должен быть не менее 10 символов",
        )
    if len(c) > 5000:
        raise HTTPException(
            status_code=400,
            detail="Комментарий не должен превышать 5000 символов",
        )


@router.post("/customers/{customer_id}/visits")
async def create_visit(
    customer_id: int,
    body: VisitCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Создать визит клиенту."""
    if body.status not in ("planned", "completed", "cancelled", "postponed"):
        raise HTTPException(status_code=400, detail="status must be planned, completed, cancelled or postponed")
    _validate_comment_for_completed(body.status, body.comment)
    result = await session.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    # Генерируем public_token через raw SQL (md5(random()::text))
    row = (await session.execute(text("SELECT md5(random()::text) AS t"))).fetchone()
    public_token = row[0] if row else None
    visit = CustomerVisit(
        customer_id=customer_id,
        visit_date=body.visit_date,
        visit_time=body.visit_time,
        status=body.status,
        responsible_login=body.responsible_login or None,
        comment=body.comment or None,
        public_token=public_token or "",
        created_by=user.login,
        updated_by=user.login,
    )
    session.add(visit)
    await session.commit()
    await session.refresh(visit)
    return _visit_to_dict(visit)


@router.get("/customers/{customer_id}/visits")
async def list_customer_visits(
    customer_id: int,
    status: str | None = Query(None),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    responsible_login: str | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список визитов клиента с фильтрами."""
    q = select(CustomerVisit).where(CustomerVisit.customer_id == customer_id)
    if status:
        q = q.where(CustomerVisit.status == status)
    if from_date:
        q = q.where(CustomerVisit.visit_date >= from_date)
    if to_date:
        q = q.where(CustomerVisit.visit_date <= to_date)
    if responsible_login:
        q = q.where(CustomerVisit.responsible_login == responsible_login)
    q = q.order_by(CustomerVisit.visit_date.desc(), CustomerVisit.visit_time.desc().nulls_last())
    count_q = select(func.count()).select_from(q.subquery())
    total = (await session.execute(count_q)).scalar() or 0
    q = q.offset(offset).limit(limit)
    result = await session.execute(q)
    visits = result.scalars().all()
    # Подтянуть responsible_name (fio) из users
    logins = {v.responsible_login for v in visits if v.responsible_login}
    users_map = {}
    if logins:
        ures = await session.execute(select(User.login, User.fio).where(User.login.in_(logins)))
        for login, fio in ures:
            users_map[login] = fio or login
    data = [_visit_to_dict(v, responsible_name=users_map.get(v.responsible_login)) for v in visits]
    return {"total": total, "limit": limit, "offset": offset, "data": data}


@router.get("/visits/search")
async def search_visits(
    customer_id: int | None = Query(None, description="Фильтр по ID клиента (приоритетнее customer_name)"),
    customer_name: str | None = Query(None, description="Поиск по названию клиента"),
    status: str | None = Query(None),
    responsible_login: str | None = Query(None),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Глобальный поиск визитов с фильтрами."""
    q = (
        select(CustomerVisit, Customer.name_client, Customer.firm_name)
        .join(Customer, CustomerVisit.customer_id == Customer.id)
    )
    if customer_id is not None:
        q = q.where(Customer.id == customer_id)
    elif customer_name and customer_name.strip():
        term = customer_name.strip()
        q = q.where(
            (Customer.name_client.ilike("%" + term + "%"))
            | (Customer.firm_name.ilike("%" + term + "%"))
            | (Customer.tax_id.ilike("%" + term + "%"))
        )
    if status:
        q = q.where(CustomerVisit.status == status)
    if responsible_login:
        q = q.where(CustomerVisit.responsible_login == responsible_login)
    if from_date:
        q = q.where(CustomerVisit.visit_date >= from_date)
    if to_date:
        q = q.where(CustomerVisit.visit_date <= to_date)
    q = q.order_by(CustomerVisit.visit_date.desc(), CustomerVisit.visit_time.desc().nulls_last())
    count_q = select(func.count()).select_from(q.subquery())
    total = (await session.execute(count_q)).scalar() or 0
    q = q.offset(offset).limit(limit)
    result = await session.execute(q)
    rows = result.all()
    logins = {r[0].responsible_login for r in rows if r[0].responsible_login}
    users_map = {}
    if logins:
        ures = await session.execute(select(User.login, User.fio).where(User.login.in_(logins)))
        for login, fio in ures:
            users_map[login] = fio or login
    data = []
    for visit, name_client, firm_name in rows:
        customer_name_val = (name_client or firm_name or "").strip() or f"Клиент #{visit.customer_id}"
        data.append(_visit_to_dict(visit, customer_name=customer_name_val, responsible_name=users_map.get(visit.responsible_login)))
    return {"total": total, "limit": limit, "offset": offset, "data": data}


@router.get("/visits/{visit_id}")
async def get_visit(
    visit_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Детали визита."""
    result = await session.execute(
        select(CustomerVisit, Customer.name_client, Customer.firm_name).join(
            Customer, CustomerVisit.customer_id == Customer.id
        ).where(CustomerVisit.id == visit_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Visit not found")
    visit, name_client, firm_name = row
    customer_name = (name_client or firm_name or "").strip() or f"Клиент #{visit.customer_id}"
    responsible_name = None
    if visit.responsible_login:
        u = await session.execute(select(User.fio).where(User.login == visit.responsible_login))
        r = u.scalar_one_or_none()
        responsible_name = (r[0] or visit.responsible_login) if r else visit.responsible_login
    return _visit_to_dict(visit, customer_name=customer_name, responsible_name=responsible_name)


@router.get("/visits/token/{public_token}")
async def get_visit_by_token(
    public_token: str,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Получить визит по публичному токену (external API)."""
    result = await session.execute(select(CustomerVisit).where(CustomerVisit.public_token == public_token))
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return {
        "id": visit.id,
        "customer_id": visit.customer_id,
        "visit_date": visit.visit_date.isoformat() if visit.visit_date else None,
        "visit_time": visit.visit_time.strftime("%H:%M:%S") if visit.visit_time else None,
        "status": visit.status,
        "comment": visit.comment,
        "created_at": visit.created_at.isoformat() if visit.created_at else None,
    }


@router.put("/visits/{visit_id}")
async def update_visit(
    visit_id: int,
    body: VisitUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Обновить визит. Отменённый визит редактировать нельзя. При статусе Завершён нельзя менять дату, время, агента."""
    result = await session.execute(select(CustomerVisit).where(CustomerVisit.id == visit_id))
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    if visit.status == "cancelled":
        raise HTTPException(status_code=400, detail="Отменённый визит нельзя редактировать")
    if body.status is not None and body.status not in ("planned", "completed", "cancelled", "postponed"):
        raise HTTPException(status_code=400, detail="status must be planned, completed, cancelled or postponed")
    new_status = body.status if body.status is not None else visit.status
    _validate_comment_for_completed(new_status, body.comment if body.comment is not None else visit.comment)
    # При статусе «Завершён» не разрешаем менять дату, время, ответственного
    if visit.status == "completed":
        if body.visit_date is not None or body.visit_time is not None or body.responsible_login is not None:
            raise HTTPException(
                status_code=400,
                detail="У завершённого визита нельзя изменить дату, время или агента",
            )
    if body.visit_date is not None:
        visit.visit_date = body.visit_date
    if body.visit_time is not None:
        visit.visit_time = body.visit_time
    if body.status is not None:
        visit.status = body.status
    if body.responsible_login is not None:
        visit.responsible_login = body.responsible_login or None
    if body.comment is not None:
        visit.comment = body.comment or None
    visit.updated_by = user.login
    visit.updated_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(visit)
    return {"id": visit.id, "status": visit.status, "updated_at": visit.updated_at.isoformat(), "updated_by": visit.updated_by}


@router.delete("/visits/{visit_id}", status_code=204)
async def delete_visit(
    visit_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Удалить визит."""
    result = await session.execute(select(CustomerVisit).where(CustomerVisit.id == visit_id))
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    await session.delete(visit)
    await session.commit()


@router.get("/visits/statistics")
async def visits_statistics(
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    responsible_login: str | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Статистика визитов."""
    q = select(CustomerVisit)
    if from_date:
        q = q.where(CustomerVisit.visit_date >= from_date)
    if to_date:
        q = q.where(CustomerVisit.visit_date <= to_date)
    if responsible_login:
        q = q.where(CustomerVisit.responsible_login == responsible_login)
    result = await session.execute(q)
    visits = result.scalars().all()
    total_visits = len(visits)
    completed = sum(1 for v in visits if v.status == "completed")
    planned = sum(1 for v in visits if v.status == "planned")
    cancelled = sum(1 for v in visits if v.status == "cancelled")
    by_customer: dict[int, dict] = {}
    for v in visits:
        if v.customer_id not in by_customer:
            cust = await session.get(Customer, v.customer_id)
            name = (cust.name_client or cust.firm_name or f"Клиент #{v.customer_id}") if cust else f"Клиент #{v.customer_id}"
            by_customer[v.customer_id] = {
                "customer_id": v.customer_id,
                "customer_name": name,
                "total_visits": 0,
                "completed_visits": 0,
                "planned_visits": 0,
                "last_visit_date": None,
            }
        b = by_customer[v.customer_id]
        b["total_visits"] += 1
        if v.status == "completed":
            b["completed_visits"] += 1
        elif v.status == "planned":
            b["planned_visits"] += 1
        if v.visit_date and (b["last_visit_date"] is None or v.visit_date > b["last_visit_date"]):
            b["last_visit_date"] = v.visit_date.isoformat()
    by_responsible: dict[str, dict] = {}
    for v in visits:
        login = v.responsible_login or "_none"
        if login not in by_responsible:
            u = await session.get(User, v.responsible_login) if (v.responsible_login and login != "_none") else None
            by_responsible[login] = {
                "login": v.responsible_login if login != "_none" else None,
                "fio": (u.fio or v.responsible_login) if u else "—",
                "total_visits": 0,
                "completed": 0,
                "planned": 0,
            }
        b = by_responsible[login]
        b["total_visits"] += 1
        if v.status == "completed":
            b["completed"] += 1
        elif v.status == "planned":
            b["planned"] += 1
    return {
        "total_visits": total_visits,
        "completed": completed,
        "planned": planned,
        "cancelled": cancelled,
        "by_customer": list(by_customer.values()),
        "by_responsible": list(by_responsible.values()),
    }


@router.get("/visits/calendar")
async def visits_calendar(
    year: int | None = Query(None),
    month: int | None = Query(None),
    responsible_login: str | None = Query(None),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Визиты для календаря (предстоящие или по году/месяцу)."""
    q = (
        select(CustomerVisit, Customer.name_client, Customer.firm_name)
        .join(Customer, CustomerVisit.customer_id == Customer.id)
        .where(CustomerVisit.status.in_(["planned", "completed"]))
    )
    if year is not None and month is not None:
        from datetime import date as date_type
        from calendar import monthrange
        first = date_type(year, month, 1)
        last_day = monthrange(year, month)[1]
        last = date_type(year, month, last_day)
        q = q.where(CustomerVisit.visit_date >= first, CustomerVisit.visit_date <= last)
    else:
        q = q.where(CustomerVisit.visit_date >= date.today())
    if responsible_login:
        q = q.where(CustomerVisit.responsible_login == responsible_login)
    q = q.order_by(CustomerVisit.visit_date.asc(), CustomerVisit.visit_time.asc().nulls_last())
    result = await session.execute(q)
    events = []
    for visit, name_client, firm_name in result:
        customer_name = (name_client or firm_name or "").strip() or f"Клиент #{visit.customer_id}"
        events.append({
            "id": visit.id,
            "customer_id": visit.customer_id,
            "customer_name": customer_name,
            "date": visit.visit_date.isoformat() if visit.visit_date else None,
            "time": visit.visit_time.strftime("%H:%M:%S") if visit.visit_time else None,
            "status": visit.status,
            "responsible_login": visit.responsible_login,
            "color": "#0066cc",
        })
    return {"events": events}
