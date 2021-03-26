//
function eachNode( nodes, callback, useGroups, nodeFilter ){
	
	if( nodeFilter && typeof nodeFilter == 'string' ) nodeFilter = [nodeFilter];

	nodes.forEach(function(_node){
		if( !node.isGroup(_node) ){
			
			if( nodeFilter ){
				var type = node.type(_node);
				if( nodeFilter.indexOf(type) == -1 ) return;
			}

			callback( _node );

		}else if( useGroups ){
			
			var childNodes = node.subNodes(_node);
			eachNode( childNodes, callback, useGroups, nodeFilter );

		}
	});
}


//
function eachSelectedNode( callback, useGroups, nodeFilter ){
	var nodes = selection.selectedNodes();
	if( !nodes || !nodes.length ) return false;
	eachNode( nodes, callback, useGroups, nodeFilter );
	return true;
}


//
exports = {
	eachNode: eachNode,
	eachSelectedNode: eachSelectedNode
}
