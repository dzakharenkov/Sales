# -*- coding: utf-8 -*-
"""
Система автоматизированного тестирования интерфейса SDS.
Запуск: python test/test_runner.py (из корня проекта Sales/)
"""
import os
import sys
import time

# Windows: UTF-8 для консоли (эмодзи и кириллица)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
from datetime import datetime
from pathlib import Path

# Корень проекта (родитель папки test/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import test_config as cfg

# Пути относительно папки test/
TEST_DIR = Path(__file__).resolve().parent
SCREENSHOTS_DIR = TEST_DIR / cfg.SCREENSHOTS_DIR
REPORTS_DIR = TEST_DIR / cfg.REPORTS_DIR


def ensure_dirs():
    """Создаёт папки screenshots и reports."""
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def main():
    ensure_dirs()
    log_lines = []
    results = []
    total_start = time.time()

    def log(msg):
        print(msg)
        log_lines.append(msg)

    log("🚀 Запуск тестирования интерфейса...")
    log(f"🔗 Подключаемся к {cfg.BASE_URL}")
    log("")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        log("❌ Ошибка: playwright не установлен.")
        log("   Выполните: pip install playwright")
        log("   Затем: playwright install chromium")
        sys.exit(1)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=True,
        )
        page = context.new_page()
        page.set_default_timeout(cfg.PAGE_LOAD_TIMEOUT)

        try:
            # Шаг 0: Логин
            log("[0/6] Вход в систему...")
            t0 = time.time()
            page.goto(cfg.BASE_URL, wait_until="networkidle")
            page.wait_for_load_state("domcontentloaded")

            url = page.url
            if "/login" in url:
                page.fill("#login", cfg.LOGIN_USER)
                page.fill("#password", cfg.LOGIN_PASSWORD)
                page.click("button[type='submit']")
                page.wait_for_url("**/app**", timeout=15000)
            if "/app" not in page.url:
                page.goto(cfg.BASE_URL + "/app", wait_until="domcontentloaded")
            page.wait_for_load_state("networkidle", timeout=15000)
            page.wait_for_timeout(1500)
            elapsed = time.time() - t0
            log(f"  ✓ Вход выполнен за {elapsed:.1f} сек")
            if "/login" in page.url:
                raise RuntimeError("Перенаправление на /login — проверьте логин/пароль в test_config.py и что API запущен")
            results.append({"step": "Вход", "ok": True})
            log("")

            # Шаг 1: Главная страница
            log("[1/5] Загружаем главную страницу...")
            t1 = time.time()
            page.wait_for_selector("a[data-section='users']", timeout=10000)
            elapsed = time.time() - t1
            log(f"  ✓ Страница загружена за {elapsed:.1f} сек")
            ss1 = SCREENSHOTS_DIR / "01_main_page.png"
            page.screenshot(path=str(ss1))
            log(f"  📸 Скриншот сохранён: {ss1}")
            results.append({"step": "Главная", "ok": True})
            log("")

            # Секции 2–5
            sections = cfg.TEST_SECTIONS[1:]
            for i, sec in enumerate(sections):
                idx = i + 2
                log(f"[{idx}/5] Открываем «{sec['name']}»...")
                selector = sec.get("selector")
                ok = True
                err_msg = None

                if selector:
                    try:
                        expand_sel = cfg.EXPAND_BEFORE.get(selector)
                        if expand_sel:
                            el = page.query_selector(expand_sel)
                            if el:
                                el.click()
                                page.wait_for_timeout(300)
                        loc = page.locator(selector).first
                        loc.wait_for(state="visible", timeout=cfg.ELEMENT_TIMEOUT)
                        loc.click()
                        page.wait_for_timeout(800)
                    except Exception as e:
                        ok = False
                        err_msg = str(e)

                if ok:
                    if sec["name"] == "Сводная аналитика":
                        chart_or_table = page.query_selector("#rd_chart, #rd_table, .dashboard-summary")
                        if chart_or_table:
                            log("  ✓ Раздел открыт")
                            log("  ✓ Таблица видна")
                        else:
                            log("  ✓ Раздел открыт")
                    elif sec["name"] == "Пользователи":
                        rows = page.query_selector_all("#content table tbody tr")
                        cnt = len(rows)
                        log(f"  ✓ Таблица пользователей загружена ({cnt} пользователей)" if cnt > 0 else "  ✓ Раздел загружен")
                    else:
                        log("  ✓ Раздел загружен")
                else:
                    log(f"  ✗ Ошибка: {err_msg}")

                ss_path = SCREENSHOTS_DIR / f"{sec['screenshot_name']}.png"
                page.screenshot(path=str(ss_path))
                log(f"  📸 Скриншот сохранён: {ss_path}")
                results.append({"step": sec["name"], "ok": ok})
                log("")

        except Exception as e:
            log(f"❌ Критическая ошибка: {e}")
            results.append({"step": "Ошибка", "ok": False})
        finally:
            browser.close()

    total_elapsed = time.time() - total_start
    ok_count = sum(1 for r in results if r.get("ok"))
    fail_count = len(results) - ok_count

    log("=" * 50)
    log(f"✅ Тестирование завершено за {total_elapsed:.1f} сек")
    log(f"📊 Всего проверок: {len(results)}")
    log(f"  ✓ Успешно: {ok_count}")
    log(f"  ✗ Ошибок: {fail_count}")
    log("")

    # Сохранение отчёта
    report_name = f"report_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.html"
    report_path = REPORTS_DIR / report_name
    screenshots_rel = [f"{cfg.SCREENSHOTS_DIR}/{s.name}" for s in sorted(SCREENSHOTS_DIR.glob("*.png"))]

    html_parts = [
        "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Отчёт тестирования</title>",
        "<style>body{font-family:system-ui;max-width:900px;margin:24px auto;padding:0 16px}",
        "table{border-collapse:collapse;width:100%;margin:16px 0}",
        "th,td{border:1px solid #ddd;padding:10px;text-align:left}",
        "th{background:#0d9488;color:#fff}",
        ".ok{color:#059669}.fail{color:#dc2626}",
        "img{max-width:100%;height:auto;border:1px solid #eee;margin:12px 0}",
        "h2{margin-top:24px;border-bottom:2px solid #0d9488}</style></head><body>",
        "<h1>Отчёт тестирования SDS</h1>",
        f"<p><strong>Дата:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>",
        f"<p><strong>Время выполнения:</strong> {total_elapsed:.1f} сек</p>",
        "<h2>Результаты</h2>",
        "<table><tr><th>Шаг</th><th>Результат</th></tr>",
    ]
    for r in results:
        cls = "ok" if r.get("ok") else "fail"
        sym = "✓" if r.get("ok") else "✗"
        html_parts.append(f"<tr><td>{r.get('step', '')}</td><td class='{cls}'>{sym}</td></tr>")
    html_parts.append("</table>")
    html_parts.append("<h2>Скриншоты</h2>")
    for rel in screenshots_rel:
        full = TEST_DIR / rel
        if full.exists():
            html_parts.append(f"<p><strong>{Path(rel).stem}</strong></p>")
            html_parts.append(f"<img src='../{rel}' alt='{rel}' style='max-width:800px'>")

    html_parts.append("</body></html>")
    report_path.write_text("\n".join(html_parts), encoding="utf-8")

    log_path = REPORTS_DIR / "log.txt"
    log_path.write_text("\n".join(log_lines), encoding="utf-8")

    log(f"📄 Отчёт сохранён: {report_path}")
    log(f"📋 Логи: {log_path}")


if __name__ == "__main__":
    main()
