@echo off

:: PARAMS:
::				1					|		2		|
:: shotName (ep003_sq001_sh1980)	|	assetPaths	|

set shotName=%~1
if "%shotName%"=="" (
	set errorMsg=Shot name required ^(Example: ep003_sq001_sh1980^)^.
	goto error
)

call settings.bat

echo ^:^:^:^:^: %shotName% ^:^:^:^:^:

:: COPY FOLDER
Xcopy /e /i /d /y "%animRemotePath%\%shotName%" "%localPath%\%shotName%"

:: CREATE FOLDERS
md "%localPath%\%shotName%\_anim2d"
md "%localPath%\%shotName%\_assets"

:: CREATE SHORTCUTS
CALL lib.bat createShortcut "%localPath%\%shotName%\O.lnk" "%animRemotePath%\%shotName%"
CALL lib.bat createShortcut "%localPath%\%shotName%\O-POSTPROD.lnk" "%postprodRemotePath%\%shotName%"

:: ASSETS
set assetPaths=%~2
echo LIST: %assetPaths%
if not "assetPaths"=="" (
	for %%a in ("%assetPaths:;=" "%") do (
		::echo ASSET: "%assetsRemotePath%\%%~a"
		::echo Local: "%localAssetsPath%\%%~a"
		Xcopy /e /i /d /y "%assetsRemotePath%\%%~a" "%localAssetsPath%\%%~a"
	)
)

echo ^:^:^:^:^: COMPLETE ^:^:^:^:^:

goto end
::

:: ERROR
:error
echo ERROR: %errorMsg%

:: END
:end
EXIT /B %ERRORLEVEL%