/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.220602
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var ColumnUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/ColumnUtils.js"));

///
var COLORART = 1;
var LINEART = 2;

var SUCCESS = 1;
var WARNING = 2;
var FAIL = 3;

var labelColors = [];
labelColors[0] = 'white';
labelColors[SUCCESS] = 'green';
labelColors[WARNING] = 'orange';
labelColors[FAIL] = 'red';

var outputText;

function showOutput(v, type) {
    if (outputText) {
        outputText.setText(v || '...');
        outputText.toolTip = v || '';
        outputText.setStyleSheet("QLabel { color : " + (labelColors[type || 0]) + "; }");
    }
    if (v) MessageLog.trace('Drawing Tools: ' + v);
}

function setOutputText(_outputText) {
    outputText = _outputText;
}

///
exports = {

    showOutput: showOutput,
    setOutputText: setOutputText,

    removeUnusedDrawingColumns: removeUnusedDrawingColumns,
    expandExposure: expandExposure,
    removeExposureOutsideRange: removeExposureOutsideRange,
	clearExposure: clearExposure,
	selectColumnByName: selectColumnByName,
}


//
function removeUnusedDrawingColumns(colorId) {

    var deletedColumnsCount = 0;

    ColumnUtils.eachDrawingColumn(function(displayName, columnName, elementId, columnI) {
        MessageLog.trace(columnI + ') ' + displayName + ', ' + columnName + ', ' + elementId);
        if (displayName === '<unused>') {
            MessageLog.trace('Delete column: "' + columnName + '"');
            var _node = node.add('Top', '__' + column.generateAnonymousName(), 'READ', 0, 0, 0);
            node.linkAttr(_node, "DRAWING.ELEMENT", columnName);
            var result = node.deleteNode(_node, true, true);
            deletedColumnsCount++;
        }
    });

    if (deletedColumnsCount) showOutput('Drawing Columns deleted: ' + deletedColumnsCount + '.\nSee Message Log for details.', SUCCESS);
    else showOutput("All existing columns is exposed on the Timeline.  There's nothing to delete.", WARNING);

}


//
function expandExposure(useAllTimeline) {

    var currentFrame = frame.current();

    SelectionUtils.getSelectedLayers().forEach(function(nodeData) {

        var _node = nodeData.node;
        if (node.type(_node) !== 'READ') return;
        // MessageLog.trace(JSON.stringify(nodeData));
        var drawingColumnName = ColumnUtils.getDrawingColumnOfNode(_node);
        var entries = ColumnUtils.getColumnEntries(drawingColumnName);
        if (!entries.length) return;

        // MessageLog.trace('entries: '+_node+' > '+JSON.stringify(entries,true,' '))

        var firstEntry = entries[0];
        var lastEntry = entries[entries.length - 1];

        if (useAllTimeline) currentFrame = 1;
        if (currentFrame < firstEntry.firstFrame) { // expand to the left

            column.setEntry(drawingColumnName, 1, currentFrame, firstEntry.entry);
            column.fillEmptyCels(drawingColumnName, currentFrame, firstEntry.firstFrame);
            column.removeKeyDrawingExposureAt(drawingColumnName, firstEntry.firstFrame);

        }

        if (useAllTimeline) currentFrame = frame.numberOf();
        if (currentFrame > lastEntry.lastFrame) {

            // column.setEntry( drawingColumnName, 1, current, lastEntry[0].entry );
            column.fillEmptyCels(drawingColumnName, firstEntry.lastFrame, currentFrame + 1);
        }

    });

}


//
function removeExposureOutsideRange() {

    var rangeFirstFrame = Timeline.firstFrameSel;
    var rangeLastFrame = rangeFirstFrame + Timeline.numFrameSel;
    var totalFrames = frame.numberOf() + 100;

    SelectionUtils.getSelectedLayers().forEach(function(nodeData) {

        var _node = nodeData.node;
        if (node.type(_node) !== 'READ') return;
        // MessageLog.trace(JSON.stringify(nodeData));
        var drawingColumnName = ColumnUtils.getDrawingColumnOfNode(_node);
        var entries = ColumnUtils.getColumnEntries(drawingColumnName);
        // MessageLog.trace(JSON.stringify(entries));
        if (!entries.length) return;

        column.addKeyDrawingExposureAt(drawingColumnName, rangeFirstFrame);
        ColumnUtils.clearExposures(drawingColumnName, 1, rangeFirstFrame - 1);
        ColumnUtils.clearExposures(drawingColumnName, rangeLastFrame, totalFrames);

    });

}


//
function clearExposure() {

    var startFrame = frame.current();
    var finish;

    SelectionUtils.getSelectedLayers().forEach(function(nodeData) {

        var _node = nodeData.node;
        if (node.type(_node) !== 'READ') return;
        // MessageLog.trace(JSON.stringify(nodeData));
        var drawingColumnName = ColumnUtils.getDrawingColumnOfNode(_node);
        var entries = ColumnUtils.getColumnEntries(drawingColumnName);
        // MessageLog.trace(JSON.stringify(entries));
        if (!entries.length) return;

        var entry = column.getEntry(drawingColumnName, 1, startFrame);

        finish = false;
        var currentFrame = startFrame;
        do {

            // MessageLog.trace(currentFrame + ' > ' + column.getEntry(drawingColumnName, 1, startFrame));

            if ( column.getEntry(drawingColumnName, 1, currentFrame) !== entry ) {
            	finish = true;
            } else {
                column.addKeyDrawingExposureAt(drawingColumnName, currentFrame);
                column.setEntry(drawingColumnName, 1, currentFrame, '');
                currentFrame--;
            }

        } while (currentFrame >= 1 && !finish)

    });
}


//
function selectColumnByName () {
	
	var searchColumnName = Input.getText('Enter Column name:', '', '');
	// MessageLog.trace(searchColumnName);
	if( !searchColumnName ) return;

	var columnCount = column.numberOf();
	var columnFound = [];

	for( var i=0; i<columnCount; i++ ){
		var columnName = column.getName(i);
		if( columnName === searchColumnName ){
			columnFound.push(columnName);
			break;
		}
		columnName = undefined;
		// MessageLog.trace(i+') '+columnName+' > '+searchColumnName );
	}

	if( !columnFound.length ){
		showOutput("No column found.", WARNING);
		return;
	}

	showOutput("Columns found: "+columnFound.length, SUCCESS);

	selection.clearSelection();
	selection.addColumnToSelection( columnFound[0] );

}