@echo off
chcp 65001 >nul
cd /d "%~dp0"
setlocal

echo ========================================
echo   TELEGRAM BOT STATUS
echo ========================================
powershell -NoProfile -Command ^
  "$p = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'python.exe' -and $_.CommandLine -like '*src.telegram_bot.bot*' }; if($p){ Write-Host ('[OK] Running instances: ' + ($p | Measure-Object | Select-Object -ExpandProperty Count)); $p | Select-Object ProcessId,CommandLine | Format-Table -AutoSize } else { Write-Host '[INFO] Bot is not running.' }"

echo.
if exist telegram_bot_local.log (
  echo Last log lines:
  powershell -NoProfile -Command "Get-Content telegram_bot_local.log -Tail 20"
) else (
  echo Log file not found: telegram_bot_local.log
)
echo.
pause
