/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220810
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var pDrawing = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pDrawing.js"));
var pBox2D = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pBox2D.js"));

//
var _exports = {
  MODE_ALIGN_LEFT: 'align-left',
  MODE_ALIGN_H_CENTER: 'align-h-center',
  MODE_ALIGN_RIGHT: 'align-right',
  MODE_ALIGN_CENTER: 'align-center',
  MODE_ALIGN_TOP: 'align-top',
  MODE_ALIGN_V_CENTER: 'align-v-center',
  MODE_ALIGN_BOTTOM: 'align-bottom',
  AlignShapes: AlignShapes,
  AlignLeft: AlignLeft,
  AlignHCenter: AlignHCenter,
  AlignRight: AlignRight,
  AlignCenter: AlignCenter,
  AlignTop: AlignTop,
  AlignVCenter: AlignVCenter,
  AlignBottom: AlignBottom,
  FlipHCenter: FlipHCenter,
  FlipVCenter: FlipVCenter,
  Merge: Merge,
  SetPivot: SetPivot,
  Rotate: Rotate,
  Randomize: Randomize,
  setSize: setSize,
  setWidth: setWidth,
  setHeight: setHeight,
  getSize: getSize,
};


// Horizontal Align
function AlignLeft( centerX ){
  AlignShapes( _exports.MODE_ALIGN_LEFT, centerX );
}

//
function AlignHCenter( centerX ){
  AlignShapes( _exports.MODE_ALIGN_H_CENTER, centerX );
}

//
function AlignRight( centerX ){
  AlignShapes( _exports.MODE_ALIGN_RIGHT, centerX );
}

//
function AlignCenter( centerX, centerY ){
  AlignShapes( _exports.MODE_ALIGN_CENTER, centerX, centerY );
}

// Vertical Align
function AlignTop( centerY ){
  AlignShapes( _exports.MODE_ALIGN_TOP, undefined, centerY );
}

//
function AlignVCenter( centerY ){
  AlignShapes( _exports.MODE_ALIGN_V_CENTER, undefined, centerY );
}

//
function AlignBottom( centerY ){
  AlignShapes( _exports.MODE_ALIGN_BOTTOM, undefined, centerY );
}



//
function getSelectionData(){

  var selectedDrawing = new pDrawing( true );
  var selectedStrokesLayers = selectedDrawing.getSelectedStrokesLayers();
  if( !selectedStrokesLayers ) {
    MessageLog.trace('No strokes selected.');
    return;
  }

  // MessageLog.trace('selectedStrokesLayers >> 0:'+selectedStrokesLayers[0].length+', 1:'+selectedStrokesLayers[1].length+', 2:'+selectedStrokesLayers[2].length+', 3:'+selectedStrokesLayers[3].length);
  // return;

  var box = selectedDrawing.getStrokesBox( selectedStrokesLayers, true );
  if( box.width === undefined ) {
    MessageLog.trace('!!! box is empty: '+ JSON.stringify(box, true, '  ') );
    return;
  }

  return {
    selectedDrawing: selectedDrawing,
    selectedStrokesLayers: selectedStrokesLayers,
    box: box
  };

}


