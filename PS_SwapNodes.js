/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.210703

This script allows to swap two nodes keeping their connections.

Options:
- Hold Control key to swap names of the nodes
- Hold Shift key to disable swapping position of the nodes

TODO:
-  
*/

function PS_SwapNodes(){

	var selectedNodes = selection.selectedNodes();
	if( selectedNodes.length != 2 ){
		MessageBox.warning('Please select two nodes to swap them.\n\n'
			+'Options:\n'
			+'- Hold Control key to swap names of the nodes\n'
			+'- Hold Shift key to disable swapping position of the nodes'
		,0,0,0,'Error');
		return;
	}

	MessageLog.clearLog();
	
	scene.beginUndoRedoAccum('Swap Nodes');

	var nodeA = selectedNodes[0];
	var nodeB = selectedNodes[1];

	var linksByNode = {};

	try{
		
		collectLinks( nodeA );
		collectLinks( nodeB );

		// Sort outputs of both swapping nodes by a port index in ascending order
		var linksByNodeNames = Object.keys(linksByNode);

		linksByNodeNames.forEach(function(nodeName){

			linksByNode[nodeName] = linksByNode[nodeName].sort(function( a, b ) {
			  if ( a.dest.port < b.dest.port ){
			    return -1;
			  }
			  if ( a.dest.port > b.dest.port ){
			    return 1;
			  }
			  return 0;
			});

		});

		// MessageLog.trace('linksByNode: \n'+ JSON.stringify(linksByNode,true,'  '));

		// Unlinking nodes from the list of input ports starting from its end to avoid disorder of other connections
		linksByNodeNames.forEach(function(nodeName){

			var nodeLinks = linksByNode[nodeName];

			for( var i=nodeLinks.length-1; i>=0; i-- ){
				var linkData = nodeLinks[i];
				node.unlink( linkData.dest.node, linkData.dest.port );
			}

		});

		// Linking swapped connections
		linksByNodeNames.forEach(function(nodeName){

			var nodeLinks = linksByNode[nodeName];

			nodeLinks.forEach(function(linkData){
				
				if( linkData.isInput ){
					node.link(
			        	linkData.src.node, linkData.src.port, // src
			        	getSwapedNodeName( linkData.dest.node ), linkData.dest.port // dest - swapped node
			      	);
				}else{
					node.link(
			        	getSwapedNodeName( linkData.src.node ), linkData.src.port, // src - swapped node
			        	linkData.dest.node, linkData.dest.port // dest
			      	);
				}

			});

		});

		// Swap positions
		if( !KeyModifiers.IsShiftPressed() ){

			var nodeAx = node.coordX(nodeA);
			var nodeAy = node.coordY(nodeA);
	     	node.setCoord( nodeA, node.coordX(nodeB), node.coordY(nodeB) );
	     	node.setCoord( nodeB, nodeAx, nodeAy );

	    }

     	// Swap names of the nodes if needed
     	if( KeyModifiers.IsControlPressed() ){

     		var pathA = getNodePathAndName( nodeA );
     		var nodeATempName = pathA[1]+'__TMP__';
     		var pathB = getNodePathAndName( nodeB );
     		
     		node.rename( nodeA, nodeATempName );
     		node.rename( nodeB, pathA[1] );
     		node.rename( pathA[0]+nodeATempName, pathB[1] );
     		
     	}

	}catch( err ){ MessageLog.trace('Catch Error: '+err); }

	///
	scene.endUndoRedoAccum();


	//
	function getNodePathAndName( _node ){
		var nodePath = _node.split('/');
     	var nodeName = nodePath.pop();
     	return [ nodePath.join('/')+'/', nodeName ];
	}

	//
	function getSwapedNodeName( _node ){
		return _node === nodeA ? nodeB : nodeA;
	}

	//
	function getlinksByNodeItem( _node ){
		if( !linksByNode[_node] ) linksByNode[_node] = [];
		return linksByNode[_node];
	}

	//
	function collectLinks( _node ){

		// Get input connections
	    var inputPortCount = node.numberOfInputPorts( _node );
	    var linksByNodeItem = getlinksByNodeItem(_node);

	    for( var i=0; i<inputPortCount; i++){

	      var inputNodeData = node.srcNodeInfo( _node, i );
	      if( !inputNodeData ) continue;

	      linksByNodeItem.push({
	      	node: _node,
	      	isInput: true,
	        src: inputNodeData,
	        dest: {
	        	node: _node,
	        	port: i
	        }
	      });
	      
	    }

	    // Get output connections
	    var outputPortCount = node.numberOfOutputPorts( _node );

	    for( var opi=0; opi<outputPortCount; opi++){
	      for(var opli = 0; opli < node.numberOfOutputLinks(_node, opi); opli++){
	        
	        var outputNodeData = node.dstNodeInfo( _node, opi, opli );
	        if( !outputNodeData ) continue;

	        getlinksByNodeItem(outputNodeData.node).push({
	          node: _node,
	          isOutput: true,
	          src: {
	          	node: _node,
	          	port: opi,
	          	link: opli
	          },
	          dest: outputNodeData
	        });
	      }
	    }

	}

}