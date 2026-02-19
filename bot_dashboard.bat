@echo off
chcp 65001 >nul
cd /d "%~dp0"
setlocal EnableDelayedExpansion

:MENU
cls
echo ========================================
echo   TELEGRAM BOT DASHBOARD
echo ========================================
echo.
echo 1. Start bot
echo 2. Stop bot
echo 3. Restart bot
echo 4. Status
echo 5. Live logs
echo 6. Exit
echo.
set /p CHOICE=Select option [1-6]: 

if "%CHOICE%"=="1" (
  call start_bot.bat
  goto MENU
)
if "%CHOICE%"=="2" (
  call stop_bot.bat
  goto MENU
)
if "%CHOICE%"=="3" (
  call restart_bot.bat
  goto MENU
)
if "%CHOICE%"=="4" (
  call status_bot.bat
  goto MENU
)
if "%CHOICE%"=="5" (
  call logs_bot.bat
  goto MENU
)
if "%CHOICE%"=="6" (
  exit /b 0
)

echo Invalid option.
timeout /t 1 /nobreak >nul
goto MENU
