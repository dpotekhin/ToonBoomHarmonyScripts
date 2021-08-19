@echo off
echo ---------------------------------------------------

if "%~1"=="" goto end

set fileName=%~nx1
set filePath=%~dp1
set filePath=%filePath:~0,-1%
set backupPath=%filePath%\_backup
REM set zipPath=%~dp0
REM set zipPath=%zipPath%\..\bin\7z

set curPath=%~dp0
call "%curPath%7zip-path.bat"

if not exist "%backupPath%" mkdir "%backupPath%"

echo fileName^: %fileName%
echo filePath^: %filePath%
echo backupPath^: %backupPath%
echo zipPath^: %zipPath%

REM %zipPath% -h
REM goto end

FOR /F "skip=1 tokens=1-6" %%A IN ('WMIC Path Win32_LocalTime Get Day^,Hour^,Minute^,Month^,Second^,Year /Format:table') DO (
    if "%%B" NEQ "" (
        SET /A FDATE=%%F*10000+%%D*100+%%A
    )
)
set backupStamp=%FDATE%_%time:~0,2%%time:~3,2%_%username%
echo backupStamp^: %backupStamp%

setlocal enabledelayedexpansion

set fileList=
set count=0
for %%I IN (%*) DO (
	set /a count+=1
	set "fileList=!fileList! ^"!filePath!\%%~nxI^" "
)

set backupFilePath=%backupPath%\%fileName%_@%backupStamp%.zip
echo backupFilePath^: %backupFilePath%

setlocal DISABLEDELAYEDEXPANSION

REM set excludes
set excludes=-xr^!*~ -xr^!*/frames/*

set cmdParams=-tzip -ssw -mx1 -r0 -y %excludes% "%backupFilePath%" %fileList%

echo ---------------------------------------------------
echo CMD^: %cmdParams%
echo ---------------------------------------------------

REM goto end
%zipPath% a %cmdParams%

echo ^<^:^<%backupFilePath%^>^:^>

:end
REM pause