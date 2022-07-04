/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220622
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function( selectedNodes, modal, storage, contentMaxHeight ) {

    // Collect Data
    var items = storage.getAllChildNodes(selectedNodes, 'COMPOSITE');
    if (!items.length) return;

    items = items
        .map(function(nodeData, i) {

            var itemData = Object.assign( storage.getBaseItemData(nodeData,i), {
            	mode: node.getTextAttr( nodeData.node, 1, 'COMPOSITE_MODE' )
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
    // var uiGroup = modal.addGroup('COMPOSITES ('+items.length+')', modal.ui, true, style);
    
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
            getBg: function(v,data) {
                return typeBg[v];
            },
            onClick: storage.defaultCellClick
        },

		{
			key: 'mode',
			header: 'Mode',
			getBg: function(v,data) {
				return bgColors[v];
			},
			onClick: storage.defaultCellClick
		}

    ]), undefined, contentMaxHeight ); 

    return tableView;

}