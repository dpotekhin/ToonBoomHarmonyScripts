/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.2
*/


/* TODO:
- add function to Horizontal node alignment
- Distribute nodes horizontally then Alt key is pressed
*/

function PS_AlignNodesVertically(){
	
	var MODE_LOWEST = 1;
	var MODE_TOPMOST = 2;
	var MODE_CENTER = 3;

	//
	var mode = MODE_LOWEST;
	if( KeyModifiers.IsControlPressed() ) mode  = MODE_TOPMOST;
	else if( KeyModifiers.IsShiftPressed() ) mode = MODE_CENTER;

	//
	var distribute = KeyModifiers.IsAlternatePressed();
	var verticalOffset = 30;

	//
	var selectedNodes = selection.selectedNodes();

	if(selectedNodes.length<2){
		MessageBox.warning(
			"Please select at least two nodes to align them vertically.\n\n"+
			"Nodes are aligned to the lowest node by default.\n"+
			"\nOptions:\n"+
			"- Hold Control key to align to the topmost selected node.\n"+
			"- Hold Shift key to align to the middle position of all the nodes.\n"+
			"- Hold Alt key to distribute nodes."
			,0,0,0,"Error");
 		return;
 	}

	var distributedHeight = 0;
 	var minX = Number.MAX_VALUE;
 	var maxX = -Number.MAX_VALUE;
 	var minY = Number.MAX_VALUE;
 	var maxY = -Number.MAX_VALUE;
 	var topmostNode, lowestNode;
 	var nodeObjects = [];

 	selectedNodes.forEach(function(_node,i){
 		var nodeData = {
 			node: _node,
 			x: node.coordX(_node),
 			y: node.coordY(_node),
 			w: node.width(_node),
 			h: node.height(_node)
 		}
 		nodeData.wh = nodeData.w/2;
 		nodeData.hh = nodeData.h/2;

 		distributedHeight += (i==0 ? 0 : verticalOffset ) + nodeData.h;

 		var xc = nodeData.x + nodeData.wh;
 		if( xc < minX ) minX = xc;
 		if( xc > maxX ) maxX = xc;
 		
 		if( nodeData.y < minY ) {
 			minY = nodeData.y;
 			topmostNode = nodeData;
 		}
 		if( nodeData.y > maxY ) {
 			maxY = nodeData.y;
 			lowestNode = nodeData;
 		}

 		nodeObjects.push(nodeData);
 	});

 	nodeObjects.sort(function(a,b){
 		if(a.y<b.y) return -1;
 		if(a.y>b.y) return 1;
 		return 0;
 	});

 	// MessageLog.trace('topmostNode:'+JSON.stringify(topmostNode));
 	// MessageLog.trace('lowestNode:'+JSON.stringify(lowestNode));
 	// MessageLog.trace('distribute:'+distribute+', '+distributedHeight);
 	// MessageLog.trace('-->:'+JSON.stringify(nodeObjects));

 	// START UNDO ACCUM
	scene.beginUndoRedoAccum('Align nodes');

	var y = topmostNode.y;

	//
	switch( mode ){

		case MODE_LOWEST:
			y = lowestNode.y - distributedHeight + lowestNode.h;
			align( lowestNode.x + lowestNode.wh, y, distribute, verticalOffset );
			break;

	 	case MODE_TOPMOST:
	 		align( topmostNode.x + topmostNode.wh, y, distribute, verticalOffset );
	 		break;

	 	default:
	 		align( minX + (maxX - minX)/2 );
	 		break;
	}


	///
 	function align( x, y, distribute, verticalOffset ){
 		
 		if(!y) y = 0;
 		// x = Math.floor(x);

 		nodeObjects.forEach(function(nodeData){
 			
 			ny = distribute ? y : nodeData.y;
 			node.setCoord( nodeData.node, x - nodeData.wh, ny );
 			y += nodeData.h + verticalOffset;

 		});

 	}

 	// END UNDO ACCUM
	scene.endUndoRedoAccum();

}