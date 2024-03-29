/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_Markers :]
[Version: 0.220816 :]

[Description:
A tiny helper for working with scene markers.
- create | delete a marker on the current frame
- copy / paste markers within the selected frame range
- remove markers within the selected frame range
:]

[Usage:
Just click on the script button.
:]
*/

//
var clipboardDataType = 'PS_CopySceneMarkers';


//
function PS_Markers(_mode) {

    // MessageLog.trace('_mode: ' + _mode);

    var markers = TimelineMarker.getAllMarkers();

    var currentFrame = frame.current();

    if (KeyModifiers.IsShiftPressed()) {
        PS_CopySceneMarkers();
        return;
    }

    if (KeyModifiers.IsControlPressed()) {
        PS_PasteSceneMarkers(true);
        return;
    }

    if (KeyModifiers.IsAlternatePressed()) {
        actionToggleMarker();
        return;
    }

    actionShowContextMenu();
    
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

    // // Move
    // function actionMove(dir) {

    //     processMarkers('Move Markers', dir, function(markerData) {

    //         TimelineMarker.deleteMarker(markerData);
    //         markerData.frame += directions[dir];
    //         TimelineMarker.createMarker(markerData);

    //     });

    // }


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

                if (Timeline.numFrameSel > 1) { // Remove markers in the range of frames

                    if (markerData.frame < firstFrame || markerData.frame >= lastFrame) return;

                } else { // Otherwise check the direction

                    if (dir === 'Right' && markerData.frame <= currentFrame) return;
                    if (dir === 'Left' && markerData.frame >= currentFrame) return;

                }

                cb(markerData);

            });

        } catch (err) {
            MessageLog.trace('Error. ' + title + ': ' + err);
        }

        scene.endUndoRedoAccum();

    }


    function actionShowContextMenu() {

        showContextMenu([
            ['Toggle marker\tLMB+Alt', actionToggleMarker],
            '-',
            ['Copy Markers\tLMB+Shift', PS_CopySceneMarkers],
            ['Cut Markers', PS_CutSceneMarkers],
            ['Paste Markers to the Selected Frame\tLMB+Control', function() { PS_PasteSceneMarkers(true); }],
            ['Paste Markers in place', PS_PasteSceneMarkers],
            // '-',
            // ['Move Markers to the Left', function() { actionMove('Left') }],
            // ['Move Markers to the Right', function() { actionMove('Right') }],
            '-',
            ['Remove Markers', actionRemove],
            ['Remove Markers to the Left', function() { actionRemove('Left') }],
            ['Remove Markers to the Right', function() { actionRemove('Right') }],
        ]);

    }



    /// ------------------
    ///
    function showContextMenu(menuData) {

        // try{ // !!!
        var pos = new QPoint(QCursor.pos().x(), QCursor.pos().y());

        var menu = new QMenu(getParentWidget());

        menuData.forEach(function(itemData) {

            if (itemData === '-') {
                menu.addSeparator();
                return;
            }

            var menuItem = menu.addAction(itemData[0]);
            menuItem.itemName = itemData[0];
        })

        menu.triggered.connect(function(a) {
            menuData.every(function(v) {
                if (v[0] !== a.text) return true;
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




///

//
function PS_CutSceneMarkers() {

    var data = PS_CopySceneMarkers();
    PS_RemoveMarkers(data.firstFrame, data.firstFrame + data.duration);

}


//
function PS_CopySceneMarkers() {

    var markers = TimelineMarker.getAllMarkers();
    var data = {
        type: clipboardDataType,
    }

    // if (Timeline.numFrameSel > 1) { // Copy markers in the selected frame range

        var firstFrame = data.firstFrame = Timeline.firstFrameSel;
        var lastFrame = data.lastFrame = firstFrame + Timeline.numFrameSel;
        data.duration = lastFrame - firstFrame;
        markers = markers.filter(function(markerData) { return markerData.frame >= firstFrame && markerData.frame < lastFrame; });

    // } else {

    //     data.firstFrame = 1;
    //     data.lastFrame = data.duration = frame.numberOf();

    // }

    data.markers = markers;

    // MessageLog.trace('data: '+JSON.stringify(data,true,'  '));

    QApplication.clipboard().setText(JSON.stringify(data));

    return data;

}

//
function PS_PasteSceneMarkers(pasteFromCurrentFrame) {

    var markers;
    var data;

    try {

        data = JSON.parse(QApplication.clipboard().text());
        if (data.type !== clipboardDataType) return;
        markers = data.markers;

    } catch (err) { MessageLog.trace('Error: ' + err); return; }

    if (data.firstFrame === undefined || data.firstFrame === undefined) return;
    scene.beginUndoRedoAccum('Paste Scene Markers');

    // Remove existing markers
    var firstFrame = pasteFromCurrentFrame ? frame.current() : data.firstFrame;
    // var markerFrame = firstFrame + (markerData.frame - firstFrame);
    PS_RemoveMarkers(firstFrame, firstFrame + data.duration);

    markers.forEach(function(markerData, i) { // paste markers
        markerData.frame = firstFrame + (markerData.frame - data.firstFrame);
        // MessageLog.trace(i + ') ' + JSON.stringify(markerData, true, '  '));
        try {
            TimelineMarker.createMarker(markerData);
        } catch (err) { MessageLog.trace('Marker creation error: ' + err); }
    });

    scene.endUndoRedoAccum();

}


//
function PS_RemoveMarkers(firstFrame, lastFrame) {

    scene.beginUndoRedoAccum('Remove Scene Markers');

    var _markers = TimelineMarker.getAllMarkers();

    _markers.forEach(function(markerData, i) {
        if (markerData.frame < firstFrame || markerData.frame >= lastFrame) return; // remove markers inside a copied range only
        TimelineMarker.deleteMarker(markerData);
    });

    scene.endUndoRedoAccum();
}