/*
Author: D.Potekhin (d@peppers-studio.ru)

[Name: PS_AddOvershoot :]
[Version: 0.211002 :]

[Description:
This script adds overshoot to the selected keyframe.
:]

[Usage:
Select frames on the timeline including one or two keyframes.

1) If the selection contains only one keyframe then:
	- this keyframe will be moved to the end of the selected frame range
	- and in its place a new overshoot key will be created with values relative to the first selected frame

2) If there are two keyframes in the selection, the script switches to updating overshoot keyframe mode and:
	- the value of the leftmost keyframe (as an overshoot keyframe) will be adjusted according to the first selected frame 
	- the rightmost keyframe will be moved to the right border of the selection

Ease will be set automatically.
:]
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));


//
var DEFAULT_ANIMATION_OFFSET = .33;
var MINIMUM_FRAME_OFFSET = 1;

//
function PS_AddOvershoot(){

	// MessageLog.clearLog();

	scene.beginUndoRedoAccum('Add Overshoot');

	try{

	Utils.eachAnimatedAttributeOfSelectedLayers( function( _node, attrName ){

		// MessageLog.trace('-> '+_node+', '+attrName );
		var columnName = node.linkedColumn( _node, attrName );
		var columnType = column.type( columnName );
		var frameRange = _f.getFrameRange( _node, attrName );

		MessageLog.trace('-> '+_node+', '+attrName+', '+columnName+', '+columnType+' >>> '+JSON.stringify(frameRange,true,'  ') );

		if( !frameRange.sourceFrame || !frameRange.overshootFrame || !frameRange.finalFrame  ){
			MessageLog.trace('-- Wrong frame range data');
			return;
		}

		switch( columnType ){
			case 'BEZIER': _applyBezier( columnName, frameRange );
		}

	});
	
	}catch(err){MessageLog.trace('PS_AddOvershoot: Error: '+err);}

	//
	scene.endUndoRedoAccum();

	///
	function _applyBezier( columnName, frameRange ){

		if( frameRange.keyPointIndices.length === 0 || frameRange.keyPointIndices.length > 2 ){
			MessageLog.trace('PS_AddOverShoot: One or Two keys in the frame range are expected. Skipped column: '+columnName );
			return;
		}

		var finalValue = Number( column.getEntry( columnName, 0, frameRange.finalFrame ) );

		if( frameRange.keyPointIndices.length == 2 ){ // Update the existing overshot keyframe 
			
			// MessageLog.trace('Update overshoot');
			// Set the overshoot frame value as the final frame value
			finalValue = Number( column.getEntry( columnName, 0, frameRange.keyPointFrames[1] ) );
			frameRange.overshootFrame = frameRange.keyPointFrames[0];
			// MessageLog.trace( frameRange.overshootFrame+' > '+finalValue );
			column.setEntry( columnName, 0, frameRange.overshootFrame, finalValue );

			// Remove the existing final frame
			column.clearKeyFrame( columnName, frameRange.keyPointFrames[1] );

		}

		// TODO: reset overshoot keyframe ease
		var sourceValue = Number( column.getEntry( columnName, 0, frameRange.sourceFrame ) );
		
		var overshootValue = finalValue + (finalValue - sourceValue);

		// MessageLog.trace( '> '+sourceValue+' > '+overshootValue+' > '+finalValue );
		
		column.setEntry( columnName, 0, frameRange.overshootFrame, overshootValue );
		column.setEntry( columnName, 0, frameRange.finalFrame, finalValue );

		_f.setEase( columnName, frameRange.overshootFrame, null, frameRange.finalDiffFramesHalf, frameRange.finalDiffFramesHalf );
		_f.setEase( columnName, frameRange.finalFrame, null, frameRange.finalDiffFramesHalf );
	}


}







///
var _f = {

	setEase: function( columnName, _frame, pointIndex, easeInFrames, easeOutFrames ){
	
		var pointData = _f.getColumnBezierPointData( columnName, _frame, pointIndex );
		
		// MessageLog.trace('_f.setEase: @1: '+JSON.stringify(pointData,true,'  ') );

		if( easeInFrames !== undefined ){
			pointData.handleLeftX = pointData.x - easeInFrames;
			pointData.handleLeftY = pointData.y;
		}

		if( easeOutFrames !== undefined ){
			pointData.handleRightX = pointData.x + easeOutFrames;
			pointData.handleRightY = pointData.y;
		}

		pointData.constSeg = false;

		// MessageLog.trace('_f.setEase: @2: '+JSON.stringify(pointData,true,'  ') );

		func.setBezierPoint( columnName,
			_frame,
			pointData.y,
			pointData.handleLeftX,
			pointData.handleLeftY,
			pointData.handleRightX,
			pointData.handleRightY,
			pointData.constSeg,
			pointData.continuity
		);

	},


	//
	getColumnBezierPointIndex: function( columnName, _frame, _frameRangeEnd ){

		var pointNum = func.numberOfPoints( columnName );

		if( _frameRangeEnd !== undefined ){
			
			var pointIndices = [];

			for( var pointI=0; pointI<pointNum; pointI++){
				var fr = func.pointX( columnName, pointI );
				if( fr >= _frame && fr <= _frameRangeEnd ) pointIndices.push( pointI );
			}

			return pointIndices;
		}

		for( var pointI=0; pointI<pointNum; pointI++){
			var fr = func.pointX( columnName, pointI );
			if( fr === _frame ) return pointI;
		}

	},


	//
	getColumnBezierPointData: function( columnName, _frame, pointIndex ){
		
		if( !pointIndex ) pointIndex = _f.getColumnBezierPointIndex( columnName, _frame );
		
		if( !pointIndex ){
			MessageLog.trace('getColumnBezierPointData: not valid pointIndex: '+_frame+', '+pointIndex );
			return;
		}

		return {
			pointIndex: pointIndex,
			x: func.pointX( columnName, pointIndex ),
			y: func.pointY( columnName, pointIndex ),
			handleLeftX: func.pointHandleLeftX( columnName, pointIndex ),
			handleLeftY: func.pointHandleLeftY( columnName, pointIndex ),
			handleRightX: func.pointHandleRightX( columnName, pointIndex ),
			handleRightY: func.pointHandleRightY( columnName, pointIndex ),
			constSeg: func.pointConstSeg( columnName, pointIndex ),
			continuity: func.pointContinuity( columnName, pointIndex ),
		};

	},


	//
	getPreviousKeyframe: function( _node, attrName, _frame ){
		var columnName = node.linkedColumn( _node, attrName );

		var pointNum = func.numberOfPoints( columnName );
		// MessageLog.trace('pointNum: '+pointNum+' > '+_frame);
		
		var prevFrame;

		for( var pointI=0; pointI<pointNum; pointI++){
			var fr = func.pointX( columnName, pointI );
			// MessageLog.trace('--> '+fr);
			if( fr >= _frame ) return prevFrame;
			prevFrame = fr;
		}
		
		return prevFrame;

	},

	//
	getFrameRange: function( _node, attrName ){
		
		var columnName = node.linkedColumn( _node, attrName );

		var frameRange = {
			firstSelectedFrame: Timeline.firstFrameSel,
			lastSelectedFrame: Timeline.firstFrameSel + Timeline.numFrameSel-1,
			currentFrame: frame.current(),
		};

		if( frameRange.firstSelectedFrame === frameRange.lastSelectedFrame ){ // No frame range selected

			var previousKeyframe = _f.getPreviousKeyframe( _node, attrName, frameRange.firstSelectedFrame );
			var sourceFrameOffset = Math.max( ( frameRange.firstSelectedFrame - previousKeyframe ) * DEFAULT_ANIMATION_OFFSET, 1 );
			MessageLog.trace('getFrameRange: '+frameRange.firstSelectedFrame+', '+previousKeyframe+', '+sourceFrameOffset);
			frameRange.sourceFrame = Math.min( Math.round( frameRange.currentFrame - sourceFrameOffset ), frameRange.firstSelectedFrame - MINIMUM_FRAME_OFFSET );
			frameRange.overshootFrame = frameRange.firstSelectedFrame;
			frameRange.finalFrame = Math.max( Math.round( frameRange.firstSelectedFrame + sourceFrameOffset ), frameRange.firstSelectedFrame + MINIMUM_FRAME_OFFSET );

		}else{ // Frame range selected

			frameRange.sourceFrame = frameRange.firstSelectedFrame;
			frameRange.overshootFrame = _f.getPreviousKeyframe( _node, attrName, frameRange.lastSelectedFrame );
			// MessageLog.trace('))> '+ frameRange.lastSelectedFrame+' >> '+frameRange.overshootFrame );
			if( frameRange.overshootFrame <= frameRange.firstSelectedFrame ) frameRange.overshootFrame = Math.round(frameRange.firstSelectedFrame + ( frameRange.lastSelectedFrame - frameRange.firstSelectedFrame ) / 2);
			frameRange.finalFrame = frameRange.lastSelectedFrame;

		}

		frameRange.finalDiffFrames = frameRange.finalFrame - frameRange.overshootFrame;
		frameRange.finalDiffFramesHalf = frameRange.finalDiffFrames / 2;
		frameRange.keyPointIndices = _f.getColumnBezierPointIndex( columnName, frameRange.firstSelectedFrame, frameRange.lastSelectedFrame );
		frameRange.keyPointFrames = frameRange.keyPointIndices.map( function( pointI ){
			return func.pointX( columnName, pointI );
		});

		return frameRange;

	}

};