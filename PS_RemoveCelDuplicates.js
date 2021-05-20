/*
Author: D.Potekhin (https://peppers-studio.ru)
Version 0.2

This script requires FFMPEG installed!

*/

function PS_RemoveCelDuplicates(){

	MessageLog.clearLog();

	var selectedNode = selection.selectedNode(0);
	if( !selectedNode || node.type(selectedNode) !== 'READ' ) {
		MessageBox.information('Please select one Drawing layer.', 0, 0, 0, 'Error' );
		return;
	}

	MessageLog.trace('selectedNode: '+selectedNode );
	// MessageLog.trace(''+node.getAllAttrKeywords( selectedNode).join('\n') );
	

	var columnId = node.linkedColumn(selectedNode,"DRAWING.ELEMENT");
   	var elementId = column.getElementIdOfDrawing(columnId);
	MessageLog.trace('columnId: '+columnId );
	// MessageLog.trace('getDrawingColumnList (): '+column.getDrawingColumnList() );
	// MessageLog.trace('getDrawingTimings: '+column.getDrawingTimings(columnId) );
	// MessageLog.trace('elementKey: '+elementKey );

	var elementFolder = element.completeFolder( elementId );
	var pixmapFormat = element.pixmapFormat( elementId );

	/*
	var dir = new Dir;
	dir.path = elementFolder;
	
	var imageFiles = dir.entryList('*');
	imageFiles = imageFiles.filter( function(s){ return s.match(/\.tga$/i); });
	*/
	
	MessageLog.trace( 'Drawings: '+ Drawing.numberOf( elementId ) );
	var imageFiles = [];
	var imagesByName = {};

	var n = Drawing.numberOf( elementId );
	for( var i=0; i<n; i++ ){
		var drawingName = Drawing.name( elementId, i );
		var path = Drawing.filename( elementId, drawingName );
		// MessageLog.trace(i+') '+drawingName+'; '+path );
		
		var imageData = {
			columnId: columnId,
			elementId: elementId,
			index: i,
			name: drawingName,
			path: path,
			fileName: path.split('/').pop()
		};

		imageFiles.push(imageData);
		imagesByName[drawingName] = imageData;

	}


	
	var lastFrame = frame.numberOf();

	// Save all timeline entries
	var timelineEntries = [];
	var currentFrame = 1;
	var cooldown = 0;
	do{
		var entry = column.getEntry( columnId, 1, currentFrame );
		if( !entry ) cooldown++;
		else cooldown = 0;
		// MessageLog.trace(currentFrame+' ) '+entry );
		timelineEntries[currentFrame] = entry;
		currentFrame++;
	}while( !(currentFrame > lastFrame && cooldown > 10) )

	// return; // !!! DEBUG


	///
	var ffmpegProc = new QProcess();
	
	ffmpegProc["finished(int,QProcess::ExitStatus)"].connect(
        this,
        function() {
        	// MessageLog.trace('process finished'+ ffmpegProc.state() );
        	checkNextImage();
        }
    );
    
    ffmpegProc.readyReadStandardOutput.connect( this, function(){
    	
    	var hash = new QTextStream( ffmpegProc.readAllStandardOutput() ).readAll().replace('\n','').replace('MD5=','');
    	
    	currentImageData.hash = hash;
    	MessageLog.trace('readyReadStandardOutput: '+ hash );

    	var hashImages = imagesByHash[hash];
    	if( !hashImages ) imagesByHash[hash] = hashImages = [];
    	hashImages.push( currentImageData );

    	ffmpegProc.kill();

    });

    ffmpegProc.readyReadStandardError.connect( this, function(){
    	MessageLog.trace('readyReadStandardOutput: '+ new QTextStream( ffmpegProc.readAllStandardError() ).readAll() );
    });

    /*
    ffmpegProc.stateChanged.connect(this,function(state){
    	MessageLog.trace('stateChanged: '+state);
    	if( state === QProcess.NotRunning ){
    		// checkNextImage();
    	}
    });
    */

    /*
	// elementFolder = elementFolder.replace(/\//gi,'\\');
	var path = elementFolder+'/'+imageFiles[1];
	var command = 'ffmpeg -loglevel error -i "'+path+'" -map 0:v -f md5 -';
    ffmpegProc.start(command);
    */


	//
	function checkNextImage(){
		
		currentImageIndex++;

		progressProportion.getHash[0] = currentImageIndex / imageFiles.length;
		updateProgressBar();

		// !!! DEBUG >>> 
		// if( currentImageIndex > 40 ) {
		// 	removeDuplicates();
		// 	return;
		// }
		// !!! <<<

		if( currentImageIndex >= imageFiles.length ){
			MessageLog.trace('Checking complete');
			removeDuplicates();
			return;
		}

		var imageData = currentImageData = imageFiles[currentImageIndex];
		MessageLog.trace('\n\ncheckNextImage: '+ currentImageIndex+': '+imageData.name);

		checkImageHash( );
	}

	//
	function checkImageHash(){
		try{

			// MessageLog.trace('checkImageHash '+currentImageData.name+'; '+currentImageIndex );
			var command = 'ffmpeg -loglevel error -i "'+currentImageData.path+'" -map 0:v -f md5 -';
			// MessageLog.trace('Command: '+command);
	    	ffmpegProc.start(command);

	    	var procStarted = ffmpegProc.waitForStarted(1500);
	    	if (!procStarted) {
	            MessageLog.trace('Process not started');
	            return false;
	        }

	    }catch(err){MessageLog.trace('Error '+err)}
	}

	
	//
	function removeDuplicates(){

		MessageLog.trace('********************');
		MessageLog.trace('removeDuplicates');

		scene.beginUndoRedoAccum( "Remove Duplicate Cels" );

		try{

			// Remove all dups
			
			var lastCel = column.getEntry( columnId, 1, lastFrame );

			Object.keys( imagesByHash ).forEach(function(hash,i){
				
				MessageLog.trace( i+') '+hash +' => '+imagesByHash[hash].length);
				
				var original;

				imagesByHash[hash].forEach(function( imageData, i ){
					
					if( i=== 0 ) {
						original = imageData;
						return;
					}

					column.setEntry( columnId, 1, lastFrame, imageData.name );
					column.deleteDrawingAt( columnId, lastFrame );
					imageData.original = original;
				})

			});

			column.setEntry( columnId, 1, lastFrame, lastCel );


			// Restore Timeline
			var prevEntry;

			timelineEntries.forEach( function( oldEntry, _frame ){
				var currentEntry = column.getEntry( columnId, 1, _frame );
				// MessageLog.trace( _frame+' ) '+ currentEntry+' <= '+oldEntry );
				if( currentEntry !== oldEntry ){
					var imageData = imagesByName[oldEntry];
					var originalImage = imageData.original;
					column.setEntry( columnId, 1, _frame, originalImage.name );
				}
				prevEntry = oldEntry;

				// progressProportion.restoreTimeline[0] = _frame / timelineEntries.length;
				// updateProgressBar();
			});

			// Complete
			closeProgressBar();
					

		}catch(err){ MessageLog.trace('Error: '+err); }

		scene.endUndoRedoAccum(); 
	
	}

	// =====================================================
	// Progress Bar
	var progressBarUI;
	var progressProportion = {
		getHash: [0, .9],
		restoreTimeline: [0, .1]
	};

	function createProgressBar(){
		progressBarUI = new QProgressDialog(
            "\nProcessing cels...",
            "Cancel",
            0,
            1,
            this,
            Qt.FramelessWindowHint
        );

        progressBarUI.modal = true;
        progressBarUI.value = 0;
        progressBarUI.maximum = 100;
        progressBarUI.minimumDuration = 0;

        // ToDo: To implement canceling
        progressBarUI.canceled.connect(this, function () {
            // Exit active event loop, which allows
            // wasCanceled handling to occur in the current running function.
            MessageLog.trace('Cancel pressed');
        });

        progressBarUI.show();
	}

	function updateProgressBar(){
		var total = 0;
		Object.keys(progressProportion).forEach(function(v){
			var obj = progressProportion[v];
			total += obj[0] * obj[1];
		});
		progressBarUI.value = total * 100;
		MessageLog.trace('updateProgressBar: '+total+', '+total*100 );
	}

	function closeProgressBar(){
		progressBarUI.close();
	}
	// =====================================================



	
	var currentImageIndex = -1;
	var imageData = [];
	var imagesByHash ={};
	var currentImageData;



	// Start
	createProgressBar();
	checkNextImage();


}