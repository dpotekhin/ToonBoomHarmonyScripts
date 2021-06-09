:: goto skipfunctions
call:%*
exit/b

:: ============================================================
:: CREATE SHORTCUT
:: ============================================================
:createShortcut
SETLOCAL ENABLEDELAYEDEXPANSION
SET Esc_LinkDest=%~1
SET Esc_LinkTarget=%~2
SET cSctVBS=CreateShortcut.vbs
((
  echo Set oWS = WScript.CreateObject^("WScript.Shell"^) 
  echo sLinkFile = oWS.ExpandEnvironmentStrings^("!Esc_LinkDest!"^)
  echo Set oLink = oWS.CreateShortcut^(sLinkFile^) 
  echo oLink.TargetPath = oWS.ExpandEnvironmentStrings^("!Esc_LinkTarget!"^)
  echo oLink.Save
)1>!cSctVBS!
cscript //nologo .\!cSctVBS!
DEL !cSctVBS! /f /q
)
EXIT /B 0

:: :skipfunctions