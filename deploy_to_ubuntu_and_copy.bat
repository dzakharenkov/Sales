@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Deploy to Ubuntu server (with backup)
echo ========================================
echo.

REM Проверяем, установлен ли Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python не найден! Установите Python и добавьте его в PATH.
    pause
    exit /b 1
)

echo Запуск скрипта деплоя (deploy_to_ubuntu_and_copy.py)...
echo Логи будут сохраняться в D:\Python\Sales\deploy_to_ubuntu_and_copy.log
echo.

python "%~dp0deploy_to_ubuntu_and_copy.py"

if errorlevel 1 (
    echo.
    echo [ERROR] Возникла ошибка при выполнении скрипта. Проверьте лог-файл:
    echo D:\Python\Sales\deploy_to_ubuntu_and_copy.log
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Деплой и перезапуск сервисов завершены!
echo ========================================
echo.
pause
