/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220714
*/
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));

///
function checkNull(v1, v2) {
    if (v1 === null) return '';
    return v2;
}

function checkByValueType(val, equalTo) {

    if (!val) return equalTo !== undefined ? val === equalTo : false;

    if (typeof val === 'string') {
        // console.log('string');
        return equalTo !== undefined ? val === equalTo : !!val;
    }
    // Array
    if (Array.isArray(val)) {
        // console.log('array');
        return equalTo !== undefined ? val.length === equalTo : !!val.length;
    }

    // Number
    if (!isNaN(val)) {
        // console.log('number');
        return equalTo !== undefined ? val === equalTo : !!val;
    }

    return false

}

///
var storage = {

    topSelectedNode: undefined,
    nodes: {},
    nodesByType: {},

    palettes: undefined,
    colors: undefined,
    colorsById: {},
    defaultColorsIds: [
        "0b3934f843700d34",
        "0b3934f843700d36",
        "0b3934f843700d38",
        "0b3934f843700d3a",
        "0b3934f843700d3c",
        "0000000000000003"
    ],

    init: function(topSelectedNode) {
        this.topSelectedNode = topSelectedNode;
        this.currentSceneName = scene.currentScene().replace(/\.tpl$/, '').replace(/\.|_v\d\d\d?$/, '');
        this.currentFrame = frame.current();
    },

    ///
    checkNull: checkNull,
    checkByValueType: checkByValueType,
    returnEmpty: function() {},

    bgSuccess: new QBrush(new QColor('#004000')),
    bgFail: new QBrush(new QColor('#400000')),
    bgYellow: new QBrush(new QColor('#404000')),
    bgWarning: new QBrush(new QColor('#404000')),
    bgStrange: new QBrush(new QColor('#444400')),
    bgInfo: new QBrush(new QColor('#000044')),
    bgSuccessOrFail: function(v) { return checkNull(v, checkByValueType(v) ? storage.bgSuccess : storage.bgFail); },
    bgFailOnly: function(v) { return checkNull(v, checkByValueType(v) ? undefined : storage.bgFail); },
    bgSuccessOrFailInverted: function(v) { return checkNull(v, !checkByValueType(v) ? storage.bgSuccess : storage.bgFail); },
    bgSuccessYellow: function(v) { return checkNull(v, checkByValueType(v) ? storage.bgYellow : undefined); },
    bgFailYellow: function(v) { return checkNull(v, checkByValueType(v) ? storage.bgSuccess : storage.bgYellow); },
    bgEmpty: function(v) { return checkNull(v, !checkByValueType(v) || checkByValueType(v, 0) ? storage.bgFail : undefined); },
    bgSuccessIfOne: function(v) { return checkNull(v, checkByValueType(v, 1) ? storage.bgSuccess : storage.bgYellow); },

    outputYesNo: function(v) { return checkNull(v, checkByValueType(v) ? 'Yes' : 'No'); },
    outputYesNoInverted: function(v) { return checkNull(v, !checkByValueType(v) ? 'Yes' : 'No'); },
    outputValueOrNo: function(v) { return checkNull(v, checkByValueType(v) ? v : 'No'); },
    outputWarning: function(v) { return checkNull(v, checkByValueType(v) ? '!' : ''); },
    outputString: function(v) { return checkNull(v, v) },
    outputNumber: function(v) { return checkNull(v, ~~v) },
    outputPointOne: function(v) { return checkNull(v, ~~(v * 10) / 10); },
    outputPointTwo: function(v) { return checkNull(v, ~~(v * 100) / 100); },
    outputPointThree: function(v) { return checkNull(v, ~~(v * 1000) / 1000); },

    defaultCellClick: function(data) {
        // MessageLog.trace('defaultCellClick:' + JSON.stringify(data, true, '  '));

        if (KeyModifiers.IsControlPressed()) {
            storage.selectNode(data);
            SelectionUtils.focusOnSelectedNode();
            return;

        } else if (KeyModifiers.IsAlternatePressed()) {

            storage.showNodeProperties(data);
            return;

        }

        storage.selectNode(data);
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

    getBaseItemData: function(nodeData, i) {
        var n = nodeData.node;
        return Object.assign(nodeData, {
            index: Utils.getZeroLeadingString(i + 1, 3),
            path: n
        });
    },

    getBaseTableRows: function() {

        return [

            {
                key: 'index',
                header: '#'
            },

            {
                key: 'color',
                header: 'Col',
                toolTip: 'Node Color',
                getBg: function(v) { if (v) return new QBrush(new QColor('#' + v.substr(0, 6))) },
                getValue: function(v) { return v === '000000' ? 'No' : ''; },
                onClick: storage.defaultCellClick,
            },

            {
                key: 'enabled',
                header: 'Enb',
                toolTip: 'Node Enabled',
                getValue: storage.outputYesNo,
                getBg: storage.bgSuccessOrFail,
                onClick: storage.defaultCellClick,
            },

            {
                key: 'parent',
                header: 'GROUP',
                onClick: storage.defaultCellClick,
            },

            {
                key: 'name',
                header: 'Name',
                getBg: function(v, data) {
                    return v.toLowerCase().match(/^drawing/) || data.hasNumberEnding ? storage.bgYellow : undefined;
                },
                toolTip: function(v, data) {
                    return v.toLowerCase().match(/^drawing/) || data.hasNumberEnding ? 'Has naming issues' : '';
                },
                // getValue: function(v, data) {
                //     return data.index + ':' + v;
                // },
                onClick: storage.defaultCellClick,

            },

            // {
            //     key: 'hasNumberEnding',
            //     header: 'NUM',
            //     toolTip: 'Has Number Ending',
            //     getValue: storage.outputYesNo,
            //     getBg: storage.bgSuccessOrFailInverted,
            //     onClick: storage.defaultCellClick,
            // },

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


    ///
    getAllChildNodes: function(selectedNodes, typesOrFilterFunction) {

        if (!this.palletes) this.parsePalettesAndColors();

        if (typeof selectedNodes !== 'string') selectedNodes = [selectedNodes];

        selectedNodes.forEach(function(_node) {

            if (!storage.nodes[_node]) {

                storage.parseNodeData(_node);

                NodeUtils.getAllChildNodes(_node, undefined, function(__node) {
                    storage.parseNodeData(__node);
                }, true);

            }

        });

        // MessageLog.trace('nodesByType: '+JSON.stringify(storage.nodesByType, true, '  '));

        var result = [];

        if (typesOrFilterFunction) {

            if (typeof typesOrFilterFunction === 'string') typesOrFilterFunction = [typesOrFilterFunction];
            if (Array.isArray(typesOrFilterFunction)) {

                typesOrFilterFunction.forEach(function(_type) { if (storage.nodesByType[_type]) result = result.concat(storage.nodesByType[_type]); });

            } else {

                Object.keys(storage.nodes).forEach(function(_node) {
                    var nodeData = storage.nodes[_node];
                    if (typesOrFilterFunction(nodeData)) result.push(nodeData);
                });
            }

        } else {

            result = Object.keys(storage.nodes).map(function(_node) { return storage.nodes[_node] });

        }

        return result;

    },


    parseNodeData: function(_node) {

        if (storage.nodes[_node]) return;

        var _this = this;

        var nodeType = node.type(_node);
        if (!storage.nodesByType[nodeType]) storage.nodesByType[nodeType] = [];

        var name = node.getName(_node);

        var nodeData = storage.nodes[_node] = {
            node: _node,
            type: nodeType,
            name: name,
            parent: node.parentNode(_node),
            enabled: node.getEnable(_node),
            color: Utils.rgbToHex(node.getColor(_node), true),
            srcNode: storage.hasAnySrc(_node),
            destNode: storage.hasAnyDest(_node),
            hasNumberEnding: name.match(/_\d\d?$/),
        };

        if (nodeType === 'READ') {

            nodeData.elementId = node.getElementId(_node);
            nodeData.drawingColumn = node.linkedColumn(_node, 'DRAWING.ELEMENT');
            nodeData.drawingTimings = column.getDrawingTimings(nodeData.drawingColumn);
            nodeData.drawingSyncedTo = node.getTextAttr(_node, storage.currentFrame, 'DRAWING.ELEMENT.LAYER');

            nodeData.usedDrawingTimings = [];
            for (var f = 1; f <= frame.numberOf(); f++) {
                var entry = column.getEntry(nodeData.drawingColumn, 1, f)
                if (entry !== '' && nodeData.usedDrawingTimings.indexOf(entry) === -1) nodeData.usedDrawingTimings.push(entry);
            }

            //
            var drawingKeys = [];
            for (var ki = 0; ki < nodeData.drawingTimings.length; ki++) {
                drawingKeys.push(Drawing.Key({
                    elementId: nodeData.elementId,
                    exposure: nodeData.drawingTimings[ki],
                    layer: nodeData.drawingSyncedTo
                }));
            }
            nodeData.usedColors = drawingKeys.length ? DrawingTools.getMultipleDrawingsUsedColors(drawingKeys) : [];
            nodeData.usedColors.forEach(function(colorId) {
                var colorData = _this.colorsById[colorId];
                if (colorData) {
                    colorData.usedInScene = true;
                    colorData.palette.usedInScene = true;
                }
            })

            // MessageLog.trace('nodeData.usedColors: \n' + JSON.stringify(nodeData.usedColors, true, '  '));
        }

        storage.nodesByType[nodeType].push(nodeData);

    },


    //
    parsePalettesAndColors: function() {

        if (this.palettes) return;

        this.palettes = [];
        this.colors = [];

        var paletteList = PaletteObjectManager.getScenePaletteList();
        var paletteCount = paletteList.numPalettes;
        var globalColorIds = {};

        for (var i = 0; i < paletteCount; i++) {

            var _palette = paletteList.getPaletteByIndex(i);
            var paletteName = _palette.getName();
            var palettePath = _palette.getPath();
            var paletteColorsHasDefaultNames = false;
            var colorsHasSameId = [];
            var colorsHasSameIdToolTip = '';
            // var colorsUsedInScene = true;

            var paletteItem = {
                num: i + 1,
                type: 'Palette',
                paletteId: _palette.id,
                paletteName: paletteName,
                paletteNamingIssues: this.checkColorName(paletteName),
                colorsNamingIssues: [],
                isNameEqualToGroup: this.topSelectedNode === paletteName,
                isNameEqualToScene: this.currentSceneName === paletteName,
                isFound: !_palette.isNotFound(),
                isValid: _palette.isValid(),
                isLoaded: _palette.isLoaded(),
                isColorPalette: _palette.isColorPalette(),
                nColors: _palette.nColors,
                palettePath: _palette.getPath(),
                usedDefaultColorId: false,
            };

            this.palettes.push(paletteItem);
            // MessageLog.trace('ID: '+_palette.id);

            // Colors
            for (var ci = 0; ci < _palette.nColors; ci++) {

                var paletteColor = _palette.getColorByIndex(ci);
                // MessageLog.trace(ci + '] ' + paletteColor.name + ', ' + paletteColor.id);

                var colorItem = {};
                Object.keys(paletteItem).forEach(function(v) { colorItem[v] = null; });
                colorItem.palette = paletteItem;
                colorItem.paletteId = _palette.id;
                colorItem.colorId = paletteColor.id;
                colorItem.num = (i + 1) + '-' + (ci + 1);
                colorItem.type = paletteColor.isTexture ? 'Texture' : 'Color';
                colorItem.paletteName = paletteName;
                colorItem.colorName = paletteColor.name;
                colorItem.id = paletteColor.id;
                colorItem.isTexture = paletteColor.isTexture;
                // colorItem.usedInScene = _palette.containsUsedColors([paletteColor.id]);
                colorItem.usedDefaultColorId = this.defaultColorsIds.indexOf(paletteColor.id) !== -1;
                if (colorItem.usedDefaultColorId) paletteItem.usedDefaultColorId = true;

                // Naming Issues
                colorItem.colorNamingIssues = storage.checkColorName(paletteColor.name);
                if (colorItem.colorNamingIssues) {
                    colorItem.colorNamingIssues.forEach(function(v) { if (paletteItem.colorsNamingIssues.indexOf(v) === -1) paletteItem.colorsNamingIssues.push(v); })
                    colorItem.colorNamingIssues = 'Has naming issuses:\n' + colorItem.colorNamingIssues.join('\n');
                }

                // if (!colorItem.usedInScene) colorsUsedInScene = false;

                this.colors.push(colorItem);
                this.colorsById[colorItem.colorId] = colorItem;

                var colorIdString = paletteName + '/' + paletteColor.name + '(' + paletteColor.id + ')';

                if (!globalColorIds[paletteColor.id]) globalColorIds[paletteColor.id] = [];
                else {
                    colorsHasSameId = [paletteColor.id];
                    colorItem.colorsHasSameId = true;
                    colorItem.colorsHasSameIdToolTip = colorIdString + ' >> ' + globalColorIds[paletteColor.id].join(' >> ');
                }
                globalColorIds[paletteColor.id].push(colorIdString);

            }

            if (colorsHasSameId.length) {
                colorsHasSameId.forEach(function(v) {
                    colorsHasSameIdToolTip += globalColorIds[v].join(' >> ') + '\n';
                });
            }

            paletteItem.colorsHasSameId = colorsHasSameId.length;
            paletteItem.colorsHasSameIdToolTip = colorsHasSameIdToolTip;
            // paletteItem.usedInScene = colorsUsedInScene;
            paletteItem.colorsNamingIssues = paletteItem.colorsNamingIssues.length ? 'Palette Colors has naming issuses:\n' + paletteItem.colorsNamingIssues.join('\n') : false;

        }

        this.palettes = this.palettes.sort();

    },



};


//
exports = storage;