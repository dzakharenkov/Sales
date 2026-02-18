@echo off
chcp 65001 > nul
echo ========================================
echo Starting SDS API locally on port 8000
echo ========================================
echo.

cd /d %~dp0

echo Activating venv...
call venv\Scripts\activate.bat

echo.
echo Starting API with uvicorn...
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

pause
