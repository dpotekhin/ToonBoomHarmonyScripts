/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_SceneHelpers :]
[Version: 0.220622 :]

[Description:
A set of scene helper scripts.
:]


[Usage:
#### PS_ReloadScene
Closes and opens the current scene.  
Package adds the Main Menu item: File / Reopen Scene

#### PS_OpenSceneFolder
Opens scene folder in file explorer.  
Package adds the Main Menu item: File / Open Scene Folder

#### PS_BackupScene
Archives the current scene to ../_backup/\<SCENE-NAME>\_\<YYYYMMDD>\_\<HHMM>\_\<USER-NAME>.zip  
Package adds the Main Menu item: File / Backup / Backup Scene  
( Click + Ctrl to open _backup folder on archiving complete )

#### PS_OpenBackupFolder
Opens the Backup folder ../_backup  
Package adds the Main Menu item: File / Backup / Open Backup Folder

#### PS_BackupTBHSettings
Backups user Toon Boom Harmony settings
Package adds the Main Menu item: File / Backup / Backup User Settings

#### PS_OpenScriptsFolder
Opens Harmony User scripts folder  
Package adds the Main Menu item: File / Resources / Open User Scripts Folder

#### PS_OpenTemplateFolder
Opens a folder of the selected template in the Library window  
Package adds the Main Menu item: File / Resources / Open Selected Library Template Folder 

#### PS_OpenPencilTextureFolder
Opens the default Pencil Texture folder  
Package adds the Main Menu item: File / Resources / Open Pencil Texture Folder


:]

[Install:
Don't copy folder "packages" if you don't want to add items to the Main Menu.
:]


[ExtraFiles:
packages/PS_Scene
:]
*/

//
var FileSystem = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/FileSystem.js"));
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
//

//
var MODE_OPEN_ONLY = 'mode-open-only';

exports = {
    PS_ReloadScene: PS_ReloadScene,
    PS_OpenSceneFolder: PS_OpenSceneFolder,
    PS_BackupScene: PS_BackupScene,
    PS_OpenBackupFolder: PS_OpenBackupFolder,
    PS_OpenPencilTextureFolder: PS_OpenPencilTextureFolder,
    PS_OpenTemplateFolder: PS_OpenTemplateFolder,
    PS_OpenScriptsFolder: PS_OpenScriptsFolder,
    PS_BackupTBHSettings: PS_BackupTBHSettings,
    MODE_OPEN_ONLY: MODE_OPEN_ONLY,
    MODE_SHOW_FOLDER_ON_COMPLETE: 'mode-show-folder-on-complete',
};


/*
Reopen Scene
*/
function PS_ReloadScene(){
    var scenePath = fileMapper.toNativePath( scene.currentProjectPath() +'/'+ scene.currentScene()+'.xstage' );
    // MessageLog.trace('PS_ReloadScene: '+scenePath );
    scene.closeSceneAndOpenOffline( scenePath );
}

/*
Open Scene folder
(Windows only)
*/
function PS_OpenSceneFolder() {
    var projectPath = fileMapper.toNativePath(scene.currentProjectPathRemapped());
    MessageLog.trace('projectPath: '+projectPath);
    FileSystem.openFolder(projectPath);
}



/*
Open Selected Template folder
(Windows only)
*/
function PS_OpenTemplateFolder(){
	
	var templatePath = library.getSelectedTemplate(0);
	
	if( !templatePath ){
		MessageBox.warning('Please select one template.',false,false,false,'Error');
		return;
	}

	var path = fileMapper.toNativePath( templatePath );
	// MessageLog.trace( 'path: '+path );

  	FileSystem.openFolder(path, true);

}


/*
Open Scripts folder
(Windows only)
*/
function PS_OpenScriptsFolder(){
	
	
	var path = fileMapper.toNativePath( specialFolders.userScripts );
	// MessageLog.trace( 'scripts path: '+path );

  	FileSystem.openFolder(path);

}


