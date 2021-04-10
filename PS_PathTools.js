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



function PS_test(){
  AlignPaths.AlignLeft();
}



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
  var hGroupStyle = 'QGroupBox{ position: relative; border: none; margin: 5px 0; padding: 5px 0;}';
  //
  var modal = new pModal( scriptName + " v" + scriptVer, 290, 200, true );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;

  ui.setStyleSheet( ui.styleSheet +' QPushButton{ border: none; }' );

  // Align
  var alignGroup = modal.addGroup( 'Align:', ui, true, hGroupStyle);

  var btnAlignLeft = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-left.png', AlignPaths.AlignLeft, 'Align left edges' );
  var btnAlignHCenter = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-h-center.png', AlignPaths.AlignHCenter, 'Align horizontal centers' );
  var btnAlignRight = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-right.png', AlignPaths.AlignRight, 'Align right edges' );

  modal.addVLine( btnHeight, alignGroup );

  var btnAlignCenter = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-center.png', AlignPaths.AlignCenter, 'Align center' );

  modal.addVLine( btnHeight, alignGroup );

  var btnAlignTop = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-top.png', AlignPaths.AlignTop, 'Align top edges' );
  var btnAlignVCenter = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-v-center.png', AlignPaths.AlignVCenter, 'Align vertical centers' );
  var btnAlignBottom = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-bottom.png', AlignPaths.AlignBottom, 'Align bottom edges' );

  alignGroup.mainLayout.addStretch();

  // Modify
  var modifyGroup = modal.addGroup( 'Modify:', ui, true, hGroupStyle );

  var btnCollapse = modal.addButton( '', modifyGroup, btnHeight, btnHeight, iconPath+'merge.png', AlignPaths.Merge, 'Merge curve points' );
  
  modifyGroup.mainLayout.addStretch();

  //
  ui.mainLayout.addStretch();

  modal.show();

}
