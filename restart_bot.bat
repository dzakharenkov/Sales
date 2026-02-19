@echo off
chcp 65001 >nul
cd /d "%~dp0"
setlocal

echo ========================================
echo   RESTART TELEGRAM BOT
echo ========================================
call stop_bot.bat --no-pause
echo.
call start_bot.bat --no-pause
echo.
echo [OK] Restart finished.
echo.
pause
