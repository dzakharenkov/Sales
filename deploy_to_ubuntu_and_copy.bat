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

echo ========================================
echo   Сохранение изменений на GitHub
echo ========================================
echo.

REM Проверка наличия git
git --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Git не найден! Установите Git с https://git-scm.com
    pause
    exit /b 1
)

echo [1/3] Проверка изменений...
git status --short
echo.

echo [2/3] Добавление всех изменений...
git add .
if errorlevel 1 (
    echo [ОШИБКА] Не удалось добавить файлы
    pause
    exit /b 1
)

echo.
set COMMIT_MSG=Версия %date% %time%
echo [3/3] Создание коммита: "%COMMIT_MSG%"...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Возможно, нет изменений для коммита
)

git push
if errorlevel 1 (
    echo [ОШИБКА] Не удалось отправить на GitHub
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ Изменения успешно сохранены на GitHub!
echo ========================================
echo.
pause
