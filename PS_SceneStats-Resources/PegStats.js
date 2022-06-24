/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220624
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function( selectedNodes, modal, lib, contentMaxHeight ){

	// Generate the Table
  	
  	// Collect Data
	var items = NodeUtils.getAllChildNodes( selectedNodes, 'PEG' );
	if( !items.length ) return;

	items = items
		.map(function(n,i){

			var pivotX = Math.abs( Number(node.getTextAttr( n, 1, 'PIVOT.X' )) );
			var pivotY = Math.abs( Number(node.getTextAttr( n, 1, 'PIVOT.Y' )) );
			var pivotWarning = '';
			var pivotWarningMessage = '';

			if( pivotX+pivotY === 0 ) {
				pivotWarning = true;
				pivotWarningMessage = 'The Pivot has zero values.';
			}

			if( pivotX < .1 ){
				pivotWarning = '!';
				pivotWarningMessage = 'The Pivot has near zero values.';
			}

			var itemData = Object.assign( lib.getBaseItemData(n,i), {
				enable3d: node.getTextAttr( n, 1, 'ENABLE_3D' ) === 'Y',
				position3dPath: node.getTextAttr( n, 1, 'POSITION.SEPARATE' ) !== 'On',
				hasNumberEnding: node.getName(n).match(/_\d\d?$/),
				pivotWarning: pivotWarning,
				pivotWarningMessage: pivotWarningMessage,
			});

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
  	// var uiGroup = modal.addGroup( 'DRAWINGS ('+items.length+')', modal.ui, true, style );

  	//
	var tableView = new TableView( items, lib.getBaseTableRows().concat([

		{
			key: 'enable3d',
			header: '3d',
			toolTip: 'Enable 3D',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessYellow,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'position3dPath',
			header: 'P3d',
			toolTip: 'Position 3D Path',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessYellow,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'pivotWarning',
			header: 'Pvt',
			toolTip: function(v,data){ return data.pivotWarningMessage; },
			// getValue: lib.outputYesNo,
			getBg: lib.bgSuccessYellow,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'hasNumberEnding',
			header: 'NUM',
			toolTip: 'Has Number Ending',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

	]), undefined, contentMaxHeight );
	
	return tableView;

}