/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210731

Utility script for assembling other PS scripts into separate packages

[SkipPacking:]

*/

var pModal = require("./ps/pModal.js");
var _pFile = require("./ps/pFile.js");

//
function PS_ScriptPacker(){	

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
  var buildFolderRootName = 'ps_build';
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

		var dir = new Dir( specialFolders.userScripts );

		var entries = dir.entryList('*.js').filter(function(scriptName){
			var text = pFile.load( dir.path+'/'+scriptName );
			return text.indexOf('[Description:') !== -1 && text.indexOf('[SkipPacking:]') === -1;
		});
		// MessageLog.trace(JSON.stringify(entries,true,'  '));

		listJustUpdated = true;

		scripts = entries;

    modal.listWidget.clear();

    modal.listWidget.addItems(entries);

    currentScriptName = entries[0];

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
			functionNames: functionNames,
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
		
		functionNames = functionNames.filter(function(functionName){
			return functionName.indexOf('PS') === 0;
		});

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
		updateMainReadme();

	}


	//
	function buildAllScripts(){

		MessageLog.trace('===== buildAllScripts: '+scripts);

		scripts.forEach(function( scriptName, i ){
			MessageLog.trace(''+i+']]] '+scriptName );
			buildScript( scriptName );		
			MessageLog.trace('...');
		});

		updateMainReadme();

	}


	//
	function buildScript( scriptName ){

		try{

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
		var extraFiles = getContentFromScriptText( scriptFile.text, 'ExtraFiles');

		if( extraFiles ){
			extraFiles = extraFiles.split(/\n|\n\r/gi);
			// MessageLog.trace('extraFiles: '+extraFiles);
			extraFiles.forEach(function(extraFile,i){
				extraFile = extraFile.trim();
				if(!extraFile) return;
				var destPath = scriptData.buildFolder + '/'+extraFile;
				extraFile = scriptData.rootPath+'/'+extraFile;
				// MessageLog.trace( i+'>'+ extraFile +' >>> '+destPath );
				// TODO: fix required paths in extra files
				// TODO: What about single files?
				copyDir( extraFile, destPath );
			});
		}

		// Required scripts
		Object.keys(scriptFile.files).forEach(function( filePath, i ){
			// try{
			var fileNameData = pFile.getFileNameFromPath( filePath );
			var destPath = scriptData.resourceBuildPath + ( filePath.indexOf('/ps/') !== -1 ? '/ps/' : '' );
			MessageLog.trace(i+') '+filePath.replace(scriptData.rootPath,'') +'\n>>> '+destPath );
			createDir(destPath);
			pFile.save( destPath+'/'+fileNameData.fileName, fixRequires( scriptFile.files[filePath], scriptData ) );

			// }catch(err){MessageLog.trace('Err:'+err);}
		});

		}catch(err){MessageLog.trace('buildScript Error:'+err);}

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

		// try{

		var name = getContentFromScriptText( scriptText, 'Name' );
		MessageLog.trace('NAME: '+name );
		
		if( name ) {

			readmeText += '## '+name+'\n';

			var version = getContentFromScriptText( scriptText, 'Version' );
			if( version ) readmeText += ''+version+'\n';
		}

		var description = getContentFromScriptText( scriptText, 'Description');
		// MessageLog.trace('DESCR>>>>\n'+description+'\n<<<<' );
		if( description ) readmeText += '\n### Description\n'+description+'\n';

		var usage = getContentFromScriptText( scriptText, 'Usage');
		// MessageLog.trace('usage: '+usage );
		if( usage ) readmeText += '\n### Usage\n'+usage+'\n';

		// How to Install
		var	howToInstallText = 'Copy all files from this folder to [Harmony User Scripts directory](https://docs.toonboom.com/help/harmony-20/premium/scripting/import-script.html).';
		if( scriptData.functionNames.length ){
			howToInstallText += '\\\nAdd script'+( scriptData.functionNames.length > 1 ? 's' : '')+' '+scriptData.functionNames.map(function(t){return '"'+t+'"';}).join(', ')+' to a panel.\\\n'
		}

		howToInstallText += getContentFromScriptText( scriptText, 'Install') || '';

		readmeText += '\n### Installation:\n' + howToInstallText
			// +'Copy files from ".\\'+scriptData.buildFolderRootName+'\\'+scriptData.clearName+'" to Harmony User Scripts directory'
		;

		pFile.save( path, readmeText );

		// }catch(err){MessageLog.trace(err);}

	}


	//
	function getContentFromScriptText( text, keyWord ){
		
		var content = text.substr(2,text.indexOf('*/')).split('['+keyWord+':')[1];		
		if(content) {
			content = content.split(':]')[0];
			content = content.trim();
			return content;
		}
		
	}


	//
	function updateMainReadme(){

		var mainReadme = '# Toon Boom Harmony Scripts\n'
// '## Installation'
// +'Unpack to: C:\\Users\\%UserName%\\AppData\\Roaming\\Toon Boom Animation\\Toon Boom Harmony Premium\\2000-scripts'
		// +'# Script List\n\n'
		;

		var dir = new Dir( specialFolders.userScripts+'/'+buildFolderRootName );

		var entries = dir.entryList('*');
		if( !entries || !entries.length ) return;

		entries.forEach(function(entry){
			
			if( entry.charAt(0) === '.' ) return;
			
			mainReadme += '\n## ['+entry+']('+buildFolderRootName+'/'+entry+')\n';

			var text = pFile.load( dir.path+'/'+entry+'/Readme.md' );
			if( text ){
				text = text.split('### Description')[1];
				text = text.split('###')[0];
				text = text.replace(/^\n|\n\r/,'');
				mainReadme += text;
				// MessageLog.trace('!!!!'+text);
			}

		});

		// MessageLog.trace( 'mainReadme:\n'+dir.path+'\n'+mainReadme );
		pFile.save( specialFolders.userScripts+'/Readme.md', mainReadme );

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