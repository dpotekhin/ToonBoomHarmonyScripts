/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1

This script resets transformation of the selected node with options:
- Resets Position, rotation and scale by default
- Hold the Shift key to reset only the Position of the selected node
- Hold the Control key to reset only the Scale of the selected node
- Hold the Alt key to reset only the Rotation of the selected node
*/

// var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));

//
function PS_ResetTransformation(){

	MessageLog.clearLog();

	var selectedNodes = selection.selectedNodes();
	if( !selectedNodes || !selectedNodes.length ){
		return;
	}

	var currentFrame = frame.current();
	var resetPosition = KeyModifiers.IsShiftPressed();
	var resetScale = KeyModifiers.IsControlPressed();
	var resetRotation = KeyModifiers.IsAlternatePressed();
	var resetAll = !(resetPosition || resetRotation || resetScale);

	function setAttrValues( _node, val, attrList ){
		attrList.forEach(function(attrName){
			node.getAttr(_node, currentFrame, attrName).setValueAt( val, currentFrame );
		});
	}

	//
	scene.beginUndoRedoAccum('ResetTransformation');

	//
	selectedNodes.forEach(function(_node){
		
		// var _attrs = Utils.getFullAttributeList( _node, currentFrame, true );
		// MessageLog.trace('selectedNode: '+ _node+'\n>'+ _attrs.join('\n') );

		if( resetAll || resetPosition ) setAttrValues( _node, 0, ['POSITION.X','POSITION.Y','POSITION.Z'] );
		if( resetAll || resetRotation ) setAttrValues( _node, 0, ['ROTATION.ANGLEX','ROTATION.ANGLEY','ROTATION.ANGLEZ', 'ANGLE', 'SKEW'] );
		if( resetAll || resetScale ) setAttrValues( _node, 1, ['SCALE.X','SCALE.Y','SCALE.Z'] );

	});

	//
	scene.endUndoRedoAccum();
	
}