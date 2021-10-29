/*
Author: D.Potekhin (d@peppers-studio.ru)

[Name: PS_SoundAmplitudeToKeyframes :]
[Version: 0.210922 :]

[Description:
This script quickly sets the Scene duration to the selected Sound layer duration.
:]

[Usage:
Select one sound layer as the source of wave form amplitude and one layer in which to generate keyframes and then click on the script.  
If no Sound layer is selected - the script finds the first one.

In the window that appears you can:
* select an attribute to generate keyframes in it
* enter the name of an existing or new animation column for the attribute above
* set a keyframe generation frame range
* set the minimum and maximum values of created keyframes
:]

TODO:
- 
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var _SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

//
function PS_SoundAmplitudeToKeyframes(){

	// MessageLog.clearLog();

	var Utils = _Utils;
	var SelectionUtils = _SelectionUtils;

	//
  	var scriptName = 'Sound Amplitude To Keyframes';
  	var scriptVer = '0.210922';

  	//
	var selectedLayers = SelectionUtils.getSelectedLayers( true );
	var selectedNode;
	var selectedSoundColumnName;

	// MessageLog.trace('PS_SoundAmplitudeToKeyframes: Selected Layers:'+JSON.stringify(selectedLayers,true,' ') );

	if( selectedLayers.length ){

		var firstNode = selectedLayers[0];

	    if( selectedLayers.length === 1 ){ // if only one layer is selected

	        if( firstNode.layerType === 'node' ) {
	        	
	        	selectedNode = firstNode.node;

	        	selectedSoundColumnName = Utils.getSoundColumns(1).pop(); // Get First Sound layer

	        }

	    }else{


			selectedLayers.forEach(function( layerData ){
				
				// MessageLog.trace(i+') '+Timeline.selIsNode(i)+', '+Timeline.selToNode(i)+', '+Timeline.selIsColumn(i) );

				if ( layerData.layerType === 'node' && !selectedNode ){
					
					selectedNode = layerData.node;
				
				}

				if ( layerData.layerType === 'column' && layerData.columnType === 'SOUND' && !selectedSoundColumnName ){
					
					selectedSoundColumnName = layerData.column;

				}

			});

		}

	}else{

		MessageLog.trace('No layer Selected. Get a selected node in Node View.');
		selectedNode = selection.selectedNode(0);
		selectedSoundColumnName = Utils.getSoundColumns(1).pop();

	}

   	MessageLog.trace('selectedNode: "'+selectedNode+'"');
   	MessageLog.trace('selectedSoundColumnName: "'+selectedSoundColumnName+'"');
   	
   	if( !selectedNode || !selectedSoundColumnName ){
   		MessageBox.warning('Please select one Layer with an animatable attribute and one Sound layer.',0,0,0,'Error');
   		return;
   	}

   	var selectedNodeAttrs = Utils.getAnimatableAttrs( selectedNode );
   	if( !selectedNodeAttrs || !selectedNodeAttrs.length ){
   		MessageBox.warning('Node "'+selectedNode+'" has no keyable attributes.',0,0,0,'Error');
   		return;	
   	}

  	var selectedAttrName;
	var sceneSoundColumns = [];
	var selectedSoundColumnIndex = 0;
	var attrColumnName;
	var columnNameInputSkipChenged;
	var attrColumnIsNew;

	var modal = new pModal( scriptName + " v" + scriptVer, 280, 320, false );  
	if( !modal.ui ){return;}
	var ui = modal.ui;

	modal.addLabel( 'Sound: '+selectedSoundColumnName, ui );

	// Selected Node
	// modal.addLabel( "Create Keyframes to:", ui);
	var nodeNameLabel = modal.addLabel( 'Layer: '+selectedNode, ui);
	nodeNameLabel.setStyleSheet('font-weight:bold;');

	// Node keyable attributes
	// modal.addLabel('in Attribute:', ui);
	var listWidget = modal.listWidget = new QComboBox(ui);
	listWidget.addItems( selectedNodeAttrs );
	ui.mainLayout.addWidget( listWidget, 0, 0 );

	//
	listWidget["currentIndexChanged(int)"].connect( function(i){
		// MessageLog.trace('-->'+i);
		onAttrNameChanged( i );
	});

	// addLabel( 'Column Name:', ui, 0, 0 );
	var columnNameLabel = modal.addLabel( '', ui );
	var columnNameInput = modal.addLineEdit('',ui, undefined, undefined, undefined, onColumnNameChanged );

	var valuesGroup = modal.addGroup('',ui,'grid',true);

	addLabel( 'First Frame:', valuesGroup, 0, 0 );
	var firstFrameInput = addInput( valuesGroup, 1, 1, 0, true ); // frame.current()

	addLabel( 'Last Frame:', valuesGroup, 2, 0 );
	var lastFrameInput = addInput( valuesGroup, frame.numberOf(), 3, 0, true );

	addLabel( 'Remap Min to:', valuesGroup, 0, 1 );
	var remapMinInput = addInput( valuesGroup, 0, 1, 1, true );

	addLabel( 'Remap Max to:', valuesGroup, 2, 1 );
	var remapMaxInput = addInput( valuesGroup, 1, 3, 1, true );

	addLabel( 'Smoothing:', valuesGroup, 0, 2 );
	var smoothingInput = addInput( valuesGroup, 0, 1, 2, true );

	// Sample processing method
	var sampleProcessingMethodGroup = modal.addGroup('Sample Processing Method:', ui, true  );

	var averageMethodRadioButton = new QRadioButton("Average", modal);
	averageMethodRadioButton.checked = true;
	sampleProcessingMethodGroup.mainLayout.addWidget( averageMethodRadioButton, 0, 0 );

	var medianMethodRadioButton = new QRadioButton("Median", modal);
	sampleProcessingMethodGroup.mainLayout.addWidget( medianMethodRadioButton, 0, 0 );

	//
	var createButton = modal.addButton('Create Keyframes', ui, undefined, undefined, undefined, function(){
		
    	// Retrieve waveform data
    	var sampleProcessingMethod = averageMethodRadioButton.checked ? getAverage : getMedian;
    	
    	var medianData = getSoundMedianData( selectedSoundColumnName, sampleProcessingMethod );
    	
    	var _firstFrame = validateFrame( Utils.getNumber(firstFrameInput.text) || 1 );    	
    	var _lastFrame = validateFrame( Utils.getNumber(lastFrameInput.text) || frame.numberOf() );
    	var firstFrame = Math.max( Math.min( _firstFrame, _lastFrame ), 1 );
    	var lastFrame = Math.min( Math.max( _firstFrame, _lastFrame ), frame.numberOf() );
    	firstFrameInput.setText( firstFrame );
    	lastFrameInput.setText( lastFrame );

    	var mapMin = Utils.getNumber(remapMinInput.text) || 0;
    	var mapMax = Utils.getNumber(remapMaxInput.text) || 1;
    	var mapRange = mapMax - mapMin;
    	
    	var smoothing = Math.round( Utils.getNumber(smoothingInput.text) || 0 );
    	smoothingInput.setText( smoothing );

    	MessageLog.trace('Create keyframes.\ncolumnName:"'+attrColumnName+'", isNew:'+attrColumnIsNew+', firstFrame:'+firstFrame+', lastFrame:'+lastFrame+', mapMin:'+mapMin+', mapMax:'+mapMax+', smoothing:'+smoothing );
    	//MessageLog.trace(JSON.stringify( medianData, true, ' ') );

    	scene.beginUndoRedoAccum('Generate Sound Amplitude Keys');

    	try{
    	// Create the new column for the selected attribute if it not exists
		
		if( attrColumnIsNew ){
			column.add( attrColumnName, "BEZIER");
			onColumnNameChanged();
		}

    	node.linkAttr( selectedNode, selectedAttrName, attrColumnName );

    	var prevEntry;
    	var soundData = smoothing ? smoothArray( medianData.values, smoothing ) : medianData.values;

    	for( var _frame=firstFrame-1; _frame < lastFrame-1 && _frame < soundData.length; _frame++ ){

    		var __frame = _frame+1;
    		var mappedValue = mapMin + ( (soundData[_frame] - medianData.min) / medianData.minMaxRange ) * mapRange;
    		// MessageLog.trace(__frame+') '+ mappedValue +' > '+ column.isKeyFrame( attrColumnName, 1, __frame ) ); // !!!

    		if( mappedValue !== prevEntry ){
    			
    			column.setEntry( attrColumnName, 1, __frame, mappedValue );

    			if( _frame !== 0 && !column.isKeyFrame( attrColumnName, 1, _frame ) ) {
    				
    				column.setEntry( attrColumnName, 1, _frame, prevEntry );

    			}

    			prevEntry = mappedValue;

    		}else if( column.isKeyFrame( attrColumnName, 1, __frame ) ){
    			
    			column.clearKeyFrame( attrColumnName, __frame );

    		} 		
    		

    	}
    	
    	// MessageLog.trace('Keyframes created.');

    	}catch(err){MessageLog.trace('Error: '+err);}

    	scene.endUndoRedoAccum();

	});

	// Try to set Scale.Y attr by default
	selectedNodeAttrs.every(function(attrName,i){
		if( attrName !== 'SCALE.Y' ) return true;
		listWidget.setCurrentIndex(i);
	});

	ui.mainLayout.addStretch();
  	modal.show();

  	
  	///
  	function resolveExpressionName(name){
        return (name || '').trim().replace(/\s/gi,'_').replace(/[^-0-9\w]/gi,'');
    }

  	//
  	function onAttrNameChanged( i ){
  		// try{ 
  		selectedAttrName = selectedNodeAttrs[i];
  		
  		var linkedColumnName = node.linkedColumn( selectedNode, selectedAttrName );
  		var columnName = linkedColumnName === "" ? selectedNode.split('/').pop()+"_SND-AMP" : linkedColumnName;

  		// MessageLog.trace('onAttrNameChanged: '+i+', selectedAttrName:'+selectedAttrName+', linkedColumnName:'+linkedColumnName+', columnName:'+columnName );

  		columnNameInput.text = columnName;
  		onColumnNameChanged();
  		// }catch(err){MessageLog.trace('Error:'+err)}
  	}

  	//
  	function onColumnNameChanged(){
		
		attrColumnName = resolveExpressionName( columnNameInput.text );

		// MessageLog.trace('onColumnNameChanged: '+attrColumnName );

		attrColumnIsNew = false;

		if( !attrColumnName ){

			columnNameLabel.text = 'Not valid Column Name:';
			columnNameLabel.setStyleSheet('color:red');

		}else if( column.type( attrColumnName ) ){

			columnNameLabel.text = 'Name of Modified Column:';
			columnNameLabel.setStyleSheet('color:yellow');

		}else{

			columnNameLabel.text = 'Name of New Column:';
			columnNameLabel.setStyleSheet('color:green');
			attrColumnIsNew = true;

		}

		columnNameInput.text = attrColumnName;

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
	function getSoundMedianData( columnName, sampleProcessingMethod ){
		var soundColumn = column.soundColumn( columnName );
		// MessageLog.trace(' >> '+JSON.stringify(soundColumn,true,'  '));
		// MessageLog.trace(' >>> '+Object.getOwnPropertyNames(soundColumn).join('\n'));
		// MessageLog.trace('>>>>'+Object.getOwnPropertyNames(soundColumn.waveformInfo).join('\n'))
		var waveForm = soundColumn.waveformInfo(0);
		MessageLog.trace('Column wave form length in frames: '+waveForm.length/15);
		var waveFormChannels = [];
		var min = 9999999;
		var max = 0;
		var medianValues = [];
		var i=0;
		do{
			var frameForm = waveForm.splice(0, 15);
			waveFormChannels.push( frameForm );
			var medianValue = sampleProcessingMethod(frameForm);
			medianValues.push(medianValue);
			if( min > medianValue ) min = medianValue;
			if( max < medianValue ) max = medianValue;
			i++;
			// MessageLog.trace( i+') '+medianValue+' = '+frameForm );
		} while( waveForm.length );
		return {
			values: medianValues,
			min: min,
			max: max,
			minMaxRange: max - min
		};
	}

	//
	function getAverage(values){
	  if( !values || !values.length ) return 0;
	  var sum = 0;
	  values.forEach(function(v){sum+=v;});
	  return sum / values.length;
	}

	
	function getMedian(values){
	  if( !values || !values.length ) return 0;

	  values.sort(function(a,b){
	    return a-b;
	  });

	  var half = Math.floor(values.length / 2);

	  if (values.length % 2)
	    return values[half];

	  return (values[half - 1] + values[half]) / 2.0;
	}


	//
	function smoothArray( arr, windowSize ) {
	  
		var result = [];

		arr.forEach(function( val, i ){

			var leftOffset = i - windowSize;
			var from = leftOffset >= 0 ? leftOffset : 0;
			var to = i + windowSize + 1;

			var count = 0;
			var sum = 0;

			for( var j = from; j < to && j < arr.length; j ++ ) {
				sum += arr[j];
				count += 1;
			}

			result[i] = sum / count;

		});

		return result;

	}
		

}