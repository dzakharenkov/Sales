"""
Клиенты (customers). Новая структура: id SERIAL PRIMARY KEY, остальные поля TEXT/VARCHAR.
"""
import csv
import io
from datetime import date, time
from decimal import Decimal
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import Response
from openpyxl import Workbook
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import Customer, User, Operation, CustomerVisit
from src.core.deps import get_current_user, require_admin

router = APIRouter()


def _customer_to_dict(c: Customer) -> dict:
    return {
        "id": c.id,
        "name_client": c.name_client,
        "firm_name": c.firm_name,
        "category_client": c.category_client,
        "address": c.address,
        "city": c.city,
        "territory": c.territory,
        "landmark": c.landmark,
        "phone": c.phone,
        "contact_person": c.contact_person,
        "tax_id": c.tax_id,
        "status": c.status,
        "login_agent": c.login_agent,
        "login_expeditor": c.login_expeditor,
        "latitude": float(c.latitude) if c.latitude is not None else None,
        "longitude": float(c.longitude) if c.longitude is not None else None,
        "PINFL": c.PINFL,
        "contract_no": c.contract_no,
        "account_no": c.account_no,
        "bank": c.bank,
        "MFO": c.MFO,
        "OKED": c.OKED,
        "VAT_code": c.VAT_code,
    }


class CustomerCreate(BaseModel):
    name_client: str | None = None
    firm_name: str | None = None
    category_client: str | None = None
    address: str | None = None
    city: str | None = None
    territory: str | None = None
    landmark: str | None = None
    phone: str | None = None
    contact_person: str | None = None
    tax_id: str | None = None
    status: str | None = None
    login_agent: str | None = None
    login_expeditor: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    PINFL: str | None = None
    contract_no: str | None = None
    account_no: str | None = None
    bank: str | None = None
    MFO: str | None = None
    OKED: str | None = None
    VAT_code: str | None = None


class CustomerUpdate(BaseModel):
    name_client: str | None = None
    firm_name: str | None = None
    category_client: str | None = None
    address: str | None = None
    city: str | None = None
    territory: str | None = None
    landmark: str | None = None
    phone: str | None = None
    contact_person: str | None = None
    tax_id: str | None = None
    status: str | None = None
    login_agent: str | None = None
    login_expeditor: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    PINFL: str | None = None
    contract_no: str | None = None
    account_no: str | None = None
    bank: str | None = None
    MFO: str | None = None
    OKED: str | None = None
    VAT_code: str | None = None


