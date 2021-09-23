/*
Author: D.Potekhin (d@peppers-studio.ru)

Version: 0.210923
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));
// var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/NodeUtils.js"));

///
function PS_KeysToDrawingSubstitutions(){
	
	// MessageLog.clearLog();

	var Utils = _Utils;
	var CUSTOM_ATTR_NAME = '_PS_KTDS_Settings';

	//
  	var scriptName = 'Keys To Drawing Substitutions';
  	var scriptVer = '0.210923';

  	var drawingNode;
  	var valueSourceNode;
  	var selectedAttrName;

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
   	var modal = new pModal( scriptName + " v" + scriptVer, 280, 320, false );  
	if( !modal.ui ){return;}
	var ui = modal.ui;

	modal.addLabel( 'Drawing: '+drawingNode, ui );

	// Selected Node
	var nodeNameLabel = modal.addLabel( 'Source: '+valueSourceNode, ui);
	nodeNameLabel.setStyleSheet('font-weight:bold;');

	// Node keyable attributes
	var listWidget = modal.listWidget = new QComboBox(ui);
	listWidget.addItems( valueSourceNodeAttrs );
	ui.mainLayout.addWidget( listWidget, 0, 0 );

	//
	listWidget["currentIndexChanged(int)"].connect( function(i){
		// MessageLog.trace('-->'+i);
		onAttrNameChanged( i );
	});

	//
	var valuesGroup = modal.addGroup('',ui,'grid',true);

	addLabel( 'First Frame:', valuesGroup, 0, 0 );
	var firstFrameInput = addInput( valuesGroup, 1, 1, 0, true ); // frame.current()

	addLabel( 'Last Frame:', valuesGroup, 2, 0 );
	var lastFrameInput = addInput( valuesGroup, frame.numberOf(), 3, 0, true );

	//
	var subsMappingInput = new QTextEdit();
	ui.mainLayout.addWidget( subsMappingInput, 0, 0 );
	subsMappingInput.plainText = getDrawingSubsList(drawingNode);
	subsMappingInput.focusOutEvent = function( e ){
	    //MessageLog.trace('input loose focus');
	    saveDrawingSubsList( drawingNode );
	   	QTextEdit.focusOutEvent(e);
	}

	//
	var createButton = modal.addButton('Convert Keys to Substitutions', ui, undefined, undefined, undefined, function(){

		scene.beginUndoRedoAccum('Convert Keys to Substitutions');

		//
		convertKeysToSubs();

		//
		scene.endUndoRedoAccum();

	});

	ui.mainLayout.addStretch();
  	modal.show();

  	//
  	//
  	function onAttrNameChanged( i ){
  		// try{ 
  		selectedAttrName = valueSourceNodeAttrs[i];
  		
  		var linkedColumnName = node.linkedColumn( valueSourceNode, selectedAttrName );
  		var columnName = linkedColumnName === "" ? valueSourceNode.split('/').pop()+"_SND-AMP" : linkedColumnName;

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
	function validateFrame( fr ) {
		return Math.min( frame.numberOf(), Math.max( 1, ~~fr ) );
	}

	//
	function getDrawingSubsList( drawingNode ) {
		
		if( !drawingNode ) return '';
		// if( node.getTextAttr( drawingNode, 1, 'UI_DATA').indexOf('DrawingSubstitutionSwitcher') === -1 ){

		var settings = node.getTextAttr( drawingNode, 1, CUSTOM_ATTR_NAME );
		// MessageLog.trace('getDrawingSubsList: '+settings );
		if( settings ) return settings;

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

	}

	//
	function saveDrawingSubsList( drawingNode ){

		try{
			var text = subsMappingInput.plainText;
			var attr = node.getAttr( drawingNode, 1, CUSTOM_ATTR_NAME );
			if( !attr.name() ) {
				var success = node.createDynamicAttr( drawingNode, "STRING", CUSTOM_ATTR_NAME, CUSTOM_ATTR_NAME, false );
				// MessageLog.trace('saveDrawingSubsList: Custom attribute "'+CUSTOM_ATTR_NAME+'" in "'+drawingNode+'" '+( success ? 'created.' : 'failed.') );
			}
			node.setTextAttr( drawingNode, CUSTOM_ATTR_NAME, 1, text || '' );
			// MessageLog.trace('saveDrawingSubsList: Settings saved:\n"'+text);

		}catch(err){MessageLog.trace('saveDrawingSubsList: '+err)}

	}


	//
	function convertKeysToSubs() {
		
		try{
		// MessageLog.clearLog(); // !!!

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
		// MessageLog.trace( 'drawingSubsList: '+JSON.stringify(drawingSubsList,true,'  '));

		var _firstFrame = validateFrame( Utils.getNumber(firstFrameInput.text) || 1 );    	
    	var _lastFrame = validateFrame( Utils.getNumber(lastFrameInput.text) || frame.numberOf() );
    	var firstFrame = Math.max( Math.min( _firstFrame, _lastFrame ), 1 );
    	var lastFrame = Math.min( Math.max( _firstFrame, _lastFrame ), frame.numberOf() );
    	firstFrameInput.setText( firstFrame );
    	lastFrameInput.setText( lastFrame );

    	var valueSourceColumnId = node.linkedColumn( valueSourceNode, selectedAttrName );
    	// MessageLog.trace( 'valueSourceNode: "'+valueSourceNode+'", "'+selectedAttrName+'", "'+valueSourceColumnId+'"' );
    	if( !valueSourceColumnId ) return;

    	var drawingColumnId = node.linkedColumn(drawingNode,"DRAWING.ELEMENT");
    	if( !valueSourceColumnId ) return;
		// MessageLog.trace( 'drawingNode: "'+drawingNode+'", "'+drawingColumnId+'"');

    	var prevEntry;

    	for( var _frame = firstFrame; _frame <= lastFrame; _frame++ ){

    		var currentValue = column.getEntry( valueSourceColumnId, 1, _frame );

			var drawingSubsListStepIndex = 0;
			drawingSubsList.every(function(_step,i){
				drawingSubsListStepIndex = i;
				if( _step[0] <= currentValue ) return true;
			});
			var drawingSubsListEntries = drawingSubsList[ drawingSubsListStepIndex ][1];

			// MessageLog.trace( '\n'+_frame+') '+currentValue+'; '+prevEntry+' > '+drawingSubsListStepIndex );
			MessageLog.trace( 'frame: '+_frame+'; '+currentValue+'; '+prevEntry );

			column.setEntry( drawingColumnId, 1, _frame, null );

			if( drawingSubsListEntries.indexOf( prevEntry ) !== -1 ) {
			    MessageLog.trace('Same entry - skipped');
			    column.fillEmptyCels( drawingColumnId, _frame, _frame+1 );
			    continue;
			}

			prevEntry = drawingSubsListEntries[ ~~(Math.random() * drawingSubsListEntries.length ) ];
			MessageLog.trace('Set entry: '+ prevEntry );
			column.setEntry( drawingColumnId, 1, _frame, prevEntry );

    	}

    	}catch(err){MessageLog.trace('convertKeysToSubs: '+err)}

	}


}