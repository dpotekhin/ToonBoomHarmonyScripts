/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220714
*/

//
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function(selectedNodes, modal, storage, contentMaxHeight) {

    // Generate the Table

    // Collect Data
    var items = storage.getAllChildNodes(selectedNodes, 'READ');
    if (!items.length) return;

    var usedElements = {};
    var scaleIndependentShorthands = {
        'Scale Dependent': 'SD',
        'Scale Independent': 'SI',
        'Scale Independent (Legacy)': 'SIL',
    };

    items = items
        .map(function(nodeData, i) {

            var n = nodeData.node;

            var elementId = node.getElementId(n);
            if (!usedElements[elementId]) usedElements[elementId] = [n];
            else usedElements[elementId].push(n);

            //
            var adjustPencilThickness = node.getTextAttr(n, 1, 'ADJUST_PENCIL_THICKNESS') === 'Y';
            var adjustPencilThicknessToolTip = 'Pencil Thickness Adjusted';
            if (adjustPencilThickness) {

                var _scaleIndependent = node.getTextAttr(n, 1, 'ZOOM_INDEPENDENT_LINE_ART_THICKNESS');
                var _proportional = Number(node.getTextAttr(n, 1, 'MULT_LINE_ART_THICKNESS'));
                var _constant = Number(node.getTextAttr(n, 1, 'ADD_LINE_ART_THICKNESS'));
                var _min = Number(node.getTextAttr(n, 1, 'MIN_LINE_ART_THICKNESS'));
                var _max = Number(node.getTextAttr(n, 1, 'MAX_LINE_ART_THICKNESS'));

                adjustPencilThickness = scaleIndependentShorthands[_scaleIndependent] +
                    '/' + storage.outputPointOne(_proportional) +
                    '/' + storage.outputPointOne(_constant) +
                    '/' + storage.outputPointOne(_min) +
                    '/' + storage.outputPointOne(_max);

                adjustPencilThicknessToolTip = 'Pencil Thickness Adjusted.' +
                    '\n - Scale Independent: ' + _scaleIndependent +
                    '\n - Proportional: ' + _proportional +
                    '\n - Constant: ' + _constant +
                    '\n - Minimum: ' + _min +
                    '\n - Maximum: ' + _max;

            }

            //
            var itemData = Object.assign(storage.getBaseItemData(nodeData, i), {
                canAnimate: node.getTextAttr(n, 1, 'CAN_ANIMATE') === 'Y',
                enable3d: node.getTextAttr(n, 1, 'ENABLE_3D') === 'Y',
                adjustPencilThickness: adjustPencilThickness,
                adjustPencilThicknessToolTip: adjustPencilThicknessToolTip,
                preserveLineThickness: node.getTextAttr(n, 1, 'PENCIL_LINE_DEFORMATION_PRESERVE_THICKNESS') === 'Y',
                elementId: elementId,
                drawingColumn: node.linkedColumn(n, "DRAWING.ELEMENT"),
            });

            return itemData;

        })
        .sort(function(a, b) {
            if (a.parent < b.parent) return -1;
            if (a.parent > b.parent) return 1;
            return 0;
        });
    // MessageLog.trace( JSON.stringify( items, true, '  ') );

    // Group
    var style = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
    // var uiGroup = modal.addGroup( 'DRAWINGS ('+items.length+')', modal.ui, true, style );

    //
    var tableView = new TableView(items, storage.getBaseTableRows().concat([

        {
            key: 'canAnimate',
            header: 'Anm',
            toolTip: 'Animate Using Animation Tools',
            getValue: storage.outputYesNo,
            getBg: storage.bgSuccessOrFailInverted,
            onClick: storage.defaultCellClick,
        },

        {
            key: 'enable3d',
            header: '3d',
            toolTip: 'Enable 3D',
            getValue: storage.outputYesNo,
            getBg: storage.bgSuccessYellow,
            onClick: storage.defaultCellClick,
        },

        {
            header: 'EU',
            toolTip: function(v, data) { return 'Element Used:\n' + usedElements[data.elementId].join('\n'); },
            getBg: function(v, data) { return usedElements[data.elementId].length === 1 ? storage.bgEmpty : storage.bgYellow; },
            getValue: function(v, data) {
                return usedElements[data.elementId].length;
            },
            onClick: storage.defaultCellClick,
        },

        {
            key: 'drawingTimings',
            header: 'DT',
            toolTip: function(v, data) {
                return 'Drawing Timings:\n' + v.map(function(v) { return '- ' + v; }).join('\n');
            },
            getValue: function(v, data) {
                return v.length;
            },
            getBg: storage.bgFailOnly,
            onClick: storage.defaultCellClick,
        },

        {
            key: 'usedDrawingTimings',
            header: 'UDT',
            toolTip: function(v, data) {
                return 'Used Drawing Timings:\n' + v.map(function(v) { return '- ' + v; }).join('\n');
            },
            getValue: function(v, data) {
                return v.length;
            },
            getBg: storage.bgFailOnly,
            onClick: storage.defaultCellClick,
        },

        {
            key: 'drawingSyncedTo',
            header: 'Sync',
            toolTip: function(v) { return v ? 'Synced to Column: ' + v : 'Drawing is not synced' },
            getValue: storage.outputYesNo,
            getBg: storage.bgSuccessYellow,
            onClick: storage.defaultCellClick,
        },

        {
            key: 'adjustPencilThickness',
            header: 'PT',
            toolTip: function(v, data) { return data.adjustPencilThicknessToolTip },
            getValue: storage.outputValueOrNo,
            getBg: storage.bgSuccessYellow,
            onClick: storage.defaultCellClick,
        },

        {
            key: 'preserveLineThickness',
            header: 'PLT',
            toolTip: 'Preserve Line Thickness',
            getBg: storage.bgSuccessYellow,
            getValue: storage.outputYesNo,
            onClick: storage.defaultCellClick,
        },

        {
            key: 'usedColors',
            header: 'UC',
            toolTip: function(v) {
                return 'Used Colors:\n' + v.map(function(vv) {
                    var colorItem = storage.colorsById[vv];
                    return '- ' + colorItem ? colorItem.paletteName + '/' + colorItem.colorName : vv;
                }).join('\n');
            },
            getBg: storage.bgFailYellow,
            getValue: function(v) { return v.length; },
            onClick: storage.defaultCellClick,
        }

    ]), undefined, contentMaxHeight);

    // tableView.sortingEnabled = true;

    return tableView;

}