@router.get("/customers")
async def list_customers(
    search: str | None = Query(
        None,
        description="Расширенный поиск по названию клиента И по ИНН (частичное совпадение, OR)",
    ),
    name_client: str | None = Query(None, description="Поиск по названию клиента (частичное совпадение)"),
    firm_name: str | None = Query(None, description="Поиск по названию фирмы"),
    city: str | None = Query(None),
    login_agent: str | None = Query(None, description="Фильтр по агенту (логин)"),
    login_expeditor: str | None = Query(None, description="Фильтр по экспедитору (логин)"),
    phone: str | None = Query(None, description="Поиск по телефону (частичное совпадение)"),
    tax_id: str | None = Query(None, description="Поиск по ИНН (частичное совпадение)"),
    limit: int = Query(500, le=2000, description="Макс. записей в ответе"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список клиентов с поиском по ключевым полям. Без параметров не возвращает записи (нужен хотя бы один фильтр или пустой поиск — тогда первые limit по id)."""
    sql = '''SELECT c.id, c.name_client, c.firm_name, c.category_client, c.address, c.city, c.territory, c.landmark, c.phone, c.contact_person, c.tax_id, c.status, c.login_agent, c.login_expeditor, c.latitude, c.longitude, c.pinfl, c.contract_no, c.account_no, c.bank, c.mfo, c.oked, c.vat_code,
             EXISTS (SELECT 1 FROM "Sales".customer_photo cp WHERE cp.customer_id = c.id) AS has_photo
             FROM "Sales".customers c'''
    conditions = []
    params = {}
    # Расширенный поиск: одно поле search — по name_client, tax_id (ИНН), account_no (р/с)
    if search and search.strip():
        conditions.append("(name_client ILIKE :search OR tax_id ILIKE :search OR account_no ILIKE :search)")
        params["search"] = "%" + search.strip() + "%"
    if name_client and name_client.strip():
        conditions.append(" name_client ILIKE :name_client ")
        params["name_client"] = "%" + name_client.strip() + "%"
    if firm_name and firm_name.strip():
        conditions.append(" firm_name ILIKE :firm_name ")
        params["firm_name"] = "%" + firm_name.strip() + "%"
    if city and city.strip():
        conditions.append(" city ILIKE :city ")
        params["city"] = "%" + city.strip() + "%"
    if login_agent and login_agent.strip():
        conditions.append(" login_agent = :login_agent ")
        params["login_agent"] = login_agent.strip()
    if login_expeditor and login_expeditor.strip():
        conditions.append(" login_expeditor = :login_expeditor ")
        params["login_expeditor"] = login_expeditor.strip()
    if phone and phone.strip():
        conditions.append(" phone ILIKE :phone ")
        params["phone"] = "%" + phone.strip() + "%"
    if tax_id and tax_id.strip():
        conditions.append(" tax_id ILIKE :tax_id ")
        params["tax_id"] = "%" + tax_id.strip() + "%"
    if conditions:
        sql += " WHERE " + " AND ".join(conditions)
    sql += " ORDER BY c.id LIMIT :lim"
    params["lim"] = limit
    result = await session.execute(text(sql), params)
    rows = result.fetchall()
    out = []
    for r in rows:
        out.append({
            "id": r[0],
            "name_client": r[1],
            "firm_name": r[2],
            "category_client": r[3],
            "address": r[4],
            "city": r[5],
            "territory": r[6],
            "landmark": r[7],
            "phone": r[8],
            "contact_person": r[9],
            "tax_id": r[10],
            "status": r[11],
            "login_agent": r[12],
            "login_expeditor": r[13],
            "latitude": float(r[14]) if r[14] is not None else None,
            "longitude": float(r[15]) if r[15] is not None else None,
            "PINFL": r[16],
            "contract_no": r[17],
            "account_no": r[18],
            "bank": r[19],
            "MFO": r[20],
            "OKED": r[21],
            "VAT_code": r[22],
            "has_photo": bool(r[23]) if len(r) > 23 else False,
        })
    return out


EXPORT_COLUMNS = [
    "id", "name_client", "firm_name", "category_client", "address", "city", "territory", "landmark",
    "phone", "contact_person", "tax_id", "status", "login_agent", "login_expeditor",
    "latitude", "longitude", "PINFL", "contract_no", "account_no", "bank", "MFO", "OKED", "VAT_code", "has_photo",
]

# Заголовки в Excel — как в таблице (русские названия)
EXPORT_HEADERS_RU = [
    "ИД клиента", "Название клиента", "Название фирмы", "Категория клиента", "Адрес", "Город", "Территория", "Ориентир",
    "Телефон", "Контактное лицо", "ИНН", "Статус", "login агента", "login экспедитора",
    "Широта", "Долгота", "ПИНФЛ", "Договор №", "Р/С", "Банк", "МФО", "ОКЭД", "Регистрационный код плательщика НДС", "Фото",
]


@router.get("/customers/export")
async def export_customers_excel(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Выгрузка всех клиентов в Excel (.xlsx), каждое поле в отдельной ячейке. Заголовки — русские, как в таблице. Только admin."""
    sql = """SELECT c.id, c.name_client, c.firm_name, c.category_client, c.address, c.city, c.territory, c.landmark,
             c.phone, c.contact_person, c.tax_id, c.status, c.login_agent, c.login_expeditor,
             c.latitude, c.longitude, c.pinfl, c.contract_no, c.account_no, c.bank, c.mfo, c.oked, c.vat_code,
             CASE WHEN EXISTS (SELECT 1 FROM "Sales".customer_photo cp WHERE cp.customer_id = c.id) THEN 'Да' ELSE 'Нет' END
             FROM "Sales".customers c ORDER BY c.id LIMIT 50000"""
    result = await session.execute(text(sql))
    rows = result.fetchall()
    wb = Workbook()
    ws = wb.active
    ws.title = "Клиенты"
    for col, name in enumerate(EXPORT_HEADERS_RU, start=1):
        ws.cell(row=1, column=col, value=name)
    for row_idx, r in enumerate(rows, start=2):
        for col_idx, val in enumerate(r, start=1):
            if val is None:
                cell_val = ""
            elif isinstance(val, (int, float)):
                cell_val = val
            else:
                cell_val = str(val)
            ws.cell(row=row_idx, column=col_idx, value=cell_val)
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return Response(
        content=buf.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="clients.xlsx"'},
    )


def _parse_float(s: str | None):
    if not s or not s.strip():
        return None
    try:
        return float(s.strip().replace(",", "."))
    except ValueError:
        return None


@router.post("/customers/import")
async def import_customers_csv(
    file: UploadFile = File(..., description="CSV файл (разделитель ;), структура как в выгрузке"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Загрузка клиентов из CSV. Только admin. Формат: как у export (id;name_client;...)."""
    if not file.filename or not (file.filename.lower().endswith(".csv") or file.filename.lower().endswith(".txt")):
        raise HTTPException(status_code=400, detail="Нужен файл .csv или .txt")
    content = await file.read()
    try:
        text_content = content.decode("utf-8-sig") or content.decode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Неверная кодировка файла (нужен UTF-8)")
    buf = io.StringIO(text_content)
    reader = csv.reader(buf, delimiter=";")
    rows = list(reader)
    if not rows:
        return {"message": "Файл пуст", "created": 0, "updated": 0}
    header = rows[0]
    if header and header[0] == "id" and "name_client" in (h.strip().lower() for h in header):
        data_rows = rows[1:]
    else:
        data_rows = rows
    created = 0
    updated = 0
    col_count = len(EXPORT_COLUMNS)
    for row in data_rows:
        if not row or len(row) < 2:
            continue
        values = (row + [""] * col_count)[:col_count]
        row_id = values[0].strip() if values[0] else ""
        try:
            pk = int(row_id) if row_id.isdigit() else None
        except ValueError:
            pk = None
        lat = _parse_float(values[14])
        lon = _parse_float(values[15])
        def _v(i):
            x = values[i] if i < len(values) else ""
            return x.strip() if x else None
        if pk:
            result = await session.execute(select(Customer).where(Customer.id == pk))
            existing = result.scalar_one_or_none()
            if existing:
                existing.name_client = _v(1) or existing.name_client
                existing.firm_name = _v(2) or existing.firm_name
                existing.category_client = _v(3)
                existing.address = _v(4)
                existing.city = _v(5)
                existing.territory = _v(6)
                existing.landmark = _v(7)
                existing.phone = _v(8)
                existing.contact_person = _v(9)
                existing.tax_id = _v(10)
                existing.status = _v(11) or existing.status
                existing.login_agent = _v(12)
                existing.login_expeditor = _v(13)
                existing.latitude = Decimal(str(lat)) if lat is not None else existing.latitude
                existing.longitude = Decimal(str(lon)) if lon is not None else existing.longitude
                existing.PINFL = _v(16)
                existing.contract_no = _v(17)
                existing.account_no = _v(18)
                existing.bank = _v(19)
                existing.MFO = _v(20)
                existing.OKED = _v(21)
                existing.VAT_code = _v(22)
                updated += 1
                continue
        c = Customer(
            name_client=_v(1),
            firm_name=_v(2),
            category_client=_v(3),
            address=_v(4),
            city=_v(5),
            territory=_v(6),
            landmark=_v(7),
            phone=_v(8),
            contact_person=_v(9),
            tax_id=_v(10),
            status=_v(11) or "Активный",
            login_agent=_v(12),
            login_expeditor=_v(13),
            latitude=Decimal(str(lat)) if lat is not None else None,
            longitude=Decimal(str(lon)) if lon is not None else None,
            PINFL=_v(16),
            contract_no=_v(17),
            account_no=_v(18),
            bank=_v(19),
            MFO=_v(20),
            OKED=_v(21),
            VAT_code=_v(22),
        )
        session.add(c)
        created += 1
    await session.commit()
    return {"message": "Импорт выполнен", "created": created, "updated": updated}


@router.post("/customers")
async def create_customer(
    body: CustomerCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Добавить клиента. Admin или Agent."""
    if user.role not in ("admin", "agent"):
        raise HTTPException(status_code=403, detail="Только admin или agent могут создавать клиентов")
    c = Customer(
        name_client=body.name_client,
        firm_name=body.firm_name,
        category_client=body.category_client,
        address=body.address,
        city=body.city,
        territory=body.territory,
        landmark=body.landmark,
        phone=body.phone,
        contact_person=body.contact_person,
        tax_id=body.tax_id,
        status=body.status or "Активный",
        login_agent=body.login_agent,
        login_expeditor=body.login_expeditor,
        latitude=body.latitude,
        longitude=body.longitude,
        PINFL=body.PINFL,
        contract_no=body.contract_no,
        account_no=body.account_no,
        bank=body.bank,
        MFO=body.MFO,
        OKED=body.OKED,
        VAT_code=body.VAT_code,
    )
    session.add(c)
    await session.commit()
    await session.refresh(c)
    return _customer_to_dict(c)


@router.get("/customers/{customer_id}/visits")
async def list_customer_visits(
    customer_id: int,
    limit: int = Query(100, le=500),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список визитов клиента."""
    r = await session.execute(select(Customer).where(Customer.id == customer_id))
    if r.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    r2 = await session.execute(
        select(CustomerVisit, User.fio)
        .outerjoin(User, CustomerVisit.responsible_login == User.login)
        .where(CustomerVisit.customer_id == customer_id)
        .order_by(CustomerVisit.visit_date.desc(), CustomerVisit.visit_time.desc().nullslast())
        .limit(limit)
    )
    rows = r2.all()
    out = []
    for v, resp_fio in rows:
        out.append({
            "id": v.id,
            "visit_date": v.visit_date.isoformat() if v.visit_date else None,
            "visit_time": v.visit_time.strftime("%H:%M") if v.visit_time else None,
            "status": v.status,
            "responsible_login": v.responsible_login,
            "responsible_name": resp_fio or v.responsible_login or "",
            "comment": v.comment,
        })
    return out


class VisitCreateBody(BaseModel):
    visit_date: str
    visit_time: str | None = None
    status: str = "planned"
    responsible_login: str | None = None
    comment: str | None = None


@router.post("/customers/{customer_id}/visits")
async def create_customer_visit(
    customer_id: int,
    body: VisitCreateBody,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Создать визит для клиента."""
    r = await session.execute(select(Customer).where(Customer.id == customer_id))
    if r.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    try:
        visit_date = date.fromisoformat(body.visit_date[:10])
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Некорректная дата визита")
    visit_time = None
    if body.visit_time and body.visit_time.strip():
        s = body.visit_time.strip()[:8]
        parts = s.split(":")
        if len(parts) >= 2:
            try:
                h, m = int(parts[0]), int(parts[1])
                visit_time = time(h, m, int(parts[2]) if len(parts) > 2 else 0)
            except (ValueError, TypeError, IndexError):
                pass
    v = CustomerVisit(
        customer_id=customer_id,
        visit_date=visit_date,
        visit_time=visit_time,
        status=body.status or "planned",
        responsible_login=body.responsible_login or None,
        comment=body.comment or None,
        created_by=user.login,
    )
    session.add(v)
    await session.commit()
    await session.refresh(v)
    return {"id": v.id, "visit_date": body.visit_date, "status": v.status, "message": "created"}


@router.get("/customers/{customer_id}")
async def get_customer(
    customer_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Получить клиента по id."""
    result = await session.execute(select(Customer).where(Customer.id == customer_id))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return _customer_to_dict(c)


@router.get("/customers/{customer_id}/balance")
async def get_customer_balance(
    customer_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Баланс клиента: сумма неоплаченных доставок (что должен). ТЗ."""
    result = await session.execute(select(Customer).where(Customer.id == customer_id))
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    r = await session.execute(
        text('''
            SELECT COALESCE(SUM(amount), 0) FROM "Sales".operations
            WHERE customer_id = :cid AND type_code = 'delivery' AND status = 'pending'
        '''),
        {"cid": customer_id},
    )
    row = r.fetchone()
    balance = float(row[0]) if row and row[0] is not None else 0
    return {"success": True, "customer_id": customer_id, "balance": balance, "currency": "сум"}


@router.patch("/customers/{customer_id}")
async def update_customer(
    customer_id: int,
    body: CustomerUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Изменить клиента. Admin — все поля; агент/экспедитор — только login_agent и login_expeditor (при сохранении заказа)."""
    result = await session.execute(select(Customer).where(Customer.id == customer_id))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    dump = body.model_dump(exclude_unset=True)
    if (user.role or "").lower() != "admin":
        # Агент/экспедитор может менять только привязку агента и экспедитора у клиента
        allowed = {"login_agent", "login_expeditor"}
        dump = {k: v for k, v in dump.items() if k in allowed}
    for key, value in dump.items():
        setattr(c, key, value)
    await session.commit()
    await session.refresh(c)
    return _customer_to_dict(c)


@router.delete("/customers/{customer_id}")
async def delete_customer(
    customer_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Удалить клиента. Только admin."""
    result = await session.execute(select(Customer).where(Customer.id == customer_id))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    await session.delete(c)
    await session.commit()
    return {"id": customer_id, "message": "deleted"}
