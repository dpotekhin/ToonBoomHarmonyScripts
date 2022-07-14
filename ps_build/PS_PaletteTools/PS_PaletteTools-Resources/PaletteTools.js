/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.220602
*/

var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var ColumnUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/ColumnUtils.js"));

///
var COLORART = 1;
var LINEART = 2;

var findDrawingsByColor_PREFS = '_PS_findDrawingsByColor';
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
    if (v) MessageLog.trace('Palette Tools: ' + v);
}

function setOutputText(_outputText){
    outputText = _outputText;
}

///
exports = {

    showOutput: showOutput,
    setOutputText: setOutputText,

    findDrawingsByColor_UI: findDrawingsByColor_UI,
    findDrawingsByColor: findDrawingsByColor,
    getSelectedColor: getSelectedColor,
}


//
function findDrawingsByColor_UI() {

    if (KeyModifiers.IsControlPressed()) {

        var savedData = JSON.parse(preferences.getString(findDrawingsByColor_PREFS, '') || '{}');
        if (savedData && savedData.items && savedData.items.length) {
            MessageLog.trace('The previous list used:' + JSON.stringify(savedData, true, '  '));
            _setSelection(savedData.items, savedData.index, true);
            return;
        }

    }


    var colorData = getSelectedColor();
    MessageLog.trace('getSelectedColor: ' + JSON.stringify(colorData));
    if (!colorData.colorId) {
        showOutput('A selected Color required.', FAIL);
        return;
    }

    var _foundColumns = findDrawingsByColor(colorData.colorId);
    var foundColumns = [];
    // MessageLog.trace('???: '+JSON.stringify(_foundColumns, true, '  '));
    Object.keys(_foundColumns).forEach(function(v) {
        _foundColumns[v].forEach(function(vv) {
            foundColumns.push(vv);
        });
    });
    if (!foundColumns.length) {
        showOutput('No drawings found.', FAIL);
        return;
    }
    var totalKeys = 0;

    foundColumns.forEach(function(columnName) { totalKeys += foundColumns.length });
    showOutput('Found ' + totalKeys + ' Keys in ' + foundColumns.length + ' Columns.');

    // MessageLog.trace(JSON.stringify(foundColumns, true, '  '));
    _setSelection(foundColumns, 0, true);

    //
    function _setSelection(items, index, doIncrement) {

        var currentItemData = items[index];
        var counterText = index + 1 + '/' + items.length + ') ';
        var counterTextSuffix = items.length > 1 ? '\nClick + Ctrl to focus on the next item.' : '';
        if (doIncrement) {
            index++;
            if (index >= items.length) index = 0;
        }

        // Find a layer
        // MessageLog.trace('Show @1: '+JSON.stringify(currentItemData));
        var foundLayerData = NodeUtils.getLayerByDrawing(currentItemData.columnName, currentItemData.exposureName, true);
        // MessageLog.trace('Show @2: '+JSON.stringify(foundLayerData));

        if (!foundLayerData) {

            showOutput(counterText + 'No layer contains this drawing.'+counterTextSuffix, WARNING);

        } else {

            selection.clearSelection();
            selection.addNodeToSelection(foundLayerData.layerName);
            if (foundLayerData.frame) {
                frame.setCurrent(foundLayerData.frame);
                showOutput(counterText + 'The Layer and frame selected.'+counterTextSuffix, SUCCESS);
            } else {
                showOutput(counterText + 'This Drawing Substitution is not exposed. Only the layer is selected.'+counterTextSuffix, WARNING);
            }
        }

        preferences.setString(findDrawingsByColor_PREFS, JSON.stringify({
            items: items,
            index: index || 0,
        }));

    }

}

//
function findDrawingsByColor(colorId) {

    var foundColumnKeys = {};

    ColumnUtils.eachDrawingColumnKey(function(displayName, columnName, elementId, exposureName, drawingI) {

        var drawingKey = Drawing.Key({ elementId: elementId, exposure: exposureName });
        // MessageLog.trace('  ---- '+drawingKey.isValid);
        var colors = DrawingTools.getDrawingUsedColorsWithSource(drawingKey);
        colors.forEach(function(colorData) {
            if (colorData.colorId === colorId) {
                // MessageLog.trace( 'FOUND: '+ columnName+', '+elementId);
                if (!foundColumnKeys[columnName]) foundColumnKeys[columnName] = [];
                foundColumnKeys[columnName].push({
                    columnName: columnName,
                    displayName: displayName,
                    elementId: elementId,
                    exposureName: exposureName,
                });
            }
        })
        // MessageLog.trace(JSON.stringify(colors, true, '  '));
    });

    return foundColumnKeys;

}

//
function getSelectedColor() {
    // Get the selected color
    var paletteId = PaletteManager.getCurrentPaletteId();
    var colorId = PaletteManager.getCurrentColorId();
    // MessageLog.trace('findDrawingsByColor:' + paletteId + ', ' + colorId);

    return {
        paletteId: paletteId,
        colorId: colorId
    }

}