//
function AlignShapes( mode, centerX, centerY ){


  // !!!
  // MessageLog.clearLog(); // !!!
  // MessageLog.trace('Drawing/geometry: '+ Object.getOwnPropertyNames(Tools).join('\n') );
  // MessageLog.trace('AlignShapes: X:'+ centerX +' Y:'+centerY );

  scene.beginUndoRedoAccum("Align shape");

  try{

    var selectionData = getSelectionData();
    if( !selectionData ) {
      scene.endUndoRedoAccum();
      return;
    }

    var selectedDrawing = selectionData.selectedDrawing;
    var selectedStrokesLayers = selectionData.selectedStrokesLayers;
    var totalBox = selectionData.box;
    var boxCenter = totalBox.center;
    
    var targetBox = totalBox.maxBox;

    if( centerX !== undefined || centerY !== undefined ){ // relative to a point
      
      targetBox = new pBox2D( centerX || 0, centerY || 0 );

    }else{

      if( mode === _exports.MODE_ALIGN_LEFT || mode === _exports.MODE_ALIGN_H_CENTER || mode === _exports.MODE_ALIGN_RIGHT )
        targetBox = totalBox.maxWidthBox;
      else if( mode === _exports.MODE_ALIGN_TOP || mode === _exports.MODE_ALIGN_V_CENTER || mode === _exports.MODE_ALIGN_BOTTOM )
        targetBox = totalBox.maxHeightBox;
    }
    
    // MessageLog.trace('AlignShapes: '+ JSON.stringify(totalBox, true, '  ')+' targetBox:'+JSON.stringify(targetBox,true,'  ') );

    if( !targetBox ){
      MessageLog.trace('Error: targetBox is empty'); // TODO: why?
      scene.endUndoRedoAccum();
      return;
    }

    function _getXOffset( box ){

      switch( mode ){

        case _exports.MODE_ALIGN_LEFT:
          return box.x0 - targetBox.x0;
          // MessageLog.trace('MODE_ALIGN_LEFT '+ box.x0 +' - '+ totalBox.maxWidthBox.x0 +" = "+offsetX );

        case _exports.MODE_ALIGN_CENTER:
          return box.x0 + box.width / 2 - (targetBox.x0 + targetBox.width / 2);

        case _exports.MODE_ALIGN_H_CENTER:
          return box.x0 + box.width / 2 - (targetBox.x0 + targetBox.width / 2);

        case _exports.MODE_ALIGN_RIGHT:
          return box.x0 - targetBox.x1 + box.width;
      }

      return 0;

    };

    function _getYOffset( box ){

      switch( mode ){

        case _exports.MODE_ALIGN_TOP:
          return box.y0 - targetBox.y1 + box.height;

        case _exports.MODE_ALIGN_CENTER:
          return box.y0 + box.height / 2 - (targetBox.y0 + targetBox.height / 2);

        case _exports.MODE_ALIGN_V_CENTER:
          return box.y0 + box.height / 2 - (targetBox.y0 + targetBox.height / 2);

        case _exports.MODE_ALIGN_BOTTOM:
          return box.y0 - targetBox.y0;
      }

      return 0;

    };

    // var boxCenter = box.center;
    var offsetX = _getXOffset(totalBox);
    // if( centerX !== undefined ) offsetX -= centerX;
    var offsetY = _getYOffset(totalBox);
    // if( centerY !== undefined ) offsetY -= centerY;

    selectedDrawing.iterateArts(function(art){

      selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
              
        if( !_stroke.isSelected ) return;

        var hasSelectedAnchors = !!_stroke.selectedAnchors;

        if( centerX === undefined && centerY === undefined ){
          offsetX = _getXOffset( _stroke.strokeBox );
          offsetY = _getYOffset( _stroke.strokeBox );
        }

        _stroke.path.forEach(function(pathPoint){
          // MessageLog.trace('>>'+pathPoint.x+', '+pathPoint.y);
          if( hasSelectedAnchors && !pathPoint.isSelected && !pathPoint.isSelectedControl ) return;

          pathPoint.x -= offsetX;
          pathPoint.y -= offsetY;

        });

        // MessageLog.trace('bounds: '+ JSON.stringify(bounds, true, ' ') );
        // MessageLog.trace('_stroke: '+ JSON.stringify(_stroke, true, ' ') );
        return true;
      });

    });

  } catch(err){
    MessageLog.trace('Error: '+err );
  }

  //
  selectedDrawing.restoreSelection();

  scene.endUndoRedoAccum();

}



