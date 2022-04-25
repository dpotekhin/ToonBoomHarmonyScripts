/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.220401
*/

/*
=== OffsetModule ===
"localReferential",
"restingOffset",
"restingOffset.SEPARATE",
"restingOffset.X",
"restingOffset.Y",
"restingOrientation",
"offset",
"offset.SEPARATE",
"offset.X",
"offset.Y",
"offset.2DPOINT",
"orientation"

=== CurveModule  ===
"localReferential",
"influenceType",
"influenceFade",
"symmetric",
"transversalRadius",
"transversalRadiusRight",
"longitudinalRadiusBegin",
"longitudinalRadius",
"closePath",
"restLength0",
"restingOrientation0",
"restingOffset",
"restingOffset.SEPARATE",
"restingOffset.X",
"restingOffset.Y",
"restLength1",
"restingOrientation1",
"Length0",
"orientation0",
"offset",
"offset.SEPARATE",
"offset.X",
"offset.Y",
"offset.2DPOINT",
"Length1",
"orientation1"
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/NodeUtils.js"));

///
var COLORART = 1;
var LINEART = 2;

///
exports = {
	RESTING: 1,
	CURRENT: 2,
	COLORART: COLORART,
	LINEART: LINEART,
	alignVertically: alignVertically,
	alignHorizontally: alignHorizontally,
	orientControlPoints: orientControlPoints,
	distributeControlPoints: distributeControlPoints,
	generateCircleDeformer: generateCircleDeformer,
	generateRectDeformer: generateRectDeformer,
	generateArtDeformer: generateArtDeformer,
	moveDeformersAround: moveDeformersAround,
	insertControlPoint: insertControlPoint
}

var restingAttrNames = {
	"offset.x": "restingOffset.x",
	"offset.y": "restingOffset.y",
	Length0: "restLength0",
	Length1: "restLength1",
	orientation0: "restingOrientation0",
	orientation1: "restingOrientation1",
};




/*
 █████  ██      ██  ██████  ███    ██ 
██   ██ ██      ██ ██       ████   ██ 
███████ ██      ██ ██   ███ ██ ██  ██ 
██   ██ ██      ██ ██    ██ ██  ██ ██ 
██   ██ ███████ ██  ██████  ██   ████ 
*/

//
function alignVertically( side ){

	_exec( 'Align Deformer Points Vertically', function(){
	
		var _nodes = getSelectedDeformers();
		if(!_nodes) return;

		var center = getCenter( _nodes, side, 'restingOffset.X' );
		applyAttrValue( _nodes, 'restingOffset.X', center );
		applyAttrValue( _nodes, 'offset.X', center );

	});
}

//
function alignHorizontally( side ){

	_exec( 'Align Deformer Points Horizontally', function(){
	
		var _nodes = getSelectedDeformers();
		if(!_nodes) return;

		var center = getCenter( _nodes, side, 'restingOffset.Y' );
		applyAttrValue( _nodes, 'restingOffset.Y', center );
		applyAttrValue( _nodes, 'offset.Y', center );

	});

}






// =====================================================================
/*
 ██████  ██████  ███    ██ ████████ ██████   ██████  ██          ██████   ██████  ██ ███    ██ ████████ ███████ 
██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██          ██   ██ ██    ██ ██ ████   ██    ██    ██      
██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██          ██████  ██    ██ ██ ██ ██  ██    ██    ███████ 
██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██          ██      ██    ██ ██ ██  ██ ██    ██         ██ 
 ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████     ██       ██████  ██ ██   ████    ██    ███████ 
*/

