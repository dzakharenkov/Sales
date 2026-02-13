@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM ========== НАСТРОЙКИ ==========
set SERVER=dima@45.141.76.83
set HOST=45.141.76.83
set REMOTE_PATH=/var/www/sales.zakharenkov.ru/html
REM ================================

echo ========================================
echo   Копирование на сервер Ubuntu
echo ========================================
echo   Сервер: %SERVER%
echo   Папка:  %REMOTE_PATH%
echo.

REM Добавить хост в known_hosts (убрать запрос yes/no)
if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh"
echo Добавление хоста в trusted...
ssh-keyscan -H %HOST% >> "%USERPROFILE%\.ssh\known_hosts" 2>nul
echo.

echo   Пароль будет запрошен при подключении
echo ========================================
echo.

scp -r src migrations requirements.txt .env.example sales_sql.sql %SERVER%:%REMOTE_PATH%/
if errorlevel 1 (
    echo [ОШИБКА] Не удалось скопировать
    pause
    exit /b 1
)

echo.
echo   ✓ Файлы скопированы
echo.
pause
