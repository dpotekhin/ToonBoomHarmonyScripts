set hideList=Main-BI

set pathName=0
set pathName=frames/final

set writeNode=0
::set writeNode=Write-Main

::set forceVideo=0
set forceVideo=1

set size=0
::set size=1920x1080x41.112

set startFrame=0
set endFrame=0
if not "%~1"=="" if not "%~2"=="" (
	set startFrame=%~1
	set endFrame=%~2
)

call render.bat %startFrame% %endFrame% %writeNode% %pathName% %forceVideo% %size%