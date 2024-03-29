/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.220810

ToDo:
- 
*/
var _SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));

function PS_DrawingAttributesModal(){
	
	//
  MessageLog.clearLog();

  //
  var scriptName = 'Drawing Attributes';
  var scriptVer = '0.220810';
  //

  var Utils = _Utils;
  var SelectionUtils = _SelectionUtils;

  var btnHeight = 30;
  var listJustUpdated = true;
  var modalWidth = 400;
  var modalHeight = 600;
  var border = 20;
  var tableColumns = 4;

  var curentItemName;
  var curentItemindex;

  // var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/icons/");

  //
  var modal = new pModal( scriptName + " v" + scriptVer, modalWidth, modalHeight, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;

  var mainGroup = modal.addGroup( '', ui, false );
	
	var titleWidget = modal.addLabel( '', mainGroup );
	titleWidget.text = 'Source Drawing: <i><b>n/a</b></i>';

	//// ATTRIBUTES
  var attrsGroup = modal.addGroup( 'Drawing Attributes', ui, 'grid' );

	var attributes = [
		{
			// separator: true,
			isUsedToolTip: 'aa',//Toggle applying all attributes bellow to the selection',
			onIsUsedChange: function(v){
				// MessageLog.trace('onIsUsedChange: '+v);
				attributes.forEach(function(attrData){
					var isUsedCheckbox = attrData.isUsedCheckbox;
					if( !isUsedCheckbox || !attrData.name ) return;
					isUsedCheckbox.setCheckState( v ? Qt.Checked : Qt.Unchecked );
				});
			},
			
			useLinkToolTip: 'Toggle using connected columns instead of a values for all attributes below',
			onUseLinkChanged: function(v){
				// MessageLog.trace('onUseLinkChanged: '+v);
				attributes.forEach(function(attrData){
					var useLinkCheckbox = attrData.useLinkCheckbox;
					if( !useLinkCheckbox || !attrData.name ) return;
					useLinkCheckbox.setCheckState( v ? Qt.Checked : Qt.Unchecked );
				});
			}

		},
		// ADJUST_PENCIL_THICKNESS						// <BOOL>
		{
			separator: 'Line Thickness',
			keyword: 'ADJUST_PENCIL_THICKNESS',
			name: 'Adjust Pencil Lines Thickness',
			type: 'bool'
		},
		// NORMAL_LINE_ART_THICKNESS					// <BOOL>
		{
			keyword: 'NORMAL_LINE_ART_THICKNESS',
			name: 'Normal Thickness',
			type: 'bool'
		},
		// ZOOM_INDEPENDENT_LINE_ART_THICKNESS			// <BOOL>
		{
			keyword: 'ZOOM_INDEPENDENT_LINE_ART_THICKNESS',
			name: 'Zoom Independent Thickness',
			type: 'bool'
		},
		// MULT_LINE_ART_THICKNESS						// <FLOAT> Proportional ?
		{
			keyword: 'MULT_LINE_ART_THICKNESS',
			name: 'Proportional',
			type: 'number'
		},
		// ADD_LINE_ART_THICKNESS						// <FLOAT> Constant
		{
			keyword: 'ADD_LINE_ART_THICKNESS',
			name: 'Constant',
			type: 'number'
		},
		// MIN_LINE_ART_THICKNESS						// <FLOAT>
		{
			keyword: 'MIN_LINE_ART_THICKNESS',
			name: 'Minimum',
			type: 'number'
		},
		// MAX_LINE_ART_THICKNESS						// <FLOAT>
		{
			keyword: 'MAX_LINE_ART_THICKNESS',
			name: 'Maximum',
			type: 'number'
		},
		
		// - - - - - Deformation - - - - -
		// PENCIL_LINE_DEFORMATION_PRESERVE_THICKNESS	// <BOOL>
		{
			separator: 'Deformation',
			keyword: 'PENCIL_LINE_DEFORMATION_PRESERVE_THICKNESS',
			name: 'Preserve Line Thickness',
			type: 'bool',
			isUsedDefault: false
		},
		// PENCIL_LINE_DEFORMATION_QUALITY				// <ENUM>
		// PENCIL_LINE_DEFORMATION_SMOOTH				// <INT>
		{
			keyword: 'PENCIL_LINE_DEFORMATION_SMOOTH',
			name: 'Pencil Lines Smoothing',
			type: 'number',
			isUsedDefault: false
		},
		// PENCIL_LINE_DEFORMATION_FIT_ERROR			// <FLOAT>
		{
			keyword: 'PENCIL_LINE_DEFORMATION_FIT_ERROR',
			name: 'Fit Error',
			type: 'number',
			isUsedDefault: false
		},

		// - - - - - Bitmap File Options - - - - -
		// READ_TRANSPARENCY			// <FLOAT>
		{
			separator: 'Bitmap File Options',
			keyword: 'READ_TRANSPARENCY',
			name: 'Transparency',
			type: 'bool',
			isUsedDefault: false
		},
		// APPLY_MATTE_TO_COLOR
		{
			keyword: 'APPLY_MATTE_TO_COLOR',
			name: 'Transparency Type',
			type: 'dropdown',
			data: [
				'Premultiplied with Black',
				'Straight',
				'Premultiplied with White',
				'Clamp Colour to Alpha',
			],
			isUsedDefault: false
		},

		// - - - - - Advanced - - - - -
		// OPACITY			// <FLOAT>
		{
			separator: 'Advanced',
			keyword: 'OPACITY',
			name: 'Opacity',
			type: 'number',
			isUsedDefault: false
		},
	];
	_generateAttributes( attrsGroup, attributes );

	/// BUTTONS
  var buttonsGroup = modal.addGroup( '', ui, true, true ); // 'QGroupBox{border: none; padding: 0; margin: 0;}' );


	// 
  modal.addButton('Source from Selected', buttonsGroup, 120, btnHeight, undefined, _copyFromSelected );

  // 
  modal.addButton('Apply to Selection', buttonsGroup, 120, btnHeight, undefined, _applyToSelection );

	///
  ui.mainLayout.addStretch();

  modal.show();

  // Debug the selected node attributes
  var __node = selection.selectedNodes()[0];
  if( __node ){
	  node.getAllAttrKeywords(__node).forEach(function(attrName){
	  	var _attr = node.getAttr( __node, frame.current(), attrName );
		  MessageLog.trace('> '+attrName+' ('+_attr.typeName()+'): '+_attr.textValueAt(frame.current()) );
	  });
	}
  ////
  
  function _copyFromSelected(){
  	
  	var currentFrame = frame.current();

		scene.beginUndoRedoAccum("");

  	try{
	  	
	  	var selectedNode = selection.selectedNodes()[0];
	  	if( !selectedNode || node.type(selectedNode) !== 'READ' ){
	  		MessageBox.warning("Please select one Drawing to copy its attribute values");
	  		return;
	  	}

	  	titleWidget.text = 'Source Drawing: <i><b>"'+selectedNode+'"</b></i>';

	  	attributes.forEach(function(attr){

	  		var _attr = node.getAttr( selectedNode, currentFrame, attr.keyword );
	  		var value;
	  		switch( attr.type ){
	  			
	  			case 'number':
	  				value = _attr.doubleValueAt(currentFrame);
	  				attr.inputWidget.text = value;
	  				break;

	  			case 'bool':
	  				value = _attr.boolValueAt(currentFrame);
	  				attr.inputWidget.setCheckState( value ? Qt.Checked : Qt.Unchecked );
	  				break;

	  			case 'dropdown':
	  				value = _attr.textValueAt(currentFrame);
	  				MessageLog.trace('>>>'+value+') '+attr.data.indexOf(value)+' > '+_attr.intValue(currentFrame) );
	  				attr.inputWidget.setCurrentIndex( attr.data.indexOf(value) );
	  				break;

	  		}
	  		attr.value = attr;

	  		var linkedColumn = attr.linkedColumn = node.linkedColumn( selectedNode, attr.keyword );
	  		// MessageLog.trace( attr.keyword+' = '+value+' ('+linkedColumn+')' );

	  	});

  	}catch(err){
  		MessageLog.trace( 'Error: '+err );
  	}

  	scene.endUndoRedoAccum();

  }


	//
  function _applyToSelection(){
  	
  	var currentFrame = frame.current();

  	var activeAttributes = attributes.filter(function(attr){
  		return attr.isUsedCheckbox && attr.isUsedCheckbox.checkState() === Qt.Checked;
  	});
  	// MessageLog.trace( activeAttributes.length+' : '+attributes.length );

  	scene.beginUndoRedoAccum("");

  	try{

	  	var result = SelectionUtils.eachSelectedNode( function( _node ){
			
				var nodeName = node.getName(_node);
				// if( nodeName == 'REF' ) return; // !!!
				// MessageLog.trace('>> "'+ _node +'", "'+nodeName );
				activeAttributes.forEach(function(attr){
					
					if( !attr.getValue ) return;
					var _attr = node.getAttr( _node, currentFrame, attr.keyword );

					if( attr.linkedColumn && attr.useLinkCheckbox.checkState() === Qt.Checked ){ // Link attribute
						
						node.unlinkAttr( _node, attr.keyword );
						if( _attr ) _attr.setValue( attr.getValue() );
						node.linkAttr( _node, attr.keyword, attr.linkedColumn );

					}else{ // Copy value

						if( _attr ) {
							var _val = attr.getValue();
							MessageLog.trace('Set attr "'+_attr.name()+'" > "'+_val+'" > ');
							// _attr.setValueAt( _val, currentFrame );
							_attr.setValue( _val );
						}
					}

				});

			}, true, 'READ' );

		}catch(err){
  		MessageLog.trace( 'Error: '+err );
  	}

  	scene.endUndoRedoAccum();

  }


  ////
  function _generateAttributes( groupWidget, attrs ){
		
		var index = 0;
		
		attrs.forEach(function( attr ){
			
			//
			if( attr.separator ){

				if( attr.separator === true ){

					var line = new QWidget;
				  // line.setMinimumSize(modalWidth-50,1);
				  // line.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed);
				  // line.setStyleSheet("background-color: #303030; border-top: 1px solid #ffffff; border-bottom: 1px solid #505050;");
				  groupWidget.mainLayout.addWidget( line, index, 0, 1, tableColumns, Qt.AlignCenter);

			 	}else{

				  var label = new QLabel();
			  	groupWidget.mainLayout.addWidget( label, index, 0, 1, tableColumns, Qt.AlignCenter );
			  	label.text = '--------------------&nbsp;&nbsp;&nbsp;&nbsp; <i><b>'+attr.separator+'</b></i> &nbsp;&nbsp;&nbsp;&nbsp;--------------------';

				}

			  index++;

			}

			// Is Used Checkbox
			var isUsedCheckbox = attr.isUsedCheckbox = new QCheckBox();
			groupWidget.mainLayout.addWidget( isUsedCheckbox, index, 0 );
			isUsedCheckbox.toolTip = attr.isUsedToolTip || 'Check here to apply this attribute value to the selection';

			if( attr.isUsedDefault !== undefined ) isUsedCheckbox.setCheckState( attr.isUsedDefault ? Qt.Checked : Qt.Unchecked );
			else isUsedCheckbox.setCheckState( Qt.Checked );

			if( attr.onIsUsedChange ){
				isUsedCheckbox.stateChanged.connect( isUsedCheckbox, attr.onIsUsedChange );
			}


			// Attribute Label
			if( attr.name ){
				var label = new QLabel();
			  groupWidget.mainLayout.addWidget( label, index, 1 );
			  label.text = attr.name;
			}
		  
		  // Attribute input field
		  var inputField;

		  switch( attr.type ){
		  	
		  	case 'number':
		  		inputField = new QLineEdit();
		  		inputField.setValidator( new QDoubleValidator(inputField) );
		  		attr.getValue = function(){ return parseFloat(inputField.text) || 0; };
		  		break;

		  	case 'bool':
		  		inputField = new QCheckBox();
		  		attr.getValue = function(){ return inputField.checkState() === Qt.Checked; };
		  		break;

		  	case 'dropdown':
		  		inputField = new QComboBox();
		  		inputField.addItems(attr.data);
		  		attr.getValue = function(){
		  			// return inputField.currentText || '';
		  			return inputField.currentIndex || 0; // For GENERIC_ENUM
		  		};
		  		break;

		  }
		  
		  if( inputField ){

				groupWidget.mainLayout.addWidget( inputField, index, 2 );

				attr.inputWidget = inputField;

			}

			if( (inputField && attr.type == 'number') || attr.onUseLinkChanged ){
					var useLinkCheckbox = attr.useLinkCheckbox = new QCheckBox();
					groupWidget.mainLayout.addWidget( useLinkCheckbox, index, 3 );
					useLinkCheckbox.setCheckState( Qt.Checked );
					useLinkCheckbox.toolTip = attr.useLinkToolTip || 'Check here to use link instead of value';

					if( attr.onUseLinkChanged ){
						useLinkCheckbox.attrData = attr;
						useLinkCheckbox.stateChanged.connect( isUsedCheckbox, attr.onUseLinkChanged );
					}

			}

			index++;

		});

	}


}