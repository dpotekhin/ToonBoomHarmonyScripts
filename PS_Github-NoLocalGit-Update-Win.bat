@echo off

set dest=%~dp0
set zipDest=%dest%ps-github-src.zip
set extractedPath=%dest%ToonBoomHarmonyScripts-main

bitsadmin.exe /transfer "Download" /download /priority FOREGROUND "https://github.com/dpotekhin/ToonBoomHarmonyScripts/archive/refs/heads/main.zip" "%zipDest%"

if not exist "%zipDest%" (
	echo the zip file not found. quit
	goto _exit
)
Call :UnZipFile "%dest%" "%zipDest%"

if not exist "%extractedPath%" (
	echo extracted folder not found. quit
	goto _exit
)
echo Copy from "%extractedPath%"
xcopy /s /y "%extractedPath%" "%dest%"

echo Remove extracted "%extractedPath%"
RMDIR /s /q "%extractedPath%"

:_exit
REM pause
exit /b

:UnZipFile <ExtractTo> <newzipfile>
set vbs="%temp%\_.vbs"
if exist %vbs% del /f /q %vbs%
>%vbs%  echo Set fso = CreateObject("Scripting.FileSystemObject")
>>%vbs% echo If NOT fso.FolderExists(%1) Then
>>%vbs% echo fso.CreateFolder(%1)
>>%vbs% echo End If
>>%vbs% echo set objShell = CreateObject("Shell.Application")
>>%vbs% echo set FilesInZip=objShell.NameSpace(%2).items
>>%vbs% echo objShell.NameSpace(%1).CopyHere(FilesInZip)
>>%vbs% echo Set fso = Nothing
>>%vbs% echo Set objShell = Nothing
cscript //nologo %vbs%
if exist %vbs% del /f /q %vbs%

