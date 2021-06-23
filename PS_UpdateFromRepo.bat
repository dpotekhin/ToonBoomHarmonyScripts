@echo off
setlocal

echo [93m Installed Git is required. (https://git-scm.com/downloads) [0m

set tempFolderName=.ps-temp
set tempFolderAbsolutePath="%cd%\%tempFolderName%"
::echo %tempFolderAbsolutePath% %cd%
::GOTO END

SET /P AREYOUSURE=[93m All "PS_*" files and folders will be replaced with the actual ones. Are you sure (Y/[N])? [0m
IF /I "%AREYOUSURE%" NEQ "Y" GOTO END

rmdir /S /Q %tempFolderAbsolutePath%

git clone --branch dev https://github.com/dpotekhin/ToonBoomHarmonyScripts.git %tempFolderAbsolutePath%

robocopy %tempFolderAbsolutePath% "%cd%" /j /DCOPY:T /XD .git /XF .gitignore README.md /E /R:2 /W:5 /MT:16

:END
echo [93m COMPLETE [0m