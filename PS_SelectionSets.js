/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210905
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var SSList = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SelectionSets-Resources/SSList.js"));

///
function PS_SelectionSets(){
  
  MessageLog.clearLog();

  var scriptName = 'Selection Sets';
  var scriptVer = '0.210821';

  var modalWidthMin = 100;
  var modalWidthMax = 400;
  var modalWidth = 176;

  var modalHeightMin = 110;
  var modalHeightMax = 600;
  var modalHeight = ~~(modalHeightMin + (modalHeightMax-modalHeightMin) * .5);

  //
  var modal = new pModal( scriptName + " v" + scriptVer, modalWidth, modalHeight, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;
  ui.setMinimumSize( modalWidthMin, modalHeightMin );
  ui.setMaximumSize( modalWidthMax, modalHeightMax );
  ui.resize( modalWidth, modalHeight );

  var sSList = new SSList( scriptVer, ui );

  ui.resizeEvent = function(e){
    // MessageLog.trace('RESIZE '+ui.width );
    sSList.prefs.windowWidth = ui.width;
    sSList.prefs.windowHeight = ui.height;
    sSList.savePrefs();
    // QWidget.resizeEvent( e );
  }

  /*
  ui.closeEvent = function(e){
    MessageLog.trace('closeEvent');
    QWidget.closeEvent(e);
  }
  */

  // ui.mainLayout.addStretch();

  modal.show();

}