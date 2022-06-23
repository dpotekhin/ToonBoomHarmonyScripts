/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220622
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function( selectedNodes, modal, lib ){

	// Generate the Table
  	
  	// Collect Data
	var items = NodeUtils.getAllChildNodes( selectedNodes, 'READ' );
	if( !items.length ) return;

	var usedElements = {};

	items = items
		.map(function(n,i){

			var elementId = node.getElementId(n);
			if( !usedElements[elementId] ) usedElements[elementId] = [n];
			else usedElements[elementId].push(n);

			var itemData = Object.assign( lib.getBaseItemData(n,i), {
				canAnimate: node.getTextAttr( n, 1, 'CAN_ANIMATE' ) === 'Y',
				enable3d: node.getTextAttr( n, 1, 'ENABLE_3D' ) === 'Y',
				hasNumberEnding: node.getName(n).match(/_\d\d?$/),
				elementId: elementId,
				drawingColumn: node.linkedColumn(n,"DRAWING.ELEMENT"),
				DSCount: 0
			});

			if( elementId >= 0 ){
				itemData.DSCount = Drawing.numberOf(elementId);
			}

			return itemData;

		})
		.sort(function(a,b){ 
		    if(a.parent < b.parent) return -1;
		    if(a.parent > b.parent) return 1;
		    return 0;
		})
	;
	// MessageLog.trace( JSON.stringify( items, true, '  ') );

	// Group
	var style = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
  	var uiGroup = modal.addGroup( 'DRAWINGS ('+items.length+')', modal.ui, true, style );

  	//
	var tableView = new TableView( items, lib.getBaseTableRows().concat([

		{
			key: 'DSCount',
			header: 'DSc',
			toolTip: 'Drawing Substitution Count',
			getBg: lib.bgEmpty,
		},

		{
			key: 'canAnimate',
			header: 'Anm',
			toolTip: 'Animate Using Animation Tools',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.showNodeProperties,
		},

		{
			key: 'enable3d',
			header: '3d',
			toolTip: 'Enable 3D',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessYellow,
			onClick: lib.showNodeProperties,
		},

		{
			key: 'hasNumberEnding',
			header: 'NUM',
			toolTip: 'Has Number Ending',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.showNodeProperties,
		},

		{
			header: 'EU',
			toolTip: function(v,data){ return 'Element Used:\n'+usedElements[data.elementId].join('\n'); },
			getBg: function(v,data){ return usedElements[data.elementId].length === 1 ? lib.bgEmpty : lib.bgYellow; },
			getValue: function(v,data){
				return usedElements[data.elementId].length;
			}
		}

	]), uiGroup );
	

}