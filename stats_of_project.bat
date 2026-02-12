@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   SDS — Статистика проекта
echo ========================================
echo.

set "TOTAL_FILES=0"
set "TOTAL_LINES=0"
set "TOTAL_BYTES=0"

set "PY_FILES=0"
set "PY_LINES=0"
set "HTML_FILES=0"
set "HTML_LINES=0"
set "JS_FILES=0"
set "JS_LINES=0"
set "SQL_FILES=0"
set "SQL_LINES=0"
set "BAT_FILES=0"
set "BAT_LINES=0"
set "MD_FILES=0"
set "MD_LINES=0"
set "OTHER_FILES=0"
set "OTHER_LINES=0"

:: --- Считаем Python (.py) ---
for /r %%f in (*.py) do (
    set /a PY_FILES+=1
    set /a TOTAL_FILES+=1
    for %%s in (%%f) do set /a TOTAL_BYTES+=%%~zs
    for /f %%n in ('type "%%f" 2^>nul ^| find /c /v ""') do set /a PY_LINES+=%%n
)

:: --- Считаем HTML (.html) ---
for /r %%f in (*.html) do (
    set /a HTML_FILES+=1
    set /a TOTAL_FILES+=1
    for %%s in (%%f) do set /a TOTAL_BYTES+=%%~zs
    for /f %%n in ('type "%%f" 2^>nul ^| find /c /v ""') do set /a HTML_LINES+=%%n
)

:: --- Считаем JS (.js) ---
for /r %%f in (*.js) do (
    set /a JS_FILES+=1
    set /a TOTAL_FILES+=1
    for %%s in (%%f) do set /a TOTAL_BYTES+=%%~zs
    for /f %%n in ('type "%%f" 2^>nul ^| find /c /v ""') do set /a JS_LINES+=%%n
)

:: --- Считаем SQL (.sql) ---
for /r %%f in (*.sql) do (
    set /a SQL_FILES+=1
    set /a TOTAL_FILES+=1
    for %%s in (%%f) do set /a TOTAL_BYTES+=%%~zs
    for /f %%n in ('type "%%f" 2^>nul ^| find /c /v ""') do set /a SQL_LINES+=%%n
)

:: --- Считаем BAT (.bat) ---
for /r %%f in (*.bat) do (
    set /a BAT_FILES+=1
    set /a TOTAL_FILES+=1
    for %%s in (%%f) do set /a TOTAL_BYTES+=%%~zs
    for /f %%n in ('type "%%f" 2^>nul ^| find /c /v ""') do set /a BAT_LINES+=%%n
)

:: --- Считаем Markdown (.md) ---
for /r %%f in (*.md) do (
    set /a MD_FILES+=1
    set /a TOTAL_FILES+=1
    for %%s in (%%f) do set /a TOTAL_BYTES+=%%~zs
    for /f %%n in ('type "%%f" 2^>nul ^| find /c /v ""') do set /a MD_LINES+=%%n
)

:: --- Считаем TXT, JSON, CFG и прочие текстовые ---
for /r %%f in (*.txt *.json *.cfg *.ini *.yml *.yaml *.toml *.env.example) do (
    set /a OTHER_FILES+=1
    set /a TOTAL_FILES+=1
    for %%s in (%%f) do set /a TOTAL_BYTES+=%%~zs
    for /f %%n in ('type "%%f" 2^>nul ^| find /c /v ""') do set /a OTHER_LINES+=%%n
)

:: --- Суммируем строки ---
set /a TOTAL_LINES=PY_LINES+HTML_LINES+JS_LINES+SQL_LINES+BAT_LINES+MD_LINES+OTHER_LINES

:: --- Вычисляем КБ и МБ ---
set /a TOTAL_KB=TOTAL_BYTES/1024
set /a TOTAL_MB_INT=TOTAL_KB/1024
set /a TOTAL_MB_REM=(TOTAL_KB%%1024)*100/1024

echo  Тип файла        Файлов    Строк
echo  ────────────────────────────────────
echo  Python (.py)      %PY_FILES%         %PY_LINES%
echo  HTML (.html)      %HTML_FILES%         %HTML_LINES%
echo  JavaScript (.js)  %JS_FILES%         %JS_LINES%
echo  SQL (.sql)        %SQL_FILES%         %SQL_LINES%
echo  Batch (.bat)      %BAT_FILES%         %BAT_LINES%
echo  Markdown (.md)    %MD_FILES%         %MD_LINES%
echo  Прочие            %OTHER_FILES%         %OTHER_LINES%
echo  ────────────────────────────────────
echo.
echo  ИТОГО:
echo    Файлов:   %TOTAL_FILES%
echo    Строк:    %TOTAL_LINES%
echo    Размер:   %TOTAL_BYTES% байт (%TOTAL_KB% КБ / %TOTAL_MB_INT%.%TOTAL_MB_REM% МБ)
echo.
echo ========================================
pause