//
function orientControlPoints( _nodes, useEntireChain ){

	_exec( 'Orient Control Points', function(){
	
		if( !_nodes ) _nodes = useEntireChain ? getDeformersChain() : getSelectedDeformers();
		if( !_nodes ) return;

		_nodes.forEach(function(_node){
			
			if( isOffsetNode(_node) ){

			}else{

				var targetNode = getParentNode(_node);
				if( !targetNode || !(isOffsetNode(_node) || isDefNode(_node)) ) return;
				// if node is the last of a closed deformer
				// MessageLog.trace( '>-> '+node.getTextAttr( _node, 1, 'closePath' ) );
				
				var srcNode = _node;
				if( node.getTextAttr( _node, 1, 'closePath' ) === 'Y' ){
					srcNode = (getDeformersChain( _node ) || [])[0];
					if( !srcNode ) return;
				}

				var targetPos = getPointPosition(targetNode);
				var pos = getPointPosition(srcNode);
				var ang = Math.atan2( pos.y - targetPos.y, pos.x - targetPos.x ) / Math.PI * 180;
				
				applyAttrValue( _node, 'restingOrientation0', ang );
				applyAttrValue( _node, 'restingOrientation1', ang );

				applyAttrValue( _node, 'orientation0', ang );
				applyAttrValue( _node, 'orientation1', ang );

				// MessageLog.trace('-> SF: '+_node+'('+pos.x+','+pos.y+')' );
				// MessageLog.trace('-> PR: '+targetNode+' ('+targetPos.x+','+targetPos.y+')' );
				// MessageLog.trace('->: '+(pos.y - targetPos.y)+' > '+ (pos.x - targetPos.x) +' >> '+Math.atan2( pos.y - targetPos.y, pos.x - targetPos.x ));
				// MessageLog.trace(ang);
				// MessageLog.trace('--> '+node.getAllAttrKeywords(_node).join('\n') );

			}

		});

	});

}


//
function distributeControlPoints( _nodes, useEntireChain ){

	_exec( 'Distribute Control Points', function( ){
	
		if( !_nodes ) _nodes = useEntireChain ? getDeformersChain() : getSelectedDeformers();
		if(!_nodes) return;

		_nodes.forEach(function(_node){

			if( isOffsetNode(_node) ){

			}else{

				var targetNode = getParentNode(_node);
				if( !targetNode || !(isOffsetNode(_node) || isDefNode(_node)) ) return;

				var srcNode = _node;
				if( node.getTextAttr( _node, 1, 'closePath' ) === 'Y' ){
					srcNode = (getDeformersChain( _node ) || [])[0];
					if( !srcNode ) return;
				}

				var targetPos = getPointPosition(targetNode);
				var pos = getPointPosition(srcNode);
				var dx = pos.x - targetPos.x;
				var dy = pos.y - targetPos.y;
				var hypo = Math.sqrt( dx*dx + dy*dy );
				var length = hypo / 3;

				applyAttrValue( _node, 'restLength0', length );
				applyAttrValue( _node, 'restLength1', length );

				applyAttrValue( _node, 'length0', length );
				applyAttrValue( _node, 'length1', length );

				// MessageLog.trace('-> SF: '+_node+'('+pos.x+','+pos.y+')' );
				// MessageLog.trace('-> PR: '+targetNode+' ('+targetPos.x+','+targetPos.y+')' );
				// MessageLog.trace('-> length: '+length+' ( '+hypo );

			}

		});

	});

}










/// =====================================================
/*
 ██████  ███████ ███    ██ ███████ ██████   █████  ████████  ██████  ██████  ███████ 
██       ██      ████   ██ ██      ██   ██ ██   ██    ██    ██    ██ ██   ██ ██      
██   ███ █████   ██ ██  ██ █████   ██████  ███████    ██    ██    ██ ██████  ███████ 
██    ██ ██      ██  ██ ██ ██      ██   ██ ██   ██    ██    ██    ██ ██   ██      ██ 
 ██████  ███████ ██   ████ ███████ ██   ██ ██   ██    ██     ██████  ██   ██ ███████ 
 */
//
function generateCircleDeformer( artIndex ){
	_exec( 'Generate Circle Deformer', function(){
		generateDeformer( 'circle', artIndex );
	});
}

//
function generateRectDeformer( artIndex ){
	_exec( 'Generate Rectangle Deformer', function(){
		generateDeformer( 'rectangle', artIndex );
	});
}

//
function generateArtDeformer( artIndex ){
	_exec( 'Generate Deformer on Art layer', function(){
		generateDeformer( 'art', artIndex );
	});
}

