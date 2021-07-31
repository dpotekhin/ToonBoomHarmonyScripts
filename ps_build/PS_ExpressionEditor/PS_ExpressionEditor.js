/*
Author: D.Potekhin (d@peppers-studio.ru)

#Name: PS_ExpressionEditor /#
#Version: 0.210728 /#

#Description:
Simple implementation of an expression editor.
/#

#Installation:
Copy all files from this folder to Harmony User Scripts directory.
Don't copy folder "packages" if you don't want to add "Animation / Expression Editor" main menu item.
/#

#ExtraFiles:
packages/PS_ExpressionEditor
/#

ToDo:
- To save the current expression on Ctrl + Enter
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_ExpressionEditor-Resources/ps/pModal.js"));

var _TextEditSubmenu = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_ExpressionEditor-Resources/TextEditSubmenu.js"));
var _History = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_ExpressionEditor-Resources/History.js"));
var ExpressionEditor = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_ExpressionEditor-Resources/ExpressionEditor.js"));

//
function PS_ExpressionEditor( _node ){

  //
  // MessageLog.clearLog(); // !!!
  
  //
  var scriptName = 'Expression Editor';
  var scriptVer = '0.210728';
  var outputColors = {
    'success': 'color:#8bbe55',
    'true': 'color:#8bbe55',
    'error': 'color:#ff7070',
    'false': 'color:#ff7070',
    'warning': 'color:yellow'
  };
  //

  var TextEditSubmenu = _TextEditSubmenu;
  var History = _History;

  //
  var editor = new ExpressionEditor;
  editor.version = scriptVer;
  var showOutputMessage = editor.showOutputMessage = function( str, toolTip, type ){
    messageOutput.text = str || '';
    messageOutput.toolTip = toolTip || '';
    messageOutput.styleSheet = outputColors[''+type] || '';
  };
  editor.onExpressionListRefreshed = function( expressionName ) {
    refreshExpressionList( expressionName );
  }

  //
  var btnHeight = 50;
  var smallBtnHeight = 30;
  var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_ExpressionEditor-Resources/icons/");

  var listJustUpdated = true;

  //
  var modal = editor.modal = new pModal( scriptName + " v" + scriptVer, 600, 400, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;


  /// TOP

  var topGroup = modal.addGroup( '', ui, true, true );

  var listWidget = modal.listWidget = new QComboBox(topGroup);
  // listWidget.editable = true;
  // listWidget.insertPolicy = QComboBox.NoInsert;
  // listWidget.maxVisibleItems  = 10;
  topGroup.mainLayout.addWidget( listWidget, 0, 0 );
  
  //
  listWidget["currentIndexChanged(int)"].connect( onDropDownChanged );
  
  // REFRESH BUTTON
  var refreshButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'refresh.png',
    function(){ refreshExpressionList(editor.currentExpressionName) },
    'Refresh expression list.'
  );

  // RENAME BUTTON
  var renameButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'rename.png',
    editor.renameExpression,
    'Rename the selected expression.'
  );


  // COPY CURRENT EXPRESSION DATA
  var copyExpressionButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'copyExpression.png',
    function(){
      editor.copyExpression( editor.currentExpressionName, modal.textEdit.plainText );
    },
    'Copy the selected expression data to the clipboard.\n'
    +'Hold Control key to save data to a file.'
  );

  
  // PASTE EXPRESSION DATA
  var pasteExpressionButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'pasteExpression.png',
    editor.pasteExpression,
    'Paste an expression data from the clipboard.\n'
    +'Hold Control key to load data from a file.'
  );
  

  // SERCH NEXT NODE BUTTON
  var findNextNodeButton = modal.addButton('', topGroup, smallBtnHeight, smallBtnHeight, iconPath+'findNextNode.png',
    editor.findNextUsedNode,
    'Find the next node using the selected expression.\n'
    +'Hold Control key to open Node properties window.'
  );




  /// BODY
  var bodyGroup = modal.addGroup( '', ui, false );

  // Expression Edit Area
  var textEdit = editor.textEdit = modal.textEdit = new QTextEdit(bodyGroup);
  TextEditSubmenu.initSubmenu( editor );
  bodyGroup.mainLayout.addWidget( textEdit, 0, 0 );

  //
  var messageGroup = modal.addGroup( '', bodyGroup, true, true );

  var expressionOutput = modal.addLabel( '', messageGroup );

  messageGroup.mainLayout.addStretch();

  var messageOutput = modal.addLabel( '', messageGroup );



  /// BOTTOM
  var bottomGroup = modal.addGroup( '', ui, true, 'QGroupBox{border: none; padding: 0; margin: 0;}' );


  // DELETE ALL BUTTON
  var deleteAllButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'deleteAll.png',
    editor.deleteAllExpressions,
    'Delete All Expressions in the Scene'
  );

  // DELETE UNUSED
  var deleteAllUnusedButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'deleteAllUnused.png',
    editor.deleteAllUnusedExpressions,
    'Delete All unused Expressions in the Scene'
  );

  // DELETE BUTTON
  var deleteButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'delete.png',
    editor.deleteExpression,
    'Delete the selected Expression'
  );

  //
  bottomGroup.mainLayout.addStretch();

  // HISTORY
  var history = editor.history = new History( textEdit );

  history.onChanged = function(){
    saveButton.enabled = editor.currentExpressionName && history.hasChanges;
    updateUIState();
  }

  history.undoButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'undo.png',
    function(){
      history.undo();
      updateUIState(true);
    },
    'Undo Expression body changes'
  );

  history.redoButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'redo.png',
    function(){
      history.redo();
      updateUIState(true);
    },
    'Redo Expression body changes'
  );

  //
  bottomGroup.mainLayout.addStretch();

   // CREATE BUTTON
  var createButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'create.png',
    editor.createExpression,
    'Create a new expression'
  );

  var saveButton = modal.addButton('', bottomGroup, smallBtnHeight, smallBtnHeight, iconPath+'save.png',
    saveCurrentExpression,
    'Save the selected expression'
  );

  //
  ui.mainLayout.addStretch();

  modal.show();

  //
  editor.getExpressionColumns();

  refreshExpressionList();

  setCurrentExpression();
  
  history.reset();

  // Notifier
  var myNotifier = new SceneChangeNotifier(ui);
  myNotifier.currentFrameChanged.connect( refreshCurrentExpressionValue );


  // - - - -

  //
  function setCurrentExpression( exprName ){

    editor.currentExpressionName = exprName;

    updateUIState();

  }


  function updateUIState( saveState ) {
    
    findNextNodeButton.enabled =
    renameButton.enabled =
    deleteButton.enabled =
    copyExpressionButton.enabled =
      !!editor.currentExpressionName;

    saveButton.enabled = saveState !== undefined ? saveState : editor.currentExpressionName && history.hasChanges;
    
    bodyGroup.title = editor.currentExpressionName ? editor.currentExpressionName + (saveButton.enabled ? '*' : '') : '';

  }

  //
  function fillListWidget( v ){
    // MessageLog.trace('fillListWidget: >>> '+JSON.stringify(v, true, '  '));
    
    listJustUpdated = true;

    modal.listWidget.clear();

    var items = v.map(function(exprData){return exprData.name;});

    modal.listWidget.addItems(items);

  }


  //
  function refreshExpressionList( _currentExpressionName ){
    // MessageLog.trace('refreshExpressionList: '+editor.currentExpressionName+' > '+_currentExpressionName );
    column.update();
    var expressions = editor.getExpressionColumns();
    // MessageLog.trace('refreshExpressionList: '+JSON.stringify(expressions,true,'  '));
    if( _currentExpressionName !== undefined ) setCurrentExpression( _currentExpressionName || undefined );
    fillListWidget( expressions );
    
  }


  //
  function refreshCurrentExpressionValue(){
    var str = 'Frame '+frame.current();
    if( editor.currentExpressionName ) {
      var val = column.getEntry( editor.currentExpressionName, 1, frame.current() );
      str += ' : ' + val;
    };
    expressionOutput.text = str;
  }


  //
  function onDropDownChanged(i){

    // MessageLog.trace('currentIndexChanged @1: ' +i);

    if( listJustUpdated ){
      listJustUpdated = false;
      return;
    }

    if( saveButton.enabled ){ // Unsaved changes
      
      if( editor.showConfirmDialog(
        'Save Changes?', 'You have unsaved changes. Do you want to save the expression body?',
        'Save',
        'Whatever'
      ) ) {
        saveCurrentExpression();
      }

      updateUIState( false );
      
    }

    var exprName = editor.expressions[i].name;

    // MessageLog.trace('currentIndexChanged @2: '+exprName+' > '+listWidget.count );

    if( !exprName && editor.currentExpressionName ){

      for( var ii=0; ii<listWidget.count; ii++){

        if( listWidget.itemText(ii) == editor.currentExpressionName ){
          // MessageLog.trace('!!! ' +ii);
          // listJustUpdated = true;
          listWidget.setCurrentIndex(ii);
          exprName = editor.currentExpressionName;
        }

      }

    }
    
    // MessageLog.trace('currentIndexChanged @3: '+exprName+': '+editor.currentExpressionName );

    setCurrentExpression( exprName );
    
    var exprText = column.getTextOfExpr(exprName);
    modal.textEdit.setText( exprText );
    
    refreshCurrentExpressionValue();

    history.reset();

    showOutputMessage();
    
  }


  //
  function saveCurrentExpression(){
    
    showOutputMessage();

    if( ! editor.saveExpression( editor.currentExpressionName, modal.textEdit.plainText ) ) return;
    
    updateUIState( false );

    showOutputMessage('Saved');

  }


}


///
exports = PS_ExpressionEditor;