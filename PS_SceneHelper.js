/*
Author: D.Potekhin (https://peppers-studio.ru)
Version 0.1
*/


//
var FileSystem = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/FileSystem.js"));
//

/*
Open Scene folder
(windows tested only)
*/
function PS_OpenSceneFolder(){
	
	var projectPath = scene.currentProjectPathRemapped();

	// Process2
	var _process = new Process2('explorer "'+projectPath+'"');
	var result = _process.launchAndDetach();
	MessageLog.trace('>>'+_process.commandLine());
	

	/*
	// QProcess
	var proc = new QProcess();
    //proc.start('start',[projectPath]);
    proc.start('explorer "'+projectPath+'"');
    var procStarted = proc.waitForStarted(1500);
    var procFinished = proc.waitForFinished(3000);
    MessageLog.trace('>>'+procStarted+', '+procFinished+', '+projectPath);
    */
}

/*
*/
function PS_BackupScene(){

	var projectPath = scene.currentProjectPathRemapped();
	
	var sceneName = scene.currentScene();

	var backupPath = projectPath.split('\\');
	backupPath.pop();
	backupPath = backupPath.join('\\')+'\\_backup\\'+sceneName+'_'+getTimestamp()+'.zip';

	// MessageLog.trace('PS_BackupScene: '+backupPath );
	var fileDirCheck = FileSystem.checkFileDir( backupPath, true );
	// MessageLog.trace('fileCheck: '+fileDirCheck );

	var command = 'zip -r "'+backupPath+'" "'+projectPath+'"';
	
	/*
	var _process = new Process2(command);
	var result = _process.launchAndDetach();
	*/

	var proc = new QProcess();
    //proc.start('start',[projectPath]);
    proc.start(command);
    var procFinished = proc.waitForFinished(10000);

	MessageLog.trace('PS_BackupScene: '+command+', procFinished:'+procFinished);
	MessageBox.information("Scene is archived to: "+backupPath);

}

function getTimestamp(){
	var date = new Date();
	return date.getFullYear()+getZeroLeadingString(date.getMonth())+getZeroLeadingString(date.getDay())+'_'+getZeroLeadingString(date.getHours())+getZeroLeadingString(date.getMinutes());
}

function getZeroLeadingString(v){
	return v<10 ? '0'+v : v;
}