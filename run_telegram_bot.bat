@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   SDS — Telegram-бот (@uz_sales_bot)
echo ========================================
echo.

:: --- Проверяем, не запущен ли уже бот ---
set "BOT_FOUND=0"
for /f "tokens=2" %%a in ('wmic process where "commandline like '%%src.telegram_bot.bot%%' and name='python.exe'" get processid 2^>nul ^| findstr /r "[0-9]"') do (
    set "BOT_FOUND=1"
)
for /f "tokens=2" %%a in ('wmic process where "commandline like '%%telegram_bot%%' and name='python.exe'" get processid 2^>nul ^| findstr /r "[0-9]"') do (
    set "BOT_FOUND=1"
)

if "%BOT_FOUND%"=="1" (
    echo [WARN] Обнаружены предыдущие процессы бота!
    echo [INFO] Завершаю старые процессы...
    for /f "tokens=2" %%a in ('wmic process where "commandline like '%%src.telegram_bot.bot%%' and name='python.exe'" get processid 2^>nul ^| findstr /r "[0-9]"') do (
        echo        Убиваю PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    for /f "tokens=2" %%a in ('wmic process where "commandline like '%%telegram_bot%%' and name='python.exe'" get processid 2^>nul ^| findstr /r "[0-9]"') do (
        echo        Убиваю PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    echo [OK]   Старые процессы завершены.
    echo [INFO] Жду 3 сек, чтобы Telegram освободил сессию...
    timeout /t 3 /nobreak >nul
    echo.
) else (
    echo [OK]   Предыдущих процессов бота не найдено.
    echo.
)

echo [INFO] Запускаю бота...
echo [INFO] Для остановки нажмите Ctrl+C
echo.
python -m src.telegram_bot.bot
pause
