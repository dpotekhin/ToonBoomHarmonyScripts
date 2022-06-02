/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_Markers :]
[Version: 0.220602 :]

[Description:
A tiny helper for working with scene markers.

Options:
- LMB: Toggle adds / removes a Scene marker at the current frame.
- LMB + Ctrl: to move all Scene Markers to the Right of the current frame or select a range of frames to remove markers within it).
- LMB + Shift: to move all Scene Markers to the Left of the current frame or select a range of frames to remove markers within it).
- LMB + Alt: to remove all Scene Markers (select a range of frames to remove markers within it).
- LMB + Alt + Ctrl: to remove all Scene Markers to the Right of the current frame.
- LMB + Alt + Shift: to remove all Scene Markers to the Left of the current frame.
:]
*/

function PS_Markers(){

	var markers = TimelineMarker.getAllMarkers();

	var currentFrame = frame.current();

	// 
	var modeActions = {
		0: _actionToggleMarker,

		1: function(){actionMove('Right')},
		2: function(){actionMove('Left')},
		
		4: actionRemove,
		5: function(){actionRemove('Right')},
		6: function(){actionRemove('Left')},
	};

	var directions = {
		Right: 1,
		Left: -1,
	};

	(modeActions[Number(KeyModifiers.IsControlPressed()*1) + Number(KeyModifiers.IsShiftPressed()*2) + Number(KeyModifiers.IsAlternatePressed()*4)] || modeActions[0])();
	

	///

	// Toggle Marekers
	function _actionToggleMarker(){
		
		var markers = TimelineMarker.getMarkersAtFrame(currentFrame);
		// MessageLog.trace('markers:'+JSON.stringify(markers,true,'  '));
		
		if( !markers.length ){ // Create
			
			scene.beginUndoRedoAccum('Create Marker');
			TimelineMarker.createMarker({
				frame: currentFrame,
				// length: 0,
				// color: '#ff1493',
				// name: '',
				// notes: ''
			});
			scene.endUndoRedoAccum();

		}else{ // Remove markers

			scene.beginUndoRedoAccum('Remove Markers');
			markers.forEach(function(markerData){ TimelineMarker.deleteMarker(markerData); });
			scene.endUndoRedoAccum();
		}

	}

	// Move
	function actionMove( dir ){

		processMarkers( 'Move Markers', dir, function(markerData){
			
			TimelineMarker.deleteMarker(markerData);
			markerData.frame += directions[dir];
			TimelineMarker.createMarker( markerData );

		});

	}


	// Remove
	function actionRemove( dir ){
		
		processMarkers( 'Remove Markers', dir, function(markerData){
			
			TimelineMarker.deleteMarker(markerData);

		});

	}


	//
	function processMarkers( title, dir, cb ){

		scene.beginUndoRedoAccum(title);

		var firstFrame = Timeline.firstFrameSel;
		var lastFrame = firstFrame + Timeline.numFrameSel;
		// MessageLog.trace(firstFrame+' : '+lastFrame+' > '+Timeline.numFrameSel);

		try {

			var markers = TimelineMarker.getAllMarkers();
			markers.forEach(function( markerData, i ){

				if( Timeline.numFrameSel > 1 ){ // Remove frames in the range of frames

					if( markerData.frame < firstFrame || markerData.frame >= lastFrame ) return;

				}else{ // Otherwise check the direction

					if( dir === 'Right' && markerData.frame < currentFrame ) return;
					if( dir === 'Left' && markerData.frame > currentFrame ) return;

				}

				cb( markerData );

			});

		} catch (err) {
            MessageLog.trace('Error. '+title+': ' + err);
        }

		scene.endUndoRedoAccum();

	}
	
}