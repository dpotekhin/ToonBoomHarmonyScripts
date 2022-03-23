/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.211029
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
var pBox2D = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pBox2D.js"));


///
var _exports = {
	RESTING: 1,
	CURRENT: 2,
	alignVertically: alignVertically,
	alignHorizontally: alignHorizontally,
	orientControlPoints: orientControlPoints,
	distributeControlPoints: distributeControlPoints,
	generateCircleDeformer: generateCircleDeformer,
	generateRectDeformer: generateRectDeformer,
	generateLineArtDeformer: generateLineArtDeformer,
}

var restingAttrNames = {
	"offset.x": "restingOffset.x",
	"offset.y": "restingOffset.y",
	Length0: "restLength0",
	Length1: "restLength1",
	orientation0: "restingOrientation0",
	orientation1: "restingOrientation1",
};

var COLORART = 1;
var LINEART = 2;

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

//
function orientControlPoints( _nodes ){

	_exec( 'Orient Control Points', function(){
	
		if( !_nodes ) _nodes = getSelectedDeformers();
		if( !_nodes ) return;

		_nodes.forEach(function(_node){
			
			if( isOffsetNode(_node) ){

			}else{

				var parentNode = getParentNode(_node);
				if( !parentNode || !(isOffsetNode(_node) || isDefNode(_node)) ) return;

				var parentPos = getPointPosition(parentNode);
				var pos = getPointPosition(_node);
				var ang = Math.atan2( pos.y - parentPos.y, pos.x - parentPos.x ) / Math.PI * 180;
				
				applyAttrValue( _node, 'restingOrientation0', ang );
				applyAttrValue( _node, 'restingOrientation1', ang );

				applyAttrValue( _node, 'orientation0', ang );
				applyAttrValue( _node, 'orientation1', ang );

				// MessageLog.trace('-> SF: '+_node+'('+pos.x+','+pos.y+')' );
				// MessageLog.trace('-> PR: '+parentNode+' ('+parentPos.x+','+parentPos.y+')' );
				MessageLog.trace(ang);
				// MessageLog.trace('--> '+node.getAllAttrKeywords(_node).join('\n') );

			}

		});

	});

}


//
function distributeControlPoints( _nodes ){

	_exec( 'Distribute Control Points', function( ){
	
		if( !_nodes ) _nodes = getSelectedDeformers();
		if(!_nodes) return;

		_nodes.forEach(function(_node){

			if( isOffsetNode(_node) ){

			}else{

				var parentNode = getParentNode(_node);
				if( !parentNode || !(isOffsetNode(_node) || isDefNode(_node)) ) return;

				var parentPos = getPointPosition(parentNode);
				var pos = getPointPosition(_node);
				var dx = pos.x - parentPos.x;
				var dy = pos.y - parentPos.y;
				var hypo = Math.sqrt( dx*dx + dy*dy );
				var length = hypo / 3;

				applyAttrValue( _node, 'restLength0', length );
				applyAttrValue( _node, 'restLength1', length );

				applyAttrValue( _node, 'length0', length );
				applyAttrValue( _node, 'length1', length );

				// MessageLog.trace('-> SF: '+_node+'('+pos.x+','+pos.y+')' );
				// MessageLog.trace('-> PR: '+parentNode+' ('+parentPos.x+','+parentPos.y+')' );
				// MessageLog.trace('-> length: '+length+' ( '+hypo );

			}

		});

	});

}


///
exports = _exports;



///


//
function getParentNode( _node ){
	return node.srcNode( _node, 0 );
}

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



/// =====================================================
//
function generateCircleDeformer(){
	generateDeformer('circle');
}

//
function generateRectDeformer(){
	generateDeformer('rectangle');
}

//
function generateLineArtDeformer(){
	generateDeformer('lineart');
}

