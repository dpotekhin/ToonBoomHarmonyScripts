/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.210811

TODO:
- Move backup script to a separate file
*/


//
var FileSystem = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/FileSystem.js"));
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
//

//
var MODE_OPEN_ONLY = 'mode-open-only';

exports = {
    PS_OpenSceneFolder: PS_OpenSceneFolder,
    PS_BackupScene: PS_BackupScene,
    PS_OpenPencilTextureFolder: PS_OpenPencilTextureFolder,
    PS_OpenBackupFolder: PS_OpenBackupFolder,
    PS_OpenTemplateFolder: PS_OpenTemplateFolder,
    PS_OpenScriptsFolder: PS_OpenScriptsFolder,
    MODE_OPEN_ONLY: MODE_OPEN_ONLY,
    MODE_SHOW_FOLDER_ON_COMPLETE: 'mode-show-folder-on-complete',
};



/*
Open Scene folder
(Windows only)
*/
function PS_OpenSceneFolder() {
    var projectPath = scene.currentProjectPathRemapped();
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

    var projectPath = scene.currentProjectPathRemapped();

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