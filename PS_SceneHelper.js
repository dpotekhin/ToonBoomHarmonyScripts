function PS_OpenSceneFolder(){
	
	var  projectPath = scene.currentProjectPathRemapped();

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