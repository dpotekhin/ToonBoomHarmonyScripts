/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220715
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function(selectedNodes, modal, storage, contentMaxHeight) {

    // Collect Data
    var items = storage.getAllChildNodes(selectedNodes, function(nodeData) {
        var srcIsNotConnected = !nodeData.srcNode && node.numberOfInputPorts(nodeData.node);
        var destIsNotConnected = !nodeData.destNode && node.numberOfOutputPorts(nodeData.node);
        return srcIsNotConnected || destIsNotConnected;
    });

    items = items
        .map(function(nodeData, i) {

            return storage.getBaseItemData(nodeData, i);

        })
        .sort(function(a, b) {
            if (a.parent < b.parent) return -1;
            if (a.parent > b.parent) return 1;
            return 0;
        });


    // //
    var tableView = new TableView(items, storage.getBaseTableRows().concat([

        {
            key: 'srcNode',
            header: 'IN',
            toolTip: 'Has Input Connections',
            getValue: storage.outputYesNo,
            getBg: storage.bgSuccessOrFail,
            onClick: storage.defaultCellClick,
        },

        {
            key: 'destNode',
            header: 'OUT',
            toolTip: 'Has Output Connections',
            getValue: storage.outputYesNo,
            getBg: storage.bgSuccessOrFail,
            onClick: storage.defaultCellClick,
        },

        {
            key: 'type',
            header: 'Type',
        }

    ]), undefined, contentMaxHeight);

    return tableView;

}