///
function generateDeformer( mode, artIndex ){

	var curDrawing = SelectionUtils.filterNodesByType( true, ['READ'] );
	if (!curDrawing){
		MessageBox.information("Please select at least one drawing node before running this script.");
		return;
	}
	
	MessageLog.trace('curDrawing: '+ curDrawing+' >> '+artIndex );
	var currentArtIndex = artIndex !== undefined ? artIndex : LINEART;
	var corners = getCorners( curDrawing, currentArtIndex );
	if ( !("x" in corners[0]) && currentArtIndex !== COLORART ) {
		currentArtIndex = COLORART;
		corners = getCorners( curDrawing, currentArtIndex );
	}
	
	// MessageLog.trace('>> '+ currentArtIndex );
	// MessageLog.trace('>> '+ JSON.stringify( corners ) );

	if (!("x" in corners[0])) // if corners array is still empty
	{
		MessageLog.trace(curDrawing + " is empty at frame " + frame.current() + ". Quit.");
		return;
	}

	var btmL_local_OGL = Point2d( corners[0].x /1875, corners[0].y /1875 );	
	var topR_local_OGL = Point2d( corners[1].x /1875, corners[1].y /1875 );		
	var center_local_OGL = midPointAt(btmL_local_OGL, topR_local_OGL, 0.5);
	center_local_OGL.x = scene.fromOGLX(center_local_OGL.x);
	center_local_OGL.y = scene.fromOGLY(center_local_OGL.y);
	var wh = scene.fromOGLX(topR_local_OGL.x - btmL_local_OGL.x)/2;
	var hh = scene.fromOGLY(topR_local_OGL.y - btmL_local_OGL.y)/2;
	//

	// Create group
	var parentNode = node.parentNode(curDrawing);
	
	// MessageLog.trace('parentNode: ', parentNode );
	var groupPosition = {
		x: node.coordX(curDrawing),
		y: node.coordY(curDrawing) - 20
	}
	var offsetDest = node.srcNode( curDrawing, 0);

	// node.add( parentNode, node.getName(curDrawing)+'-Deformation', 'GROUP', groupPosition.x, groupPosition.y, 0 );
	
	var deformers;
	
	switch( mode ){

		case 'circle':
			deformers = getCircleDeformerData( curDrawing, parentNode, offsetDest, center_local_OGL, wh, hh );
			break;

		case 'rectangle':
			deformers = getRectangleDeformerData( curDrawing, parentNode, offsetDest, center_local_OGL, wh, hh );
			break;

		case 'art':
			deformers = getArtDeformerData( curDrawing, parentNode, offsetDest, center_local_OGL, wh, hh, currentArtIndex );
			break;
	}

	if( deformers ) {
	
		generateDeformersNodes( parentNode, groupPosition.x, groupPosition.y, deformers );

		if( mode === 'art' ){
			var _nodes = deformers.map(function(i){ return i.node; });
			distributeControlPoints( _nodes );
			orientControlPoints( _nodes );
		}

		var groupNode = node.createGroup( deformers.map(function(deformerData){ return deformerData.node; }).join(), node.getName(curDrawing)+'-DFM' );

		// MessageLog.trace('groupNode: ', groupNode );
		if(groupNode){
			node.setCoord( groupNode,
			  node.coordX(curDrawing) + node.width(curDrawing)/2 - node.width(groupNode)/2,
			  node.coordY(curDrawing) - (offsetDest ? (node.coordY(curDrawing) - node.coordY(offsetDest))/2 : 40 )
			);
		}

	}
	//


}


