/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220715
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function( selectedNodes, modal, storage, contentMaxHeight ){

	// Generate the Table
  	
  	// Collect Data
	var items = storage.getAllChildNodes( selectedNodes, 'PEG' );

	items = items
		.map(function(nodeData,i){

			var n = nodeData.node;

			// Pivot
			var pivotX = Math.abs( Number(node.getTextAttr( n, 1, 'PIVOT.X' )) );
			var pivotY = Math.abs( Number(node.getTextAttr( n, 1, 'PIVOT.Y' )) );
			var pivotWarning = '';
			var pivotWarningMessage = '';

			if( pivotX+pivotY === 0 ) {
				pivotWarning = true;
				pivotWarningMessage = 'The Pivot has zero values.';
			}

			if( pivotX < .1 || pivotY < .1 ){
				pivotWarning = '!';
				pivotWarningMessage = 'The Pivot has near zero values.';
			}

			// Scale X is flipped in the animation ?
			var scaleXFlipped = false;
			var scaleXStartValue;
			var scaleXColumnName = node.linkedColumn(n, "SCALE.X");
			if( scaleXColumnName ){
				var points = func.numberOfPoints( scaleXColumnName );
				for( var pi=0; pi<points; pi++ ){
					var xv = Math.sign( func.pointY( scaleXColumnName, pi ) );
					if( xv === 0 ) continue;
					if( scaleXStartValue === undefined ) scaleXStartValue = xv;
					else if( xv !== scaleXStartValue ) scaleXFlipped= true;
				}
			}

			//
			var itemData = Object.assign( storage.getBaseItemData(nodeData,i), {
				enable3d: node.getTextAttr( n, 1, 'ENABLE_3D' ) === 'Y',
				position3dPath: node.getTextAttr( n, 1, 'POSITION.SEPARATE' ) !== 'On',
				pivotWarning: pivotWarning,
				pivotWarningMessage: pivotWarningMessage,
				positionX: node.getAttr(n, storage.currentFrame, 'POSITION.X' ).doubleValue(),
				positionY: node.getAttr(n, storage.currentFrame, 'POSITION.Y' ).doubleValue(),
				positionZ: node.getAttr(n, storage.currentFrame, 'POSITION.Z' ).doubleValue(),
				rotationZ: node.getAttr(n, storage.currentFrame, 'ROTATION.ANGLEZ' ).doubleValue(),
				scaleX: node.getAttr(n, storage.currentFrame, 'SCALE.X' ).doubleValue(),
				scaleY: node.getAttr(n, storage.currentFrame, 'SCALE.Y' ).doubleValue(),
				scaleZ: node.getAttr(n, storage.currentFrame, 'SCALE.Z' ).doubleValue(),
				scaleXFlipped: scaleXFlipped
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
	var tableView = new TableView( items, storage.getBaseTableRows().concat([

		{
			header: '3d',
			key: 'enable3d',
			toolTip: 'Enable 3D',
			getValue: storage.outputYesNo,
			getBg: storage.bgSuccessYellow,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'P3d',
			key: 'position3dPath',
			toolTip: 'Position 3D Path',
			getValue: storage.outputYesNo,
			getBg: storage.bgSuccessYellow,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'Pvt',
			key: 'pivotWarning',
			toolTip: function(v,data){ return data.pivotWarningMessage; },
			// getValue: storage.outputYesNo,
			getBg: storage.bgSuccessYellow,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'PX',
			key: 'positionX',
			toolTip: 'Current X Position',
			getValue: storage.outputPointThree,
			getBg: storage.bgSuccessOrFailInverted,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'PY',
			key: 'positionY',
			toolTip: 'Current Y Position',
			getValue: storage.outputPointThree,
			getBg: storage.bgSuccessOrFailInverted,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'PZ',
			key: 'positionZ',
			toolTip: 'Current Z Position',
			getValue: storage.outputPointThree,
			getBg: storage.bgSuccessOrFailInverted,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'RZ',
			key: 'rotationZ',
			toolTip: 'Current Z Rotation',
			getValue: storage.outputPointTwo,
			getBg: storage.bgSuccessOrFailInverted,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'SX',
			key: 'scaleX',
			toolTip: 'Current X Scale',
			getValue: storage.outputPointOne,
			getBg: storage.bgSuccessIfOne,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'SY',
			key: 'scaleY',
			toolTip: 'Current Y Scale',
			getValue: storage.outputPointOne,
			getBg: storage.bgSuccessIfOne,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'SZ',
			key: 'scaleZ',
			toolTip: 'Current Z Scale',
			getValue: storage.outputPointOne,
			getBg: storage.bgSuccessIfOne,
			onClick: storage.defaultCellClick,
		},

		{
			header: 'SXF',
			key: 'scaleXFlipped',
			toolTip: 'X Scale flipped',
			getValue: storage.outputYesNo,
			getBg: storage.bgSuccessOrFailInverted,
			onClick: storage.defaultCellClick,
		},

	]), modal, contentMaxHeight );
	
	// tableView.sortingEnabled = true;

	return tableView;

}