/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220630
*/


//
//
function TableView( arr, columnConfig, uiParent, minHeight ){

	var _this = this;
	var tableWidget = new QTableWidget(this);
	tableWidget.cellClicked.connect( function(r,c){
		if( !_this.arr || !_this.columnConfig ) return;
		var columnConfigData = _this.columnConfig[c];
		if( columnConfigData.onClick ) columnConfigData.onClick( _this.arr[r], columnConfigData.key );
		// MessageLog.trace('click '+r+', '+c);
	});

	if( arr ) init( arr, columnConfig );
	if( uiParent ) uiParent.mainLayout.addWidget( tableWidget, 0, 0 );

	//
	function init( arr, columnConfig ){

		_this.arr = arr;
		_this.columnConfig = columnConfig;
		tableWidget.rowCount = arr.length;
    	tableWidget.columnCount = columnConfig.length;
    	tableWidget.setHorizontalHeaderLabels( columnConfig.map(function( itemcolumnConfig, i ){ return itemcolumnConfig.header || i+1; }) );
        if( minHeight ) tableWidget.minimumHeight = minHeight;

    	arr.forEach(function(itemData, itemDataI){
    		
    		columnConfig.forEach(function(columnConfigItemData,columnConfigItemDataI){
    			
    			var val = itemData[columnConfigItemData.key];
    			
    			var item = new QTableWidgetItem( '' + ( columnConfigItemData.getValue ? columnConfigItemData.getValue( val, itemData ) : val ) || '', 0 );
                item.setFlags(item.flags() ^ Qt.ItemIsEditable);
    			
    			var bg = columnConfigItemData.getBg ? ( typeof columnConfigItemData.getBg === 'function' ? columnConfigItemData.getBg( val, itemData ) : columnConfigItemData.getBg ) : undefined;
    			if( bg ) item.setBackground( bg );
    			
    			if( columnConfigItemData.toolTip !== undefined ) {
    				var toolTip = columnConfigItemData.toolTip;
    				if( columnConfigItemData.toolTip === true ) toolTip = val;
    				else if ( typeof columnConfigItemData.toolTip !== 'string' ) toolTip = columnConfigItemData.toolTip(val, itemData);
    				if( toolTip ) item.setToolTip( toolTip );
    			}

    			tableWidget.setItem(itemDataI, columnConfigItemDataI, item);

    		});

    	});

    	tableWidget.resizeColumnsToContents();
	}

    return tableWidget;
}
///
exports = TableView;