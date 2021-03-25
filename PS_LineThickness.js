var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1

Allows to apply line adjustments to selected drawing layers


ToDo:
- create an interface
- save changed settings between sessions
*/

function PS_LineThickness(){

	//
	// MessageLog.clearLog(); // !!!

	//

	var currentFrame = frame.current();
	var lineThickness = 0.7;
	var nodesCount = 0;

	var result = SelectionUtils.eachSelectedNode( function( _node ){
		
		var nodeName = node.getName(_node);
		// if( nodeName == 'REF' ) return; // !!!

		MessageLog.trace('>> "'+ _node +'", "'+nodeName+'" ['+ node.type(_node)+']' );
		
		var attrs = node.getAllAttrKeywords(_node);
		// MessageLog.trace('- '+attrs.join('\n- '));

		// ADJUST_PENCIL_THICKNESS						// <BOOL>
		var ADJUST_PENCIL_THICKNESS = node.getAttr( _node, currentFrame, 'ADJUST_PENCIL_THICKNESS');
		// MessageLog.trace('ADJUST_PENCIL_THICKNESS: '+ADJUST_PENCIL_THICKNESS.boolValue() );
		ADJUST_PENCIL_THICKNESS.setValue( true );

		// NORMAL_LINE_ART_THICKNESS					// <BOOL>
		// ZOOM_INDEPENDENT_LINE_ART_THICKNESS			// <BOOL>
		
		// MULT_LINE_ART_THICKNESS						// <FLOAT> Proportional ?
		// ADD_LINE_ART_THICKNESS						// <FLOAT> Constant

		// MIN_LINE_ART_THICKNESS						// <FLOAT>
		var MIN_LINE_ART_THICKNESS = node.getAttr( _node, frame, 'MIN_LINE_ART_THICKNESS');
		// MessageLog.trace('MIN_LINE_ART_THICKNESS: '+MIN_LINE_ART_THICKNESS.doubleValue() );
		MIN_LINE_ART_THICKNESS.setValue( lineThickness );

		// MAX_LINE_ART_THICKNESS						// <FLOAT> 
		var MAX_LINE_ART_THICKNESS = node.getAttr( _node, frame, 'MAX_LINE_ART_THICKNESS');
		// MessageLog.trace('MAX_LINE_ART_THICKNESS: '+MAX_LINE_ART_THICKNESS.doubleValue() );
		MAX_LINE_ART_THICKNESS.setValue( lineThickness );

		// - - - - - Deformation - - - - -
		// PENCIL_LINE_DEFORMATION_PRESERVE_THICKNESS	// <BOOL>
		// PENCIL_LINE_DEFORMATION_QUALITY				// <ENUM>
		// PENCIL_LINE_DEFORMATION_SMOOTH				// <INT>
		// PENCIL_LINE_DEFORMATION_FIT_ERROR			// <FLOAT>

		nodesCount++;

	}, true, 'READ' );


	if( !result || !nodesCount ){
		MessageBox.warning('Please select at least one Drawing node.',0,0,0,'Error');
	}


}