/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_SetPropertiesOnManyNodes :]
[Version: 0.211025 :]

[Description:
The script allows to change the values of attributes of several nodes of the same type.
:]

[Usage:
Select one or more nodes of the same type and click on the script button.
Adjust the values of the desired attributes and click checkbox to the left to them.
If you want to get values from specific node - select it and click the "Source from Selected" button.
Click the "Apply to Selection" button to apply the values of the checked attributes to the selected buttons.
:]
*/

var _SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var _NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/NodeUtils.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var _ContextMenu = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/ContextMenu.js"));


function PS_SetPropertiesOnManyNodes(){
	
	//
  MessageLog.clearLog(); // !!!

  //
  var scriptName = 'Set Properties On Many Nodes';
  var scriptVer = '0.211025';
  //

  var Utils = _Utils;
  var SelectionUtils = _SelectionUtils;
  var NodeUtils = _NodeUtils;
  var ContextMenu = _ContextMenu;

  var btnHeight = 30;
  var listJustUpdated = true;
  var modalBorder = 10;
  var modalWidth = 560;
  var modalWidthNoBorder = modalWidth - modalBorder*2;
  var modalHeight = 600;
  var scrollableAreaHeight = 490;
  var tableColumns = 4;


  //
	var enumData = {
		
		APPLY_MATTE_TO_COLOR: [
			'Premultiplied with Black',
			'Straight',
			'Premultiplied with White',
			'Clamp Colour to Alpha',
		],

		ZOOM_INDEPENDENT_LINE_ART_THICKNESS:[
			"Scale Dependent",
			"Scale Independent",
			"Scale Independent (Legacy)"
		],

		USE_DRAWING_PIVOT:[
			"Don't Use Embedded Pivot",
			"Apply Embedded Pivot on Parent Peg",
			"Apply Embedded Pivot on Drawing Layer"
		],

	}


	//
	var attributeGroups = {

		pivot: [
			'PIVOT.X',
			'PIVOT.Y',
			'PIVOT.Z'
		],

		position: [
			'POSITION.SEPARATE',
			'POSITION.X',
			'POSITION.Y',
			'POSITION.Z',
			'OFFSET.SEPARATE',
			'OFFSET.X',
			'OFFSET.Y',
			'OFFSET.Z'
		],

		scale: [
			'SCALE.SEPARATE',
			'SCALE.X',
			'SCALE.Y',
			'SCALE.Z'
		],

		rotation: [
			'ROTATION.SEPARATE',
			'ROTATION.ANGLEX',
			'ROTATION.ANGLEY',
			'ROTATION.ANGLEZ',
			'SKEW'
		]

	};

	attributeGroups.transformation = attributeGroups.position.concat( attributeGroups.scale, attributeGroups.rotation );
	attributeGroups.allTransformation = attributeGroups.transformation.concat( attributeGroups.pivot );


  //
  var modal = new pModal( scriptName + " v" + scriptVer, modalWidth, modalHeight, false );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;



  // HEADER
  var mainGroup = modal.addGroup( '', ui, false );
	
	var titleWidget = modal.addLabel( '', mainGroup );
	titleWidget.text = 'Source Node: <i><b>n/a</b></i>';




	//// ATTRIBUTES
	var nodes = [];
	var nodesType;

	SelectionUtils.eachSelectedNode(function(_node,i){
		var nodeType = node.type(_node);
		if( nodesType && nodesType != nodeType ){
			MessageLog.trace('All nodes must be same type "'+nodesType+'". Node "'+_node+'" has "'+nodeType+'" type.');
			return;
		}
		if( !nodesType ) nodesType = nodeType;
		MessageLog.trace(_node+' > '+nodeType);
		nodes.push( _node );
	});
	
	if( !nodes.length ) {
		MessageLog.trace("There's no selected nodes.");
		return;
	}

	var attributes = [
		{
			// separator: true,
			isUsedToolTip: 'Toggle applying all attributes bellow to the selection',
			onIsUsedChange: function(v){
				// MessageLog.trace('onIsUsedChange: '+v);
				_setIsUsedCheckboxes( function(){ return v } );
			},
			
			useLinkToolTip: 'Toggle using connected columns instead of a values for all attributes below',
			onUseLinkChanged: function(v){
				// MessageLog.trace('onUseLinkChanged: '+v);
				attributes.forEach(function(attrData){
					var useLinkCheckbox = attrData.useLinkCheckbox;
					if( !useLinkCheckbox || !attrData.name ) return;
					useLinkCheckbox.setCheckState( v );
				});
			},

			isUsedDefault: false

		}
	];

	var attrs = Utils.getFullAttributeList( nodes[0], 1, true );
	attrs.forEach(function(attrName, i ){
		
		var attr = node.getAttr(  nodes[0], 1, attrName );
		var keyword = attr.keyword();
		var type = attr.typeName();
		var name = attr.name();
		MessageLog.trace(i+') '+keyword+', '+type+', '+attrName+' ('+name+')\n'+attr.textValue() );

		var attrData = {
			keyword: keyword,
			name: attrName,
			type: type,
			isUsedDefault: false,
			useLinkDefault: false,
		};

		// if( attributes.length === 1 ) attrData.separator = '-------';

		switch( type ){
			
			case 'BOOL':
				attributes.push(attrData);
				break;

			case 'DOUBLE':
			case 'DOUBLEVB':
				attrData.type = 'NUMBER';
				attributes.push(attrData);
				break;

			case 'GENERIC_ENUM':
				attrData.data = enumData[keyword];
				if( attrData.data ){
					attrData.type = 'DROPDOWN';
					attributes.push(attrData);
				}
				break;

		}

	});
	
	var attrsGroup = modal.addGroup( '', ui, 'grid', true );
	attrsGroup.setStyleSheet( 'padding: 3;' );

	_generateAttributes( attrsGroup, attributes );

	var scrollGroup = modal.addGroup( '', ui, 'grid', true );
	scrollGroup.resize( modalWidthNoBorder, scrollableAreaHeight );
	scrollGroup.setMinimumSize( modalWidthNoBorder, scrollableAreaHeight );

	var scrollArea = new QScrollArea( scrollGroup );
	// scrollArea.setBackgroundRole(QPalette.Dark);
	// scrollArea.setMinimumSize(modalWidthNoBorder,scrollableAreaHeight);
	scrollArea.resize(modalWidthNoBorder,scrollableAreaHeight);
	scrollArea.setWidget(attrsGroup);

	function _setIsUsedCheckboxesByAttrList( attrGroupName ){
		_setIsUsedCheckboxes(function(attrData){
    	// MessageLog.trace('-> '+attrData.name+' ->'+attributeGroups.transformation.indexOf(attrData.name));
    	return attributeGroups[attrGroupName].indexOf(attrData.name) !== -1;
		});
	}

	scrollGroup.contextMenuEvent = function( event ){
    try{

      ContextMenu.showContextMenu({

	      	'!Select Position': function(){ _setIsUsedCheckboxesByAttrList('position'); },
	      	'!Select Rotation': function(){ _setIsUsedCheckboxesByAttrList('rotation'); },
	      	'!Select Scale': function(){ _setIsUsedCheckboxesByAttrList('scale'); },
	      	'!Select Pivot': function(){ _setIsUsedCheckboxesByAttrList('pivot'); },

	        '!Select Transformation': function(){ _setIsUsedCheckboxesByAttrList('transformation'); },

	        '!Select Transformation and Pivot': function(){ _setIsUsedCheckboxesByAttrList('allTransformation'); },

        },
        event,
        scrollGroup
      );

    }catch(err){MessageLog.trace('Err:'+err)}

  }



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
	  	if( !selectedNode || node.type(selectedNode) !== nodesType ){
	  		MessageBox.warning("Please select node of \""+nodesType+"\" type to copy its attribute values.");
	  		return;
	  	}

	  	titleWidget.text = 'Source: <i><b>"'+selectedNode+'"</b></i>';

	  	attributes.forEach(function(attr){

	  		var _attr = node.getAttr( selectedNode, currentFrame, attr.name );
	  		var value;
	  		switch( attr.type ){
	  			
	  			case 'NUMBER':
	  				value = _attr.doubleValueAt(currentFrame);
	  				attr.inputWidget.text = value;
	  				break;

	  			case 'BOOL':
	  				value = _attr.boolValueAt(currentFrame);
	  				attr.inputWidget.setCheckState( value ? Qt.Checked : Qt.Unchecked );
	  				break;

	  			case 'DROPDOWN':
	  				value = _attr.textValueAt(currentFrame);
	  				MessageLog.trace('>>>'+value+') '+attr.data.indexOf(value)+' > '+_attr.intValue(currentFrame) );
	  				attr.inputWidget.setCurrentIndex( attr.data.indexOf(value) );
	  				break;

	  		}
	  		attr.value = attr;

	  		var linkedColumn = attr.linkedColumn = node.linkedColumn( selectedNode, attr.name );
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
					var _attr = node.getAttr( _node, currentFrame, attr.name );

					if( attr.linkedColumn && attr.useLinkCheckbox.checkState() === Qt.Checked ){ // Link attribute
						
						node.unlinkAttr( _node, attr.name );
						if( _attr ) _attr.setValue( attr.getValue() );
						node.linkAttr( _node, attr.name, attr.linkedColumn );

					}else{ // Copy value

						if( _attr ) {
							var _val = attr.getValue();
							MessageLog.trace('Set attr "'+_attr.name()+'" > "'+_val+'" > ');
							// _attr.setValueAt( _val, currentFrame );
							_attr.setValue( _val );
						}
					}

				});

			}, true, nodesType );

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
				  line.setMinimumSize(modalWidth-50,1);
				  line.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed);
				  line.setStyleSheet("background-color: #303030; border-top: 1px solid #ffffff; border-bottom: 1px solid #505050;");
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
		  	
		  	case 'NUMBER':
		  		inputField = new QLineEdit();
		  		inputField.setValidator( new QDoubleValidator(inputField) );
		  		attr.getValue = function(){ return parseFloat(inputField.text) || 0; };
		  		break;

		  	case 'BOOL':
		  		inputField = new QCheckBox();
		  		attr.getValue = function(){ return inputField.checkState() === Qt.Checked; };
		  		break;

		  	case 'DROPDOWN':
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

			if( (inputField && attr.type == 'NUMBER') || attr.onUseLinkChanged ){
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


	//
	function _setIsUsedCheckboxes( condition ){

		attributes.forEach(function(attrData){
			var isUsedCheckbox = attrData.isUsedCheckbox;
			if( !isUsedCheckbox || !attrData.name ) return;
			isUsedCheckbox.setCheckState( condition(attrData) ? Qt.Checked : Qt.Unchecked );
		});

	}


}