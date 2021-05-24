/*
Author: D.Potekhin (https://peppers-studio.ru)
Version 0.2

If in selection:
- there is only one drawing element, then the script takes its name as the base name.
- there is not a single drawing element or there are more than one of them, but there is only one group - it takes its name as the base name.
- otherwise shows a dialog box for entering the base name.

Options:
- if you hold down the Control key, then the script forcibly displays a dialog box for entering the base name.

TODO:
- Option: rename nodes inside selected groups
*/


//
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

//
function PS_RenameNodes(){

	MessageLog.clearLog(); // !!!

	///
	var namePaterns = {
		
		'PEG': '{{NAME}}-P',

		'MasterController': '{{NAME}}-MC',
		
		'PointConstraint2': '{{NAME}}-TPC', // Two-Points-Constraint
		'StaticConstraint': '{{NAME}}-ST', // Static-Transformation
		'KinematicOutputModule': '{{NAME}}-KO', // KinematicOutput
		'OffsetModule': '{{NAME}}-OFS', // OffsetModule
		'CurveModule': '{{NAME}}-CRV', // CurveModule
		'DeformTransformOut': '{{NAME}}-KOP', // Point-Kinematic-Output
		'TransformLimit': '{{NAME}}-TL', // Transformation-Limit 
		'PEG_APPLY3': '{{NAME}}-AIT', // Apply Image Transformation
		'PEG_APPLY3_V2': '{{NAME}}-APT', // Apply Peg Transformation
		'TransformGate': '{{NAME}}-TG', // Transform Gate
		'FoldModule': '{{NAME}}-FLD', // Deformation-Fold
		'AutoFoldModule': '{{NAME}}-AFD', // Auto-Fold

		'LAYER_SELECTOR': '{{NAME}}-LS',
		'OVERLAY': '{{NAME}}-OL',
		'UNDERLAY': '{{NAME}}-UL',
		'LINE_ART': '{{NAME}}-LA',
		'COLOR_ART': '{{NAME}}-CA',
		'TbdColorSelector': '{{NAME}}-CS',
		'CUTTER': '{{NAME}}-CUT',
		'AutoPatchModule': '{{NAME}}-AP',
		'VISIBILITY': '{{NAME}}-VIS',
		
		'COMPOSITE': '{{NAME}}-CMP',
		'ImageSwitch': '{{NAME}}-IS', // Image Switch
		'MATTE_RESIZE': '{{NAME}}-MTR',
		'BLEND_MODE_MODULE': '{{NAME}}-BLD',
		'FADE': '{{NAME}}-TRS',
		'WRITE': 'Write-{{NAME}}',
		'DISPLAY': '{{NAME}}-DSP',
		'COLOR_CARD': '{{NAME}}-CC',

		'GROUP': [
			['Deformation|-DFM', '{{NAME}}-DFM'], // the naming pattern for standard deformation groups
			['', '{{NAME}}-G']
		],

		'READ': [
			['-HND','{{NAME}}-HND'],
			['-CTRL','{{NAME}}-CTRL'],
			['','{{NAME}}']
		]

	};


	//
	var mainNode, mainName;

 	if( !KeyModifiers.IsControlPressed() ){ // If the Control key is not pressed get the Main Name from the Selection

	 	var selectedDrawings = SelectionUtils.filterNodesByType( true, 'READ', false );
	 	// MessageLog.trace("selectedDrawings "+selectedDrawings);

	 	if(selectedDrawings.length!==1){ // No Single Drawing selected
			// MessageBox.warning("Please select ONLY ONE Drawing node.",0,0,0,"Error");
			var selectedGroups = SelectionUtils.filterNodesByType( true, 'GROUP', false );
			// MessageLog.trace("selectedGroups "+selectedGroups);
			
			if(selectedGroups.length===1){ // No Single Group selected
				mainNode = selectedGroups[0];
			}
	 		
	 	}else{
	 		mainNode = selectedDrawings[0];
	 	}

	 	if( mainNode ) mainName = node.getName(mainNode);
 	}

 	
 	if( !mainName ) mainName = Input.getText('Enter name');

	if( !mainName ) return;

	MessageLog.trace('Name: '+mainName );


	scene.beginUndoRedoAccum('Rename Drawing Links');

 	// Links are ignored - so select only nodes to be renamed
 	SelectionUtils.eachSelectedNode(function( _node, name ){
 		if( name === mainName ) return;
 		MessageLog.trace(name);
 		renameNode( _node, mainName );
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
 		var mainNode = drawingData.mainNode;
 		var mainName = node.getName(mainNode);
 		MessageLog.trace('==> '+i+': Drawing: '+mainName );

 		// Go throught parents
 		var inputNodes = getAllInputNodes( mainNode, isNodeInSelectionList );
 		//drawingData.inputs = inputNodes;
 		MessageLog.trace( 'Input Nodes: '+inputNodes.join('\n') );

 		inputNodes.forEach(function(inputNode){
 			renameNode( inputNode, mainName );
 		});


 		// Go through the output nodes
 		var outputNodes = getAllOutputNodes( mainNode, isNodeInSelectionList );
 		//drawingData.outputs = outputNodes;
 		MessageLog.trace( 'Output Nodes: '+outputNodes.join('\n') );

 		outputNodes.forEach(function(outputNode){
 			renameNode( outputNode, mainName );
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

			namePatternExpressions.every(function(namePatternExpression){ // Find very first matched pattern
				if( !namePatternExpression[0] ) namePatternExpression[0] = '.*';
				var regexp = new RegExp(namePatternExpression[0],'gi');
				var match = nodeName.match( regexp );
				MessageLog.trace( nodeName+' => '+ match );
				if( match ) {
					namePattern = namePatternExpression[1];
					return false;
				}
				return true;
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