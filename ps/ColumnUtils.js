/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.220609
*/


///
exports = {
    eachDrawingColumn: eachDrawingColumn,
    eachDrawingColumnKey: eachDrawingColumnKey,
}

//
function eachDrawingColumn( _cb ){

	n = column.numberOf();

    for (columnI = 0; columnI < n; ++columnI) {
        var columnName = column.getName(columnI);
        if (column.type(columnName) !== "DRAWING") continue;
        var displayName = column.getDisplayName(columnName);
        // MessageLog.trace('displayName: '+columnName+' > '+displayName);
        var elementId = column.getElementIdOfDrawing(columnName);
        _cb( displayName, columnName, elementId, columnI );
    }

}


///
function eachDrawingColumnKey( _cb ) {

    eachDrawingColumn(function( displayName, columnName, elementId, columnI ){
    	// MessageLog.trace(i + " " + columnName + ' > ' + displayName + "; element = " + elementId );

        for (var j = 0; j < Drawing.numberOf(elementId); j++) {
            var exposureName = Drawing.name(elementId, j);
            _cb( displayName, columnName, elementId, exposureName, columnI )
            // MessageLog.trace('  - '+j+') '+exposureName);
        }
    });
        
}