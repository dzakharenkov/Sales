@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   SDS — API-сервер
echo ========================================
echo.
echo [INFO] Откройте в браузере: http://127.0.0.1:8000
echo [INFO] Для остановки нажмите Ctrl+C
echo.
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
pause
