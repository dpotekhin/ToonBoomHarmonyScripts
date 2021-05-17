/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1

ToDo:

*/

//
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var _pFile = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pFile.js"));


//
function PS_SelectionSetsModal(){

  //
  MessageLog.clearLog();

  //
  var scriptName = 'Selection Sets';
  var scriptVer = '0.1';
  //

  var Utils = _Utils;
  var pFile = _pFile;

  var btnHeight = 50;
  var listJustUpdated = true;
  var modalWidth = 500;
  var border = 20;

  var curentItemName;
  var curentItemindex;

  // var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/icons/");

  //
  var modal = new pModal( scriptName + " v" + scriptVer, modalWidth, 500, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;

  var mainGroup = modal.addGroup( '', ui, false );//'QGroupBox{ position: relative; border: none; margin: 5px 0; padding: 5px 0;}');//, "padding: 0; " );
  // alignGroup.setStyleSheet( alignGroup.styleSheet +' QPushButton{ border: none; }' );

  // var btnAlignLeft = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'align-left.png', AlignPaths.AlignLeft );
  // var btnAlignHCenter = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'align-h-center.png', AlignPaths.AlignHCenter );

  /// SEARCH / CREATE GROUP

  var searhGroup = modal.addGroup( '', mainGroup, true, true );

  var searchLabel = modal.addLabel( 'New Set:', searhGroup, 65, btnHeight, Qt.AlignRight | Qt.AlignVCenter );

  // Search Field
  var newSetInput = modal.newSetInput = new QLineEdit(searhGroup); // TODO: to implement the Expression list filter
  searhGroup.mainLayout.addWidget( newSetInput, 0, 0 );

  // CREATE BUTTON
  var createButton = modal.addButton('Create', searhGroup, 70, btnHeight, undefined, _createSet );
  // createButton.setEnabled(false); // TODO: to implement creation
  // createButton.setStyleSheet("background-color: #41414e;");

  var nameGroup = modal.addGroup( '', mainGroup, false, true );//'QGroupBox{ position: relative; border: none; margin: 5px 0; padding: 5px 0;}');//, "padding: 0; " );
  // alignGroup.setStyleSheet( alignGroup.styleSheet +' QPushButton{ border: none; }' );

  // var btnAlignLeft = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'align-left.png', AlignPaths.AlignLeft );
  // var btnAlignHCenter = modal.addButton( '', alignGroup.mainLayout, btnHeight, btnHeight, iconPath+'align-h-center.png', AlignPaths.AlignHCenter );

  /// LIST GROUP

  var listWidgetGroup = modal.addGroup( '', nameGroup, true, true );
  
  var listWidgetLabel = modal.addLabel( 'Pick Set:', listWidgetGroup, 65, btnHeight, Qt.AlignRight | Qt.AlignVCenter );

  var listWidget = modal.listWidget = new QComboBox(listWidgetGroup);
  listWidgetGroup.mainLayout.addWidget( listWidget, 0, 0 );
/*  
  // listWidget.setLineEdit(newSetInput);
  listWidget.editable = true;
  listWidget.editTextChanged.connect(function(s){
    MessageLog.trace('>editTextChanged>'+ s);
    
    // var filtered = modal.expressions;
    // if(s) filtered = modal.expressions.filter(function(v){ return v.displayName.indexOf(s) !== -1; });
    // _fillListWidget( filtered );
    // listWidget.showPopup();
    
  });
*/
  var applySetButton = modal.addButton('Apply Set', listWidgetGroup, 70, btnHeight, undefined, function(){
    
    if( !curentItemName ) return;
    var itemData = fileData[curentItemName];
    selection.clearSelection();
    selection.addNodesToSelection(itemData);
  });

  // var listView = new QListView(listWidget);
  // listWidget.setView(listView);
  
  //

  listWidget["currentIndexChanged(int)"].connect(function(i){
  

    if( listJustUpdated ){
      listJustUpdated = false;
      return;
    }

    _setCurrentItem(i);
    // MessageLog.trace('!!!'+ i+',  '+curentItemName );

  });
  

  /// Buttons
  var buttonsGroup = modal.addGroup( '', ui, true ); // 'QGroupBox{border: none; padding: 0; margin: 0;}' );


  // Delete BUTTON
  var deleteButton = modal.addButton('Delete Set', buttonsGroup, 120, btnHeight, undefined, _deleteSet );
  // deleteButton.setEnabled(false); // TODO: to implement deleting
  // deleteButton.setStyleSheet("background-color: #4e4141;");


  // Add BUTTON
  var addToSetButton = modal.addButton('Add Selected to Set', buttonsGroup, 120, btnHeight, undefined, _addSelectionToSet );
  addToSetButton.setStyleSheet("background-color: #414e41;");


  // Remove from Set
  var removeFromSetButton = modal.addButton('Remove from Set', buttonsGroup, 120, btnHeight, undefined, function(){
    
    if( !curentItemName ) return;
    
    var itemData = fileData[curentItemName];
    var _selection = selection.selectedNodes();
    _selection.forEach(function(i){
      var itemIndex = itemData.indexOf(i);
      if( itemIndex === -1 ) return;
      itemData.splice( itemIndex, 1 );
    });

    _saveData();
    
    _setCurrentItem( curentItemindex );

    // MessageLog.trace('!!!'+modal.curentItemName+' > '+result );
    // MessageLog.trace('!!!'+modal.curentItemName+' > '+modal.textEdit.plainText );
  });
  removeFromSetButton.setStyleSheet("background-color: #4e4141;");

  //
  ui.mainLayout.addStretch();

  //
  // var filePath = fileMapper.toNativePath( scene.currentProjectPath()+'/ps/SelectionSetData.json' );
  var filePath = pFile.checkPath( '~/ps/SelectionSetData.json' );
  MessageLog.trace('filePath: '+filePath);
  var fileData = pFile.loadJSON(filePath,{});
  MessageLog.trace( 'fileData: '+JSON.stringify(fileData) );

  _fillListWidget();
  _setCurrentItem(0);

  modal.show();


  // - - - -
  //
  function _saveData(){
    pFile.saveJSON( filePath, fileData );
  }

  //
  function _setCurrentItem( index ){
    curentItemindex = index;
    curentItemName = Object.keys(fileData)[index];
    if( curentItemName ){
      buttonsGroup.title = 'Edit Set: '+curentItemName +' ('+ (fileData[curentItemName].length || 0)+')';
    }else{
      buttonsGroup.title = 'Nothing is selected';
    }
  }

  //
  function _addSelectionToSet(){
  
    if( !curentItemName ) return;
    
    var _selection = selection.selectedNodes();
    MessageLog.trace('addToSetButton', _selection );
    var itemData = fileData[curentItemName];

    _selection.forEach(function(i){
      if( itemData.indexOf(i) === -1 ) itemData.push(i);
    });

    _saveData();
    
    _setCurrentItem( curentItemindex );

    // MessageLog.trace('!!!'+modal.curentItemName+' > '+result );
    // MessageLog.trace('!!!'+modal.curentItemName+' > '+modal.textEdit.plainText );
  }


  //
  function _fillListWidget( v ){
    // MessageLog.trace('_fillListWidget: '+modal+' >>> '+JSON.stringify(v, true, '  '));
    
    listJustUpdated = true;

    modal.listWidget.clear();

    var items = Object.keys(fileData);

    modal.listWidget.addItems(items);
  }


  //
  function _createSet(){
    
    var columnName = (modal.newSetInput.text || '').trim();
    // MessageLog.trace('_createSet: '+columnName+', '+modal.textEdit.plainText );

    if( !columnName ){
      MessageLog.trace('Name of the Set required');
      return;
    }

    if( fileData[columnName] ){
      MessageLog.trace('Name is used');
      return;
    }

    MessageLog.trace('!!!' + columnName );
    fileData[columnName] = [];

    _fillListWidget();
    _saveData();

    _setCurrentItem( Object.keys(fileData).length-1 );

    _addSelectionToSet();

    // MessageLog.trace('_createSet: SUCCESS');

  }

  //
  function _deleteSet(){
    
    if( !curentItemName ) return;

    delete fileData[curentItemName];
    _fillListWidget();
    _saveData();

    _setCurrentItem( 0 );

    // MessageLog.trace('_deleteSet: '+_node+', '+modal.curentItemName );
    // MessageLog.trace('_deleteSet: SUCCESS ' + result );
  }


}