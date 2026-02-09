@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   Запуск SDS API (тихий режим)
echo ========================================
echo.

if defined PYTHON (set "PY=!PYTHON!") else (set "PY=python")

REM Меньше логов: только предупреждения и ошибки
set LOG_LEVEL=WARNING
echo [INFO] Откройте в браузере: http://127.0.0.1:8000  (или /login)
echo [INFO] Режим: тихий (меньше логов)
echo.
echo [INFO] Запуск сервера...
echo.

"%PY%" -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload --log-level warning
pause
