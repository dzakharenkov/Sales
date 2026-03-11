from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import text
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton

from src.core.config import settings
from src.database.connection import async_session

_CACHE: dict[tuple[str, str], tuple[datetime, str]] = {}
_CACHE_TTL_SECONDS = max(int(getattr(settings, "cache_ttl", 300) or 300), 30)
_LITERAL_KEY_CACHE: dict[tuple[str, str], tuple[datetime, str]] = {}

_ALIAS_KEYS: dict[str, str] = {
    "telegram.button.back": "telegram.action.back",
    "telegram.button.cancel": "telegram.action.cancel",
}

# Literal phrases still present in bot handlers; map them to translation keys.
_LITERAL_KEY_MAP: dict[str, str] = {
    "Сессия истекла. Нажмите /start.": "telegram.auth.session_expired",
    "Сессия истекла. Нажмите /start для повторной авторизации.": "telegram.auth.session_expired",
    "Клиенты не найдены. Попробуйте другой запрос:": "telegram.common.customers_not_found_try",
    "Выберите клиента:": "telegram.common.select_customer",
    "Выберите дату:": "telegram.common.choose_date",
    "Нет заказов.": "telegram.common.no_orders",
    "Нет заказов для маршрута.": "telegram.expeditor.no_orders_for_route",
    "Строю маршрут...": "telegram.expeditor.building_route",
    "Товар не найден.": "telegram.agent.product_not_found",
    "❌ Отмена": "telegram.button.cancel",
    "◀️ Назад": "telegram.action.back",
    "◀ Назад": "telegram.action.back",
    "✅ Подтвердить": "telegram.agent.confirm",
    "✅ Завершить заведение клиента": "telegram.agent.customer_finish",
    "📸 Фото": "telegram.agent.photos",
    "📍 Построить маршрут": "telegram.expeditor.build_route",
    "🗺️ Открыть в Яндекс.Картах": "telegram.expeditor.open_in_yandex",
    "🗺️ Открыть в Яндекс.Картах": "telegram.expeditor.open_point_in_yandex",
    "🚚 Доставить заказ": "telegram.expeditor.deliver_order",
    "✅ Доставлен": "telegram.expeditor.delivered",
    "✅ Да, товар доставлен": "telegram.expeditor.confirm_delivered_yes",
    "◀️ Нет, назад": "telegram.expeditor.confirm_delivered_no_back",
    "💵 Другая сумма": "telegram.expeditor.other_amount",
    "⏭ Пропустить": "telegram.button.skip",
    "⏩ Пропустить": "telegram.button.skip",
    "◀️ Назад к меню полей": "telegram.agent.back_to_fields",
    "✅ Добавить ещё": "button.add",
    "✅ Отметить выполнено": "telegram.agent.visit_mark_done",
    "❌ Отметить не выполнено": "telegram.agent.visit_mark_not_done",
    "✅ Оформить заказ": "telegram.agent.order_checkout",
    "🛒 Оформить заказ": "telegram.button.create_order",
    "🛒 *Создать заказ*\n\nВведите название клиента или ИНН для поиска:": "telegram.agent.order_search_prompt",
    "✅ Создать визит": "telegram.visit_create.create_visit_btn",
    "🆕 *Создать визит*\n\nВведите название клиента или ИНН для поиска:": "telegram.visit_create.create_visit_search_prompt",
    "❌ Неверный формат даты. Введите дату в формате ДД.ММ.ГГГГ (например, 25.12.2024):": "telegram.visit_create.invalid_date_format",
    "❌ Неверный формат времени. Введите время в формате ЧЧ:ММ (например, 14:30) или /skip:": "telegram.visit_create.invalid_time_format",
    "📋 *Подтверждение визита:*\n": "telegram.visit_create.confirm_header",
    "❌ Комментарий минимум 10 символов. Введите снова:": "telegram.agent.visit_comment_too_short",
    "✅ Создать клиента": "telegram.customer_create.create_btn",
    "🔄 Обновить": "telegram.button.refresh",
    "🔍 Изменить поиск": "telegram.visit_create.change_search",
    "💰 Получить оплату": "telegram.button.get_payment",
    "💬 Другая сумма": "telegram.expeditor.other_amount",
    "📸 Фотографии": "telegram.agent.photos",
    "📍 Открыть в Яндекс.Картах": "telegram.expeditor.open_point_in_yandex",
    "🗺 Открыть в Яндекс.Картах": "telegram.expeditor.open_point_in_yandex",
    "🗺 Построить маршрут": "telegram.expeditor.build_route",
    "🏠 Главное меню": "telegram.menu.main",
    "✅ Полная сумма ({fmt_money(amount)})": "telegram.common.processing",
    "💰 №{order_no} — {fmt_money(amount)}": "telegram.common.processing",
    "📦 №{order_no} — {client}": "telegram.common.processing",
    "№{order_no} — {client}": "telegram.common.processing",
    "Обрабатываю подтверждение доставки...": "telegram.common.processing",
    "âœ… Ð¡Ð¾Ð·Ð´Ð°Ñ‚ÑŒ ÐºÐ»Ð¸ÐµÐ½Ñ‚Ð°": "telegram.customer_create.create_btn",
    "ðŸ’° ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ Ð¾Ð¿Ð»Ð°Ñ‚Ñƒ": "telegram.button.get_payment",
    "ðŸ”„ ÐžÐ±Ð½Ð¾Ð²Ð¸Ñ‚ÑŒ": "telegram.button.refresh",
}


