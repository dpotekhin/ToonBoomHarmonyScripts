/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.210703

This script allows to swap two nodes keeping their connections.
Swapping nodes between different groups is supported.

Options:
- Hold Control key to swap names of the nodes
- Hold Shift key to disable swapping position of the nodes

TODO:
- There's a bug when swap nodes connected directly to Multiports - somehow new ports are created
- Also swap animation functions and expressions of the swapping nodes on a key modifier
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

	// MessageLog.clearLog();
	
	scene.beginUndoRedoAccum('Swap Nodes');

	var nodeA = getNodeData( selectedNodes[0], 'A' );
    var nodeB = getNodeData( selectedNodes[1], 'B' );

    // MessageLog.trace('A:'+JSON.stringify(nodeA,true,'  '));
    // MessageLog.trace('B:'+JSON.stringify(nodeB,true,'  '));
	
	var linksByNode = {};

	try{
		
		collectLinks( nodeA.tempPath, function(){ return nodeA.tempPath; });
		collectLinks( nodeB.tempPath, function(){ return nodeB.tempPath; });

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


		// Move nodes between groups
		moveToGroup( nodeA, nodeB );
		moveToGroup( nodeB, nodeA );
		
		// throw "Error";


		// Linking swapped connections
		linksByNodeNames.forEach(function(nodeName){

			var nodeLinks = linksByNode[nodeName];

			nodeLinks.forEach(function(linkData){
				
				if( linkData.isInput ){

					// MessageLog.trace( '=> '+linkData.src.node+', '+linkData.src.port +'\n;'+ // src
			        	// getSwapedNodeName( linkData.dest.node )+', '+linkData.dest.port);
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

			placeNode( nodeA.tempPath, nodeB.x, nodeB.y );
	     	placeNode( nodeB.tempPath, nodeA.x, nodeA.y );

	    }

     	// Swap names of the nodes if needed
     	if( KeyModifiers.IsControlPressed() ){

     		node.rename( nodeA.tempPath, nodeB.name );
     		node.rename( nodeB.tempPath, nodeA.name );
     		
     	}else{

     		node.rename( nodeA.tempPath, nodeA.name );
     		node.rename( nodeB.tempPath, nodeB.name );

     	}


	}catch( err ){ MessageLog.trace('Catch Error: '+err); }

	///
	scene.endUndoRedoAccum();


	//
	function placeNode( _node, x, y ){
		node.setCoord( _node, x - node.width(_node)/2, y - node.height(_node)/2 );
	}


	//
	function getNodeData( _node, suffix ){
		var nodePath = _node.split('/');
     	var nodeName = nodePath.pop();
     	var groupPath = nodePath.join('/')+'/';
     	var nodeTempName = nodeName+'__TMP'+(suffix || '')+'__';
     	var tempPath = groupPath+nodeTempName;
     	var x = node.coordX(_node) + node.width(_node)/2;
     	var y = node.coordY(_node) + node.height(_node)/2;
     	node.rename( _node, nodeTempName );
     	return {
     		groupPath: groupPath,
     		name: nodeName,
     		path: groupPath+nodeName,
     		tempName: nodeTempName,
     		tempPath: tempPath,
     		x: x,
     		y: y
     	};
	}

	//
	function getSwapedNodeName( _node ){
		return _node === nodeA.tempPath ? nodeB.tempPath : nodeA.tempPath;
	}

	//
	function getlinksByNodeItem( _node ){
		if( !linksByNode[_node] ) linksByNode[_node] = [];
		return linksByNode[_node];
	}
	
	//
	function moveToGroup( _nodeA, _nodeB ){

		var subnodeCount = node.numberOfSubNodes(_nodeB.groupPath);
		// MessageLog.trace('before: '+ node.subNodes(_nodeB.groupPath).join('\n') );

		node.moveToGroup( _nodeA.tempPath, _nodeB.groupPath );
		_nodeA.tempPath = _nodeB.groupPath + _nodeA.tempName;

		// Remove automaticaly created Composite
		if( subnodeCount+1 < node.numberOfSubNodes(_nodeB.groupPath) ){ 
			var lastSubnode = node.subNodes(_nodeB.groupPath).pop();
			// MessageLog.trace('after: '+ node.subNodes(_nodeB.groupPath).join('\n') );
			if( node.type(lastSubnode) === 'COMPOSITE' ) node.deleteNode(lastSubnode,false,false);
		}

		// Unlink an autoconnected transform
		node.unlink(_nodeA.tempPath, 0);

		// Unlink an autoconnected output
		var dest = node.dstNodeInfo(_nodeA.tempPath, 0, 0);
		if( dest ) node.unlink( dest.node, dest.port );

	}

	//
	function collectLinks( _node, getNodeName ){

		// Get input connections
	    var inputPortCount = node.numberOfInputPorts( _node );
	    var linksByNodeItem = getlinksByNodeItem(_node);

	    for( var i=0; i<inputPortCount; i++){

	      var inputNodeData = node.srcNodeInfo( _node, i );
	      if( !inputNodeData ) continue;

	      var obj = {
	      	// node: _node,
	      	isInput: true,
	        src: inputNodeData,
	        dest: {
	        	// node: _node,
	        	port: i
	        }
	      };
	      Object.defineProperty(obj, 'node', { get: getNodeName });
	      Object.defineProperty(obj.dest, 'node', { get: getNodeName });
	      // MessageLog.trace('OBJ: '+_node+'; '+obj.dest.node );
	      linksByNodeItem.push(obj);

	    }

	    // Get output connections
	    var outputPortCount = node.numberOfOutputPorts( _node );

	    for( var opi=0; opi<outputPortCount; opi++){

	      for(var opli = 0; opli < node.numberOfOutputLinks(_node, opi); opli++){
	        
	        var outputNodeData = node.dstNodeInfo( _node, opi, opli );
	        if( !outputNodeData ) continue;

	        var obj = {
	          // node: _node,
	          isOutput: true,
	          src: {
	          	// node: _node,
	          	port: opi,
	          	link: opli
	          },
	          dest: outputNodeData
	        };

	        Object.defineProperty(obj, 'node', { get: getNodeName });
	      	Object.defineProperty(obj.src, 'node', { get: getNodeName });
	      	getlinksByNodeItem(outputNodeData.node).push(obj);

	      }

	    }

	}

}