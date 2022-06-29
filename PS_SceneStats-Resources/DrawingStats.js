/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220622
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function( selectedNodes, modal, lib, contentMaxHeight ){

	// Generate the Table
  	
  	// Collect Data
	var items = NodeUtils.getAllChildNodes( selectedNodes, 'READ' );
	if( !items.length ) return;

	var usedElements = {};
	var scaleIndependentShorthands = {
		'Scale Dependent': 'SD',
		'Scale Independent': 'SI',
		'Scale Independent (Legacy)': 'SIL',
	};

	items = items
		.map(function(n,i){

			var elementId = node.getElementId(n);
			if( !usedElements[elementId] ) usedElements[elementId] = [n];
			else usedElements[elementId].push(n);

			//
			var adjustPencilThickness = node.getTextAttr( n, 1, 'ADJUST_PENCIL_THICKNESS' ) === 'Y';
			var adjustPencilThicknessToolTip = 'Pencil Thickness Adjusted';
			if( adjustPencilThickness ){
				
				var _scaleIndependent = node.getTextAttr( n, 1, 'ZOOM_INDEPENDENT_LINE_ART_THICKNESS' );
				var _proportional = Number(node.getTextAttr( n, 1, 'MULT_LINE_ART_THICKNESS' ));
				var _constant = Number(node.getTextAttr( n, 1, 'ADD_LINE_ART_THICKNESS' ));
				var _min = Number(node.getTextAttr( n, 1, 'MIN_LINE_ART_THICKNESS' ));
				var _max = Number(node.getTextAttr( n, 1, 'MAX_LINE_ART_THICKNESS' ));
				
				adjustPencilThickness = scaleIndependentShorthands[_scaleIndependent]
					+'/'+ lib.outputPointOne( _proportional )
					+'/'+ lib.outputPointOne( _constant )
					+'/'+ lib.outputPointOne( _min )
					+'/'+ lib.outputPointOne( _max )
				;

				adjustPencilThicknessToolTip = 'Pencil Thickness Adjusted.'
					+'\n - Scale Independent: '+ _scaleIndependent
					+'\n - Proportional: '+ _proportional
					+'\n - Constant: '+ _constant
					+'\n - Minimum: '+ _min
					+'\n - Maximum: '+ _max
				;

			}

			//
			var itemData = Object.assign( lib.getBaseItemData(n,i), {
				canAnimate: node.getTextAttr( n, 1, 'CAN_ANIMATE' ) === 'Y',
				enable3d: node.getTextAttr( n, 1, 'ENABLE_3D' ) === 'Y',
				adjustPencilThickness: adjustPencilThickness,
				adjustPencilThicknessToolTip: adjustPencilThicknessToolTip,
				preserveLineThickness: node.getTextAttr( n, 1, 'PENCIL_LINE_DEFORMATION_PRESERVE_THICKNESS' ) === 'Y',
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
  	// var uiGroup = modal.addGroup( 'DRAWINGS ('+items.length+')', modal.ui, true, style );

  	//
	var tableView = new TableView( items, lib.getBaseTableRows().concat([

		{
			key: 'DSCount',
			header: 'DSc',
			toolTip: 'Drawing Substitution Count',
			getBg: lib.bgEmpty,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'canAnimate',
			header: 'Anm',
			toolTip: 'Animate Using Animation Tools',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessOrFailInverted,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'enable3d',
			header: '3d',
			toolTip: 'Enable 3D',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessYellow,
			onClick: lib.defaultCellClick,
		},

		{
			header: 'EU',
			toolTip: function(v,data){ return 'Element Used:\n'+usedElements[data.elementId].join('\n'); },
			getBg: function(v,data){ return usedElements[data.elementId].length === 1 ? lib.bgEmpty : lib.bgYellow; },
			getValue: function(v,data){
				return usedElements[data.elementId].length;
			},
			onClick: lib.defaultCellClick,
		},

		{
			key: 'adjustPencilThickness',
			header: 'PT',
			toolTip: function(v,data){ return data.adjustPencilThicknessToolTip },
			getBg: lib.bgSuccessYellow,
			onClick: lib.defaultCellClick,
		},

		{
			key: 'preserveLineThickness',
			header: 'PLT',
			toolTip: 'Preserve Line Thickness',
			getBg: lib.bgSuccessYellow,
			getValue: lib.outputYesNo,
			onClick: lib.defaultCellClick,
		}

	]), undefined, contentMaxHeight );
	
	return tableView;

}