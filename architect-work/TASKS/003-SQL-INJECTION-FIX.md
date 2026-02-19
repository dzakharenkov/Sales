# Task: Fix SQL Injection Risks in Raw Queries

**Task ID:** 003
**Category:** Setup / Security
**Priority:** CRITICAL
**Status:** COMPLETED
**Estimated Time:** 4 hours
**Dependencies:** 001

---

## Description

Several API routers use `text()` queries with f-strings that interpolate user-provided values directly into SQL. This creates SQL injection vulnerabilities. All raw SQL queries must use parameterized placeholders (`:param_name` syntax with SQLAlchemy `text()`).

**Files to audit:**
- `src/api/v1/routers/customers.py`
- `src/api/v1/routers/orders.py`
- `src/api/v1/routers/operations.py`
- `src/api/v1/routers/reports.py`
- `src/api/v1/routers/visits.py`
- `src/api/v1/routers/finances.py`

---

## Acceptance Criteria

- [ ] All `text()` queries use `:param` placeholders, never f-strings with user data
- [ ] All `text()` queries pass params via `.bindparams()` or the `params={}` argument
- [ ] Audit complete — every router file reviewed, findings documented
- [ ] No `f"...{variable}..."` patterns inside `text()` calls remain
- [ ] Search filter inputs (search strings) are properly escaped or parameterized

---

## Technical Details

### Dangerous Pattern (find and fix):

```python
# VULNERABLE — SQL INJECTION:
search = request.query_params.get("search", "")
query = text(f"""
    SELECT * FROM "Sales".customers
    WHERE name_client ILIKE '%{search}%'
""")

# ALSO VULNERABLE:
status = filter_params.get("status")
query = text(f"SELECT * FROM ... WHERE status = '{status}'")
```

### Safe Pattern:

```python
# SAFE — parameterized:
search = request.query_params.get("search", "")
query = text("""
    SELECT * FROM "Sales".customers
    WHERE name_client ILIKE :search
    OR firm_name ILIKE :search
""").bindparams(search=f"%{search}%")

# OR using execute with params dict:
result = await db.execute(
    text("SELECT * FROM ... WHERE status = :status"),
    {"status": status}
)
```

### Full audit checklist — search for these patterns:

```bash
# Find all potentially vulnerable patterns:
grep -rn "text(f\"" src/api/
grep -rn 'text(f'"'"'' src/api/
grep -rn "% search" src/api/
grep -rn "ILIKE '%" src/api/
```

### LIKE pattern escaping:

```python
def escape_like(value: str) -> str:
    """Escape special characters in LIKE patterns."""
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

# Usage:
safe_search = escape_like(search)
query = text("... WHERE name ILIKE :search ESCAPE '\\'")
params = {"search": f"%{safe_search}%"}
```

---

## Testing Requirements

- Test each affected endpoint with SQL injection payloads:
  - `'; DROP TABLE customers; --`
  - `' OR '1'='1`
  - `%' AND 1=CAST((SELECT password FROM users WHERE login='admin') AS INT) AND '%`
- All payloads should return normal empty results or 400 errors, not DB errors
- Verify search still works correctly with legitimate input containing `%` and `_`

---

## Related Documentation

- [TECHNICAL_DESIGN.md — Error Handling](../TECHNICAL_DESIGN.md)
- [CURRENT_STATE.md — Code Quality Issues](../CURRENT_STATE.md)
- OWASP SQL Injection Prevention Cheat Sheet
