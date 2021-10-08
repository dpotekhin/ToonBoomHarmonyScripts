/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.211006
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));

function PS_3DPathToSeparate(){

	MessageLog.clearLog();

	var _node = selection.selectedNode(0);
	var attrType = 'POSITION';
	var attrNames = Utils.getFullAttributeList( _node, 1, true );
	MessageLog.trace( JSON.stringify(attrNames,true,'  ') );

	MessageLog.trace( 'POSITION.SEPARATE: '+node.getTextAttr(_node,1,'POSITION.SEPARATE') );
	// var attr = node.getAttr(nodeName, frame.current(), attrName);
  	// return attr.typeName();

	if( node.getTextAttr(_node,1,'POSITION.SEPARATE') === 'Off' ){ // Switch to Separate

		scene.beginUndoRedoAccum('3d Path to Separate');

		_3dPathToSeparate( _node, attrType );

		scene.endUndoRedoAccum();

	}else{ // Switch to 3D Path

		// TODO: https://docs.toonboom.com/help/harmony-20/scripting/script/classfunc.html#a8eecee32da647b0f919eafc10e5aeb52
	}


	///
	function _3dPathToSeparate( _node, attrType ){

		var path3dColumn = node.linkedColumn(_node, attrType+'.3DPATH' );
		if( !path3dColumn ){
			MessageLog.trace('Error: 3DPATH column is not linked.');
			return;
		}

		var offsetAttrType = node.getAttr(_node, 1, attrType+".SEPARATE");
  		offsetAttrType.setValueAt(true, 1);

  		var beziers = func.convertToSeparate(path3dColumn, "TRANSFORM_MATRIX");
  		MessageLog.trace('BEZIERS: '+JSON.stringify(beziers,true,'  '));

  		if (offsetAttrType.boolValue()){
			node.unlinkAttr(_node, attrType+".x");
			node.unlinkAttr(_node, attrType+".y");
			node.unlinkAttr(_node, attrType+".z");
		}
		
		node.linkAttr(_node, attrType+".x", beziers[0]);
		node.linkAttr(_node, attrType+".y", beziers[1]);
		node.linkAttr(_node, attrType+".z", beziers[2]);

	}

	//
	/*function _getColumnName( _node, attrName, attrType ){

		var columnName = node.linkedColumn( _node, attrName );
		if( columnName ) return columnName;

		var _attrName = attrName.replace('POSITION.','p').replace('SCALE.','s');
		columnName = Utils.getUnusedColumnName( _node+'_'+_attrName );

		if( !columnName ) {
			MessageLog.trace('Error while creating a column "'+columnName+'" for attribute "'+attrName+'" of node "'+_node+'"');
			return;
		}

		column.add( columnName, "BEZIER" );
		node.linkAttr( _node, attrName, columnName);

		return columnName;
	}


	//
	function _clearColumnValues( columnName ) {
		
		var n = func.numberOfPoints( columnName );
		var keyframes = [];
		for( var i=0; i<n; i++ ){
			keyframes.push( func.pointX( columnName, i ) );
		}
		keyframes.forEach(function(_frame){
			column.clearKeyFrame( columnName, _frame );
		});
	}
*/
}