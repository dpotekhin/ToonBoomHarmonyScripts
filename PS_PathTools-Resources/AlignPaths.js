/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1

ToDo:
- make panel with options
- add aligment options (like in Adobe animate)
  - 
  - distribute, justify
  - aligning strokes relative to each other
    - how to detect a stroke group?
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
function AlignShapes( mode, notRelativeToCanvas ){


  // !!!
  MessageLog.clearLog(); // !!!
  // MessageLog.trace('Drawing/geometry: '+ Object.getOwnPropertyNames(Tools).join('\n') );
  
  if( notRelativeToCanvas === undefined && KeyModifiers.IsControlPressed() ) notRelativeToCanvas = true;

  var _frame = frame.current();

  var selectedDrawing = new pDrawing( true );
  var selectedStrokesLayers = selectedDrawing.getSelectedStrokesLayers();
  if( !selectedStrokesLayers ) {
    MessageLog.trace('No stroks selected.');
    return;
  }

  // MessageLog.trace('selectedStrokesLayers >> 0:'+selectedStrokesLayers[0].length+', 1:'+selectedStrokesLayers[1].length+', 2:'+selectedStrokesLayers[2].length+', 3:'+selectedStrokesLayers[3].length);
  // return;

  //
  scene.beginUndoRedoAccum("Align shape");

  var selectedArt = selectedDrawing.selectedToolSettings.activeArt;

  var box = selectedDrawing.getStrokesBox( selectedStrokesLayers );
  if( !box ) {
    MessageLog.trace('!!! box is empty: '+ box );
    scene.endUndoRedoAccum();
    return;
  }

  var boxWidth = box.x1-box.x0;
  var boxHeight = box.y1-box.y0;

  var offsetX = 0;
  var offsetY = 0
  var centerOffsetX = box.x0 + boxWidth/2;
  var centerOffsetY = box.y0 + boxHeight/2;

  switch( mode ){

    case _exports.MODE_ALIGN_LEFT:
      offsetX = centerOffsetX - boxWidth/2;
      break;

    case _exports.MODE_ALIGN_H_CENTER:
      offsetX = centerOffsetX;
      break;

    case _exports.MODE_ALIGN_RIGHT:
      offsetX = centerOffsetX + boxWidth/2;
      break;

    case _exports.MODE_ALIGN_CENTER:
      offsetX = centerOffsetX;
      offsetY = centerOffsetY;
      break;

    case _exports.MODE_ALIGN_TOP:
      offsetY = centerOffsetY + boxHeight/2;
      break;

    case _exports.MODE_ALIGN_V_CENTER:
      offsetY = centerOffsetY;
      break;

    case _exports.MODE_ALIGN_BOTTOM:
      offsetY = centerOffsetY - boxHeight/2;
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


///
exports = _exports;