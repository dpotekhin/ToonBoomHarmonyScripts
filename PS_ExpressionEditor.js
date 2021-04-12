/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.2

ToDo:
- to implement deletion of the selected expression
- to implement renaming of the selected expression
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));

//
function PS_ExpressionEditorModal( _node ){

  //
  // MessageLog.clearLog();
  // MessageLog.trace('!!!'+Object.getOwnPropertyNames(column).join('\n'));
  // MessageLog.trace('!!!'+Action.getResponderList().join('\n'));
  // MessageLog.trace('\n\n!!!'+Action.getActionList('xsheetView').join('\n'));
  //
  var scriptName = 'Expression Editor';
  var scriptVer = '0.2';
  //

  var btnHeight = 50;
  var listJustUpdated = true;
  // var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/icons/");

  //
  var modal = new pModal( scriptName + " v" + scriptVer, 500, 400, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;

  var nameGroup = modal.addGroup( '', ui, false );//'QGroupBox{ position: relative; border: none; margin: 5px 0; padding: 5px 0;}');//, "padding: 0; " );
  // alignGroup.setStyleSheet( alignGroup.styleSheet +' QPushButton{ border: none; }' );

  // var btnAlignLeft = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'align-left.png', AlignPaths.AlignLeft );
  // var btnAlignHCenter = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'align-h-center.png', AlignPaths.AlignHCenter );

  /// SEARCH / CREATE GROUP

  var searhGroup = modal.addGroup( '', nameGroup, true, true );

  var searchLabel = modal.addLabel( 'Name:', searhGroup, 65, btnHeight, Qt.AlignRight | Qt.AlignVCenter );

  // Search Field
  var searchField = modal.searchField = new QLineEdit(searhGroup); // TODO: to implement the Expression list filter
  searhGroup.mainLayout.addWidget( searchField, 0, 0 );

  // CREATE BUTTON
  var createButton = modal.addButton('Create', searhGroup, 70, btnHeight, undefined, _createExpression );
  // createButton.setEnabled(false); // TODO: to implement creation
  // createButton.setStyleSheet("background-color: #41414e;");

  /// LIST GROUP

  var listWidgetGroup = modal.addGroup( '', nameGroup, true, true );
  
  var listWidgetLabel = modal.addLabel( 'Expressions:', listWidgetGroup, 65, btnHeight, Qt.AlignRight | Qt.AlignVCenter );

  var listWidget = modal.listWidget = new QComboBox(listWidgetGroup);
  listWidgetGroup.mainLayout.addWidget( listWidget, 0, 0 );
/*  
  // listWidget.setLineEdit(searchField);
  listWidget.editable = true;
  listWidget.editTextChanged.connect(function(s){
    MessageLog.trace('>editTextChanged>'+ s);
    
    // var filtered = modal.expressions;
    // if(s) filtered = modal.expressions.filter(function(v){ return v.displayName.indexOf(s) !== -1; });
    // _fillListWidget( filtered );
    // listWidget.showPopup();
    
  });
*/

  // var listView = new QListView(listWidget);
  // listWidget.setView(listView);
  
  //
  listWidget["currentIndexChanged(int)"].connect(function(i){
    if( listJustUpdated ){
      listJustUpdated = false;
      return;
    }
    var exprName = modal.expressions[i].name;
    // var displayName = modal.expressions[i].displayName;
    MessageLog.trace('Selected: '+ i+' : '+exprName );
    modal.curentExpressionindex = i;
    modal.curentExpressionName = exprName;
    var exprText = column.getTextOfExpr(exprName);
    modal.textEdit.setText( exprText );
    // searchField.setText( exprName );
    bodyGroup.title = exprName;
    _refreshCurrentExpressionValue();
  });
  
  // REFRESH BUTTON
  var refreshButton = modal.addButton('Refresh', listWidgetGroup, 70, btnHeight, undefined, function(){
    _refreshExpressionList();
  });
  

  /// BODY
  var bodyGroup = modal.addGroup( '', ui, false );

  //
  var textEdit = modal.textEdit = new QTextEdit(bodyGroup);
  bodyGroup.mainLayout.addWidget( textEdit, 0, 0 );

  var expressionOutput = modal.addLabel( '', bodyGroup );

  /// Buttons
  var buttonsGroup = modal.addGroup( '', ui, true, 'QGroupBox{border: none; padding: 0; margin: 0;}' );


  // DELETE BUTTON
  var deleteButton = modal.addButton('Delete Expression', buttonsGroup, 120, btnHeight, undefined, _deleteExpression );
  // deleteButton.setEnabled(false); // TODO: to implement deleting
  // deleteButton.setStyleSheet("background-color: #4e4141;");


  // SAVE BUTTON
  var saveButton = modal.addButton('Save Expression', buttonsGroup, 120, btnHeight, undefined, function(){
    
    if( !modal.curentExpressionName ) return;
    // modal.curentExpressionindex;
    var result = column.setTextOfExpr( modal.curentExpressionName, modal.textEdit.plainText );
    // MessageLog.trace('!!!'+modal.curentExpressionName+' > '+result );
    // MessageLog.trace('!!!'+modal.curentExpressionName+' > '+modal.textEdit.plainText );
  });
  // saveButton.setStyleSheet("background-color: #414e41;");

  //
  var expressions = _getExpressionColumns();

  //
  ui.mainLayout.addStretch();

  modal.show();

  //
  _refreshExpressionList();



  // Notifier
  var myNotifier = new SceneChangeNotifier(ui);
  myNotifier.currentFrameChanged.connect( _refreshCurrentExpressionValue );



  // - - - -
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
  function _createExpression(){
    
    var columnName = (modal.searchField.text || '').trim();
    // MessageLog.trace('_createExpression: '+columnName+', '+modal.textEdit.plainText );

    if( !columnName ){
      MessageLog.trace('Expression name required');
      return;
    }
    
    var existingColumn = column.type(columnName);
    if( existingColumn ){
      MessageLog.trace('Expression name required');
      return;
    }

    var result = column.add( columnName, 'EXPR' );
    if( !result ) return;

    if( modal.textEdit.plainText ) column.setTextOfExpr(columnName, modal.textEdit.plainText);

    _refreshExpressionList();

    // MessageLog.trace('_createExpression: SUCCESS');

  }

  //
  function _deleteExpression(){
    if(!modal.curentExpressionName) return;
    
    var _node = node.add( 'Top', '__'+column.generateAnonymousName(), 'PEG', 0, 0, 0 );
    node.linkAttr(_node, "ROTATION.ANGLEZ", modal.curentExpressionName );
    var result = node.deleteNode( _node, true, true );
    
    _refreshExpressionList();

    // MessageLog.trace('_deleteExpression: '+_node+', '+modal.curentExpressionName );
    // MessageLog.trace('_deleteExpression: SUCCESS ' + result );
  }

  //
  function _refreshCurrentExpressionValue(){
    var str = 'Frame '+frame.current();
    if( modal.curentExpressionName ) {
      var val = column.getEntry( modal.curentExpressionName, 1, frame.current() );
      str += ' : ' + val;
    };
    expressionOutput.text = str;
  }

}


///
exports = PS_ExpressionEditorModal;