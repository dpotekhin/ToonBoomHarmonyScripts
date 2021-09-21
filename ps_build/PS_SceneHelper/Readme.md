## PS_SceneHelpers
v0.210921

### Description
A set of scene helper scripts.

### Usage
#### PS_ReopenScene
Closes and opens the current scene.
Package adds the Main Menu item: File / Reopen Scene

#### PS_OpenSceneFolder
Opens scene folder in file explorer.
Package adds the Main Menu item: File / Open Scene Folder

#### PS_BackupScene
Archives the current scene to ../_backup/<SCENE-NAME>_<YYYYMMDD>_<HHMM>_<USER-NAME>.zip
Package adds the Main Menu item: File / Backup / Backup Scene
( Click + Ctrl to open _backup folder on archiving complete )

#### PS_OpenBackupFolder
Opens the Backup folder ../_backup
Package adds the Main Menu item: File / Backup / Open Backup Folder

#### PS_OpenScriptsFolder
Opens Harmony User scripts folder
Package adds the Main Menu item: File / Resources / Open User Scripts Folder

#### PS_OpenTemplateFolder
Opens a folder of the selected template in the Library window
Package adds the Main Menu item: File / Resources / Open Selected Library Template Folder 

#### PS_OpenPencilTextureFolder
Opens the default Pencil Texture folder
Package adds the Main Menu item: File / Resources / Open Pencil Texture Folder

### Installation:
Copy all files from this folder to [Harmony User Scripts directory](https://docs.toonboom.com/help/harmony-20/premium/scripting/import-script.html).\
Add scripts "PS_ReopenScene", "PS_OpenSceneFolder", "PS_OpenTemplateFolder", "PS_OpenScriptsFolder", "PS_OpenPencilTextureFolder", "PS_BackupScene", "PS_OpenBackupFolder" to a panel.  
Don't copy folder "packages" if you don't want to add items to the Main Menu.