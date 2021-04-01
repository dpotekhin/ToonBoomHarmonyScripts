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
  
  var _this = this;

  // MessageLog.trace('pDrawing.getBox: '+JSON.stringify(_strokesLayers, true, '  ')+', '+JSON.stringify(_art, true, '  ')+', '+_frame );

  // if( !this.node ) return;

  var resultBox;

  this.iterateArts(function(art){

    var artStokes = _strokesLayers[art];
    // MessageLog.trace( art+' > '+JSON.stringify(artStokes,true,'  ') );
    

    artStokes.forEach(function(artStroke,artStroke_i){
      // MessageLog.trace( art+' ) '+artStroke_i+' > '+JSON.stringify(artStroke.strokes,true,'  ') );

      artStroke.strokes.forEach(function(stroke,stroke_i){
        //MessageLog.trace( art+' ) '+artStroke_i+' > '+stroke.path.length );
        
        var currentPoint;

        stroke.path.forEach(function(point,point_i){
          
          // MessageLog.trace( art+' ) '+artStroke_i+' > '+JSON.stringify(point,true,'  ') );
          
          if( point.onCurve ){ // Start or End point

            if( currentPoint ){ // The Point is not the very first

              if( currentPoint.length == 1 ){ // a stright line
                // MessageLog.trace('Line!!!');
                resultBox = Utils.joinBoxes( resultBox, _this.getLineBox( currentPoint[0], point ) );

              }else{ // a Bezier curve
                var box = _this.getBezierBox( currentPoint[0], currentPoint[1], currentPoint[2], point );
                // MessageLog.trace('Bezier: '+ JSON.stringify(box, true, '  ') );
                resultBox = Utils.joinBoxes( resultBox, box );
              }
              
            }

            currentPoint = [point];

          }else{
            currentPoint.push(point);
          }

        });

      });

    })
    
  });

  return resultBox;

}



//
pDrawing.prototype.getLineBox = function( p0, p1 ) {
  
  var result = {};

  if( p0.x < p1.x ){
    result.x0 = p0.x;
    result.x1 = p1.x;
  }else{
    result.x0 = p1.x;
    result.x1 = p0.x;
  }

  if( p0.y < p1.y ){
    result.y0 = p0.y;
    result.y1 = p1.y;
  }else{
    result.y0 = p1.y;
    result.y1 = p0.y;
  }

  return result;
}


//
pDrawing.prototype.getBezierBox = function(p0, p1, p2, p3) {

  var tvalues = [], xvalues = [], yvalues = [],
      a, b, c, t, t1, t2, b2ac, sqrtb2ac;
  for (var i = 0; i < 2; ++i) {
      if (i == 0) {
          b = 6 * p0.x - 12 * p1.x + 6 * p2.x;
          a = -3 * p0.x + 9 * p1.x - 9 * p2.x + 3 * p3.x;
          c = 3 * p1.x - 3 * p0.x;
      } else {
          b = 6 * p0.y - 12 * p1.y + 6 * p2.y;
          a = -3 * p0.y + 9 * p1.y - 9 * p2.y + 3 * p3.y;
          c = 3 * p1.y - 3 * p0.y;
      }
      if (Math.abs(a) < 1e-12) {
          if (Math.abs(b) < 1e-12) {
              continue;
          }
          t = -c / b;
          if (0 < t && t < 1) {
              tvalues.push(t);
          }
          continue;
      }
      b2ac = b * b - 4 * c * a;
      if (b2ac < 0) {
          if (Math.abs(b2ac) < 1e-12) {
              t = -b / (2 * a);
              if (0 < t && t < 1) {
                  tvalues.push(t);
              }
          }
          continue;
      }
      sqrtb2ac = Math.sqrt(b2ac);
      t1 = (-b + sqrtb2ac) / (2 * a);
      if (0 < t1 && t1 < 1) {
          tvalues.push(t1);
      }
      t2 = (-b - sqrtb2ac) / (2 * a);
      if (0 < t2 && t2 < 1) {
          tvalues.push(t2);
      }
  }

  var j = tvalues.length, mt;
  while (j--) {
      t = tvalues[j];
      mt = 1 - t;
      xvalues[j] = (mt * mt * mt * p0.x) + (3 * mt * mt * t * p1.x) + (3 * mt * t * t * p2.x) + (t * t * t * p3.x);
      yvalues[j] = (mt * mt * mt * p0.y) + (3 * mt * mt * t * p1.y) + (3 * mt * t * t * p2.y) + (t * t * t * p3.y);
  }

  xvalues.push(p0.x,p3.x);
  yvalues.push(p0.y,p3.y);

  return {
      x0: Math.min.apply(0, xvalues),
      y0: Math.min.apply(0, yvalues),
      x1: Math.max.apply(0, xvalues),
      y1: Math.max.apply(0, yvalues)
  };

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