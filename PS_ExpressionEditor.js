/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1

ToDo:
- to implement creation of the brand new expression
- to implement deletion of the selected expression
- to implement renaming of the selected expression
- add menu item of Expression Editor
- add icon for Tool Shelf
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));

//
function PS_ExpressionEditorModal( _node ){

    //
  MessageLog.clearLog();
  MessageLog.trace('!!!'+JSON.stringify(pModal,true, '  '));
  //
  var scriptName = 'Expression Editor';
  var scriptVer = '0.1';
  //

  var btnHeight = 50;
  // var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/icons/");

  //
  var modal = new pModal( scriptName + " v" + scriptVer, 500, 400, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;

  var nameGroup = modal.addGroup( 'Expression Name:', ui, false );//'QGroupBox{ position: relative; border: none; margin: 5px 0; padding: 5px 0;}');//, "padding: 0; " );
  // alignGroup.setStyleSheet( alignGroup.styleSheet +' QPushButton{ border: none; }' );

  // var btnAlignLeft = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'align-left.png', AlignPaths.AlignLeft );
  // var btnAlignHCenter = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'align-h-center.png', AlignPaths.AlignHCenter );

  // Search Field
  var searchField = new QLineEdit(nameGroup); // TODO: to implement the Expression list filter
  nameGroup.mainLayout.addWidget( searchField, 0, 0 );

  var listWidget = modal.listWidget = new QComboBox(nameGroup);

/*  
  // listWidget.setLineEdit(searchField);
  listWidget.editable = true;
  listWidget.editTextChanged.connect(function(s){
    MessageLog.trace('>editTextChanged>'+ s);
    
    // var filtered = modal.expressions;
    // if(s) filtered = modal.expressions.filter(function(v){ return v.displayName.indexOf(s) !== -1; });
    // _fillListWidget( modal, filtered );
    // listWidget.showPopup();
    
  });
*/

  // var listView = new QListView(listWidget);
  // listWidget.setView(listView);
  nameGroup.mainLayout.addWidget( listWidget, 0, 0 );
  //
  listWidget["currentIndexChanged(int)"].connect(function(i){
    var exprName = modal.expressions[i].name;
    var displayName = modal.expressions[i].displayName;
    MessageLog.trace('Selected: '+ i+' : '+exprName );
    modal.curentExpressionindex = i;
    modal.curentExpressionName = exprName;
    var exprText = column.getTextOfExpr(exprName);
    modal.textEdit.setText( exprText );
    searchField.setText( displayName );
  });

  /// Body
  var bodyGroup = modal.addGroup( 'Expression Body:', ui, false );

  //
  var textEdit = modal.textEdit = new QTextEdit(nameGroup);
  bodyGroup.mainLayout.addWidget( textEdit, 0, 0 );


  /// Buttons
  var buttonsGroup = modal.addGroup( '', ui, true, 'QGroupBox{border: none; padding: 0; margin: 0;}' );

  //
  var deleteButton = modal.addButton('Delete Expression', buttonsGroup, 120, btnHeight, undefined, function(){
   
  });
  deleteButton.setEnabled(false); // TODO: to implement deleting
  deleteButton.setStyleSheet("background-color: #880000;");

  //
  var createButton = modal.addButton('Create Expression', buttonsGroup, 120, btnHeight, undefined, function(){
    
  });
  createButton.setEnabled(false); // TODO: to implement creation
  createButton.setStyleSheet("background-color: #000088;");

  //
  var saveButton = modal.addButton('Save Expression', buttonsGroup, 120, btnHeight, undefined, function(){
    
    if( !modal.curentExpressionName ) return;
    // modal.curentExpressionindex;
    var result = column.setTextOfExpr( modal.curentExpressionName, modal.textEdit.plainText );
    MessageLog.trace('!!!'+modal.curentExpressionName+' > '+result );
    // MessageLog.trace('!!!'+modal.curentExpressionName+' > '+modal.textEdit.plainText );
  });
  saveButton.setStyleSheet("background-color: #008800;");

  //
  var expressions = _getExpressionColumns();

  //
  ui.mainLayout.addStretch();

  modal.show();

  //
  _refreshExpressionList( modal );

}


//
function _fillListWidget( modal, v ){
  MessageLog.trace('_fillListWidget: '+modal+' >>> '+JSON.stringify(v, true, '  '));
  modal.listWidget.clear();
  v.forEach(function( exprData, i ){
    modal.listWidget.addItem(exprData.displayName);
  })
}


//
function _refreshExpressionList( modal ){
  var expressions = modal.expressions = _getExpressionColumns();
  _fillListWidget( modal, expressions );
}

//
function _getExpressionColumns(){
  var expressions = [];
  var n = column.numberOf();
  for (i = 0; i < n; ++i){
    var name = column.getName(i);
    var type = column.type(name);
    if( type !== 'EXPR' ) continue;
    var displayName = column.getDisplayName(name);
    // MessageLog.trace(i+' : "'+name+'", "'+displayName+'", '+type);
    expressions.push({
      name: name,
      displayName: displayName,
    });
  };
  return expressions;
}


///
exports = PS_ExpressionEditorModal;