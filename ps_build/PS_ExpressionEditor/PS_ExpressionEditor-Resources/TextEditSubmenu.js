/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210728

Context menu of the Expression editor
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_ExpressionEditor-Resources/ps/Utils.js"));


//
function initSubmenu( editor ){

  var skippedAttributeNames = [
    'DRAWING.ELEMENT',
    'SCALE.XY',
  ];

  var attributeNameFixes = [
    ['POSITION.',''],
    ['OFFSET.',''],
    ['ROTATION.',''],
    ['SCALE.','Scl'],
    ['SKEW','Scw'],
    ['DEPTH','Dpt'],
    ['MULT_LINE_ART_THICKNESS','MuLAT'],
    ['ADD_LINE_ART_THICKNESS','ALAT'],
    ['MIN_LINE_ART_THICKNESS','MnLAT'],
    ['MAX_LINE_ART_THICKNESS','MxLAT'],
    ['MORPHING_VELO','MphV'],
    ['ANGLE','A'],
    ['OPACITY','Opc'],
  ];

  //
  var chunks = {
    
    fixedFrameRateBy2: "var holdFrame = 2;\nfloor( (currentFrame - .5 ) / holdFrame ) * holdFrame + 1",

    fixedFrameRateBy2Offset: "var offsetFrame = 1;\nvar holdFrame = 3;\nMath.max( 1, floor( (currentFrame - .5 - offsetFrame ) / holdFrame ) * holdFrame + 1 + offsetFrame )",

  };

  //
  var submenuFlatList = {};

  //
  var submenuConfig = {

    '-': 1,
    "Current Expression": getMenuItemsCurrentExpression,

    // Selected node Columns
    "Selected Node":{
      
      "!Show Node Properties": function (){ Action.perform("onActionEditProperties()", "scene") },

      "Get Linked Columns": getMenuItemsForLinkedColumns,

    // Create Expressions For Selected Node
    // "!Create Expressions For Selected Node": createExpressionsForSelectedNode,

      "Link Expression": getMenuItemsForLinkExpression,

      "Create Expression": getMenuItemsForCreateExpression,

    },

    // Functions
    'Functions':{

      "currentFrame": "currentFrame",
      "numFrames": "numFrames",

      "--0": "",
      "sin (angle)": "sin (angle)",
      "cos (angle)": "cos (angle)",
      "tan (angle)": "tan (angle)",
      "asin( v )": "asin( v )",
      "acos( v )": "acos( v )",
      "atan( v )": "atan( v )",
      "atan2( x, y )": "atan2( x, y )",
      "int ( v )": "int ( v )",
      "ceil( v )": "ceil( v )",
      "floor( v )": "floor( v )",
      "abs( v )": "abs( v )",
      "sqrt( v )": "sqrt( v )",
      "exp( v )": "exp( v )",
      "ln( v )": "ln( v )",
      "ln( v )": "ln( v )",

      "--1": "",
      "Math.min( a, ... )": "Math.min( a, b )",
      "Math.max( a, ... )": "Math.max( a, b )",
      "Math.random() * v": "Math.random() * v",
      "Math.PI": "Math.PI",
      "Math.pow( base, exponent )": "Math.pw( base, exponent )",    

      "--2": "",
      "value( columnName )": "value( columnName )",
      "value( columnName, frame )": "value( columnName, frame )",
      "column( columnName )": "column( columnName )",
    },

    // Actions
    'Actions': {

      '!Create Constants Expressions (0 and 1)': function(editor){
        var result0 = editor.createExpression('CONST_0','0');
        var result1 = editor.createExpression('CONST_1','1');
        if( !result0 && !result1 ) editor.showOutputMessage('"CONST_0" and "CONST_1" already exists','',false);
        else if( result0 ) editor.showOutputMessage( (result0 ? '"CONST_0 created. "' : '') + (result1 ? '"CONST_0 created. "' : ''),'',true);
      },

      '!Create Fixed Frame Rate on 2s Expression': createFixedFrameRateBy2Expression

    },

    // Examples
    'Examples': {

      "Pendulum": "var speedCoef = 0.5;\nvar amp = 2;\nMath.sin( currentFrame * speedCoef ) * amp;",

      "Random": "var minRandomValue = 2;\nvar maxRandomValue = 5;\nMath.random() * (maxRandomValue - minRandomValue) + minRandomValue;",

      "Wiggle": "// Wiggle expression\nvar seedOffset = 0; // Random seed offset\nvar amp = 100; // Amplitude\nvar freq = 5; // Random value changes every N-th frame\n\nfunction seedrandom( seed ) { // Seeded Random Generator\n    var x = Math.sin(seed + seedOffset) * 10000;\n    return x - Math.floor(x);\n}\n\nfunction interpolate(pa, pb, px){ // Interpolator\n  var ft = px * Math.PI, f = (1 - Math.cos(ft)) * 0.5;\n  return pa * (1 - f) + pb * f;\n}\n\nvar _currentFrame = ~~(currentFrame / freq);\nvar _currentRandom = seedrandom( _currentFrame );\nvar _prevRandom = seedrandom( _currentFrame - 1 );\ninterpolate(_prevRandom, _currentRandom, (currentFrame % freq) / freq) * amp; // Noise result",

      "Fixed Frame Rate by 2": chunks.fixedFrameRateBy2,
      "Fixed Frame Rate by 2 with Offset": chunks.fixedFrameRateBy2Offset,

      "Degrees to Radians": "var DEG2RAD = Math.PI / 180;",

      "Radians to Degrees": "var RAD2DEG = 180 / Math.PI;",

    }

  };


  //
  editor.textEdit.contextMenuEvent = function(event){
    
      try{ // !!!

      var menu = editor.textEdit.createStandardContextMenu();
      
      createSubmenu( menu, submenuConfig );
      
      menu.triggered.connect(function(a){
        // MessageLog.trace('clicked '+a.text);
        var submenuItemData = submenuFlatList[a.text];

        if( typeof submenuItemData === 'string' ) editor.textEdit.textCursor().insertText(submenuItemData);
        else submenuItemData( editor );

      });
      
      menu.exec(event.globalPos());
      delete menu;
      
      }catch(err){MessageLog.trace(err)} // !!!

  }

  //
  function createSubmenu( menu, submenuData ){

    Object.keys( submenuData ).forEach(function( submenuItemName ){
        
        var submenuItemData = submenuData[submenuItemName];

        // MessageLog.trace('!! '+submenuItemName+' >> '+Utils.isFunction(submenuItemData) );

        if( submenuItemName.charAt(0) === '-' ){ // Add a Separator

          menu.addSeparator();

        }else if( submenuItemName.charAt(0) === '!' ){ // Add a function

          var _submenuItemName = submenuItemName.substr(1,submenuItemName.length);
          // MessageLog.trace('Action: "'+submenuItemName+'" '+_submenuItemName);
          menu.addAction(_submenuItemName);
          submenuFlatList[_submenuItemName] = submenuItemData;

        }else{

          if( typeof submenuItemData === 'string' ){ // Add menu item
            
            menu.addAction(submenuItemName);
            submenuFlatList[submenuItemName] = submenuItemData;

          }else if( Utils.isFunction(submenuItemData) ){ // Dynamic items

            var submenuItems = submenuItemData();

            if( submenuItems && Object.keys(submenuItems).length ){

              var submenuObject = {};
              submenuObject[submenuItemName] = submenuItems;
              createSubmenu( menu, submenuObject );

            }else{
              
              var submenu = menu.addMenu( submenuItemName );
              submenu.enabled = false;

            }

          }else{ // Add a submenu

            var submenu = menu.addMenu( submenuItemName );
            createSubmenu( submenu, submenuItemData );

          }

        }

      })

  }


  // ---------------------------------------------------------------------------
  function checkAttributeSkipByName( attrName ){
    return skippedAttributeNames.indexOf(attrName) !== -1;
  }

  function getFixedAttributeColumn( _node, attrName, useSkipList ){
    if( useSkipList && checkAttributeSkipByName(attrName) ) return;
    columnName = attrName;
    attributeNameFixes.forEach(function(nameFixData) { columnName = columnName.replace(nameFixData[0], nameFixData[1]) });
    return editor.getAvailableColumnName( editor.resolveExpressionName( _node.split('/').pop()+'_'+columnName ) );
  }

  ///
  function getMenuItemsForCreateExpression(){

    var submenuItems = {};

    Utils.eachAnimatableAttr( true, function( attrName, i, _node ) {
      
      var columnName = getFixedAttributeColumn( _node, attrName, true );
      if (!columnName) return;

      submenuItems[ '!Add to: '+attrName ] = function(){
        // MessageLog.trace('add Expression To Node Attribute:'+ _node+', '+attrName+', '+columnName );
        var _columnName = editor.createExpression( columnName, undefined, true );
        if( !_columnName ) return;
        node.linkAttr( _node, attrName, _columnName );
      };

    });

    return Object.keys(submenuItems).length ? submenuItems : undefined;

  }


  //
  function  getMenuItemsForLinkExpression() {
    
    if( !editor.currentExpressionName ) return;

    var submenuItems = {};

    Utils.eachAnimatableAttr( true, function( attrName, i, _node ) {

      if( checkAttributeSkipByName(attrName) ) return; // skip attribute

      submenuItems[ '!Link to: '+attrName ] = function(){
        // MessageLog.trace('Link Expression To Node Attribute:'+ _node+', '+attrName+', '+columnName );
        node.linkAttr( _node, attrName, editor.currentExpressionName );
      };

    });

    return Object.keys(submenuItems).length ? submenuItems : undefined;

  }







  ///
  function getMenuItemsForLinkedColumns(){

    var _node = selection.selectedNode(0);

    if( !_node ){
      return;
    }

    var linkedColumns = [];
    Utils.getFullAttributeList( _node, 1, true ).forEach(function(attrName){
      var columnName = node.linkedColumn( _node, attrName );
      if( !columnName || checkAttributeSkipByName(attrName) ) return;
      if( editor.currentExpressionName && editor.currentExpressionName === columnName ) return; // skip same expression name
      linkedColumns.push( [attrName, columnName] );
    });

    if( !linkedColumns.length ){
      return;
    }

    var currentFrame = frame.current();

    var submenuItems = {};

    linkedColumns.forEach(function(attrData){
      // str += 'value( "'+attrData[1]+'", currentFrame ); // '+_node+': '+attrData[0]+'\n';
      // str += 'value( "'+attrData[1]+'" ); // '+_node+': '+attrData[0]+'\n\n';
      submenuItems[attrData[0]] = 'value( column("'+attrData[1]+'") ); /* '+_node+': '+attrData[0]+'*/';
    });

    return submenuItems;

  }

  //
  function createFixedFrameRateBy2Expression(){
    editor.createExpression( 'fixedFrameRateBy2', chunks.fixedFrameRateBy2 );
  }

  //
  function createExpressionsForSelectedNode() {

    var _node = selection.selectedNode(0);
    if( !_node ){
      editor.showOutputMessage('Selected Node required','',false);
      return;
    }

    MessageLog.trace('createExpressionsForSelectedNode: '+_node );

    var animatableAttrs = Utils.getAnimatableAttrs( _node );
    MessageLog.trace( animatableAttrs.join('\n') );

    animatableAttrs.forEach(function(attrName){
      var columnName = attrName;
      attributeNameFixes.forEach(function(nameFixData){columnName = columnName.replace(nameFixData[0],nameFixData[1])});
      if( !columnName ) return;
      columnName = editor.getAvailableColumnName( editor.resolveExpressionName( '_'+_node.split('/').pop()+'_'+columnName ) );
      MessageLog.trace( attrName +' > '+columnName );
    });

    /*
    Utils.getFullAttributeList(_node, 1).forEach(function(attr) {
      
      MessageLog.trace('>>: '+attr );
          
    });
    */

  }





  ///
  function getMenuItemsCurrentExpression(){
    if( editor.currentExpressionName ){
      return {
        "!Copy Name": copyCurrentExpressionName,
        "!Copy Link": copyCurrentExpressionLink,
      }
    }
  }

  function copyCurrentExpressionName(editor) {
    QApplication.clipboard().setText( editor.currentExpressionName );
    editor.showOutputMessage('Expression Name copied to the Clipboard','',true);
  }

  function copyCurrentExpressionLink(editor) {
    QApplication.clipboard().setText( 'value( column("'+editor.currentExpressionName+'") );' );
    editor.showOutputMessage('Expression Link copied to the Clipboard','',true); 
  }

}

///
exports = {
  initSubmenu: initSubmenu
}