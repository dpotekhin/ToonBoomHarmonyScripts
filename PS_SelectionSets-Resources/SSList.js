/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210905
*/

var _ContextMenu = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/ContextMenu.js"));
var TreeView = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SelectionSets-Resources/TreeView.js"));
var Model = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SelectionSets-Resources/Model.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

///
function SSList( scriptVer, parentWidget ){

  var resourcesPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_SelectionSets-Resources/icons/");
  var ContextMenu = _ContextMenu;

  var currentItemData;

  var model = new Model( scriptVer );

  var treeView = new TreeView( parentWidget, resourcesPath );

  //
  treeView.onItemClick = function( itemData ){

    // MessageLog.trace('clicked:'+JSON.stringify(itemData,true,'  '));
    
    currentItemData = itemData;

    if( KeyModifiers.IsControlPressed() ) addSelectionToSet();
    else if( KeyModifiers.IsShiftPressed() ) removeSelectionFromSet();
    else if( KeyModifiers.IsAlternatePressed() ) toggleSetNodes();
    else selectSetNodes();

    setFocusOnMainWindow();

    // MessageLog.trace('-->'+itemData.modelItem.text()+', '+itemData.id );
  }

  //
  treeView.onItemContextMenu = function( itemData, event ){

    try{

    // MessageLog.trace('onItemContextMenu: '+itemData.id );

    currentItemData = itemData;

    if( itemData ){

      if( itemData.isGroup ){
        
        ContextMenu.showContextMenu({
            '!Rename Group': showRenameUI,
            '!Duplicate Group': duplicateGroup,
            '!Delete Group': deleteItem,
            '!Edit Description': editItemDescription,
            '-1': 1,
            '!Create Group': createGroup,
            '-2': 1,
            '!Create Selection Set from Selection': function(){ showCreateSetUI(true) },
            '!Create Empty Selection Set': showCreateSetUI,
            '-3': 1,
            '!Select Group Data Node': selectGroupDataNode,
            '!Refresh': refreshData,
          },
          event,
          parentWidget
        );

      }else{

        ContextMenu.showContextMenu({
            '!Add Selection to Set': addSelectionToSet,
            '!Remove Selection from Set': removeSelectionFromSet,
            '!Replace Set with Selection': replaceSetWithSelection,
            '!Clear Set': clearSet,
            '!Remove Lost Nodes': removeLostNodes,
            '-1': 1,
            '!Rename Set': showRenameUI,
            '!Duplicate Set': duplicateSet,
            '!Delete Set': deleteItem,
            '!Edit Description': editItemDescription,
          },
          event,
          parentWidget
        );

      }

    }else{

      // MessageLog.trace('Click in empty place.');
      ContextMenu.showContextMenu({
          '!Create Group': createGroup,
          '!Refresh': refreshData,
        },
        event,
        parentWidget
      );

    }

    }catch(err){MessageLog.trace('Err:'+err)}
    
  }

  //
  treeView.onItemVisibilityClick = function( itemData ){
    
    toggleSetNodes( itemData );

  }

  //
  treeView.onCollapsed = function( itemData, index ){
    if( !itemData ) return;
    // MessageLog.trace('onCollapsed '+JSON.stringify(itemData,true,'  ') );
    itemData.isExpanded = false;
    model.saveGroupData( itemData );
  }

  //
  treeView.onExpanded = function( itemData, index ){
    if( !itemData ) return;
    // MessageLog.trace('onExpanded '+JSON.stringify(itemData,true,'  ') );
    itemData.isExpanded = true;
    model.saveGroupData( itemData );
  }

  /// START  
  updateList();

  /// --------------------------------------------------

  ///
  function updateList(){
    
    var setsData = model.getSetsDataFromScene() || [];

    // if( !setsData ){ // Create a default Selection Set group if there's no Selection sets groups in scene

    //   model.createDataNode();
    //   setsData = model.getSetsDataFromScene();

    // }

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
  function editItemDescription(){
    var description = Input.getText(
      'Description',
      currentItemData.description,
      ''
    );
    description = description.trim();
    if( !description || description === currentItemData.description ) return;

    model.editItemDescription( currentItemData.id, description );
    currentItemData.modelItem.setToolTip( description );

  }


  //
  function selectGroupDataNode(){
    
    var _node = currentItemData.dataNode;
    if(!_node) return;
    
    // MessageLog.trace( 'selectGroupDataNode: '+_node );
    selection.clearSelection();
    selection.addNodeToSelection(_node);
    
    setFocusOnMainWindow();

  }


  //
  function showCreateSetUI( fromSelection ){

    // try{

    var setName = Input.getText(
      'Selection Set Name',
      '',
      'Enter Selection Set Name'
    );
    setName = setName.trim();
    if( !setName ) return;

    model.createSetInGroup( currentItemData.id, setName, fromSelection ? selection.selectedNodes() : undefined );

    updateList();

    // }catch(err){MessageLog.trace('showCreateSetUI Err:'+err)}

  }

  //
  function duplicateSet(){

    var itemType = model.getItemType( currentItemData );

    var dlg = new Dialog();
    dlg.title = "Duplicate Selection Set";

    var groupListData = {};
    var currentGroupIndex = 0;

    var groupList = model.dataNodes.map(function( groupData, i ){
      var groupLabel = (i+1)+': '+groupData.name;
      groupListData[groupLabel] = groupData;
      if( groupData.id === currentItemData.groupId ) currentGroupIndex = i;
      return groupLabel;
    });

    // Parent node
    var groupNodeInput = new ComboBox();
    groupNodeInput.label = "Parent Group:"
    // groupNodeInput.editable = true;
    groupNodeInput.itemList = groupList;
    groupNodeInput.currentItemPos = currentGroupIndex;
    dlg.add( groupNodeInput );

    // SS Name
    var itemNameInput = new LineEdit();
    itemNameInput.label = "Selection Set Name:";
    itemNameInput.text = currentItemData.name;
    dlg.add( itemNameInput );

    if( !dlg.exec() ) return;

    var parentNode = groupNodeInput.currentItem;
    if( !parentNode ) return;
    parentNode = groupListData[parentNode];

    var itemName = itemNameInput.text.trim();
    if( !itemName ){
      MessageBox.warning('Selection Set Name required',0,0,0,'Error');
      return;
    }

    scene.beginUndoRedoAccum('Duplicate Selection Set');

    model.duplicateItem( currentItemData, itemName, parentNode );
    
    updateList();

    scene.endUndoRedoAccum();

  }


  //
  function createGroup(){

    var userInput = showCreateGroupUI( "Create Selection Set Group" );
    if( !userInput ) return;

    MessageLog.trace("createGroup:" +userInput.parentNode+ ", "+userInput.ssGroupName );

    scene.beginUndoRedoAccum('Create Selection Set Group');

    var groupData = model.createDataNode( userInput.parentNode, userInput.ssGroupName );
    
    SelectionUtils.selectNodes( groupData.dataNode );

    updateList();

    scene.endUndoRedoAccum();

  }


  function duplicateGroup(){

    var userInput = showCreateGroupUI( 'Duplicate Selection Set Group', currentItemData );
    if( !userInput ) return;

    // MessageLog.trace("duplicateGroup:" +userInput.parentNode+ ", "+userInput.ssGroupName );

    scene.beginUndoRedoAccum('Duplicate Selection Set Group');

    var groupData = model.duplicateGroup( currentItemData, userInput.ssGroupName, userInput.parentNode );
    
    SelectionUtils.selectNodes( groupData.dataNode );

    updateList();

    scene.endUndoRedoAccum();

  }


  function showCreateGroupUI( title, groupData ){

    var dlg = new Dialog();
    dlg.title = title;

    var groupList = SelectionUtils.filterNodesByType( 'Top', 'GROUP', true )
      .filter(function(_node){ // To avoid a mess, only the root group and its first children are accepted in the group list.
        return !_node.match(/.*\/.*\/.*/g);
      })
    ;

    // Parent node
    var groupNodeInput = new ComboBox();
    groupNodeInput.label = "Parent Group:"
    if( groupData ){
      var groupDataParentNode = groupData.dataNode.split('/');
      groupDataParentNode.pop();
      groupDataParentNode = groupDataParentNode.join('/');
      groupNodeInput.currentItemPos = groupList.indexOf( groupDataParentNode );
    }
    // groupNodeInput.editable = true;
    groupNodeInput.itemList = groupList;
    dlg.add( groupNodeInput );

    // SS group Name
    var groupNameInput = new LineEdit();
    groupNameInput.label = "Group Name:";
    if( groupData ) groupNameInput.text = groupData.name;
    dlg.add( groupNameInput );

    if( !dlg.exec() ) return;

    var parentNode = groupNodeInput.currentItem;
    if( !parentNode ) return;

    var ssGroupName = groupNameInput.text.trim();
    if( !ssGroupName ){
      MessageBox.warning('Group Name required',0,0,0,'Error');
      return;
    }

    return {
      parentNode: parentNode,
      ssGroupName: ssGroupName,
    };

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

    currentItemData.updateVisibilityCellState( true );

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

    currentItemData.updateVisibilityCellState( true );

    scene.endUndoRedoAccum();

    // MessageLog.trace('replaceSetWithSelection: @2: '+JSON.stringify(currentItemData,true,'  ') );

  }


  //
  function clearSet(){

    // MessageLog.trace('clearSet: @1: '+JSON.stringify(currentItemData,true,'  ') );
    
    scene.beginUndoRedoAccum('Remove Lost Nodes');

    model.addNodesToItem( currentItemData, [], true );

    currentItemData.updateVisibilityCellState( true );

    scene.endUndoRedoAccum();

    // MessageLog.trace('clearSet: @2: '+JSON.stringify(currentItemData,true,'  ') );

  }


  //
  function removeLostNodes(){

    // MessageLog.trace('removeLostNodes: @1: '+JSON.stringify(currentItemData,true,'  ') );
    
    scene.beginUndoRedoAccum('Remove Lost Nodes');

    model.removeLostNodes( currentItemData );

    currentItemData.updateVisibilityCellState( true );

    scene.endUndoRedoAccum();

    // MessageLog.trace('removeLostNodes: @2: '+JSON.stringify(currentItemData,true,'  ') );

  }


  //
  function toggleSetNodes( itemData ){

    scene.beginUndoRedoAccum('Toggle Set Nodes');

    model.toggleSetNodes( itemData || currentItemData );

    scene.endUndoRedoAccum();

  }

  //
  function selectSetNodes(){

    scene.beginUndoRedoAccum('Select Set Nodes');

    model.selectSetNodes( currentItemData );

    scene.endUndoRedoAccum();

  }


  //
  function setFocusOnMainWindow(){
  
    parentWidget.setFocusOnMainWindow();

  }

  // PREFERENCES >>>
  var prefsName = 'PS_SelectionSets_Prefs';
  var prefs = this.prefs = JSON.parse( preferences.getString( prefsName, '{}' ) );

  this.savePrefs = function(){

    preferences.setString( prefsName, JSON.stringify(prefs) );
  
  }

}

///
exports = SSList;