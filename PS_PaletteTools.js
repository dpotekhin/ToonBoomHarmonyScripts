/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_PaletteTools :]
[Version: 0.220609 :]

[Description:
A set of tools for working with palettes.
Some tools has options - check out for tooltips on tool buttons.
:]
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pModal.js"));
var _PaletteTools = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_PaletteTools-Resources/PaletteTools.js"));

///
function PS_PaletteTools() {


    //
    MessageLog.clearLog();

    //
    var scriptName = 'Palette Tools';
    var scriptVer = '0.220609';
    //

    // var SETTINGS_NAME = 'PS_DEFORMER_TOOLS_SETTINGS';

    var PaletteTools = _PaletteTools;

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
    var palettesGroup = modal.addGroup('Palettes:', ui, true, hGroupStyle);


    ///
    palettesGroup.mainLayout.addStretch();


    // ==========================================================
    // 
    var colorsGroup = modal.addGroup('Colors:', ui, true, hGroupStyle);

    modal.addButton('', colorsGroup, btnHeight, btnHeight,
        iconPath + 'find-drawing-by-color.png',
        function(){
            _exec('Find Drawings by the selected Color',
                PaletteTools.findDrawingsByColor_UI
            );
        },
        'Find a Drawing by the selected Color.' +
        '\n- Hold down th Control key to loop through the found exposures.'
    );

    ///
    colorsGroup.mainLayout.addStretch();


    // ==========================================================
    // Output
    var _group = modal.addGroup('Output:', ui, true, hGroupStyle);
    var outputText = new QLabel();
    _group.mainLayout.addWidget(outputText, 0, 0);
    outputText.text = '...';
    outputText.wordWrap = true;
    PaletteTools.setOutputText(outputText);

    //
    ui.mainLayout.addStretch();

    modal.show();


    ///
    function _exec(_name, _action) {

        MessageLog.trace('>>> ' + _name);
        PaletteTools.showOutput('...');

        scene.beginUndoRedoAccum(_name);

        try {

            _action();

        } catch (err) {
            MessageLog.trace('Error: ' + _name + ': ' + err);
        }

        scene.endUndoRedoAccum();

    }

}