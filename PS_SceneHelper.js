/*
Author: D.Potekhin (https://peppers-studio.ru)
Version 0.1
*/


//
var FileSystem = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/FileSystem.js"));
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
//

//
exports = {
	PS_OpenSceneFolder: PS_OpenSceneFolder,
	PS_BackupScene: PS_BackupScene,
	MODE_OPEN_ONLY: 'mode-open-only',
	MODE_SHOW_FOLDER_ON_COMPLETE: 'mode-show-folder-on-complete',
};

/*
Open Scene folder
(windows only)
*/
function PS_OpenSceneFolder(){
	var projectPath = scene.currentProjectPathRemapped();
	FileSystem.openFolder( projectPath );	
}





/*
Saves the Scene folder as Zip archive

Options:
- Hold Control key to open folder on zipping success

ToDo:
- Add save options
*/
function PS_BackupScene( mode ){

	var projectPath = scene.currentProjectPathRemapped();
	
	var sceneName = scene.currentScene();

	// Windows
	var projectParentDir = projectPath.split('\\');
	var diskName = projectParentDir[0];
	var projectFolder = projectParentDir.pop();
	projectParentDir = projectParentDir.join('\\');
	var backupRelativePath = '_backup\\'+sceneName+'_'+Utils.getTimestamp()+'.zip';
	var backupFullPath = projectParentDir+'\\'+backupRelativePath;
	var fileDirCheck = FileSystem.checkFileDir( backupFullPath, true );
	
	if( KeyModifiers.IsShiftPressed() || mode == exports.MODE_OPEN_ONLY ){
		FileSystem.openFolder( backupFullPath, true );
		return;
	}

	var command = 'cmd /K ' + diskName+' && cd "'+projectParentDir+'" && zip -r "'+backupFullPath+'" "'+projectFolder+'" -x ./frames/** "*.*~" ';
	var proc = new Process2( command );
	var result = proc.launchAndDetach();

    if( result != 0 ){
    	MessageLog.trace('Backup Error: '+result+': '+proc.errorMessage()+', '+command );
    	return;
    }

    MessageLog.trace( 'PS_BackupScene: '+command );

	if(KeyModifiers.IsControlPressed() || mode == exports.MODE_SHOW_FOLDER_ON_COMPLETE ){
		FileSystem.openFolder( backupFullPath, true );
	}else{
		MessageBox.information("Scene is archived to: "+backupFullPath);
	}

}