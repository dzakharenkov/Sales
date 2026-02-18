@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   ОСТАНАВЛИВАЮ ВСЕ СТАРЫЕ ПРОЦЕССЫ БОТА
echo ========================================
taskkill /F /IM python.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Все процессы Python остановлены
echo.

echo ========================================
echo   ЗАПУСКАЮ БОТА (ТОЛЬКО ОДИН ЭКЗЕМПЛЯР)
echo ========================================
echo Логи будут в: telegram_bot_local.log
echo.
start /B python -m src.telegram_bot.bot > telegram_bot_local.log 2>&1
timeout /t 3 /nobreak >nul

echo [OK] Бот запущен!
echo.
echo ВАЖНО: НЕ ЗАПУСКАЙ ЭТОТ СКРИПТ ЕЩЕ РАЗ!
echo        Один экземпляр уже работает!
echo.
echo Для просмотра логов:
echo   tail -f telegram_bot_local.log
echo.
echo Для остановки бота:
echo   taskkill /F /IM python.exe
echo.
pause
