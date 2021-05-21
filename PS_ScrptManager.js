/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1
*/

var pModal = require("./ps/pModal.js");
var _pFile = require("./ps/pFile.js");

//
function PS_ScrptManager(){	

	MessageLog.clearLog();

	//
	var scriptName = 'Script Manager';
  var scriptVer = '0.1';

	//
	var pFile = _pFile;

	var btnHeight = 50;
  var listJustUpdated = true;
  var forceWindowInstances = KeyModifiers.IsControlPressed();
  var cellStyle = 'QLabel{ background:black; padding:2px; border: none; }';
  var scripts = [];
  var currentScriptName;
  //


	//
  var modal = new pModal( scriptName + " v" + scriptVer, 500, 400, false );  
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
    dataGroup.title = currentScriptName;
    // var displayName = modal.expressions[i].displayName;
    MessageLog.trace('Selected: '+ i+' : '+scriptName );
    updateScriptData();
    // modal.curentExpressionindex = i;
    // var exprText = column.getTextOfExpr(exprName);
    // modal.textEdit.setText( exprText );
    // // searchField.setText( exprName );
    // _refreshCurrentExpressionValue();
  });


  /// SCRIPT DATA
	var dataGroup = modal.addGroup( 'N/A', ui, false );

	modal.addLabel('Functions:',dataGroup);

	var textEdit = new QTextEdit(dataGroup);
	textEdit.readOnly = true;
	textEdit.setFixedHeight(60);
  dataGroup.mainLayout.addWidget( textEdit, 0, 0 );
  
  dataGroup.mainLayout.addStretch();

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

	}

	//
	function updateScriptData(){

		var path = pFile.checkPath( './'+currentScriptName );
		// MessageLog.trace('updateScriptData >> '+ path );
		var fileText = pFile.load( path );
		if( !fileText ) return;
		// MessageLog.trace('updateScriptData >> '+ fileText );

		var functionNames = getFunctionNames(fileText);
		if( !functionNames ) return;

		textEdit.plainText = functionNames.join('\r');
		
		var files = getRequiredPaths( fileText, specialFolders.userScripts, [path] ); // Get all script Paths

		files = files.concat( getIconPaths( functionNames ) ); // Get all icons paths

		// Get all resources

		MessageLog.trace('files: '+ files.join('\n'));

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
		
		var _requiredPaths = [];
		fileText.replace( /require.*"(.*)".*\);/gi, function(a,b,c){ _requiredPaths.push(b); });

		_requiredPaths.forEach(function(path){
			
			if( path.indexOf('./') === 0 ) path = rootPath + path.substr(1,path.length);
			if( path.indexOf('/') === 0 ) path = rootPath + path;
			if( requiredPaths.indexOf(path) !== -1 ) return;

			requiredPaths.push(path);

			var childFileText = pFile.load( path );
			if( !childFileText ) {
				MessageLog.trace('File not found '+path);
				return;
			}
			getRequiredPaths( childFileText, rootPath, requiredPaths );

		});

		return requiredPaths;

	}

	// Get Icons
	function getIconPaths( functionNames ){

		var dir = new Dir();
		dir.path = specialFolders.userScripts + '/script-icons';

		var entries = dir.entryList('*');
		if( !entries || !entries.length ) return;
		entries = entries.filter(function(entry){
			var fileName = entry.split('.');
			fileName.pop();
			fileName = fileName.join('.');
			return functionNames.indexOf(fileName) !== -1;
		}).map(function(entry){
			return dir.path+'/'+entry;
		});

		// MessageLog.trace(JSON.stringify(entries,true,'  '));
		return entries;

	}


}