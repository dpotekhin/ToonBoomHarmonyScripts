/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.31
*/

//
var pDrawing = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pDrawing.js"));

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
}


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
    MessageLog.trace('!!! box is empty: '+ box );
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

  // try{
    var selectionData = getSelectionData();
    if( !selectionData ) {
      scene.endUndoRedoAccum();
      return;
    }

    var selectedDrawing = selectionData.selectedDrawing;
    var selectedStrokesLayers = selectionData.selectedStrokesLayers;
    var box = selectionData.box;

    var offsetX = 0;
    var offsetY = 0;
    var boxCenter = box.center;

    switch( mode ){

      case _exports.MODE_ALIGN_LEFT:
        offsetX = boxCenter.x - box.width/2;
        break;

      case _exports.MODE_ALIGN_H_CENTER:
        offsetX = boxCenter.x;
        break;

      case _exports.MODE_ALIGN_RIGHT:
        offsetX = boxCenter.x + box.width/2;
        break;

      case _exports.MODE_ALIGN_CENTER:
        offsetX = boxCenter.x;
        offsetY = boxCenter.y;
        break;

      case _exports.MODE_ALIGN_TOP:
        offsetY = boxCenter.y + box.height/2;
        break;

      case _exports.MODE_ALIGN_V_CENTER:
        offsetY = boxCenter.y;
        break;

      case _exports.MODE_ALIGN_BOTTOM:
        offsetY = boxCenter.y - box.height/2;
        break;

    }

    // MessageLog.trace('Offset(0) '+offsetX+', '+offsetY);
    if( centerX !== undefined ) offsetX -= centerX;
    if( centerY !== undefined ) offsetY -= centerY;
    // MessageLog.trace('Offset(1) '+offsetX+', '+offsetY);
    // MessageLog.trace('box: '+JSON.stringify(box, true, '  ')+', offsetX: '+offsetX+', '+offsetY );

    selectedDrawing.iterateArts(function(art){

      selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
              
        if( !_stroke.isSelected ) return;

        var hasSelectedAnchors = !!_stroke.selectedAnchors;

        _stroke.path.forEach(function(pathPoint){
          // MessageLog.trace('>>'+pathPoint.x+', '+pathPoint.y);
          if( hasSelectedAnchors && !pathPoint.isSelected && !pathPoint.isSelectedControl ) return;

          pathPoint.x -= offsetX;
          pathPoint.y -= offsetY;

        });

        // MessageLog.trace('bounds: '+ JSON.stringify(bounds, true, ' ') );
        return true;
      });

    });

  // } catch(err){
  //   MessageLog.trace('Error: '+err );
  // }

  // TODO: make originally selected strokes selected

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


///
exports = _exports;