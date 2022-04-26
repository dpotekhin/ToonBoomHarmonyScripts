/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_SelectionSets :]
[Version: 0.211006 :]

[Description:
This script lets you to save and use groups of node selection sets (SS).
:]


[Usage:
Open the Selection Sets window by clicking the script button.

#### Sets Group (SSG).

Right mouse click (RMB) in an empty window space or on an existing SSG menu item and select "Create Group".
In the window that appears, select the parent group node for creating the data node and the name of the SSG to be created.

The SSG data is stored in the Note node. Therefore, they are remaining when you drag and drop the parent group node or the SSG data node itself. If necessary, you can edit that data manually.

##### SSG menu item interaction:
- RMB click on SSG item brings up the context menu for that SSG.


#### Selection Set (SS)

You can create a SS by RMB click on SSG in which you want to create a SS and select one of the context menu items:
- "Create Selection Set from Selection": creates a new SS from the curently selected nodes
- "Create Empty Selection Set": creates an empty SS

##### SS menu item interaction:
- LMB click on SS menu item: selects nodes contained in the SS
  - \+ Ctrl: adds selected nodes to the SS
  - \+ Shift: removes the selected nodes from the SS
  - \+ Alt: toggles the visibility of nodes contained within the SS. You can also toggle their visibility by clicking on the pop-eyed icon
- RMB Click: calls context menu of the current SS
:]

*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SelectionSets-Resources/ps/pModal.js"));
var SSList = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SelectionSets-Resources/SSList.js"));

///
function PS_SelectionSets(){
  
  // MessageLog.clearLog();

  var scriptName = 'Selection Sets';
  var scriptVer = '0.211006';

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
    saveWindowSettings();
    // QWidget.resizeEvent( e );
  }

  ui.moveEvent = function(e){
    // MessageLog.trace('moveEvent: '+ui.x);
    saveWindowSettings();
  }

  function saveWindowSettings(){
    sSList.prefs.windowX = ui.x;
    sSList.prefs.windowY = ui.y;
    sSList.prefs.windowWidth = ui.width;
    sSList.prefs.windowHeight = ui.height;
    sSList.savePrefs();
  }

  /*
  ui.closeEvent = function(e){
    MessageLog.trace('closeEvent');
    QWidget.closeEvent(e);
  }
  */

  // ui.mainLayout.addStretch();

  var SSListPrefs = sSList.prefs;
  // MessageLog.trace('prefs: '+JSON.stringify( sSList,true,' ') );
  if( SSListPrefs.windowWidth ){
    
    var screenBox = QApplication.desktop().screenGeometry();
    var screenWidth = screenBox.width();
    var screenHeight = screenBox.height();
    var screenBorderOffset = 100;

    ui.move(
      Math.max( Math.min( SSListPrefs.windowX, screenWidth - screenBorderOffset ), screenBorderOffset ),
      Math.max( Math.min( SSListPrefs.windowY, screenHeight - screenBorderOffset ), screenBorderOffset )
    );
    ui.resize( SSListPrefs.windowWidth, SSListPrefs.windowHeight );
  }

  modal.show();

}