/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_RotationEulerFilter :]
[Version: 0.211028 :]

[Description:
This script compensates for rotation attributes values change over 180 degrees between adjacent keyframes.
:]

[Usage:
Select the layers and time range on the Timeline and click the script button.
If you don't select a time range, the entier Timeline will be used.

#### Options:
- Hold down the Control key to use 360 degrees as minimum rotation angle.
:]
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

//
function PS_RotationEulerFilter(){

	MessageLog.clearLog(); // !!!

	var usedNodes = {};
	var nodeTypes = ['PEG','READ','CurveModule','OffsetModule'];
	var attrNames = /ROTATION.|orientation/i;
	var useMinimumRotationAngle = !KeyModifiers.IsControlPressed();
	var startFrame = Timeline.firstFrameSel;
	var stopFrame = startFrame + Timeline.numFrameSel - 1;
	if( startFrame === stopFrame ) {
		startFrame = 1;
		stopFrame = frame.numberOf();
	}
	// MessageLog.trace(startFrame+', '+stopFrame);

	scene.beginUndoRedoAccum("Rotation Euler Filter");

	try{

	var processedNodes = 0;

	SelectionUtils.getSelectedLayers().forEach(function(nodeData,i){
		
		var _node = nodeData.node;
		
		if( usedNodes[_node] ) return;
		usedNodes[_node] = true;

		var nodeType = node.type(_node);
		if( nodeTypes.indexOf(nodeType) === -1 ) return;

		// MessageLog.trace(i+' > '+nodeType+' > '+JSON.stringify(nodeData,true,'  '));
		var attrs = Utils.getLinkedAttributeNames(_node).filter(function(attrName){
			return attrName.match(attrNames);
		});
		if( !attrs.length ) return;
		// MessageLog.trace(i+' > '+JSON.stringify(attrs,true,'  '));

		processedNodes++;

		attrs.forEach(function(attrName){

			var column = node.linkedColumn(_node, attrName);
			var pointsNumber = func.numberOfPoints(column);
			// MessageLog.trace('attrName: '+attrName+', '+column+': '+pointsNumber);

			var prevValue;
			for( var i=0; i<pointsNumber; i++ ){
				
				var _frame = func.pointX( column, i );
				if( _frame < startFrame ) continue;
				if( _frame > stopFrame ) return;
				var val = func.pointY( column, i );
				
				// MessageLog.trace(_frame+' > '+val);
				
				if( prevValue !== undefined ){

					var _val = val;
					var diff = val - prevValue;
					var leftHandleValue = func.pointHandleLeftY(column,i) - prevValue;
					var rightHandleValue = func.pointHandleRightY(column,i) - prevValue;

					// MessageLog.trace('diff: '+diff+'\nprevValue: '+prevValue+'\nval: '+val);

					if( Math.abs(diff) >= 360 ){ // Euler filter
						
						val -= ~~( diff / 360 ) * 360;
						diff = val - prevValue;

					}

					if( useMinimumRotationAngle && Math.abs(diff) > 180 ){ // Set a minimum angle

						val -= diff > 0 ? 360 : -360;
						// MessageLog.trace('Set a minimum angle!'+diff+' > '+prevValue+' > '+val);
					}

					if( val !== _val ){

						var leftHandleCoef = (val - prevValue) / leftHandleValue;
						var rightHandleCoef = (val - prevValue) / rightHandleValue;

						func.setBezierPoint(column,
							_frame,
							val,
							func.pointHandleLeftX(column,i),
							// func.pointHandleLeftY(column,i), //
							leftHandleValue * leftHandleCoef + prevValue,
							func.pointHandleRightX(column,i),
							// func.pointHandleRightY(column,i), //
							rightHandleValue * rightHandleCoef + prevValue,
							func.pointConstSeg(column,i),
							func.pointContinuity(column,i) 
						);

					}

				}

				prevValue = val;

			}
		})
	});

	if( !processedNodes ) MessageBox.warning( "Please select layers with animated rotation or orientation attributes and time range in the timeline in wich you want to process keyframes.",0,0,0,"Error");

	}catch(err){MessageLog.trace('Err: '+err);}

	scene.endUndoRedoAccum();
	

}