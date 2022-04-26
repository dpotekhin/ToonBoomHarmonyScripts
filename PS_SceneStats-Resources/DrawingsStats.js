/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220412
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
function DrawingsStats( selectedNodes, modal, lib ){

	// Generate the Table
	
	// Group
	var style = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
  	var uiGroup = modal.addGroup( 'DRAWINGS', modal.ui, true, style );
  	// Collect Data
	var drawings = NodeUtils.getAllChildNodes( selectedNodes, 'READ' );
	if( !drawings.length ) return;
	drawings = drawings
		.map(function(n,i){
			// MessageLog.trace( Utils.rgbToHex( node.getColor(n) ) );
			MessageLog.trace( node.linkedColumn(n, "DRAWING.ELEMENT") );

			var elementId = node.getElementId(n);
			var DrawingSubstitutionCount = Drawing.numberOf(elementId);

			return {
				index: i+1,
				path: n,
				name: node.getName(n),
				parent: node.parentNode(n),
				enabled: node.getEnable(n),
				color: Utils.rgbToHex( node.getColor(n), true ),
				canAnimate: node.getTextAttr( n, 1, 'CAN_ANIMATE' ) === 'Y',
				enable3d: node.getTextAttr( n, 1, 'ENABLE_3D' ) === 'Y',
				element: ''+node.getElementId(n),
				DSCount: ''+DrawingSubstitutionCount,
			};
		})
		.sort(function(a,b){ 
		    if(a.parent < b.parent) return -1;
		    if(a.parent > b.parent) return 1;
		    return 0;
		})
	;

	MessageLog.trace( JSON.stringify(drawings, true, '  ') );

	var tableView = new TableView( drawings, [

		{
			key: 'color',
			header: 'Col',
			toolTip: 'Node Color',
			getBg: function (v) { return v ? new QBrush( new QColor( '#'+v ) ) : undefined; },
			getValue: function (v) { return v==='000000' ? 'No' : ''; },
			onClick: lib.showNodeProperties
		},

		{
			key: 'enabled',
			header: 'Enb',
			toolTip: 'Node Enabled',
			getValue: lib.outputYesNo,
			getBg: lib.bgSuccessOrFail,
			onClick: lib.showNodeProperties,
		},

		{
			key: 'parent',
			header: 'GROUP',
		},

		{
			key: 'name',
			header: 'Name',
			getBg: function(v,data) {
				return data.DSCount == 0 ? lib.bgFail : undefined;
			},
			onClick: function ( data, columnName ) {
				// MessageLog.trace( 'CLICKED Name: '+columnName+' >> '+JSON.stringify(data,true,'  ') );
				MessageLog.trace( data.path );
				MessageLog.trace( Utils.getFullAttributeList( data.path, 1, true ).join('\n') );

				lib.showNodeProperties( data );
			},
		},

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
		}

	], uiGroup );
	

}

///
exports = DrawingsStats;