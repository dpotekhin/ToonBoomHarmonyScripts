/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220630
*/

var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var _SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pModal.js"));

//
exports = function(options) {

    // Get selection
    var selectedNodes = selection.selectedNodes();
    if (!selectedNodes.length) {
        MessageBox.warning("Please select a node or a group.", 0, 0, 0, "Error");
        return;
    }

    if (node.type(selectedNodes[0]) !== 'GROUP') { // Use the group of the selected node if it isn't a Group
        selectedNodes = [node.parentNode(selectedNodes[0])];
    }

    //
    var scriptName = 'Scene Stats';
    var scriptVer = '0.220630';
    //

    // var DeformerTools = _DeformerTools;
    var Utils = _Utils;
    var SelectionUtils = _SelectionUtils;

    var btnHeight = 30;
    var modalWidth = 1100;
    var modalHeight = 500;
    var contentMaxHeight = modalHeight - 60;
    // var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_DeformerTools-Resources/icons/");
    var forceWindowInstances = true; //KeyModifiers.IsControlPressed();

    //
    var modal = new pModal(scriptName + " v" + scriptVer, modalWidth, modalHeight);
    if (!modal.ui) return;
    var ui = modal.ui;

    ui.setStyleSheet(ui.styleSheet + ' QPushButton{ border: none; }');

    // Main Group
    // var mainGroup = modal.addGroup( '', ui, true, hGroupStyle);
    function checkNull(v1, v2) {
        if (v1 === null) return '';
        return v2;
    }

    var lib = {

        checkNull: checkNull,
        returnEmpty: function() {},

        bgSuccess: new QBrush(new QColor('#004000')),
        bgFail: new QBrush(new QColor('#400000')),
        bgYellow: new QBrush(new QColor('#404000')),
        bgWarning: new QBrush(new QColor('#404000')),
        bgStrange: new QBrush(new QColor('#444400')),
        bgInfo: new QBrush(new QColor('#000044')),
        bgSuccessOrFail: function(v) { return checkNull(v, v ? lib.bgSuccess : lib.bgFail); },
        bgSuccessOrFailInverted: function(v) { return checkNull(v, !v ? lib.bgSuccess : lib.bgFail); },
        bgSuccessYellow: function(v) { return checkNull(v, v ? lib.bgYellow : undefined); },
        bgFailYellow: function(v) { return checkNull(v, v ? lib.bgSuccess : lib.bgYellow); },
        bgEmpty: function(v) { return checkNull(v, !v || v == 0 ? lib.bgFail : undefined); },
        bgSuccessIfOne: function(v) { return checkNull(v, v === 1 ? lib.bgSuccess : lib.bgYellow); },

        outputYesNo: function(v) { return checkNull(v, v ? 'Yes' : 'No'); },
        outputYesNoInverted: function(v) { return checkNull(v, !v ? 'Yes' : 'No'); },
        outputValueOrNo: function(v) { return checkNull(v, v ? v : 'No'); },
        outputWarning: function(v) { return checkNull(v, v ? '!' : ''); },
        outputString: function(v) { return checkNull(v, v) },
        outputNumber: function(v) { return checkNull(v, ~~v) },
        outputPointOne: function(v) { return checkNull(v, ~~(v * 10) / 10); },
        outputPointTwo: function(v) { return checkNull(v, ~~(v * 100) / 100); },
        outputPointThree: function(v) { return checkNull(v, ~~(v * 1000) / 1000); },

        defaultCellClick: function(data) {

            if (KeyModifiers.IsControlPressed()) {

                lib.selectNode(data);
                SelectionUtils.focusOnSelectedNode();
                return;

            } else if (KeyModifiers.IsShiftPressed()) {

                lib.showNodeProperties(data);
                return;

            }

            lib.selectNode(data);
        },

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
            var name = node.getName(n);
            return {
                index: i + 1,
                path: n,
                name: name,
                hasNumberEnding: name.match(/_\d\d?$/),
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
                    getBg: function(v) { if( v ) return new QBrush(new QColor('#'+v.substr(0,6))) },
                    getValue: function(v) { return v === '000000' ? 'No' : ''; },
                    onClick: lib.defaultCellClick,
                },

                {
                    key: 'enabled',
                    header: 'Enb',
                    toolTip: 'Node Enabled',
                    getValue: lib.outputYesNo,
                    getBg: lib.bgSuccessOrFail,
                    onClick: lib.defaultCellClick,
                },

                {
                    key: 'parent',
                    header: 'GROUP',
                    onClick: lib.defaultCellClick,
                },

                {
                    key: 'name',
                    header: 'Name',
                    getBg: function(v, data) {
                        return data.DSCount === 0 || v.toLowerCase().match(/^drawing/) || data.hasNumberEnding ? lib.bgYellow : undefined;
                    },
                    toolTip: function(v, data) {
                        return data.DSCount === 0 || v.toLowerCase().match(/^drawing/) || data.hasNumberEnding ? 'Has naming issues' : '';
                    },
                    onClick: lib.defaultCellClick,

                },

                {
                    key: 'srcNode',
                    header: 'IN',
                    toolTip: 'Has Input Connections',
                    getValue: lib.outputYesNo,
                    getBg: lib.bgSuccessOrFail,
                    onClick: lib.defaultCellClick,
                },

                {
                    key: 'destNode',
                    header: 'OUT',
                    toolTip: 'Has Output Connections',
                    getValue: lib.outputYesNo,
                    getBg: lib.bgSuccessOrFail,
                    onClick: lib.defaultCellClick,
                },

                {
                    key: 'hasNumberEnding',
                    header: 'NUM',
                    toolTip: 'Has Number Ending',
                    getValue: lib.outputYesNo,
                    getBg: lib.bgSuccessOrFailInverted,
                    onClick: lib.defaultCellClick,
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

        checkColorName: function(name) {
            if (!name) return;
            name = name.replace('_pencil_texture', ''); // !!!
            var namingIssues = {};
            if (!(name.match(/^[A-Z][a-z]+(-[A-Z]([a-z]?)+)?(-[A-Z]([a-z]?)+)?(_[A-Z]+)?$/) || name.match(/^[A-Z]+$/))) namingIssues[' - Name pattern <Element-Name>[_<MODIFIER>]'] = true; // Name Pattern
            if (name.toLowerCase().match(/^new/)) namingIssues[' - Default name'] = true; // Default names
            if (name.match(' ')) namingIssues[' - Has spaces'] = true; // Has spaces
            if (name.toLowerCase().match(/\d/)) namingIssues[' - Contains Numbers'] = true; // Contains Numbers
            return Object.keys(namingIssues).length ? Object.keys(namingIssues) : false;
        },

    };


    /// ------------------------------------------------
    var tabsAdded = 0;

    try {

        var tabs = new QTabWidget(ui);

        if (options.all || options.pegs) {
            var PegStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/PegStats.js"));
            tabs.addTab(new PegStats(selectedNodes, undefined, lib, contentMaxHeight), 'Pegs');
            tabsAdded++;
        }

        if (options.all || options.drawings) {
            var DrawingStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/DrawingStats.js"));
            tabs.addTab(new DrawingStats(selectedNodes, undefined, lib, contentMaxHeight), 'Drawings');
            tabsAdded++;
        }

        if (options.all || options.composites) {
            var CompositeStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/CompositeStats.js"));
            tabs.addTab(new CompositeStats(selectedNodes, undefined, lib, contentMaxHeight), 'Composites');
            tabsAdded++;
        }

        if (options.all || options.palettes || options.color) {
            var PaletteStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/PaletteStats.js"));
            var palettesData = new PaletteStats(selectedNodes, undefined, lib, contentMaxHeight);

            if (options.all || options.palettes) {
                tabs.addTab(palettesData.palettes.tableView, 'Palettes');
                tabsAdded++;
            }

            if (options.all || options.colors) {
                tabs.addTab(palettesData.colors.tableView, 'Colors');
                tabsAdded++;
            }
        }
        // tabs.addTab( new QLabel("widget 2"), 'Tab2');

        ui.mainLayout.addWidget(tabs, 0, 0);

        //
        // modal.addVLine( btnHeight, mainGroup );
        // mainGroup.mainLayout.addStretch();

    } catch (err) { MessageLog.trace('Error: ' + err); }

    if (!tabsAdded) return;

    //
    ui.mainLayout.addStretch();

    ui.show();

}