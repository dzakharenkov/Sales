@echo off
chcp 65001 >nul
cd /d "%~dp0"
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
set /p COMMIT_MSG="Введите описание изменений: "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Обновление проекта
)

echo.
echo [3/3] Создание коммита и отправка на GitHub...
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
