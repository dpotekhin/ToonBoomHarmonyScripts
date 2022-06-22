/*
Author: Dima Potekhin (skinion.onn@gmail.com)

Name: PS_SceneStats
Version: 0.220622

*/


//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pModal.js"));
var DrawingsStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/DrawingsStats.js"));
var CompositeStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/CompositeStats.js"));

//
function PS_SceneStats() {

    MessageLog.clearLog(); // !!!

    // Get selection
    var selectedNodes = selection.selectedNodes();
    if (!selectedNodes.length) {
        MessageBox.warning("Please select a node or a group.", 0, 0, 0, "Error");
        return;
    }

    //
    var scriptName = 'Scene Stats';
    var scriptVer = '0.220412';
    //

    // var DeformerTools = _DeformerTools;
    // var Utils = _Utils;

    var btnHeight = 30;
    var modalWidth = 1100;
    var modalHeight = 700;
    // var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_DeformerTools-Resources/icons/");
    var forceWindowInstances = true; //KeyModifiers.IsControlPressed();

    //
    var modal = new pModal(scriptName + " v" + scriptVer, modalWidth, modalHeight);
    if (!modal.ui) return;
    var ui = modal.ui;

    ui.setStyleSheet(ui.styleSheet + ' QPushButton{ border: none; }');

    // Main Group
    // var mainGroup = modal.addGroup( '', ui, true, hGroupStyle);

    var lib = {

        returnEmpty: function() {},

        bgSuccess: new QBrush(new QColor('#004000')),
        bgFail: new QBrush(new QColor('#400000')),
        bgYellow: new QBrush(new QColor('#404000')),
        bgWarning: new QBrush(new QColor('#404000')),
        bgStrange: new QBrush(new QColor('#444400')),
        bgInfo: new QBrush(new QColor('#000044')),
        bgSuccessOrFail: function(v) { return v ? lib.bgSuccess : lib.bgFail; },
        bgSuccessOrFailInverted: function(v) { return !v ? lib.bgSuccess : lib.bgFail; },
        bgSuccessYellow: function(v) { return v ? lib.bgYellow : undefined; },
        bgEmpty: function(v) { return !v || v == 0 ? lib.bgFail : undefined },

        outputYesNo: function(v) { return v ? 'Yes' : 'No'; },

        showNodeProperties: function(data) {
            // MessageLog.trace('>>'+data.path);
            selection.clearSelection();
            selection.addNodeToSelection(data.path);
            Action.perform("onActionEditProperties()", "scene");
        },

        selectNode: function(data) {
            selection.clearSelection();
            selection.addNodeToSelection(data.path);
        },

        getBaseItemData: function(n, i) {
            return {
                index: i + 1,
                path: n,
                name: node.getName(n),
                parent: node.parentNode(n),
                enabled: node.getEnable(n),
                color: Utils.rgbToHex(node.getColor(n), true),
                srcNode: lib.hasAnySrc(n),
                destNode: lib.hasAnyDest(n),
            }
        },

        getBaseTableRows: function() {

            return [

                {
                    key: 'color',
                    header: 'Col',
                    toolTip: 'Node Color',
                    getBg: function(v) { return v ? new QBrush(new QColor('#' + v)) : undefined; },
                    getValue: function(v) { return v === '000000' ? 'No' : ''; },
                    onClick: lib.showNodeProperties
                },

                {
                    key: 'enabled',
                    header: 'Enb',
                    toolTip: 'Node Enabled',
                    getValue: lib.outputYesNo,
                    getBg: lib.bgSuccessOrFail,
                    onClick: lib.showNodeProperties,
                },

                {
                    key: 'parent',
                    header: 'GROUP',
                },

                {
                    key: 'name',
                    header: 'Name',
                    getBg: function(v, data) {
                        return data.DSCount == 0 ? lib.bgFail : undefined;
                    },
                    onClick: lib.selectNode

                },

                {
                    key: 'srcNode',
                    header: 'IN',
                    toolTip: 'Has Input Connections',
                    getValue: lib.outputYesNo,
                    getBg: lib.bgSuccessOrFail
                },

                {
                    key: 'destNode',
                    header: 'OUT',
                    toolTip: 'Has Output Connections',
                    getValue: lib.outputYesNo,
                    getBg: lib.bgSuccessOrFail
                },

            ];

        },

        hasAnySrc: function(n) {
            var numInput = node.numberOfInputPorts(n);
            var src;
            for (var i = 0; i < numInput; i++) {
                src = node.srcNode(n, i);
                if (src) break;
            }
            return src;
        },

        hasAnyDest: function(n) {
            var numOutput = node.numberOfOutputPorts(n);
            var dest;
            for (var i = 0; i < numOutput; i++) {
                dest = node.dstNode(n, i, 0);
                if (dest) break;
            }
            return dest;
        },

    };


    /// ------------------------------------------------

    try {
        
        new DrawingsStats( selectedNodes, modal, lib );
        new CompositeStats(selectedNodes, modal, lib);

        //
        // modal.addVLine( btnHeight, mainGroup );
        // mainGroup.mainLayout.addStretch();

    } catch (err) { MessageLog.trace('Error: ' + err); }

    //
    ui.mainLayout.addStretch();

    modal.show();

}