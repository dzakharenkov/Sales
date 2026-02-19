@echo off
chcp 65001 >nul
cd /d "%~dp0"
setlocal

if not exist telegram_bot_local.log (
  echo Log file not found: telegram_bot_local.log
  pause
  exit /b 1
)

echo ========================================
echo   TELEGRAM BOT LOGS (LIVE)
echo ========================================
echo Press Ctrl+C to stop viewing logs.
echo.
powershell -NoProfile -Command "Get-Content telegram_bot_local.log -Wait -Tail 100"
