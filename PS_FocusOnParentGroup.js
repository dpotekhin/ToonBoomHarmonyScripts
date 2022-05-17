/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220426

Makes the focus on the parent node of the selected one.

*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));

function PS_FocusOnParentGroup(){

	var _selection = selection.selectedNodes();
   	if( !_selection || !_selection[0] ) return;

   	selection.clearSelection();
	selection.addNodeToSelection( node.parentNode(_selection[0]) );

	Action.perform("onActionFocusOnSelectionNV()", "Node View");
	Action.perform("onActionResetView()", "Node View");
	Action.perform("onActionZoomIn()", "Node View");
	Action.perform("onActionZoomIn()", "Node View");
	Action.perform("onActionFocusOnSelectionNV()", "Node View");

}