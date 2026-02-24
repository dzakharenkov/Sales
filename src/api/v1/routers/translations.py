from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func

from src.api.v1.services.translation_service import TranslationService
from src.core.config import settings
from src.core.deps import get_current_user, require_admin
from src.database.connection import get_db_session
from src.database.models import User, Translation

router = APIRouter(prefix="/translations", tags=["translations"])


class TranslationCreate(BaseModel):
    translation_key: str = Field(..., min_length=1, max_length=255)
    language_code: str = Field(..., min_length=2, max_length=5)
    translation_text: str = Field(..., min_length=1)
    category: str | None = None
    notes: str | None = None


class TranslationUpdate(BaseModel):
    translation_text: str | None = None
    category: str | None = None
    notes: str | None = None


class ResolveBatchRequest(BaseModel):
    keys: list[str]
    language: str | None = None


class LocalizeLiteralsRequest(BaseModel):
    literals: list[str]
    language: str | None = None


@router.get("/config/languages")
async def get_language_config(_: User = Depends(get_current_user)):
    return {
        "enabled_languages": settings.enabled_languages_list,
        "default_language": settings.effective_default_language,
    }


@router.get("/stats")
async def get_translations_stats(
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(require_admin),
):
    langs = settings.enabled_languages_list or ["ru", "uz", "en"]
    overall_rows = await session.execute(
        text(
            """
            SELECT language_code, count(*) AS cnt
            FROM "Sales".translations
            GROUP BY language_code
            """
        )
    )
    overall = {row.language_code: int(row.cnt) for row in overall_rows}

    tg_rows = await session.execute(
        text(
            """
            SELECT language_code, count(*) AS cnt
            FROM "Sales".translations
            WHERE translation_key LIKE 'telegram.%'
            GROUP BY language_code
            """
        )
    )
    telegram = {row.language_code: int(row.cnt) for row in tg_rows}

    total_keys = await session.execute(text('SELECT count(DISTINCT translation_key) AS cnt FROM "Sales".translations'))
    tg_keys = await session.execute(
        text(
            "SELECT count(DISTINCT translation_key) AS cnt FROM \"Sales\".translations WHERE translation_key LIKE 'telegram.%'"
        )
    )
    grouped = await session.execute(
        select(
            Translation.translation_key,
            func.count(func.distinct(Translation.language_code)).label("c"),
        )
        .where(Translation.language_code.in_(langs))
        .group_by(Translation.translation_key)
    )
    missing_count = sum(1 for row in grouped if int(row.c or 0) < len(langs))

    return {
        "languages": langs,
        "overall": {
            "by_language": {lang: int(overall.get(lang, 0)) for lang in langs},
            "total_keys": int(total_keys.scalar_one() or 0),
        },
        "telegram": {
            "by_language": {lang: int(telegram.get(lang, 0)) for lang in langs},
            "total_keys": int(tg_keys.scalar_one() or 0),
        },
        "missing_any_language_keys": int(missing_count),
    }


@router.get("")
async def list_translations(
    category: str | None = Query(None),
    language: str | None = Query(None),
    key_like: str | None = Query(None),
    text_like: str | None = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(require_admin),
):
    service = TranslationService(session)
    rows = await service.list_items(
        category=category,
        language=language,
        key_like=key_like,
        text_like=text_like,
        limit=limit,
        offset=offset,
    )
    return [
        {
            "id": str(row.id),
            "translation_key": row.translation_key,
            "language_code": row.language_code,
            "translation_text": row.translation_text,
            "category": row.category,
            "notes": row.notes,
            "created_by": row.created_by,
            "updated_by": row.updated_by,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        }
        for row in rows
    ]


@router.post("", status_code=201)
async def create_translation(
    payload: TranslationCreate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    service = TranslationService(session)
    try:
        row = await service.create_item(
            {
                "translation_key": payload.translation_key,
                "language_code": payload.language_code,
                "translation_text": payload.translation_text,
                "category": payload.category,
                "notes": payload.notes,
                "created_by": user.login,
            }
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=409, detail="Translation key already exists for this language")

    return {
        "id": str(row.id),
        "translation_key": row.translation_key,
        "language_code": row.language_code,
        "translation_text": row.translation_text,
        "category": row.category,
    }


@router.put("/{translation_id}")
async def update_translation(
    translation_id: UUID,
    payload: TranslationUpdate,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(require_admin),
):
    service = TranslationService(session)
    update_payload = payload.model_dump(exclude_unset=True)
    update_payload["updated_by"] = user.login
    row = await service.update_item(
        translation_id=translation_id,
        payload=update_payload,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Translation not found")
    return {
        "id": str(row.id),
        "translation_key": row.translation_key,
        "language_code": row.language_code,
        "translation_text": row.translation_text,
        "category": row.category,
        "notes": row.notes,
    }


@router.delete("/{translation_id}")
async def delete_translation(
    translation_id: UUID,
    session: AsyncSession = Depends(get_db_session),
    _: User = Depends(require_admin),
):
    service = TranslationService(session)
    deleted = await service.delete_item(translation_id=translation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Translation not found")
    return {"success": True}


@router.post("/resolve")
async def resolve_translations(
    payload: ResolveBatchRequest,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> dict[str, Any]:
    _ = user
    service = TranslationService(session)
    resolved = await service.resolve_many(payload.keys, payload.language)
    return {
        "language": service.normalize_language(payload.language),
        "data": resolved,
    }


@router.post("/localize-literals")
async def localize_literals(
    payload: LocalizeLiteralsRequest,
    session: AsyncSession = Depends(get_db_session),
    user: User = Depends(get_current_user),
) -> dict[str, Any]:
    _ = user
    service = TranslationService(session)
    resolved = await service.localize_literals(payload.literals, payload.language)
    return {
        "language": service.normalize_language(payload.language),
        "data": resolved,
    }
