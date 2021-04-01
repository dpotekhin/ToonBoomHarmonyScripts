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
var PS_AlignPaths = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_AlignPaths.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));

//
function PS_PathTools(){

   //
  MessageLog.clearLog();

  //
  var scriptName = 'Path Tools';
  var scriptVer = '0.1';
  //

  var btnHeight = 25;
  var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/script-icons/");

  //
  var modal = new pModal( scriptName + " v" + scriptVer, 240, 200 );
  var ui = modal.ui;

  var alignGroup = modal.addGroup( 'Align', ui.mainLayout, true);//, "padding: 0; margin: 0;" );
  
  var btnAlignRight = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'PS_AlignRight.png', PS_AlignPaths.PS_AlignRight );
  var btnAlignHCenter = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'PS_AlignHCenter.png', PS_AlignPaths.PS_AlignHCenter );
  var btnAlignLeft = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'PS_AlignLeft.png', PS_AlignPaths.PS_AlignLeft );

  var btnAlignTop = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'PS_AlignTop.png', PS_AlignPaths.PS_AlignTop );
  var btnAlignVCenter = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'PS_AlignVCenter.png', PS_AlignPaths.PS_AlignVCenter );
  var btnAlignBottom = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'PS_AlignBottom.png', PS_AlignPaths.PS_AlignBottom );

  ui.mainLayout.addStretch();

  modal.show();

}
