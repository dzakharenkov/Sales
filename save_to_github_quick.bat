@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Сохранение на GitHub...

git add . >nul 2>&1
git commit -m "Обновление: %date% %time%" >nul 2>&1
git push >nul 2>&1

if errorlevel 1 (
    echo Ошибка! Проверьте подключение к GitHub.
    pause
) else (
    echo ✓ Готово!
    timeout /t 2 >nul
)
