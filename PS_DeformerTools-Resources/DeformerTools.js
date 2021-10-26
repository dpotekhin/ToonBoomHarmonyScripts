var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));


///
var _exports = {
	RESTING: 1,
	CURRENT: 2,
	alignVertically: alignVertically,
	alignHorizontally: alignHorizontally,
	orientControlPoints: orientControlPoints,
	distributeControlPoints: distributeControlPoints,
}


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
function orientControlPoints(){

	_exec( 'Orient Control Points', function(){
	
		var _nodes = getSelectedDeformers();
		if(!_nodes) return;

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
				// MessageLog.trace(ang);
				// MessageLog.trace('--> '+node.getAllAttrKeywords(_node).join('\n') );

			}

		});

	});

}


//
function distributeControlPoints(){

	_exec( 'Distribute Control Points', function(){
	
		var _nodes = getSelectedDeformers();
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


/*
Offset

localReferential
restingOffset
restingOrientation
offset
orientation
*/


/*
Curve

localReferential
influenceType
influenceFade
symmetric
transversalRadius
transversalRadiusRight
longitudinalRadiusBegin
longitudinalRadius
closePath
restLength0
restingOrientation0
restingOffset
restLength1
restingOrientation1
Length0
orientation0
offset
Length1
orientation1
*/

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

