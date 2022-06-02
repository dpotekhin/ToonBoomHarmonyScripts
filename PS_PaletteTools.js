/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_SelectionSets :]
[Version: 0.220602 :]

[Description:
A set of tools for working with palettes.
Some tools has options - check out for tooltips on tool buttons.
:]
*/


var _PaletteTools = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_PaletteTools-Resources/PaletteTools.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var _NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pModal.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));

///
function PS_PaletteTools() {


    //
    MessageLog.clearLog();

    //
    var scriptName = 'Deformer Tools';
    var scriptVer = '0.220401';
    //

    // var SETTINGS_NAME = 'PS_DEFORMER_TOOLS_SETTINGS';

    var PaletteTools = _PaletteTools;
    var Utils = _Utils;
    var NodeUtils = _NodeUtils;
    // !!!

    var findDrawingsByColor_PREFS = '_PS_findDrawingsByColor';
    var SUCCESS = 1;
    var WARNING = 2;
    var FAIL = 3;

    //
    var btnHeight = 30;
    var modalWidth = 290;
    var iconPath = fileMapper.toNativePath(specialFolders.userScripts + "/PS_PaletteTools-Resources/icons/");
    var hGroupStyle = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
    var forceWindowInstances = true; //KeyModifiers.IsControlPressed();


    //
    var modal = new pModal(scriptName + " v" + scriptVer, modalWidth, 260, forceWindowInstances ? false : true);
    if (!modal.ui) {
        return;
    }
    var ui = modal.ui;

    ui.setStyleSheet(ui.styleSheet + ' QPushButton{ border: none; }');



    // ==========================================================
    // 
    var findGroup = modal.addGroup('Find:', ui, true, hGroupStyle);

    modal.addButton('', findGroup, btnHeight, btnHeight,
        iconPath + 'find-drawing-by-color.png',
        _findDrawingsByColor,
        'Find a Drawing by the selected Color.' +
        '\n- Hold down th Control key to loop through the found exposures.'
    );

    function _findDrawingsByColor() {

        _exec('Find Drawings by the selected Color', function() {


            if (KeyModifiers.IsControlPressed()) {

                var savedData = JSON.parse(preferences.getString(findDrawingsByColor_PREFS, '') || '{}');
                if (savedData && savedData.items && savedData.items.length) {
                    MessageLog.trace('The previous list used:' + JSON.stringify(savedData, true, '  '));
                    _setSelection(savedData.items, savedData.index, true);
                    return;
                }

            }


            var colorData = PaletteTools.getSelectedColor();
            MessageLog.trace('getSelectedColor: ' + JSON.stringify(colorData));
            if (!colorData.colorId) {
                showOutput('A selected Color required.', FAIL);
                return;
            }

            var _foundColumns = PaletteTools.findDrawingsByColor(colorData.colorId);
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

                if (doIncrement) {
                    index++;
                    if (index >= items.length) index = 0;
                }

                // Find a layer
                // MessageLog.trace('Show @1: '+JSON.stringify(currentItemData));
                var foundLayerData = NodeUtils.getLayerByDrawing(currentItemData.columnName, currentItemData.exposureName, true);
                // MessageLog.trace('Show @2: '+JSON.stringify(foundLayerData));

                if (!foundLayerData) {

                    showOutput(counterText + 'No layer contains this drawing.', WARNING);

                } else {

                    selection.clearSelection();
                    selection.addNodeToSelection(foundLayerData.layerName);
                    if (foundLayerData.frame) {
                        frame.setCurrent(foundLayerData.frame);
                        showOutput(counterText + 'The Layer and frame selected.', SUCCESS);
                    } else {
                        showOutput(counterText + 'This Drawing Substitution is not exposed. Only the layer is selected.', WARNING);
                    }
                }

                preferences.setString(findDrawingsByColor_PREFS, JSON.stringify({
                    items: items,
                    index: index || 0,
                }));

            }

        });

    }
    ///
    findGroup.mainLayout.addStretch();


    // ==========================================================
    // 
    var colGroup = modal.addGroup('Cleanup:', ui, true, hGroupStyle);

    modal.addButton('', colGroup, btnHeight, btnHeight,
        iconPath + 'remove-unused-drawing.png',
        function() {

            _exec('Remove unused Drawing columns', function() {

                var deletedColumnsCount = 0;

                PaletteTools.eachDrawingColumn(function(displayName, columnName, elementId, columnI) {
                    MessageLog.trace(columnI + ') ' + displayName + ', ' + columnName + ', ' + elementId);
                    if (displayName === '<unused>') {
                        MessageLog.trace('Delete column');
                        var _node = node.add('Top', '__' + column.generateAnonymousName(), 'READ', 0, 0, 0);
                        node.linkAttr(_node, "DRAWING.ELEMENT", columnName);
                        var result = node.deleteNode(_node, true, true);
                        deletedColumnsCount++;
                    }
                });

                if( deletedColumnsCount ) showOutput('Columns deleted: ' + deletedColumnsCount, SUCCESS );
                else showOutput("All existing columns is exposed on the Timeline.  There's nothing to delete.", WARNING );

            });

        },
        'Remove unused Drawing columns'
    );

    ///
    colGroup.mainLayout.addStretch();


    // Output
    var _group = modal.addGroup('', ui, true, hGroupStyle);
    var outputText = new QLabel();
    _group.mainLayout.addWidget(outputText, 0, 0);
    outputText.text = 'Output...';
    outputText.wordWrap = true;

    var labelColors = [];
    labelColors[0] = 'white';
    labelColors[SUCCESS] = 'green';
    labelColors[WARNING] = 'orange';
    labelColors[FAIL] = 'red';

    function showOutput(v, type) {
        if (outputText) {
            outputText.setText(v || '...');
            outputText.toolTip = v || '';
            outputText.setStyleSheet("QLabel { color : " + (labelColors[type || 0]) + "; }");
        }
        if (v) MessageLog.trace('Palette Tools: ' + v);
    }

    //
    ui.mainLayout.addStretch();

    modal.show();


    ///
    function _exec(_name, _action) {

        MessageLog.trace('>>> ' + _name);

        scene.beginUndoRedoAccum(_name);

        try {

            _action();

        } catch (err) {
            MessageLog.trace('Error: ' + _name + ': ' + err);
        }

        scene.endUndoRedoAccum();

    }

}