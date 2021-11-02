
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
function unlinkFunctions( _node, _columnTypes, _invertColumnTypes, keepCurrentValues ){
  
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

    if( keepCurrentValues ){
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

//
function getUnusedName( _node, nameOnly ){

  if( !node.type(_node) ) return nameOnly ? _node.split('/').pop() : _node;

  var _newName;
  var renameTries = 0;
  var nameIsUnused = false;
  
  do{ // Rename until success omitting existing names
    renameTries++;
    _newName = _node+'_'+renameTries;
    if( !node.type(_newName) ) nameIsUnused = true;    

  }while( !nameIsUnused && renameTries<200 )

  if( !nameIsUnused ) return;
  return nameOnly ? _newName.split('/').pop() : _newName;

}


//
function getValidNodeName( nodeName ){
  return nodeName ? nodeName.replace(/\s/gi,'_').replace(/[^a-zA-Z0-9_-]+/gi,'') : undefined;
}


//
function getNodeParent( _node ){
  if( !_node ) return;
  var parentNode = _node.match(/(.*)\//);
  return ( parentNode && parentNode[1] ) ? parentNode[1] : undefined;
}


//
function getNodesBounds( _nodes ){
  
  var bounds = {
    x:{
      left: 9999999,
      right: -9999999,
    },
    y:{
      bottom: -9999999,
      top: 999999
    }
  };

  _nodes.forEach(function(_node){
    var x = node.coordX(_node);
    var y = node.coordY(_node);
    var w = node.width(_node);
    var wh = w/2;
    var h = node.height(_node);
    var hh = h/2;
    if( bounds.x.right < x ) bounds.x.right = x;
    if( bounds.x.left > x ) bounds.x.left = x;
    if( bounds.y.top > y ) bounds.y.top = y;
    if( bounds.y.bottom < y ) bounds.y.bottom = y;
  });

  bounds.width = bounds.x.right - bounds.x.left;
  bounds.x.center = bounds.x.left + (bounds.width) / 2;
  bounds.height = bounds.y.bottom - bounds.y.top;
  bounds.y.center = bounds.y.top + (bounds.height) / 2;

  return bounds;

}


///
exports = {
  getAttributes: getAttributes,
  getFullAttributeList: getFullAttributeList,
  unlinkFunctions: unlinkFunctions,
  getUnusedName: getUnusedName,
  getValidNodeName: getValidNodeName,
  getNodesBounds: getNodesBounds,
  getNodeParent: getNodeParent,
}