///
function generateDeformer( mode ){

	MessageLog.clearLog();

	var curDrawing = SelectionUtils.filterNodesByType( true, ['READ'] );
	if (!curDrawing){
		MessageBox.information("Please select at least one drawing node before running this script.");
		return;
	}

	
	// MessageLog.trace('curDrawing: '+ curDrawing );
	var corners = getCorners( curDrawing, mode, LINEART );
	if (!("x" in corners[0])) corners = getCorners( curDrawing, mode, COLORART );
	
	MessageLog.trace('>> '+ JSON.stringify( corners ) );

	if (!("x" in corners[0])) // if corners array is still empty
	{
		MessageLog.trace(curDrawing + " is empty at frame " + fr + ". Quit.");
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
	scene.beginUndoRedoAccum("Generate Deformer");

	try{

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

			case 'lineart':
				deformers = getLineArtDeformerData( curDrawing, parentNode, offsetDest, center_local_OGL, wh, hh );
				break;
		}

		if( deformers ) {
		
			generateDeformersNodes( curDrawing, parentNode, offsetDest, groupPosition.x, groupPosition.y, deformers );

			if( mode === 'lineart' ){
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

	}catch(err){MessageLog.trace('Error:'+err)}

	//
	scene.endUndoRedoAccum("");


}


//
function midPointAt(p1, p2, t)
{
	var x = (p1.x *(1 -t) + p2.x *t);
	var y = (p1.y *(1 -t) + p2.y *t);
	return Point2d(parseFloat(x.toFixed(20)), parseFloat(y.toFixed(20)));
}

//
function getCorners( curDrawing, mode, layerIndex ) {

	var fr = frame.current();	
	var corners = [ {},{},{} ];

	for(var at = 0; at < 4; at++)
	{
		var shapeInfo = {drawing  : {node : curDrawing, frame : fr}, art : at};
		var box = Drawing.query.getBox(shapeInfo);
		// MessageLog.trace('> '+ JSON.stringify( box ) );
		if( mode === 'lineart' && at !== layerIndex ) continue;

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
function getLineArtDeformerData( curDrawing, parentNode, offsetDest, center, wh, hh ) {

	var settings = Tools.getToolSettings();
	if (!settings.currentDrawing) return;
	var fr = frame.current();
	var config = {
		drawing: {node : curDrawing, frame : fr},
		art: LINEART
	};
	var strokes = Drawing.query.getStrokes(config);
	if( !strokes ){
		return;
	}
	// MessageLog.trace('STROKES:\n'+JSON.stringify(strokes,true,'  '));
	var points = [];
	var bounds = new pBox2D();
	strokes.layers.forEach(function(layerData){
		layerData.joints.forEach(function(jointData,i){
			// MessageLog.trace(i+') '+jointData.x+', '+jointData.y);
			var p = {
				x: scene.fromOGLX(jointData.x /1875),
				y: scene.fromOGLY(jointData.y /1875),
			};
			var dx = p.x - center.x;
			var dy = p.y - center.y;
			p.angleToCenter = Math.atan2( dy, dx );
			p.distToCenter = Math.sqrt( dx * dx + dy * dy );
			// bounds.addPoint( p.x, p.y );
			points.push(p);
		});
	});
	
	points = points.sort(function(a, b) {return a.angleToCenter - b.angleToCenter;}); // Sort all points around the center

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

	points = points.filter(function(pointData){ return !pointData.remove });

	// MessageLog.trace('>> '+JSON.stringify(center,true,'  '));
	// MessageLog.trace(points.length+' >> '+JSON.stringify(points,true,'  '));

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


//
function generateDeformersNodes( curDrawing, parentNode, offsetDest, nodeViewX, nodeViewY, deformers ){

	var nodeViewYStep = 40;

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
			node.setTextAttr( deformerData.node, attrName, 1, deformerData.attrs[attrName] );
			var restingAttrName = restingAttrNames[attrName];
			if( restingAttrName )
				node.setTextAttr( deformerData.node, restingAttrName, 1, deformerData.attrs[attrName] );
		});

	});

}

