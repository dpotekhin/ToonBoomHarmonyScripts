//
var pDrawing = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pDrawing.js"));


/*
ToDo:
- make panel with options
- add aligment options (like in Adobe animate)
  - left, center, right
  - top, center, bottom
  - distribute, justify
  - align relative to the Drawing center
*/

//
function PS_AlignShapes(){


  // !!!
  MessageLog.clearLog(); // !!!
  // MessageLog.trace('Drawing/geometry: '+ Object.getOwnPropertyNames(Tools).join('\n') );

  //
  scene.beginUndoRedoAccum("Align shape");

  var _frame = frame.current();

  var selectedDrawing = new pDrawing( true );
  var selectedStrokesLayers = selectedDrawing.getSelectedStrokesLayers();
  
  // MessageLog.trace('selectedStrokesLayers >> 0:'+selectedStrokesLayers[0].length+', 1:'+selectedStrokesLayers[1].length+', 2:'+selectedStrokesLayers[2].length+', 3:'+selectedStrokesLayers[3].length);
  // return;

  var selectedArt = selectedDrawing.selectedToolSettings.activeArt;

  var box = selectedDrawing.getStrokesBox( selectedStrokesLayers );

  var offsetX = box.x0 + (box.x1-box.x0)/2;
  var offsetY = box.y0 + (box.y1-box.y0)/2;
  // MessageLog.trace('box: '+JSON.stringify(box, true, '  ')+', offsetX: '+offsetX+', '+offsetY );


  selectedDrawing.iterateArts(function(art){
    selectedDrawing.modifyArtStrokes( art, selectedStrokesLayers[art], function(_stroke){
       _stroke.path.forEach(function(pathPoint){
        // MessageLog.trace('>>'+pathPoint.x+', '+pathPoint.y);      
        pathPoint.x -= offsetX;
        pathPoint.y -= offsetY;
        
      });

      // MessageLog.trace('bounds: '+ JSON.stringify(bounds, true, ' ') );
      return true;
    });
  });
  
  //
  scene.endUndoRedoAccum();

}