/*
Open Scripts folder
(Windows only)
*/
function PS_OpenPencilTextureFolder(){
	
	var path = fileMapper.toNativePath( specialFolders.etc+'\\pencil_texture_textures' );
	MessageLog.trace( 'Pencil Texture path: '+path );

  	FileSystem.openFolder(path);

}



/*
Saves the Scene folder as Zip archive

Options:
- Hold Control key to open folder on zipping success

ToDo:
- Add save options
*/
function PS_BackupScene(mode) {

    var projectPath = fileMapper.toNativePath( scene.currentProjectPathRemapped() );

    var sceneName = scene.currentScene();

    // Windows
    var projectParentDir = projectPath.split('\\');
    // var diskName = projectParentDir[0];
    var projectFolder = projectParentDir.pop();
    projectParentDir = projectParentDir.join('\\');
    var backupFolderName = '_backup';
    var backupFolderPath = projectParentDir+ '\\' + backupFolderName;

    if (KeyModifiers.IsShiftPressed() || mode == exports.MODE_OPEN_ONLY) {
        // MessageLog.trace('command: '+backupFolderPath);
        FileSystem.openFolder(backupFolderPath);
        return;
    }

    /*
    var batPath = specialFolders.userScripts+'\\PS_SceneHelper-Resources\\Backup-TBH-Scene.bat';
    var command = '"'+batPath +'" "'+projectPath+'"';
    MessageLog.trace('PS_BackupScene command: '+command);

    var proc = new QProcess();
    proc.start(command);
    proc.waitForFinished();

    var result = proc.exitCode();
    var backupFullPath = ((proc.readAllStandardOutput() || '').toString().replace(/\r|\n/gi,' ').match(/<:<(.*)>:>/) || []).pop();
    
    proc.close();

    if ( result != 0) {
        MessageLog.trace('Backup Error: ' + result + ': ' + command);
        return;
    }
    */

    

    var backupFileName = sceneName + '_@' + Utils.getTimestamp() +'_'+ about.getUserName() + '.zip';
    var backupFullPath =  backupFolderPath +'\\'+ backupFileName;
    var fileDirCheck = FileSystem.checkFileDir(backupFullPath, true);

    _sf.zip( projectPath, backupFullPath );

    MessageLog.trace( 'Backup file: '+ backupFullPath );

    if (KeyModifiers.IsControlPressed() || mode == exports.MODE_SHOW_FOLDER_ON_COMPLETE) {
        // MessageLog.trace( 'backupFolderPath: '+ backupFolderPath );
        FileSystem.openFolder(backupFolderPath);
    } else {
        MessageBox.information("Scene is archived to: " + backupFullPath);
    }

}


function PS_OpenBackupFolder(){
	PS_BackupScene( MODE_OPEN_ONLY );
}


///
function PS_BackupTBHSettings(){

    MessageLog.clearLog();

    

    var settingsPath = specialFolders.userConfig.split('/');
    settingsPath.pop();
    settingsPath = settingsPath.join('/');
    MessageLog.trace('Backup Settings:\n'+specialFolders.app+'\n>'+settingsPath );    
    
    var destFilePath = FileDialog.getSaveFileName('*.zip', 'Locate where to save the backup');
    if( !destFilePath ){
        return;
    }

    _sf.zip( settingsPath, destFilePath );

    MessageBox.information("User settings have been successfully copied to: " + destFilePath );

    var destDirPath = destFilePath.split('/');
    destDirPath.pop();
    destDirPath = destDirPath.join('/');
    FileSystem.openFolder( fileMapper.toNativePath(destDirPath) );
    
}


var _sf = {

    get7ZipPath: function( destFilePath ){
        return specialFolders.app + '/bin_3rdParty/7z.exe';
    },

    zip: function( srcPath, dstPath ) {
        
        var z7path = _sf.get7ZipPath();
        var excludes = '-x!*-small.tga';
        var command = '"'+z7path+'" a -tzip -ssw -mx1 -r0 -y  "'+dstPath+'" "'+srcPath+'" '+excludes;
        MessageLog.trace('zip command:\n'+ command );

        var proc = new QProcess();
        proc.start(command);
        proc.waitForFinished();

    }

};