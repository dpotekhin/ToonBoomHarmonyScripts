/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1

ToDo:
- make panel with options
- add aligment options (like in Adobe animate)
  - 
  - distribute, justify
  - aligning strokes relative to each other
    - how to detect a stroke group?
*/

//
var AlignPaths = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/AlignPaths.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));

//
function PS_ShowPathToolsModal(){

   //
  MessageLog.clearLog();

  //
  var scriptName = 'Path Tools';
  var scriptVer = '0.1';
  //

  var btnHeight = 30;
  var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/icons/");

  //
  var modal = new pModal( scriptName + " v" + scriptVer, 290, 200, true );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;

  var alignGroup = modal.addGroup( 'Align:', ui, true, 'QGroupBox{ position: relative; border: none; margin: 5px 0; padding: 5px 0;}');//, "padding: 0; " );
  alignGroup.setStyleSheet( alignGroup.styleSheet +' QPushButton{ border: none; }' );

  var btnAlignLeft = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-left.png', AlignPaths.AlignLeft );
  var btnAlignHCenter = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-h-center.png', AlignPaths.AlignHCenter );
  var btnAlignRight = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-right.png', AlignPaths.AlignRight );

  modal.addVLine( btnHeight, alignGroup );

  var btnAlignCenter = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-center.png', AlignPaths.AlignCenter );

  modal.addVLine( btnHeight, alignGroup );

  var btnAlignTop = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-top.png', AlignPaths.AlignTop );
  var btnAlignVCenter = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-v-center.png', AlignPaths.AlignVCenter );
  var btnAlignBottom = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-bottom.png', AlignPaths.AlignBottom );


  //
  ui.mainLayout.addStretch();

  modal.show();

}
