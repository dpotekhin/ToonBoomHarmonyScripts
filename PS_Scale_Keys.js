/*
Author: D.Potekhin (d@peppers-studio.ru)
*/
// https://docs.toonboom.com/help/harmony-20/scripting/script/index.html

function PS_ScaleKeys(){
	MessageLog.trace("");
	MessageLog.trace('>>> PS_ScaleKeys: Started '+selection.isSelectionRange() );


	var n = selection.numberOfNodesSelected();

	var params = {};
	params.oldStartFrame = selection.startFrame(); // The first selected frame
	params.duration = selection.numberOfFrames(); 
	params.oldEndFrame = params.oldStartFrame + params.duration - 1; // The last selected frame
	params.totalFrames = frame.numberOf();

	// >>> Dialog
	var d = new Dialog;
	d.title = "Modify Keyframes in Range";
	
	var group = new GroupBox;
	d.add(group);

	// var userInput = new CheckBox();
	// userInput.text = "Is this guide helpful?"

	d.newColumn();

	// Old
	var groupOld = new GroupBox;
	groupOld.title = 'Modify frame range below:';
	group.add(groupOld);

	var oldStartFrameLE = new NumberEdit;
	oldStartFrameLE.decimals = 0;
	oldStartFrameLE.value = params.oldStartFrame;
	oldStartFrameLE.label = "Start Frame:";
	groupOld.add(oldStartFrameLE );

	var oldEndFrameLE = new NumberEdit;
	oldEndFrameLE.decimals = 0;
	oldEndFrameLE.value = params.oldEndFrame;
	oldEndFrameLE.label = "End Frame:";
	groupOld.add(oldEndFrameLE );
	
	// ---
	group.newColumn();
	//group.addSpace(5);
	// ---

	// New
	var groupNew = new GroupBox;
	groupNew.title = 'to:';
	group.add(groupNew);

	var newStartFrameLE = new NumberEdit;
	newStartFrameLE.value = params.oldStartFrame;
	newStartFrameLE.label = "Start Frame:";
	groupNew.add(newStartFrameLE );

	var newEndFrameLE = new NumberEdit;
	newEndFrameLE.value = params.oldEndFrame;
	newEndFrameLE.label = "End Frame:";	
	groupNew.add( newEndFrameLE);



	// Checkers
	group.newColumn();

	var groupCheck = new GroupBox;
	groupCheck.title = 'Move out of range frames?';
	group.add(groupCheck);
	groupCheck.addSpace(5);

	var movePrevLE = new CheckBox();
	movePrevLE.text = "Previous"
	groupCheck.add(movePrevLE);
	
	groupCheck.addSpace(7);

	var moveNextLE = new CheckBox();
	moveNextLE.text = "Next"
	groupCheck.add(moveNextLE);

	var rc = d.exec();

	if (!rc)
	{
	   return;
	}

	params.oldStartFrame = oldStartFrameLE.value;
	params.oldEndFrame = oldEndFrameLE.value;
	params.newStartFrame = newStartFrameLE.value;
	params.newEndFrame = newEndFrameLE.value;
	params.startOffset = params.newStartFrame - params.oldStartFrame;
	params.endOffset = params.newEndFrame - params.oldEndFrame;
	params.rangeScale = (params.newEndFrame - params.newStartFrame) / (params.oldEndFrame - params.oldStartFrame);
	params.movePrevFrames = movePrevLE.checked;
	params.moveNextFrames = moveNextLE.checked;
	if( params.oldStartFrame == params.newStartFrame && params.oldEndFrame == params.newEndFrame ) return;

	MessageLog.trace(' >\n totalFrames: '+params.totalFrames+',\n oldStartFrame:'+params.oldStartFrame+',\n oldEndFrame:'+params.oldEndFrame+',\n newStartFrame:'+params.newStartFrame+',\n newEndFrame:'+params.newEndFrame+',\n startOffset:'+params.startOffset+',\n endOffset:'+params.endOffset+',\n rangeScale:'+params.rangeScale+',\n movePrevFrames:'+params.movePrevFrames+',\n moveNextFrames:'+params.moveNextFrames);
	// <<< Dialog


	
	for (i = 0; i < n; ++i)
	{
 		var selNode = selection.selectedNode(i);
		
		

		// TODO: Get all children. subNodes - works only with Groups ;(

		if( node.isGroup(selNode) ){
			// Process children 
			var childNodes = node.subNodes(selNode);
			MessageLog.trace('!! Children:'+ childNodes );
			// MessageLog.trace('!! Is GROUP: "'+node.getName(selNode)+'",  children:'+childNodes.length );
			if( childNodes && childNodes.length ){
				for( gi=0; gi<childNodes.length; gi++){
					_processNode(childNodes[gi], params );	
				}
			}
		}else{
			 _processNode(selNode, params );
		}

 	}

 	MessageLog.trace('<<< PS_ScaleKeys: Ended');

}


