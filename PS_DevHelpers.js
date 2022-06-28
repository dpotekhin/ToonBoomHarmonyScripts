function PS_TraceAllAttributesOfNode( _node ){

    if( !_node ) {
        _node = selection.selectedNode(0);
        MessageLog.clearLog();
    }

    var attributes = PS_GetNodeAttributesNames( _node );
    var currentFrame = frame.current();

    var output = '';

    attributes.forEach(function(attrName,i){
        
        var attr = node.getAttr( _node, currentFrame, attrName );
        
        var type = attr.typeName();
        
        var value;
        switch( type ){
            case 'BOOL': value = attr.boolValueAt(currentFrame); break;
            case 'INT': value = attr.intValueAt(currentFrame); break;
            case 'DOUBLE':
                value = attr.doubleValueAt(currentFrame); break;
            case 'STRING':
            case 'GENERIC_ENUM':
            case 'DRAWING':
            case 'ELEMENT':
                value = attr.textValueAt(currentFrame); break;
            case 'POSITION_2D': value = attr.pos2dValueAt(currentFrame); break;
            case 'POSITION_3D':
            case 'ROTATION_3D':
                value = attr.pos3dValueAt(currentFrame); break;
            case 'COLOR': value = attr.colorValueAt(currentFrame); break;
        };

        output += (i+1)+') "'+attrName+'" ['+type+']\n'
            + '- text value: "'+node.getTextAttr( _node, currentFrame, attrName ) +'"\n'
            +'- value: '+ JSON.stringify(value, true, '  ') +'\n'
        ;

        var linkedColumn = node.linkedColumn(_node, attrName );
        if( linkedColumn ) output += '- column: "'+linkedColumn+'"\n';

    });

    MessageLog.trace( 'Attributes of node "'+_node+'" ('+node.type(_node)+') :\n'+output );
}


//
    

function PS_GetNodeAttributesNames(_node)
{
    
    function getAttributes(attribute, attributeList, keyword )
    {
    
        var subAttrList = attribute.getSubAttributes();
        for (var j = 0; j < subAttrList.length; ++j){
            if(typeof(subAttrList[j].keyword()) === 'undefined' || subAttrList[j].keyword().length == 0)
            continue;
            getAttributes(subAttrList[j], attributeList, keyword+'.'+subAttrList[j].keyword() );
        }
        attributeList.push( keyword );
    }

    var attributeList = [];
    var topAttributeList = node.getAttrList(_node, 1);
    for (var i = 0; i < topAttributeList.length; ++i){
        getAttributes(topAttributeList[i], attributeList, topAttributeList[i].keyword() );
    }

    return attributeList;

}



// =============================================================

// https://github.com/shhlife/harmony/blob/master/ResponderLists.md
//
function PS_ListAllActions(){
    var s = '';
    Action.getResponderList().forEach(function(_responder,i){
        s += listActions( _responder, i );
    });
    MessageLog.clearLog();
    MessageLog.trace( s );
}

//
function listActions( _responder, _responder_i ){
    if( !_responder_i ) _responder_i = 0;
    var s = '\n==============================\n'
    s += (_responder_i+1)+'): "'+_responder+'"\n';
    s += '-----------------------------\n';
    Action.getActionList( _responder ).forEach(function( _action, _action_i ){
       s += (_action_i+1)+'): "'+_action+'"\n'; 
    });
    return s;
}

// =============================================================
exports = {
    PS_TraceAllAttributesOfNode: PS_TraceAllAttributesOfNode,
    PS_GetNodeAttributesNames: PS_GetNodeAttributesNames,
    PS_ListAllActions: PS_ListAllActions
}