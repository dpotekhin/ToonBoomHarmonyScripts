/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1


Disables and enables the controls of the selected Master Controllers to reinitialize them.


Options:
- Press Control Key to reset extra attributes of selected Master Controllers.
- Press Shift Key to modify UI Data target paths.


Default reset params:
- Label name (adds a space as prefix)
- Widget size
- Font size
- Node Color:
	- Default controller - MC name has no suffix - sets to Red
	- Peg selector - MC name suffix "-P" sets to Green
	- Drawing selector - MC name suffix "-D" sets to Yellow


TODO:


*/


function PS_UpdateMasterController(){

	//
	MessageLog.clearLog();

	//
	var TYPE_DEFAULT = 1;
	var TYPE_PEG_SELECTOR = 2;
 	var TYPE_DRAWING_SELECTOR = 3;

 	var COLORS = [];
 	COLORS[TYPE_DEFAULT] = new ColorRGBA(255, 0, 0, 255);
 	COLORS[TYPE_PEG_SELECTOR] = new ColorRGBA(0, 255, 0, 255);
 	COLORS[TYPE_DRAWING_SELECTOR] = new ColorRGBA(255, 255, 0, 255);

	//
	var selectedNodes = selection.selectedNodes();

	if(!selectedNodes.length){
		MessageBox.warning(
			"Please select at least one Master Controller node.\n"+
			"\nOptions:\n"+
			"- Press Control Key to reset extra attributes of selected Master Controllers.\n"+
			"- Press Shift Key to modify UI Data target paths."
			,0,0,0,"Error");
 		return;
	}

	var targetPrefix;
	if( KeyModifiers.IsShiftPressed() ){ // Set Control extra params
		targetPrefix = Input.getText('Enter the path prefix to the targets:', '~/', '');
		MessageLog.trace( "targetPrefix "+targetPrefix);
		if(targetPrefix){
			targetPrefix = targetPrefix.trim();
			if(targetPrefix.charAt(targetPrefix.length-1)!='/') targetPrefix += '/';
		}
	}

	selectedNodes.forEach(function(_node,i){

 		var nodeType = node.type(_node);
 		if( nodeType != 'MasterController') return;
 		var nodeName = node.getName(_node);

 		// MessageLog.trace(i+') '+nodeName+', '+nodeType);
 		// MessageLog.trace('>'+node.getAllAttrKeywords(_node).join('\n'));

 		var mcType;
 		var nameSuffix = nodeName.substr(nodeName.length-2,nodeName.length);
 		switch(nameSuffix){
 			case '-D': mcType = TYPE_DRAWING_SELECTOR; break;
 			case '-P': mcType = TYPE_PEG_SELECTOR; break;
 			default: mcType = TYPE_DEFAULT;
 		}
 		MessageLog.trace(i+') '+nodeName+', '+nodeType+' ['+nameSuffix+'] '+mcType);
 		// node.setColor(exNode, newColor);
 		
 		var sizeAttr = node.getAttr(_node, 1, 'size');
 		var labelSizeAttr = node.getAttr(_node, 1, 'label_size');
 		var labelAttr = node.getAttr(_node, 1, 'label');
 		var controlsModeAttr = node.getAttr(_node, 1, 'SHOW_CONTROLS_MODE');
 		var uiDataAttr = node.getAttr(_node, 1, 'UI_DATA');

 		// MessageLog.trace('>'+controlsModeAttr.name()+': '+controlsModeAttr.typeName()+', '+controlsModeAttr.keyword()+', '+controlsModeAttr.textValue() );
 		// MessageLog.trace('>'+sizeAttr.name()+': '+sizeAttr.typeName()+', '+sizeAttr.keyword()+', '+sizeAttr.textValue() );
 		// MessageLog.trace('>'+labelSizeAttr.name()+': '+labelSizeAttr.typeName()+', '+labelSizeAttr.keyword()+', '+labelSizeAttr.textValue() );
 		//MessageLog.trace('>'+uiDataAttr.name()+': '+uiDataAttr.typeName()+', '+uiDataAttr.keyword()+', '+uiDataAttr.textValue() );

 		// Reset
 		controlsModeAttr.setValue('Normal');

 		node.showControls(_node, false);

 		// Set
 		controlsModeAttr.setValue('Always');
 		
 		if( KeyModifiers.IsControlPressed() ){ // Reset Control extra params
	 		
	 		sizeAttr.setValue(0.5);
	 		
	 		labelSizeAttr.setValue(16);

	 		// Label name
	 		var labelText = labelAttr.textValue();
	 		if(labelText.charAt(0)!=' ') labelText = ' '+labelText;
	 		if(labelText.indexOf(' mc_')===0) labelText = ' '+labelText.substr(4,labelText.length);
	 		// MessageLog.trace('>>>>'+labelText+' ['+labelText.charAt(0)+']');
	 		labelAttr.setValue(labelText);

	 		node.setColor(_node, COLORS[mcType] );

	 	}

	 	if( targetPrefix ){
	 		var uiData = JSON.parse(uiDataAttr.textValue());
	 		if( uiData && uiData.targetNodes){
		 		uiData.targetNodes = uiData.targetNodes.map(function(item,i){
		 			var itemObj = item.split('/').pop();
		 			// MessageLog.trace(i+': '+item+', '+itemObj);
		 			return targetPrefix+itemObj;
		 		});
		 	}
		 	uiData = JSON.stringify(uiData, null, '  ');
		 	//MessageLog.trace('>> '+uiData);
		 	uiDataAttr.setValue(uiData);
	 	}

	 	//
 		node.showControls(_node, true);

	});	
}