/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_SelectionSets :]
[Version: 0.220817 :]

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

    var PREFS_NAME = 'PS_DeformerTools_PREFS';

    //
    var scriptName = 'Deformer Tools';
    var scriptVer = '0.220817';
    //

    // var SETTINGS_NAME = 'PS_DEFORMER_TOOLS_SETTINGS';

    var DeformerUtils = _DeformerUtils;
    var Utils = _Utils;

    var btnHeight = 30;
    var modalWidth = 320;
    var modalHeight = 334;
    var iconPath = fileMapper.toNativePath(specialFolders.userScripts + "/PS_DeformerTools-Resources/icons/");
    var hGroupStyle = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
    var forceWindowInstances = true; //KeyModifiers.IsControlPressed();


    //
    var modal = new pModal(scriptName + " v" + scriptVer, modalWidth, modalHeight, forceWindowInstances ? false : true);
    if (!modal.ui) {
        return;
    }
    var ui = modal.ui;

    ui.setStyleSheet(ui.styleSheet + ' QPushButton{ border: none; }');

    var ENTIRE_CHAIN_MOD_TOOLTIP_TEXT = '\n- Hold down the Alt key to use entire chain of deformation.';


    // APPLY MODE
    function getApplyMode() {
        var applyMode = (optionRestingButton.checked ? DeformerUtils.MODE_RESTING : 0) + (optionCurrentButton.checked ? DeformerUtils.MODE_CURRENT : 0);
        return applyMode !== 0 ? applyMode : DeformerUtils.MODE_CURRENT;
    }

    // CENTER MODE
    function getCenterMode() {
        var centerMode;
        if (centerPegButton.checked) centerMode = DeformerUtils.RELATIVE_TO_PEG;
        if (centerSelectedButton.checked) centerMode = DeformerUtils.RELATIVE_TO_SELECTED;
        if (center0Button.checked) centerMode = DeformerUtils.RELATIVE_TO_ZERO;
        return centerMode;
    }

    //
    function updateUI(centerMode) {

        //
        if (!optionRestingButton.checked && !optionCurrentButton.checked) optionCurrentButton.checked = true;

        if (centerMode) {
            center0Button.checked = centerMode === DeformerUtils.RELATIVE_TO_ZERO ? true : false;
            centerPegButton.checked = centerMode === DeformerUtils.RELATIVE_TO_PEG ? true : false;
            centerSelectedButton.checked = centerMode === DeformerUtils.RELATIVE_TO_SELECTED ? true : false;
        }

        switch (getCenterMode()) {
            case DeformerUtils.RELATIVE_TO_PEG:
                centerPegButton.checked = true;
                break;
            case DeformerUtils.RELATIVE_TO_SELECTED:
                centerSelectedButton.checked = true;
                break;
            default:
                center0Button.checked = true;;
        }

        //
        saveSettings();

    }

    // PREFS
    function saveSettings() {
        preferences.setString(PREFS_NAME, JSON.stringify({
            optionRestingButton: optionRestingButton.checked,
            optionCurrentButton: optionCurrentButton.checked,
            centerMode: getCenterMode(),
        }));
    }

    var settings = JSON.parse(preferences.getString(PREFS_NAME, '') || '{}');



    // ==========================================================
    // MODE
    var optionsGroup = modal.addGroup('Options:', ui, true, hGroupStyle);

    //
    var optionRestingButton = modal.addButton('', optionsGroup, btnHeight, btnHeight,
        iconPath + 'apply-to-resting.png',
        updateUI,
        'Apply to the resting position.'
    );
    optionRestingButton.checkable = true;
    optionRestingButton.checked = settings.optionRestingButton;

    //
    var optionCurrentButton = modal.addButton('', optionsGroup, btnHeight, btnHeight,
        iconPath + 'apply-to-current.png',
        updateUI,
        'Apply to the current position.'
    );
    optionCurrentButton.checkable = true;
    optionCurrentButton.checked = settings.optionCurrentButton;

    //
    // modal.addVLine(btnHeight, optionsGroup);
    ///
    optionsGroup.mainLayout.addStretch();

    //
    var center0Button = modal.addButton('', optionsGroup, btnHeight, btnHeight,
        iconPath + 'center-0.png',
        function() { updateUI(DeformerUtils.RELATIVE_TO_ZERO); },
        'Use zero as center.'
    );
    center0Button.checkable = true;

    var centerPegButton = modal.addButton('', optionsGroup, btnHeight, btnHeight,
        iconPath + 'center-peg.png',
        function() { updateUI(DeformerUtils.RELATIVE_TO_PEG); },
        'Use the parent peg pivot as center.'
    );
    centerPegButton.checkable = true;

    var centerSelectedButton = modal.addButton('', optionsGroup, btnHeight, btnHeight,
        iconPath + 'center-selected.png',
        function() { updateUI(DeformerUtils.RELATIVE_TO_SELECTED); },
        'Use the selected deformer as center.'
    );
    centerSelectedButton.checkable = true;





    // ==========================================================
    // ALIGN
    var alignGroup = modal.addGroup('Align:', ui, true, hGroupStyle);

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-left.png',
        function() {
            DeformerUtils.alignVertically(-1, getApplyMode());
        },
        'Align points to the left.'
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-h-center.png',
        function() {
            DeformerUtils.alignVertically(0, getApplyMode());
        },
        'Align points to the horizontal center.'
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-right.png',
        function() {
            DeformerUtils.alignVertically(1, getApplyMode());
        },
        'Align points to the right.'
    );

    //
    modal.addVLine(btnHeight, alignGroup);

    //
    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-top.png',
        function() {
            DeformerUtils.alignHorizontally(1, getApplyMode());
        },
        'Align points to the top.'
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-v-center.png',
        function() {
            DeformerUtils.alignHorizontally(0, getApplyMode());
        },
        'Align points to the center.'
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'align-bottom.png',
        function() {
            DeformerUtils.alignHorizontally(-1, getApplyMode());
        },
        'Align points to the bottom.'
    );

    //
    modal.addVLine(btnHeight, alignGroup);

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'x0.png',
        function() {
            var _node = selection.selectedNode(0);
            // if (!DeformerUtils.isDefNode(_node)) return;
            DeformerUtils.setAttrValues(_node, 'offset.x', undefined, getApplyMode(), 0);
            DeformerUtils.setAttrValues(_node, 'position.x', undefined, DeformerUtils.MODE_CURRENT, 0);
        },
        'Set X to 0.'
    );

    modal.addButton('', alignGroup, btnHeight, btnHeight,
        iconPath + 'y0.png',
        function() {
            var _node = selection.selectedNode(0);
            // if (!DeformerUtils.isDefNode(_node)) return;
            DeformerUtils.setAttrValues(_node, 'offset.y', undefined, getApplyMode(), 0);
            DeformerUtils.setAttrValues(_node, 'position.y', undefined, DeformerUtils.MODE_CURRENT, 0);
        },
        'Set Y to 0.'
    );

    ///
    alignGroup.mainLayout.addStretch();







    // ==========================================================
    // MODIFY

    var cpGroup = modal.addGroup('Modify:', ui, false, hGroupStyle);

    //
    var cpGroup1 = modal.addGroup('', cpGroup, true, true);

    //
    modal.addButton('', cpGroup1, btnHeight, btnHeight,
        iconPath + 'orient-points.png',
        function() {
            DeformerUtils.orientControlPoints(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed());
        },
        'Orient control points to oposite point of the selected curve.' +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );

    modal.addButton('', cpGroup1, btnHeight, btnHeight,
        iconPath + 'orient-points-1.png',
        function() {
            DeformerUtils.orientControlPoints(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed(), 1);
        },
        'Orient the first control point to the oposite point.' +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );

    modal.addButton('', cpGroup1, btnHeight, btnHeight,
        iconPath + 'orient-points-2.png',
        function() {
            DeformerUtils.orientControlPoints(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed(), 2);
        },
        'Orient the second control point to the oposite point.' +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );

    //
    cpGroup1.mainLayout.addStretch();
    // modal.addVLine(btnHeight, cpGroup1);
    // cpGroup1.mainLayout.addStretch();

    //
    modal.addButton('', cpGroup1, btnHeight, btnHeight,
        iconPath + 'move-around-left.png',
        function() {
            DeformerUtils.moveDeformersAround('left', getApplyMode());
        },
        'Move deformers around to the left'
    );

    modal.addButton('', cpGroup1, btnHeight, btnHeight,
        iconPath + 'move-around-right.png',
        function() {
            DeformerUtils.moveDeformersAround('right', getApplyMode());
        },
        'Move deformers around to the right'
    );

    modal.addButton('', cpGroup1, btnHeight, btnHeight,
        iconPath + 'reverse-chain.png',
        function() {
            DeformerUtils.reverseChain(getApplyMode());
        },
        'Reverse direction of the selected deformer chain.'
    );





    //
    var cpGroup2 = modal.addGroup('', cpGroup, true, true);

    //
    modal.addButton('', cpGroup2, btnHeight, btnHeight,
        iconPath + 'points-on-thirds.png',
        function() {
            DeformerUtils.distributeControlPoints(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed());
        },
        'Distribute control points by thirds.' +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );

    //
    modal.addButton('', cpGroup2, btnHeight, btnHeight,
        iconPath + 'points-on-thirds-1.png',
        function() {
            DeformerUtils.distributeControlPoints(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed(), 1);
        },
        'Set the length of the first control point to a third.' +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );

    //
    modal.addButton('', cpGroup2, btnHeight, btnHeight,
        iconPath + 'points-on-thirds-2.png',
        function() {
            DeformerUtils.distributeControlPoints(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed(), 2);
        },
        'Set the length of the second control point to a third.' +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );


    //
    cpGroup2.mainLayout.addStretch();
    // 
    // cpGroup2.mainLayout.addStretch();

    //
    modal.addButton('', cpGroup2, btnHeight, btnHeight,
        iconPath + 'remove-cp.png',
        function() {
            DeformerUtils.removeDeformerCurve();
        },
        'Remove the selected Curve from the Deformer Chain'
    );

    //
    // modal.addVLine(btnHeight, cpGroup2);


    //
    var insertDeformerCurvePosition = 50;
    var insertDeformerCurvePositionInput = modal.addNumberInput('', cpGroup2, btnHeight, btnHeight, insertDeformerCurvePosition, function(v) {
        insertDeformerCurvePosition = v;
    });
    insertDeformerCurvePositionInput.toolTip = 'Position of the new point on the curve in percents.';

    //
    modal.addButton('', cpGroup2, btnHeight, btnHeight,
        iconPath + 'insert-cp.png',
        function() {
            insertDeformerCurvePosition = Math.min(95, Math.max(5, insertDeformerCurvePosition));
            insertDeformerCurvePositionInput.text2 = insertDeformerCurvePosition;
            DeformerUtils.insertDeformerCurve(insertDeformerCurvePosition / 100);
        },
        'Insert a Curve into the Deformer Chain'
    );






    //
    var cpGroup3 = modal.addGroup('', cpGroup, true, true);

    //
    modal.addButton('', cpGroup3, btnHeight, btnHeight,
        iconPath + 'orient-to-next.png',
        function() {
            DeformerUtils.orientControlPointsToNext(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed());
        },
        'Orient control points to adjacent deformers.' +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );

    //
    modal.addButton('', cpGroup3, btnHeight, btnHeight,
        iconPath + 'orient-to-next-1.png',
        function() {
            DeformerUtils.orientControlPointsToNext(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed(), 1);
        },
        'Orient the first control point to the adjacent deformer.' +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );

    //
    modal.addButton('', cpGroup3, btnHeight, btnHeight,
        iconPath + 'orient-to-next-2.png',
        function() {
            DeformerUtils.orientControlPointsToNext(undefined, getApplyMode(), KeyModifiers.IsAlternatePressed(), 2);
        },
        'Orient the second control point to the adjacent deformer.' +
        ENTIRE_CHAIN_MOD_TOOLTIP_TEXT
    );


    //
    cpGroup3.mainLayout.addStretch();

    //
    modal.addButton('', cpGroup3, btnHeight, btnHeight,
        iconPath + 'mirror-horizontally.png',
        function() {
            DeformerUtils.mirrorChain(getApplyMode(), DeformerUtils.HORIZONTAL, getCenterMode());
        },
        'Mirror the selected deformer horizontally.'
    );

    //
    modal.addButton('', cpGroup3, btnHeight, btnHeight,
        iconPath + 'mirror-vertically.png',
        function() {
            DeformerUtils.mirrorChain(getApplyMode(), DeformerUtils.VERTICAL, getCenterMode());
        },
        'Mirror the selected deformer vertically.'
    );


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


    //
    gdGroup.mainLayout.addStretch();

    //
    ui.mainLayout.addStretch();

    modal.show();

    updateUI(settings.centerMode);

}



