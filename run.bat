@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   Запуск SDS API (Sale Distribution System)
echo ========================================
echo.

REM Проверка наличия Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Python не найден! Установите Python 3.11 или 3.12
    pause
    exit /b 1
)

REM Если используете venv — раскомментируйте и укажите путь:
REM set PYTHON=D:\Python\.venv\Scripts\python.exe
if defined PYTHON (set "PY=!PYTHON!") else (set "PY=python")

echo [INFO] Откройте в браузере: http://127.0.0.1:8000  (или /login)
echo [INFO] Для тихого режима запустите run_dev.bat
echo.
echo [INFO] Запуск сервера...
echo.

"%PY%" -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
pause
