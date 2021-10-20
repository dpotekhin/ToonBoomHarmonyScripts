var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));

function PS_DistributeDrawingSubstitutionsToTimeline(){

	// MessageLog.clearLog(); // !!!

	var selectedLayers = Utils.getSelectedLayers(true);
	var selectedNode;
	MessageLog.trace('selectedLayers: '+JSON.stringify( selectedLayers, true, '  ') );

	if( !selectedLayers || !selectedLayers.length ){
		selectedNode = selection.selectedNode(0);
	}else{
		selectedNode = selectedLayers[0].node;
	}
	
	if( node.type( selectedNode ) !== 'READ' ){
		MessageBox.information('Please select a Drawing.',0,0,0);
		return;
	}

	var currentFrame = KeyModifiers.IsControlPressed() ? 1 : frame.current();
	var drawingColumn = node.linkedColumn(selectedNode, "DRAWING.ELEMENT");
	if( !drawingColumn ){
		MessageBox.information('Selected drawing has no an element connected.',0,0,0);
		return;
	}

	var elementId = node.getElementId( selectedNode );

	scene.beginUndoRedoAccum('Distribute Drawing Substitutions To Timeline');
   	
	for(var i = 0 ; i < Drawing.numberOf(elementId); i++)
  	{
  		var drawingId = Drawing.name(elementId, i);
  		column.setEntry(drawingColumn, 1, currentFrame+i, drawingId);
  		MessageLog.trace( (i+1)+') '+drawingId );
  	}

  	scene.endUndoRedoAccum();

}