//
function eachNode( nodes, callback, useGroups, nodeTypeFilter ){
	
	if( nodeTypeFilter && typeof nodeTypeFilter == 'string' ) nodeTypeFilter = [nodeTypeFilter];
	nodes.forEach(function(_node){
		
		if( nodeTypeFilter ){
			var type = node.type(_node);
			if( nodeTypeFilter.indexOf(type) == -1 ) return;
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
	eachNode( nodes, callback, useGroups, nodeTypeFilter );
	return true;
}


//
function filterNodesByType( nodes, typeList, useGroups ){
	if( nodes === true ){
		nodes = selection.selectedNodes();
	}
	MessageLog.trace("filterNodesByType "+nodes);
	if( !nodes || !nodes.length ) return false;
	var filtered = [];
	eachNode( nodes, function(_node){ filtered.push(_node); }, useGroups, typeList );
	return filtered;
}


//
exports = {
	eachNode: eachNode,
	eachSelectedNode: eachSelectedNode,
	filterNodesByType: filterNodesByType
}
