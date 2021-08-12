@echo off
echo ---------------------------------------------------

if "%~1"=="" goto end

set fileName=%~nx1
set filePath=%~dp1
set filePath=%filePath:~0,-1%
set backupPath=%filePath%\_backup

if not exist "%backupPath%" mkdir "%backupPath%"

echo fileName^: %fileName%
echo filePath^: %filePath%
echo backupPath^: %backupPath%

setlocal enabledelayedexpansion
FOR /F "skip=1 tokens=1-6" %%A IN ('WMIC Path Win32_LocalTime Get Day^,Hour^,Minute^,Month^,Second^,Year /Format:table') DO (
    if "%%B" NEQ "" (
        SET /A FDATE=%%F*10000+%%D*100+%%A
    )
)
set backupStamp=%FDATE%_%time:~0,2%%time:~3,2%_%username%
REM echo backupStamp^: %backupStamp%

set backupFilePath=%backupPath%\%fileName%_@%backupStamp%.zip
REM echo backupFilePath^: %backupFilePath%

set excludes=
set excludes=--exclude=*~ --exclude=*/frames/*

set cmdParams=%excludes% -cvf "%backupFilePath%" -C "%filePath%" "%fileName%"

REM echo ---------------------------------------------------
REM echo CMD^: %cmdParams%
REM echo ---------------------------------------------------

tar %cmdParams%

echo ^<^:^<%backupFilePath%^>^:^>

:end
::pause