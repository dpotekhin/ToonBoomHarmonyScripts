/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1
*/

//
function getTimestamp(){
    var date = new Date();
    return date.getFullYear() + getZeroLeadingString(date.getMonth()+1) + getZeroLeadingString(date.getDate())+'_'+getZeroLeadingString(date.getHours())+getZeroLeadingString(date.getMinutes());
};


//
function getZeroLeadingString(v){
  return v<10 ? '0'+v : v;
}

//
// TODO: I Did not find yet how to convert Drawing Grid coordinates to pixels.
var gridWidth = 1875;

function gridToPixelsX(x){
    return x / (scene.numberOfUnitsX()/2) * ( gridWidth * (scene.unitsAspectRatioX()/scene.unitsAspectRatioY()) );
}

function gridToPixelsY(y){
    return y / (scene.numberOfUnitsY()/2) * gridWidth;
}

function pixelsToGridX(x){
    return x / ( gridWidth * (scene.unitsAspectRatioX()/scene.unitsAspectRatioY()) ) * (scene.numberOfUnitsX()/2);
}

function pixelsToGridY(y){
    return y / gridWidth * (scene.numberOfUnitsY()/2);
}

//
function getPointGlobalPosition( _node, _point, _frame ){
  if( !_frame ) _frame = frame.current();
  if( !_point ) _point = node.getPivot( _node, _frame );
  var nodeMatrix = node.getMatrix( _node, _frame );
  var pos = nodeMatrix.multiply(_point);
  pos = scene.fromOGL( pos );
  return pos;
}

function findParentPeg( _node )
{
    var numSubNodes = node.numberOfSubNodes( _node );    
    var src = node.srcNode( _node, 0 );      
    for ( var nd = 0; nd < numSubNodes; nd++ )
    {
        if( src == "" )
            return "";

        else if( node.type( src ) == "PEG" )
            return src;

        src = node.srcNode( src, 0 );
    }
    return "";
}


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
function getFullAttributeList( nodePath, frame, onlyNames )
{
  var attributeList = [];
  var topAttributeList = node.getAttrList(nodePath, frame);
  for (var i = 0; i < topAttributeList.length; ++i)
  {
    getAttributes(topAttributeList[i], attributeList);
  }
  if( onlyNames ){
    attributeList = attributeList.map(function(attr){
        return attr.fullKeyword();
    });
  }
  return attributeList;
}

//
exports = {
    gridWidth: gridWidth,
    getTimestamp: getTimestamp,
    getZeroLeadingString: getZeroLeadingString,
    gridToPixelsX: gridToPixelsX,
    gridToPixelsY: gridToPixelsY,
    pixelsToGridX: pixelsToGridX,
    pixelsToGridY: pixelsToGridY,
    getPointGlobalPosition: getPointGlobalPosition,
    findParentPeg: findParentPeg,
    getFullAttributeList: getFullAttributeList
};