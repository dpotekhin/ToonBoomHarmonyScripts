/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.2

ToDo:
- 

*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var pBox2D = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pBox2D.js"));


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
  var currentSelectionData = [];

  // for(var art=0; art<4; art++){
  this.iterateArts(function(art){
    
    config.art = art;

    //
    var selectionData = Drawing.selection.get(config);
    var selectedLayers = selectionData.selectedLayers;
    if( !selectionData.selectedStrokes.length ){
      selectedStrokesLayers.push([]);
      return;
    }
    
    var hasSelectedAnchors = !!selectionData.selectedAnchors;
    currentSelectionData.push(selectionData);

    //
    var strokes = Drawing.query.getStrokes(config);

    //
    // MessageLog.trace('\n\n pDrawing.getSelectedStrokesLayers: selectionData: '+JSON.stringify(selectionData, true, '  ') );
    // MessageLog.trace('\n\n pDrawing.getSelectedStrokesLayers: strokes: '+JSON.stringify(strokes, true, '  ') );
    //
    
    var strokeLayers = strokes.layers.filter(function(_layer,i){

      if( selectedLayers.indexOf(_layer.index) === -1 ) return false; // skip the current layer if it is not in the selection list

      // Check that layers's vertices are selected
      selectionData.selectedStrokes.forEach(function(__stroke){

        if( __stroke.layer !== _layer.index ) return;
        if( __stroke.selectedAnchors && !__stroke.selectedAnchors.length ) return;

        _layer.strokes[__stroke.strokeIndex].isSelected = true; // mark stroke as Selected
        // MessageLog.trace('!!! '+__stroke.strokeIndex+', '+JSON.stringify(_layer.strokes[__stroke.strokeIndex],true,'  ') );

        if( hasSelectedAnchors && !_layer.strokes[0].selectedAnchors ) _layer.strokes.forEach(function(_stroke){
          _stroke.selectedAnchors = [];
        });

        if( __stroke.selectedAnchors ) __stroke.selectedAnchors.forEach(function(_anchor){

          var _strokes = _layer.strokes[__stroke.strokeIndex];
          var selectedAnchors = _strokes.selectedAnchors;
          // MessageLog.trace('\n\n >>> '+__stroke.strokeIndex+' >>> '+JSON.stringify(_layer.strokes, true, '  ') );
          selectedAnchors.push(_anchor);
          
          var vertexData = _strokes.path[_anchor.vertexIndex];
          vertexData.isSelected = true;

          // mark the Control vertices
          var prevControl = _strokes.path[_anchor.vertexIndex-1];
          if( prevControl && !prevControl.onCurve ){
            prevControl.isSelectedControl = true;
            vertexData.prevControl = _anchor.vertexIndex-1;
          }
          
          var nextControl = _strokes.path[_anchor.vertexIndex+1];
          if( nextControl && !nextControl.onCurve ){
            nextControl.isSelectedControl = true;
            vertexData.nextControl = _anchor.vertexIndex+1;
          }

        });
        

      });

      return true;

    });

    selectedStrokesLayers.push( strokeLayers );
    selectedStrokeLayerCount += strokeLayers.length;

  });

  if( !selectedStrokeLayerCount ) return;

  this.selectedStrokesLayers = selectedStrokesLayers;
  this.currentSelectionData = currentSelectionData;
  // MessageLog.trace('\n\n pDrawing.getSelectedStrokesLayers: selectedStrokesLayers: '+JSON.stringify(selectedStrokesLayers, true, '  ') );

  return selectedStrokesLayers;

}


//
pDrawing.prototype.restoreSelection = function(){

  if( !this.currentSelectionData ) return;

  this.currentSelectionData.forEach(function(_currentSelectionData){
    Drawing.selection.set(_currentSelectionData);
  });

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
pDrawing.prototype.getStrokesBox = function( _strokesLayers, useOnlySelectedStrokes ){
  
  var _this = this;

  // MessageLog.trace('pDrawing.getBox: '+JSON.stringify(_strokesLayers, true, '  ')+', '+JSON.stringify(_art, true, '  ')+', '+_frame );

  // if( !this.node ) return;

  var resultBox = new pBox2D();
  var maxWidthBox;
  var maxHeightBox;
  var maxBox;

  this.iterateArts(function(art){

    var artStokes = _strokesLayers[art];
    // MessageLog.trace( art+' > '+JSON.stringify(artStokes,true,'  ') );
    

    artStokes.forEach(function(artStroke,artStroke_i){
      // MessageLog.trace( art+' ) '+artStroke_i+' > '+JSON.stringify(artStroke.strokes,true,'  ') );

      artStroke.strokes.forEach(function(stroke,stroke_i){
        //MessageLog.trace( art+' ) '+artStroke_i+' > '+stroke.path.length );
        
        if( useOnlySelectedStrokes && !stroke.isSelected ) return;

        var currentPoint;

        if( stroke.selectedAnchors ){ // Some vertex is selected

          stroke.selectedAnchors.forEach(function(selectedPoint){
            
            resultBox.addPoint( selectedPoint.x, selectedPoint.y );

          });          

        }else{ // Whole stroke is selected
          
          var strokeBox = new pBox2D();

          stroke.path.forEach(function(point,point_i){
            
            // MessageLog.trace( art+' ) '+artStroke_i+' > '+JSON.stringify(point,true,'  ') );
            
            if( point.onCurve ){ // Start or End point

              if( currentPoint ){ // The Point is not the very first

                if( currentPoint.length == 1 ){ // a stright line
                  // MessageLog.trace('Line!!!');
                  strokeBox.addBox( pBox2D.getLineBox( currentPoint[0], point ) );
                  // MessageLog.trace('Line!!! '+ JSON.stringify(resultBox,true,'  '));

                }else{ // a Bezier curve
                  var box = pBox2D.getBezierBox( currentPoint[0], currentPoint[1], currentPoint[2], point );
                  // MessageLog.trace('Bezier: '+ JSON.stringify(box, true, '  ') );
                  strokeBox.addBox( box );
                  // MessageLog.trace('Bezier!!! '+ JSON.stringify(resultBox,true,'  '));
                }
                
              }

              currentPoint = [point];

            }else{
              if( currentPoint ) currentPoint.push(point);
              else currentPoint = [point];
            }

          });

          stroke.strokeBox = strokeBox;
          resultBox.addBox( strokeBox );

          if( !maxWidthBox || maxWidthBox.width < strokeBox.width ) maxWidthBox = strokeBox;
          if( !maxHeightBox || maxHeightBox.height < strokeBox.height ) maxHeightBox = strokeBox;
          if( !maxBox || ( maxWidthBox.width + maxBox.height < strokeBox.width + strokeBox.height ) ) maxBox = strokeBox;

        }

      });

    })
    
  });

  resultBox.maxWidthBox = maxWidthBox;
  resultBox.maxHeightBox = maxHeightBox;
  resultBox.maxBox = maxBox;
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