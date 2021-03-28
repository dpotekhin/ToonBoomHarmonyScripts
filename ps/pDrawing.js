var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));


//
function pDrawing( _node ){

  //
  this.TEMP_ENTRY_NAME = '___temp___';

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
  
  if( !this.node ) return;

  var settings = Tools.getToolSettings();
  if (!settings.currentDrawing) return;
  
  this.selectedToolSettings = settings;
  // MessageLog.trace('pDrawing.getSelectedToolSettings: '+JSON.stringify(settings,true,'  '));
  return settings;

}


//
pDrawing.prototype.getSelectedStrokesLayers = function(){

  var settings = this.getSelectedToolSettings();
  if(!settings) return;

  var config = {
    node: this.node,
    drawing  : settings.currentDrawing,
    // art : settings.activeArt
  };

  var selectedStrokesLayers = [];

  // for(var art=0; art<4; art++){
  this.iterateArts(function(art){
    
    config.art = art;

    //
    var selectedStrokes = Drawing.selection.get(config);
    var selectedLayers = selectedStrokes.selectedLayers;
    // MessageLog.trace('pDrawing.getSelectedStrokesLayers: '+JSON.stringify(selectedStrokes, true, '  ') );

    //
    var strokes = Drawing.query.getStrokes(config);
    selectedStrokesLayers.push( strokes.layers.filter(function(_layer){ return selectedLayers.indexOf(_layer.index) !== -1; }) );
    // MessageLog.trace('pDrawing.getSelectedStrokesLayers: '+JSON.stringify(selectedStrokesLayers, true, '  ') );
  });

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
pDrawing.prototype.toggleTempEntry = function( _toggle, _frame ){

  if( _toggle ){

    this.originalEntry = this.getEntry( _frame );
    this.setEntry( this.TEMP_ENTRY_NAME, _frame );
    return true;

  }else if(this.originalEntry){

    this.setEntry( this.originalEntry, _frame );
    this.originalEntry = undefined;
    return true;

  }

}


//
pDrawing.prototype.deleteTempEntry = function(){
  MessageLog.trace('pDrawing.deleteTempEntry in not implemented yet');
}


//
pDrawing.prototype.clearArt = function( _art, _frame ){
   
  if( !this.node ) return;

  var toolConfig = {
    drawing : {node: this.node, frame: this.validateFrame(_frame) },
    art: _art,
    // label: '---'
  };

  if(_art === true ){
    
    this.iterateArts(function(art){
      toolConfig.art = art;
      DrawingTools.clearArt(toolConfig);
    });
    
    return;

  }

  DrawingTools.clearArt(toolConfig);
  

};



/*
Uses temporary layer to get geometry box.

*/
pDrawing.prototype.getStrokesBox = function( _strokesLayers, _frame ){
  
  // MessageLog.trace('pDrawing.getBox: '+JSON.stringify(_strokesLayers, true, '  ')+', '+JSON.stringify(_art, true, '  ')+', '+_frame );

  if( !this.node ) return;

  var _strokesLayers;

  this.toggleTempEntry( true ); // Switch the current Entry to temporary  
  this.clearArt( true, _frame ); // Clear the temp Entry

  var toolSettings = {
    drawing : {node: this.node, frame: this.validateFrame( _frame )}
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
  
  this.clearArt( true, _frame ); // // Clear the temp Entry
  this.toggleTempEntry( false ); // Switch the current Entry back to the origin

  return resultBox;

}



//
pDrawing.prototype.modifyArtStrokes = function( _art, _strokesLayers, _modifyAction, _frame ){

  if( !this.node || _art === undefined || !_strokesLayers ) return;

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
    drawing : {node: this.node, frame: this.validateFrame(_frame) },
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