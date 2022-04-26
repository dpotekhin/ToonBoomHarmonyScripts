/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.2

A Harmony script to remove duplicate cels of the selected layer.


Installation:

1) Place this script to the Harmony custom script folder accordingly this manual:
https://docs.toonboom.com/help/harmony-20/premium/scripting/import-script.html
2) Place its icon https://github.com/dpotekhin/ToonBoomHarmonyScripts/raw/dev/script-icons/PS_RemoveCelDuplicates.png in the script-icons folder.


Requirements:

1) This script requires FFMPEG installed
	- Download it from the official FFMPEG project page: https://www.ffmpeg.org/download.html
	- Or just download from a direct link: https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-full.7z
	and unzip it to drive C.
	- Make sure the System Variables on your PC include the FFMPEG path
	https://video.stackexchange.com/questions/20495/how-do-i-set-up-and-use-ffmpeg-in-windows


Direction:

Select a drawing layer. Run PS_RemoveCelDuplicates.


ToDo:
- bug: for some reason the last frame of the layer always removed

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
	
	var isCanceled;
	var imageFiles = [];
	var imagesByName = {};
	var currentImageIndex = -1;
	var imageData = [];
	var imagesByHash ={};
	var currentImageData;

	var columnId = node.linkedColumn(selectedNode,"DRAWING.ELEMENT");
   	var elementId = column.getElementIdOfDrawing(columnId);
	// MessageLog.trace('columnId: '+columnId );
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
	
	// Get all Drawings of the Layer
	
	// MessageLog.trace( 'Drawings: '+ Drawing.numberOf( elementId ) );

	var n = Drawing.numberOf( elementId );

	for( var i=0; i<n; i++ ){

		var drawingName = Drawing.name( elementId, i );
		var path = Drawing.filename( elementId, drawingName );
		// MessageLog.trace(i+') '+drawingName+'; '+path );
		var splitedPath = path.split('/');
		var fileName = splitedPath.pop();
		
		var	previewPath = fileName.split('.');
		var fileExtension = previewPath.pop();
		previewPath = splitedPath.join('/')+'/'+previewPath.join('.')+'-small.'+fileExtension;

		var imageData = {
			columnId: columnId,
			elementId: elementId,
			index: i,
			name: drawingName,
			path: path,
			fileName: fileName,
			previewPath: previewPath
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
	}while( !(currentFrame >= lastFrame && cooldown > 10) )

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
    	var error = new QTextStream( ffmpegProc.readAllStandardError() ).readAll();
    	if( error ) MessageLog.trace('readyReadStandardError: '+ error );
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

		if( isCanceled ) {
			closeProgressBar();
			MessageLog.trace('The process was canceled by the user.');
			return;
		}

		progressProportion.getHash[0] = currentImageIndex / imageFiles.length;
		updateProgressBar();

		// !!! DEBUG >>> 
		// if( currentImageIndex > 40 ) {
		// 	removeDuplicates();
		// 	return;
		// }
		// !!! <<<

		if( currentImageIndex >= imageFiles.length ){
			MessageLog.trace('Image data collection completed.');
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
	            MessageLog.trace('The process did not start.');
	            return false;
	        }

	    }catch(err){MessageLog.trace('Error: '+err)}
	}

	
	//
	function removeDuplicates(){

		MessageLog.trace('********************');
		MessageLog.trace('Remove duplicates');

		scene.beginUndoRedoAccum( "Remove Duplicate Cels" );


		// Remove all duplicates
		
		var lastCel = column.getEntry( columnId, 1, lastFrame );

		Object.keys( imagesByHash ).forEach(function(hash,i){
			
			MessageLog.trace( i+') '+hash +' => '+imagesByHash[hash].length);
			
			var original, file;

			imagesByHash[hash].forEach(function( imageData, i ){
				
				if( i=== 0 ) {
					original = imageData;
					return;
				}

				try{

					column.setEntry( columnId, 1, lastFrame, imageData.name );
					column.deleteDrawingAt( columnId, lastFrame );
					imageData.original = original;

					// file = new File( imageData.path );
					// if( file.exists ) file.remove();

					// Remove previews
					file = new File( imageData.previewPath );
					// MessageLog.trace( 'remove: '+file.exists+' => '+imageData.previewPath );
					if( file.exists ) file.remove();

				}catch(err){ MessageLog.trace('Error: '+err); }

			});

		});

		column.setEntry( columnId, 1, lastFrame, lastCel );


		// Restore Timeline

		timelineEntries.forEach( function( oldEntry, _frame ){
			
			var currentEntry = column.getEntry( columnId, 1, _frame );
			// MessageLog.trace( _frame+' ) '+ currentEntry+' <= '+oldEntry );
			
			if( currentEntry !== oldEntry ){
				var imageData = imagesByName[oldEntry];
				var originalImage = imageData.original;
				column.setEntry( columnId, 1, _frame, originalImage.name );
			}

			progressProportion.restoreTimeline[0] = _frame / timelineEntries.length;
			updateProgressBar();

		});

		// Complete
		closeProgressBar();
					


		scene.endUndoRedoAccum(); 
	
	}



	// =====================================================
	// Progress Bar
	var progressBarUI;
	var progressProportion = {
		getHash: [0, .95],
		restoreTimeline: [0, .05]
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

        progressBarUI.canceled.connect(this, function () {
            MessageLog.trace('Cancel pressed');
            isCanceled = true;
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
		// MessageLog.trace('updateProgressBar: '+total+', '+total*100 );
	}

	function closeProgressBar(){
		progressBarUI.close();
	}
	// =====================================================



	// Start
	createProgressBar();
	checkNextImage();


}