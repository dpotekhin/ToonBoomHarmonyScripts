/*
Author: D.Potekhin (d@peppers-studio.ru)
*/
// https://docs.toonboom.com/help/harmony-20/scripting/script/index.html

var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/NodeUtils.js"));

function PS_UnlinkElementFunctions(){	

	MessageLog.clearLog();

	var n = selection.numberOfNodesSelected();

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
	 	MessageLog.trace('Error: '+err);
	 }

 	scene.endUndoRedoAccum();
 	
 	MessageLog.trace('<<< Unlink Functions : Ended');
}