@echo off

:: Just drag and drop folder contains image sequience
::
:: Reqiurememts:
:: - Image names pattern: <folder-name>/<folder-name>_###.png

::echo %~1
::echo %~nx1

:: FRAME RATE
set frameRate=25

:: VIDEO BITRATE
set videoBitrate=-b:v 15000k

:: IMAGE FORMAT
set imageFormat=png

::
set imageName=%~1\%~nx1_%%03d.%imageFormat%
echo imageName^: %imageName%
set outPutName=%~1.mp4
echo outPutName^: %outPutName%

set startTime=%time%


:: CONVERSION
:: ffmpeg -y -r %frameRate% -i %imageName% %videoBitrate% -vcodec libx264 -x264opts keyint=%frameRate% -pix_fmt yuv420p %outPutName%
ffmpeg -i %imageName% -c:v libx264 -c:a aac -pix_fmt yuv420p -profile baseline -refs 2 -crf 21 -r %frameRate% -shortest -y %outPutName%




:: RENDER TIME
set endTime=%time%
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

echo [93m COMPLETE: %time% ^( %DURATIONH%:%DURATIONM%:%DURATIONS%,%DURATIONHS% ^) [0m



:: pause