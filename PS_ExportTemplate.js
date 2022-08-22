/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220822
*/

//
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var pBox2d = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pBox2d.js"));


//
function PS_ExportTemplate() {

    MessageLog.clearLog();

    var resetNodeColor = true;

    var removeTempNodes = true;
    var removeNodeNameTemplate = new RegExp('^__');
    var unlinkAndRemoveNodeNameTemplate = new RegExp('^___');

    var removeKeys = true;
    var removeKeysFrom = frame.current();

    // Create template
    // Get template path
    var path = FileDialog.getSaveFileName();
    // var path = 'G:/WORK/TBH-Temp/TEMP-LIB/tpl'; // !!!
    if (!path) return;
    path = path.split('/');
    var tplName = path.pop();
    var tplPath = path.join('/');
    MessageLog.trace('Path: ' + tplName + ' > ' + tplPath);

    // Delete existing template
    var tplFullPath = tplPath + '/' + tplName + '.tpl';
    var dir = new Dir(tplFullPath);
    if (dir.exists) dir.rmdirs(tplFullPath);

    scene.beginUndoRedoAccum('Export Tempate');

    try {

        var i = 0;
        SelectionUtils.eachSelectedNode(function(_node) {

                i++;
                MessageLog.trace(i + ') ' + _node);

                // remove temp nodes
                var nodeName = node.getName(_node);

                if (removeTempNodes) {

                    if (nodeName.match(unlinkAndRemoveNodeNameTemplate)) removeNode(_node, true);
                    else if (nodeName.match(removeNodeNameTemplate)) removeNode(_node);

                }


                // remove layer colors
                // MessageLog.trace('>' + node.getColor(_node).a + '<');
                if (resetNodeColor) {
                    node.resetColor(_node);
                }

            }, true, undefined,
            function(groupNode) {

                MessageLog.trace('GROUP: ' + groupNode);

                if (removeTempNodes) {

                    // Remove temp backdrops
                    Backdrop.setBackdrops(groupNode, Backdrop.backdrops(groupNode).filter(function(backdropData, i) {

                        // MessageLog.trace(i + ') ' + JSON.stringify(backdropData, true, '  '));

                        var backdropNeedsRemove;
                        if (!backdropData.title.text.match(unlinkAndRemoveNodeNameTemplate)) backdropNeedsRemove = 'unlinkAndRemove';
                        if (!backdropData.title.text.match(removeNodeNameTemplate)) backdropNeedsRemove = 'remove';
                        if (!backdropNeedsRemove) return true;

                        // remove inside nodes
                        var backdropPos = backdropData.position;
                        var groupNodeBox = new pBox2d(backdropPos.x, backdropPos.y, backdropPos.x + backdropPos.w, backdropPos.y + backdropPos.h);

                        node.subNodes(groupNode).forEach(function(_node) {
                            if (groupNodeBox.containsPoint(node.coordX(_node), node.coordY(_node))) {
                                removeNode(_node, backdropNeedsRemove === 'unlinkAndRemove');
                                MessageLog.trace('- removed node inside the backdrop: ' + backdropData.title.text);

                            }
                        });

                    }));

                }

            }
        );

        // Remove frame markers
        clearFrameMarkers();

        // Remove keys
        frame.remove(removeKeysFrom, frame.numberOf() - removeKeysFrom);

        // Save template
        copyPaste.createTemplateFromSelection(tplName, tplPath);


    } catch (err) { MessageLog.trace('err: ' + err) }


    scene.endUndoRedoAccum();
    scene.undo();

    ///

    //
    function removeNode(_node, unlinkInputs) {
        if (unlinkInputs) NodeUtils.unlinkAllInputs(_node);
        node.deleteNode(_node);
        MessageLog.trace(unlinkInputs ? '- Unlinked and removed' : '- Removed');
    }

    //
    function clearFrameMarkers() {

        var numLayers = Timeline.numLayers;
        for (var i = 0; i < numLayers; i++) {
            if (!Timeline.layerIsNode(i)) continue;
            Timeline.getAllFrameMarkers(i).forEach(function(markerData) {
                Timeline.deleteFrameMarker(i, markerData.id);
            });

        }

    }

}