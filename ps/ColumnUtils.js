/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.220609
*/


///
exports = {
    getDrawingColumnOfNode: getDrawingColumnOfNode,
    eachDrawingColumn: eachDrawingColumn,
    eachDrawingColumnKey: eachDrawingColumnKey,
    getColumnEntries: getColumnEntries,
    clearExposures: clearExposures,
}

//
function getDrawingColumnOfNode(_node) {
    return node.linkedColumn(_node, "DRAWING.ELEMENT");
}


//
function eachDrawingColumn(_cb) {

    n = column.numberOf();

    for (columnI = 0; columnI < n; ++columnI) {
        var columnName = column.getName(columnI);
        if (column.type(columnName) !== "DRAWING") continue;
        var displayName = column.getDisplayName(columnName);
        // MessageLog.trace('displayName: '+columnName+' > '+displayName);
        var elementId = column.getElementIdOfDrawing(columnName);
        _cb(displayName, columnName, elementId, columnI);
    }

}


///
function eachDrawingColumnKey(_cb) {

    eachDrawingColumn(function(displayName, columnName, elementId, columnI) {
        // MessageLog.trace(i + " " + columnName + ' > ' + displayName + "; element = " + elementId );

        for (var j = 0; j < Drawing.numberOf(elementId); j++) {
            var exposureName = Drawing.name(elementId, j);
            _cb(displayName, columnName, elementId, exposureName, columnI)
            // MessageLog.trace('  - '+j+') '+exposureName);
        }
    });

}

//
function getColumnEntries(columnName) {

    var totalFrames = frame.numberOf();
    var entries = [];
    var prevEntry;
    var prevFrame;



    for (var f = 1; f < totalFrames; f++) {
        var entry = column.getEntry(columnName, 1, f);
        // MessageLog.trace(f + ') ' + entry);
        if (entry !== prevEntry) {
            if (prevEntry) {
                entries.push({
                    firstFrame: prevFrame,
                    lastFrame: f - 1,
                    entry: prevEntry
                });
            }
            prevEntry = entry;
            prevFrame = f;
        }
    }

    if (prevEntry) {
        entries.push({
            firstFrame: prevFrame,
            lastFrame: f - 1,
            entry: prevEntry
        });
    }

    return entries;

}


//
function  clearExposures( columnName, firstFrame, lastFrame ) {
	// MessageLog.trace('clearExposures'+firstFrame+' >'+lastFrame);
	for( var f=firstFrame; f<=lastFrame; f++ ){
		// MessageLog.trace('>'+f);
		column.setEntry( columnName, 1, f, '' );
		// column.removeKeyDrawingExposureAt( columnName, f );
	}
}