/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.3
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
function AlignLeft( notRelativeToCanvas ){
  AlignShapes( _exports.MODE_ALIGN_LEFT, notRelativeToCanvas );
}

//
function AlignHCenter( notRelativeToCanvas ){
  AlignShapes( _exports.MODE_ALIGN_H_CENTER, notRelativeToCanvas );
}

//
function AlignRight( notRelativeToCanvas ){
  AlignShapes( _exports.MODE_ALIGN_RIGHT, notRelativeToCanvas );
}

//
function AlignCenter( notRelativeToCanvas ){
  AlignShapes( _exports.MODE_ALIGN_CENTER, notRelativeToCanvas );
}

// Vertical Align
function AlignTop( notRelativeToCanvas ){
  AlignShapes( _exports.MODE_ALIGN_TOP, notRelativeToCanvas );
}

//
function AlignVCenter( notRelativeToCanvas ){
  AlignShapes( _exports.MODE_ALIGN_V_CENTER, notRelativeToCanvas );
}

//
function AlignBottom( notRelativeToCanvas ){
  AlignShapes( _exports.MODE_ALIGN_BOTTOM, notRelativeToCanvas );
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

  ///
  scene.beginUndoRedoAccum("Align shape");

  var box = selectedDrawing.getStrokesBox( selectedStrokesLayers );
  if( box.width === undefined ) {
    MessageLog.trace('!!! box is empty: '+ box );
    scene.endUndoRedoAccum();
    return;
  }

  return {
    selectedDrawing: selectedDrawing,
    selectedStrokesLayers: selectedStrokesLayers,
    box: box
  };

}


//
function AlignShapes( mode, notRelativeToCanvas ){


  // !!!
  // MessageLog.clearLog(); // !!!
  // MessageLog.trace('Drawing/geometry: '+ Object.getOwnPropertyNames(Tools).join('\n') );
  
  if( notRelativeToCanvas === undefined && KeyModifiers.IsControlPressed() ) notRelativeToCanvas = true;


  var selectionData = getSelectionData();
  if( !getSelectionData ) return;

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
  // MessageLog.trace('box: '+JSON.stringify(box, true, '  ')+', offsetX: '+offsetX+', '+offsetY );

  selectedDrawing.iterateArts(function(art){

    selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
       
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

  // TODO: make originally selected strokes selected
  
  //
  scene.endUndoRedoAccum();

}



//
function FlipCenter( horizontally ){

  var selectionData = getSelectionData();
  if( !getSelectionData ) return;

  var selectedDrawing = selectionData.selectedDrawing;
  var selectedStrokesLayers = selectionData.selectedStrokesLayers;
  var box = selectionData.box;
  // var boxCenter = box.center;

  selectedDrawing.iterateArts(function(art){

    selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
      
      var hasSelectedAnchors = !!_stroke.selectedAnchors;

      _stroke.path.forEach(function(pathPoint){

        if( hasSelectedAnchors && !pathPoint.isSelected && !pathPoint.isSelectedControl ) return;

        if( horizontally ) pathPoint.x = -pathPoint.x;
        else pathPoint.y = -pathPoint.y;

      });

      return true;

    });

  });

  //
  scene.endUndoRedoAccum();
}

function FlipHCenter(){
  FlipCenter(true);
}

//
function FlipVCenter(){
  FlipCenter(false);
}



//
function Merge( mergeControlPoints ){

  var selectionData = getSelectionData();
  if( !getSelectionData ) return;

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

  //
  scene.endUndoRedoAccum();

}


///
exports = _exports;