@echo off
chcp 65001 >nul
cd /d "%~dp0"
setlocal

echo ========================================
echo   STOP TELEGRAM BOT
echo ========================================
powershell -NoProfile -Command ^
  "$ps = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -like '*src.telegram_bot.bot*' }; if($ps){ $ps | ForEach-Object { Write-Host ('[INFO] Killing PID ' + $_.ProcessId); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; Write-Host '[OK] Bot stopped.' } else { Write-Host '[OK] No running bot process found.' }"

echo.
if /I "%~1"=="--no-pause" (
  endlocal
  exit /b 0
)
pause
