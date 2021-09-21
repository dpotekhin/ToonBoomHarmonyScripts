@echo off

REM echo %PATH%
REM echo -------------------------------------------

set TBPath=

call :Iterate "%PATH%"

if not "%TBPath%"=="" set zipPath="%TBPath%\bin_3rdParty\7z"

echo TBPath ^= %TBPath%
echo zipPath ^= %zipPath%

EXIT /B %ERRORLEVEL%

REM ----
:Iterate
for /f "tokens=1,* delims=;" %%a in ("%~1") do (
	REM echo AAA %%a
	REM echo BBB %%b
	
	REM Echo.%%a | FIND /I "Toon Boom Harmony">nul && (
		REM Echo.TRUE
	REM ) || (
		REM Echo.FALSE
	REM )
	
	Echo.%%a | FIND /I "\Toon Boom Harmony">nul && (
		Echo.%%a | FIND /I "win64">nul && (
			REM Echo %%a
			set TBPath=%%a
		)
	)
	
	REM echo ---
	if "%TBPath%"=="" if not %%b=="" call :Iterate "%%b"
)
EXIT /B 0
