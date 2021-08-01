/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1
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
    var diskName = projectParentDir[0];
    var projectFolder = projectParentDir.pop();
    projectParentDir = projectParentDir.join('\\');
    var backupFolderName = '_backup';
    var backupFolderPath = projectParentDir+ '\\' + backupFolderName;
    var backupFileName = sceneName + '_' + Utils.getTimestamp() +'_'+ about.getUserName() + '.zip';
    var backupFullPath =  backupFolderPath +'\\'+ backupFileName;
    var fileDirCheck = FileSystem.checkFileDir(backupFullPath, true);

    if (KeyModifiers.IsShiftPressed() || mode == exports.MODE_OPEN_ONLY) {
        // MessageLog.trace('command: '+backupFolderPath);
        FileSystem.openFolder(backupFolderPath);
        return;
    }

    var command = 'cmd /K ' + diskName + ' && cd "' + projectParentDir + '" && zip -r "' + backupFullPath + '" "' + projectFolder + '" -x "*.*~" "./*/frames/**"';

    var proc = new Process2(command);
    var result = proc.launchAndDetach();

    if (result != 0) {
        MessageLog.trace('Backup Error: ' + result + ': ' + proc.errorMessage() + ', ' + command);
        return;
    }

    MessageLog.trace('PS_BackupScene: ' + command);

    if (KeyModifiers.IsControlPressed() || mode == exports.MODE_SHOW_FOLDER_ON_COMPLETE) {
        FileSystem.openFolder(backupFolderPath);
    } else {
        MessageBox.information("Scene is archived to: " + backupFullPath);
    }

}


function PS_OpenBackupFolder(){
	PS_BackupScene( MODE_OPEN_ONLY );
}