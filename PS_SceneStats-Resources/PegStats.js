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
					var xv = Math.sign( func.pointY( scaleXColumnName, pi ) );
					if( xv === 0 ) continue;
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
			header: '3d',
			key: 'enable3d',
			toolTip: 'Enable 3D',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessYellow,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'P3d',
			key: 'position3dPath',
			toolTip: 'Position 3D Path',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessYellow,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'Pvt',
			key: 'pivotWarning',
			toolTip: function(v,data){ return data.pivotWarningMessage; },
			// getValue: lib.outputYesNo,
			getBg: lib.bgSuccessYellow,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'PX',
			key: 'positionX',
			toolTip: 'Current X Position',
			getValue: lib.outputPointThree,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'PY',
			key: 'positionY',
			toolTip: 'Current Y Position',
			getValue: lib.outputPointThree,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'PZ',
			key: 'positionZ',
			toolTip: 'Current Z Position',
			getValue: lib.outputPointThree,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'RZ',
			key: 'rotationZ',
			toolTip: 'Current Z Rotation',
			getValue: lib.outputPointTwo,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'SX',
			key: 'scaleX',
			toolTip: 'Current X Scale',
			getValue: lib.outputPointOne,
			getBg: lib.bgSuccessIfOne,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'SY',
			key: 'scaleY',
			toolTip: 'Current Y Scale',
			getValue: lib.outputPointOne,
			getBg: lib.bgSuccessIfOne,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'SZ',
			key: 'scaleZ',
			toolTip: 'Current Z Scale',
			getValue: lib.outputPointOne,
			getBg: lib.bgSuccessIfOne,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'SXF',
			key: 'scaleXFlipped',
			toolTip: 'X Scale flipped',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

	]), undefined, contentMaxHeight );
	
	return tableView;

}