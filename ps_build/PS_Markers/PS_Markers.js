/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_Markers :]
[Version: 0.220602 :]

[Description:
A tiny helper for working with scene markers.
:]

[Usage:
Just click on the script button.

Options:
- LMB: Toggle adds / removes a Scene marker at the current frame.
- LMB + Ctrl: to move all Scene Markers to the Right of the current frame or select a range of frames to remove markers within it).
- LMB + Shift: to move all Scene Markers to the Left of the current frame or select a range of frames to remove markers within it).
- LMB + Alt: to remove all Scene Markers (select a range of frames to remove markers within it).
- LMB + Alt + Ctrl: to remove all Scene Markers to the Right of the current frame.
- LMB + Alt + Shift: to remove all Scene Markers to the Left of the current frame.
- LMB + Ctrl + Alt + Shift: show the dropdown menu.
:]
*/

function PS_Markers() {

    var markers = TimelineMarker.getAllMarkers();

    var currentFrame = frame.current();

    var RIGHT = 1;
    var LEFT = 2;
    var REMOVE = 4;

    var RIGHT_KEY = 'Ctrl';
    var LEFT_KEY = 'Shift';
    var REMOVE_KEY = 'Alt';

    // 
    var modeActions = { 0: actionToggleMarker };

    modeActions[ RIGHT ] = function() { actionMove('Right') };
    modeActions[ LEFT ] = function() { actionMove('Left') };

    modeActions[ REMOVE ] =  actionRemove;
	modeActions[ REMOVE + RIGHT ] = function() { actionRemove('Right') };
	modeActions[ REMOVE + LEFT ] = function() { actionRemove('Left') };

    modeActions[ REMOVE + RIGHT + LEFT ] = actionShowContextMenu;

    var directions = {
        Right: 1,
        Left: -1,
    };

    (modeActions[
    	Number(KeyModifiers.IsControlPressed() * RIGHT) +
    	Number(KeyModifiers.IsShiftPressed() * LEFT) +
    	Number(KeyModifiers.IsAlternatePressed() * REMOVE)
    	] || modeActions[0])();


    ///

    // Toggle Marekers
    function actionToggleMarker() {

        var markers = TimelineMarker.getMarkersAtFrame(currentFrame);
        // MessageLog.trace('markers:'+JSON.stringify(markers,true,'  '));

        if (!markers.length) { // Create

            scene.beginUndoRedoAccum('Create Marker');
            TimelineMarker.createMarker({
                frame: currentFrame,
                // length: 0,
                // color: '#ff1493',
                // name: '',
                // notes: ''
            });
            scene.endUndoRedoAccum();

        } else { // Remove markers

            scene.beginUndoRedoAccum('Remove Markers');
            markers.forEach(function(markerData) { TimelineMarker.deleteMarker(markerData); });
            scene.endUndoRedoAccum();
        }

    }

    // Move
    function actionMove(dir) {

        processMarkers('Move Markers', dir, function(markerData) {

            TimelineMarker.deleteMarker(markerData);
            markerData.frame += directions[dir];
            TimelineMarker.createMarker(markerData);

        });

    }


    // Remove
    function actionRemove(dir) {

        processMarkers('Remove Markers', dir, function(markerData) {

            TimelineMarker.deleteMarker(markerData);

        });

    }


    //
    function processMarkers(title, dir, cb) {

        scene.beginUndoRedoAccum(title);

        var firstFrame = Timeline.firstFrameSel;
        var lastFrame = firstFrame + Timeline.numFrameSel;

        try {

            var markers = TimelineMarker.getAllMarkers();
            markers.forEach(function(markerData, i) {

                if (Timeline.numFrameSel > 1) { // Remove frames in the range of frames

                    if (markerData.frame < firstFrame || markerData.frame >= lastFrame) return;

                } else { // Otherwise check the direction

                    if (dir === 'Right' && markerData.frame < currentFrame) return;
                    if (dir === 'Left' && markerData.frame > currentFrame) return;

                }

                cb(markerData);

            });

        } catch (err) {
            MessageLog.trace('Error. ' + title + ': ' + err);
        }

        scene.endUndoRedoAccum();

    }


    function actionShowContextMenu(){

    	showContextMenu([
    		[ 'Toggle marker', modeActions[0] ],
    		[ 'Move Markers to the Left\tLMB+'+LEFT_KEY, modeActions[LEFT]],
    		[ 'Move Markers to the Right\tLMB+'+RIGHT_KEY, modeActions[RIGHT]],
    		[ 'Remove all Markers\tLMB+'+REMOVE_KEY, modeActions[REMOVE]],
    		[ 'Remove Markers to the Left\tLMB+'+REMOVE_KEY+'+'+LEFT_KEY, modeActions[REMOVE+LEFT]],
    		[ 'Remove Markers to the Right\tLMB+'+REMOVE_KEY+'+'+RIGHT_KEY, modeActions[REMOVE+RIGHT]],
    	]);

    }





    /// ------------------
    ///
    function showContextMenu(menuData) {

        // try{ // !!!
		var pos = new QPoint( QCursor.pos().x(), QCursor.pos().y() );

        var menu = new QMenu(getParentWidget());

        menuData.forEach(function(itemData){
        	var menuItem = menu.addAction(itemData[0]);
  			menuItem.itemName = itemData[0];
        })

        menu.triggered.connect(function(a) {
            menuData.every(function(v){
            	if( v[0] !== a.text ) return true;
            	v[1]();
            })
        });

        menu.exec(pos.globalPos ? pos.globalPos() : pos);

        delete menu;

        // }catch(err){MessageLog.trace(err)} // !!!

    }

    //
    function getParentWidget() {
        var topWidgets = QApplication.topLevelWidgets();
        for (var i in topWidgets) {
            var widget = topWidgets[i];
            if (widget instanceof QMainWindow && !widget.parentWidget())
                return widget;
        }
        return "";
    }

}