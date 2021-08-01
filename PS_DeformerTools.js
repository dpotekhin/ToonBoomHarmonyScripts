/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1
*/

/*
TODO:
*/

function PS_DeformerTools(){

	MessageLog.clearLog();

	var selectedNodes = selection.selectedNodes();
	MessageLog.trace('selectedNodes '+selectedNodes );

	selectedNodes = selectedNodes.filter(isDefNode);

	var _frame = frame.current();

	var curves = getDeformerNodes( selectedNodes, _frame );
	MessageLog.trace('curves: '+JSON.stringify(curves,true,'  '));

	// strightenBezier(selectedNodes);
	
	///
	// scene.beginUndoRedoAccum('Swap Nodes');


	///
	// scene.endUndoRedoAccum();

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