// !!!
function PS_DeformerTools_TEST() {

    var direction;
    // direction = _DeformerUtils.LEFT;
    direction = _DeformerUtils.RIGHT;

    var axis;
    // axis = _DeformerUtils.HORIZONTAL;
    axis = _DeformerUtils.VERTICAL;

    // _DeformerUtils.orientControlPoints();
    // _DeformerUtils.generateCircleDeformer();
    // _DeformerUtils.generateRectDeformer();
    // _DeformerUtils.generateArtDeformer(undefined, undefined, true);
    // _DeformerUtils.generateArtDeformer(undefined, undefined);
    // _DeformerUtils.moveDeformersAround(direction,_DeformerUtils.MODE_RESTING);
    // _DeformerUtils.moveDeformersAround(direction, _DeformerUtils.MODE_RESTING);
    // _DeformerUtils.insertDeformerCurve();
    // _DeformerUtils.symmetrizeChain();
    // _DeformerUtils.symmetrizeCurves();
    // _DeformerUtils.reverseChain(getApplyMode());
    // _DeformerUtils.removeDeformerCurve();

    // _DeformerUtils.mirrorChain(_DeformerUtils.MODE_CURRENT, axis, _DeformerUtils.RELATIVE_TO_ZERO); // Relative to 0
    // _DeformerUtils.mirrorChain(_DeformerUtils.MODE_CURRENT, axis, _DeformerUtils.RELATIVE_TO_PEG); // Relative to Peg
    _DeformerUtils.mirrorChain(_DeformerUtils.MODE_CURRENT, axis, _DeformerUtils.RELATIVE_TO_SELECTED); // Relative to the selected Deformer

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