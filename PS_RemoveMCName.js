/*
Author: D.Potekhin (d@peppers-studio.ru)
Idea: I.Yeskoff
Version 0.210721

This script lets to remove labels of selected Master Controllers

Options:
- Hold Control key to get label names from their node names excluding 'mc_' prefix

TODO:
- 
*/

function PS_RemoveMCName(){

	var nameAsNodeModifier = KeyModifiers.IsControlPressed();

	selection.selectedNodes().forEach(function(_node,i){

		if( node.type(_node) !== 'MasterController' ) return;
		
		var name = nameAsNodeModifier ? node.getName(_node).replace(/^mc_/i,'') : '';
		node.setTextAttr(_node, "label", 1, name );

		// update controls if it's shown
		if( node.isControlShown( _node ) ){
			node.showControls( _node, false );
			node.showControls( _node, true );
		}

	});

}