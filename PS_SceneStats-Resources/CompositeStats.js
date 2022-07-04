/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220622
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function( selectedNodes, modal, lib, contentMaxHeight ) {

    // Collect Data
    var items = NodeUtils.getAllChildNodes(selectedNodes, 'COMPOSITE');
    if (!items.length) return;

    items = items
        .map(function(n, i) {

            var itemData = Object.assign( lib.getBaseItemData(n,i), {
            	mode: node.getTextAttr( n, 1, 'COMPOSITE_MODE' ),
                type: node.type(n),
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
    	'Pass Through': lib.bgSuccess,
    	'As Bitmap': lib.bgWarning,
    	'As Seamless Bitmap': lib.bgInfo,
    	'As Vector': lib.bgStrange,
    };

    //
    var typeBg = {
        'COMPOSITE': '',
        'MATTE_COMPOSITE': lib.bgInfo,
    };

    //
    var tableView = new TableView(items, lib.getBaseTableRows().concat([

        {
            key: 'type',
            header: 'Type',
            getBg: function(v,data) {
                return typeBg[v];
            },
            onClick: lib.defaultCellClick
        },

		{
			key: 'mode',
			header: 'Mode',
			getBg: function(v,data) {
				return bgColors[v];
			},
			onClick: lib.defaultCellClick
		}

    ]), undefined, contentMaxHeight ); 

    return tableView;

}