//
function FlipCenter( horizontally, centerX, centerY ){

  scene.beginUndoRedoAccum("Flip shape");

  // try{
    var selectionData = getSelectionData();
    if( !selectionData ) {
      scene.endUndoRedoAccum();
      return;
    }

    centerX = (centerX || 0) * 2;
    centerY = (centerY || 0) * 2;

    var selectedDrawing = selectionData.selectedDrawing;
    var selectedStrokesLayers = selectionData.selectedStrokesLayers;
    var box = selectionData.box;
    // var boxCenter = box.center;

    selectedDrawing.iterateArts(function(art){

      selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
        
        if( !_stroke.isSelected ) return;

        var hasSelectedAnchors = !!_stroke.selectedAnchors;

        _stroke.path.forEach(function(pathPoint){

          if( hasSelectedAnchors && !pathPoint.isSelected && !pathPoint.isSelectedControl ) return;

          if( horizontally ) pathPoint.x = -pathPoint.x + centerX;
          else pathPoint.y = -pathPoint.y + centerY;

        });

        return true;

      });

    });

  // } catch(err){
  //   MessageLog.trace('Error: '+err );
  // }

  selectedDrawing.restoreSelection();

  scene.endUndoRedoAccum();

}

function FlipHCenter( centerX ){
  FlipCenter( true, centerX );
}

//
function FlipVCenter( centerY ){
  FlipCenter( false, undefined, centerY );
}



//
function Merge( mergeControlPoints ){

  scene.beginUndoRedoAccum("Merge");

  // try{

    var selectionData = getSelectionData();
    if( !selectionData ) {
      scene.endUndoRedoAccum();
      return;
    }

    var selectedDrawing = selectionData.selectedDrawing;
    var selectedStrokesLayers = selectionData.selectedStrokesLayers;
    var box = selectionData.box;
    var boxCenter = box.center;

    selectedDrawing.iterateArts(function(art){

      selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
        
        if( !_stroke.selectedAnchors ) return;

        _stroke.path.forEach(function(pathPoint){

          if( !(pathPoint.isSelected || (mergeControlPoints && pathPoint.isSelectedControl) ) ) return;
          
          pathPoint.x = boxCenter.x;
          pathPoint.y = boxCenter.y;

        });

        return true;
      });

    });

  // } catch(err){
  //   MessageLog.trace('Error: '+err );
  // }

  //
  selectedDrawing.restoreSelection();

  scene.endUndoRedoAccum();

}


//
function SetPivot( ){

  MessageLog.clearLog(); // !!!

  scene.beginUndoRedoAccum("Set Pivot");

  try{

    var selectionData = getSelectionData();
    if( !selectionData ) {
      throw 'Valid Selection required.';
    }

    var selectedDrawing = selectionData.selectedDrawing;
    var selectedStrokesLayers = selectionData.selectedStrokesLayers;
    var box = selectionData.box;
    var boxCenter = box.center;
    
    var drawingNode  = selectedDrawing.node[0];
    var pivotNode = drawingNode;
    var _frame = frame.current();

    // MessageLog.trace('SetPivot:'+ JSON.stringify( boxCenter, true, '  ') );
    var x = Utils.pixelsToGridX( boxCenter.x );
    var y = Utils.pixelsToGridY( boxCenter.y );
    
    var animatable = node.getAttr( drawingNode, 1, "canAnimate").boolValue();
    var embeddedPivotOption = node.getTextAttr ( drawingNode, 1, "useDrawingPivot" );

    // MessageLog.trace('Drawing Options:'+ animatable+', '+embeddedPivotOption );
    if( !animatable || ( animatable && embeddedPivotOption == "Apply Embedded Pivot on Parent Peg" ) )
    {
      pivotNode = node.srcNode( drawingNode, 0 );
      if( !pivotNode )
      {
        // throw drawingNode + " is not animatable, and it does not have a parent peg to set its pivot position.";
        MessageLog.trace(drawingNode + " is not animatable, and it does not have a parent peg to set its pivot position.");
        pivotNode = drawingNode;
      }
      else if( node.type(pivotNode) !== "PEG" )
      {
        pivotNode = Utils.findParentPeg( pivotNode );
        if( !pivotNode ){
          // throw drawingNode + " is not animatable, and it does not have a parent peg to set its pivot position.";
          MessageLog.trace(drawingNode + " is not animatable, and it does not have a parent peg to set its pivot position.");
          pivotNode = drawingNode;
        }
      }

      // Reset Drawing transforms
      
    }

    MessageLog.trace( 'Apply pivot to: '+pivotNode );

    var positionXA = node.getAttr( pivotNode, _frame, 'OFFSET.X' );
    var positionYA = node.getAttr( pivotNode, _frame, 'OFFSET.Y' );
    var pivotXA = node.getAttr( pivotNode, _frame, 'PIVOT.X' );
    var pivotYA = node.getAttr( pivotNode, _frame, 'PIVOT.Y' );
    

    var oldPivot = node.getPivot( pivotNode, _frame );
    var oldPivotPositionA = Utils.getPointGlobalPosition( pivotNode, oldPivot, _frame );

    pivotXA.setValue( x );
    pivotYA.setValue( y );

    var oldPivotPositionB = Utils.getPointGlobalPosition( pivotNode, oldPivot, _frame );

    var oldPivotPositionDiff = {
      x: oldPivotPositionB.x - oldPivotPositionA.x,
      y: oldPivotPositionB.y - oldPivotPositionA.y,
    };

    // MessageLog.trace( 'PIVOT A: '+oldPivotPositionA.x+', '+oldPivotPositionA.y );
    // MessageLog.trace( 'PIVOT B: '+oldPivotPositionB.x+', '+oldPivotPositionB.y );
    // MessageLog.trace( 'PIVOT DIF: '+oldPivotPositionDiff.x+', '+oldPivotPositionDiff.y );
    
    // ToDo: need to apply this offset to each key frame
    positionXA.setValueAt( positionXA.doubleValue() - oldPivotPositionDiff.x, _frame );
    positionYA.setValueAt( positionYA.doubleValue() - oldPivotPositionDiff.y, _frame );


  } catch(err){
    MessageLog.trace('Error: '+err );
    scene.endUndoRedoAccum();
    return;
  }


  ///
  selectedDrawing.restoreSelection();

  scene.endUndoRedoAccum();

};


