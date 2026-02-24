"""
Вспомогательные функции: форматирование, кэш справочников, календарь.
"""
import time
import logging
from datetime import date, timedelta
from typing import Any

from telegram import InlineKeyboardButton, InlineKeyboardMarkup

from .sds_api import api
from .config import CACHE_TTL

logger = logging.getLogger(__name__)

# ---------- Форматирование ----------

ROLE_RU = {"expeditor": "Экспедитор", "agent": "Агент", "admin": "Администратор",
           "stockman": "Кладовщик", "paymaster": "Кассир"}

STATUS_RU = {"planned": "Запланирован", "completed": "Завершён", "cancelled": "Отменён",
             "postponed": "На рассмотрении", "open": "Создан", "delivery": "Доставка",
             "canceled": "Отменён", "pending": "Ожидание"}

PAYMENT_RU = {"cash_sum": "Наличные", "bank_sum": "Безналичный перевод", "card_sum": "Карта"}

MONTHS_RU = ["", "января", "февраля", "марта", "апреля", "мая", "июня",
             "июля", "августа", "сентября", "октября", "ноября", "декабря"]


def fmt_money(amount: float | int | None) -> str:
    if amount is None:
        return "0,00 сўм"
    s = f"{float(amount):,.2f}".replace(",", " ").replace(".", ",")
    return f"{s} сўм"


def fmt_date(d: date | str | None) -> str:
    if d is None:
        return "—"
    if isinstance(d, str):
        try:
            d = date.fromisoformat(d[:10])
        except (ValueError, TypeError):
            return str(d)
    return f"{d.day:02d}.{d.month:02d}.{d.year}"


def fmt_date_ru(d: date) -> str:
    return f"{d.day} {MONTHS_RU[d.month]} {d.year}"


# ---------- Кэш справочников ----------

_cache: dict[str, tuple[float, Any]] = {}


async def get_cached_products(token: str) -> list:
    key = "products"
    if key in _cache and time.time() - _cache[key][0] < CACHE_TTL:
        return _cache[key][1]
    data = await api.get_products(token)
    # Показываем ВСЕ продукты номенклатуры (даже без остатков на складе)
    _cache[key] = (time.time(), data)
    return data


async def get_cached_payment_types(token: str) -> list:
    key = "payment_types"
    if key in _cache and time.time() - _cache[key][0] < CACHE_TTL:
        return _cache[key][1]
    data = await api.get_payment_types(token)
    _cache[key] = (time.time(), data)
    return data


async def get_cached_user_logins(token: str) -> list:
    """Кэшированный список пользователей (экспедиторов). TTL=300сек."""
    key = "user_logins"
    if key in _cache and time.time() - _cache[key][0] < CACHE_TTL:
        return _cache[key][1]
    try:
        data = await api.get_user_logins(token)
        _cache[key] = (time.time(), data)
        return data
    except Exception as e:
        logger.error(f"Error getting user logins: {e}")
        # При ошибке вернуть пустой список или старые данные из кэша
        if key in _cache:
            return _cache[key][1]
        return []


# ---------- Клавиатуры ----------

def back_button(callback_data: str = "main_menu") -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([[InlineKeyboardButton("◀️ Назад", callback_data=callback_data)]])


def date_picker_keyboard(
    prefix: str,
    text_today: str = "Сегодня",
    text_tomorrow: str = "Завтра",
    text_choose: str = "Выбрать дату",
    text_back: str = "◀️ Назад"
) -> InlineKeyboardMarkup:
    """Кнопки: Сегодня, Завтра, Календарь."""
    today = date.today()
    tomorrow = today + timedelta(days=1)
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(f"📅 {text_today} ({fmt_date(today)})", callback_data=f"{prefix}_date_{today.isoformat()}")],
        [InlineKeyboardButton(f"📅 {text_tomorrow} ({fmt_date(tomorrow)})", callback_data=f"{prefix}_date_{tomorrow.isoformat()}")],
        [InlineKeyboardButton(f"🗓 {text_choose}", callback_data=f"{prefix}_calendar_0")],
        [InlineKeyboardButton(text_back, callback_data="main_menu")],
    ])


def calendar_keyboard(
    prefix: str,
    offset_days: int = 0,
    text_back: str = "◀️ Назад"
) -> InlineKeyboardMarkup:
    """Календарь на 30 дней вперёд (пагинация по 10)."""
    today = date.today()
    start = today + timedelta(days=offset_days)
    buttons = []
    for i in range(10):
        d = start + timedelta(days=i)
        if (d - today).days >= 30:
            break
        buttons.append([InlineKeyboardButton(
            fmt_date_ru(d), callback_data=f"{prefix}_date_{d.isoformat()}"
        )])
    nav = []
    if offset_days > 0:
        nav.append(InlineKeyboardButton("⬅️", callback_data=f"{prefix}_calendar_{max(0, offset_days - 10)}"))
    if offset_days + 10 < 30:
        nav.append(InlineKeyboardButton("➡️", callback_data=f"{prefix}_calendar_{offset_days + 10}"))
    if nav:
        buttons.append(nav)
    buttons.append([InlineKeyboardButton(text_back, callback_data=f"{prefix}_pick_date")])
    return InlineKeyboardMarkup(buttons)
