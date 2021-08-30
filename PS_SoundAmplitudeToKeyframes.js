/*
Author: D.Potekhin (d@peppers-studio.ru)

[Name: PS_SoundAmplitudeToKeyframes :]
[Version: 0.210830 :]

[Description:
This script quickly sets the Scene duration to the selected Sound layer duration.
:]

[Usage:
Select one sound layer as the source of wave form amplitude and one layer in which to generate keyframes and then click on the script.

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
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));

//
function PS_SoundAmplitudeToKeyframes(){

	// MessageLog.clearLog();

	//
  	var scriptName = 'Sound Amplitude To Keyframes';
  	var scriptVer = '0.210830';

  	//
	var selectedNode;
	var selectedSoundColumnName;

	MessageLog.trace('--------- '+Timeline.numLayerSel+' --------');

	// for( var i=0; i<Timeline.numLayerSel; i++){
	// 	MessageLog.trace(i+') '+Timeline.selIsNode(i)+', '+Timeline.selToNode(i)+', '+Timeline.selIsColumn(i) );
	// }

	// MessageLog.trace('-----------------');

	[0,Timeline.numLayerSel-1].forEach(function(i){
		
		// MessageLog.trace(i+') '+Timeline.selIsNode(i)+', '+Timeline.selToNode(i)+', '+Timeline.selIsColumn(i) );

		if ( !selectedNode && Timeline.selIsNode(i) ){
			
			selectedNode = Timeline.selToNode(i);
		
		}else  if ( Timeline.selIsColumn(i) ){
			
			selectedSoundColumnName = Timeline.selToColumn(i);
        	if( column.type(selectedSoundColumnName) !== 'SOUND' ) selectedSoundColumnName = undefined;

		}

	});


   	MessageLog.trace('selectedNode: "'+selectedNode+'"');
   	MessageLog.trace('selectedSoundColumnName: "'+selectedSoundColumnName+'"');
   	
   	if( !selectedNode || !selectedSoundColumnName ){
   		MessageBox.warning('Please select one Sound layer and one Layer wich has keyable attributes.',0,0,0,'Error');
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

	var modal = new pModal( scriptName + " v" + scriptVer, 280, 210, false );  
	if( !modal.ui ){return;}
	var ui = modal.ui;

	// Selected Node
	// modal.addLabel( "Create Keyframes to:", ui);
	var nodeNameLabel = modal.addLabel( selectedNode, ui);
	nodeNameLabel.setStyleSheet('font-weight:bold;');

	// Node keyable attributes
	// modal.addLabel('in Attribute:', ui);
	var listWidget = modal.listWidget = new QComboBox(ui);
	listWidget.addItems( selectedNodeAttrs );
	ui.mainLayout.addWidget( listWidget, 0, 0 );

	//
	listWidget["currentIndexChanged(int)"].connect( function(i){
		MessageLog.trace('-->'+i);
		onAttrNameChanged( i );
	});

	// addLabel( 'Column Name:', ui, 0, 0 );
	var columnNameLabel = modal.addLabel( '', ui );
	var columnNameInput = modal.addLineEdit('',ui, undefined, undefined, onColumnNameChanged );

	var valuesGroup = modal.addGroup('',ui,'grid',true);

	addLabel( 'First Frame:', valuesGroup, 0, 0 );
	var firstFrameInput = addInput( valuesGroup, 1, 1, 0, true ); // frame.current()

	addLabel( 'Last Frame:', valuesGroup, 2, 0 );
	var lastFrameInput = addInput( valuesGroup, frame.numberOf(), 3, 0, true );

	addLabel( 'Remap Min to:', valuesGroup, 0, 1 );
	var remapMinInput = addInput( valuesGroup, 0, 1, 1, true );

	addLabel( 'Remap Max to:', valuesGroup, 2, 1 );
	var remapMaxInput = addInput( valuesGroup, 1, 3, 1, true );

	//
	var createButton = modal.addButton('Create Keyframes', ui, undefined, undefined, undefined, function(){

    	// Retrieve waveform data
    	var medianData = getSoundMedianData( selectedSoundColumnName );
    	var firstFrame = parseInt(firstFrameInput.text) || 1;
    	var lastFrame = parseInt(lastFrameInput.text) || frame.numberOf();
    	var mapMin = parseFloat(remapMinInput.text) || 0;
    	var mapMax = parseFloat(remapMaxInput.text) || 1;

    	MessageLog.trace('Create keyframes.\ncolumnName:"'+attrColumnName+'", isNew:'+attrColumnIsNew+', firstFrame:'+firstFrame+', lastFrame:'+lastFrame+', mapMin:'+mapMin+', mapMax:'+mapMax );

    	scene.beginUndoRedoAccum('Generate Sound Amplitude Keys');

    	try{
    	// Create the new column for the selected attribute if it not exists
		
		if( attrColumnIsNew ){
			column.add( attrColumnName, "BEZIER");
			onColumnNameChanged();
		}

    	node.linkAttr( selectedNode, selectedAttrName, attrColumnName );

    	for( var _frame=firstFrame-1; _frame < lastFrame-1 && _frame < medianData.values.length; _frame++ ){

    		var mappedValue = mapMin + ( (medianData.values[_frame] - medianData.min) / medianData.minMaxRange ) * mapMax;
    		column.setEntry( attrColumnName, 1, _frame+1, mappedValue );

    	}
    	
    	// MessageLog.trace('Keyframes created.');

    	}catch(err){MessageLog.trace('Error: '+err);}

    	scene.endUndoRedoAccum();

	});

	//
	onAttrNameChanged(0);
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
	function getSoundMedianData( columnName ){
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
			var medianValue = getSimpleMedian(frameForm);
			// var medianValue = getMedian(frameForm);
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
	function getSimpleMedian(values){
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

}