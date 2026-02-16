@echo off
cd /d "%~dp0"

REM ========== SETTINGS ==========
set SERVER=dima@45.141.76.83
set HOST=45.141.76.83
set REMOTE_PATH=/var/www/sales.zakharenkov.ru/html
REM ================================

echo ========================================
echo   Deploy to Ubuntu server
echo ========================================
echo   Server: %SERVER%
echo   Path:   %REMOTE_PATH%
echo.

REM Ensure .ssh exists for known_hosts
if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh"
echo Adding host to trusted...
ssh-keyscan -H %HOST% >> "%USERPROFILE%\.ssh\known_hosts" 2>nul
echo.

echo   Password will be prompted on connect
echo ========================================
echo.

scp -r src migrations requirements.txt .env sales_sql.sql %SERVER%:%REMOTE_PATH%/
if errorlevel 1 (
    echo [ERROR] Copy failed
    pause
    exit /b 1
)

echo.
echo   Done. Files copied.
echo.
pause
