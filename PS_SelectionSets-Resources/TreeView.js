/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210905
*/

var TreeView = function( parent ){

  var _this = this;
  var rootItem;
  var dataByItemId = {};

  var treeView = this.treeView = new QTreeView(this);
  treeView.headerHidden = true;
  // MessageLog.trace('indentation '+ treeView.wordWrap  );
  treeView.indentation = 10;

  var model = this.model = new QStandardItemModel();
  treeView.setModel(model);

  parent.mainLayout.addWidget( treeView, 0, 0 );
  
  // -------------------------------------------------
  /// Events

  var isRightButtonClick;
  var currentItemData;
  var clickedPoint;

  var clickTimer = new QTimer(treeView);

  function clickTimerComplete(){
    clickTimer.stop();
    // MessageLog.trace('CLICK TIMER ' +isRightButtonClick );

    if( isRightButtonClick ){

      // MessageLog.trace('RIGHT MOUSE BUTTON');
      if( _this.onItemContextMenu ) _this.onItemContextMenu( currentItemData, {
        globalPos: function(){ return clickedPoint; }
      });

    }else{

      // MessageLog.trace('LEFT MOUSE BUTTON');
      if( currentItemData && _this.onItemClick ) _this.onItemClick( currentItemData );

    }

    isRightButtonClick = undefined;
    currentItemData = undefined;

  }

  clickTimer.timeout.connect(clickTimerComplete);

  //
  treeView.clicked.connect( function(index){
    
    clickTimer.stop();
    isRightButtonClick = false;

    var item = index ? model.itemFromIndex(index) : null;
    currentItemData = item ? dataByItemId[item.whatsThis()] : null;

    // MessageLog.trace('CLICKED'+currentItemData);
    
    clickTimer.start(6);

  });

  treeView.contextMenuPolicy = Qt.CustomContextMenu;
  treeView.customContextMenuRequested.connect(function(_clickedPoint){
    // MessageLog.trace('CONTEXT MENU '+isRightButtonClick );
    var _isRightButtonClick = isRightButtonClick;
    isRightButtonClick = true;
    clickedPoint = treeView.mapToGlobal( _clickedPoint );
    if( _isRightButtonClick === undefined ) clickTimerComplete();

  });

  
  /*
  treeView.mouseReleaseEvent = function(event){
    // MessageLog.trace('MOUSE CLICK: '+JSON.stringify(event,true,'  ') );
    try{

    var index = treeView.indexAt(event.pos());
    var item = index ? model.itemFromIndex(index) : null;
    var currentItemData = item ? dataByItemId[item.whatsThis()] : null;

    // MessageLog.trace('clicked: "'+item.text()+'" > '+item.whatsThis()+' > '+currentItemData );

    if( event.button() === Qt.RightButton ){ // Right mouse button
      // MessageLog.trace('RIGHT');
      if( _this.onItemContextMenu ) _this.onItemContextMenu( event, currentItemData );
    }else{ // Other mouse buttons
      // MessageLog.trace('LEFT');
      if( currentItemData && _this.onItemClick ) _this.onItemClick( event, currentItemData );
    }

    // treeView.clearSelection();

    }catch(err){MessageLog.trace('err:'+err)}
    

  }
*/

  // -------------------------------------------------
  /// Methods
  this.setData = function(data){
    
    this.data = data;

    model.clear();
    
    rootItem = this.rootItem = model.invisibleRootItem();
      
    data.forEach(function(groupData){

      var groupItem = addItem( groupData, true );

      if( groupData.items && groupData.items.length ) {

        groupData.items.forEach(function(itemData){

          var item = addItem( itemData, groupItem );

        });

      }

    });

    this.treeView.expandAll();

  }

  this.refresh = function(){
    // treeView.dataChanged.emit(new QModelIndex(), new QModelIndex());
    // MessageLog.trace('!!!!'+treeView.toString() );
    // treeView.layoutChanged.emit();
    // treeView.itemChanged.emit();
  }

  ///
  function addItem( itemData, parent, id ){
    
    var item = new QStandardItem(itemData.name);
    item.setEditable(false);
    
    var counterItem = new QStandardItem();
    if( !itemData.isGroup ) counterItem.setText( itemData.nodes ? itemData.nodes.length : 0 );
    counterItem.setEditable(false);

    // if( !isGroup ) item.setTextAlignment(Qt.AlignRight);
    ( parent===true ? rootItem : parent ).appendRow([item,counterItem]);
    item.setWhatsThis(itemData.id);
    itemData.modelItem = item;
    itemData.counterItem = counterItem;
    dataByItemId[itemData.id] = itemData;
    return item;
  }

}


///
exports = TreeView;