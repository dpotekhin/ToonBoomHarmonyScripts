
//
function getAttributes(attribute, attributeList)
{
  attributeList.push(attribute);
  var subAttrList = attribute.getSubAttributes();
  for (var j = 0; j < subAttrList.length; ++j)
  {
    if(typeof(subAttrList[j].keyword()) === 'undefined' || subAttrList[j].keyword().length == 0)
      continue;
    getAttributes(subAttrList[j], attributeList);
  }
}


//
function getFullAttributeList(nodePath)
{
  var attributeList = [];
  var topAttributeList = node.getAttrList(nodePath, 1);
  for (var i = 0; i < topAttributeList.length; ++i)
  {
    getAttributes(topAttributeList[i], attributeList);
  }
  return attributeList;
}


//
function unlinkFunctions( _node, _columnTypes, _invertColumnTypes, leaveCurrentValues ){
  
  var nodeNamePath= _node.split("/");
  var nodeName = nodeNamePath[nodeNamePath.length - 1];
  // MessageLog.trace(i+") "+nodeName+", "+nodeNamePath  );

  MessageLog.trace("NODE: "+i+") "+nodeName+", ["+node.type(_node)+"]"  );
  
  var attrs = getFullAttributeList(_node);
  for( var ai=0; ai<attrs.length; ai++){
    
    var attr = attrs[ai];
    var attrFullName = attr.fullKeyword();

    var linkedColumn = node.linkedColumn(_node, attrFullName);
    if ( !linkedColumn ) continue;

    var columnType = column.type(linkedColumn);
    // MessageLog.trace('--> columnType: "'+columnType+'", '+attr.name()+" ("+attrFullName+")"+" <"+attr.typeName()+">");

    if( _columnTypes ){
      
      if( _invertColumnTypes ){ // Skip provided column types
        
        if( _columnTypes.indexOf(columnType) !== -1 ) continue;

      }else{ // Skip all except provided column types

        if( _columnTypes.indexOf(columnType) === -1 ) continue;

      }

    }

    // if ( linkedColumn && attrFullName != "DRAWING.ELEMENT" ){
    MessageLog.trace("-   UNLINK: "+attr.name()+" ("+attrFullName+")"+" <"+attr.typeName()+" > "+currentValue+' ('+typeof currentValue+')');    

    node.unlinkAttr(_node, attrFullName);

    if( leaveCurrentValues ){
      var currentValue = column.getEntry( linkedColumn, 0, frame.current() );
      if( numberTypes.indexOf( typeof attr.typeName() ) === -1 ) currentValue = parseFloat(currentValue);
      MessageLog.trace('Apply Column Value: '+currentValue+' > '+typeof currentValue );
      attr.setValue( currentValue );
    }
  
  }
}

var numberTypes = ['DOUBLEVB','DOUBLE','INT'];

//
function getAttributeValue( attr ){
  switch( attr.typeName() ){
    case 'DOUBLE':
    case 'DOUBLEVB':
      return attr.doubleValue();
    case 'INT':
      return attr.intValue();
    case 'STRING':
      return attr.textValue ()
  }
}


///
exports = {
  getAttributes: getAttributes,
  getFullAttributeList: getFullAttributeList,
  unlinkFunctions: unlinkFunctions
}