//
function getRectangleDeformerData( curDrawing, parentNode, offsetDest, center, wh, hh ) {
	
	var lengthW = wh * 2 * .333;
	var lengthH = hh * 2 * .333;

	var deformers = [
		{
			name: 'Offset',
			type: 'OffsetModule',
			src: offsetDest,
			attrs:{
				SEPARATE: true,
				localReferential: false,
				"offset.x": center.x - wh,
				"offset.y": center.y + hh,
			}
		},
		{
			name: 'Curve',
			type: 'CurveModule',
			attrs:{
				SEPARATE: true,
				localReferential: false,
				"offset.x": center.x + wh,
				"offset.y": center.y + hh,
				Length0: lengthW,
				Length1: lengthW,
				orientation0: 0,
				orientation1: 0
			}
		},
		{
			name: 'Curve',
			type: 'CurveModule',
			attrs:{
				SEPARATE: true,
				localReferential: false,
				"offset.x": center.x + wh,
				"offset.y": center.y - hh,
				Length0: lengthH,
				Length1: lengthH,
				orientation0: -90,
				orientation1: -90
			}
		},
		{
			name: 'Curve',
			type: 'CurveModule',
			dest: curDrawing,
			attrs:{
				SEPARATE: true,
				localReferential: false,
				"offset.x": center.x - wh,
				"offset.y": center.y - hh,
				Length0: lengthW,
				Length1: lengthW,
				orientation0: -180,
				orientation1: 180
			}
		},
		{
			name: 'Curve',
			type: 'CurveModule',
			dest: curDrawing,
			attrs:{
				SEPARATE: true,
				localReferential: false,
				closePath: true,
				"offset.x": center.x - wh,
				"offset.y": center.y + hh,
				Length0: lengthH,
				Length1: lengthH,
				orientation0: 90,
				orientation1: 90
			}
		}
	];

	return deformers;
}


//
function getCircleDeformerData( curDrawing, parentNode, offsetDest, center, wh, hh ){

	var lengthW = wh * .55;
	var lengthH = hh * .55;

	var deformers = [
		{
			name: 'Offset',
			type: 'OffsetModule',
			src: offsetDest,
			attrs:{
				SEPARATE: true,
				localReferential: false,
				"offset.x": center.x,
				"offset.y": center.y + hh,
			}
		},
		{
			name: 'Curve',
			type: 'CurveModule',
			attrs:{
				SEPARATE: true,
				localReferential: false,
				"offset.x": center.x + wh,
				"offset.y": center.y,
				Length0: lengthW,
				Length1: lengthH,
				orientation0: 0,
				orientation1: -90
			}
		},
		{
			name: 'Curve',
			type: 'CurveModule',
			attrs:{
				SEPARATE: true,
				localReferential: false,
				"offset.x": center.x,
				"offset.y": center.y - hh,
				Length0: lengthH,
				Length1: lengthW,
				orientation0: -90,
				orientation1: -180
			}
		},
		{
			name: 'Curve',
			type: 'CurveModule',
			dest: curDrawing,
			attrs:{
				SEPARATE: true,
				localReferential: false,
				"offset.x": center.x - wh,
				"offset.y": center.y,
				Length0: lengthW,
				Length1: lengthH,
				orientation0: -180,
				orientation1: 90
			}
		},
		{
			name: 'Curve',
			type: 'CurveModule',
			dest: curDrawing,
			attrs:{
				SEPARATE: true,
				localReferential: false,
				closePath: true,
				"offset.x": center.x,
				"offset.y": center.y + hh,
				Length0: lengthH,
				Length1: lengthW,
				orientation0: 90,
				orientation1: 0
			}
		}
	];

	return deformers;

}


