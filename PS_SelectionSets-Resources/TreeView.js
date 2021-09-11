/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210905
*/

var TreeView = function( parent, resourcesPath ){

  var visibleIcon = new QIcon( resourcesPath + 'visible.png' );
  var hiddenIcon = new QIcon( resourcesPath + 'hidden.png' );
  var mixedVisibilityIcon = new QIcon( resourcesPath + 'mixedVisibility.png' );

  var _this = this;
  var rootItem;
  var dataByItemId = {};

  var treeView = this.treeView = new QTreeView(this);
  treeView.headerHidden = true;
  // MessageLog.trace('indentation '+ treeView.wordWrap  );
  treeView.indentation = 10;

  // MessageLog.trace('H: '+Object.getOwnPropertyNames(treeView).join('\n') );

  var model = this.model = new QStandardItemModel();
  treeView.setModel(model);

  parent.mainLayout.addWidget( treeView, 0, 0 );
  
  // -------------------------------------------------
  /// Events

  var isRightButtonClick;
  var currentItemData;
  var clickedPoint;

  var clickTimer = new QTimer(treeView);

  function clearClickTimerData(){

    isRightButtonClick = undefined;
    currentItemData = undefined;

  }

  function clickTimerComplete(){
    
    // MessageLog.trace('CLICK TIMER ' +isRightButtonClick );
     clickTimer.stop();

    if( isRightButtonClick ){

      // MessageLog.trace('RIGHT MOUSE BUTTON');
      if( _this.onItemContextMenu ) _this.onItemContextMenu( currentItemData, {
        globalPos: function(){ return clickedPoint; }
      });

    }else{

      // MessageLog.trace('LEFT MOUSE BUTTON');
      if( currentItemData && _this.onItemClick ) _this.onItemClick( currentItemData );

    }

    clearClickTimerData();

  }

  clickTimer.timeout.connect(clickTimerComplete);

  //
  treeView.clicked.connect( function(index){
    
    clickTimer.stop();
    isRightButtonClick = false;

    currentItemData = getItemDataByIndex( index );

    // MessageLog.trace('CLICKED: '+index.column()+': '+currentItemData );
    
    switch( index.column() ){

      case 0:
        clickTimer.start(6);
        break;

      case 1:
        if( _this.onItemVisibilityClick ) _this.onItemVisibilityClick( currentItemData );
        clearClickTimerData();
        break;
    }

  });

  treeView.contextMenuPolicy = Qt.CustomContextMenu;
  treeView.customContextMenuRequested.connect(function(_clickedPoint){
    // MessageLog.trace('CONTEXT MENU '+isRightButtonClick );
    var _isRightButtonClick = isRightButtonClick;
    isRightButtonClick = true;
    clickedPoint = treeView.mapToGlobal( _clickedPoint );
    if( _isRightButtonClick === undefined ) clickTimerComplete();

  });
  
  //
  treeView.collapsed.connect(function(index){
    // MessageLog.trace('collapsed');
    if( _this.onCollapsed ) _this.onCollapsed( getItemDataByIndex( index ), index );
  });

  //
  treeView.expanded.connect(function(index){
    // MessageLog.trace('expanded');
    if( _this.onExpanded ) _this.onExpanded( getItemDataByIndex( index ), index );
  });


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

        if( groupData.isExpanded ) treeView.expand( model.indexFromItem( groupItem ) );

      }

    });

    this.treeView.resizeColumnToContents(1);
    this.treeView.resizeColumnToContents(2);
    // this.treeView.expandAll();

  }


  this.refresh = function(){
    // treeView.dataChanged.emit(new QModelIndex(), new QModelIndex());
    // MessageLog.trace('!!!!'+treeView.toString() );
    // treeView.layoutChanged.emit();
    // treeView.itemChanged.emit();
  }


  ///
  function addItem( itemData, parent, id ){
    
    var rowItems = [];

    // Item
    var item = itemData.modelItem = _addItem(
      itemData.name,
      itemData.id,
      rowItems
    );

    item.setToolTip( itemData.description || ( itemData.isGroup ? itemData.dataNode : '' ) );

    // Visibility Item
    var visibilityItem = itemData.visibilityItem = _addItem(
      undefined,
      !itemData.isGroup ? itemData.id : undefined,
      rowItems
    );

    visibilityItem.setToolTip( 'Click to toggle visibility of the Selection Set nodes.\nOr Click + Alt on a Selection Set Name.' );

    if( !itemData.isGroup ) {

      itemData.updateVisibilityCellState = function(){

        switch( itemData.nodesVisibilityState ){
          
          case 'visible':
          case true:
            visibilityItem.setIcon( visibleIcon );

            break;

          case 'hidden':
          case false:
            visibilityItem.setIcon( hiddenIcon );
            break;

          case 'mixed':
          case undefined:
            visibilityItem.setIcon( mixedVisibilityIcon );
            break;

        }

      }

    }else{
        
      itemData.updateVisibilityCellState = function(){};

    }

    itemData.updateVisibilityCellState(); 


    // Counter Item
    var counterItem = itemData.counterItem = _addItem(
      !itemData.isGroup ? (itemData.nodes ? itemData.nodes.length : 0) : undefined,
      undefined,
      rowItems
    );

    counterItem.setToolTip( 'Number of nodes in this Selection Set' );

       
    //
    // if( !isGroup ) item.setTextAlignment(Qt.AlignRight);
    ( parent===true ? rootItem : parent ).appendRow( rowItems );

    dataByItemId[itemData.id] = itemData;

    return item;

  }

  function _addItem( text, id, rowItems ){

    var item = new QStandardItem();
    if( text !== undefined ) item.setText( text );
    item.setEditable(false);
    item.setWhatsThis(id);
    rowItems.push( item );
    return item;

  }


  //
  function getItemDataByIndex( index ){
    item = index ? model.itemFromIndex(index) : null;
    return item ? dataByItemId[item.whatsThis()] : null;
  }

}


///
exports = TreeView;