/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_DrawingTools :]
[Version: 0.220805 :]

[Description:
A set of tools for working with Drawings.
Some tools has options - check out for tooltips on tool buttons.
:]
*/


var pModal = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pModal.js"));
var _DrawingTools = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_DrawingTools-Resources/DrawingTools.js"));

//
function PS_DrawingTools() {

    //
    MessageLog.clearLog();

    //
    var scriptName = 'Drawing Tools';
    var scriptVer = '0.220805';
    //

    // var SETTINGS_NAME = 'PS_DEFORMER_TOOLS_SETTINGS';

    var DrawingTools = _DrawingTools;

    var findDrawingsByColor_PREFS = '_PS_findDrawingsByColor';
    var SUCCESS = 1;
    var WARNING = 2;
    var FAIL = 3;

    //
    var btnHeight = 30;
    var modalWidth = 290;
    var iconPath = fileMapper.toNativePath(specialFolders.userScripts + "/PS_DrawingTools-Resources/icons/");
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
    // EXPOSURE
    var exposureGroup = modal.addGroup('Exposure:', ui, true, hGroupStyle);


    modal.addButton('', exposureGroup, btnHeight, btnHeight,
        iconPath + 'expand-exposure-left.png',
        function() {
            _exec('Expand exposure',
                function() {
                    DrawingTools.expandExposure('left', KeyModifiers.IsControlPressed());
                });
        },
        'Expand exposure to the left from the current frame to the first different entry.' +
        '\n- Hold down Ctrl key to expand to the start of the timeline.'
    );

    modal.addButton('', exposureGroup, btnHeight, btnHeight,
        iconPath + 'expand-exposure-right.png',
        function() {
            _exec('Expand exposure',
                function() {
                    DrawingTools.expandExposure('right', KeyModifiers.IsControlPressed());
                });
        },
        'Expand exposure to the right from the current frame to the first different entry.' +
        '\n- Hold down Ctrl key to expand to the start of the timeline.'
    );

    modal.addButton('', exposureGroup, btnHeight, btnHeight,
        iconPath + 'expand-exposure.png',
        function() {
            _exec('Expand exposure',
                function() {
                    DrawingTools.expandExposure('both', KeyModifiers.IsControlPressed());
                });
        },
        'Expand exposure to the left and right from the current frame to the first different entry.' +
        '\n- Hold down Ctrl key to expand to the end.'
    );


    modal.addButton('', exposureGroup, btnHeight, btnHeight,
        iconPath + 'remove-exposure-outside-range.png',
        function() {
            _exec('Remove exposure outside the selected range',
                function() {
                    DrawingTools.removeExposureOutsideRange();
                });
        },
        'Remove exposure outside the selected range.'
    );


    modal.addButton('', exposureGroup, btnHeight, btnHeight,
        iconPath + 'clear-exposure.png',
        function() {
            _exec('Clear exposure',
                function() {
                    DrawingTools.clearExposure();
                });
        },
        'Clear exposure.'
    );

    //
    exposureGroup.mainLayout.addStretch();




    // ==========================================================
    // COLUMNS
    var columnGroup = modal.addGroup('Columns:', ui, true, hGroupStyle);

    modal.addButton('', columnGroup, btnHeight, btnHeight,
        iconPath + 'find-column-by-name.png',
        function() {
            _exec('Select Column by name',
                DrawingTools.selectColumnByName);
        },
        'Select Column by name'
    );


    modal.addButton('', columnGroup, btnHeight, btnHeight,
        iconPath + 'remove-unused-drawing-columns.png',
        function() {
            _exec('Remove unused Drawing columns',
                DrawingTools.removeUnusedDrawingColumns);
        },
        'Remove unused Drawing columns'
    );

    //
    columnGroup.mainLayout.addStretch();


    // ==========================================================
    // ELEMENTS
    var drawingRefGroupTitle = 'Ref Drawing: ';
    var drawingRefGroup = modal.addGroup(drawingRefGroupTitle + 'N/S', ui, true, hGroupStyle);
    var drawingRefNode;

    modal.addButton('', drawingRefGroup, btnHeight, btnHeight,
        iconPath + 'pick-ref-drawing.png',
        function() {
            drawingRefNode = _exec(undefined,
                DrawingTools.getDrawingReference);
            drawingRefGroup.title = drawingRefGroupTitle + (drawingRefNode || 'N/S');
            updateUI();

        },
        'Set Drawing Reference Node'
    );

    var linkRefColumnButton = modal.addButton('', drawingRefGroup, btnHeight, btnHeight,
        iconPath + 'link-ref-column.png',
        function() {
            _exec(undefined,
                function() { DrawingTools.linkDrawingColumn(true, drawingRefNode) });
        },
        'Link the Drawing Column from the Reference Drawing'
    );

    var linkRefElementButton = modal.addButton('', drawingRefGroup, btnHeight, btnHeight,
        iconPath + 'link-ref-element.png',
        function() {
            _exec(undefined,
                function() { DrawingTools.linkDrawingElement(true, drawingRefNode) });
        },
        'Link the Drawing Element with the new Timing from the Reference Drawing'
    );

    //
    function updateUI() {
        linkRefColumnButton.enabled = linkRefElementButton.enabled = !!drawingRefNode;
    }

    // ---
    modal.addVLine(10, drawingRefGroup);

    modal.addButton('', drawingRefGroup, btnHeight, btnHeight,
        iconPath + 'open-selected-element-folder.png',
        function() {
            _exec(undefined,
                DrawingTools.openSelectedElementFolder);
        },
        'Open Selected Element Folder'
    );

    /*
    modal.addButton('', drawingRefGroup, btnHeight, btnHeight,
        iconPath + 'change-element-format.png',
        function() {
            _exec( undefined,
                DrawingTools.changeElementFormat );
        },
        'Change Element Format'
    );
    */

    //
    drawingRefGroup.mainLayout.addStretch();




    // ==========================================================
    // Output
    var _group = modal.addGroup('Output:', ui, true, hGroupStyle);
    var outputText = new QLabel();
    _group.mainLayout.addWidget(outputText, 0, 0);
    outputText.text = '...';
    outputText.wordWrap = true;
    DrawingTools.setOutputText(outputText);

    updateUI();

    //
    ui.mainLayout.addStretch();

    modal.show();


    ///
    function _exec(_name, _action) {

        // MessageLog.trace('>>> ' + _name);
        DrawingTools.showOutput('...');

        var result;

        if (_name) scene.beginUndoRedoAccum(_name);

        try {

            result = _action();

        } catch (err) {
            MessageLog.trace('Error: ' + _name + ': ' + err);
        }

        if (_name) scene.endUndoRedoAccum();

        return result;

    }

}