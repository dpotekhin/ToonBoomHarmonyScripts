/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.220805
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_DrawingTools-Resources/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_DrawingTools-Resources/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_DrawingTools-Resources/ps/NodeUtils.js"));
var ColumnUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_DrawingTools-Resources/ps/ColumnUtils.js"));
var FileSystem = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_DrawingTools-Resources/ps/FileSystem.js"));

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
labelColors[FAIL] = '#ff9090';

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
    openSelectedElementFolder: openSelectedElementFolder,
    getDrawingReference: getDrawingReference,
    linkDrawingColumn: linkDrawingColumn,
    linkDrawingElement: linkDrawingElement,
    // changeElementFormat: changeElementFormat,
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
function applyColumnEntry(startFrame, endFrame, exposure, columnName, useAllTimeline) {
    var increment = startFrame < endFrame ? 1 : -1;

    var prevFrame = startFrame;

    for (var f = startFrame;
        (increment > 0 && f <= endFrame) || (increment < 0 && f >= endFrame); f += increment) {
        if (!useAllTimeline) {
            var currentExposure = column.getEntry(columnName, 1, f);
            if (currentExposure && currentExposure !== exposure) return;
        }
        column.setEntry(columnName, 1, f, exposure);
        column.removeDuplicateKeyDrawingExposureAt(columnName, prevFrame);
        prevFrame = f;
    }

}


