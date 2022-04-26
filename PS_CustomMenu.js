/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_CustomMenu :]
[Version: 0.211010 :]

[Description:

:]

[Usage:

:]
*/


var ContextMenu = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/ContextMenu.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var pFile = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pFile.js"));

//
var recourcesPath = specialFolders.userScripts+'/PS_CustomMenu-Resources';
var separatorCount = 0;

//
function PS_CustomMenu(){

  var data = pFile.loadJSON( recourcesPath+'/data.json' );
  if( !data ) return;

  // MessageLog.trace('PS_CustomMenu: @1:'+JSON.stringify(data,true,'  ') );

  var menuData = {};

  try{

  data.menu.forEach(function(menuItem){
    _sf.addMenuItem( menuItem, menuData );
  });

  }catch(err){MessageLog.trace('err: '+err)}

  // MessageLog.trace('PS_CustomMenu: @2:'+JSON.stringify(menuData,true,'  ') );

  // return;
  /*
  separatorCount++;
  menuData['-'+separatorCount] = 1;
  menuData['!Refresh'] = function(){MessageLog.trace('AAA')};
  menuData['!Configure'] = _sf.showConfigureUI;
  */

  ContextMenu.showContextMenu(
    menuData,
    new QPoint( QCursor.pos().x(), QCursor.pos().y() ),
    _sf.getParentWidget()
  );

}


var _sf = {

  //
  addMenuItem: function( menuItem, menuData ){
    
    switch( menuItem.type ){
      
      case 'separator':
        
        separatorCount++;
        menuData['-'+separatorCount] = 1;

        break;

      //
      case 'group':
        
        var groupData = menuData[menuItem.name] = {};
        
        // MessageLog.trace('---> add Group Item: '+menuItem.name);

        menuItem.items.forEach(function( submenuItemData ){
          // MessageLog.trace('>>'+JSON.stringify(submenuItemData,true,'  '));
          _sf.addMenuItem( submenuItemData, groupData );

        });

        break;

      //
      case 'script':
        
        if( !menuItem.sriptFunction || !menuItem.scriptFile ) {
          MessageLog.trace('Wrong data for the script menu item "'+menuItem.name+'"');
          return;
        }

        // MessageLog.trace('---> add Script Item: '+menuItem.name+', '+menuItem.sriptFunction+" in "+menuItem.scriptFile);

        var menuItemName = menuItem.name;

        if( menuItem.icon ){
            menuItemName += '$'+menuItem.icon.replace('~/',fileMapper.toNativePath(specialFolders.userScripts+'/'+'script-icons/'));
        }

        menuData['!'+menuItemName] = function(){

          MessageLog.trace('Execute Script: '+menuItem.sriptFunction+' in '+menuItem.scriptFile );

          try{

          // Action.perform("onActonExecuteScriptWithValidator(QString,AC_ActionInfo*)", "scriptResponder", menuItem.sriptFunction+" in "+menuItem.scriptFile );

          // Action.perform('onActonExecuteScript("'+menuItem.sriptFunction+" in "+menuItem.scriptFile+'")', "scriptResponder" );

          // Action.perform('onActonExecuteScript()', "scriptResponder", menuItem.sriptFunction+" in "+menuItem.scriptFile );
          // Action.perform("onActionEditProperties()", "scene");

          var scriptPath = fileMapper.toNativePath(specialFolders.userScripts+'/'+menuItem.scriptFile);
          // MessageLog.trace( scriptPath );
          include( scriptPath );
          eval( menuItem.sriptFunction )();

          }catch(err){MessageLog.trace('Error while the Script executing: '+err);}

        }

        break;
    }
    
  },

  //
  getParentWidget: function(){
    var topWidgets = QApplication.topLevelWidgets();
    for( var i in topWidgets ){
      var widget = topWidgets[i];
      if( widget instanceof QMainWindow && !widget.parentWidget() )
        return widget;
    }
    return "";
  },


  //
  showConfigureUI: function(){

    MessageLog.clearLog(); // !!!

    var modal = new pModal( 'Configure Custom Menu', 315, 200, false );  
    if( !modal.ui ){return;}
    var ui = modal.ui;

    modal.addLabel( 'Drawing: ', ui );

    var QTableView = new QTableView( ui );

    // var scripts = _sf.getScripts( specialFolders.userScripts );

    //
    ui.mainLayout.addStretch();
    modal.show();

  },

  
  //
  getScripts: function( path ){

    var dir = new Dir( path );

    var scripts = [];

    var entries = dir.entryList('*.js').filter(function( scriptName, i ){

      // TODO: use cache
      var scriptText = pFile.load( dir.path+'/'+scriptName );
      var scriptFunctions = _sf.getFunctionNames( scriptText );
      if( !scriptFunctions.length ) return;
      // return text.indexOf('[Description:') !== -1 && text.indexOf('[SkipPacking:]') === -1;
      // MessageLog.trace(i+') '+scriptName+' > '+scriptFunctions);

      scripts.push( scriptName, scriptFunctions );

    });

  },


  //
  getFunctionNames: function( fileText ){

    var functionNames =[];

    var functionMatches = fileText
      .replace( /\/\*[\s\S\r\n]*\*\//gi, '' )
      .replace( /[^{]+{([^{}]|{[^{}]*})*}/gi, '' )
      .match( /function\s?(.*)\(/gi )
    ;

    if( !functionMatches ) return functionNames;

    functionMatches.forEach(function(functionName){
      functionName = functionName.replace(/function\s?|\(/gi,'');
      if( functionName && !functionName.match(/^_/) ) functionNames.push(functionName);
    });

    return functionNames;

  }

};