//
function Rotate( angle, centerX, centerY ){

  if( angle === undefined ) angle = 0;

  // MessageLog.clearLog(); // !!!
  MessageLog.trace('Rotate: '+angle+', '+centerX+', '+centerY);
  scene.beginUndoRedoAccum("Set Pivot");

  try{

    var selectionData = getSelectionData();
    if( !selectionData ) {
      MessageLog.trace('No selection Data');
      scene.endUndoRedoAccum();
      return;
    }

    var selectedDrawing = selectionData.selectedDrawing;
    var selectedStrokesLayers = selectionData.selectedStrokesLayers;
    var box = selectionData.box;
    var boxCenter = box.center;
    if( centerX === undefined ) centerX = boxCenter.x;
    if( centerY === undefined ) centerY = boxCenter.y;
    var raxis = new Vector3d(0,0,-1);
    var pointPos = new Vector3d();
    // MessageLog.trace('boxCenter: '+JSON.stringify(boxCenter,true,'  ') );

    selectedDrawing.iterateArts(function(art){

      selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
        
        if( !_stroke.isSelected ) return;

        var hasSelectedAnchors = !!_stroke.selectedAnchors;

        _stroke.path.forEach(function(pathPoint){

          if( hasSelectedAnchors && !pathPoint.isSelected && !pathPoint.isSelectedControl ) return;
          
          var difX = pathPoint.x - centerX;
          var difY = pathPoint.y - centerY;

          var mtrx = new Matrix4x4();
          mtrx.rotateDegrees( angle, raxis );
          mtrx.translate( difX, difY );
         
          var pos = mtrx.extractPosition();

          pathPoint.x = centerX + pos.x;
          pathPoint.y = centerY + pos.y;

        });

        return true;
      });

    });

  } catch(err){
    MessageLog.trace('Error: '+err );
    scene.endUndoRedoAccum();
    return;
  }

  //
  selectedDrawing.restoreSelection();

  scene.endUndoRedoAccum();

}



