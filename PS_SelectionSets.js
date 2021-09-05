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
  var modalWidth = 150;
  var modalHeightMin = 120;
  var modalHeightMax = 500;
  var modalHeight = ~~(modalHeightMin + (modalHeightMax-modalHeightMin) * .5);
  
  
  //
  var modal = new pModal( scriptName + " v" + scriptVer, modalWidth, modalHeight, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;
  ui.setMinimumSize( modalWidth, modalHeightMin );
  ui.setMaximumSize( modalWidth, modalHeightMax );

  var sSList = new SSList( scriptVer, ui );
  
  ui.mainLayout.addStretch();

  modal.show();

}