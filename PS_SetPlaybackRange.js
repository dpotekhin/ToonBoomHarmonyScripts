/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_SetPlaybackRange :]
[Version: 0.210615 :]

[Description:
This script sets the playback range relative to the selected frames.
:]

[Usage:
Select frames or a single one and click on the script icon.
If the frame range is not selected, then the nearest edge of the playback range is shifted to the current playhead position.

#### Options
- Hold the Control key to set the start of the playback range relative to the selected frames
- Hold the Shift key to set the end of the playback range relative to the selected frames
- Hold the Alt key to set the playback range to fit the timeline
:]

*/

function PS_SetPlaybackRange(){

	var currentRangeStart = scene.getStartFrame();
	var currentRangeEnd = scene.getStopFrame();

	var startFrame = Timeline.firstFrameSel;
	var endFrame = startFrame + Timeline.numFrameSel - 1;
	
	if( KeyModifiers.IsAlternatePressed() ){ // If Alt key is pressed - fit the playback range to the Timeline
		scene.setStartFrame(1);
		scene.setStopFrame(frame.numberOf());
		return;
	}

	if( KeyModifiers.IsControlPressed() ){ // If Control key is pressed - setup the playback range start only
		scene.setStartFrame(startFrame);
		return;
	}

	if( KeyModifiers.IsShiftPressed() ){ // If Shift key is pressed - setup the playback range end only
		scene.setStopFrame(endFrame);
		return;
	}

	if( startFrame === endFrame ){ // If there's no frame range selected - setup the playback range nearest end

		if( Math.abs( currentRangeStart - startFrame ) < Math.abs( currentRangeEnd - startFrame ) ){
			scene.setStartFrame(startFrame);
		}else{
			scene.setStopFrame(endFrame);
		}

		return;
	}	

	scene.setStartFrame(startFrame);
	scene.setStopFrame(endFrame);

}