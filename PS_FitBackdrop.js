/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1
*/


/* TODO:
- Fix fitting backdrop over nested backdrops
*/

function PS_FitBackdrop(){

	MessageLog.clearLog(); // !!!

	//
	var BOUND_OFFSET = 30;
	var MODIFY_MODE = 1;
	var CREATE_MODE = 2;
	var REMOVE_MODE = 3;
	//
	
	var mode = MODIFY_MODE;
	if( KeyModifiers.IsControlPressed() ) mode  = CREATE_MODE;
	else if( KeyModifiers.IsShiftPressed() ) mode = REMOVE_MODE;

	//
	var selectedNodes = selection.selectedNodes();
	
	if(!selectedNodes.length){
		MessageBox.warning("Please select nodes to fit the nearest backdrop.\n"+
			"\nOptions:\n"+
			"- Hold Control key to create a Backdrop around selected nodes.\n"+
			"- Hold Shift key to remove the nearest backdrop."
		,0,0,0,"Error");
 		return;
 	}

	var selectedNamespace;
	
	var bounds = {
		left: Number.MAX_VALUE,
		right: -Number.MAX_VALUE,
		top: Number.MAX_VALUE,
		bottom: -Number.MAX_VALUE,
	};

	// Get Drawning nodes
	selectedNodes.forEach(function(selNode,i){
 		
 		if(!selectedNamespace) selectedNamespace = node.parentNode(selNode);

 		// MessageLog.trace(i+' => '+node.getName(selNode)+' ['+node.type(selNode)+'], '+selNode );
 		var left = node.coordX(selNode);
 		var right = left + node.width(selNode);
 		var top = node.coordY(selNode);
 		var bottom = top + node.height(selNode);
 		if( left < bounds.left ) bounds.left = left;
 		if( right > bounds.right ) bounds.right = right;
 		if( top < bounds.top ) bounds.top = top;
 		if( bottom > bounds.bottom ) bounds.bottom = bottom;
 	});

 	MessageLog.trace( "selectedNamespace: "+selectedNamespace+', mode:'+mode );
 	MessageLog.trace( "bounds: "+bounds.left+', '+bounds.right+', '+bounds.top+', '+bounds.bottom );

 	// Check backdrops
 	var selectedBackdrop;
 	var closestBackdrop;
 	var closestBackdropIndex;
 	var closestBackdropDist;

 	var backdrops = Backdrop.backdrops(selectedNamespace) || [];

 	// Get nearest existing backdrop
 	backdrops.forEach(function(backdrop,i){
 		
		var backdropRect = {
			left: backdrop.position.x,
			right: backdrop.position.x + backdrop.position.w,
			top: backdrop.position.y,
			bottom: backdrop.position.y + backdrop.position.h
		};

		var overlapRect = comBinedRectangle( bounds, backdropRect );

		var dist = 0;

		// Horizontal distance
		dist += Math.abs(bounds.left - backdropRect.left);
 		dist += Math.abs(bounds.right - backdropRect.right );

 		// Vertical distance
 		dist += Math.abs(bounds.top - backdropRect.top);
 		dist += Math.abs(bounds.bottom - backdropRect.bottom );
 		
 		MessageLog.trace( "backdrop "+i+' ('+backdrop.title.text+") : "+dist+' overlapRect:'+ (overlapRect && JSON.stringify(overlapRect)) ); // +JSON.stringify(backdrop)+'; '

 		if( (!closestBackdrop || closestBackdropDist > dist) && overlapRect ){
 			closestBackdrop = backdrop;
 			closestBackdropDist = dist;
 			closestBackdropIndex = i;
 		}

 	});

 	MessageLog.trace( "closestBackdrop ("+(closestBackdrop && closestBackdrop.title.text)+") : "+closestBackdropDist );

 	// START UNDO ACCUM
	scene.beginUndoRedoAccum('Fit Backdrop');

 	if( mode === REMOVE_MODE ){
 		
 		if(!closestBackdrop) return;
 		backdrops.splice(closestBackdropIndex, 1 );

 	}else{

	 	if( !closestBackdrop || mode == CREATE_MODE ){ // Create brand new Backdrop

			closestBackdrop = {
			  "position"    : {x: 0, y:0, w:300, h:300},
			  "title"       : {text : ""},
			  "description" : {text : ""},
			  "color": 4281479730
			};
			backdrops.push(closestBackdrop);
		}

		// Fit backdrop to the selected nodes
		closestBackdrop.position = {
			x: bounds.left - BOUND_OFFSET,
			w: bounds.right - bounds.left + BOUND_OFFSET*2,
			y: bounds.top - BOUND_OFFSET,
			h: bounds.bottom - bounds.top + BOUND_OFFSET*2
		};

		// Show input name dialog if backdrop has no title
		if( !closestBackdrop.title.text ){
			var inputedText = Input.getText('Enter the Backdrop name:', '', '');
			// MessageLog.trace( "inputedText "+inputedText);
			if( inputedText ) closestBackdrop.title.text = inputedText;
		}

	}

	Backdrop.setBackdrops( selectedNamespace, backdrops );

	// END UNDO ACCUM
	scene.endUndoRedoAccum();


	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// UTILS

	// the intersect area of two overlapping rectangles
	function maxOfX(rec){ return Math.max(rec.left, rec.right) };
	function maxOfY(rec){ return Math.max(rec.top, rec.bottom) };
	function minOfX(rec){ return Math.min(rec.left, rec.right) };
	function minOfY(rec){ return Math.min(rec.top, rec.bottom) };

	function comBinedRectangle(rec1, rec2){
	  
	  var overlappedRec;

	  var NolappingFromX = maxOfX(rec1) <= minOfX(rec2) || minOfX(rec1) >= maxOfX(rec2);
	  var NolappingFromY = maxOfY(rec1) <= minOfY(rec2) || minOfY(rec1) >= maxOfY(rec2);
	  
	  if (!(NolappingFromX || NolappingFromY)) {
	    overlappedRec = {
	    	left: Math.max(minOfX(rec1), minOfX(rec2)),
	    	top: Math.max(minOfY(rec1), minOfY(rec2)),
	    	right: Math.min(maxOfX(rec1), maxOfX(rec2)),
	    	bottom: Math.min(maxOfY(rec1), maxOfY(rec2))
	    };
	    overlappedRec.width = overlappedRec.right - overlappedRec.left;
	    overlappedRec.height = overlappedRec.bottom - overlappedRec.top;
	  }

	  return overlappedRec;

	}

}