/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210731

Utility script for assembling other scripts into separate packages
*/

var pModal = require("./ps/pModal.js");
var _pFile = require("./ps/pFile.js");

//
function PS_ScrptPacker(){	

	MessageLog.clearLog();

	//
	var scriptName = 'PS Script Packer';
  var scriptVer = '0.210731';

	//
	var pFile = _pFile;

	var btnHeight = 26;
  var listJustUpdated = true;
  var forceWindowInstances = KeyModifiers.IsControlPressed();
  var cellStyle = 'QLabel{ background:black; padding:2px; border: none; }';
  var scripts = [];
  var currentScriptName;
  //


	//
  var modal = new pModal( scriptName + " v" + scriptVer, 340, 100, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;
  ui.setStyleSheet('QGridLayout{ background: black;}');


  /// LIST GROUP

  var listWidgetGroup = modal.addGroup( '', ui, true, true );
  
  var listWidgetLabel = modal.addLabel( 'Script:', listWidgetGroup, 65, btnHeight, Qt.AlignRight | Qt.AlignVCenter );

  var listWidget = modal.listWidget = new QComboBox(listWidgetGroup);
  listWidgetGroup.mainLayout.addWidget( listWidget, 0, 0 );

  listWidget["currentIndexChanged(int)"].connect(function(i){

    if( listJustUpdated ){
      listJustUpdated = false;
      return;
    }
    currentScriptName = scripts[i];
    MessageLog.trace('Selected: '+ i+' : '+scriptName );
    // getScriptData();
  });


  /// SCRIPT DATA
	// var dataGroup = modal.addGroup( 'N/A', ui, false );

	// modal.addLabel('Functions:',dataGroup);

	// var textEdit = new QTextEdit(dataGroup);
	// textEdit.readOnly = true;
	// textEdit.setFixedHeight(60);
 //  dataGroup.mainLayout.addWidget( textEdit, 0, 0 );
  
 //  dataGroup.mainLayout.addStretch();

	//
	var buttonsGroup = modal.addGroup( '', ui, true, true );

	modal.addButton('Build All', buttonsGroup, 100, btnHeight, undefined, buildAllScripts );

	modal.addButton('Build Selected', buttonsGroup, 100, btnHeight, undefined, buildSelectedScript );

  //
  ui.mainLayout.addStretch();
  modal.show();
  //


  //
  updateList();


  //
	function updateList(){

		var dir = new Dir();
		dir.path = specialFolders.userScripts;

		var entries = dir.entryList('*.js');
		// MessageLog.trace(JSON.stringify(entries,true,'  '));

		listJustUpdated = true;

		scripts = entries;

    modal.listWidget.clear();

    modal.listWidget.addItems(entries);

    // getScriptData(entries[0]);
    // buildScript(entries[0]);

	}

	//
	function getScriptData( scriptName ){

		// MessageLog.clearLog();

		if( !scriptName ) scriptName = currentScriptName

		var rootPath = specialFolders.userScripts;

		var scriptPath = rootPath+'/'+scriptName;
		var scriptFile = getScriptContent( scriptPath );
		if( !scriptFile ) return;

		var clearName = scriptName.split('.js').join('');
		var buildFolderRootName = 'ps_build';
		var buildFolderName = buildFolderRootName+'/'+clearName;
		var buildFolder = rootPath+'/'+buildFolderName;
		var resourceFolderName = clearName+'-Resources';
		var functionNames = getFunctionNames( scriptFile.text );

		var icons = getIconPaths( functionNames ); // Get all icons paths

		// Get all resources

		var scriptData = {
			name: scriptName,
			clearName: clearName,
			rootPath: rootPath,
			resourceFolderName: resourceFolderName,
			resourcePath: rootPath+'/'+resourceFolderName,
			resourceBuildPath: buildFolder+'/'+resourceFolderName,
			buildFolderRoot: rootPath+'/'+buildFolderRootName,
			buildFolderRootName: buildFolderRootName,
			buildFolder: buildFolder,
			path: scriptPath,
			icons: icons,
		};

		// MessageLog.trace('scriptData >>\n'+ JSON.stringify(scriptData,true,'  ') );

		scriptData.scriptFile = scriptFile;

		return scriptData;

	}


	//
	function getScriptContent( path ){
		
		// MessageLog.trace('getScriptData >> '+ path );
		var text = pFile.load( path );
		if( !text ) return;

		var fileName = path.split('/').pop();

		if( text ){ // Get all script Paths

			var files = getRequiredPaths(
				text,
				specialFolders.userScripts,
				{}
			);

			// MessageLog.trace('\nFILES:\n'+JSON.stringify(files,true,'  '));
		}

		return {
			fileName: fileName,
			path: path,
			text: text,
			files: files
		};

	}


	// Get functions
	function getFunctionNames( fileText ){

		var functionText = fileText;
		var bracketFound;
		for(var i=0; i<20; i++){
			bracketFound = false;
			functionText = functionText.replace(/{([^{}]*)}/gi,function(){
				bracketFound = true;
				return '';
			});
			if( !bracketFound ) continue;
		}

		// MessageLog.trace('functionText: '+ functionText+' \n+++++++++++++++++++++++++++++++++++++++');

		var functionNames =[];

		functionText.replace(/function\s*(.*)\s*\(/gi,function(a,b,c){ functionNames.push(b); });
		
		return functionNames;

	}


	// Get requires
	function getRequiredPaths( fileText, rootPath, requiredPaths ){
		
		var _requiredPaths = {};
		fileText.replace( /require.*"(.*)".*\);/gi, function(a,b,c){ _requiredPaths[b] = true; });

		Object.keys(_requiredPaths).forEach(function(path){
			
			if( path.indexOf('./') === 0 ) path = rootPath + path.substr(1,path.length);
			if( path.indexOf('/') === 0 ) path = rootPath + path;
			if( requiredPaths[path] !== undefined ) return;

			var childFileText = pFile.load( path );
			if( !childFileText ) {
				MessageLog.trace('File not found '+path);
				return;
			}

			requiredPaths[path] = childFileText;

			getRequiredPaths( childFileText, rootPath, requiredPaths );

		});

		return requiredPaths;

	}


	// Get Icons
	function getIconPaths( functionNames ){

		var iconFolderName = 'script-icons';
		var dir = new Dir( specialFolders.userScripts + '/'+iconFolderName );

		var entries = dir.entryList('*');
		if( !entries || !entries.length ) return;

		var icons = [];

		entries.forEach(function(entry){
			var fileName = entry.split('.');
			fileName.pop();
			fileName = fileName.join('.');
			if( functionNames.indexOf(fileName) !== -1) icons.push([
				iconFolderName,
				entry,
				dir.path+'/'+entry
			]);
		});

		// MessageLog.trace(JSON.stringify(entries,true,'  '));
		return icons;

	}


	//
	function buildSelectedScript(){
		buildScript( currentScriptName );
	}


	//
	function buildAllScripts(){
		scripts.forEach(function( scriptName ){
			buildScript( scriptName );		
		});
	}


	//
	function buildScript( scriptName ){

		var scriptData = getScriptData( scriptName );
		if( !scriptData ) return;

		// Clear script build folder or create a new one
		var dir = new Dir( scriptData.buildFolder );
		if( dir.exists ) {
			try{ 
				dir.rmdirs();
			}catch(err){MessageLog.trace('Err:'+err);}
		}
		dir.mkdirs( scriptData.buildFolder );

		// Icons
		scriptData.icons.forEach(function(iconData){
			copyFile( iconData[2], scriptData.buildFolder+'/'+iconData[0] );
		});

		var scriptFile = scriptData.scriptFile;

		// Main File
		pFile.save( scriptData.buildFolder+'/'+scriptName, fixRequires( scriptFile.text, scriptData ) );

		// Create Readme
		saveReadme( scriptData.buildFolder+'/Readme.md', scriptFile.text, scriptData );

		// Resources
		var resDir = new Dir(scriptData.resourcePath);
		if( resDir.exists )	copyDir( scriptData.resourcePath, scriptData.resourceBuildPath );

		// Extra files
		var extraFiles = getContentFromScriptText( scriptFile.text, /#ExtraFiles:([^#]*)\/#/);
		if( extraFiles ){
			extraFiles = extraFiles.split(/\n|\n\r/gi);
			// MessageLog.trace('extraFiles: '+extraFiles);
			extraFiles.forEach(function(extraFile,i){
				extraFile = extraFile.trim();
				if(!extraFile) return;
				var destPath = scriptData.buildFolder + '/'+extraFile;
				extraFile = scriptData.rootPath+'/'+extraFile;
				// MessageLog.trace( i+'>'+ extraFile +' >>> '+destPath );
				copyDir( extraFile, destPath ); // TODO: What about single files?
			});
		}

		// Required scripts
		Object.keys(scriptFile.files).forEach(function( filePath, i ){
			try{
			var fileNameData = pFile.getFileNameFromPath( filePath );
			var destPath = scriptData.resourceBuildPath + ( filePath.indexOf('/ps/') !== -1 ? '/ps/' : '' );
			MessageLog.trace(i+') '+filePath +' >>> '+destPath );
			createDir(destPath);
			pFile.save( destPath+'/'+fileNameData.fileName, fixRequires( scriptFile.files[filePath], scriptData ) );

			}catch(err){MessageLog.trace('Err:'+err);}
		});

	}


	//
	function fixRequires( scriptText, scriptData ){
		/*
		var requireEntries = scriptText.match( /require([^;]*);/g );
		if( requireEntries && requireEntries.length ){
			requireEntries.forEach(function(entry){
				var entryFixed = entry.replace('/ps/', '/'+scriptData.resourceFolderName+'/ps/');
				scriptText = scriptText.replace( entry, entryFixed );
			})
		}*/
		scriptText = scriptText.replace('specialFolders.userScripts+"/ps/','specialFolders.userScripts+"/'+scriptData.resourceFolderName+'/ps/');
		// MessageLog.trace('requireEntries '+requireEntries );
		return scriptText;
	}


	//
	function saveReadme( path, scriptText, scriptData ){

		var readmeText = '';

		var name = getContentFromScriptText( scriptText, /#Name:([^#]*)\/#/ );
		MessageLog.trace('NAME: '+name );
		if( name ) readmeText += '## '+name+'\n\n';

		var description = getContentFromScriptText( scriptText, /#Description:([^#]*)\/#/);
		MessageLog.trace('description: '+description );
		if( description ) readmeText += '### Description\n'+description;

		var installation = getContentFromScriptText( scriptText, /#Installation:([^#]*)\/#/);
		
		readmeText += '\n\n### Installation:\n'
			// +'Copy files from ".\\'+scriptData.buildFolderRootName+'\\'+scriptData.clearName+'" to Harmony User Scripts directory'
			+ ( installation ? installation : 'Copy all files from this folder to Harmony User Scripts directory.' )
		;

		pFile.save( path, readmeText );

	}


	//
	function getContentFromScriptText( text, regexp ){
		var content = text.match(regexp);
		if(content) content = content[1].trim();
		return content;
	}


	//
	function copyFile( fileSrc, destFolder, fileName ){
		// try{
		
		// MessageLog.trace('copyFile: '+fileSrc +' >> '+ destFolder );
		createDir(destFolder);

		var srcParts = pFile.getFileNameFromPath( fileSrc );
		// fileSrc = fileSrc.split('/');
		// fileSrc.pop();
		// fileSrc = fileSrc.join('/');

		var command = 'robocopy "'+srcParts.path+'" "'+destFolder+'" "'+ ( fileName ? fileName : srcParts.fileName )+'"';
		var proc = new QProcess();
  	proc.start(command);
    // MessageLog.trace('>>>> '+ command );
   
  	// }catch(err){MessageLog.trace('Err:'+err)}
	}


	//
	function copyDir( src, dest ){
		var command = 'robocopy "'+src+'" "'+dest+'" /E';
		var proc = new QProcess();
  	proc.start(command);
	}


	//
	function createDir( dirPath ){
    var dir = new Dir( dirPath );
    dir.mkdirs();
	}

}