//
function expandExposure(dir, useAllTimeline) {

    var currentFrame = frame.current();

    SelectionUtils.getSelectedLayers().forEach(function(nodeData) {

        var _node = nodeData.node;
        if (node.type(_node) !== 'READ') return;
        var drawingColumnName = ColumnUtils.getDrawingColumnOfNode(_node);
        var exposure = column.getEntry(drawingColumnName, 1, currentFrame);

        if (dir === 'both' || dir === 'left') applyColumnEntry(currentFrame, 1, exposure, drawingColumnName, useAllTimeline);
        if (dir === 'both' || dir === 'right') applyColumnEntry(currentFrame, frame.numberOf(), exposure, drawingColumnName, useAllTimeline);

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

            if (column.getEntry(drawingColumnName, 1, currentFrame) !== entry) {
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
function selectColumnByName() {

    var searchColumnName = Input.getText('Enter Column name:', '', '');
    // MessageLog.trace(searchColumnName);
    if (!searchColumnName) return;

    var columnCount = column.numberOf();
    var columnFound = [];

    for (var i = 0; i < columnCount; i++) {
        var columnName = column.getName(i);
        if (columnName === searchColumnName) {
            columnFound.push(columnName);
            break;
        }
        columnName = undefined;
        // MessageLog.trace(i+') '+columnName+' > '+searchColumnName );
    }

    if (!columnFound.length) {
        showOutput("No column found.", WARNING);
        return;
    }

    showOutput("Columns found: " + columnFound.length, SUCCESS);

    selection.clearSelection();
    selection.addColumnToSelection(columnFound[0]);

}


///
function openSelectedElementFolder() {
    var _node = selection.selectedNodes()[0];
    if (node.type(_node) !== "READ") {
        showOutput('No Drawing selected.', WARNING);
        return;
    }
    var elementId = node.getElementId(_node);
    MessageLog.trace('PS_OpenDrawingFolder: ' + _node);
    MessageLog.trace('elementId: ' + elementId);
    MessageLog.trace('completeFolder: ' + element.completeFolder(elementId));
    MessageLog.trace('folder: ' + element.folder(elementId));
    MessageLog.trace('physicalName: ' + element.physicalName(elementId));
    MessageLog.trace('vectorType: ' + element.vectorType(elementId));
    MessageLog.trace('pixmapFormat: ' + element.pixmapFormat(elementId));
    var path = element.completeFolder(elementId);
    FileSystem.openFolder(fileMapper.toNativePath(path));
}


//
function getDrawingReference() {

    drawingRefNode = selection.selectedNode(0);
    if (node.type(drawingRefNode) !== 'READ') {
        showOutput("Select a Drawing Node", FAIL);
        return;
    }

    return drawingRefNode;

}


//
function linkDrawingColumn(targetNodes, refNode) {

    targetNodes = _getSelectedDrawings(targetNodes, refNode);
    if (typeof targetNodes === 'string') {
        showOutput(targetNodes, FAIL);
        return;
    }

    var refNodeColumn = node.linkedColumn(refNode, 'DRAWING.ELEMENT');

    targetNodes.forEach(function(_node) {
        if (node.linkedColumn(_node, 'DRAWING.ELEMENT')) node.unlinkAttr(_node, 'DRAWING.ELEMENT');
        node.linkAttr(_node, 'DRAWING.ELEMENT', refNodeColumn);
    });

}


//
function linkDrawingElement(targetNodes, refNode) {

    targetNodes = _getSelectedDrawings(targetNodes, refNode);
    if (typeof targetNodes === 'string') {
        showOutput(targetNodes, FAIL);
        return;
    }

    var refNodeColumn = node.linkedColumn(refNode, 'DRAWING.ELEMENT');
    var elementId = node.getElementId(refNode);

    targetNodes.forEach(function(_node) {
        var columnName = ColumnUtils.getUnusedColumnName(node.getName(_node));
        column.add(columnName, "DRAWING");
        column.setElementIdOfDrawing(columnName, elementId);
        if (node.linkedColumn(_node, 'DRAWING.ELEMENT')) node.unlinkAttr(_node, 'DRAWING.ELEMENT');
        node.linkAttr(_node, 'DRAWING.ELEMENT', columnName);
    });

}


///
function _getSelectedDrawings(targetNodes, refNode) {

    if (!targetNodes) return "Select a Drawing Node";

    if (targetNodes === true) targetNodes = selection.selectedNodes();
    else if (typeof targetNodes === 'string') targetNodes = [targetNodes];
    targetNodes = targetNodes.filter(function(n) { return node.type(n) === 'READ' && n !== refNode; })

    if (!targetNodes.length) return "Select a Drawing Node";

    return targetNodes;

}



/*
///
function changeElementFormat() {

    // scanType    : "COLOR", "GRAY_SCALE" or "BW" (for black and white).
    // fieldChart  : 12, 16 or 24.
    // pixmapFormat    : 1 for OPT, 3 for SCAN, 4 for SGI, 5 for TGA, 7 for YUV, 9 for OMF or 10 for PSD, 11 for PNG, 12 for JPEG, 13 for BMP, 15 for TIFF.
    // vectorType  : 0 (None), 1 (PNT) or 2 (TVG).

    var _node = selection.selectedNodes()[0];
    if (node.type(_node) !== "READ") return;
    var elementId = node.getElementId(_node);

    var currentScanType = element.scanType(elementId);
    MessageLog.trace('scanType: ' + currentScanType);

    var currentFieldChart = element.fieldChart(elementId);
    MessageLog.trace('fieldChart: ' + currentFieldChart);

    var currentPixelFormat = element.pixmapFormat(elementId);
    MessageLog.trace('pixelFormat: ' + currentPixelFormat);

    var currentVectorType = element.vectorType(elementId);
    MessageLog.trace('vectorType: ' + currentVectorType);


    var pixelFormat = {
        "OPT": 1,
        "SCAN": 3,
        "SGI": 4,
        "TGA": 5,
        "YUV": 7,
        "OMF": 9,
        "PSD": 10,
        "PNG": 11,
        "JPG": 12,
        "BMP": 13,
        "TIFF": 15,
    }
    var d = new Dialog();
    d.title = "Sample Dialog";

    var pixelFormatInput = new ComboBox();
    pixelFormatInput.label = "Pixmap Format:"
    pixelFormatInput.editable = true;
    pixelFormatInput.itemList = Object.keys(pixelFormat);
    pixelFormatInput.currentItemPos = Object.keys(pixelFormat).indexOf(currentPixelFormat);
    d.add(pixelFormatInput);

    if (d.exec()) {

        // MessageLog.trace(pixelFormatInput.currentItem);
        element.modify(elementId,
            currentScanType,
            currentFieldChart,
            pixelFormatInput.currentItem,
            currentVectorType
        );

    }

}
*/