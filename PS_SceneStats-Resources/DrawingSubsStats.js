/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220719
*/

//
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function(selectedNodes, modal, storage, contentMaxHeight) {

    storage.getAllChildNodes(selectedNodes, 'READ');

    var items = [];
    Object.keys(storage.elements).forEach(function(elName, elI) {
        var elData = storage.elements[elName];
        Object.keys(elData.drawingSubstitutions).forEach(function(dsName, dsI) {
            var dsData = elData.drawingSubstitutions[dsName];
            items.push(Object.assign(dsData, {
                index: (elI + 1) + '-' + (dsI + 1),
                elementName: elData.name,
            }));
        });
    });

    function onClick(data) {
        if (!data.usedInNode) return;
        storage.defaultCellClick(data.usedInNode);
        if (data.usedInFrame) frame.setCurrent(data.usedInFrame);
    }

    //
    var tableView = new TableView(items, [

        {
            key: 'index',
            header: '#',
            getBg: storage.bgIndex
        },

        {
            key: 'elementName',
            header: 'Element Name',
            onClick: onClick,
        },

        {
            key: 'name',
            header: 'DS Name',
            onClick: onClick,
        },

        {
            key: 'usedArtLayers',
            toolTip: 'Used Art Layers',
            header: 'Used AL',
            getBg: storage.bgFailOnly,
            onClick: onClick,
        },

        {
            key: 'usedInNode',
            header: 'Used in Scene',
            toolTip: function(v,data){ return data.usedInFrame ? 'Used at frame '+data.usedInFrame+' of "'+v+'" node.' : 'Used in "'+v+'" node, but not exposed on the Timeline.'; },
            getValue: function(v, data) { return v.split('/').pop() },
            getBg: function(v, data) { return data.usedInFrame ? storage.bgSuccess : (v ? storage.bgYellow : storage.bgFail); },
            onClick: onClick,
        },



    ], undefined, contentMaxHeight);

    // tableView.sortingEnabled = true;

    return tableView;

}