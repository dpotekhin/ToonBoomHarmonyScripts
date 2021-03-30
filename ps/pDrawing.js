/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1

ToDo:
- 

*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));


//
function pDrawing( _node ){

  //
  this.TEMP_ENTRY_NAME = '___temp___';
  this.tempDrawingId = undefined;

  this.node = undefined;
  this.columnId = undefined;
  this.elementId = undefined;
  this.currentDrawing = undefined;

  //
  this.setNode( _node );

};



//
pDrawing.prototype.setNode = function( _node ){
  
  if(!_node) return;

  if( _node === true ){// use selection
    _node = selection.selectedNodes(0);
  }

  if( !_node || node.type( _node ) !== "READ" ) return;
  // MessageLog.trace( 'Selected Drawing: '+_node );
  this.node = _node;

  this.columnId = node.linkedColumn(this.node, "DRAWING.ELEMENT");

  this.getSelectedToolSettings();

}


pDrawing.prototype.iterateArts = function( callback ){
  for(var art=0; art<4; art++){
    callback(art);
  }
}


///
pDrawing.prototype.getSelectedToolSettings = function(){
  
  // if( !this.node ) return;

  var settings = Tools.getToolSettings();
  if (!settings.currentDrawing) return;
  
  this.selectedToolSettings = settings;
  this.currentDrawing = settings.currentDrawing;
  this.elementId = settings.currentDrawing.elementId;
  this.drawingId = settings.currentDrawing.drawingId;
  
  return settings;

}


//
pDrawing.prototype.getSelectedStrokesLayers = function(){

  this.getSelectedToolSettings();
  if(!this.currentDrawing) return;

  var config = {
    // node: this.node,
    drawing  : this.currentDrawing,
    // art : settings.activeArt
  };

  // MessageLog.trace('pDrawing.getSelectedStrokesLayers: config: '+JSON.stringify(config, true, '  ') );

  var selectedStrokesLayers = [];
  var selectedStrokeLayerCount = 0;
  // for(var art=0; art<4; art++){
  this.iterateArts(function(art){
    
    config.art = art;

    //
    var selectedStrokes = Drawing.selection.get(config);
    var selectedLayers = selectedStrokes.selectedLayers;
    if( !selectedStrokes.selectedStrokes.length ){
      selectedStrokesLayers.push([]);
      return;
    }
    // MessageLog.trace('pDrawing.getSelectedStrokesLayers: '+JSON.stringify(selectedStrokes, true, '  ') );

    //
    var strokes = Drawing.query.getStrokes(config);
    var strokeLayers = strokes.layers.filter(function(_layer){ return selectedLayers.indexOf(_layer.index) !== -1; });
    selectedStrokesLayers.push( strokeLayers );
    selectedStrokeLayerCount += strokeLayers.length;
    // MessageLog.trace('pDrawing.getSelectedStrokesLayers: '+JSON.stringify(selectedStrokesLayers, true, '  ') );
  });

  if( !selectedStrokeLayerCount ) return;

  this.selectedStrokesLayers = selectedStrokesLayers;

  return selectedStrokesLayers;

}



//
pDrawing.prototype.validateFrame = function( _frame ){
  return _frame === undefined ? frame.current() : _frame;
}


//
pDrawing.prototype.getEntry = function( _frame ){
  if( !this.columnId ) return;
  return column.getEntry( this.columnId, 1, this.validateFrame(_frame) );
}



//
pDrawing.prototype.setEntry = function( entryName, _frame ){
  if( !this.columnId ) return;
  return column.setEntry(this.columnId, 1, this.validateFrame(_frame), entryName );
}



//
pDrawing.prototype.createTempDrawing = function(){

  if(!this.elementId) return;

  var drawingKey = Drawing.Key({ elementId : this.elementId, exposure : this.TEMP_ENTRY_NAME });
  if(!drawingKey){
    Drawing.create( this.elementId, this.TEMP_ENTRY_NAME, true);
  }
  drawingKey = Drawing.Key({ elementId : this.elementId, exposure : this.TEMP_ENTRY_NAME });
  if(drawingKey){
    this.tempDrawingId = drawingKey.drawingId;
    return true;
  }

}


