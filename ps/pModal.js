function pModal( title, width, height, unique ){

  this.create(title, width, height, unique);
	
}


//
pModal.prototype.create = function( title, width, height, unique ){


    if( unique ){
      var modalIsCreated = false;
      
      (QApplication.allWidgets()).every(function(w,i){
        if(!w.windowTitle || w.windowTitle.indexOf(title) === -1 ) return true;
        // MessageLog.trace( i+' : '+w.windowTitle+' > '+(w.windowTitle === title) );
        if( w.windowTitle === title ){
          // MessageLog.trace( i+' : '+w.windowTitle );
          MessageLog.trace('Modal "'+title+'" is already created.');
          modalIsCreated = true;
          return false;
        }
        return true;
      });

      if(modalIsCreated) return;

    }

    // title += ~~(Math.random()*10000); // !!!

    var parentWidget = this.getParentWidget();

    // MessageLog.trace(parentWidget.toString());
    // MessageLog.trace( JSON.stringify(parentWidget.childrenRegion,true,'  '));

    var ui = this.ui = new QWidget( parentWidget );
    ui.setAttribute( Qt.WA_DeleteOnClose, true );
    ui.setWindowTitle( title ); 
    ui.setWindowFlags( Qt.Tool );
    ui.setMinimumSize( width, height );
    ui.setMaximumSize( width, height );
    ui.setFocus( true );
    ui.mouseTracking = true;

    ui.mainLayout = new QVBoxLayout( ui );
    //ui.mainLayout.setAlignment( ui, Qt.AlignTop );

    /*
    ui.opBox = new QGroupBox( "" );
    var opBoxLayout = ui.opBoxLayout = new QGridLayout( ui );   
    ui.opBox.setLayout( ui.opBoxLayout );
    ui.mainLayout.addWidget( ui.opBox, 0, 2 );
    */

    return ui;

}


//
pModal.prototype.show = function(){
  this.ui.show();
}


//
pModal.prototype.addGroup = function( title, parent, horizontalLayout, style ){
  var groupBox = new QGroupBox( title );
  // groupBox.setFlat(true);
  var groupBoxLayout = groupBox.mainLayout = horizontalLayout ? new QHBoxLayout( parent ) : new QVBoxLayout( parent );
  groupBox.setLayout( groupBoxLayout );   
  if( style) {
    groupBox.setStyleSheet( style );
  }
  parent.addWidget( groupBox, 0, 0 );
  return groupBox;
}


//
pModal.prototype.addButton = function( title, parent, width, height, icon, onReleased ){
  
  var btn = new QPushButton( title );

  btn.setMaximumSize( width, height );

  //
  if( icon ){
    btn.icon = new QIcon(icon);
    btn.setIconSize(new QSize(height,height));  
  }

  if( onReleased ){
    btn.released.connect( this, onReleased );
  }
  
  parent.addWidget( btn, 0, 0 );

  return btn;

}


//
pModal.prototype.addLineEdit = function( text, parent, width, height ){
  var line = new QLineEdit();
  line.text = text;
  line.setMaximumSize( width, height );
  parent.addWidget( line, 0, 0 );
  return line;
}


//
pModal.prototype.getParentWidget = function()
{
  var topWidgets = QApplication.topLevelWidgets();
  for( var i in topWidgets ){
    var widget = topWidgets[i];
    if( widget instanceof QMainWindow && !widget.parentWidget() )
      return widget;
  }
  return "";
};


///
exports = pModal;