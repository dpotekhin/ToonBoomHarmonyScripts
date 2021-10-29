/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.211028
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

//
function PS_RotationEulerFilter(){

	MessageLog.clearLog(); // !!!

	var usedNodes = {};
	var nodeTypes = ['PEG','READ','CurveModule','OffsetModule'];
	var attrNames = /ROTATION.|orientation/i;

	var startFrame = Timeline.firstFrameSel;
	var stopFrame = startFrame + Timeline.numFrameSel - 1;
	if( startFrame === stopFrame ) {
		startFrame = 1;
		stopFrame = frame.numberOf();
	}
	MessageLog.trace(startFrame+', '+stopFrame);

	scene.beginUndoRedoAccum("Rotation Euler Filter");

	try{

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
					var diff = val - prevValue;
					if( Math.abs(diff) >= 360 ){
						
						var _val = val;

						var leftHandleValue = func.pointHandleLeftY(column,i) - prevValue;
						var rightHandleValue = func.pointHandleRightY(column,i) - prevValue;
						
						val += 360 * ( val < prevValue );
						var leftHandleCoef = (val - prevValue) / leftHandleValue;
						var rightHandleCoef = (val - prevValue) / rightHandleValue;

						// MessageLog.trace(diff+', '+prevValue+', '+_val+' > '+val);
						// MessageLog.trace(leftHandleCoef+', '+rightHandleCoef);

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

	}catch(err){MessageLog.trace('Err: '+err);}

	scene.endUndoRedoAccum();
	

}