//
function getArtDeformerData( curDrawing, parentNode, offsetDest, center, wh, hh, artIndex ) {

	var settings = Tools.getToolSettings();
	if (!settings.currentDrawing) return;
	var fr = frame.current();
	var config = {
		drawing: {node : curDrawing, frame : fr},
		art: artIndex
	};
	var strokes = Drawing.query.getStrokes(config);
	if( !strokes ){
		return;
	}
	
	// MessageLog.trace('STROKES:\n'+JSON.stringify(strokes,true,'  '));

	var points = [];

	strokes.layers.forEach(function(layerData){
		layerData.strokes.forEach(function(strokeData,si){
			strokeData.path.forEach(function(pointData,pi){
				MessageLog.trace(si+') '+pi+')'+pointData.x+', '+pointData.y);
				if( !pointData.onCurve ) return; // Skip control point
				var p = {
					x: scene.fromOGLX(pointData.x /1875),
					y: scene.fromOGLY(pointData.y /1875),
				};
				var dx = p.x - center.x;
				var dy = p.y - center.y;
				p.angleToCenter = Math.atan2( dy, dx );
				p.orientedAngle = p.angleToCenter >= 0 ? p.angleToCenter : 100 + p.angleToCenter;
				p.distToCenter = Math.sqrt( dx * dx + dy * dy );
				points.push(p);
			});
		});
	});
	
	// Sort all points around the center
	points = points.sort(function(a, b) {return a.orientedAngle - b.orientedAngle;});
	// MessageLog.trace('POINTS: '+points.length+' >> '+JSON.stringify(points,true,'  '));

	points.forEach(function(pointData,i){
		var prevPointData = i===0 ? points[points.length-1] : points[i-1];
		var dx = prevPointData.x - pointData.x;
		var dy = prevPointData.y - pointData.y;
		var dist = Math.sqrt( dx * dx + dy * dy );
		MessageLog.trace( dist );
		if( dist <= .5 ){
			// MessageLog.trace('!!!');
			if( prevPointData.distToCenter > pointData.distToCenter ) pointData.remove = true;
			else prevPointData.remove = true;
		}
	});

	// Remove close points
	points = points.filter(function(pointData){ return !pointData.remove });

	// MessageLog.trace('>> '+JSON.stringify(center,true,'  '));
	// MessageLog.trace('FILTERED POINTS: '+points.length+' >> '+JSON.stringify(points,true,'  '));
	if( points.length < 2 ){
		MessageLog.trace('Not enough points to generate a deformer.');
		return;
	}

	// Add additional data to points for deformer generation
	points.forEach(function(pointData,i){
		

		if( i===0 ){
			pointData.name = 'Offset';
			pointData.type = 'OffsetModule';
			pointData.src = offsetDest;
			pointData.attrs = {
				SEPARATE: true,
				localReferential: false,
				"offset.x": pointData.x,
				"offset.y": pointData.y,
			};

		}else{

			pointData.name = 'Curve',
			pointData.type = 'CurveModule',
			pointData.attrs = {
				SEPARATE: true,
				localReferential: false,
				"offset.x": pointData.x,
				"offset.y": pointData.y,
				Length0: 1,
				Length1: 1,
			};

		}

	});

	points.push({
		name: 'Curve',
		type: 'CurveModule',
		dest: curDrawing,
		attrs: {
			SEPARATE: true,
			localReferential: false,
			closePath: true,
			"offset.x": points[0].x,
			"offset.y": points[0].y,
			Length0: 1,
			Length1: 1,
		}
	});

	/*
	MessageLog.trace('BOUNDS: '+JSON.stringify(bounds,true,'  '));
	MessageLog.trace('>> '+JSON.stringify(bounds.center,true,'  '));
	*/

	return points;
}




/// ============================================================
/*
███    ███  ██████  ██    ██ ███████      █████  ██████   ██████  ██    ██ ███    ██ ██████  
████  ████ ██    ██ ██    ██ ██          ██   ██ ██   ██ ██    ██ ██    ██ ████   ██ ██   ██ 
██ ████ ██ ██    ██ ██    ██ █████       ███████ ██████  ██    ██ ██    ██ ██ ██  ██ ██   ██ 
██  ██  ██ ██    ██  ██  ██  ██          ██   ██ ██   ██ ██    ██ ██    ██ ██  ██ ██ ██   ██ 
██      ██  ██████    ████   ███████     ██   ██ ██   ██  ██████   ██████  ██   ████ ██████  
*/

/*
TODO:
- add the ability to not change the binding state
- take into account the inheritance of parent transformations
*/

function moveDeformersAround( direction ){

	_exec( 'Move Deformers Around', function(){

		var _deformers = getDeformersChain();
		if( !_deformers ) return;
		// MessageLog.trace("moveDeformersAround: "+JSON.stringify(_deformers,true,'  '));

		var currentFrame = frame.current();

		_deformers = _deformers.map( function( defNode, i ){
			
			var defData = {
				node: defNode,
				attrs: {}
			};

			Object.keys(restingAttrNames).forEach(function(attrName){
				defData.attrs[attrName] = node.getTextAttr( defNode, currentFrame, attrName );
				var restingAttr = restingAttrNames[attrName];
				defData.attrs[restingAttr] = node.getTextAttr( defNode, currentFrame, restingAttr );
			});

			return defData;

		});

		// MessageLog.trace("=> "+JSON.stringify(_deformers,true,'  '));
		var swapDefNodeI;
		_deformers.forEach( function( defNode, i ){
			/*
			var swapDefNodeI = direction === 'left' ? i+1 : i-1;
			if( swapDefNodeI < 0 ) swapDefNodeI = _deformers.length-1;
			if( swapDefNodeI > _deformers.length ) swapDefNodeI = 0;
			*/
			if( direction === 'left' ){

				swapDefNodeI = i === _deformers.length-1 ? 1 : i+1;

			}else {

				swapDefNodeI = i <= 1 ? _deformers.length-2+i : i-1;

			}
			// MessageLog.trace(i+') '+swapDefNodeI+') ');
			var swapDefNode = _deformers[ swapDefNodeI ];
			// MessageLog.trace(defNode.node+' > '+swapDefNode.node);
			setAttrValues( defNode.node, swapDefNode.attrs, currentFrame );
		});

	});

}



