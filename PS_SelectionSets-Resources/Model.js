/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210905
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/NodeUtils.js"));

///
var dataNodePrefix = 'PS-SS_';

///
function Model( scriptVer ){

  var _this = this;

  //
  this.getSetsDataFromScene = function(){
    
    var _dataNodes = node.getNodes(['NOTE']);
    // MessageLog.trace('getSetsDataFromScene: '+dataNodes );
    var dataNodes = [];

    _dataNodes.forEach(function(dataNode){
      var text = (node.getTextAttr(dataNode, 1, 'text') || '').trim();
      if( text.indexOf('%%PS_SelectionSets|') !== 0 ) return;
      try{
        
        text = text.replace(/%%PS_SelectionSets\|v(.)*%%/,'');
        var groupData = JSON.parse(text);
        
        // Update Ids
        groupData.id = Utils.createUid();
        groupData.isGroup = true;
        groupData.dataNode = dataNode;

        groupData.items.forEach(function(setData){
          
          setData.id = Utils.createUid();
          setData.groupId = groupData.id;

          // Update nodes state
          var nodesVisibilityState;

          setData.nodes.forEach(function(_node,i){
            
            if( !node.type(_node) ){ // Node not exists
              MessageLog.trace('Node in Selection Set "'+dataNode+'" not found "'+_node+'"');
              return;
            }

            if( i===0 ) nodesVisibilityState = node.getEnable(_node);
            else if( nodesVisibilityState !== 'mixed' && nodesVisibilityState !== node.getEnable(_node) ) nodesVisibilityState = 'mixed';

          });

          setData.nodesVisibilityState = nodesVisibilityState === 'mixed' ? 'mixed' : ( nodesVisibilityState ? 'visible' : 'hidden' );

        });

        dataNodes.push(groupData);

        // MessageLog.trace('>>'+JSON.stringify(text,true,'  '));
      }catch(err){
        MessageLog.trace('Error while Selection Set data parsing in node "'+dataNode+'".\n'+err);
      }
      // 
    });

    this.dataNodes = dataNodes.length ? dataNodes : null;

    return this.dataNodes;

  }

  
  //
  this.getItemType = function( itemData ){
    return itemData ? (itemData.isGroup ? 'Group' : 'Selection Set') : undefined;
  }


  //
  this.createDataNode = function( parentNode, nodeName ){

    if( !parentNode ) parentNode = 'Top';
    var dataNodeName = nodeName || parentNode.split('/').pop();
    dataNodeName = dataNodeName==='Top' ? scene.currentScene() : dataNodeName;  

    //
    var dataNode = node.add(
      parentNode,
      NodeUtils.getUnusedName( parentNode+'/'+NodeUtils.getValidNodeName(dataNodePrefix+dataNodeName), true ),
      'NOTE',
      0,
      0,
      0
    );

    // Define the position of the Node
    var nodesBounds = NodeUtils.getNodesBounds( node.subNodes(parentNode) );
    node.setCoord( dataNode, nodesBounds.x.center, nodesBounds.y.top - 50 );

    // Node data
    var data = {
      isGroup: true,
      dataNode: dataNode,
      name: dataNodeName,
      id: Utils.createUid(),
      items: []
    };

    node.setTextAttr( dataNode, 'text', 1, this.getItemDataText(data) );

    // MessageLog.trace('Created SS dataNode:'+dataNode);

    return data;
    
  }


  //
  this.getItemDataById = function( id ){
    
    if( !this.dataNodes ) return;
    if( id.id ) return id;

    var result;

    this.dataNodes.every(function( groupData ){
      
      if( groupData.id !== id ) {

        groupData.items.every(function( setData ){
          
          if( setData.id !== id )  return true;

          result = setData;            

        });

        return !result;

      }

      result = groupData;

    });

    return result;
  }

  
  //
  this.duplicateGroup = function( id, name, parentNode ){

    var originalGroupData = this.getItemDataById(id);
    if( !originalGroupData || !originalGroupData.isGroup ) return;

    var newGroupData = this.createDataNode( parentNode, name );

    originalGroupData.items.forEach(function( itemData ){
      _this.duplicateItem( itemData, itemData.name, newGroupData, true );
    });

    this.saveGroupData( newGroupData );

    return newGroupData;
    
  }


  //
  this.duplicateItem = function( id, name, groupId, skipApply ){

    // MessageLog.trace('duplicateItem: '+id+' > '+name+' > '+groupId);
    var itemData = this.getItemDataById(id);
    if( !itemData || itemData.isGroup ) {
      // MessageLog.trace('duplicateItem: no ItemData received.');
      return;
    }

    var newItemData = this.createSetInGroup( groupId || itemData.groupId, name, itemData.nodes ? itemData.nodes.slice(0) : [] );
    if( !newItemData ) {
      // MessageLog.trace('duplicateItem: newItemData not created');
      return;
    }

    if( !skipApply ) this.saveGroupData( itemData );
    
    // MessageLog.trace('duplicateItem: Successed: '+groupId.name+' >> '+skipApply+' >> '+JSON.stringify(newItemData,true,'  ') );

    return newItemData;
  }


  //
  this.deleteItemById = function( id ){

    var itemData = this.getItemDataById(id);
    if( !itemData ) return;

    if( itemData.isGroup ){ // Delete Group Item

      if( !node.type(itemData.dataNode) ) {
        MessageLog.trace('Data node is not available "'+itemData.dataNode+'"');
        return;
      }

      node.deleteNode(itemData.dataNode);

    }else{ // Delete Selection Set Item

      var groupData = this.getItemDataById(itemData.groupId);
      if( !groupData ) {
        MessageLog.trace('Group item not found');
        return;
      }

      var index = groupData.items.indexOf(itemData);
      if( index >= 0 ) {
        groupData.items.splice( index, 1 );
        this.saveGroupData( groupData );
      }

    }

    return itemData;

  }


  //
  this.renameItem = function( id, newName ){
    
    // MessageLog.trace('renameItem: "'+id+'", "'+newName+'"');
    // MessageLog.trace(JSON.stringify(this.dataNodes,true,'  '));
    
    var itemData = this.getItemDataById(id);
    if( !itemData ) {
      MessageLog.trace('renameItem: item not found');
      return;
    }

    itemData.name = newName;

    if( itemData.isGroup ){

      var dataNodeParent = itemData.dataNode.split('/');
      dataNodeParent.pop();
      dataNodeParent = dataNodeParent.join('/');
      var dataNodeName = NodeUtils.getUnusedName( dataNodeParent+'/'+ NodeUtils.getValidNodeName(dataNodePrefix+newName), true );
      // MessageLog.trace('dataNodeName: '+dataNodeName+'; '+dataNodeParent );
      node.rename( itemData.dataNode, dataNodeName );
      
      itemData.dataNode = itemData.dataNode = dataNodeParent+'/'+dataNodeName;
    }

    this.saveGroupData( itemData );

  }

  
  //
  this.editItemDescription = function( id, description ){

    var itemData = this.getItemDataById(id);
    if( !itemData ) {
      MessageLog.trace('renameItem: item not found');
      return;
    }

    itemData.description = description;

    this.saveGroupData( itemData );

  }



  //
  this.createSetInGroup = function( groupId, setName, nodes ){
    
    // try{

    var groupData = this.getItemDataById(groupId);
    // MessageLog.trace('createSetInGroup'+JSON.stringify(groupData,true,'  '));
    if( !groupData || !groupData.isGroup ) {
      MessageLog.trace('createSetInGroup: groupId not recqived '+groupData.name);
      return;
    }

    var itemData = {
      id: Utils.createUid(),
      name: setName,
      groupId: groupData.id,
      nodes: nodes || [],
    };
    groupData.items.push( itemData );

    // MessageLog.trace('createSetInGroup', groupId, setName, JSON.stringify(groupData,true,' ') );

    this.saveGroupData( groupData );

    return itemData;
    // }catch(err){MessageLog.trace('createSetInGroup Err:'+err)}

  }


  //
  this.addNodesToItem = function( setData, nodes, replace ){
    
    if( !nodes ) return;

    setData.nodes = ( (replace ? [] : setData.nodes ) || [] ).concat( nodes );
    setData.nodes = setData.nodes.filter(function(_node, pos) {
        return setData.nodes.indexOf(_node) == pos;
      })
    ;

    setData.updateVisibilityCellState( true );

    this.saveGroupData( setData );

  }

  
  //
  this.removeNodesFromItem = function( itemData, nodes ){
    
    if( !nodes || !nodes.length || !itemData.nodes || !itemData.nodes.length ) return;
    
    nodes.forEach(function(_node){
      var index = itemData.nodes.indexOf(_node);
      if( index !== -1 ){
        itemData.nodes.splice( index, 1 );
      }
    });

    this.saveGroupData( itemData );

  }


  //
  this.removeMissedNodes = function( itemData ){

    // try{

    if( !itemData || !itemData.nodes || !itemData.nodes.length ) return;

    itemData.nodes = itemData.nodes.filter(function( _node, i ){
      return node.type(_node);
    });

    this.saveGroupData( itemData );

     // }catch(err){MessageLog.trace('showCreateSetUI Err:'+err)}

  }


  //
  this.toggleSetNodes = function( itemData ){

    if( !itemData.nodes || !itemData.nodes.length ) return;
    
    var enable;

    itemData.nodes.forEach(function(_node){
      if( !node.type(_node) ) return;
      if( enable === undefined ) enable = !node.getEnable( _node );
      node.setEnable( _node, enable );
    });

    itemData.updateVisibilityCellState( true );

  }


  //
  this.selectSetNodes = function( itemData ){

    if( !itemData.nodes || !itemData.nodes.length ) return;

    selection.clearSelection();
    selection.addNodesToSelection( itemData.nodes );

  }


  ///
  this.saveGroupData = function( itemData ){
    // check Data Node is available
    
    if( !itemData.isGroup ){
      itemData = this.getItemDataById( itemData.groupId );
    }

    // Update nodes count of the Selection Sets
    itemData.items.forEach(function( itemData ){
      if( itemData.counterItem ) itemData.counterItem.setText( itemData.nodes ? itemData.nodes.length : 0 );
    });

    if( !node.type(itemData.dataNode) ) {
      MessageLog.trace('Data node is not available "'+itemData.dataNode+'"');
      MessageBox.warning('Unable to save Selection Set data to Data Node "'+itemData.dataNode+'".\nProbably it was just deleted, renamed or removed.\nYou can try to press Refresh button in context menu.',0,0,0,'Saving Error')
      return;
    }

    node.setTextAttr( itemData.dataNode, 'text', 1, this.getItemDataText(itemData) );

    // MessageLog.trace('saveGroupData success'+JSON.stringify(itemData,true,'  '));

  }


  //
  this.getItemDataText = function( data ){
    
    // Cleanup data
    data = {
      name: data.name,
      id: data.id,
      isExpanded: data.isExpanded,
      description: data.description,
      items: data.items.map(function(setData){
        return {
          name: setData.name,
          id: setData.id,
          nodes: setData.nodes,
          description: setData.description
        }
      })
    };

    return '%%PS_SelectionSets|v'+scriptVer+'%%\n'+JSON.stringify(data,true,'  ');

  }


}

exports = Model;