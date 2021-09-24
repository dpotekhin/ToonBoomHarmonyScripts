/*
Author: D.Potekhin (d@peppers-studio.ru)

[Name: PS_KeysToKeyExposures :]
[Version: 0.210924 :]

[Description:
This Script converts Node Attribute Animation to Drawing Node Exposure Keys.
:]

[Usage:
Select two nodes in Node View:
- The node from the attribute of which the animation data will be taken
- The Drawing Node in which the Exposure Keys will be generated
(Using a Drawing Node as animation source is not recommended)

If all goes well You'll see a modal with the fields described below:
- Drawing: the path to used Drawing Node
- Source: the path to used Animation Source Node
- Source Node Attribute Name: pick an animated attribute as an animation values source
- First Frame: The first frame from which Exposure Keys will be generated
- Last Frame: the last frame of creating Exposure Keys range
- Value Offset: the offset of animation source frame relative to the current frame to implement a Key Exposure delay
- Min Exposure: minimum Key Exposure duration in frames
- Key Exposures Mapping: here you need to specify which range of values the Exposure Keys correspond to. An example format will be generated the first time the script is applying to a Drawing Node.

Once configured, click the "Create Key Exposures" button. Voila!

The Key Exposures Mapping and other Script parameters related to a specific Drawing Node are stored in a Custom Attribute of that Node and will be used when the script is reapplied to that Drawing.
:]
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

///
function PS_KeysToKeyExposures(){
	
	// MessageLog.clearLog();

	var Utils = _Utils;
	var CUSTOM_ATTR_NAME = '_PS_KTKE_Settings';
	//
  	var scriptName = 'Keys To Key Exposures';
  	var scriptVer = '0.210924';

  	var drawingNode;
  	var valueSourceNode;
  	var selectedAttrName;
	var modalParams = {};

  	SelectionUtils.eachSelectedNode(function(_node){
  		if( !drawingNode && node.type(_node) === 'READ' ){
  			drawingNode = _node;
  		}else if( !valueSourceNode ){
  			valueSourceNode = _node;
  		}
  	})

   	MessageLog.trace('drawingNode: "'+drawingNode+'"');
   	MessageLog.trace('valueSourceNode: "'+valueSourceNode+'"');

   	if( !drawingNode || !valueSourceNode ){
  		MessageBox.warning('Please select one Drawing node and a node with an animated attribute.',0,0,0,'Error');
  		return;
  	}

   	// var valueSourceNodeAttrs = Utils.getAnimatableAttrs( valueSourceNode );
   	var valueSourceNodeAttrs = Utils.getLinkedAttributeNames( valueSourceNode );
   	if( !valueSourceNodeAttrs || !valueSourceNodeAttrs.length ){
   		MessageBox.warning('Node "'+valueSourceNode+'" has no animated attributes.',0,0,0,'Error');
   		return;	
   	}
   	var selectedAttrName = valueSourceNodeAttrs[0];

   	//
   	var modal = new pModal( scriptName + " v" + scriptVer, 315, 320, false );  
	if( !modal.ui ){return;}
	var ui = modal.ui;

	modal.addLabel( 'Drawing: '+drawingNode, ui );

	// Selected Node
	var nodeNameLabel = modal.addLabel( 'Source: '+valueSourceNode, ui);
	nodeNameLabel.setStyleSheet('font-weight:bold;');

	// Node keyable attributes
	var sourceAttrNameInput = modal.sourceAttrNameInput = new QComboBox(ui);
	sourceAttrNameInput.addItems( valueSourceNodeAttrs );
	ui.mainLayout.addWidget( sourceAttrNameInput, 0, 0 );
	sourceAttrNameInput["currentIndexChanged(int)"].connect( onAttrNameChanged );
	addModalParam( 'sourceAttrName', sourceAttrNameInput, function( v ){
		valueSourceNodeAttrs.forEach(function( attrName, i ){
			if( attrName === v ) sourceAttrNameInput.setCurrentIndex( i );
		});
	});

	//
	var valuesGroup = modal.addGroup('',ui,'grid',true);

	// 1st line
	addLabel( 'First Frame:', valuesGroup, 0, 0 );
	var firstFrameInput = addInput( valuesGroup, 1, 1, 0, true ); // frame.current()
	addModalParam( 'firstFrame', firstFrameInput, undefined, function(val){
		return validateFrame( Utils.getNumber(val) || 1 );
	});

	addLabel( 'Last Frame:', valuesGroup, 2, 0 );
	var lastFrameInput = addInput( valuesGroup, frame.numberOf(), 3, 0, true );
	addModalParam( 'lastFrame', lastFrameInput, undefined, function(val){
		return validateFrame( Utils.getNumber(val) || frame.numberOf() );
	});

	// 2d line
	addLabel( 'Value Offset (fr):', valuesGroup, 0, 1 );
	var frameOffsetInput = addInput( valuesGroup, -1, 1, 1, true );
	addModalParam( 'frameOffset', frameOffsetInput, undefined, true );

	addLabel( 'Min Exposures (fr):', valuesGroup, 2, 1 );
	var minExpouresInput = addInput( valuesGroup, 1, 3, 1, true );
	addModalParam( 'minExpoures', minExpouresInput, undefined, function( val ){
		return ~~Utils.getNumber( val ) || 1;
	});

	//
	var subsMappingInput = new QTextEdit();
	ui.mainLayout.addWidget( subsMappingInput, 0, 0 );
	subsMappingInput.focusOutEvent = function( e ){
	    //MessageLog.trace('input loose focus');
	    saveDrawingSettings( drawingNode );
	   	try{ QTextEdit.focusOutEvent(e); }catch(err){}
	}
	addModalParam( 'subsMapping', subsMappingInput, undefined, function(val){

		if( val ) return val;

		// Fill debug settings
	    var entries = [];
	    
		var elementId = node.getElementId(drawingNode);
		if( !elementId ) return '';

		var n = Drawing.numberOf( elementId );
		for( var i=0; i<n; i++ ) {
			entries.push( Drawing.name( elementId, i ) );
		}
		var entryStep = 1 / entries.length;
		entries = entries.map( function( entry, i ){
			return ( entryStep + entryStep * i ).toPrecision(2) +' : '+entry;
		});

		return [
	    	"#Entry Pattern:",
			"#<Maximum Source Value> : <Subs Name> [,<Alternate Subs Name>]",
			'',
			'# Start a line with "#" to ignore it.',
			'',
			"#Example Substitution mapping bellow:",
	    ].concat(entries).join('\n');

	});

	//
	applySavedModalParams(drawingNode);

	//
	var createButton = modal.addButton('Create Key Exposures', ui, undefined, undefined, undefined, function(){

		scene.beginUndoRedoAccum('Keys to Key Exposures');

		convertKeysToSubs();

		scene.endUndoRedoAccum();

	});

	ui.mainLayout.addStretch();
  	modal.show();

  	// - - - - - - - - - - - - -
  	//
  	function onAttrNameChanged( i ){
  		// try{ 
  		selectedAttrName = valueSourceNodeAttrs[i];
  		
  		var linkedColumnName = node.linkedColumn( valueSourceNode, selectedAttrName );
  		var columnName = linkedColumnName === "" ? valueSourceNode.split('/').pop()+"_SND-AMP" : linkedColumnName;

  		saveDrawingSettings();

  		// MessageLog.trace('onAttrNameChanged: '+i+', selectedAttrName:'+selectedAttrName+', linkedColumnName:'+linkedColumnName+', columnName:'+columnName );

  		// columnNameInput.text = columnName;
  		// }catch(err){MessageLog.trace('Error:'+err)}
  	}

  	///
  	function addLabel( txt, parent, gx, gy ){
  		var label = new QLabel();
    	parent.mainLayout.addWidget( label, gy, gx );
    	label.text = txt;
    	return label;
  	}

  	//
  	function addInput( valuesGroup, defaultValue, gx, gy, isNumberInput ){
		var _input = new QLineEdit();
		valuesGroup.mainLayout.addWidget( _input, gy, gx );
		if( defaultValue !== undefined ) _input.text = defaultValue;
		if( isNumberInput ) {
			_input.setFixedWidth(50);
			_input.setValidator( new QDoubleValidator(_input) );
		}
		return _input;
	}


	//
	function addModalParam( paramName, inputWidget, _setValue, _getValue ){

		var getValue;

		if( inputWidget instanceof QTextEdit ) {

			getValue = function(){ return inputWidget.plainText };
			setValue = function(v){ inputWidget.plainText = v };

		}else if( inputWidget instanceof QLineEdit ) {

			getValue = function(){ return inputWidget.text };
			setValue = function(v){ inputWidget.text = v };

		}else if( inputWidget instanceof QComboBox ) {

			getValue = function(){ return inputWidget.currentText };
			setValue = _setValue;

		}

		if( !getValue ){
			MessageLog.trace('addModalParam: not defined inputWidget for "'+paramName+'"');
			return;
		}

		if( _getValue === true ) _getValue = function( val ){
			return ~~Utils.getNumber( val );
		}

		var paramObject = {
			inputWidget: inputWidget,
			getValue: function (){
				var val = getValue();
				// MessageLog.trace('1 >>> '+paramName+' = '+val );
				if( _getValue ) {
					val = _getValue( val );
					paramObject.setValue( val );
					// MessageLog.trace('2 >>> '+paramName+' = '+val );
				}
				return val;
			},
			setValue: setValue || function(){ MessageLog.trace('No setter available for Settings param "'+paramName+'"') },
		};

		modalParams[paramName] = paramObject;

	}


	//
	function applySavedModalParams( drawingNode ) {
		
		if( !drawingNode ) return '';
		// if( node.getTextAttr( drawingNode, 1, 'UI_DATA').indexOf('DrawingSubstitutionSwitcher') === -1 ){

		var savedModalParams = node.getTextAttr( drawingNode, 1, CUSTOM_ATTR_NAME );
		if( !savedModalParams ) return;
		try{
			savedModalParams = JSON.parse( savedModalParams );
		}catch(err){ MessageLog.trace('applySavedModalParams: Error: '+err ); return; }

		// MessageLog.trace('applySavedModalParams: '+JSON.stringify( savedModalParams, true, '  ') );

		Object.keys( savedModalParams ).forEach(function( paramName ){
			var modalParamObject = modalParams[paramName];
			if( !modalParamObject ) return;
			modalParamObject.setValue( savedModalParams[paramName] );
		});

	}

	//
	function saveDrawingSettings( drawingNode ){

		try{
						
			var params = {};
			Object.keys(modalParams).forEach(function(paramName){
				var paramObject = modalParams[paramName];
				params[paramName] = paramObject.getValue();
			});
			
			// MessageLog.trace('====>'+JSON.stringify(params,true,'  '));

			var text = JSON.stringify(params);
			var attr = node.getAttr( drawingNode, 1, CUSTOM_ATTR_NAME );
			if( !attr.name() ) {
				var success = node.createDynamicAttr( drawingNode, "STRING", CUSTOM_ATTR_NAME, CUSTOM_ATTR_NAME, false );
				// MessageLog.trace('saveDrawingSettings: Custom attribute "'+CUSTOM_ATTR_NAME+'" in "'+drawingNode+'" '+( success ? 'created.' : 'failed.') );
			}
			node.setTextAttr( drawingNode, CUSTOM_ATTR_NAME, 1, text || '' );
			
			// MessageLog.trace('saveDrawingSettings: Settings saved:\n"'+text);

		}catch(err){MessageLog.trace('saveDrawingSettings: '+err)}

	}


	//
	function convertKeysToSubs() {
		
		try{
		// MessageLog.clearLog(); // !!!

		// Parse Drawing Substitution mapping data
		var drawingSubsList = subsMappingInput.plainText
			.split('\n')
			.map(function(line){
				line = line.trim();
				if( !line || line.charAt(0) === '#' ) return;
				line = line.split(':');
				var value = line[0].trim();
				var subsVariants = line[1].split(',');
				subsVariants = subsVariants.map(function(subsVariant){
					return subsVariant.trim();
				})
				if( !subsVariants.length ) return;
				return [ value, subsVariants ];
			})
			.filter(function(line){
				return line;
			})
			.sort(function(a,b){
				if(a[0] > b[0]) return 1;
			    if(a[0] < b[0]) return -1;
			    return 0;
			})
		;

		if( !drawingSubsList.length ){
			MessageLog.trace('Drawing Substitution mapping data required.');
			return;
		}
		// MessageLog.trace( 'drawingSubsList: '+JSON.stringify(drawingSubsList,true,'  '));

		var sceneFrames = frame.numberOf();
		
    	var frameOffset = modalParams['frameOffset'].getValue();
    	var minExpoures = modalParams['minExpoures'].getValue();
    	// MessageLog.trace('frameOffset:'+frameOffset+', minExpoures:'+minExpoures );

    	var _firstFrame = modalParams['firstFrame'].getValue();
    	var _lastFrame = modalParams['lastFrame'].getValue();
    	var firstFrame = Math.min( _firstFrame, _lastFrame );
    	var lastFrame = Math.max( _firstFrame, _lastFrame );

    	var valueSourceColumnId = node.linkedColumn( valueSourceNode, selectedAttrName );
    	// MessageLog.trace( 'valueSourceNode: "'+valueSourceNode+'", "'+selectedAttrName+'", "'+valueSourceColumnId+'"' );
    	if( !valueSourceColumnId ) return;

    	var drawingColumnId = node.linkedColumn(drawingNode,"DRAWING.ELEMENT");
    	if( !valueSourceColumnId ) return;
		// MessageLog.trace( 'drawingNode: "'+drawingNode+'", "'+drawingColumnId+'"');

    	var prevEntry;
    	var prevEntryDuration = 9999;

    	for( var _frame = firstFrame; _frame <= lastFrame; _frame++ ){

    		var valueFrame = _frame + frameOffset;
    		if( valueFrame < 1 || valueFrame > sceneFrames ) continue;

    		var currentValue = column.getEntry( valueSourceColumnId, 1, valueFrame );

			var drawingSubsListStepIndex = 0;
			drawingSubsList.every(function(_step,i){
				drawingSubsListStepIndex = i;
				if( _step[0] <= currentValue ) return true;
			});
			var drawingSubsListEntries = drawingSubsList[ drawingSubsListStepIndex ][1];

			// MessageLog.trace( '\n'+_frame+') '+currentValue+'; '+prevEntry+' > '+drawingSubsListStepIndex );
			// MessageLog.trace( 'frame: '+_frame+'; '+currentValue+'; '+prevEntry );

			column.setEntry( drawingColumnId, 1, _frame, null );

			if( drawingSubsListEntries.indexOf( prevEntry ) !== -1 || prevEntryDuration < minExpoures ) {
			    // MessageLog.trace('Same entry - skipped');
			    column.fillEmptyCels( drawingColumnId, _frame, _frame+1 );
			    prevEntryDuration++;
			    continue;
			}

			prevEntry = drawingSubsListEntries[ ~~(Math.random() * drawingSubsListEntries.length ) ];
			// MessageLog.trace('Set entry: '+ prevEntry );
			column.setEntry( drawingColumnId, 1, _frame, prevEntry );
			prevEntryDuration = 1;

    	}

    	}catch(err){MessageLog.trace('convertKeysToSubs: '+err)}

	}


	//
	function validateFrame( fr ) {
		return Math.min( frame.numberOf(), Math.max( 1, ~~fr ) );
	}


}