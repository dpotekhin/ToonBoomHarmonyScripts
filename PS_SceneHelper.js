/*
Author: D.Potekhin (https://peppers-studio.ru)
Version 0.1
*/


//
var FileSystem = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/FileSystem.js"));
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
//

/*
Open Scene folder
(windows only)
*/
function PS_OpenSceneFolder(){
	
	var projectPath = scene.currentProjectPathRemapped();

	// Process2
	var _process = new Process2('explorer "'+projectPath+'"');
	var result = _process.launchAndDetach();
	MessageLog.trace('>>'+_process.commandLine());
	
}





/*
ToDo:
- Check archiving success
- Add save options
*/
function PS_BackupScene(){

	var projectPath = scene.currentProjectPathRemapped();
	
	var sceneName = scene.currentScene();

	var backupPath = projectPath.split('\\');
	backupPath.pop();
	backupPath = backupPath.join('\\')+'\\_backup\\'+sceneName+'_'+Utils.getTimestamp()+'.zip';

	// MessageLog.trace('PS_BackupScene: '+backupPath );
	var fileDirCheck = FileSystem.checkFileDir( backupPath, true );
	// MessageLog.trace('fileCheck: '+fileDirCheck );

	var command = 'zip -r "'+backupPath+'" "'+projectPath+'"';

	var proc = new QProcess();
    //proc.start('start',[projectPath]);
    proc.start(command);
    // var procStarted = proc.waitForStarted(1500);
    var procFinished = proc.waitForFinished(10000);

	MessageLog.trace('PS_BackupScene: '+command+', procFinished:'+procFinished);

	MessageBox.information("Scene is archived to: "+backupPath);

}

//
exports = {
	PS_OpenSceneFolder: PS_OpenSceneFolder,
	PS_BackupScene: PS_BackupScene,
};