/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.211025
*/

var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/NodeUtils.js"));

//
function PS_FixNodeName(){

	scene.beginUndoRedoAccum("Fix Node Name");

	SelectionUtils.eachSelectedNode(function(_node,i){

		var parent = node.parentNode(_node);
		var name = node.getName(_node);
		var prefix = name.substr(0,2);
		MessageLog.trace(i+') '+_node+' ('+name+') ['+prefix+']');

		// if has Prefix
		if( ['r-','l-','u-','b-'].indexOf(prefix) !== -1 ){
			name = name.substr(2,name.length);
		}else{
			prefix = '';
		}

		// Make first letter capital
		name = prefix + name.charAt(0).toUpperCase() + name.substr(1,name.length);

		// Remove index
		name = name.replace(/_\d\d?$/,'');
		// MessageLog.trace(name);

		// Fix suffixes
		name = name.replace(/[_-]\w?$/,function(a,b,c,d){
			// MessageLog.trace(a+', '+b+', '+c+', '+d);
			return a.replace('_','-').toUpperCase();
		});

		name = NodeUtils.getUnusedName( parent+'/'+name, true );

		MessageLog.trace( name );

		node.rename( _node, name );

	});

	scene.endUndoRedoAccum();

}