//
function _processNode( selNode, params ){
	
	// if( selNode.type(selectedNode) == "READ" ) return;

	var nodeNamePath= selNode.split("/");
	var nodeName = nodeNamePath[nodeNamePath.length - 1];

	MessageLog.trace("NODE: "+i+") "+nodeName+", ["+node.type(selNode)+"]"  );

	var attrs = _getFullAttributeList(selNode);

	scene.beginUndoRedoAccum('ScaleKeys');

	for( var ai=0; ai<attrs.length; ai++){
		
		var _attr = attrs[ai];
		var attrFullName = _attr.fullKeyword();

		if (node.linkedColumn(selNode, attrFullName) != "" ){
			var _columnName = node.linkedColumn(selNode, attrFullName);
			MessageLog.trace("-   LINK: "+_attr.name()+", "+_columnName+', '+column.getDisplayName(_columnName) );
			_processColumn( _columnName, params );
		}
	}

	scene.endUndoRedoAccum();

}

//
function _processColumn( _columnName, params ){
	
	MessageLog.trace(' -> Column: '+ column.getDisplayName(_columnName) );

	var keyframes = [];
	var newFrame;
	var moveFrame;

	// Get Keyframes
	for( var i=params.totalFrames; i>=0; i--){

		// TODO: Get key exposures
		// TODO: Get easing functions

		var isKeyFrame = column.isKeyFrame(_columnName, 1, i);

		if( isKeyFrame ){

			var value = column.getEntry(_columnName, 1, i);
			var velocity = column.getEntry(_columnName, 2, i);
			moveFrame = false;

			if( i > params.newEndFrame ) {
				if( params.moveNextFrames ){
					newFrame = Math.round(i+params.endOffset);
					moveFrame = true;
				}
			}else if( i >= params.newStartFrame ) {
				newFrame = Math.round( (i - params.oldStartFrame)*params.rangeScale + params.newStartFrame );
				moveFrame = true;
			}else if( params.movePrevFrames ) {
				newFrame = Math.round(i + params.startOffset);
				moveFrame = true;
			}

			if( !moveFrame ) continue;

			column.clearKeyFrame( _columnName, i );

			// column.setKeyFrame(_columnName,i);
			keyframes.push({
				frame: newFrame,
				value: value,
				velocity: velocity
			});
			MessageLog.trace('keyFrame at '+i+', value:'+value+', newFrame:'+newFrame+' velocity:'+velocity );
		}
	}

	// Set Keyframe
	for( var i=0; i<keyframes.length; i++){
		var keyframe = keyframes[i];
		column.setEntry(_columnName, 1, keyframe.frame, keyframe.value );
		column.setKeyFrame(_columnName, keyframe.frame );
	}

	// var entry = column.getEntry(_columnName, 1, 1000);
	//MessageLog.trace(" - val: "+entry+', '+ column.isKeyFrame(_columnName, 1, 10) );
	// MessageLog.trace("-   LINK: "+attrs[ai].name()+" ("+attrFullName+")"+" <"+attrs[ai].typeName()+">");	
}

///
function _getAttributes(attribute, attributeList)
{
  attributeList.push(attribute);
  var subAttrList = attribute.getSubAttributes();
  for (var j = 0; j < subAttrList.length; ++j)
  {
    if(typeof(subAttrList[j].keyword()) === 'undefined' || subAttrList[j].keyword().length == 0)
      continue;
    _getAttributes(subAttrList[j], attributeList);
  }
}

function _getFullAttributeList(nodePath)
{
  var attributeList = [];
  var topAttributeList = node.getAttrList(nodePath, 1);
  for (var i = 0; i < topAttributeList.length; ++i)
  {
    _getAttributes(topAttributeList[i], attributeList);
  }
  return attributeList;
}