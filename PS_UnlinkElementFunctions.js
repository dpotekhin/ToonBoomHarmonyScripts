/*
Author: D.Potekhin (https://peppers-studio.ru)
*/
// https://docs.toonboom.com/help/harmony-20/scripting/script/index.html

function PS_UnlinkElementFunctions(){	

	MessageLog.trace("");
	MessageLog.trace('>>> Unlink Attribute Functions : Started');

	var n = selection.numberOfNodesSelected();

	scene.beginUndoRedoAccum('unlinkFunctions');

	for (i = 0; i < n; ++i)
	{
 		var selNode = selection.selectedNode(i);
		
		if( node.isGroup(selNode) ){

			var childNodes = node.subNodes(selNode);
			MessageLog.trace('!! Is GROUP: "'+node.getName(selNode)+'",  children:'+childNodes.length );
			for( gi=0; gi<childNodes.length; gi++){
				_unlinkElementFunctions(childNodes[gi]);	
			}

		}else{
			_unlinkElementFunctions(selNode);
		}
		

		// // Get Node position in the Node View
		// MessageLog.trace('x='+node.coordX(selNode)+', y='+node.coordY(selNode));

 	}

 	scene.endUndoRedoAccum();
 	
 	MessageLog.trace('<<< Unlink Attribute Functions : Ended');
}


//
function _unlinkElementFunctions(selNode){
	var nodeNamePath= selNode.split("/");
	var nodeName = nodeNamePath[nodeNamePath.length - 1];
	// MessageLog.trace(i+") "+nodeName+", "+nodeNamePath  );

	MessageLog.trace("NODE: "+i+") "+nodeName+", ["+node.type(selNode)+"]"  );
	
	var attrs = _getFullAttributeList(selNode);
	for( var ai=0; ai<attrs.length; ai++){
		
		var attrFullName = attrs[ai].fullKeyword();

		if (node.linkedColumn(selNode, attrFullName) != "" && attrFullName != "DRAWING.ELEMENT" ){
			MessageLog.trace("-   UNLINK: "+attrs[ai].name()+" ("+attrFullName+")"+" <"+attrs[ai].typeName()+">");			
			node.unlinkAttr(selNode, attrFullName);
		}
	}
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