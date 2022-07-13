/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220622
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function(selectedNodes, modal, storage, contentMaxHeight) {

    // Collect Data
    var items = storage.getAllChildNodes(selectedNodes, 'COMPOSITE');
    if (!items.length) return;

    items = items
        .map(function(nodeData, i) {

            var itemData = Object.assign(storage.getBaseItemData(nodeData, i), {
                mode: node.getTextAttr(nodeData.node, 1, 'COMPOSITE_MODE')
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
    // var style = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
    // var uiGroup = modal.addGroup('COMPOSITES ('+items.length+')', modal.ui, true, style);

    // Check repeated input connections of the same node
    items.forEach(function(item) {
        var numInput = node.numberOfInputPorts(item.node);
        var srcNodes = {};
        for (var i = 0; i < numInput; i++) {
            var srcNode = node.srcNode(item.node, i);
            if( !srcNodes[srcNode] ) srcNodes[srcNode] = 1;
            else srcNodes[srcNode]++;
        }
        item.repeatedInputConnections = Object.keys(srcNodes).filter(function(srcNode){
            return srcNodes[srcNode] > 1;
        });
    });

    //
    var bgColors = {
        'Pass Through': storage.bgSuccess,
        'As Bitmap': storage.bgWarning,
        'As Seamless Bitmap': storage.bgInfo,
        'As Vector': storage.bgStrange,
    };

    //
    var typeBg = {
        'COMPOSITE': '',
        'MATTE_COMPOSITE': storage.bgInfo,
    };

    //
    var tableView = new TableView(items, storage.getBaseTableRows().concat([

        {
            key: 'type',
            header: 'Type',
            getBg: function(v, data) {
                return typeBg[v];
            },
            onClick: storage.defaultCellClick
        },

        {
            key: 'mode',
            header: 'Mode',
            getBg: function(v, data) {
                return bgColors[v];
            },
            onClick: storage.defaultCellClick
        },

        {
            key: 'repeatedInputConnections',
            header: 'RIC',
            toolTip: function(v,data) {
                return 'Repeated Input Connections:\n'+v.map(function(v){ return '- '+v;}).join('\n');
            },
            getValue: function(v,data) {
                return v.length ? 'Yes' : 'No';
            },
            getBg: storage.bgSuccessOrFailInverted,
            onClick: storage.defaultCellClick
        },



    ]), undefined, contentMaxHeight);

    return tableView;

}