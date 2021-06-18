set pathName=0
set pathName=frames/final

set writeNode=0
::set writeNode=Write-Main

::set forceVideo=0
set forceVideo=1

set size=0
::set size=1920x1080x41.112

call render.bat 0 0 %writeNode% %pathName% %forceVideo% %size%