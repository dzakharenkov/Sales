# Task: Fix Async File I/O for Photo Uploads

**Task ID:** 022
**Category:** Architecture / Performance
**Priority:** MEDIUM
**Status:** NOT STARTED
**Estimated Time:** 2 hours
**Dependencies:** 009 (settings)

---

## Description

Photo upload endpoints use synchronous `open()` and `write()` file operations inside async handlers. This blocks the entire async event loop during file writes, preventing other requests from being processed. Replace with `aiofiles` for true async file I/O.

---

## Acceptance Criteria

- [x] `aiofiles` added to `requirements.txt`
- [x] All `open()` calls in `customer_photos.py` replaced with `await aiofiles.open()`
- [x] File size limit enforced (max 10MB per photo)
- [x] File type validation (only JPEG, PNG, WEBP allowed)
- [x] Cleanup of temp files on upload failure
- [x] Upload directory created if it doesn't exist (on startup)

---

## Technical Details

### Add to `requirements.txt`

```
aiofiles>=23.2.1
```

### Current Pattern (Blocking)

```python
# src/api/v1/routers/customer_photos.py
# BLOCKING â€” halts event loop during file write:
with open(file_path, "wb") as f:
    f.write(await photo.read())
```

### Fixed Pattern (Async)

```python
import aiofiles
import os
from pathlib import Path
from fastapi import UploadFile, HTTPException

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


async def save_photo(file: UploadFile, destination: Path) -> int:
    """Save uploaded file asynchronously. Returns file size in bytes."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"ÐÐµÐ²ÐµÑ€Ð½Ñ‹Ð¹ Ñ‚Ð¸Ð¿ Ñ„Ð°Ð¹Ð»Ð°. Ð Ð°Ð·Ñ€ÐµÑˆÐµÐ½Ñ‹: JPEG, PNG, WEBP"
        )

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="ÐÐµÐ²ÐµÑ€Ð½Ð¾Ðµ Ñ€Ð°ÑÑˆÐ¸Ñ€ÐµÐ½Ð¸Ðµ Ñ„Ð°Ð¹Ð»Ð°")

    # Read first to check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Ð¤Ð°Ð¹Ð» ÑÐ»Ð¸ÑˆÐºÐ¾Ð¼ Ð±Ð¾Ð»ÑŒÑˆÐ¾Ð¹. ÐœÐ°ÐºÑÐ¸Ð¼ÑƒÐ¼: 10MB"
        )

    # Ensure directory exists
    destination.parent.mkdir(parents=True, exist_ok=True)

    # Write asynchronously
    async with aiofiles.open(destination, "wb") as f:
        await f.write(content)

    return len(content)


# Updated upload endpoint:
@router.post("/customer-photos", status_code=201)
async def upload_photo(
    customer_id: int = Form(...),
    photo: UploadFile = File(...),
    db = Depends(get_db),
    current_user = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
):
    # Build filename
    from datetime import datetime
    timestamp = datetime.now().strftime("%d%m%Y_%H%M%S")
    ext = Path(photo.filename).suffix.lower()
    filename = f"{customer_id}_{timestamp}{ext}"
    file_path = Path(settings.upload_dir) / filename

    # Save file
    file_size = await save_photo(photo, file_path)

    # Save record to DB
    result = await db.execute(
        text("""
            INSERT INTO "Sales".customer_photo
                (customer_id, photo_path, original_filename, file_size, mime_type,
                 download_token, uploaded_by)
            VALUES
                (:customer_id, :photo_path, :original_filename, :file_size, :mime_type,
                 :token, :uploaded_by)
            RETURNING *
        """).bindparams(
            customer_id=customer_id,
            photo_path=str(filename),
            original_filename=photo.filename,
            file_size=file_size,
            mime_type=photo.content_type,
            token=str(uuid.uuid4()),
            uploaded_by=current_user.login,
        )
    )
    row = result.mappings().fetchone()
    await db.commit()

    return PhotoResponse.model_validate(dict(row))
```

### Startup Directory Validation

```python
# src/main.py â€” in lifespan:
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure upload directory exists
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Photo upload directory: {upload_dir.resolve()}")
    yield
```

---

## Testing Requirements

- Upload valid 5MB JPEG â†’ returns 201 with photo record
- Upload 15MB file â†’ returns 413 error
- Upload `.pdf` file â†’ returns 400 error
- Upload file with `.jpg` extension but wrong content type â†’ returns 400
- Verify uploaded file exists on filesystem
- Simulate write failure (readonly directory) â†’ cleanup attempted, clear error returned

---

## Related Documentation

- [CURRENT_STATE.md â€” Performance Issues: Blocking file I/O](../CURRENT_STATE.md)
- Task 009 (Settings module â€” for upload_dir config)

