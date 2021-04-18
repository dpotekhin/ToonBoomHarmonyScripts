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
function listAllActions( _responder ){
    Action.getResponderList().forEach(listActions);
}

//
function listActions( _responder, _responder_i ){
    if( !_responder_i ) _responder_i = 0;
    MessageLog.trace( '\n\nRESPONDER ('+(_responder_i+1)+'): "'+_responder+'"'  );
    Action.getActionList( _responder ).forEach(function( _action, _action_i ){
        MessageLog.trace( (_action_i+1)+'): "'+_action+'"'  );
    });
}

//
exports = {
    gridWidth: gridWidth,
    listAllActions: listAllActions,
    listActions: listActions,
    getTimestamp: getTimestamp,
    getZeroLeadingString: getZeroLeadingString,
    gridToPixelsX: gridToPixelsX,
    gridToPixelsY: gridToPixelsY,
    pixelsToGridX: pixelsToGridX,
    pixelsToGridY: pixelsToGridY,
};