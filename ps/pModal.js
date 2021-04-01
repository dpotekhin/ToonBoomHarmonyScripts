function pModal( title, width, height ){

  this.create(title, width, height);
	
}


//
pModal.prototype.create = function( title, width, height  ){

    // var imagePath = specialFolders.userScripts + "/script-icons";

    var ui = this.ui = new QWidget( this.getParentWidget() );  
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
  var listBox = new QGroupBox(title );
  var listLayout = listBox.mainLayout = horizontalLayout ? new QHBoxLayout( parent ) : new QVBoxLayout( parent );
  listBox.setLayout( listLayout );   
  if( style) {
    listBox.setStyleSheet( 'QGroupBox{'+style+'}' );
  }
  parent.addWidget( listBox, 0, 0 );
  return listBox;
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
  for( var i in topWidgets )
    if( topWidgets[i] instanceof QMainWindow && !topWidgets[i].parentWidget() )
      return topWidgets[i];
  return "";
};


///
exports = pModal;