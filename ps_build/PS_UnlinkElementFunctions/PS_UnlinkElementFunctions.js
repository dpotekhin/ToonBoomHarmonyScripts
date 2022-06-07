/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_UnlinkElementFunctions :]
[Version: 0.210501 :]

[Description:
This script allows to unlink animation functions and expressions from selected nodes.
:]

[Usage:
* Select nodes in Node View and click the Script button to unlink all animation functions linked to them.

#### Options
* Hold Control key to unlink Bezier functions only
* Hold Shift key to unlink Expressions only
* Hold Alt key to keep current transformation values
:]

*/

var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_UnlinkElementFunctions-Resources/ps/NodeUtils.js"));

function PS_UnlinkElementFunctions(){	

	MessageLog.clearLog();

	var n = selection.numberOfNodesSelected();
	
	if( !n ){
		MessageBox.warning('Please select at least one node to remove its animation functions and expressions.\n\n'
			+'Options:\n'
			+'- Hold Control key to unlink Bezier functions only\n'
			+'- Hold Shift key to unlink Expressions only\n'
			+'- Hold Alt key to keep current transformation values'
		,0,0,0,'Error');
		return;
	}

	var unlinkBeziers = KeyModifiers.IsControlPressed();
	var unlinkExpressions = KeyModifiers.IsShiftPressed();
	var keepCurrentValues = KeyModifiers.IsAlternatePressed();

	var columnFilter = ['DRAWING']; //
	var invertColumnFilter = true;

	if(  unlinkBeziers || unlinkExpressions ){
		
		columnFilter = []; //
		invertColumnFilter = false;

		if( unlinkBeziers ) columnFilter.push( 'BEZIER' );
		if( unlinkExpressions ) columnFilter.push( 'EXPR' );

		MessageLog.trace('>>> Unlink only: '+columnFilter );

	}else{
		MessageLog.trace('>>> Unlink all except: '+columnFilter );
	}

	scene.beginUndoRedoAccum('unlinkFunctions');

	try{
		for (i = 0; i < n; ++i)
		{
	 		var selNode = selection.selectedNode(i);
			
			if( node.isGroup(selNode) ){

				var childNodes = node.subNodes(selNode);
				// MessageLog.trace('!! Is GROUP: "'+node.getName(selNode)+'",  children:'+childNodes.length );
				for( gi=0; gi<childNodes.length; gi++){
					NodeUtils.unlinkFunctions( childNodes[gi], columnFilter, invertColumnFilter, keepCurrentValues );	
				}

			}else{
				NodeUtils.unlinkFunctions( selNode, columnFilter, invertColumnFilter, keepCurrentValues );
			}
			

			// // Get Node position in the Node View
			// MessageLog.trace('x='+node.coordX(selNode)+', y='+node.coordY(selNode));

	 	}
	 }catch(err){
	 	// MessageLog.trace('Error: '+err);
	 }

 	scene.endUndoRedoAccum();
 	
 	// MessageLog.trace('<<< Unlink Functions : Ended');
}