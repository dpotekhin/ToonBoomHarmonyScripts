/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220429

The script selects layer with keys in the current frame.

Options:
- Hold the Shift key in the second time you run script to select the next layer with keys in the current frame
*/

///
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

///
function PS_SelectLayerWithKeys(){

	var prefsName = 'PS_SelectLayerWithKeys_Data';

	if( KeyModifiers.IsControlPressed() ){
		
		var savedData =  JSON.parse(preferences.getString( prefsName, '') || '{}');
		if( savedData && savedData.nodes && savedData.nodes.length ){
			// MessageLog.trace('index:'+savedData.index);
			var index = savedData.index + 1;
			if( index >= savedData.nodes.length ) index = 0;
			MessageLog.trace('index: '+index+', '+savedData.nodes[index] );
			setSelection( savedData.nodes[index], savedData.nodes, index );
			return;			
		}
		
	}
	// MessageLog.trace('Saved data:'+ savedData );


	///
	var selectedlayers = SelectionUtils.getSelectedLayers();
  	// MessageLog.trace('selectedlayers: '+JSON.stringify(selectedlayers,true,' '));

  	var validColumnTypes = ['BEZIER','3DPATH'];
  	
  	var attrFilter = {
  		'POSITION.3DPATH': ['POSITION.SEPARATE','Off'],
  		'POSITION.': ['POSITION.SEPARATE','On'],
  		'SCALE.XY':['SCALE.SEPARATE','Off'],
  		'SCALE.':['SCALE.SEPARATE','On'],
  		'ROTATION.ANGLE':['SCALE.ENABLE_3D','On'],
	};

  	var currentFrame = frame.current();
  	var nodesWithKeys = [];

  	selectedlayers.forEach(function( _layer, i ){
    
	    var _node = _layer.node;
	    var attributes = Utils.getLinkedAttributeNames( _node );
	    if( !attributes.length ) return;
	    // MessageLog.trace(i+') '+_node+': '+JSON.stringify(attributes,true,' '));
	    // MessageLog.trace(i+') '+_node);

	    attributes.every(function( _attrName, ii ){

	      	var columnName = node.linkedColumn(_node, _attrName);
	      	var columnType = column.type(columnName);
	      	if( validColumnTypes.indexOf(columnType) === -1 ) return;
	      	
	      	// Filter out disabled attributes
	      	var filtered = false;
	      	Object.keys(attrFilter).every(function(filterAttrName){
	      		if( !_attrName.match(filterAttrName) ) return true;
	      		var filterData = attrFilter[filterAttrName];
	      		if( node.getTextAttr( _node, currentFrame, filterData[0] ) === filterData[1] ) return true;
	      		filtered = true;
	      		// MessageLog.trace('Attr: '+_attrName+' > '+filterAttrName+' >> '+filterData[0]+' > '+node.getTextAttr( _node, currentFrame, filterData[0] ) );
	      	});
	      	
	      	if( filtered ) return;

	      	// MessageLog.trace('   '+ii+') '+_attrName+' > '+columnName+' > '+columnType );

	      	if( !hasKeyInFrame( columnName, currentFrame ) ) return true;
	      		
	      	nodesWithKeys.push( _node );

	    });

	});


	//
	if( !nodesWithKeys.length ) return;
	MessageLog.trace('Nodes with keys: '+JSON.stringify( nodesWithKeys, true, '  ') );
	setSelection( nodesWithKeys[0], nodesWithKeys );

	//
	function hasKeyInFrame( columnName, currentFrame ){
		
		var pointCount = func.numberOfPoints( columnName );
		// MessageLog.trace( '    > '+pointCount);

		for( var i=0; i<pointCount; i++ ){
			var fr = func.pointX( columnName, i );
			// MessageLog.trace(fr);
			if( fr === currentFrame ) {
				// MessageLog.trace('!!!! ' + currentFrame);
				return true;
			}
			if( fr > currentFrame ) return;
		}
		
	}

	//
	function setSelection( __node, __nodes, __index ){
		selection.clearSelection();
		selection.addNodeToSelection( __node );
		preferences.setString( prefsName, JSON.stringify( { nodes: __nodes, index: __index || 0 }) );
	}

}