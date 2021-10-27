/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.211027
*/

//
function PS_CopyNodesPaths( namesOnly ){

	if( namesOnly === undefined ) namesOnly = KeyModifiers.IsControlPressed();

	var result = ''+selection.selectedNodes().map(function(_node){
		return (namesOnly ? node.getName(_node) : _node);
	}).join('\n');	

	QApplication.clipboard().setText(result);

	MessageLog.trace('Selected Nodes Paths: '+result);

}
