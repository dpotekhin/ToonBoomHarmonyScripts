/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.211006
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
        groupData.dataNodeParent = NodeUtils.getNodeParent( dataNode )

        if( groupData.originalDataNodeParent ) {
          
          if( groupData.originalDataNodeParent !== groupData.dataNodeParent ){
            
            if( _this.fixNodesToNewDataNodeGroup( groupData ) ){

              groupData.originalDataNodeParent = groupData.dataNodeParent;

            }else{

              groupData.dataNodeIsMoved = true;

            }

          }
          
          // TODO: Fix node paths of Selections Sets in this Group
        }

        groupData.items.forEach(function(setData){
          
          setData.id = Utils.createUid();
          setData.groupId = groupData.id;

        });

        dataNodes.push(groupData);

        // MessageLog.trace('>>'+JSON.stringify(text,true,'  '));
      }catch(err){ MessageLog.trace('Error while Selection Set data parsing in node "'+dataNode+'".\n'+err);}
      // 
    });

    this.dataNodes = dataNodes.length ? dataNodes : null;

    return this.dataNodes;

  }

  
  //
  this.hasDataNodes = function() {
    return this.dataNodes && this.dataNodes.length;
  }


  //
  this.fixNodesToNewDataNodeGroup = function( groupData ){

    var success = true;

    groupData.items.forEach(function( setData ){

      setData.nodes = setData.nodes.map(function( _node ){
        // MessageLog.trace( '-> '+_node+' >> '+groupData.originalDataNodeParent+' >> '+groupData.dataNodeParent );
        if( !node.type(_node) ){

          var __node = _node.replace( groupData.originalDataNodeParent, groupData.dataNodeParent );

          if( !node.type(__node) ){
            success = false;
            return _node;
          }

          return __node;

        }

        return _node;

      });

    });

    return success;

  }


  //
  this.getItemType = function( itemData ){
    return itemData ? (itemData.isGroup ? 'Group' : 'Selection Set') : undefined;
  }


  //
  this.createDataNode = function( parentNode, nodeName, data ){

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
    if( !data ) {
        data = {
        isGroup: true,
        dataNode: dataNode,
        name: dataNodeName,
        items: []
      };
    }
    data.id = Utils.createUid();

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
  this.deleteAllGroups = function() {
    
    this.dataNodes.forEach(function(itemData){
      node.deleteNode(itemData.dataNode);
    });

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
      MessageLog.trace('createSetInGroup: groupId not received '+groupData.name);
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
  this.removeLostNodes = function( itemData ){

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
      
      var nodeType = node.type(_node);
      if( !nodeType ) return;
      // MessageLog.trace('toggleSetNodes: '+ _node+', '+nodeType );
      if( enable === undefined ) enable = !node.getEnable( _node );
      node.setEnable( _node, enable );

      switch( nodeType ){
        /*
        case 'CurveModule':
        case 'OffsetModule':
          MessageLog.trace('Toggle deformers: '+enable+' > '+_node );
          if( enable ) Action.perform("onActionShowDeformer(String)","miniPegModuleResponder", _node );
          else Action.perform("onActionHideDeformer(String)","miniPegModuleResponder", _node );
          break;
        */
        case 'MasterController':        
          node.showControls( _node, enable );
          break;
      }

    });

    itemData.updateVisibilityCellState( true );

  }


  //
  this.selectSetNodes = function( itemData ){

    if( !itemData.nodes || !itemData.nodes.length ) return;

    selection.clearSelection();
    selection.addNodesToSelection( itemData.nodes );

  }


  //
  this.setItemColor = function( itemData, color ){
    
    if( color ){
      
      color = typeof color === 'string' ? color : '#'+Utils.rgbToHex( color.red(), color.green(), color.blue() );
      itemData.color = color;

    }else{
      
      delete itemData.color;

    }
    
    _this.saveGroupData( itemData );

    return color;

  }


  //
  this.arrangeSet = function( setData, arrangeMode ){

    var groupData = this.getItemDataById( setData.groupId );
    if( !groupData ) return;

    var itemsCount = groupData.items.length;
    if( itemsCount < 2 ) return;

    var setIndex = -1;

    groupData.items.every(function(_setData,i){
      if( _setData.id !== setData.id ) return true;
      setIndex = i;
    });
    // MessageLog.trace('setIndex: '+arrangeMode+' >> '+setIndex);
    if( setIndex < 0 ) return;

    var isMoved;

    switch( arrangeMode ){
      
      case 'top':
        if( setIndex === 0 ) return;
        groupData.items.splice( setIndex, 1 );
        groupData.items.unshift( setData );
        isMoved = true;
        break;

      case 'up':
        if( setIndex === 0 ) return;
        groupData.items.splice( setIndex, 1 );
        groupData.items.splice( setIndex-1, 0, setData );
        isMoved = true;
        break;

      case 'down':
        if( setIndex === itemsCount-1 ) return;
        groupData.items.splice( setIndex, 1 );
        groupData.items.splice( setIndex+1, 0, setData );
        isMoved = true;
        break;

      case 'bottom':
        if( setIndex === itemsCount-1 ) return;
        groupData.items.splice( setIndex, 1 );
        groupData.items.push( setData );
        isMoved = true;
        break;

    }

    if( isMoved ){

      // MessageLog.trace('APPLIED: '+JSON.stringify(groupData.items,true,' ') );
      
      _this.saveGroupData( groupData );

      return true;
    }

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
      MessageBox.warning('Unable to save Selection Set data to Data Node "'+itemData.dataNode+'".\nProbably it was just deleted, renamed or removed.\nYou can try to press Refresh button in context menu.',0,0,0,'Saving Error');
      return;
    }

    node.setTextAttr( itemData.dataNode, 'text', 1, this.getItemDataText(itemData) );

    // MessageLog.trace('saveGroupData success'+JSON.stringify(itemData,true,'  '));

  }


  //
  this.getClearItemData = function( data ) {

    return {
      name: data.name,
      id: data.id,
      isExpanded: data.isExpanded,
      color: data.color,
      dataNode: data.dataNode,
      dataNodeParent: data.dataNodeParent,
      originalDataNodeParent: data.originalDataNodeParent || data.dataNodeParent,
      description: data.description,

      items: data.items.map(function(setData){
        return {
          name: setData.name,
          id: setData.id,
          nodes: setData.nodes,
          color: setData.color,
          description: setData.description
        }
      })
    };

  }

  //
  this.getItemDataText = function( data ){
    
    // Cleanup data
    data = this.getClearItemData( data );

    return '%%PS_SelectionSets|v'+scriptVer+'%%\n'+JSON.stringify(data,true,'  ');

  }

  //
  this.exportGroupDataToFile = function( itemData ){

    var _this = this;

    if( !itemData ){
      itemData = {
        PS_SelectionSets: this.dataNodes.map( function( groupData ) { return _this.getClearItemData( groupData); })
      };
    }
    

    // MessageLog.trace('exportGroupDataToFile: '+JSON.stringify(itemData,true,'  '));

    var filePath = FileDialog.getSaveFileName('*.json');

    if( !filePath ) return;

    MessageLog.trace('File: '+filePath );

    try {
      var file = new File(filePath);
      file.open(2); // write only
      file.write( JSON.stringify(itemData,true,'  ') );
      file.close();
    } catch (err) { return; }

  }


  //
  this.importGroupDataFromFile = function() {
  
    var _this = this;    

    var filePath = FileDialog.getOpenFileName('*.json');

    if( !filePath ) return;

    var file = new File(filePath);
    var loadedData;

    try {
      if (file.exists) {
        file.open(1) // read only
        loadedData = file.read();
        file.close();
        
        return JSON.parse( loadedData )['PS_SelectionSets'];
      }
    }catch(err){ return; }

  }


}

exports = Model;