//
pDrawing.prototype.deleteTempEntry = function(){
  MessageLog.trace('pDrawing.deleteTempEntry in not implemented yet');
}


//
pDrawing.prototype.clearArtByDrawingId = function( _art, _drawingId ){
  
  if( _drawingId === undefined || this.elementId === undefined  ) return;
  this._clearArt( _art, { elementId: this.elementId, drawingId: _drawingId } );

};


//
pDrawing.prototype.clearArtByFrame = function( _art, _frame ){

  if( !_frame || !this.node ) return;
  this._clearArt( _art, {node: this.node, frame: this.validateFrame(_frame) } );

}


//
pDrawing.prototype._clearArt = function( _art, _drawingDescriptor ){

  var toolConfig = {
    drawing : _drawingDescriptor,
    art: _art
  };

  if(_art === true ){
    
    this.iterateArts(function(art){
      toolConfig.art = art;
      DrawingTools.clearArt(toolConfig);
    });
    
    return;

  }

  DrawingTools.clearArt(toolConfig);

}


/*
Uses temporary layer to get geometry box.

ToDo:
- ! for some reason, after the first creation of a temporary sub, the Box2d is calculated only when switching to a temporary sub and back
- remove the Temp Drawing after calculation?

*/
pDrawing.prototype.getStrokesBox = function( _strokesLayers ){
  
  // MessageLog.trace('pDrawing.getBox: '+JSON.stringify(_strokesLayers, true, '  ')+', '+JSON.stringify(_art, true, '  ')+', '+_frame );

  // if( !this.node ) return;

  var _strokesLayers;

  this.createTempDrawing(); // Switch the current Entry to temporary  
  this.clearArtByDrawingId( true, this.tempDrawingId ); // Clear the temp Entry

  var toolSettings = {
    // drawing : {node: this.node, frame: this.validateFrame( _frame )}
    // drawing  : this.selectedToolSettings.currentDrawing,
    drawing: { elementId: this.elementId, drawingId: this.tempDrawingId }
  };

  var resultBox;

  this.iterateArts(function(art){

    toolSettings.art = art;
    toolSettings.layers = _strokesLayers[art];

    DrawingTools.createLayers( toolSettings ); // Copy strokes to the temp Entry
    var box = Drawing.query.getBox(toolSettings); // Get the Box of the temp Entry
    // MessageLog.trace('box: '+art+' : '+JSON.stringify(box,true,' '));
    resultBox = Utils.joinBoxes( resultBox, box );

  });

  this.clearArtByDrawingId( true, this.tempDrawingId ); // // Clear the temp Entry

  return resultBox;

}



//
pDrawing.prototype.modifyArtStrokes = function( _art, _strokesLayers, _modifyAction, _frame ){

  // if( !this.node || _art === undefined || !_strokesLayers ) return;
  if( !this.selectedToolSettings.currentDrawing || _art === undefined || !_strokesLayers ) return;

  var modifiedStrokes = [];

  _strokesLayers.forEach(function(_strokeLayer){

    _strokeLayer.strokes.forEach(function( _cStroke, _cStroke_i ){
      
      if( !_modifyAction( _cStroke, _strokeLayer ) ) return;

      modifiedStrokes.push({
        layer: _strokeLayer.index,
        strokeIndex : _cStroke_i,
        path: _cStroke.path,
        closed: _cStroke.closed,
        polygon: _cStroke.polygon,
      });

    });
  
  });

  // MessageLog.trace('\n================\n_strokesLayers: '+JSON.stringify(_strokesLayers, true, '  ') );

  if( !modifiedStrokes.length ) return;

  var modifyStrokesSettings = {
    // drawing : {node: this.node, frame: this.validateFrame(_frame) },
    drawing  : this.selectedToolSettings.currentDrawing,
    art: _art,
    label: 'Modify strokes',
    strokes : modifiedStrokes
  }

  // MessageLog.trace('\n================\nmodifyStrokesSettings: '+JSON.stringify(modifyStrokesSettings, true, '  ') );

  DrawingTools.modifyStrokes(modifyStrokesSettings);

  return true;

}

///
exports = pDrawing;