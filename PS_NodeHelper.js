function PS_CopyNodeName(){

	var selectedNode = selection.selectedNodes()[0];
	QClipboard.setText(selectedNode);
	MessageLog.trace('selectedNode: '+selectedNode);
}
