/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220713
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function(selectedNodes, modal, storage, contentMaxHeight) {

    // Collect Data
    var skipNodesByType = ['NOTE'];
    var items = storage.getAllChildNodes(selectedNodes, function(nodeData) {
        if (skipNodesByType.indexOf(nodeData.type) !== -1) return;
        return (!nodeData.srcNode && nodeData.type !== 'MULTIPORT_IN') || (!nodeData.destNode && nodeData.type !== 'MULTIPORT_OUT');
    });
    if (!items.length) return;

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