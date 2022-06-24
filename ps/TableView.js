/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220412
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
    			
    			var bg = columnConfigItemData.getBg ? columnConfigItemData.getBg( val, itemData ) : undefined;
    			if( bg ) item.setBackground( bg );
    			
    			if( columnConfigItemData.toolTip ) item.setToolTip( typeof columnConfigItemData.toolTip === 'string' ? columnConfigItemData.toolTip : columnConfigItemData.toolTip(val, itemData) );

    			tableWidget.setItem(itemDataI, columnConfigItemDataI, item);

    		});

    	});

    	tableWidget.resizeColumnsToContents();
	}

    return tableWidget;
}
///
exports = TableView;