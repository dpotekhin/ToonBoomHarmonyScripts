/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210905
*/

var _ContextMenu = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/ContextMenu.js"));
var TreeView = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SelectionSets-Resources/TreeView.js"));
var Model = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SelectionSets-Resources/Model.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

///
function SSList( scriptVer, parent ){

  var ContextMenu = _ContextMenu;

  var currentItemData;

  var model = new Model( scriptVer );

  var treeView = new TreeView( parent );

  //
  treeView.onItemClick = function( event, itemData ){

    // MessageLog.trace('clicked:'+JSON.stringify(itemData,true,'  '));
    currentItemData = itemData;

    if( KeyModifiers.IsControlPressed() ) addSelectionToSet();
    else if( KeyModifiers.IsShiftPressed() ) removeSelectionFromSet();
    else if( KeyModifiers.IsAlternatePressed() ) toggleSetNodes();
    else selectSetNodes();
    
    // MessageLog.trace('-->'+itemData.modelItem.text()+', '+itemData.id );
  }

  //
  treeView.onItemContextMenu = function( event, itemData ){

    try{

    // MessageLog.trace('onItemContextMenu: '+itemData.id );

    currentItemData = itemData;

    if( itemData ){

      if( itemData.isGroup ){
        
        ContextMenu.showContextMenu({
            '!Rename Group': showRenameUI,
            '!Create Group': showCreateGroupUI,
            '!Delete Group': deleteItem,
            '-1': 1,
            '!Create Selection Set': showCreateSetUI,
            '-2': 1,
            '!Select Group Data Node': selectGroupDataNode,
            '!Refresh': refreshData,
          }, event, parent );

      }else{

        ContextMenu.showContextMenu({
            '!Add Selection to Set': addSelectionToSet,
            '!Remove Selection from Set': removeSelectionFromSet,
            '!Replace Set with Selection': replaceSetWithSelection,
            '!Clear Set': clearSet,
            '!Remove Missed Nodes': removeMissedNodes,
            '-1': 1,
            '!Rename Set': showRenameUI,
            '!Delete Set': deleteItem,
          }, event, parent );

      }

    }else{

      // MessageLog.trace('Click in empty place.');
      ContextMenu.showContextMenu({
          '!Create Group': showCreateGroupUI,
          '!Refresh': refreshData,
        }, event, parent );

    }

    }catch(err){MessageLog.trace('Err:'+err)}
    
  }


  /// START  
  updateList();

  /// --------------------------------------------------

  ///
  function updateList(){
    
    var setsData = model.getSetsDataFromScene();

    if( !setsData ){ // Create a default Selection Set group if there's no Selection sets groups in scene

      model.createDataNode();
      setsData = model.getSetsDataFromScene();

    }

    /*
    MessageLog.trace('>>>>>>>>>>>> updateList >>>>>>>>>>>>');
    MessageLog.trace(JSON.stringify(setsData,true,'  '));
    MessageLog.trace('<<<<<<<<<<<< updateList <<<<<<<<<<<<');
    */

    var dataForTreeView = [];

    setsData.forEach(function(setGroupData){
      dataForTreeView.push(setGroupData);      
    });
    
    // MessageLog.trace(JSON.stringify(dataForTreeView,true,'  '));

    treeView.setData( dataForTreeView );
    

  }

  ///
  function fakeAction(){
    MessageLog.trace('Action is not implemented yet');
  }

  
  //
  function refreshData(){
    updateList();
  }


  //
  function showRenameUI(){

    // MessageLog.trace('showRenameUI: "'+currentItemData.name+'"');
    var newName = Input.getText(
      'New Name',
      currentItemData.name,
      'Enter Group Name'
    );
    newName = newName.trim();
    if( !newName || newName === currentItemData.name ) return;

    model.renameItem( currentItemData.id, newName );
    currentItemData.modelItem.setText( newName );

  }


  //
  function selectGroupDataNode(){
    var _node = currentItemData.dataNode;
    if(!_node) return;
    // MessageLog.trace( 'selectGroupDataNode: '+_node );
    selection.clearSelection();
    selection.addNodeToSelection(_node);
  }


  //
  function showCreateSetUI( ){

    // try{

    var setName = Input.getText(
      'Selection Set Name',
      '',
      'Enter Selection Set Name'
    );
    setName = setName.trim();
    if( !setName ) return;

    model.createSetInGroup( currentItemData.id, setName );

    updateList();

    // }catch(err){MessageLog.trace('showCreateSetUI Err:'+err)}

  }


  //
  function showCreateGroupUI(){

    var myDialog = new Dialog();
    myDialog.title = "Create Selection Set Group";

    var groupList = SelectionUtils.filterNodesByType( 'Top', 'GROUP', true );

    // Parent node
    var groupNodeInput = new ComboBox();
    groupNodeInput.label = "Parent Group:"
    // groupNodeInput.editable = true;
    groupNodeInput.itemList = groupList;
    myDialog.add( groupNodeInput );

    // SS group Name
    var groupNameInput = new LineEdit();
    groupNameInput.label = "Group Name:";
    myDialog.add( groupNameInput );

    if( !myDialog.exec() ) return;

    var parentNode = groupNodeInput.currentItem;
    if( !parentNode ) return;

    var ssGroupName = groupNameInput.text.trim();
    if( !ssGroupName ){
      MessageBox.warning('Group Name required',0,0,0,'Error');
      return;
    }

    MessageLog.trace("Data:" +parentNode+ ", "+ssGroupName );

    scene.beginUndoRedoAccum('Create Selection Set Group');

    model.createDataNode( parentNode, ssGroupName );
    
    SelectionUtils.selectNodes( parentNode );

    updateList();

    scene.endUndoRedoAccum();

  }


  //
  function deleteItem(){

    // MessageLog.trace('deleteItem');
    
    scene.beginUndoRedoAccum('Delete Selection Set Group');

    model.deleteItemById( currentItemData.id );
    
    updateList();

    scene.endUndoRedoAccum();

  }


  //
  function addSelectionToSet(){

    // MessageLog.trace('addSelectionToSet: @1: '+JSON.stringify(currentItemData,true,'  ') );
    
    scene.beginUndoRedoAccum('Add Selection to Set');

    model.addNodesToItem( currentItemData, selection.selectedNodes() );

    scene.endUndoRedoAccum();

    // MessageLog.trace('addSelectionToSet: @2: '+JSON.stringify(currentItemData,true,'  ') );

  }


  //
  function removeSelectionFromSet(){

    // MessageLog.trace('removeSelectionFromSet: @1: '+JSON.stringify(currentItemData,true,'  ') );
    
    scene.beginUndoRedoAccum('Remove Selection from Set');

    model.removeNodesFromItem( currentItemData, selection.selectedNodes() );

    scene.endUndoRedoAccum();

    // MessageLog.trace('removeSelectionFromSet: @2: '+JSON.stringify(currentItemData,true,'  ') );

  }


  //
  function replaceSetWithSelection(){

    // MessageLog.trace('replaceSetWithSelection: @1: '+JSON.stringify(currentItemData,true,'  ') );
    
    scene.beginUndoRedoAccum('Replace Set with Selection');

    model.addNodesToItem( currentItemData, selection.selectedNodes(), true );

    scene.endUndoRedoAccum();

    // MessageLog.trace('replaceSetWithSelection: @2: '+JSON.stringify(currentItemData,true,'  ') );

  }


  //
  function clearSet(){

    // MessageLog.trace('clearSet: @1: '+JSON.stringify(currentItemData,true,'  ') );
    
    scene.beginUndoRedoAccum('Remove Missed Nodes');

    model.addNodesToItem( currentItemData, [], true );

    scene.endUndoRedoAccum();

    // MessageLog.trace('clearSet: @2: '+JSON.stringify(currentItemData,true,'  ') );

  }


  //
  function removeMissedNodes(){

    // MessageLog.trace('removeMissedNodes: @1: '+JSON.stringify(currentItemData,true,'  ') );
    
    scene.beginUndoRedoAccum('Remove Missed Nodes');

    model.removeMissedNodes( currentItemData );

    scene.endUndoRedoAccum();

    // MessageLog.trace('removeMissedNodes: @2: '+JSON.stringify(currentItemData,true,'  ') );

  }


  //
  function toggleSetNodes(){

    scene.beginUndoRedoAccum('Toggle Set Nodes');

    model.toggleSetNodes( currentItemData );

    scene.endUndoRedoAccum();

  }

  //
  function selectSetNodes(){

    scene.beginUndoRedoAccum('Select Set Nodes');

    model.selectSetNodes( currentItemData );

    scene.endUndoRedoAccum();

  }

}

///
exports = SSList;