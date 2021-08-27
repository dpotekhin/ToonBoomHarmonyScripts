var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));

function PS_CreateSoundAmpColumn(){

	MessageLog.clearLog();

	var scriptName = 'Create Sound Amplitude Expression';
  	var scriptVer = '0.210821';

	var sceneSoundColumns = [];
	var selectedSoundColumnIndex = 0;

	// Get Sound columns
	var columnCount = column.numberOf();
	for( var i=0; i<columnCount; i++ ){
		var columnName = column.getName(i);
		if( column.type(columnName) === 'SOUND' ) sceneSoundColumns.push(columnName);
	}
	
	if( !sceneSoundColumns.length ){
		return;
	}

	/*
	var columnName = column.selected();
	var columnType = column.type(columnName);
	*/
	MessageLog.trace('>>'+sceneSoundColumns);

  	//
	var modal = new pModal( scriptName + " v" + scriptVer, 280, 150, false );  
	if( !modal.ui ){return;}
	var ui = modal.ui;

	// Sound Columns dropdown
	var listWidget = modal.listWidget = new QComboBox(ui);
	listWidget.addItems(sceneSoundColumns);
	ui.mainLayout.addWidget( listWidget, 0, 0 );

	//
	listWidget["currentIndexChanged(int)"].connect( function(i){
		// MessageLog.trace('-->'+i);
		selectedSoundColumnIndex = i;
		expressionNameInput.text = '';
		setExpressionNameBySoundName();
	});

	// Expression Name
	var expressionNameLabel = modal.addLabel('Expression Name:', ui);
	var expressionNameInput = modal.addLineEdit('', ui);

	//
	var createButton = modal.addButton('Create Expression', ui, undefined, undefined, undefined, function(){
		
		// Sound Column
		var soundColumn = sceneSoundColumns[selectedSoundColumnIndex];
		if( !soundColumn ){
			MessageLog.trace('No sound column selected.');
			return;
		}

		// Check Expression Name
		var expressionName = expressionNameInput.text;
		MessageLog.trace('Create expression: '+expressionName );
        expressionName = expressionName ? expressionName.trim().replace(/\s/gi,'_').replace(/[^0-9\w]/gi,'') : '';
        if( !expressionName ){
        	MessageLog.trace('Expression Name required.');
			return;
		}
		expressionNameInput.text = expressionName;

		var medianData = getSoundMedianData( );

	});

	//
	ui.mainLayout.addStretch();
  	modal.show();

  	setExpressionNameBySoundName();

  	///
  	function setExpressionNameBySoundName(){
  		if( expressionNameInput.text ) return;
  		expressionNameInput.text = sceneSoundColumns[selectedSoundColumnIndex]+'_AMP';
  	}

	return;

	//
	

	
	function getSoundMedianData( columnName ){
		var soundColumn = column.soundColumn( columnName );
		// MessageLog.trace(' >> '+JSON.stringify(soundColumn,true,'  '));
		MessageLog.trace(' >>> '+Object.getOwnPropertyNames(soundColumn).join('\n'));
		// MessageLog.trace('>>>>'+Object.getOwnPropertyNames(soundColumn.waveformInfo).join('\n'))
		var waveForm = soundColumn.waveformInfo(0);
		MessageLog.trace('>>>>'+waveForm.length);
		var waveFormChannels = [];
		var median = [];
		var i=0;
		do{
			var frameForm = waveForm.splice(0, 15);
			// waveFormChannels.push( frameForm );
			var median = getSimpleMedian(frameForm);
			median.push();
			i++;
			// MessageLog.trace( i+') '+median+' = '+frameForm );
		} while( waveForm.length );
		return median;
	}


	///
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