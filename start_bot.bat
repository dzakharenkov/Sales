@echo off
chcp 65001 >nul
cd /d "%~dp0"
setlocal EnableExtensions

echo ========================================
echo   START TELEGRAM BOT (SINGLE INSTANCE)
echo ========================================

powershell -NoProfile -Command ^
  "$ps = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -like '*src.telegram_bot.bot*' }; if($ps){ $ps | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; Write-Host ('[OK] Stopped old instances: ' + ($ps|Measure-Object|Select-Object -ExpandProperty Count)) } else { Write-Host '[OK] No running bot process found.' }"

if not exist ".env" (
  echo [ERROR] .env not found in project root.
  goto :END
)

for /f "tokens=1,* delims==" %%A in ('findstr /B /C:"TELEGRAM_BOT_TOKEN=" ".env"') do set "BOT_TOKEN=%%B"
if "%BOT_TOKEN%"=="" (
  echo [ERROR] TELEGRAM_BOT_TOKEN is empty in .env
  goto :END
)

set "PY_EXE="
if exist ".venv\Scripts\python.exe" set "PY_EXE=.venv\Scripts\python.exe"
if not defined PY_EXE (
  for /f "delims=" %%P in ('where python 2^>nul') do (
    if not defined PY_EXE set "PY_EXE=%%P"
  )
)

if not defined PY_EXE (
  echo [ERROR] Python executable not found.
  goto :END
)

echo Python: %PY_EXE%
echo Log file: telegram_bot_local.log
start "telegram-bot" /min cmd /c ""%PY_EXE%" -m src.telegram_bot.bot >> telegram_bot_local.log 2>&1"
timeout /t 2 /nobreak >nul

for /f %%C in ('powershell -NoProfile -Command "(Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -like '*src.telegram_bot.bot*' } | Measure-Object).Count"') do set "BOT_COUNT=%%C"
if "%BOT_COUNT%"=="0" (
  echo [ERROR] Bot did not start. Check telegram_bot_local.log
  goto :END
)

echo [OK] Bot started. Running processes: %BOT_COUNT%

:END
echo.
if /I "%~1"=="--no-pause" (
  endlocal
  exit /b 0
)
pause
