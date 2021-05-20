:: Version 210520
::									1				2					3								4										5
:: =============================================================================================================================================================
:: Options: render-main.bat [Start Frame | 0] [End Frame | 0] [Write Node Name | 0] [Relative Movie Path | 1 (Just Force Video Fromat)] [WidthxHeight | 0]
:: =============================================================================================================================================================
:: ToDo: to fix line weight when resolution is less than original

@echo off

:: Help
if "%~1"=="help" (

	echo Options:
	echo 1: Start Frame ^| 0
	echo 2: End Frame ^| 0
	echo 3: Write Node Name ^| 0 ^(Default: "Main-Write"^)
	echo 4: Relative Movie Path ^(The target folder must exist!^) ^| 1 ^(Just Force Video Fromat^)
	echo 5: WIDTHxHEIGHTxFOV ^| 0
	
	goto end
)

echo ................................................

set startTime=%time%
echo RENDER STARTED: %startTime%

:: the name of the Write Node to be rendered
:: Also it may be obtained as parameters of the bat file, like: render-main.bat 0 0 Main-Write
set writeNode=Write
if not "%~3"=="" if not "%~3"=="0" set writeNode=%3

:: Time range
:: Also it may be obtained as parameters of the bat file
set timerange=
if not "%~1"=="" if not "%~1"=="0" if not "%~2"=="" if not "%~2"=="0" set timerange=-frames %1 %2
:: set timerange=-frames 10 15

:: the name of the current scene file is defined automatically
set sceneName=0
for %%f in (*.xstage) do (
    if "%%~xf"==".xstage" set filename=%%f
)

if %filename%==0 (
	echo No scene file found
	GOTO end
)

:: Resolution
::set resolution=-resolution 640 360
set resolution=
set width=
set height=
set fov=
FOR /f "tokens=1,2,3,4 delims=x" %%a IN ("%~5") do set width=%%a& set height=%%b& set fov=%%c
::echo width=%width% height=%height%
if not "%~5"=="" if not "%~5"=="0" if not "%fov%"=="" (
	:: *1.777777777777778
	set resolution=-resolution %width% %height% %fov%
) else (echo Default resolution.)
echo Resolution: %resolution%

:: Pre Render script
set preRenderScript=
:: set preRenderScript=node.getNodes(['WRITE']).forEach(function(n){node.setEnable(n,false)});node.setEnable('Top/%writeNode%', true)
set preRenderScript=node.getNodes(['WRITE']).forEach(function(n){node.setEnable(n,false)}); var nodeName='Top/%writeNode%'; node.setEnable(nodeName,true);

:: Force Video format
if not "%~1"=="" (
	set "preRenderScript=%preRenderScript% node.getAttr(nodeName,1,'MOVIE_FORMAT').setValue( 'com.toonboom.mp4.1.0' ); node.getAttr(nodeName,1,'EXPORT_TO_MOVIE').setValue('Output Movie');"	
)
if not "%~1"==1 set "preRenderScript=%preRenderScript% node.getAttr(nodeName,1,'MOVIE_PATH').setValue('%4');"

:: Add a Colour Card
set "preRenderScript=%preRenderScript% var comp=node.srcNode(nodeName,0); if(node.type(comp)=='COMPOSITE'){var cc=node.add(node.parentNode(nodeName),'__TEMPCC__','COLOR_CARD', 100,100,0); node.link(cc,0,comp,0,false,true);}


:: Start render
echo Render node "%writeNode%" of Scene "%filename%"
echo From frame:%1, to:%2. Used Time range: %timerange%

:: Harmony render command below
:: !!! HarmonyPremium.exe must to be added to System Variables
set executeString=HarmonyPremium -batch %timerange% -preRenderInlineScript "%preRenderScript%" %resolution% .\%filename%

echo Execute: %executeString%

start /wait /low %executeString%

set endTime=%time%

:: Calculate duration
set /A STARTTIME=(1%startTime:~0,2%-100)*360000 + (1%startTime:~3,2%-100)*6000 + (1%startTime:~6,2%-100)*100 + (1%startTime:~9,2%-100)
set /A endTime=(1%endTime:~0,2%-100)*360000 + (1%endTime:~3,2%-100)*6000 + (1%endTime:~6,2%-100)*100 + (1%endTime:~9,2%-100)
set /A DURATION=%endTime%-%startTime%
if %endTime% LSS %startTime% set set /A DURATION=%startTime%-%endTime%
set /A DURATIONH=%DURATION% / 360000
set /A DURATIONM=(%DURATION% - %DURATIONH%*360000) / 6000
set /A DURATIONS=(%DURATION% - %DURATIONH%*360000 - %DURATIONM%*6000) / 100
set /A DURATIONHS=(%DURATION% - %DURATIONH%*360000 - %DURATIONM%*6000 - %DURATIONS%*100)
if %DURATIONH% LSS 10 set DURATIONH=0%DURATIONH%
if %DURATIONM% LSS 10 set DURATIONM=0%DURATIONM%
if %DURATIONS% LSS 10 set DURATIONS=0%DURATIONS%
if %DURATIONHS% LSS 10 set DURATIONHS=0%DURATIONHS%
::

echo RENDER COMPLETE: %time% ^( %DURATIONH%:%DURATIONM%:%DURATIONS%,%DURATIONHS% ^)
echo ...

:end