def _normalize_language(language: str | None) -> str:
    lang = (language or "").strip().lower()
    enabled = settings.enabled_languages_list
    if not lang:
        return settings.effective_default_language
    if lang not in enabled:
        return settings.effective_default_language
    return lang


def get_user_language(context: Any | None) -> str:
    if context is not None:
        lang = _normalize_language((context.user_data or {}).get("lang"))
        if lang:
            return lang
    return settings.effective_default_language


def set_user_language(context: Any | None, language: str | None) -> str:
    lang = _normalize_language(language)
    if context is not None:
        context.user_data["lang"] = lang
    return lang


def detect_language(update: Any | None, context: Any | None = None) -> str:
    if context is not None:
        lang = _normalize_language((context.user_data or {}).get("lang"))
        if lang:
            return lang

    user_lang = ""
    try:
        user_lang = ((update.effective_user.language_code or "") if update and update.effective_user else "")
    except Exception:
        user_lang = ""
    return _normalize_language(user_lang)


def _cache_get(key: str, lang: str) -> str | None:
    cached = _CACHE.get((key, lang))
    if not cached:
        return None
    expires_at, value = cached
    if expires_at <= datetime.now(timezone.utc):
        _CACHE.pop((key, lang), None)
        return None
    return value


def _cache_set(key: str, lang: str, value: str) -> None:
    _CACHE[(key, lang)] = (
        datetime.now(timezone.utc) + timedelta(seconds=_CACHE_TTL_SECONDS),
        value,
    )


def _normalize_text(text_value: str) -> str:
    # Keep Telegram multiline templates human-readable in DB: support escaped newlines.
    normalized = (text_value or "").replace("\\n", "\n").strip("\ufeff")
    if "Ð" in normalized or "Ñ" in normalized or "â" in normalized or "ð" in normalized:
        for codec in ("latin1", "cp1252"):
            try:
                normalized = normalized.encode(codec).decode("utf-8")
                break
            except Exception:
                continue
    return normalized


async def _fetch_from_db(key: str, lang: str) -> str | None:
    query = text(
        '''
        SELECT translation_text
        FROM "Sales".translations
        WHERE translation_key = :k AND language_code = :l
        LIMIT 1
        '''
    )
    async with async_session() as session:
        value = await session.scalar(query, {"k": key, "l": lang})
    if value is None:
        return None
    return _normalize_text(str(value))


def _literal_cache_get(literal: str, lang: str) -> str | None:
    cached = _LITERAL_KEY_CACHE.get((literal, lang))
    if not cached:
        return None
    expires_at, value = cached
    if expires_at <= datetime.now(timezone.utc):
        _LITERAL_KEY_CACHE.pop((literal, lang), None)
        return None
    return value


def _literal_cache_set(literal: str, lang: str, key: str) -> None:
    _LITERAL_KEY_CACHE[(literal, lang)] = (
        datetime.now(timezone.utc) + timedelta(seconds=_CACHE_TTL_SECONDS),
        key,
    )


async def _find_key_by_literal(literal: str, lang: str) -> str | None:
    cached = _literal_cache_get(literal, lang)
    if cached is not None:
        return cached

    default_lang = settings.effective_default_language
    query = text(
        '''
        SELECT translation_key
        FROM "Sales".translations
        WHERE translation_text = :txt
        ORDER BY
            CASE
                WHEN language_code = :lang THEN 0
                WHEN language_code = :default_lang THEN 1
                ELSE 2
            END,
            translation_key
        LIMIT 1
        '''
    )
    async with async_session() as session:
        value = await session.scalar(
            query, {"txt": literal, "lang": lang, "default_lang": default_lang}
        )
    if value is None:
        return None
    key = str(value)
    _literal_cache_set(literal, lang, key)
    return key


