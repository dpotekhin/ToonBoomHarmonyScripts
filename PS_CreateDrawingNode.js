/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1

ToDo:
- to filter out not Latin letters from the entered name
*/


function PS_CreateDrawingNode(){

	var _view = view.currentView();
	var _type = view.type(_view);
	// MessageLog.trace('_view:'+_view+', ['+_type+']');
	if( _type !== 'Node View' ){
		MessageBox.information('Node View must be active.',0,0,0);
		return;
	}

	var _group = view.group(_view);
	// MessageLog.trace('_group:'+_group+' > ');

	// Determine position of the new node
	var _selection = selection.selectedNodes();
	if( !_selection || !_selection.length ) _selection = node.subNodes( _group );
	var bounds = {x0:Number.MAX_VALUE,y0:Number.MAX_VALUE,x1:-Number.MAX_VALUE,y1:-Number.MAX_VALUE};
	_selection.forEach(function(_n){
		var x = node.coordX(_n);
		var y = node.coordY(_n);
		if( x < bounds.x0 ) bounds.x0 = x;
		if( x > bounds.x1 ) bounds.x1 = x;
		if( y < bounds.y0 ) bounds.y0 = y;
		if( y > bounds.y1 ) bounds.y1 = y;
	});
	var posX = (bounds.x1 - bounds.x0)/2 + bounds.x0;
	var posY = (bounds.y1 - bounds.y0)/2 + bounds.y0;

	if(!_selection){
		MessageBox.information('Selection required.',0,0,0);
		return;
	}

	var name;
	var _name = Input.getText('Drawing Name', 'Drawing');
	if(_name) {
		_name = _name.trim();
		name = _name.replace(/[\u0250-\ue007]/g, '');
	}
	
	// MessageLog.trace("Name: ["+_name+'] => ['+name+']');

	if( !name || _name.length !== name.length ) {
		MessageBox.information('Invalid Drawing name: "'+_name+'"',0,0,0,'Error');
		return;
	}
	
	///
	scene.beginUndoRedoAccum('Add Drawing');

	var _node = node.add( _group, name, 'READ', posX, posY, 0 );
	if( !_node ){
		scene.cancelUndoRedoAccum();
		return;
	}	
	
	// Switch off the Animate Using Animation Tools flag
	node.getAttr(_node,1,'CAN_ANIMATE').setValue( false );
	// Set up the Separate flags
	node.getAttr(_node,1,'OFFSET.SEPARATE').setValue( true );
	node.getAttr(_node,1,'SCALE.SEPARATE').setValue( true );

	var columnName = _getAvailableColumnName( _node.split('/').pop() );
	if( !columnName ){
		scene.endUndoRedoAccum();
		return;
	}

	// MessageLog.trace( 'Created: '+_node+', ['+columnName+']' );

	var elementId = element.add(columnName, "COLOR", 12, "SCAN" , "TVG");
	column.add(columnName, "DRAWING");
	
	column.setElementIdOfDrawing(columnName, elementId);

	node.linkAttr(_node, "DRAWING.ELEMENT", columnName );

	// Drawing
	var exposure = 'Default';
	Drawing.create(elementId, exposure, true);
	column.setEntry(columnName, 1, 1, exposure);
	column.fillEmptyCels(columnName, 1, frame.numberOf()+1 );
	
	column.update();

	// Select the created node
	selection.clearSelection();
	selection.addNodeToSelection( _node );

	///
	scene.endUndoRedoAccum();

}

function _getAvailableColumnName(_name){
	if(_checkColumnName(_name)) return _name;
	for( var i=1; i<100; i++){
		var __name = _name+'_'+i;
		if(_checkColumnName(__name)) return __name;
	}
}

function _checkColumnName(_name){
	var type = column.type(_name);
	// MessageLog.trace('_checkColumnName: '+_name+', '+type);
	return !type;
}