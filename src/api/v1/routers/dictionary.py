"""
Справочники: товары (CRUD), типы продукции, склады, типы оплат, валюта.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import Product, ProductType, Warehouse, PaymentType, User, Currency
from src.core.deps import get_current_user, require_admin

router = APIRouter()


@router.get("/user-logins")
async def list_user_logins(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список логинов и ФИО пользователей для выпадающих списков (кладовщик, агент, экспедитор)."""
    result = await session.execute(select(User).order_by(User.login))
    rows = result.scalars().all()
    return [{"login": u.login, "fio": u.fio or "", "role": u.role or ""} for u in rows]


# --- Товары: чтение (доступно авторизованным) ---

@router.get("/products")
async def list_products(
    type_id: str | None = Query(None, description="Тип: Yogurt, Tvorog, Tara"),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список товаров. Требуется авторизация. Сортировка по коду: числовая (1,2,...,10,11), затем текстовая."""
    q = select(Product).where(Product.active == True)
    if type_id:
        q = q.where(Product.type_id == type_id)
    result = await session.execute(q)
    rows = result.scalars().all()

    def _sort_key(p):
        code = p.code or ""
        if code.isdigit():
            return (0, int(code), code)
        return (1, 999999999, code)

    rows = sorted(rows, key=_sort_key)

    return [
        {
            "code": p.code,
            "name": p.name,
            "type_id": p.type_id,
            "weight_g": p.weight_g,
            "unit": p.unit,
            "price": float(p.price) if p.price is not None else None,
            "expiry_days": p.expiry_days,
            "active": p.active,
            "currency_code": getattr(p, "currency_code", None),
        }
        for p in rows
    ]


@router.get("/products/next-code")
async def get_next_product_code(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Следующий код товара по инкременту: макс. числовой код + 1 (21, 22, ...). Учитываются все товары в БД."""
    result = await session.execute(select(Product.code))
    all_codes = [r[0] or "" for r in result.fetchall()]
    numeric_codes = [int(c) for c in all_codes if isinstance(c, str) and c.isdigit()]
    next_num = max(numeric_codes, default=0) + 1
    return {"next_code": str(next_num)}


@router.get("/products/types")
async def list_product_types(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Типы продукции (Yogurt, Tvorog, Tara)."""
    result = await session.execute(select(ProductType).order_by(ProductType.name))
    types = result.scalars().all()
    return [{"name": t.name, "description": t.description} for t in types]


class ProductTypeCreate(BaseModel):
    name: str
    description: str | None = None


class ProductTypeUpdate(BaseModel):
    description: str | None = None


@router.post("/products/types")
async def create_product_type(
    body: ProductTypeCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Добавить тип продукции. Только admin."""
    result = await session.execute(select(ProductType).where(ProductType.name == body.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Тип продукции с таким названием уже существует")
    pt = ProductType(name=body.name, description=body.description or "")
    session.add(pt)
    await session.commit()
    await session.refresh(pt)
    return {"name": pt.name, "message": "created"}


@router.put("/products/types/{name}")
async def update_product_type(
    name: str,
    body: ProductTypeUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Изменить тип продукции. Только admin."""
    result = await session.execute(select(ProductType).where(ProductType.name == name))
    pt = result.scalar_one_or_none()
    if not pt:
        raise HTTPException(status_code=404, detail="Тип продукции не найден")
    if body.description is not None:
        pt.description = body.description
    await session.commit()
    await session.refresh(pt)
    return {"name": pt.name, "message": "updated"}


@router.delete("/products/types/{name}")
async def delete_product_type(
    name: str,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Удалить тип продукции. Только admin. Не удалит, если есть товары с этим типом."""
    result = await session.execute(select(ProductType).where(ProductType.name == name))
    pt = result.scalar_one_or_none()
    if not pt:
        raise HTTPException(status_code=404, detail="Тип продукции не найден")
    # Проверка: есть ли товары с этим типом
    result2 = await session.execute(select(Product).where(Product.type_id == name))
    if result2.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Нельзя удалить: есть товары с этим типом")
    await session.delete(pt)
    await session.commit()
    return {"name": name, "message": "deleted"}


@router.get("/payment-types")
async def list_payment_types(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Типы оплаты (наличные, безнал, карта)."""
    result = await session.execute(select(PaymentType).order_by(PaymentType.code))
    rows = result.scalars().all()
    return [{"code": r.code, "name": r.name, "description": r.description} for r in rows]


class PaymentTypeCreate(BaseModel):
    code: str
    name: str
    description: str | None = None


class PaymentTypeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


@router.post("/payment-types")
async def create_payment_type(
    body: PaymentTypeCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Добавить тип оплаты. Только admin."""
    result = await session.execute(select(PaymentType).where(PaymentType.code == body.code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Тип оплаты с таким кодом уже существует")
    pt = PaymentType(code=body.code, name=body.name, description=body.description)
    session.add(pt)
    await session.commit()
    await session.refresh(pt)
    return {"code": pt.code, "name": pt.name, "message": "created"}


@router.put("/payment-types/{code}")
async def update_payment_type(
    code: str,
    body: PaymentTypeUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Изменить тип оплаты. Только admin."""
    result = await session.execute(select(PaymentType).where(PaymentType.code == code))
    pt = result.scalar_one_or_none()
    if not pt:
        raise HTTPException(status_code=404, detail="Тип оплаты не найден")
    if body.name is not None:
        pt.name = body.name
    if body.description is not None:
        pt.description = body.description
    await session.commit()
    await session.refresh(pt)
    return {"code": pt.code, "message": "updated"}


@router.delete("/payment-types/{code}")
async def delete_payment_type(
    code: str,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Удалить тип оплаты. Только admin."""
    result = await session.execute(select(PaymentType).where(PaymentType.code == code))
    pt = result.scalar_one_or_none()
    if not pt:
        raise HTTPException(status_code=404, detail="Тип оплаты не найден")
    await session.delete(pt)
    await session.commit()
    return {"code": code, "message": "deleted"}


# --- Валюта ---


@router.get("/currencies")
async def list_currencies(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Справочник валют: код, название, страна, символ, признак валюты по умолчанию."""
    result = await session.execute(select(Currency).order_by(Currency.code))
    rows = result.scalars().all()
    return [
        {
            "code": c.code,
            "name": c.name,
            "country": c.country,
            "symbol": c.symbol,
            "is_default": bool(c.is_default),
        }
        for c in rows
    ]


class CurrencyCreate(BaseModel):
    code: str
    name: str
    country: str | None = None
    symbol: str | None = None
    is_default: bool | None = False


class CurrencyUpdate(BaseModel):
    name: str | None = None
    country: str | None = None
    symbol: str | None = None
    is_default: bool | None = None


@router.post("/currencies")
async def create_currency(
    body: CurrencyCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Добавить валюту. Только admin."""
    code = body.code.strip()
    result = await session.execute(select(Currency).where(Currency.code == code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Валюта с таким кодом уже существует")
    if body.is_default:
        # Сбрасываем флаг у других валют
        await session.execute(Currency.__table__.update().values(is_default=False))
    cur = Currency(
        code=code,
        name=body.name.strip(),
        country=(body.country or "").strip() or None,
        symbol=(body.symbol or "").strip() or None,
        is_default=bool(body.is_default),
    )
    session.add(cur)
    await session.commit()
    await session.refresh(cur)
    return {"code": cur.code, "message": "created"}


@router.put("/currencies/{code}")
async def update_currency(
    code: str,
    body: CurrencyUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Изменить валюту. Только admin."""
    result = await session.execute(select(Currency).where(Currency.code == code))
    cur = result.scalar_one_or_none()
    if not cur:
        raise HTTPException(status_code=404, detail="Валюта не найдена")
    if body.name is not None:
        cur.name = body.name.strip()
    if body.country is not None:
        cur.country = body.country.strip() or None
    if body.symbol is not None:
        cur.symbol = body.symbol.strip() or None
    if body.is_default is not None:
        if body.is_default:
            await session.execute(Currency.__table__.update().values(is_default=False))
        cur.is_default = bool(body.is_default)
    await session.commit()
    await session.refresh(cur)
    return {"code": cur.code, "message": "updated"}


@router.delete("/currencies/{code}")
async def delete_currency(
    code: str,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Удалить валюту. Только admin. Не удалит, если есть товары с этой валютой."""
    result = await session.execute(select(Currency).where(Currency.code == code))
    cur = result.scalar_one_or_none()
    if not cur:
        raise HTTPException(status_code=404, detail="Валюта не найдена")
    # Проверка использования в товарах
    prod = await session.execute(select(Product).where(Product.currency_code == code))
    if prod.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Нельзя удалить: есть товары с этой валютой")
    await session.delete(cur)
    await session.commit()
    return {"code": code, "message": "deleted"}


@router.get("/warehouses")
async def list_warehouses(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список складов."""
    result = await session.execute(select(Warehouse).order_by(Warehouse.code))
    rows = result.scalars().all()
    return [
        {
            "code": w.code,
            "name": w.name,
            "type": w.type,
            "storekeeper": w.storekeeper,
            "agent": w.agent,
            "expeditor_login": getattr(w, "expeditor_login", None),
        }
        for w in rows
    ]


class WarehouseCreate(BaseModel):
    code: str
    name: str
    type: str | None = None
    storekeeper: str | None = None
    agent: str | None = None
    expeditor_login: str | None = None


class WarehouseUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    storekeeper: str | None = None
    agent: str | None = None
    expeditor_login: str | None = None


async def _check_user_logins(
    session: AsyncSession,
    storekeeper: str | None,
    agent: str | None,
    expeditor_login: str | None,
) -> None:
    """Проверить, что логины кладовщика, агента и экспедитора существуют в users. Иначе HTTPException."""
    if storekeeper:
        r = await session.execute(select(User).where(User.login == storekeeper))
        if not r.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Кладовщик: пользователь с логином «{storekeeper}» не найден")
    if agent:
        r = await session.execute(select(User).where(User.login == agent))
        if not r.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Агент: пользователь с логином «{agent}» не найден")
    if expeditor_login:
        # Проверяем только существование логина; роль expeditor контролируется на уровне UI
        r = await session.execute(select(User).where(User.login == expeditor_login))
        if not r.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail=f"Экспедитор: пользователь с логином «{expeditor_login}» не найден",
            )


@router.post("/warehouses")
async def create_warehouse(
    body: WarehouseCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Добавить склад. Только admin. Кладовщик, агент и экспедитор — логины из таблицы users."""
    await _check_user_logins(
        session, body.storekeeper or None, body.agent or None, body.expeditor_login or None
    )
    result = await session.execute(select(Warehouse).where(Warehouse.code == body.code))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Код склада уже существует")
    w = Warehouse(
        code=body.code,
        name=body.name,
        type=body.type,
        storekeeper=body.storekeeper or None,
        agent=body.agent or None,
        expeditor_login=body.expeditor_login or None,
    )
    session.add(w)
    await session.commit()
    await session.refresh(w)
    return {"code": w.code, "name": w.name, "message": "created"}


@router.put("/warehouses/{code}")
async def update_warehouse(
    code: str,
    body: WarehouseUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Изменить склад. Только admin. Кладовщик, агент и экспедитор — логины из users."""
    await _check_user_logins(session, body.storekeeper, body.agent, body.expeditor_login)
    result = await session.execute(select(Warehouse).where(Warehouse.code == code))
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Склад не найден")
    if body.name is not None:
        w.name = body.name
    if body.type is not None:
        w.type = body.type
    if body.storekeeper is not None:
        w.storekeeper = body.storekeeper or None
    if body.agent is not None:
        w.agent = body.agent or None
    if body.expeditor_login is not None:
        w.expeditor_login = body.expeditor_login or None
    await session.commit()
    await session.refresh(w)
    return {"code": w.code, "message": "updated"}


@router.delete("/warehouses/{code}")
async def delete_warehouse(
    code: str,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Удалить склад. Только admin."""
    result = await session.execute(select(Warehouse).where(Warehouse.code == code))
    w = result.scalar_one_or_none()
    if not w:
        raise HTTPException(status_code=404, detail="Склад не найден")
    await session.delete(w)
    await session.commit()
    return {"code": code, "message": "deleted"}


# --- Товары: создание, изменение, удаление (только admin) ---

class ProductCreate(BaseModel):
    code: str | None = None  # если не передан — назначается автоинкремент по данным в БД (20, 21, 22, ...)
    name: str
    type_id: str | None = None
    weight_g: int | None = None
    unit: str | None = None
    price: float | None = None
    expiry_days: int | None = None
    currency_code: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    type_id: str | None = None
    weight_g: int | None = None
    unit: str | None = None
    price: float | None = None
    expiry_days: int | None = None
    active: bool | None = None
    currency_code: str | None = None


@router.post("/products")
async def create_product(
    body: ProductCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Добавить товар. Только admin. Код можно не передавать — тогда назначается следующий по счёту (20, 21, 22, ...)."""
    if body.code and body.code.strip():
        code = body.code.strip()
        result = await session.execute(select(Product).where(Product.code == code))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Код товара уже существует")
    else:
        result = await session.execute(select(Product.code))
        all_codes = [r[0] or "" for r in result.fetchall()]
        numeric_codes = [int(c) for c in all_codes if isinstance(c, str) and c.isdigit()]
        code = str(max(numeric_codes, default=0) + 1)
    product = Product(
        code=code,
        name=body.name,
        type_id=body.type_id,
        weight_g=body.weight_g,
        unit=body.unit or "ШТ",
        price=body.price,
        expiry_days=body.expiry_days,
        active=True,
        last_updated_by_login=user.login,
        currency_code=body.currency_code or "sum",
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return {"code": product.code, "name": product.name, "message": "created"}


@router.put("/products/{code}")
async def update_product(
    code: str,
    body: ProductUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Изменить товар. Только admin."""
    result = await session.execute(select(Product).where(Product.code == code))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if body.name is not None:
        product.name = body.name
    if body.type_id is not None:
        product.type_id = body.type_id
    if body.weight_g is not None:
        product.weight_g = body.weight_g
    if body.unit is not None:
        product.unit = body.unit
    if body.price is not None:
        product.price = body.price
    if body.expiry_days is not None:
        product.expiry_days = body.expiry_days
    if body.active is not None:
        product.active = body.active
    if body.currency_code is not None:
        product.currency_code = body.currency_code or None
    if getattr(product, "currency_code", None) is None:
        product.currency_code = "sum"
    product.last_updated_by_login = user.login
    await session.commit()
    await session.refresh(product)
    return {"code": product.code, "name": product.name, "message": "updated"}


@router.delete("/products/{code}")
async def delete_product(
    code: str,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Удалить товар (деактивация active=false). Только admin."""
    result = await session.execute(select(Product).where(Product.code == code))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.active = False
    product.last_updated_by_login = user.login
    await session.commit()
    return {"code": code, "message": "deactivated"}


# --- Города (справочник) ---

@router.get("/cities")
async def list_cities(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список городов для выбора в форме клиента."""
    result = await session.execute(
        text('SELECT id, name, is_active FROM "Sales".cities WHERE is_active = TRUE ORDER BY name')
    )
    rows = result.fetchall()
    return [{"id": r[0], "name": r[1], "is_active": r[2]} for r in rows]


class CityCreate(BaseModel):
    name: str


@router.post("/cities")
async def create_city(
    body: CityCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Добавить город. Только admin."""
    name = (body.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Название города обязательно")

    result = await session.execute(
        text('INSERT INTO "Sales".cities (name) VALUES (:name) RETURNING id, name'),
        {"name": name},
    )
    await session.commit()
    row = result.fetchone()
    return {"id": row[0], "name": row[1], "message": "created"}


@router.put("/cities/{city_id}")
async def update_city(
    city_id: int,
    body: CityCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Обновить город. Только admin."""
    name = (body.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Название города обязательно")

    r = await session.execute(
        text('UPDATE "Sales".cities SET name = :name, updated_at = CURRENT_TIMESTAMP WHERE id = :id'),
        {"id": city_id, "name": name},
    )
    await session.commit()
    if r.rowcount == 0:
        raise HTTPException(status_code=404, detail="Город не найден")
    return {"id": city_id, "name": name, "message": "updated"}


@router.delete("/cities/{city_id}")
async def delete_city(
    city_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Удалить город (логическое удаление). Только admin."""
    r = await session.execute(
        text('UPDATE "Sales".cities SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = :id'),
        {"id": city_id},
    )
    await session.commit()
    if r.rowcount == 0:
        raise HTTPException(status_code=404, detail="Город не найден")
    return {"id": city_id, "message": "deleted"}


# --- Территории (справочник) ---

@router.get("/territories")
async def list_territories(
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список территорий для выбора в форме клиента."""
    result = await session.execute(
        text('SELECT id, name, is_active FROM "Sales".territories WHERE is_active = TRUE ORDER BY name')
    )
    rows = result.fetchall()
    return [{"id": r[0], "name": r[1], "is_active": r[2]} for r in rows]


class TerritoryCreate(BaseModel):
    name: str


@router.post("/territories")
async def create_territory(
    body: TerritoryCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Добавить территорию. Только admin."""
    name = (body.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Название территории обязательно")

    result = await session.execute(
        text('INSERT INTO "Sales".territories (name) VALUES (:name) RETURNING id, name'),
        {"name": name},
    )
    await session.commit()
    row = result.fetchone()
    return {"id": row[0], "name": row[1], "message": "created"}


@router.put("/territories/{territory_id}")
async def update_territory(
    territory_id: int,
    body: TerritoryCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Обновить территорию. Только admin."""
    name = (body.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Название территории обязательно")

    r = await session.execute(
        text('UPDATE "Sales".territories SET name = :name, updated_at = CURRENT_TIMESTAMP WHERE id = :id'),
        {"id": territory_id, "name": name},
    )
    await session.commit()
    if r.rowcount == 0:
        raise HTTPException(status_code=404, detail="Территория не найдена")
    return {"id": territory_id, "name": name, "message": "updated"}


@router.delete("/territories/{territory_id}")
async def delete_territory(
    territory_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    """Удалить территорию (логическое удаление). Только admin."""
    r = await session.execute(
        text('UPDATE "Sales".territories SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = :id'),
        {"id": territory_id},
    )
    await session.commit()
    if r.rowcount == 0:
        raise HTTPException(status_code=404, detail="Территория не найдена")
    return {"id": territory_id, "message": "deleted"}
