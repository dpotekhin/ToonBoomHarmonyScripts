/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_CustomMenu :]
[Version: 0.220825 :]

[Description:

:]

[Usage:

:]
*/

var NAMESPACE = 'PS';

var ContextMenu = require(fileMapper.toNativePath(specialFolders.userScripts+"/"+NAMESPACE+"/ContextMenu.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/"+NAMESPACE+"/pModal.js"));
var pFile = require(fileMapper.toNativePath(specialFolders.userScripts+"/"+NAMESPACE+"/pFile.js"));

//
var recourcesPath = specialFolders.userScripts+'/'+NAMESPACE+'_CustomMenu-Resources';
var separatorCount = 0;

//
function PS_CustomMenu(){

  var data = pFile.loadJSON( recourcesPath+'/data.json' );
  if( !data ) return;



  var menuData = {};

  try{

  data.menu.forEach(function(menuItem){
    _sf.addMenuItem( menuItem, menuData );
  });

  }catch(err){MessageLog.trace('err: '+err)}



  // return;
  /*
  separatorCount++;
  menuData['-'+separatorCount] = 1;
  menuData['!Refresh'] = function(){MessageLog.trace('AAA')};
  menuData['!Configure'] = _sf.showConfigureUI;
  */

  ContextMenu.showContextMenu( menuData );

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
        
        var menuItemName = menuItem.name;
        if( menuItem.icon ) menuItemName += '$'+_sf.getIconPath(menuItem.icon);
        var groupData = menuData[menuItemName] = {};
        
        // MessageLog.trace('---> add Group Item: '+menuItem.name);

        menuItem.items.forEach(function( submenuItemData ){
          // MessageLog.trace('>>'+JSON.stringify(submenuItemData,true,'  '));
          _sf.addMenuItem( submenuItemData, groupData );

        });

        break;

      //
      case 'script':
        
        if( !menuItem.scriptFunction || !menuItem.scriptFile ) {
          MessageLog.trace('Wrong data for the script menu item "'+menuItem.name+'"');
          return;
        }

        // MessageLog.trace('---> add Script Item: '+menuItem.name+', '+menuItem.scriptFunction+" in "+menuItem.scriptFile);

        var menuItemName = menuItem.name;

        if( menuItem.icon ) menuItemName += '$'+_sf.getIconPath(menuItem.icon);  

        menuData['!'+menuItemName] = function(){

          MessageLog.trace('Execute Script: '+menuItem.scriptFunction+' in '+menuItem.scriptFile );

          try{

          // Action.perform("onActonExecuteScriptWithValidator(QString,AC_ActionInfo*)", "scriptResponder", menuItem.scriptFunction+" in "+menuItem.scriptFile );

          // Action.perform('onActonExecuteScript("'+menuItem.scriptFunction+" in "+menuItem.scriptFile+'")', "scriptResponder" );

          // Action.perform('onActonExecuteScript()', "scriptResponder", menuItem.scriptFunction+" in "+menuItem.scriptFile );
          // Action.perform("onActionEditProperties()", "scene");

          var scriptPath = fileMapper.toNativePath(specialFolders.userScripts+'/'+menuItem.scriptFile);
          var scriptParams = menuItem.scriptParams || [];
          // MessageLog.trace( scriptPath );
          include( scriptPath );
          eval( menuItem.scriptFunction )( scriptParams[0], scriptParams[1], scriptParams[2], scriptParams[3], scriptParams[4] );

          }catch(err){MessageLog.trace('Error while the Script executing: '+err);}

        }

        break;
    }
    
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

  },

  getIconPath: function(iconPath){
    return iconPath
              .replace(/^~\//,fileMapper.toNativePath(specialFolders.userScripts+'/script-icons/'))
              .replace(/^@\//,fileMapper.toNativePath(specialFolders.userScripts+'/'+NAMESPACE+'_CustomMenu-Resources/icons/'))
              .replace(/^\//,fileMapper.toNativePath(specialFolders.userScripts))
            ;
  }

};