/*
██╗███╗   ██╗███████╗███████╗██████╗ ████████╗     ██████╗██████╗ 
██║████╗  ██║██╔════╝██╔════╝██╔══██╗╚══██╔══╝    ██╔════╝██╔══██╗
██║██╔██╗ ██║███████╗█████╗  ██████╔╝   ██║       ██║     ██████╔╝
██║██║╚██╗██║╚════██║██╔══╝  ██╔══██╗   ██║       ██║     ██╔═══╝ 
██║██║ ╚████║███████║███████╗██║  ██║   ██║       ╚██████╗██║     
╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝        ╚═════╝╚═╝     
*/

/*
TODO:
- to place the new CP on the deformer curve and set the length and oriantation up to the original deformer curve
- take into account the inheritance of parent transformations
*/

function insertControlPoint(){


	_exec( 'Insert a Control point to the Deformer', function(){

		var _deformers = getSelectedDeformers();
		if( !_deformers.length ){
			MessageLog.trace('The Script requires at least one selected deformer.');
			return;
		}

		// MessageLog.trace( JSON.stringify(_deformers,true,'  '));

		_deformers.forEach(function(deformerNode,i){

			if( isOffsetNode(deformerNode) ){
				MessageLog.trace('Unable to insert a Control point in the Offset.');
				return;
			}

			var parentNode = getParentNode( deformerNode );
			MessageLog.trace(i+') ' + deformerNode+' > '+parentNode );

			var deformerPos = getPointPosition(deformerNode);
			var parentPos = getPointPosition(parentNode);

			var newDeformerData = [{
				name: 'Curve',
				type: 'CurveModule',
				src: parentNode,
				dest: deformerNode,
				attrs:{
					SEPARATE: true,
					localReferential: false,
					"offset.x": deformerPos.x + (parentPos.x - deformerPos.x)/2,
					"offset.y": deformerPos.y + (parentPos.y - deformerPos.y)/2,
					Length0: 1,
					Length1: 1,
					orientation0: 0,
					orientation1: 0
				}
			}];
			
			generateDeformersNodes(
				NodeUtils.getNodeParent(deformerNode),
				node.coordX(deformerNode) + 15,
				node.coordY(deformerNode) - ( node.coordY(deformerNode) - node.coordY(parentNode) + node.height(deformerNode) )/2,
				newDeformerData
			);

			var _nodes = newDeformerData.map(function(i){ return i.node; });
			_nodes.push(deformerNode);
			distributeControlPoints( _nodes );
			orientControlPoints( _nodes );

		});

	});

}
















/// ============================================================
/*

██    ██ ████████ ██ ██      ███████ 
██    ██    ██    ██ ██      ██      
██    ██    ██    ██ ██      ███████ 
██    ██    ██    ██ ██           ██ 
 ██████     ██    ██ ███████ ███████ 
                                     

*/
// UTILS

//
function _exec( _name, _action ){

	MessageLog.trace('>>> '+_name);

	scene.beginUndoRedoAccum(_name);

	try{

		_action();

	} catch(err){
    MessageLog.trace('Error: '+_name+': '+err );
  }

  scene.endUndoRedoAccum();

}


//
function getSelectedDeformers(){
	var _nodes = selection.selectedNodes().filter(function(_node){
		return isDefNode(_node) || isOffsetNode(_node);
	});
	// MessageLog.trace(_nodes.join('\n'));
	return _nodes;
}


