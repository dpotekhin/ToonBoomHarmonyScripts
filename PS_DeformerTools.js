/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_SelectionSets :]
[Version: 0.220811 :]

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
    var scriptVer = '0.220811';
    //

    // var SETTINGS_NAME = 'PS_DEFORMER_TOOLS_SETTINGS';

    var DeformerUtils = _DeformerUtils;
    var Utils = _Utils;

    var btnHeight = 30;
    var modalWidth = 320;
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

    var ENTIRE_CHAIN_MOD_TOOLTIP_TEXT = '\n- Hold down the Alt key to use entire chain of deformation.';
    var MODIFIERS_TOOLTIP_TEXT = '\n- Hold down the Shift key to change the resting attributes only.' +
        '\n- Hold down the Control key to change the current attributes values only.';

    function getApplyMode() {
        var applyMode = (KeyModifiers.IsShiftPressed() ? DeformerUtils.MODE_RESTING : 0) + (KeyModifiers.IsControlPressed() ? DeformerUtils.MODE_CURRENT : 0);
        return applyMode !== 0 ? applyMode : DeformerUtils.MODE_CURRENT;
    }

    // ==========================================================
    // ALIGN
    var alignGroup = modal.addGroup('Align:', ui, true, hGroupStyle);

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-left.png',
        function() {
            DeformerUtils.alignVertically(-1, getApplyMode());
        },
        'Align points to the left.' +
        MODIFIERS_TOOLTIP_TEXT
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-h-center.png',
        function() {
            DeformerUtils.alignVertically(0, getApplyMode());
        },
        'Align points to the horizontal center.' +
        MODIFIERS_TOOLTIP_TEXT
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-right.png',
        function() {
            DeformerUtils.alignVertically(1, getApplyMode());
        },
        'Align points to the right.' +
        MODIFIERS_TOOLTIP_TEXT
    );

    //
    modal.addVLine(btnHeight, alignGroup);

    //
    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-top.png',
        function() {
            DeformerUtils.alignHorizontally(1, getApplyMode());
        },
        'Align points to the top.' +
        MODIFIERS_TOOLTIP_TEXT
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-v-center.png',
        function() {
            DeformerUtils.alignHorizontally(0, getApplyMode());
        },
        'Align points to the center.' +
        MODIFIERS_TOOLTIP_TEXT
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-bottom.png',
        function() {
            DeformerUtils.alignHorizontally(-1, getApplyMode());
        },
        'Align points to the bottom.' +
        MODIFIERS_TOOLTIP_TEXT
    );

    //
    modal.addVLine(btnHeight, alignGroup);

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'x0.png',
        function() {
            var _node = selection.selectedNode(0);
            if (!DeformerUtils.isDefNode(_node)) return;
            DeformerUtils.setAttrValues(_node, 'offset.x', undefined, getApplyMode(), 0);
        },
        'Set X to 0.' +
        MODIFIERS_TOOLTIP_TEXT
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'y0.png',
        function() {
            var _node = selection.selectedNode(0);
            if (!DeformerUtils.isDefNode(_node)) return;
            DeformerUtils.setAttrValues(_node, 'offset.y', undefined, getApplyMode(), 0);
        },
        'Set Y to 0.' +
        MODIFIERS_TOOLTIP_TEXT
    );

    ///
    alignGroup.mainLayout.addStretch();



    // ==========================================================
    // MODIFY
    var cpGroup = modal.addGroup('Modify:', ui, true, hGroupStyle);

    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'orient-points.png',
        function() {
            DeformerUtils.orientControlPoints(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed());
        },
        'Orient control points to oposite points.' +
        MODIFIERS_TOOLTIP_TEXT +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );

    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'points-on-thirds.png',
        function() {
            DeformerUtils.distributeControlPoints(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed());
        },
        'Distribute control points on thirds.' +
        MODIFIERS_TOOLTIP_TEXT +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );

    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'move-around-left.png',
        function() {
            DeformerUtils.moveDeformersAround('left', getApplyMode());
        },
        'Move deformers around to the left' +
        MODIFIERS_TOOLTIP_TEXT
    );

    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'move-around-right.png',
        function() {
            DeformerUtils.moveDeformersAround('right', getApplyMode());
        },
        'Move deformers around to the right' +
        MODIFIERS_TOOLTIP_TEXT
    );


    modal.addButton('', cpGroup, btnHeight, btnHeight,
        iconPath + 'reverse-chain.png',
        function() {
            DeformerUtils.reverseChain(getApplyMode());
        },
        'Reverse direction of the selected deformer chain.' +
        MODIFIERS_TOOLTIP_TEXT
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

    modal.addButton('', gdGroup, btnHeight, btnHeight,
        iconPath + 'insert-cp.png',
        function() {
            DeformerUtils.insertDeformerCurve();
        },
        'Insert a Curve into the Deformer Chain'
    );

    modal.addButton('', gdGroup, btnHeight, btnHeight,
        iconPath + 'remove-cp.png',
        function() {
            DeformerUtils.removeDeformerCurve();
        },
        'Remove the selected Curve from the Deformer Chain'
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
    // _DeformerUtils.insertDeformerCurve();
    // _DeformerUtils.symmetrizeChain();
    // _DeformerUtils.symmetrizeCurves();
    _DeformerUtils.reverseChain(getApplyMode());
    // _DeformerUtils.removeDeformerCurve();

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