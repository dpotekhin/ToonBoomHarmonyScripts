/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220715
*/
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SceneStats-Resources/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SceneStats-Resources/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SceneStats-Resources/ps/NodeUtils.js"));
var Sha1 = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/Sha1.js"));

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

    ICONS_PATH: fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/icons/"),
    ART_LAYERS: ['UL', 'CA', 'LA', 'OL'],

    topSelectedNode: undefined,
    nodes: {},
    nodesByType: {},
    elements: [],
    drawingSubstitutionHashes: {},

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
        this.parsePalettesAndColors();
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
    bgGray1: new QBrush(new QColor('#303030')),
    bgGray2: new QBrush(new QColor('#101010')),
    bgSuccessOrFail: function(v) { return checkNull(v, checkByValueType(v) ? storage.bgSuccess : storage.bgFail); },
    bgFailOnly: function(v) { return checkNull(v, checkByValueType(v) ? undefined : storage.bgFail); },
    bgSuccessOrFailInverted: function(v) { return checkNull(v, !checkByValueType(v) ? storage.bgSuccess : storage.bgFail); },
    bgSuccessYellow: function(v) { return checkNull(v, checkByValueType(v) ? storage.bgYellow : undefined); },
    bgFailYellow: function(v) { return checkNull(v, checkByValueType(v) ? storage.bgSuccess : storage.bgYellow); },
    bgEmpty: function(v) { return checkNull(v, !checkByValueType(v) || checkByValueType(v, 0) ? storage.bgFail : undefined); },
    bgSuccessIfOne: function(v) { return checkNull(v, checkByValueType(v, 1) ? storage.bgSuccess : storage.bgYellow); },
    bgIndex: function(v) { return (typeof v === 'string' ? Number(v.split('-')[0]) : v) % 2 ? storage.bgGray1 : storage.bgGray2; },

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
        selection.addNodeToSelection(typeof data === 'string' ? data : data.path || data.node);
        Action.perform("onActionEditProperties()", "scene");
    },

    selectNode: function(data) {
        selection.clearSelection();
        selection.addNodeToSelection(typeof data === 'string' ? data : data.path || data.node);
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


    //
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

        var tempCoun = 0;

        if (nodeType === 'READ') {

            nodeData.elementId = node.getElementId(_node);
            nodeData.drawingColumn = node.linkedColumn(_node, 'DRAWING.ELEMENT');
            nodeData.drawingSubstitutions = column.getDrawingTimings(nodeData.drawingColumn);
            nodeData.drawingSyncedTo = node.getTextAttr(_node, storage.currentFrame, 'DRAWING.ELEMENT.LAYER');

            nodeData.usedDrawingSubstitutionsFrames = [];
            nodeData.usedDrawingSubstitutions = [];
            for (var f = 1; f <= frame.numberOf(); f++) {
                var entry = column.getEntry(nodeData.drawingColumn, 1, f)
                if (entry !== '' && nodeData.usedDrawingSubstitutions.indexOf(entry) === -1) {
                    nodeData.usedDrawingSubstitutions.push(entry);
                    nodeData.usedDrawingSubstitutionsFrames.push(f);
                }
            }

            nodeData.unusedDrawingSubstitutions = nodeData.drawingSubstitutions.filter(function(nn) { return nodeData.usedDrawingSubstitutions.indexOf(nn) === -1; });

            // Drawing substitutions
            var elementData = _this.elements[nodeData.elementId];

            if (!elementData) {

                var drawingSubstitutions = {};

                nodeData.drawingSubstitutions.forEach(function(dsName) {

                    var usedArtLayers = [];
                    for (var ai = 0; ai < 4; ai++) {
                        var config = {
                            drawing: {
                                elementId: nodeData.elementId,
                                exposure: dsName,
                            },
                            art: ai
                        };
                        if (nodeData.drawingSyncedTo) config.drawing.layer = nodeData.drawingSyncedTo;
                        var box = Drawing.query.getBox(config);
                        // if(nodeData.name==='HEAD') MessageLog.trace('??? '+dsName+' >>> '+ai+' >> '+JSON.stringify(box,true,'  '))
                        if (box && !box.empty) usedArtLayers.push(_this.ART_LAYERS[ai]);
                    }

                    drawingSubstitutions[dsName] = {
                        elementId: nodeData.elementId,
                        name: dsName,
                        // exposedOnTimeline: {},
                        usedArtLayers: usedArtLayers,
                        isEmpty: !usedArtLayers.length,
                        usedColors: [],
                        usedInNode: nodeData.node,
                    };

                });

                elementData = _this.elements[nodeData.elementId] = {
                    elementId: nodeData.elementId,
                    name: element.getNameById(nodeData.elementId),
                    columns: [],
                    nodes: [],
                    drawingSubstitutions: drawingSubstitutions
                };

            }

            elementData.columns.push(nodeData.drawingColumn);
            elementData.nodes.push(nodeData.node);

            nodeData.drawingSubstitutions.forEach(function(dsName, dsI) {
                var usedDSIndex = nodeData.usedDrawingSubstitutions.indexOf(dsName);
                if (usedDSIndex !== -1) {
                    elementData.drawingSubstitutions[dsName].usedInNode = nodeData.node;
                    elementData.drawingSubstitutions[dsName].usedInFrame = nodeData.usedDrawingSubstitutionsFrames[usedDSIndex];
                }
            });

            // Used Colors
            var drawingKeys = [];
            for (var ki = 0; ki < nodeData.drawingSubstitutions.length; ki++) {
                drawingKeys.push(Drawing.Key({
                    elementId: nodeData.elementId,
                    exposure: nodeData.drawingSubstitutions[ki],
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
            });

        }

        storage.nodesByType[nodeType].push(nodeData);

    },




    //
    parseDrawingSubstitutions: function() {

        var isCanceled = false;
        storage.createProgressBar(function() { isCanceled = true; });

        var total = 0;
        Object.keys(storage.elements).forEach(function(elName, elI) {
            total += Object.keys(storage.elements[elName].drawingSubstitutions).length;
        });

        var totalI = 0;

        Object.keys(storage.elements).forEach(function(elName, elI) {

            if (isCanceled) return;

            var elData = storage.elements[elName];
            // if(elName !== 24) return;
            Object.keys(elData.drawingSubstitutions).forEach(function(dsName, dsI) {

                if (isCanceled) return;

                var dsData = elData.drawingSubstitutions[dsName];

                if (dsData.usedArtLayers.length) {

                    MessageLog.trace('DS: ' + elName + ' > ' + dsName);
                    var hash = '';

                    for (var ai = 0; ai < 4; ai++) {
                        // if (dsData.usedArtLayers.indexOf(storage.ART_LAYERS[ai]) === -1) return;
                        var config = {
                            drawing: {
                                elementId: elData.elementId,
                                exposure: dsName,
                            },
                            art: ai
                        };
                        hash += Sha1(Drawing.query.getData(config)) + '_';
                    }

                    dsData.hash = hash;

                    if (!storage.drawingSubstitutionHashes[hash]) storage.drawingSubstitutionHashes[hash] = [];
                    storage.drawingSubstitutionHashes[hash].push({
                        elData: elData,
                        drawingSubstitution: dsName
                    });
                }

                totalI++;
                storage.updateProgressBar(~~(totalI / total * 100));
                // MessageLog.trace('DS Hash: ' + elData.name + ' > ' + dsName + ' >> ' + hash);

            });


            // MessageLog.trace('>> ' + JSON.stringify(elData.drawingSubstitutions, true, '  '));

        });

        storage.closeProgressBar();

        return !isCanceled;

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


    // PROGRESS BAR
    createProgressBar: function(onCancel) {

        if (storage.progressBarUI) return;

        var progressBarUI = storage.progressBarUI = new QProgressDialog(
            "Processing Drawing Substitutions...",
            "Cancel",
            0,
            100,
            this,
            Qt.FramelessWindowHint
        );

        progressBarUI.modal = true;
        progressBarUI.value = 0;
        progressBarUI.maximum = 100;
        progressBarUI.minimumDuration = 0;

        progressBarUI.show();

        progressBarUI.canceled.connect(storage, function() {
            // MessageLog.trace('Cancel pressed');
            // isCanceled = true;
            storage.progressBarUI = undefined;
            if (onCancel) onCancel();
        });

        return progressBarUI;

    },

    updateProgressBar: function(v) {

        if (!storage.progressBarUI) return;
        storage.progressBarUI.value = v;
        // MessageLog.trace('updateProgressBar: ' + v);
    },

    closeProgressBar: function() {

        if (!storage.progressBarUI) return;

        storage.progressBarUI.close();
        storage.progressBarUI = undefined;
    },


};


//
exports = storage;