/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.210628

This script resets transformation of the selected Pegs, Drawings and Deformation nodes and with options:
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


	function getOutputNode( _node ){
	   var numOutput = node.numberOfOutputPorts( _node );
	   var listOfDestinationNodes = [];
	   for(var i = 0; i<numOutput; i++)
	     listOfDestinationNodes.push(node.dstNode(_node, i, 0));
	   return listOfDestinationNodes[0];
	}

	function getNodeAttr( _node, attrName ){
		
		var modifier = attrName.charAt(0);
		
		if( modifier === '>' ){ // reset next node
			var nextNode = getOutputNode(_node);
			if( !nextNode ) {
				MessageLog.trace('Next node of the "'+_node+'" not found.');
				return;
			}
			// MessageLog.trace('Get an attribute of the next node of "'+_node+'" > '+nextNode );
			attrName = attrName.substr(1,attrName.length);
			_node = nextNode;
		}

		var attr = node.getAttr(_node, currentFrame, attrName );
		return attr;
	}


	function setAttrValues( _node, attrList ){
		for( var i=0; i<attrList.length; i+=2){
			
			var attrName = attrList[i];
			
			var val = attrList[i+1];
			var _val = val;
			if( typeof val === 'string' ){ // the value is a name of an another node attribute

				var attr = getNodeAttr( _node, val );
				if( !attr ) {
					MessageLog.trace('Referenced attribute not found "'+val+'"');
					continue;
				}
				val = attr.doubleValueAt( currentFrame );
			}

			var attr = getNodeAttr( _node, attrName );
			if( !attr ){
				MessageLog.trace('Attribute not found "'+attrName+'"');
				continue;
			}
			
			// MessageLog.trace( attrName+' => '+val+' ('+_val+') = '+attr.doubleValueAt( currentFrame ) );

			attr.setValueAt( val, currentFrame );
			// MessageLog.trace('>>>> "'+attrName+'" ==> '+attr.doubleValueAt( currentFrame ) );

		}
	}


	//
	var nodeTemplates = {
		'PEG,READ': {
			position: ['POSITION.X',0,'POSITION.Y',0,'POSITION.Z',0,'OFFSET.X',0,'OFFSET.Y',0,'OFFSET.Z',0],
			rotation: ['ROTATION.ANGLEX',0,'ROTATION.ANGLEY',0,'ROTATION.ANGLEZ',0,'ANGLE',0,'SKEW',0],
			scale: ['SCALE.X',1,'SCALE.Y',1,'SCALE.Z',1]
		},
		'OffsetModule,CurveModule': {
			position: ['offset.X','restingOffset.X','offset.Y','restingOffset.Y'],
			rotation: [
				'orientation','restingOrientation',
				'orientation1','restingOrientation1',
				'>orientation0','>restingOrientation0',
			],
			scale: [
				'length1','restLength1',
				'>length0','>restLength0'
			]
		},
		'BendyBoneModule':{
			position: ['offset.X','restOffset.X','offset.Y','restOffset.Y'],
			rotation: [
				'orientation','restOrientation',
				'radius','restRadius','bias','restBias'
			],
			scale: ['length','restLength']
		}
	};
	
	var nodeTemplatesByNodeName = {};
	Object.keys(nodeTemplates).forEach(function(_nodeName){
		_nodeName.split(',').forEach(function(__nodeName){
			nodeTemplatesByNodeName[__nodeName] = nodeTemplates[_nodeName];
		});
	});




	//
	scene.beginUndoRedoAccum('ResetTransformation');

	//

	
	// get Group content
	var nodeList = [];
	selectedNodes.forEach(function(_node){
		if( node.type(_node) !== 'GROUP' ){ nodeList.push(_node); }
		else nodeList = nodeList.concat( node.subNodes(_node) );
	});
	// MessageLog.trace( 'nodeList: \n' +nodeList.join('\n'))
	

	//
	nodeList.forEach(function(_node){
		
		var nodeType = node.type(_node);
		MessageLog.trace('reset node transform: '+ _node+' > '+ nodeType );
		
		// var _attrs = Utils.getFullAttributeList( _node, currentFrame, true );
		// MessageLog.trace('attrs: '+ _attrs.join('\n') );

		var nodeAttrSettings = nodeTemplatesByNodeName[nodeType];
		if( !nodeAttrSettings ){
			MessageLog.trace('Custom attr settings not found for node "'+_node+'" ('+nodeType+')');
			return;
		}

		if( resetAll || resetPosition ) setAttrValues( _node, nodeAttrSettings.position );
		if( resetAll || resetRotation ) setAttrValues( _node, nodeAttrSettings.rotation );
		if( resetAll || resetScale ) setAttrValues( _node, nodeAttrSettings.scale );

	});

	//
	scene.endUndoRedoAccum();
	
}