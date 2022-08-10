/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220713
*/

function pModal( title, width, height, unique ){

  this.create(title, width, height, unique);
  
}


//
pModal.prototype.create = function( title, width, height, unique ){

    var _this = this;

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
    // ui.setStyleSheet( 'QWidget{ position: absolute; margin: 0; padding: 0; }' );

    ui.mainLayout = new QVBoxLayout( ui );
    ui.setFocusOnMainWindow = function(){
      _this.setFocusOnMainWindow();
    }
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
pModal.prototype.addGroup = function( title, parent, layoutType, style ){
  var groupBox = new QGroupBox( title );
  // groupBox.flat = true;
  var groupBoxLayout;

  switch( layoutType ){
    
    // Horizontal
    case 1:
    case true:
    case 'horizontal':
      layoutType = 'horizontal';
      groupBoxLayout = new QHBoxLayout( parent );
      break;

    case 2:
    case 'grid':
      layoutType = 'grid';
      groupBoxLayout = new QGridLayout( parent );
      break;

    default:
      layoutType = 'vertical';
      groupBoxLayout = new QVBoxLayout( parent );
  }

  groupBox.mainLayout = groupBoxLayout;

  groupBox.setLayout( groupBoxLayout ); 

  if( style ) {
    if( style === true ){
      this.removeElementMargins( groupBox );
    }else{
      groupBox.setStyleSheet( style );
    }
  }else{
    if( layoutType !== 'grid' ) this.setDefaulElementMargins( groupBox );
  }

  if( parent ) parent.mainLayout.addWidget( groupBox, 0, 0 );

  return groupBox;
}


//
pModal.prototype.addNumberInput = function( labelText, parent, width, height, defaultValue, onChange, onReturnPressed ){

  if( labelText ){
    var label = new QLabel();
    if( parent ) parent.mainLayout.addWidget( label, 0, 0 );
    label.text = labelText;
  }

  var _input = new QLineEdit();
  if( parent ) parent.mainLayout.addWidget( _input, 0, 0 );
  _input.setFixedSize( width, height );
  _input.text = defaultValue || 0;
  _input.setValidator( new QDoubleValidator(_input) );
  _input.label = label;

  var valueIsJustSetted = false;

  if( onChange ){
    _input.textChanged.connect( _input, function(v){
      if( valueIsJustSetted ){
        valueIsJustSetted = false;
        return;
      }
      onChange(Number(v));
    });
  }

  if( onReturnPressed ){
    _input.returnPressed.connect( _input, onReturnPressed );
  }

  Object.defineProperty(_input, 'text2', {
    get: function () {
        return _input.text;
    },
    set: function (v) {
      valueIsJustSetted = true;
      _input.text = v;
    }
  });

  return _input;

}


//
pModal.prototype.addCheckBox = function( labelText, parent, defaultValue, onChange ){
  //
  var checkBox = new QCheckBox();
  checkBox.setChecked( defaultValue );
  parent.mainLayout.addWidget( checkBox, 0, 0 );
  if( onChange ) checkBox.stateChanged.connect( checkBox, onChange );

  if( labelText ){
    var _label = new QLabel();
    parent.mainLayout.addWidget( _label, 0, 0 );
    _label.text = labelText;
    checkBox.label = _label;
  }

  return checkBox;

}


//
pModal.prototype.addButton = function( title, parent, width, height, icon, onReleased, toolTip ){
  
  var btn = new QPushButton( title );

  if( width ){
    btn.setFixedSize( width, height );
  }
/*
  else{
    btn.setMaximumSize( width, height );
  }
*/
  if( toolTip ) btn.toolTip = toolTip;

  //
  if( icon ){
    btn.icon = new QIcon(icon);
    btn.setIconSize(new QSize(height,height));  
  }

  if( onReleased ){
    btn.released.connect( this, onReleased );
  }
  
  parent.mainLayout.addWidget( btn, 0, 0 );

  return btn;

}



//
pModal.prototype.addLineEdit = function( text, parent, width, height, onChanged, onEdited ){
  var line = new QLineEdit();
  line.text = text;
  if(width){
    line.setMaximumSize( width, height );
  }
  parent.mainLayout.addWidget( line, 0, 0 );
  if( onChanged ) line.textChanged.connect( line, onChanged );
  if( onEdited ) line.editingFinished.connect( line, onEdited );
  return line;
}


//
pModal.prototype.addLabel = function( text, parent, width, height, align, removeElementMargins ){
  var label = new QLabel();
  label.setText( text );
  if(width){
    label.setMinimumSize(width,12);
    label.setMaximumSize(width,height);
  }else{
    label.minimumHeight = 12;
  }
  // if( width ) label.setFixedWidth( width );
  // if( height ) label.setFixedWidth( height );
  if( align ) label.alignment = align;
  parent.mainLayout.addWidget( label, 0, 0 );
  if( removeElementMargins ) this.removeElementMargins(label);
  return label;
}


//
pModal.prototype.addVLine = function( height, parent ){
  var line = new QWidget;
  line.setMinimumSize(2,height);
  line.setMaximumSize(2,height);
  line.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed);
  line.setStyleSheet("background-color: #303030; border-left: 1px solid #303030; border-right: 1px solid #505050;");
  parent.mainLayout.addWidget(line,0,0);
}


