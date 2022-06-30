/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220630
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

			var currentFrame = frame.current();

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
					var xv = func.pointY( scaleXColumnName, pi );
					if( scaleXStartValue === undefined ) scaleXStartValue = xv;
					else if( xv !== scaleXStartValue ) scaleXFlipped= true;
				}
			}

			//
			var itemData = Object.assign( lib.getBaseItemData(n,i), {
				enable3d: node.getTextAttr( n, 1, 'ENABLE_3D' ) === 'Y',
				position3dPath: node.getTextAttr( n, 1, 'POSITION.SEPARATE' ) !== 'On',
				pivotWarning: pivotWarning,
				pivotWarningMessage: pivotWarningMessage,
				positionX: node.getAttr(n, currentFrame, 'POSITION.X' ).doubleValue(),
				positionY: node.getAttr(n, currentFrame, 'POSITION.Y' ).doubleValue(),
				positionZ: node.getAttr(n, currentFrame, 'POSITION.Z' ).doubleValue(),
				rotationZ: node.getAttr(n, currentFrame, 'ROTATION.ANGLEZ' ).doubleValue(),
				scaleX: node.getAttr(n, currentFrame, 'SCALE.X' ).doubleValue(),
				scaleY: node.getAttr(n, currentFrame, 'SCALE.Y' ).doubleValue(),
				scaleZ: node.getAttr(n, currentFrame, 'SCALE.Z' ).doubleValue(),
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
			key: 'positionX',
			header: 'PX',
			toolTip: 'Current X Position',
			getValue: lib.outputPointThree,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'positionY',
			header: 'PY',
			toolTip: 'Current Y Position',
			getValue: lib.outputPointThree,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'positionZ',
			header: 'PZ',
			toolTip: 'Current Z Position',
			getValue: lib.outputPointThree,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'rotationZ',
			header: 'RZ',
			toolTip: 'Current Z Rotation',
			getValue: lib.outputPointTwo,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'scaleX',
			header: 'SX',
			toolTip: 'Current X Scale',
			getValue: lib.outputPointOne,
			getBg: lib.bgSuccessIfOne,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'scaleY',
			header: 'SY',
			toolTip: 'Current Y Scale',
			getValue: lib.outputPointOne,
			getBg: lib.bgSuccessIfOne,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'scaleZ',
			header: 'SZ',
			toolTip: 'Current Z Scale',
			getValue: lib.outputPointOne,
			getBg: lib.bgSuccessIfOne,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'scaleXFlipped',
			header: 'SXF',
			toolTip: 'X Scale flipped',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

	]), undefined, contentMaxHeight );
	
	return tableView;

}