//
function isDefNode(_node){
	var type = node.type(_node);
	return type === 'CurveModule' || type === 'OffsetModule';
}


//
function isOffsetNode(_node){
	return node.type(_node) === 'OffsetModule';	
}


//
function getDeformerNodes( _nodes, _frame ){

	var offsetNode = getOffsetNode(_nodes[0]);
	if(!offsetNode) return;
	MessageLog.trace('offsetNode '+offsetNode );
	MessageLog.trace('--> '+node.getAllAttrKeywords(offsetNode).join('\n') );

	var curves = [getCurveData( offsetNode, _frame )];
	getCurveNodes( offsetNode, curves, _frame );
	MessageLog.trace('--> '+node.getAllAttrKeywords(curves[curves.length-1]).join('\n') );

	return curves;
}


//
function getOffsetNode(_node){

	if( !isDefNode(_node) ) return;
	if( isOffsetNode(_node) ) return _node;

	var inputCount = node.numberOfInputPorts( _node );
	for( var i=0; i<inputCount; i++){
		var inNode = node.srcNode( _node, i );
		if( !isDefNode(inNode) ) continue;
		return getOffsetNode(inNode);
	}
}


//
function getCurveNodes( _node, curveList, _frame ){

	if( !isDefNode(_node) ) return;

	var outputCount = node.numberOfOutputPorts( _node );
	var outputNodes = [];

	for( var i=0; i<outputCount; i++){

		var destNode = node.dstNode( _node, i, 0 );
		if( !isDefNode(destNode) ) continue;
		MessageLog.trace(' => '+destNode);
		curveList.push( getCurveData( destNode, _frame ) );
		getCurveNodes( destNode, curveList, _frame );
	}
}


//
function getCurveData( _node, _frame ){

	var data = {
		node: _node,
		name: node.getName(_node),
		type: node.type(_node)
	}

	node.getAllAttrKeywords(_node).forEach(function(attrName){
		data[attrName] = node.getAttr(_node, _frame, attrName );
	});

	return data;
}


//
function strightenBezier( _nodes ){

	_nodes.forEach(function(_node, i ){
		
		var type = node.type(_node);
		var name = node.getName(_node);

		MessageLog.trace(i+' =>  '+name+'['+type+']' );
		MessageLog.trace(node.getAllAttrNames(_node).join('\n'));

	});

}


//
function getParentNode( _node ){
	return node.srcNode( _node, 0 );
}


//
function getChildNodes( _node )
{
  var numOutput = node.numberOfOutputPorts( _node );
  var listOfDestinationNodes = [];
  for(var i = 0; i<numOutput; i++)
    listOfDestinationNodes.push(node.dstNode(_node, i, 0));
  return listOfDestinationNodes;
}


//
function getPointPosition( _node ){
	return{
		x: node.getAttr(_node, 1, 'restingOffset.X' ).doubleValue(),
		y: node.getAttr(_node, 1, 'restingOffset.Y' ).doubleValue(),
	}
}


//
function applyAttrValue( _nodes, attrName, value ) {
	
	var currentFrame = frame.current();
	if( typeof _nodes === 'string' ) _nodes = [_nodes];

	_nodes.forEach(function(_node){

		var attr = node.getAttr(_node, currentFrame, attrName);
		if(!attr) return;

		attr.setValueAt( value, currentFrame );

	});
}


//
function setAttrValues( _node, attrs, _frame ){
	if( _frame === undefined ) _frame = frame.current();
	Object.keys(attrs).forEach(function(attrName){
		node.setTextAttr( _node, attrName, _frame, attrs[attrName] );
		// MessageLog.trace( '-> '+_node+' >> '+attrName+' >> '+_frame+' >> '+attrs[attrName] );
	});
}


