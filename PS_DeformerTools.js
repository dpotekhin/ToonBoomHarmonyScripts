/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_SelectionSets :]
[Version: 0.220729 :]

[Description:
A set of tools for working with deformers.
Some tools has options - check out for tooltips on tool buttons.
:]
*/

var _DeformerUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/DeformerUtils.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pModal.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));

///
function PS_DeformerTools() {

    //
    MessageLog.clearLog();

    //
    var scriptName = 'Deformer Tools';
    var scriptVer = '0.220729';
    //

    // var SETTINGS_NAME = 'PS_DEFORMER_TOOLS_SETTINGS';

    var DeformerUtils = _DeformerUtils;
    var Utils = _Utils;

    var btnHeight = 30;
    var modalWidth = 290;
    var iconPath = fileMapper.toNativePath(specialFolders.userScripts + "/PS_DeformerTools-Resources/icons/");
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
    // ALIGN
    var alignGroup = modal.addGroup('Align Points:', ui, true, hGroupStyle);

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-left.png',
        function() {
            DeformerUtils.alignVertically(-1, KeyModifiers.IsShiftPressed());
        },
        'Align points to the left.' +
        '\n- Hold down the Shift key to change the resting attributes.'
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-h-center.png',
        function() {
            DeformerUtils.alignVertically(0, KeyModifiers.IsShiftPressed());
        },
        'Align points to the horizontal center.' +
        '\n- Hold down the Shift key to change the resting attributes.'
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-right.png',
        function() {
            DeformerUtils.alignVertically(1, KeyModifiers.IsShiftPressed());
        },
        'Align points to the right.' +
        '\n- Hold down the Shift key to change the resting attributes.'
    );

    //
    modal.addVLine(btnHeight, alignGroup);

    //
    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-top.png',
        function() {
            DeformerUtils.alignHorizontally(1, KeyModifiers.IsShiftPressed());
        },
        'Align points to the top.' +
        '\n- Hold down the Shift key to change the resting attributes.'
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-v-center.png',
        function() {
            DeformerUtils.alignHorizontally(0, KeyModifiers.IsShiftPressed());
        },
        'Align points to the center.' +
        '\n- Hold down the Shift key to change the resting attributes.'
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-bottom.png',
        function() {
            DeformerUtils.alignHorizontally(-1, KeyModifiers.IsShiftPressed());
        },
        'Align points to the bottom.' +
        '\n- Hold down the Shift key to change the resting attributes.'
    );

    ///
    alignGroup.mainLayout.addStretch();



    // ==========================================================
    // CONTROL POINTS
    var cpGroup = modal.addGroup('Control points:', ui, true, hGroupStyle);

    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'orient-points.png',
        function() {
            DeformerUtils.orientControlPoints(undefined, KeyModifiers.IsShiftPressed(), KeyModifiers.IsControlPressed());
        },
        'Orient control points to oposite points.' +
        '\n- Hold down the Shift key to change the resting attributes.' +
        '\n- Hold down the Control key to use entire chain of deformation.'
    );

    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'points-on-thirds.png',
        function() {
            DeformerUtils.distributeControlPoints(undefined, KeyModifiers.IsShiftPressed(), KeyModifiers.IsControlPressed());
        },
        'Distribute control points on thirds.' +
        '\n- Hold down the Shift key to change the resting attributes.' +
        '\n- Hold down the Control key to use entire chain of deformation.'
    );

    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'move-around-left.png',
        function() {
            DeformerUtils.moveDeformersAround('left');
        },
        'Move deformers around to the left'
    );

    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'move-around-right.png',
        function() {
            DeformerUtils.moveDeformersAround('right');
        },
        'Move deformers around to the right'
    );

    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'insert-cp.png',
        function() {
            DeformerUtils.insertControlPoint();
        },
        'Insert a Control point to the Deformer'
    );

    cpGroup.mainLayout.addStretch();




    // ==========================================================
    // Generate deformers
    var gdGroup = modal.addGroup('Generate:', ui, true, hGroupStyle);

    modal.addButton('', gdGroup, btnHeight, btnHeight,
        iconPath + 'generate-circle.png',
        function() {
            var artIndex = KeyModifiers.IsControlPressed() ? DeformerUtils.COLORART : undefined;
            var reversePath = KeyModifiers.IsAlternatePressed();
            DeformerUtils.generateCircleDeformer(artIndex, undefined, reversePath);
        },
        'Generate Circle Deformer.' +
        '\n- Hold down the Control key to use Color Art as a source.' +
        '\n- Hold down the Alt key to reverse path.'
    );

    modal.addButton('', gdGroup, btnHeight, btnHeight,
        iconPath + 'generate-rectangle.png',
        function() {
            var artIndex = KeyModifiers.IsControlPressed() ? DeformerUtils.COLORART : undefined;
            var reversePath = KeyModifiers.IsAlternatePressed();
            DeformerUtils.generateRectDeformer(artIndex, undefined, reversePath);
        },
        'Generate Rectangle Deformer from Line Art.' +
        '\n- Hold down the Control key to use Color Art as a source.' +
        '\n- Hold down the Alt key to reverse path.'
    );

    modal.addButton('', gdGroup, btnHeight, btnHeight,
        iconPath + 'generate-on-art.png',
        function() {
            var artIndex = KeyModifiers.IsControlPressed() ? DeformerUtils.COLORART : undefined;
            var reversePath = KeyModifiers.IsAlternatePressed();
            DeformerUtils.generateArtDeformer(artIndex, undefined, reversePath);
        },
        'Generate Deformer on Art.' +
        '\n- Hold down the Control key to use Color Art as a source.' +
        '\n- Hold down the Alt key to reverse path.'
    );

    gdGroup.mainLayout.addStretch();

    //
    ui.mainLayout.addStretch();

    modal.show();


}



// !!!
function PS_DeformerTools_TEST() {

    // _DeformerUtils.orientControlPoints();
    // _DeformerUtils.generateCircleDeformer();
    // _DeformerUtils.generateRectDeformer();
    // _DeformerUtils.generateArtDeformer(undefined, undefined, true);
    // _DeformerUtils.generateArtDeformer(undefined, undefined);
    // _DeformerUtils.moveDeformersAround('left');
    // _DeformerUtils.moveDeformersAround('right');
    _DeformerUtils.insertControlPoint();

    /*
    // !!!
    var nodes = selection.selectedNodes();
  
    // MessageLog.trace('>>'+JSON.stringify( _Utils.getFullAttributeList( nodes[0], 1 ), true, '  ' ) );
  
    _Utils.getFullAttributeList( nodes[0], 1 ).forEach(function(attr){
      MessageLog.trace( attr.keyword()+' ==> '+attr.textValue() );
    })

    // MessageLog.trace(nodes+' > '+node.type(nodes));
    */
}