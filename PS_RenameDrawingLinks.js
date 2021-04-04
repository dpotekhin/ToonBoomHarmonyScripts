/*
Author: D.Potekhin (https://peppers-studio.ru)
Version 0.1
*/

/*
TODO:
- Use group as the name source if no drawing selected.
*/

function PS_RenameDrawingLinks(){

	MessageLog.clearLog(); // !!!

	///
	var namePaterns = {
		
		'PEG': '{{NAME}}-P',

		'PointConstraint2': '{{NAME}}-TPC', // Two-Points-Constraint
		'StaticConstraint': '{{NAME}}-ST', // Static-Transformation
		'KinematicOutputModule': '{{NAME}}-KO', // KinematicOutput
		'OffsetModule': '{{NAME}}-OFS', // OffsetModule
		'CurveModule': '{{NAME}}-CRV', // CurveModule
		'DeformTransformOut': '{{NAME}}-KOP', // Point-Kinematic-Output
		'TransformLimit': '{{NAME}}-TL', // Transformation-Limit 
		'PEG_APPLY3': '{{NAME}}-AIT', // Apply Image Transformation
		'TransformGate': '{{NAME}}-TG', // Transform Gate
		'FoldModule': '{{NAME}}-FLD', // Deformation-Fold
		'AutoFoldModule': '{{NAME}}-AFD', // Auto-Fold
		
		'LAYER_SELECTOR': '{{NAME}}-LS',
		'OVERLAY': '{{NAME}}-OL',
		'UNDERLAY': '{{NAME}}-UL',
		'LINE_ART': '{{NAME}}-LA',
		'COLOR_ART': '{{NAME}}-CA',
		'CUTTER': '{{NAME}}-CUT',
		'AutoPatchModule': '{{NAME}}-AP',
		'VISIBILITY': '{{NAME}}-VIS',
		
		'COMPOSITE': '{{NAME}}-CMP',
		'ImageSwitch': '{{NAME}}-IS', // Image Switch
		'MATTE_RESIZE': '{{NAME}}-MTR',

		'GROUP': [
			['Deformation|-DFM', '{{NAME}}-DFM']
		],
		// 'READ' is ignored

	};


	//
	var n = selection.numberOfNodesSelected();

	var selectedDrawings = [];
	var selectedNodes = [];	

	// Get Drawning nodes
	for (i = 0; i < n; ++i)
	{
 		var selNode = selection.selectedNode(i);
 		MessageLog.trace(i+' => '+node.getName(selNode)+' ['+node.type(selNode)+']' );
 		if( node.type(selNode) == 'READ' ) selectedDrawings.push(selNode);
 		else{
 			selectedNodes.push(selNode);
 		}
 	}

 	if(selectedDrawings.length!==1){
		MessageBox.warning("Please select ONLY ONE Drawing node.",0,0,0,"Error");
 		return;
 	}

	scene.beginUndoRedoAccum('Rename Drawing Links');

	// 
 	var drawingNode = selectedDrawings[0];
 	var drawingName = node.getName(drawingNode);

 	// Links are ignored - so select only nodes to be renamed
 	selectedNodes.forEach(function( _node ){
 		renameNode( _node, drawingName );
 	});

 	

 	/*
 	function isNodeInSelectionList( _node ){
 		var index = selectedNodes.indexOf( _node );
 		if( index !== -1 ){
 			selectedNodes.splice(index,1);
 			return true;
 		}
 	}

	
 	
 	// Collect nodes by a drawning
 	selectedDrawings.forEach(function(drawingData,i){
 		var drawingNode = drawingData.drawingNode;
 		var drawingName = node.getName(drawingNode);
 		MessageLog.trace('==> '+i+': Drawing: '+drawingName );

 		// Go throught parents
 		var inputNodes = getAllInputNodes( drawingNode, isNodeInSelectionList );
 		//drawingData.inputs = inputNodes;
 		MessageLog.trace( 'Input Nodes: '+inputNodes.join('\n') );

 		inputNodes.forEach(function(inputNode){
 			renameNode( inputNode, drawingName );
 		});


 		// Go through the output nodes
 		var outputNodes = getAllOutputNodes( drawingNode, isNodeInSelectionList );
 		//drawingData.outputs = outputNodes;
 		MessageLog.trace( 'Output Nodes: '+outputNodes.join('\n') );

 		outputNodes.forEach(function(outputNode){
 			renameNode( outputNode, drawingName );
 		});
 		// var parent = node.parentNode(exNode); // Parent Node
 	});

 	*/

 	/*
 	if( node.isGroup(selNode) ){ // Check Group Node

			var childNodes = node.subNodes(selNode);

		}else{

			MessageLog.trace(i+': '+node.getName(selNode)+' ['+node.type(selNode)+']');

		}
 	*/
	scene.endUndoRedoAccum();


	///
	function renameNode( _node, name ){
		var nodeType = node.type(_node);
		var nodeName = node.getName(_node);
		// MessageLog.trace('Rename '+nodeName+', '+nodeType);

		var namePattern = namePaterns[nodeType];
		if( !namePattern  ) {
			MessageLog.trace('!!! Node rename failed - no such name patern for type: '+nodeType+' of node "'+nodeName+'"' );
			return;
		}

		if(Array.isArray(namePattern)){

			var namePatternExpressions = namePattern;
			namePattern = undefined;

			namePatternExpressions.forEach(function(namePatternExpression){
				var regexp = new RegExp(namePatternExpression[0],'gi');
				var match = nodeName.match( regexp );
				MessageLog.trace( nodeName+' => '+ match );
				if( match ) namePattern = namePatternExpression[1];
			});

			if( !namePattern ){
				MessageLog.trace('!!! Node rename failed - no pattern match found for node "'+nodeName+'" ['+nodeType+']' );
				return;
			}

		}

		var newName = namePattern.replace('{{NAME}}',name);
		
		if( nodeName === newName ) return;

		var _newName;
		var renameTries = 0;
		var renameSuccess = false;
		
		do{ // Rename until success omitting existing names
			_newName = renameTries === 0 ? newName : newName+'_'+renameTries;
			node.rename( _node, _newName );
			var factName = node.getName(_node);

			if( factName ){
				// MessageLog.trace('!!! Node rename failed - name exists: "'+nodeName+'", name stil is: "'+ factName+'"' );
			}else{
				renameSuccess = true;
			}
			
			// MessageLog.trace('RENAME '+renameTries+' > '+_newName+' ['+factName+'] '+renameSuccess);

			renameTries++;

		}while( !renameSuccess && renameTries<20 )

		// MessageLog.trace('Node renamed from:"'+nodeName+'" to:"'+_newName);

	}


	/*
	///
	function getAllInputNodes( currentNode, checkNode, allInputNodes ){
		
		if( !allInputNodes ) allInputNodes = [];

		var inputNodes = getInputNodes( currentNode, checkNode );

 		if( inputNodes.length ){

	 		allInputNodes = allInputNodes.concat(inputNodes);
	 		// MessageLog.trace( '--- inputNodes: '+inputNodes+'\n >>> '+allInputNodes );
	 		inputNodes.forEach(function( inputNode ){
	 			allInputNodes = getAllInputNodes( inputNode, checkNode, allInputNodes );
	 		});

	 	}

	 	return allInputNodes;
	}

	//
	function getInputNodes( _node, checkNode ){

		var inputPorts = node.numberOfInputPorts(_node);
 		MessageLog.trace( '--- numberOfInputPorts: '+inputPorts );

 		var inputNodes = [];

 		for(var i = 0; i<inputPorts; i++){
 			
	    	var inputNode = node.srcNode(_node, i );
	    	// MessageLog.trace( "    "+i+": "+inputNode );
	    	if( checkNode ){
	    		if( checkNode(inputNode) ) inputNodes.push(inputNode);
	    	}else{
	    		inputNodes.push(inputNode);
	    	}
		}

		return inputNodes;
	}





	///
	function getAllOutputNodes( currentNode, checkNode, allOutputNodes ){
		
		if( !allOutputNodes ) allOutputNodes = [];

		var outputNodes = getOutputNodes( currentNode, checkNode );

 		if( outputNodes.length ){

	 		allOutputNodes = allOutputNodes.concat(outputNodes);
	 		// MessageLog.trace( '--- outputNodes: '+outputNodes+'\n >>> '+allOutputNodes );
	 		outputNodes.forEach(function( outputNode ){
	 			allOutputNodes = getAllOutputNodes( outputNode, checkNode, allOutputNodes );
	 		});

	 	}

	 	return allOutputNodes;
	}

	//
	function getOutputNodes( _node, checkNode ){

		var outputPorts = node.numberOfOutputPorts(_node);
 		// MessageLog.trace( '--- numberOfOutputPorts: '+outputPorts );
 		var outputNodes = [];

 		for(var i = 0; i<outputPorts; i++){
 			
 			var numberOfOutputPortLinks = node.numberOfOutputLinks(_node, i);

 			for(var li=0; li<numberOfOutputPortLinks; li++){
		    	var outputNode = node.dstNode(_node, i, li);
		    	// MessageLog.trace( "    "+i+": "+outputNode );
		    	if( checkNode ){
		    		if( checkNode(outputNode) ) outputNodes.push(outputNode);
		    	}else{
		    		outputNodes.push(outputNode);
		    	}
		    }
		}

		return outputNodes;
	}

	*/
}