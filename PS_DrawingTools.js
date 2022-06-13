/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_DrawingTools :]
[Version: 0.220609 :]

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
    var scriptVer = '0.220609';
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
        iconPath + 'expand-exposure.png',
        function() {
            _exec( 'Expand exposure to the current frame',
                function(){
                	DrawingTools.expandExposure( KeyModifiers.IsControlPressed() );
                });
        },
        'Expand exposure to the current frame.'
        +'\n- Hold down Ctrl key to expand to all Timeline.'
    );


    modal.addButton('', exposureGroup, btnHeight, btnHeight,
        iconPath + 'remove-exposure-outside-range.png',
        function() {
            _exec( 'Remove exposure outside the selected range',
                function(){
                	DrawingTools.removeExposureOutsideRange();
                });
        },
        'Remove exposure outside the selected range.'
    );


    modal.addButton('', exposureGroup, btnHeight, btnHeight,
        iconPath + 'clear-exposure.png',
        function() {
            _exec( 'Clear exposure',
                function(){
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
            _exec( 'Select Column by name',
                DrawingTools.selectColumnByName );
        },
        'Select Column by name'
    );


    modal.addButton('', columnGroup, btnHeight, btnHeight,
        iconPath + 'remove-unused-drawing-columns.png',
        function() {
            _exec( 'Remove unused Drawing columns',
                DrawingTools.removeUnusedDrawingColumns );
        },
        'Remove unused Drawing columns'
    );

    //
    columnGroup.mainLayout.addStretch();


    // ==========================================================
    // ELEMENTS
    var elementsGroup = modal.addGroup('Elements:', ui, true, hGroupStyle);

    modal.addButton('', elementsGroup, btnHeight, btnHeight,
        iconPath + 'open-selected-element-folder.png',
        function() {
            _exec( undefined,
                DrawingTools.openSelectedElementFolder );
        },
        'Open Selected Element Folder'
    );

    modal.addButton('', elementsGroup, btnHeight, btnHeight,
        iconPath + 'change-element-format.png',
        function() {
            _exec( undefined,
                DrawingTools.changeElementFormat );
        },
        'Change Element Format'
    );

    //
    elementsGroup.mainLayout.addStretch();




    // ==========================================================
    // Output
    var _group = modal.addGroup('Output:', ui, true, hGroupStyle);
    var outputText = new QLabel();
    _group.mainLayout.addWidget(outputText, 0, 0);
    outputText.text = '...';
    outputText.wordWrap = true;
    DrawingTools.setOutputText(outputText);

    //
    ui.mainLayout.addStretch();

    modal.show();


    ///
    function _exec(_name, _action) {

        MessageLog.trace('>>> ' + _name);
        DrawingTools.showOutput('...');

        if( _name ) scene.beginUndoRedoAccum(_name);

        try {

            _action();

        } catch (err) {
            MessageLog.trace('Error: ' + _name + ': ' + err);
        }

        if( _name ) scene.endUndoRedoAccum();

    }

}
