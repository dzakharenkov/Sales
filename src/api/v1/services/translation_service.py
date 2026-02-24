from __future__ import annotations

from typing import Any
from uuid import UUID
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, case
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.database.models import Translation


class TranslationService:
    _cache: dict[tuple[str, str], tuple[datetime, str]] = {}

    def __init__(self, db: AsyncSession):
        self.db = db

    @property
    def default_language(self) -> str:
        return settings.effective_default_language

    @property
    def enabled_languages(self) -> list[str]:
        return settings.enabled_languages_list

    def is_enabled_language(self, language: str | None) -> bool:
        lang = (language or "").strip().lower()
        return bool(lang) and lang in self.enabled_languages

    def normalize_language(self, language: str | None) -> str:
        lang = (language or "").strip().lower()
        if not lang:
            return self.default_language
        if lang not in self.enabled_languages:
            return self.default_language
        return lang

    async def resolve_key(self, translation_key: str, language: str | None) -> str:
        lang = self.normalize_language(language)
        cached = self._cache_get(translation_key, lang)
        if cached is not None:
            return cached

        row = await self._get_row(translation_key=translation_key, language_code=lang)
        if row:
            self._cache_set(translation_key, lang, row.translation_text)
            return row.translation_text

        if lang != self.default_language:
            fallback = await self._get_row(
                translation_key=translation_key,
                language_code=self.default_language,
            )
            if fallback:
                self._cache_set(translation_key, lang, fallback.translation_text)
                return fallback.translation_text

        self._cache_set(translation_key, lang, translation_key)
        return translation_key

    async def resolve_many(self, keys: list[str], language: str | None) -> dict[str, str]:
        unique_keys = [k for k in dict.fromkeys(keys) if k]
        if not unique_keys:
            return {}

        lang = self.normalize_language(language)
        stmt = select(Translation).where(
            Translation.translation_key.in_(unique_keys),
            Translation.language_code == lang,
        )
        rows = (await self.db.execute(stmt)).scalars().all()
        by_key = {row.translation_key: row.translation_text for row in rows}

        missing = [k for k in unique_keys if k not in by_key]
        if missing and lang != self.default_language:
            fb_stmt = select(Translation).where(
                Translation.translation_key.in_(missing),
                Translation.language_code == self.default_language,
            )
            fb_rows = (await self.db.execute(fb_stmt)).scalars().all()
            for row in fb_rows:
                by_key.setdefault(row.translation_key, row.translation_text)

        return {k: by_key.get(k, k) for k in unique_keys}

    async def localize_literals(self, literals: list[str], language: str | None) -> dict[str, str]:
        normalized = [str(v).strip() for v in literals if str(v).strip()]
        unique_literals = list(dict.fromkeys(normalized))
        if not unique_literals:
            return {}

        target_lang = self.normalize_language(language)
        default_lang = self.default_language

        candidate_stmt = (
            select(
                Translation.translation_text,
                Translation.translation_key,
                Translation.language_code,
            )
            .where(Translation.translation_text.in_(unique_literals))
            .order_by(
                Translation.translation_text.asc(),
                case(
                    (Translation.language_code == target_lang, 0),
                    (Translation.language_code == default_lang, 1),
                    else_=2,
                ),
                Translation.translation_key.asc(),
            )
        )
        candidates = (await self.db.execute(candidate_stmt)).all()

        literal_to_key: dict[str, str] = {}
        for row in candidates:
            literal = str(row.translation_text)
            if literal not in literal_to_key:
                literal_to_key[literal] = str(row.translation_key)

        if not literal_to_key:
            return {lit: lit for lit in unique_literals}

        keys = list(dict.fromkeys(literal_to_key.values()))
        target_rows = (
            await self.db.execute(
                select(Translation.translation_key, Translation.translation_text).where(
                    Translation.translation_key.in_(keys),
                    Translation.language_code == target_lang,
                )
            )
        ).all()
        key_to_target = {str(r.translation_key): str(r.translation_text) for r in target_rows}

        missing_keys = [k for k in keys if k not in key_to_target]
        if missing_keys and target_lang != default_lang:
            fallback_rows = (
                await self.db.execute(
                    select(Translation.translation_key, Translation.translation_text).where(
                        Translation.translation_key.in_(missing_keys),
                        Translation.language_code == default_lang,
                    )
                )
            ).all()
            for r in fallback_rows:
                key_to_target.setdefault(str(r.translation_key), str(r.translation_text))

        result: dict[str, str] = {}
        for literal in unique_literals:
            key = literal_to_key.get(literal)
            result[literal] = key_to_target.get(key, literal) if key else literal
        return result

    async def list_items(
        self,
        *,
        category: str | None,
        language: str | None,
        key_like: str | None,
        text_like: str | None,
        limit: int,
        offset: int,
    ) -> list[Translation]:
        stmt = select(Translation).order_by(Translation.translation_key.asc(), Translation.language_code.asc())
        if category:
            stmt = stmt.where(Translation.category == category)
        if language:
            stmt = stmt.where(Translation.language_code == self.normalize_language(language))
        if key_like:
            stmt = stmt.where(Translation.translation_key.ilike(f"%{key_like.strip()}%"))
        if text_like:
            stmt = stmt.where(Translation.translation_text.ilike(f"%{text_like.strip()}%"))
        stmt = stmt.offset(offset).limit(limit)
        return (await self.db.execute(stmt)).scalars().all()

    async def create_item(self, payload: dict[str, Any]) -> Translation:
        if not self.is_enabled_language(payload.get("language_code")):
            raise ValueError(
                f"Unsupported language_code '{payload.get('language_code')}'. "
                f"Allowed: {', '.join(self.enabled_languages)}"
            )
        entity = Translation(
            translation_key=payload["translation_key"].strip(),
            language_code=payload["language_code"].strip().lower(),
            translation_text=payload["translation_text"],
            category=payload.get("category"),
            notes=payload.get("notes"),
            created_by=payload.get("created_by"),
        )
        self.db.add(entity)
        await self.db.commit()
        await self.db.refresh(entity)
        self._cache.clear()
        return entity

    async def update_item(self, translation_id: UUID, payload: dict[str, Any]) -> Translation | None:
        stmt = select(Translation).where(Translation.id == translation_id)
        entity = (await self.db.execute(stmt)).scalars().first()
        if not entity:
            return None

        if "translation_text" in payload and payload["translation_text"] is not None:
            entity.translation_text = payload["translation_text"]
        if "notes" in payload:
            entity.notes = payload["notes"]
        if "category" in payload:
            entity.category = payload["category"]
        if "updated_by" in payload:
            entity.updated_by = payload["updated_by"]

        await self.db.commit()
        await self.db.refresh(entity)
        self._cache.clear()
        return entity

    async def delete_item(self, translation_id: UUID) -> bool:
        stmt = select(Translation).where(Translation.id == translation_id)
        entity = (await self.db.execute(stmt)).scalars().first()
        if not entity:
            return False

        await self.db.delete(entity)
        await self.db.commit()
        self._cache.clear()
        return True

    async def _get_row(self, *, translation_key: str, language_code: str) -> Translation | None:
        stmt = select(Translation).where(
            Translation.translation_key == translation_key,
            Translation.language_code == language_code,
        )
        return (await self.db.execute(stmt)).scalars().first()

    @staticmethod
    def _cache_key(translation_key: str, language_code: str) -> tuple[str, str]:
        return translation_key, language_code

    def _cache_get(self, translation_key: str, language_code: str) -> str | None:
        key = self._cache_key(translation_key, language_code)
        cached = self._cache.get(key)
        if not cached:
            return None
        expires_at, value = cached
        if expires_at <= datetime.now(timezone.utc):
            self._cache.pop(key, None)
            return None
        return value

    def _cache_set(self, translation_key: str, language_code: str, value: str) -> None:
        ttl = max(int(settings.cache_ttl or 0), 1)
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=ttl)
        self._cache[self._cache_key(translation_key, language_code)] = (expires_at, value)
