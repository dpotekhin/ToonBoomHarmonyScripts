/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.220602
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));

///
var COLORART = 1;
var LINEART = 2;

///
exports = {
    findDrawingsByColor: findDrawingsByColor,
    getSelectedColor: getSelectedColor,
    eachDrawingColumn: eachDrawingColumn,
}

//
function findDrawingsByColor( colorId ) {

	var foundColumnKeys = {};

    eachDrawingColumnKey(function( displayName, columnName, elementId, exposureName, drawingI ){

    	var drawingKey = Drawing.Key({ elementId: elementId, exposure: exposureName });
        // MessageLog.trace('  ---- '+drawingKey.isValid);
        var colors = DrawingTools.getDrawingUsedColorsWithSource(drawingKey);
        colors.forEach(function(colorData){
        	if( colorData.colorId === colorId ){
        		// MessageLog.trace( 'FOUND: '+ columnName+', '+elementId);
        		if( !foundColumnKeys[columnName] ) foundColumnKeys[columnName] = [];
        		foundColumnKeys[columnName].push({
        			columnName: columnName,
        			displayName: displayName,
        			elementId: elementId,
        			exposureName: exposureName,
        		});
        	}
        })
        // MessageLog.trace(JSON.stringify(colors, true, '  '));
    });
    
    return foundColumnKeys;

}

//
function getSelectedColor(){
	// Get the selected color
    var palletteId = PaletteManager.getCurrentPaletteId();
    var colorId = PaletteManager.getCurrentColorId();
    // MessageLog.trace('findDrawingsByColor:' + palletteId + ', ' + colorId);

    return {
    	palletteId: palletteId,
    	colorId: colorId
    }

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