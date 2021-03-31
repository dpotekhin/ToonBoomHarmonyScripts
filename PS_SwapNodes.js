/*
Author: D.Potekhin (https://peppers-studio.ru)
Version 0.1
*/

/*
TODO:
- to copy all connections from one node to another
*/

function PS_SwapNodes(){

	var selectedNodes = selection.selectedNodes();
	if( selectedNodes.length != 2 ){
		return;
	}

	MessageLog.clearLog();
	
	scene.beginUndoRedoAccum('Swap Nodes');

	var nodeDataA = getNodeData( selectedNodes[0] );
	var nodeDataB = getNodeData( selectedNodes[1] );

	setNodeLinks( nodeDataA.node, nodeDataB );
	setNodeLinks( nodeDataB.node, nodeDataA );

	// Swap positions
	node.setCoord( nodeDataA.node, nodeDataB.x, nodeDataB.y );
	node.setCoord( nodeDataB.node, nodeDataA.x, nodeDataA.y );

	///
	scene.endUndoRedoAccum();

	//
	function getNodeData( _node ){

		var data = {
			node: _node,
			x: node.coordX(_node),
			y: node.coordY(_node),
			inputCount: node.numberOfInputPorts( _node ),
			inputNodesInfo: [],
			outputCount: node.numberOfOutputPorts( _node ),
			outputNodesInfo: []
		};

		// Get input connections
		for( var i=0; i<data.inputCount; i++){
			data.inputNodesInfo.push( node.srcNodeInfo( _node, i ) );
		}

		// Unlink inputs
		data.inputNodesInfo.forEach(function( inputData, portIndex ){
			if( !inputData || !inputData.node) return;
			node.unlink( _node, portIndex );
		});

		// Get output connections
		var outputNodes = [];
		for( var i=0; i<data.outputCount; i++){
			outputNodes.push( node.dstNodeInfo( _node, i, 0 ) );
		}

		outputNodes.forEach( function(outputData, portIndex ){

			if( !outputData || !outputData.node) return;

			var portCount = node.numberOfInputPorts( outputData.node );

			for( var i=0; i<portCount; i++){
				portData = node.srcNodeInfo( outputData.node, i );
				// MessageLog.trace('--->'+JSON.stringify(portData,true,'  '));
				if( !portData || portData.node !== _node ) continue;

				portData.destNode = outputData.node;
				portData.destPort = outputData.port;
				data.outputNodesInfo.push(portData);
			}
		});

		// Unlink outputs
		data.outputNodesInfo.forEach(function( outputData ){
			if( !outputData || !outputData.node) return;
			node.unlink( outputData.destNode, outputData.port );
		});

		//
		MessageLog.trace(_node+' >> '+JSON.stringify(data,true,'  '));

		return data;
	}



	//
	function setNodeLinks( _node, nodeData ){

		// Link inputs
		nodeData.inputNodesInfo.forEach(function( inputData, portIndex ){
			if( !inputData || !inputData.node) return;
			node.link( inputData.node, inputData.port, _node, portIndex  );
		});

		// Link outputs
		nodeData.outputNodesInfo.forEach(function( outputData ){
			if( !outputData || !outputData.node) return;
			node.link( _node, outputData.port, outputData.destNode, outputData.destPort  );
		});
	}


}