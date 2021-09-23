/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210923
*/

// var DevHelpers = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_DevHelpers.js"));

var myController = Controller;

var valueSourceNode;
var valueSourceColumnId;
var drawingNode;
var drawingColumnId;
var valueSourceNodeAttributeName;
var drawingSubstitutionSet;
var allDataIsValid;

var controllerData;


//
Controller.onShowControl = function()
{  
  // MessageLog.trace('MC onShowControl');
  try{
  checkMCSettings();
  updateData();
  updateState();

  }catch(err){ MessageLog.trace('PS_MC_DrawingSubstitutionSwitcher: onShowControl: Error: '+err); }

  // MessageLog.trace('MC onShowControl '+JSON.stringify(myController, true, '  ') );
  // DevHelpers.PS_TraceAllAttributesOfNode( myController.node );

}

/*
Controller.onHideControl = function()
{  
  // MessageLog.trace('MC onHideControl');
}
*/

Controller.onFrameChanged = function()
{
  // MessageLog.trace('MC onFrameChanged');
  updateState();
}

Controller.onNodeChanged = function()
{

  try{

  // MessageLog.trace('MC onNodeChanged');
  
  updateData();
  traceControllerData();

  updateState();

  }catch(err){ MessageLog.trace('PS_MC_DrawingSubstitutionSwitcher: onNodeChanged: Error: '+err); }

}


//
function updateData(){

  // Value Source Node
  valueSourceNode = getParentNode(0);
  if( !valueSourceNode ) return;

  // Value Source Node Attribute Name
  valueSourceNodeAttributeName = node.getTextAttr( myController.node, 1, 'ValueSourceNodeAttributeName');
  if( !valueSourceNodeAttributeName ) return;

  // Value Source Column
  valueSourceColumnId = node.linkedColumn( valueSourceNode, valueSourceNodeAttributeName );
  if( !valueSourceColumnId ) return;

  // Drawing Node
  drawingNode = getParentNode( 1, 'READ' );
  if( !drawingNode ) return;
  
  drawingColumnId = node.linkedColumn(drawingNode,"DRAWING.ELEMENT");
  if( !drawingColumnId ) return;

  // Controller UI Data
  try{
    
    controllerData = node.getTextAttr( myController.node, 1, 'UI_DATA') || '';
    controllerData = JSON.parse( controllerData );
  
  }catch(err){ MessageLog.trace('PS_MC_DrawingSubstitutionSwitcher: updateData: Error: '+err); }
  
  if( !controllerData || !controllerData.drawingSubstitutionSets ) return;

  // Drawing Sub Set
  drawingSubstitutionSet = node.getTextAttr( myController.node, 1, 'DrawingSubstitutionSet') || 'default';

  //
  allDataIsValid = true;

}

//
function updateState(){

  if( !node.getEnable( myController.node ) ){
    MessageLog.trace('PS_MC_DrawingSubstitutionSwitcher: node is disabled.' );
    return;
  }

  if( !allDataIsValid ) {
    MessageLog.trace('PS_MC_DrawingSubstitutionSwitcher: updateState: Error: Controller data is not valid.' );
    traceControllerData();
    return;
  }

  MessageLog.trace('updateState > ' );

  // MessageLog.trace( JSON.stringify(controllerData, true, '  ' ) );

  var currentFrame = frame.current();

  var currentValue = column.getEntry( valueSourceColumnId, 1, currentFrame );
  var currentEntry = column.getEntry( drawingColumnId, 1, currentFrame );
  if( !currentEntry ){ // Empty entry

    // Find previous key
    for( var f=currentFrame-1; f>=0; f-- ){
      // MessageLog.trace('back frame: '+f);
      var prevEntry = column.getEntry( drawingColumnId, 1, f );
      if( prevEntry ){
        // MessageLog.trace('Prev filled frame: '+f);
        currentEntry = prevEntry;
        break;
      }
    }
    // MessageLog.trace('Prev filled frame found: '+f);
    if( f==0 ){
      // MessageLog.trace('No filled frame found: '+f);
    }else{
      column.fillEmptyCels( drawingColumnId, f, currentFrame+1);
    }
  }

  var setData = controllerData.drawingSubstitutionSets[drawingSubstitutionSet];

  var setDataSteps = Object.keys(setData).sort();
  var setDataStepIndex = 0;
  setDataSteps.every(function(_step,i){
    setDataStepIndex = i;
    if( _step <= currentValue ) return true;
  });
  var setDataEntries = setData[ setDataSteps[ setDataStepIndex ] ];

  MessageLog.trace('Current Value: '+ currentValue+',\nCurrent Entry: '+currentEntry+',\nsetDataEntries: '+setDataEntries+'\n'+JSON.stringify(setData,true,'  ') );

  if( !setDataEntries ) return;
  if( typeof setDataEntries === 'string' ) setDataEntries = [setDataEntries];

  if( setDataEntries.indexOf( currentEntry ) !== -1 ) {
    MessageLog.trace('Same entry - skipped');
    return;
  }

  column.setEntry( drawingColumnId, 1, currentFrame, setDataEntries[ ~~(Math.random() * setDataEntries.length) ] );

}