//
function getCenter( _nodes, side, attrName ){

	// MessageLog.trace('getCenter: '+side );
	var currentFrame = frame.current();
	var center = side > 0 ? -999999 : 999999;
	var centers = [];

	_nodes.forEach(function(_node){
		// MessageLog.trace('--> '+node.getAllAttrKeywords(_node).join('\n') );
		var attr = node.getAttr(_node, currentFrame, attrName);
		if(!attr) return;

		var val = attr.doubleValueAt( currentFrame );
		// MessageLog.trace('--> '+val+' ? '+center+' >>> '+node.getTextAttr(_node,currentFrame,attrName) );
		switch(side){
			case -1: if( val < center ) center = val; break;
			case 0: centers.push(val); break;
			case 1: if( val > center ) center = val; break;
		}
	});

	if( side === 0 ) center = centers.reduce(function add(acc, a){return acc + a;},0) / centers.length;

	return center;

}


//
function getDeformersChain( _nodes ){

	if( !_nodes ) _nodes = getSelectedDeformers();
	if( typeof _nodes === 'string' ) _nodes = [_nodes];
	if( !_nodes || !_nodes.length ) return;

	var offsetNode;
	var _node = _nodes[0];

	if( isOffsetNode(_node) ){

		offsetNode = _node;

	}else{

		for( var i=0; i<100; i++ ){
			_node = getParentNode(_node);
			if( isOffsetNode(_node) ){
				offsetNode = _node;
				break;
			}
			// MessageLog.trace(i+') '+_node);
		}

	}
	
	if( !offsetNode ) return;

	// MessageLog.trace('->>'+offsetNode);

	var deformerChain = [offsetNode];

	var currentNode = offsetNode;
	for( var i=0; i<100; i++ ){
		var children = getChildNodes( currentNode );
		if( !children || !children.length ) break;
		var defIsFound = false;
		children.every(function(_node){
			if( !isDefNode(_node) ) return true;
			currentNode = _node;
			deformerChain.push(_node);
			defIsFound = true;
			// MessageLog.trace(i+')'+_node);
		});
		if( !defIsFound ) break;
	}

	// MessageLog.trace('deformerChain:'+JSON.stringify(deformerChain,true,'  '));
	return deformerChain;
}


//
function midPointAt(p1, p2, t)
{
	var x = (p1.x *(1 -t) + p2.x *t);
	var y = (p1.y *(1 -t) + p2.y *t);
	return Point2d(parseFloat(x.toFixed(20)), parseFloat(y.toFixed(20)));
}


//
function getCorners( curDrawing, artIndex ) {

	var fr = frame.current();	
	var corners = [ {},{},{} ];
	// MessageLog.trace('>>>>> '+artIndex);
	for(var at = 0; at < 4; at++)
	{
		var shapeInfo = {drawing  : {node : curDrawing, frame : fr}, art : at};
		var box = Drawing.query.getBox(shapeInfo);
		// MessageLog.trace('> '+ JSON.stringify( box, true, '  ' ) );
		if( artIndex !== undefined && at !== artIndex ) continue;

		if (box == false || "empty" in box)
			continue;
		
		else if (!("x" in corners[0])) // if corners array is empty
		{	
			corners[0].x = box.x0;
			corners[0].y = box.y0;			
			corners[1].x = box.x1;
			corners[1].y = box.y1;
		}
		else
		{	
			corners[0].x = Math.min(box.x0, corners[0].x);
			corners[0].y = Math.min(box.y0, corners[0].y);			
			corners[1].x = Math.max(box.x1, corners[1].x);
			corners[1].y = Math.max(box.y1, corners[1].y);
		}
	}

	return corners;

}


//
function generateDeformersNodes( parentNode, nodeViewX, nodeViewY, deformers ){

	var nodeViewYStep = 40;
	var currentFrame = frame.current();

	deformers.forEach( function( deformerData, i ){

		deformerData.node = NodeUtils.createNode(
			parentNode,
			deformerData.name,
			deformerData.type,
			nodeViewX,
			nodeViewY+=nodeViewYStep,
			i==0 ? deformerData.src : deformers[i-1].node,
			deformerData.dest
		);

		Object.keys(deformerData.attrs).forEach(function(attrName){
			node.setTextAttr( deformerData.node, attrName, currentFrame, deformerData.attrs[attrName] );
			var restingAttrName = restingAttrNames[attrName];
			if( restingAttrName )
				node.setTextAttr( deformerData.node, restingAttrName, currentFrame, deformerData.attrs[attrName] );
		});

	});

}