# Task: Cities & Territories CRUD API

**Task ID:** 011
**Category:** Feature
**Priority:** HIGH
**Status:** COMPLETED
**Estimated Time:** 4 hours
**Dependencies:** 007 (response schemas), 005 (Alembic â€” to verify tables exist)

---

## Description

The `cities` and `territories` tables were created via migration (`migrations/add_cities_territories_menu.sql`) but have no API endpoints. The `customers` table references `city_id` and `territory_id` but there's no way to manage this reference data through the API. Implement full CRUD for both entities and update the dictionary router.

---

## Acceptance Criteria

- [x] `GET /api/v1/dictionary/cities` returns all cities (id, name, region)
- [x] `POST /api/v1/dictionary/cities` creates a new city (admin only)
- [x] `PUT /api/v1/dictionary/cities/{id}` updates city (admin only)
- [x] `DELETE /api/v1/dictionary/cities/{id}` deletes city (admin only)
- [x] Same four endpoints for `/territories`
- [x] `GET /api/v1/dictionary/cities/{id}/territories` returns territories for a city
- [x] Customer create/update API accepts `city_id` and `territory_id` and validates they exist
- [x] Frontend dropdowns for city and territory populated from API
- [x] Telegram bot customer creation flow uses cities/territories selection

---

## Technical Details

### Verify/Create Table Schema

```sql
-- Verify tables exist (from migration):
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'Sales' AND table_name IN ('cities', 'territories');

-- Expected structure (from migration file):
CREATE TABLE "Sales".cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    active BOOLEAN DEFAULT true
);

CREATE TABLE "Sales".territories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city_id INTEGER REFERENCES "Sales".cities(id),
    active BOOLEAN DEFAULT true
);
```

### Add to `src/database/models.py`

```python
class City(Base):
    __tablename__ = "cities"
    __table_args__ = {"schema": "Sales"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    region: Mapped[Optional[str]] = mapped_column(String(255))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Territory(Base):
    __tablename__ = "territories"
    __table_args__ = {"schema": "Sales"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    city_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("Sales.cities.id"))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
```

### Add Schemas to `src/api/v1/schemas/dictionary.py`

```python
class CityResponse(BaseModel):
    id: int
    name: str
    region: Optional[str] = None
    active: bool = True
    model_config = {"from_attributes": True}

class CityCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    region: Optional[str] = None

class TerritoryResponse(BaseModel):
    id: int
    name: str
    city_id: Optional[int] = None
    active: bool = True
    model_config = {"from_attributes": True}

class TerritoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    city_id: Optional[int] = None
```

### Add Endpoints to `src/api/v1/routers/dictionary.py`

```python
# Cities
@router.get("/cities", response_model=list[CityResponse])
async def get_cities(active_only: bool = True, db = Depends(get_db)):
    query = text("""
        SELECT id, name, region, active FROM "Sales".cities
        WHERE (:active_only = false OR active = true)
        ORDER BY name
    """).bindparams(active_only=active_only)
    rows = (await db.execute(query)).mappings().fetchall()
    return [CityResponse.model_validate(dict(r)) for r in rows]


@router.post("/cities", response_model=CityResponse, status_code=201)
async def create_city(
    body: CityCreate,
    current_user = Depends(require_admin),
    db = Depends(get_db),
):
    query = text("""
        INSERT INTO "Sales".cities (name, region)
        VALUES (:name, :region)
        RETURNING id, name, region, active
    """).bindparams(name=body.name, region=body.region)
    row = (await db.execute(query)).mappings().fetchone()
    await db.commit()
    return CityResponse.model_validate(dict(row))


# Similar for PUT, DELETE, and Territory endpoints
```

### Frontend Updates

```javascript
// Add city/territory dropdowns in customer form:
async function loadCities() {
    const resp = await authFetch('/api/v1/dictionary/cities');
    const cities = await resp.json();
    const select = document.getElementById('customer-city');
    select.innerHTML = '<option value="">â€” Ð“Ð¾Ñ€Ð¾Ð´ â€”</option>';
    cities.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
}

// Load territories when city selected:
document.getElementById('customer-city').addEventListener('change', async (e) => {
    const cityId = e.target.value;
    const resp = await authFetch(`/api/v1/dictionary/cities/${cityId}/territories`);
    const territories = await resp.json();
    // Populate territory dropdown
});
```

---

## Testing Requirements

- `GET /dictionary/cities` returns list with correct fields
- `POST /dictionary/cities` as admin creates city, returns 201
- `POST /dictionary/cities` as non-admin returns 403
- `GET /dictionary/cities/1/territories` returns territories for city 1
- Create customer with `city_id` from cities list â€” succeeds
- Create customer with invalid `city_id=99999` â€” returns 400 or FK error

---

## Related Documentation

- [TECHNICAL_DESIGN.md â€” Database Design](../TECHNICAL_DESIGN.md)
- Migration file: `migrations/add_cities_territories_menu.sql`

