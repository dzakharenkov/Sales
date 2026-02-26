@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   Deploy to Ubuntu server (with backup)
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python and add it to PATH.
    pause
    exit /b 1
)

echo Running deploy script (deploy_to_ubuntu_and_copy.py)...
echo Logs: D:\Python\Sales\deploy_to_ubuntu_and_copy.log
echo.

python "%~dp0deploy_to_ubuntu_and_copy.py"

if errorlevel 1 (
    echo.
    echo [ERROR] Deploy script failed. Check log file:
    echo D:\Python\Sales\deploy_to_ubuntu_and_copy.log
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deploy and service restart completed
echo ========================================
echo.

echo ========================================
echo   Save changes to GitHub
echo ========================================
echo.

REM Check git
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git not found. Install Git from https://git-scm.com
    pause
    exit /b 1
)

echo [1/3] Check changes...
git status --short
echo.

echo [1.1/3] Check for leaked secrets...
git grep -n -I -E "sntryu_[a-f0-9]{64}" -- . ":(exclude)deploy_to_ubuntu_and_copy.bat" >nul 2>&1
if not errorlevel 1 (
    echo [ERROR] Potential Sentry token found in tracked files.
    git grep -n -I -E "sntryu_[a-f0-9]{64}" -- . ":(exclude)deploy_to_ubuntu_and_copy.bat"
    echo Remove secrets before commit/push.
    pause
    exit /b 1
)

echo [2/3] Stage changes...
git add -A

REM Do not include backup archives in commits
for %%F in (beckaps\*.zip) do git reset -q -- "%%F" >nul 2>&1

if errorlevel 1 (
    echo [ERROR] Failed to stage files.
    pause
    exit /b 1
)

echo.
set COMMIT_MSG=Version %date% %time%
echo [3/3] Create commit: "%COMMIT_MSG%"...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo [WARNING] Nothing to commit.
)

git push
if errorlevel 1 (
    echo [ERROR] Failed to push to GitHub.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Changes pushed to GitHub successfully
echo ========================================
echo.
pause
