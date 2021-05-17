/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1

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
  var scriptVer = '0.1';
  //

  var Utils = _Utils;
  var SelectionUtils = _SelectionUtils;

  var btnHeight = 30;
  var listJustUpdated = true;
  var modalWidth = 400;
  var border = 20;

  var curentItemName;
  var curentItemindex;

  // var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/icons/");

  //
  var modal = new pModal( scriptName + " v" + scriptVer, modalWidth, 400, false );  
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
			type: 'bool'
		},
		// PENCIL_LINE_DEFORMATION_QUALITY				// <ENUM>
		// PENCIL_LINE_DEFORMATION_SMOOTH				// <INT>
		// PENCIL_LINE_DEFORMATION_FIT_ERROR			// <FLOAT>
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

	//MessageLog.trace( node.getAllAttrKeywords(selection.selectedNodes()[0]).join('\n') );
	// MessageLog.trace( node.getAllAttrNames(selection.selectedNodes()[0]).join('\n') );
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
					
					var _attr = node.getAttr( _node, currentFrame, attr.keyword );

					if( attr.linkedColumn && attr.useLinkCheckbox.checkState() === Qt.Checked ){ // Link attribute
						
						node.linkAttr( _node, attr.keyword, attr.linkedColumn );
						if( _attr ) _attr.setValue( attr.getValue() );

					}else{ // Copy value

						if( _attr ) _attr.setValueAt( attr.getValue(), currentFrame );

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
				// var line = new QWidget;
			 //  line.setMinimumSize(50,1);
			 //  line.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed);
			 //  line.setStyleSheet("background-color: #303030; border-top: 1px solid #ffffff; border-bottom: 1px solid #505050;");
			 //  groupWidget.mainLayout.addWidget(line,index,0,1,1);

			  var label = new QLabel();
		  	groupWidget.mainLayout.addWidget( label, index, 0, 1, 4, Qt.AlignCenter );
		  	label.text = '--------------------&nbsp;&nbsp;&nbsp;&nbsp; <i><b>'+attr.separator+'</b></i> &nbsp;&nbsp;&nbsp;&nbsp;--------------------';

			  // var line = new QWidget;
			  // line.setMinimumSize(50,1);
			  // line.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed);
			  // line.setStyleSheet("background-color: #303030; border-top: 1px solid #ffffff; border-bottom: 1px solid #505050;");
			  // groupWidget.mainLayout.addWidget(line,index,4,1,1);

			  index++;
			}

			//
			var isUsedCheckbox = attr.isUsedCheckbox = new QCheckBox();
			groupWidget.mainLayout.addWidget( isUsedCheckbox, index, 0 );
			isUsedCheckbox.setCheckState( Qt.Checked );
			isUsedCheckbox.toolTip = 'Check here to apply this attribute value to the selection';

			var label = new QLabel();
		  groupWidget.mainLayout.addWidget( label, index, 1 );
		  label.text = attr.name;

		  var inputField;

		  switch( attr.type ){
		  	
		  	case 'number':
		  		inputField = new QLineEdit();
		  		inputField.setValidator( new QDoubleValidator(inputField) );
		  		attr.getValue = function(){ return parseFloat(inputField.text) || 0 };
		  		break;

		  	case 'bool':
		  		inputField = new QCheckBox();
		  		attr.getValue = function(){ return inputField.checkState() === Qt.Checked; };
		  		break;
		  }
		  
		  if( inputField ){

				groupWidget.mainLayout.addWidget( inputField, index, 2 );

				attr.inputWidget = inputField;

				//
				if( attr.type == 'number' ){
					var useLinkCheckbox = attr.useLinkCheckbox = new QCheckBox();
					groupWidget.mainLayout.addWidget( useLinkCheckbox, index, 3 );
					useLinkCheckbox.setCheckState( Qt.Checked );
					useLinkCheckbox.toolTip = 'Check here to use link instead of value';
				}

			}

			index++;

		});

	}


}