//
pModal.prototype.addHLine = function( width, parent ){
  var line = new QWidget;
  line.setMinimumSize(width,1);
  line.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed);
  line.setStyleSheet("background-color: #303030; border-top: 1px solid #303030; border-bottom: 1px solid #505050;");
  parent.mainLayout.addWidget(line,0,0);
}


//
pModal.prototype.addDropdown = function( parent, items, onIndexChanged ){
  var dropdown = new QComboBox();
  var _items = items;
  var itemsDataIsObject = false;
  if( _items ) {
    if( typeof _items[0] !== 'string'){
      itemsDataIsObject = true;
      _items = items.map(function(v){ return v.title; });
    }
    dropdown.addItems(_items);
  }
  if( parent ) parent.mainLayout.addWidget( dropdown, 0, 0 );
  if( onIndexChanged ) dropdown["currentIndexChanged(int)"].connect(function(i){
    if( _items ){
      if( itemsDataIsObject ){
        onIndexChanged( items[i].value );
      }else onIndexChanged( _items[i] );
    }
  });
  // dropdown.setCurrentIndex( 1 );
  // dropdown.currentIndex
  return dropdown;
}


//
pModal.prototype.getParentWidget = function(){

  var topWidgets = QApplication.topLevelWidgets();

  for( var i in topWidgets ){
    var widget = topWidgets[i];
    if( widget instanceof QMainWindow && !widget.parentWidget() )
      return widget;
  }

  return "";

};

//
function parseStyleAttributes(str){
  var attrs = {};
  str.split(';').forEach(function(v){
    if( !v ) return;
    var attrData = v.split(':');
    attrs[attrData[0].trim()] = attrData[1].trim();
  });
  return attrs;
}

pModal.prototype.changeStyleSheet = function( element, newStyle ){
  var oldStyle = element.styleSheet;
  if( !oldStyle ) {
    element.setStyleSheet(newStyle);
    return;
  }
  var style = oldStyle;
  var elementStyleClear = style.match(/[{?]([^}]+)}/gi);
  if( elementStyleClear ){
    elementStyleClear = elementStyleClear[0].replace(/{|}/gi,'');
    //console.log(elementStyleClear);
    style = elementStyleClear;
  }
  var oldStyleAttrs = parseStyleAttributes(style);
  var newStyleAttrs = parseStyleAttributes(newStyle);
  Object.keys(newStyleAttrs).forEach(function(attrName){
    if( newStyleAttrs[attrName] === '--' ) delete oldStyleAttrs[attrName];
    else oldStyleAttrs[attrName] = newStyleAttrs[attrName];
  });
  style = Object.keys(oldStyleAttrs).map(function(attrName){ return attrName+': '+oldStyleAttrs[attrName]; }).join('; ');
  element.setStyleSheet( elementStyleClear ? oldStyle.replace(elementStyleClear, style) : style );
}


//
pModal.prototype.removeElementMargins = function( group ){
  // group.setStyleSheet('QGroupBox{ border:none; padding: 0; }');
  // group.setStyleSheet('border-width:0; padding: 0; margin: 0;');
  group.setStyleSheet('border-width:0; padding: 0; margin: 0;');
  ( group.mainLayout || group ).setContentsMargins(4,2,4,0);
}

pModal.prototype.setDefaulElementMargins = function( group ){
  group.setStyleSheet('border-width:1; padding: 4 2; margin: 4 0 0 0;');
  ( group.mainLayout || group ).setContentsMargins(2,4,2,2);
  // ( group.mainLayout || group ).setContentsMargins(10,10,10,10);
}

//
pModal.prototype.setFocusOnMainWindow = function(){

  var mainWindow = this.getParentWidget();
  mainWindow.activateWindow();

  /* // Try to get a particular Tab
  mainWindow.children().forEach(function(w,i){
    MessageLog.trace(i+') '+w.windowTitle+'; '+w.windowType );
  });
  */

};



///
exports = pModal;