//
function Randomize( amount ){


  MessageLog.clearLog(); // !!!
  MessageLog.trace('Randomize: '+amount);

  scene.beginUndoRedoAccum("Randomize points");
  var amountHalf = amount;
  amount *= 2;

  try{

    var selectionData = getSelectionData();
    if( !selectionData ) {
      MessageLog.trace('No selection Data');
      scene.endUndoRedoAccum();
      return;
    }

    var selectedDrawing = selectionData.selectedDrawing;
    var selectedStrokesLayers = selectionData.selectedStrokesLayers;

    selectedDrawing.iterateArts(function(art){

      selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
        
        if( !_stroke.isSelected ) return;

        var hasSelectedAnchors = !!_stroke.selectedAnchors;

        _stroke.path.forEach(function(pathPoint){

          if( hasSelectedAnchors && !pathPoint.isSelected && !pathPoint.isSelectedControl ) return;
          
          pathPoint.x += Math.random()*amount - amountHalf;
          pathPoint.y += Math.random()*amount - amountHalf;

        });

        return true;
      });

    });

  } catch(err){
    MessageLog.trace('Error: '+err );
    scene.endUndoRedoAccum();
    return;
  }

  //
  selectedDrawing.restoreSelection();

  scene.endUndoRedoAccum();

}




//
function setWidth( w, h ){

  setSize( w, h, 'Set Width' );  

}

//
function setHeight( h, w ){
  setSize( w, h, 'Set Height' );
}

//
function setSize( w, h, title ){

  scene.beginUndoRedoAccum( title || "Set Size");

  try{

    var selectionData = getSelectionData();
    if( !selectionData ) {
      MessageLog.trace('No selection Data');
      scene.endUndoRedoAccum();
      return;
    }

    var selectedDrawing = selectionData.selectedDrawing;
    var selectedStrokesLayers = selectionData.selectedStrokesLayers;
    var box = selectionData.box;
    var boxCenter = box.center;

    var widthCoef, heightCoef;

    var boxWidth = box.x1-box.x0;
    if( w !== undefined ) widthCoef = Utils.gridToPixelsX(w) / boxWidth;
    var boxHeight = box.y1-box.y0;
    if( h !== undefined ) heightCoef = Utils.gridToPixelsY(h) / boxHeight;
    
    if( w === true ) widthCoef = heightCoef;
    if( h === true ) heightCoef = widthCoef;
    
    // MessageLog.trace('boxCenter: '+JSON.stringify(box,true,'  ')+' > '+JSON.stringify(boxCenter,true,'  ') );
    // MessageLog.trace('boxWidth: '+boxWidth+', '+Utils.gridToPixelsX(w) +' > '+widthCoef);
    // MessageLog.trace('boxHeight: '+boxHeight+', '+Utils.gridToPixelsY(h) +' > '+heightCoef );
    // return; // !!!

    selectedDrawing.iterateArts(function(art){

      selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
        
        if( !_stroke.isSelected ) return;

        var hasSelectedAnchors = !!_stroke.selectedAnchors;

        _stroke.path.forEach(function(pathPoint){

          if( hasSelectedAnchors && !pathPoint.isSelected && !pathPoint.isSelectedControl ) return;
          
          if( widthCoef !== undefined ) pathPoint.x = (pathPoint.x - box.center.x) * widthCoef + box.center.x;
          if( heightCoef !== undefined ) pathPoint.y = (pathPoint.y - box.center.y) * heightCoef + box.center.y;

        });

        return true;
      });

    });

  } catch(err){
    MessageLog.trace('Error: '+err );
    scene.endUndoRedoAccum();
    return;
  }

  //
  selectedDrawing.restoreSelection();

  scene.endUndoRedoAccum();

}

function getSize(){

  var size = {x:0,y:0};

  try{

    var selectionData = getSelectionData();
    if( !selectionData ) {
      MessageLog.trace('No selection Data');
      scene.endUndoRedoAccum();
      return;
    }

    var selectedDrawing = selectionData.selectedDrawing;
    var selectedStrokesLayers = selectionData.selectedStrokesLayers;
    var box = selectionData.box;    
    size.x = Utils.pixelsToGridX( box.x1-box.x0 );
    size.y = Utils.pixelsToGridY( box.y1-box.y0 );

  } catch(err){
    MessageLog.trace('Error: '+err );
    return;
  }

  selectedDrawing.restoreSelection();
  return size;

}

///
exports = _exports;
