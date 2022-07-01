## PS_AddOvershoot
v0.211002

### Description
This script adds overshoot to the selected keyframe.

### Usage
Select frames on the timeline including one or two keyframes.

1) If the selection contains only one keyframe then:
	- this keyframe will be moved to the end of the selected frame range
	- and in its place a new overshoot key will be created with values relative to the first selected frame

2) If there are two keyframes in the selection, the script switches to updating overshoot keyframe mode and:
	- the value of the leftmost keyframe (as an overshoot keyframe) will be adjusted according to the first selected frame 
	- the rightmost keyframe will be moved to the right border of the selection

Ease will be set automatically.

### Installation:
Copy all files from this folder to [Harmony User Scripts directory](https://docs.toonboom.com/help/harmony-20/premium/scripting/import-script.html).\
Add the script "PS_AddOvershoot" to a panel.  
