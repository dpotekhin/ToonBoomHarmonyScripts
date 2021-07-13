/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210706

Simple implementation of an expression editor.

ToDo:
- To save the current expression on Ctrl + Enter
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));

//
function PS_ExpressionEditor( _node ){

  //
  MessageLog.clearLog(); // !!!
  
  //
  var scriptName = 'Expression Editor';
  var scriptVer = '0.210706';
  //

  var Utils = _Utils;

  var btnHeight = 50;
  var smallBtnHeight = 30;
  var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_ExpressionEditor-Resources/icons/");

  var expressionStartToken = '%EXPR:';
  var listJustUpdated = true;
  var allLinkedNodes;
  var nextLinkedNode;

  //
  var modal = new pModal( scriptName + " v" + scriptVer, 600, 400, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;


  /// TOP

  var topGroup = modal.addGroup( '', ui, true, true );

  var listWidget = modal.listWidget = new QComboBox(topGroup);
  topGroup.mainLayout.addWidget( listWidget, 0, 0 );
  
  //
  listWidget["currentIndexChanged(int)"].connect(function(i){

    if( listJustUpdated ){
      listJustUpdated = false;
      return;
    }

    var exprName = modal.expressions[i].name;
    
    _setCurrentExpression( exprName, i );
    
    var exprText = column.getTextOfExpr(exprName);
    modal.textEdit.setText( exprText );
    
    _refreshCurrentExpressionValue();

    _setMessage();

  });
  
  // REFRESH BUTTON
  var refreshButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'refresh.png',
    _refreshExpressionList,
    'Refresh expression list.'
  );

  // RENAME BUTTON
  var renameButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'rename.png',
    _renameExpression,
    'Rename the selected expression.'
  );


  // COPY CURRENT EXPRESSION DATA
  var copyExpressionButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'copyExpression.png',
    _copyExpression,
    'Copy the selected expression data to the clipboard.'
  );

  
  // PASTE EXPRESSION DATA
  var pasteExpressionButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'pasteExpression.png',
    _pasteExpression,
    'Paste an expression data from the clipboard.'
  );
  

  // SERCH NEXT NODE BUTTON
  var findNextNodeButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'findNextNode.png',
    _findNextUsedNode,
    'Find the next node using the selected expression. Hold Control key to open Node properties window.'
  );

  // GET NODE COLUMNS BUTTON
  var getNodeColumnsButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'getNodeColumns.png',
    _getNodeColumns,
    'Get names of columns connected to the selected node.'
  );




  /// BODY
  var bodyGroup = modal.addGroup( '', ui, false );

  //
  var textEdit = modal.textEdit = new QTextEdit(bodyGroup);
  bodyGroup.mainLayout.addWidget( textEdit, 0, 0 );



  var messageGroup = modal.addGroup( '', bodyGroup, true, true );

  var expressionOutput = modal.addLabel( '', messageGroup );

  messageGroup.mainLayout.addStretch();

  var messageOutput = modal.addLabel( '', messageGroup );



  /// BOTTOM
  var bottomGroup = modal.addGroup( '', ui, true, 'QGroupBox{border: none; padding: 0; margin: 0;}' );


  // DELETE BUTTON
  var deleteButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'delete.png',
    _deleteExpression,
    'Delete the selected expression'
  );

  bottomGroup.mainLayout.addStretch();

   // CREATE BUTTON
  var createButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'create.png',
    _createExpression,
    'Create a new expression'
  );

  var saveButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'save.png', function(){
    
    _setMessage();

    if( !curentExpressionName ) return;
    // curentExpressionindex;
    var result = column.setTextOfExpr( curentExpressionName, modal.textEdit.plainText );
    // MessageLog.trace('!!!'+curentExpressionName+' > '+result );
    // MessageLog.trace('!!!'+curentExpressionName+' > '+modal.textEdit.plainText );
    
    _setMessage('Saved');

  }, 'Save the selected expression');
  // saveButton.setStyleSheet("background-color: #414e41;");

  //
  ui.mainLayout.addStretch();

  modal.show();

  //
  var expressions = _getExpressionColumns();
  
  _setCurrentExpression();

  _refreshExpressionList();


  // Notifier
  var myNotifier = new SceneChangeNotifier(ui);
  myNotifier.currentFrameChanged.connect( _refreshCurrentExpressionValue );



  // - - - -

  //
  function _setCurrentExpression( exprName, i ){
    curentExpressionindex = i;
    curentExpressionName = exprName;
    bodyGroup.title = exprName || '';

    findNextNodeButton.enabled =
    renameButton.enabled =
    saveButton.enabled =
    deleteButton.enabled =
    copyExpressionButton.enabled =
      !!exprName;
  
  }

  //
  function _fillListWidget( v ){
    // MessageLog.trace('_fillListWidget: '+modal+' >>> '+JSON.stringify(v, true, '  '));
    
    listJustUpdated = true;

    modal.listWidget.clear();

    var items = v.map(function(exprData){return exprData.name;});

    modal.listWidget.addItems(items);
  }


  //
  function _refreshExpressionList(){
    column.update();
    var expressions = modal.expressions = _getExpressionColumns();
    // MessageLog.trace('_refreshExpressionList: '+JSON.stringify(expressions,true,'  '));
    _fillListWidget( expressions );
  }


  //
  function _getExpressionColumns(){
    var expressions = column.getColumnListOfType('EXPR');
    expressions.unshift('');
    // MessageLog.trace('_getExpressionColumns '+JSON.stringify(expressions,true,'  '));
    expressions = expressions.map( function(v){
      return { name: v };
    });
    return expressions;
  }


  //
  function _traverseNodes( nodes, callback ){

    nodes.forEach(function(_node){

      var name = node.getName(_node);
      callback( _node, name );

      if( node.isGroup(_node) ){
        var childNodes = node.subNodes(_node);
        _traverseNodes( childNodes, callback );
      }

    });

  }


  //
  function _getAllUsedNodes( _columnName ){

    allLinkedNodes = {};

    _traverseNodes([node.root()],function(_node){

      var linkedAttrs = [];

      Utils.getFullAttributeList( _node, 1, true ).forEach(function(attrName){
        var columnName = node.linkedColumn( _node, attrName );
        if( columnName && column.type(columnName) === 'EXPR' && ( _columnName && _columnName === columnName ) ) linkedAttrs.push( [columnName, attrName] );
      });

      // MessageLog.trace('--> '+_node+'; '+JSON.stringify(linkedAttrs, true, '  ') );
      
      if( linkedAttrs.length) allLinkedNodes[_node] = linkedAttrs;

    });

    MessageLog.trace('_getAllUsedNodes: ' + JSON.stringify(allLinkedNodes, true, '  ') );

  }


  //
  function _findNextUsedNode(){

    if( !curentExpressionName ) return;

    _getAllUsedNodes( curentExpressionName );

    // try{
      // MessageLog.trace('_findNextUsedNode: ' + JSON.stringify(allLinkedNodes, true, '  ') );

    var linkedNodesNames = Object.keys(allLinkedNodes);
    if( !linkedNodesNames.length ) {
      _setMessage('No nodes found');
      return;
    }

    if( nextLinkedNode === undefined ) nextLinkedNodeIndex = 0;
    else {
      var nextLinkedNodeIndex = linkedNodesNames.indexOf(nextLinkedNode);
      if( nextLinkedNodeIndex === -1 ) nextLinkedNodeIndex = 0;
      else {
        nextLinkedNodeIndex++;
        if( nextLinkedNodeIndex >= linkedNodesNames.length ) nextLinkedNodeIndex = 0;
      }
    }

    nextLinkedNode = linkedNodesNames[nextLinkedNodeIndex];

    // MessageLog.trace('nextLinkedNode: "'+nextLinkedNode+'"');
    if( !nextLinkedNode ) return;

    var attributes = [];
    allLinkedNodes[nextLinkedNode].forEach(function(attrData){ attributes.push('- '+attrData[1]) })
    _setMessage( '"'+nextLinkedNode+'" '+(nextLinkedNodeIndex+1)+'/'+linkedNodesNames.length, attributes.join('\n') );

    selection.clearSelection();
    selection.addNodeToSelection( nextLinkedNode );

    // MessageLog.trace('>>'+JSON.stringify(Action.validate("onActionFocusOnSelectionNV()", "Node View")) )

    var actionCheck = Action.validate("onActionFocusOnSelectionNV()", "Node View");
    if( actionCheck.isValid && actionCheck.enabled ){

      modal.setFocusOnMainWindow();
      Action.perform( "onActionFocusOnSelectionNV()", "Node View" );
      
      if( KeyModifiers.IsControlPressed() ) Action.perform("onActionEditProperties()", "scene");

    }

    // }catch(err){MessageLog.trace('Error: '+err)}

  }


  //
  function resolveExpressionName(name){
    return (name || '').trim().replace(/\s/gi,'_').replace(/[^0-9\w]/gi,'');
  }


  //
  function _renameExpression(){

    if( !curentExpressionName ) return;

    _setMessage();

    var expressionName = Input.getText('Enter Expression name',curentExpressionName,'Rename Expression');
    if( !expressionName ) {
      _setMessage('Expression name required');
      return;
    }
    
    var columnName = resolveExpressionName(expressionName);

    if( curentExpressionName === columnName ) return;

    var columnExists = column.type(columnName);
    if( columnExists ){
      _setMessage('An expression with the same name already exists');
      return;
    }

    column.rename( curentExpressionName, columnName );

    _refreshExpressionList();

  }


  //
  function _createExpression(){
    
    scene.beginUndoRedoAccum('Create Expression');

    _setMessage();

    var expressionName = Input.getText('Enter Expression name','','Create Expression');
    if( !expressionName ) {
      _setMessage('Expression name required');
      return;
    }
    
    // MessageLog.trace('_createExpression: '+columnName+', '+modal.textEdit.plainText );
    
    var columnName = resolveExpressionName(expressionName);

    var columnExists = column.type(columnName);
    if( columnExists ){
      _setMessage('An expression with the same name already exists');
      return;
    }

    var result = column.add( columnName, 'EXPR' );
    if( !result ) {
      MessageLog.trace('Expression creation error');
      return;
    }

    // if( modal.textEdit.plainText ) column.setTextOfExpr(columnName, modal.textEdit.plainText);

    _refreshExpressionList();

    scene.endUndoRedoAccum();

  }



  //
  function _deleteExpression(){

    if(!curentExpressionName) return;

    scene.beginUndoRedoAccum('Delete Expression');

    _getAllUsedNodes( curentExpressionName );

    var linkedNodesNames = Object.keys(allLinkedNodes);

    var nodeCount = 0;

    linkedNodesNames.forEach(function(_node){

      allLinkedNodes[_node].forEach(function(attrData){

        MessageLog.trace('unlink: '+_node+' : '+attrData[1]+' : '+attrData[0] );
        node.unlinkAttr(_node, attrData[1]);
        nodeCount++;

      });

    });

    // column.removeUnlinkedFunctionColumn(curentExpressionName); // Doesn't work
    
    var _node = node.add( 'Top', '__'+column.generateAnonymousName(), 'PEG', 0, 0, 0 );
    node.linkAttr(_node, "ROTATION.ANGLEZ", curentExpressionName );
    var result = node.deleteNode( _node, true, true );

    _refreshExpressionList();

    _setMessage('Expression deleted. Removed links from '+nodeCount+' nodes.');

    scene.endUndoRedoAccum();

  }



  //
  function _copyExpression(){

    if(!curentExpressionName) return;

    scene.beginUndoRedoAccum('Copy Expression');

    var expressionData = 'Expression Editor. Expression Data | v'+scriptVer+'\n';
    expressionData += expressionStartToken+curentExpressionName+'\n'+modal.textEdit.plainText+'\n';

    QApplication.clipboard().setText( expressionData );

    _setMessage('Expression Data copied to the clipboard');

    scene.endUndoRedoAccum();

  }



  //
  function _pasteExpression(){

    var expressionData = (QApplication.clipboard().text() || '').trim();

    if( expressionData ){
      
      expressionData = expressionData.split(/\r?\n/);

      var dataHead = expressionData.shift();

      if( dataHead && dataHead.indexOf('Expression Editor. Expression Data') !== -1 ){

        
        // Parse Data
        var currentExpressionName, currentExpressionValue;
        
        function resetExpressionData(){
          
          
        }

        function putCurrentExpression(){

          if( !(currentExpressionName && currentExpressionValue) ) return;
          
          var _currentExpressionName = currentExpressionName;
          currentExpressionName = undefined;

          var _currentExpressionValue = currentExpressionValue.join('\n');
          currentExpressionValue = undefined;

          //
          var columnName = resolveExpressionName(_currentExpressionName);

          // Check that the new expression is not exists in the Scene
          var columnExists = column.type(columnName);
          if( columnExists ){
            var response = MessageBox.warning('Expression named "'+columnName+'" already exists in the Scene.\nOverride?',1,2,0,'Paste error');
            if( response === 2 ) {
              MessageLog.trace('Expression "'+columnName+'" skipped by user.');
              return;
            }
          }

          if( !columnExists ){

            var result = column.add( columnName, 'EXPR' );
            if( !result ) {
              MessageLog.trace('Expression creation error');
              return;
            }

          }

          column.setTextOfExpr(columnName, _currentExpressionValue );

          _refreshExpressionList();

        }

        scene.beginUndoRedoAccum('Paste Expression');

        expressionData.forEach(function(line){
          
          line = line.trim();

          if( line.indexOf(expressionStartToken)===0 ){
            putCurrentExpression();
            currentExpressionName = line.split(expressionStartToken)[1]
            currentExpressionValue = [];
          }else{
            currentExpressionValue.push(line);
          }

        });

        putCurrentExpression();

        scene.endUndoRedoAccum();

        _setMessage('Expression Data pasted successfully');

        return;

      }

    }

    _setMessage('Expression Data not found in the clipboard');

  }



  //
  function _getNodeColumns(){
  
    _setMessage('');

    var _node = selection.selectedNode(0);
    
    if( !_node ){
      _setMessage('Please select one node');
      return;
    }

    var linkedColumns = [];
    Utils.getFullAttributeList( _node, 1, true ).forEach(function(attrName){
      var columnName = node.linkedColumn( _node, attrName );
      if( !columnName ) return;
      // if( curentExpressionName && curentExpressionName === columnName ) return; // skip same expression name
      linkedColumns.push( [attrName, columnName] );
    });

    if( !linkedColumns.length ){
      _setMessage('"'+_node+'" has no linked columns.');
      return;
    }

    var currentFrame = frame.current();

    var str = '';

    linkedColumns.forEach(function(attrData){
      str += 'value( "'+attrData[1]+'", currentFrame ); // '+_node+': '+attrData[0]+'\n';
      str += 'value( "'+attrData[1]+'" ); // '+_node+': '+attrData[0]+'\n\n';
    });

    MessageLog.trace('_getNodeColumns: '+_node+'\n'+str);

    var d = new Dialog();
    d.width = 500;
    d.minimumSize = {width:500,height:300};
    d.title = 'Linked columns of the "'+_node+'" node:';
    // d.okButtonText = 'OK';
    // d.cancelButtonText = 'OK';
    // MessageLog.trace( Object.getOwnPropertyNames(d).join('\n') );
    // MessageLog.trace( JSON.stringify(d,true,'  '));

    var userInput = new TextEdit();
    userInput.text = str;
    d.add(userInput);

    d.exec();

  }



  //
  function _refreshCurrentExpressionValue(){
    var str = 'Frame '+frame.current();
    if( curentExpressionName ) {
      var val = column.getEntry( curentExpressionName, 1, frame.current() );
      str += ' : ' + val;
    };
    expressionOutput.text = str;
  }


  //
  function _setMessage( str, toolTip ){
    messageOutput.text = str || '';
    messageOutput.toolTip = toolTip || '';
  }

}


///
exports = PS_ExpressionEditor;