//
function getParentNode( i, nodeType ){

  var _node = node.srcNode(myController.node, i || 0 );
  if( !_node ) return;
  if( nodeType ) return node.type(_node) === nodeType ? _node : undefined;
  return _node;

}

function traceControllerData(){

  MessageLog.trace('allDataIsValid: '+allDataIsValid);
  MessageLog.trace('valueSourceNode: '+valueSourceNode);
  MessageLog.trace('drawingNode: '+drawingNode);
  MessageLog.trace('drawingColumnId: '+drawingColumnId);
  MessageLog.trace('valueSourceColumnId: '+valueSourceColumnId);
  MessageLog.trace('controllerData: '+JSON.stringify(controllerData,true,'  '));

}

///
function checkMCSettings(){
  MessageLog.trace('1 >>>>>'+node.getTextAttr( myController.node, 1, 'SPECS_EDITOR') );
  MessageLog.trace('2 >>>>>'+node.getTextAttr( myController.node, 1, 'SPECS_EDITOR').indexOf('DrawingSubstitutionSwitcher') );
  if( node.getTextAttr( myController.node, 1, 'SPECS_EDITOR').indexOf('DrawingSubstitutionSwitcher') === -1 ){

    node.setTextAttr( myController.node, 'SPECS_EDITOR', 1,
      [
        '<specs>',
        '<type name="DrawingSubstitutionSwitcher"/>',
        '<ports>',
        '  <in type="PEG" title="Value Source Node"/>',
        '  <in type="IMAGE" title="Target Drawing"/>',
        '</ports>',
        '<attributes>',
        '  <attr type="STRING" name="Value Source Node Attribute Name" value="" tooltip="The name of Value Source node attribute."/>',
        '  <attr type="STRING" name="Drawing Substitution Set" value="default" tooltip="The name of a set of correspondences of Drawing substitutions to input values."/>',
        '</attributes>',
        '</specs>'
      ].join('\n')
    );
    MessageLog.trace('3 >>>>>'+node.getTextAttr( myController.node, 1, 'SPECS_EDITOR') );
  }


  if( node.getTextAttr( myController.node, 1, 'UI_DATA').indexOf('DrawingSubstitutionSwitcher') === -1 ){
    
    var entries = [];
    
    var drawingNode = getParentNode( 1, 'READ' );
    if( drawingNode ) {
      var elementId = node.getElementId(drawingNode);
      if( elementId ){
        // var drawingColumnId = node.linkedColumn(drawingNode,"DRAWING.ELEMENT");
        
        var n = Drawing.numberOf( elementId );
        for( var i=0; i<n; i++ ) {
          entries.push( Drawing.name( elementId, i ) );
        }
        var entryStep = 1 / entries.length;
        entries = entries.map( function( entry, i ){
          return '      "'+ ( entryStep + entryStep * i ).toPrecision(2) +'": "'+entry+'"';
        });
      }
    }

    node.setTextAttr( myController.node, 'UI_DATA', 1,
      [
      '{',
      '  "drawingSubstitutionSets":{',
      '    "default": {',
      entries.join(',\n'),
      '    },',
      '    "example": {',
      '      "0.2": "Default",',
      '      "1": ["5","6"]',
      '    }',
      '  }',
      '}'
      ].join('\n')
    );

  }
  

}