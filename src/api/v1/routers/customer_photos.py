"""
Фотографии клиентов (customer_photo). ТЗ 3.0. Загрузка, скачивание по download_token.
"""
import os
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_db_session
from src.database.models import CustomerPhoto, Customer, User
from src.core.deps import get_current_user

router = APIRouter()

# Корень проекта (src/api/v1/routers -> 4 уровня вверх)
PROJECT_ROOT = Path(__file__).resolve().parents[4]
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", str(PROJECT_ROOT / "uploads" / "customer_photos")))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def _photo_to_dict(p: CustomerPhoto, customer_name: str | None = None) -> dict:
    d = {
        "id": p.id,
        "customer_id": p.customer_id,
        "photo_path": p.photo_path,
        "original_filename": p.original_filename,
        "file_size": p.file_size,
        "mime_type": p.mime_type,
        "description": p.description,
        "download_token": p.download_token,
        "is_main": p.is_main or False,
        "uploaded_by": p.uploaded_by,
        "uploaded_at": p.uploaded_at.isoformat() if p.uploaded_at else None,
    }
    if customer_name is not None:
        d["customer_name"] = customer_name
    return d


def _safe_filename(name: str) -> str:
    return re.sub(r"[^\w\-\.]", "_", name)[:200]


@router.post("/customers/{customer_id}/photos")
async def upload_photo(
    customer_id: int,
    file: UploadFile = File(...),
    description: str | None = Form(None),
    is_main: bool = Form(False),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Загрузить фото клиента (multipart/form-data)."""
    result = await session.execute(select(Customer).where(Customer.id == customer_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Customer not found")
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename")
    ext = (file.filename.rsplit(".", 1)[-1] or "").lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 20 MB)")
    # Сохраняем запись в БД сначала, чтобы получить id
    row = (await session.execute(text("SELECT md5(random()::text) AS t"))).fetchone()
    download_token = row[0] if row else str(uuid.uuid4()).replace("-", "")
    photo = CustomerPhoto(
        customer_id=customer_id,
        photo_path="",  # обновим после commit
        original_filename=_safe_filename(file.filename),
        file_size=len(content),
        mime_type=file.content_type or f"image/{ext}",
        description=(description or "")[:500] or None,
        download_token=download_token,
        is_main=is_main,
        uploaded_by=user.login,
    )
    session.add(photo)
    await session.commit()
    await session.refresh(photo)
    # Сохраняем файл в UPLOAD_DIR: {id}.{ext}
    full_path = UPLOAD_DIR / f"{photo.id}.{ext}"
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_bytes(content)
    photo.photo_path = f"/uploads/customer_photos/{photo.id}.{ext}"
    await session.commit()
    return _photo_to_dict(photo)


@router.get("/customers/{customer_id}/photos")
async def list_customer_photos(
    customer_id: int,
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Список фотографий клиента."""
    result = await session.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    from sqlalchemy import func
    count_q = select(func.count()).select_from(CustomerPhoto).where(CustomerPhoto.customer_id == customer_id)
    total = (await session.execute(count_q)).scalar() or 0
    q = select(CustomerPhoto).where(CustomerPhoto.customer_id == customer_id).order_by(CustomerPhoto.uploaded_at.desc()).offset(offset).limit(limit)
    result = await session.execute(q)
    photos = result.scalars().all()
    main_photo_id = getattr(customer, "main_photo_id", None)
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "main_photo_id": main_photo_id,
        "data": [_photo_to_dict(p) for p in photos],
    }


@router.get("/photos/{photo_id}")
async def get_photo(
    photo_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Информация о фото."""
    result = await session.execute(
        select(CustomerPhoto, Customer.name_client, Customer.firm_name)
        .join(Customer, CustomerPhoto.customer_id == Customer.id)
        .where(CustomerPhoto.id == photo_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Photo not found")
    photo, name_client, firm_name = row
    customer_name = (name_client or firm_name or "").strip() or f"Клиент #{photo.customer_id}"
    return _photo_to_dict(photo, customer_name=customer_name)


def _resolve_photo_path(photo_path: str) -> Path:
    """photo_path в БД: /uploads/customer_photos/1.jpg -> UPLOAD_DIR/1.jpg"""
    base = photo_path.strip().lstrip("/")
    if base.startswith("uploads/"):
        base = base.replace("uploads/", "", 1)
    if base.startswith("customer_photos/"):
        name = base.replace("customer_photos/", "", 1)
    else:
        name = base
    return UPLOAD_DIR / name


@router.get("/photos/download/{download_token}")
async def download_photo(
    download_token: str,
    session: AsyncSession = Depends(get_db_session),
):
    """Скачать/просмотреть фото по токену (без авторизации для просмотра по ссылке)."""
    result = await session.execute(select(CustomerPhoto).where(CustomerPhoto.download_token == download_token))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    path = _resolve_photo_path(photo.photo_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type=photo.mime_type or "image/jpeg", filename=photo.original_filename or f"photo_{photo.id}.jpg")


@router.get("/photos/thumbnail/{download_token}")
async def thumbnail_photo(
    download_token: str,
    session: AsyncSession = Depends(get_db_session),
):
    """Миниатюра 150x150 (пока отдаём тот же файл; при необходимости можно добавить PIL)."""
    result = await session.execute(select(CustomerPhoto).where(CustomerPhoto.download_token == download_token))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    path = _resolve_photo_path(photo.photo_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type=photo.mime_type or "image/jpeg")


class PhotoUpdate(BaseModel):
    description: str | None = None
    is_main: bool | None = None


@router.put("/photos/{photo_id}")
async def update_photo(
    photo_id: int,
    body: PhotoUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Обновить описание или флаг основного фото."""
    result = await session.execute(select(CustomerPhoto).where(CustomerPhoto.id == photo_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    if body.description is not None:
        photo.description = (body.description or "")[:500] or None
    if body.is_main is not None and body.is_main:
        # Снять is_main с остальных фото этого клиента
        await session.execute(
            text("UPDATE \"Sales\".customer_photo SET is_main = FALSE WHERE customer_id = :cid"),
            {"cid": photo.customer_id},
        )
        photo.is_main = True
    await session.commit()
    await session.refresh(photo)
    return {"id": photo.id, "description": photo.description, "is_main": photo.is_main}


@router.delete("/photos/{photo_id}", status_code=204)
async def delete_photo(
    photo_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Удалить фото (файл и запись)."""
    result = await session.execute(select(CustomerPhoto).where(CustomerPhoto.id == photo_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    path = _resolve_photo_path(photo.photo_path)
    if path.exists():
        try:
            path.unlink()
        except OSError:
            pass
    await session.delete(photo)
    await session.commit()


@router.post("/customers/{customer_id}/photos/{photo_id}/set-main")
async def set_main_photo(
    customer_id: int,
    photo_id: int,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
):
    """Установить фото основным для клиента."""
    result = await session.execute(select(CustomerPhoto).where(CustomerPhoto.id == photo_id, CustomerPhoto.customer_id == customer_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    customer = await session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    previous_main = getattr(customer, "main_photo_id", None)
    await session.execute(text('UPDATE "Sales".customer_photo SET is_main = FALSE WHERE customer_id = :cid'), {"cid": customer_id})
    photo.is_main = True
    customer.main_photo_id = photo_id
    await session.commit()
    return {"message": "Photo set as main successfully", "main_photo_id": photo_id, "previous_main_id": previous_main}
