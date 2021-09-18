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
exports = {
	eachNode: eachNode,
	eachSelectedNode: eachSelectedNode,
	filterNodesByType: filterNodesByType,
	hasSelectedNodes: hasSelectedNodes,
	selectNodes: selectNodes
}
