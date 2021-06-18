set fileName=all_640x360

set startFrame=0
set endFrame=0
if not "%~1"=="" if not "%~2"=="" (
	set startFrame=%~1
	set endFrame=%~2
	set fileName=%~1-%~2_640x360
)

if not "%~3"=="" set fileName=%~3

call render.bat %startFrame% %endFrame% 0 frames/%fileName% 1 640x360x41.112 1