async def t(
    update: Any | None,
    context: Any | None,
    key: str,
    fallback: str | None = None,
    **params: Any,
) -> str:
    lang = detect_language(update, context)
    resolved_key = _ALIAS_KEYS.get(key, key)

    cached = _cache_get(resolved_key, lang)
    if cached is not None:
        base = cached
    else:
        base = await _fetch_from_db(resolved_key, lang)
        if base is None and lang != settings.effective_default_language:
            base = await _fetch_from_db(resolved_key, settings.effective_default_language)
        if base is None and resolved_key != key:
            base = await _fetch_from_db(key, lang)
            if base is None and lang != settings.effective_default_language:
                base = await _fetch_from_db(key, settings.effective_default_language)
        if base is None:
            base = fallback if fallback is not None else key
        _cache_set(resolved_key, lang, base)

    if params:
        try:
            return base.format(**params)
        except Exception:
            return base
    return base


async def localize_literal(update: Any | None, context: Any | None, text_value: str) -> str:
    normalized = _normalize_text(text_value)
    if not normalized:
        return normalized

    # If a translation key leaks to UI (e.g. telegram.button.back), resolve it directly.
    if "." in normalized and " " not in normalized:
        resolved = await t(update, context, normalized, fallback=normalized)
        if resolved != normalized:
            return resolved

    key = _LITERAL_KEY_MAP.get(normalized)
    if key:
        return await t(update, context, key, fallback=normalized)

    # Compatibility aliases for entries that may leak as translation keys in UI.
    if normalized in _ALIAS_KEYS:
        return await t(update, context, _ALIAS_KEYS[normalized], fallback=normalized)

    lang = detect_language(update, context)
    key_by_literal = await _find_key_by_literal(normalized, lang)
    if key_by_literal:
        return await t(update, context, key_by_literal, fallback=normalized)

    return normalized


async def localize_reply_markup(update: Any | None, context: Any | None, reply_markup: Any) -> Any:
    if isinstance(reply_markup, InlineKeyboardMarkup):
        rows: list[list[InlineKeyboardButton]] = []
        for row in (reply_markup.inline_keyboard or []):
            new_row: list[InlineKeyboardButton] = []
            for btn in row:
                localized_text = await localize_literal(update, context, getattr(btn, "text", "") or "")
                new_row.append(
                    InlineKeyboardButton(
                        text=localized_text,
                        callback_data=getattr(btn, "callback_data", None),
                        url=getattr(btn, "url", None),
                        switch_inline_query=getattr(btn, "switch_inline_query", None),
                        switch_inline_query_current_chat=getattr(btn, "switch_inline_query_current_chat", None),
                        callback_game=getattr(btn, "callback_game", None),
                        pay=getattr(btn, "pay", None),
                    )
                )
            rows.append(new_row)
        return InlineKeyboardMarkup(rows)

    if isinstance(reply_markup, ReplyKeyboardMarkup):
        rows: list[list[KeyboardButton]] = []
        for row in (reply_markup.keyboard or []):
            new_row: list[KeyboardButton] = []
            for btn in row:
                if isinstance(btn, KeyboardButton):
                    src_text = btn.text or ""
                    localized_text = await localize_literal(update, context, src_text)
                    new_row.append(
                        KeyboardButton(
                            text=localized_text,
                            request_contact=getattr(btn, "request_contact", None),
                            request_location=getattr(btn, "request_location", None),
                            request_poll=getattr(btn, "request_poll", None),
                            web_app=getattr(btn, "web_app", None),
                        )
                    )
                else:
                    localized_text = await localize_literal(update, context, str(btn))
                    new_row.append(KeyboardButton(text=localized_text))
            rows.append(new_row)
        return ReplyKeyboardMarkup(
            rows,
            resize_keyboard=reply_markup.resize_keyboard,
            one_time_keyboard=reply_markup.one_time_keyboard,
            selective=reply_markup.selective,
            input_field_placeholder=reply_markup.input_field_placeholder,
            is_persistent=reply_markup.is_persistent,
        )

    return reply_markup


def clear_translation_cache() -> None:
    _CACHE.clear()
    _LITERAL_KEY_CACHE.clear()
