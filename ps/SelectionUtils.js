//
function eachNode( nodes, callback, useGroups, nodeTypeFilter ){
	
	// MessageLog.trace('eachNode: '+nodes +'; '+ callback +'; '+ useGroups +'; '+ nodeTypeFilter);

	if( !nodes ) return;
	if( nodeTypeFilter && typeof nodeTypeFilter == 'string' ) nodeTypeFilter = [nodeTypeFilter];
	if( typeof nodes == 'string' ) nodes = [nodes];

	nodes.forEach(function(_node){
		
		// MessageLog.trace('forEach: '+_node+'; '+nodeTypeFilter +'; '+ node.isGroup(_node) +'; '+ useGroups  );

		if( nodeTypeFilter ){ //

			if( !(node.isGroup(_node) && useGroups) ){ // If we search through the groups and this Node is a GROUP

				var type = node.type(_node);
				// MessageLog.trace('filter: '+_node+'; '+type  );
				if( nodeTypeFilter.indexOf(type) == -1 ) return;
			}

		}

		if(callback) {
			var name = node.getName(_node);
			callback( _node, name );
		}

		if( useGroups ){
			
			var childNodes = node.subNodes(_node);
			eachNode( childNodes, callback, useGroups, nodeTypeFilter );

		}
	});

}


//
function eachSelectedNode( callback, useGroups, nodeTypeFilter ){
	var nodes = selection.selectedNodes();
	if( !nodes || !nodes.length ) return false;
	// MessageLog.trace('eachSelectedNode: '+nodes);
	eachNode( nodes, callback, useGroups, nodeTypeFilter );
	return true;
}


//
function filterNodesByType( nodes, typeList, useGroups ){
	if( nodes === true ){
		nodes = selection.selectedNodes();
	}
	// MessageLog.trace("filterNodesByType "+nodes+' ; '+typeList );
	if( !nodes || !nodes.length ) return false;
	if( !typeList ) return nodes;
	var filtered = [];
	eachNode( nodes, function(_node){ filtered.push(_node); }, useGroups, typeList );
	return filtered;
}

//
function hasSelectedNodes(){
	return selection.numberOfNodesSelected();
}

//
function selectNodes( _nodes ){
	selection.clearSelection();
	if( typeof _nodes === 'string' ) selection.addNodeToSelection(_nodes);
	else selection.addNodesToSelection(_nodes);
}


//
function getSelectedLayers( onlyFirstAndLast ){
    
    var selectedLayers = {};
    var numSelLayers = Timeline.numLayerSel;
    var layerName;
    
    for ( var i = 0; i < numSelLayers; i++ ){

        if ( Timeline.selIsNode( i ) ){
            
            layerName = Timeline.selToNode(i);
            if( !selectedLayers[layerName] ) selectedLayers[layerName] = {
                name: node.getName(layerName),
                node: layerName,
                index: i,
                layerType: 'node',
            };

        }else if ( Timeline.selIsColumn( i ) ){
            
            layerName = Timeline.selToColumn(i);
            if( !selectedLayers[layerName] ) selectedLayers[layerName] = {
                name: layerName,
                index: i,
                layerType: 'column',
                columnType:  column.type(layerName),
                column: layerName
            };
        }

    }

    var layerKeys = Object.keys(selectedLayers);
    var result = [];

    if( !layerKeys.length ) return result;

    layerKeys.forEach(function( layerName, i ){
        if( onlyFirstAndLast && !( i === 0 || i === layerKeys.length-1 ) ) return;
        result.push( selectedLayers[layerName] );
    });

    return result;

}


//
function eachAnimatedAttributeOfSelectedLayers( _action ){

  var selectedlayers = getSelectedLayers();
  // MessageLog.trace('selectedlayers: '+JSON.stringify(selectedlayers,true,' '));

  selectedlayers.forEach(function( _layer, i ){
    
    var _node = _layer.node;
    var attributes = getLinkedAttributeNames( _node );
    // MessageLog.trace(i+') '+_node+': '+JSON.stringify(attributes,true,' '));
    
    attributes.forEach(function( _attrName ){
      _action( _node, _attrName );
    });

  });

}



///
exports = {
	eachNode: eachNode,
	eachSelectedNode: eachSelectedNode,
	filterNodesByType: filterNodesByType,
	hasSelectedNodes: hasSelectedNodes,
	selectNodes: selectNodes,
	getSelectedLayers: getSelectedLayers,
	eachAnimatedAttributeOfSelectedLayers: eachAnimatedAttributeOfSelectedLayers,
}
