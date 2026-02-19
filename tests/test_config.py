# -*- coding: utf-8 -*-
"""Конфигурация тестирования интерфейса SDS."""

# URL локального приложения
BASE_URL = "http://127.0.0.1:8000"

# Учётные данные для входа (приложение требует авторизации)
LOGIN_USER = "dzakharenkov"
LOGIN_PASSWORD = "$Tesla11"

# Секции для тестирования (selector — CSS или Playwright locator)
TEST_SECTIONS = [
    {"name": "Главная", "selector": None, "screenshot_name": "01_main_page"},
    {"name": "Сводная аналитика", "selector": "a[data-section='report_dashboard']", "screenshot_name": "02_reports"},
    {"name": "Пользователи", "selector": "a[data-section='users']", "screenshot_name": "03_users"},
    {"name": "Заказы", "selector": "a[data-section='orders']", "screenshot_name": "04_orders"},
    {"name": "Визиты", "selector": "a[data-section='visits_search']", "screenshot_name": "05_visits"},
]

# Родительские элементы для раскрытия подменю (перед кликом по дочернему)
# Сводная аналитика в подменю "Отчётность"
EXPAND_BEFORE = {
    "a[data-section='report_dashboard']": "a[data-section='reports_parent']",
    "a[data-section='orders']": "a[data-section='orders_parent']",
    "a[data-section='visits_search']": "a[data-section='visits_parent']",
}

# Папки
SCREENSHOTS_DIR = "screenshots"
REPORTS_DIR = "reports"

# Таймауты (секунды)
PAGE_LOAD_TIMEOUT = 15000
ELEMENT_TIMEOUT = 5000
