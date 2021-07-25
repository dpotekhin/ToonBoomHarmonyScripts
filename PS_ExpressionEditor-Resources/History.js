function History( textEdit ){

	var _this = this;
	this.textEdit = textEdit;
	this.undoButton = undefined;
	this.redoButton = undefined;
	this.currentIndex = 0;
	this.hasChanges = false;
	this.history = [];
	var skipHistorySave = false;

	textEdit.textChanged.connect(function(){
		// try{
		if( skipHistorySave ) {
			skipHistorySave = false;
			return;
		}

		var text = textEdit.plainText;
	    // MessageLog.trace('textChanged: '+_this.currentIndex +'; '+_this.history.length );
	    if( _this.currentIndex !== _this.history.length-1 ) _this.history.length = _this.currentIndex+1;
	    _this.history.push( text );
	    _this.currentIndex = _this.history.length-1;
	    _this.updateButtons();
	    _this.hasChanges = true;
	    if( _this.onChanged ) _this.onChanged( text );
		// }catch(err){MessageLog.trace('Error:'+err)}
 	});

	//
	this.reset = function(){
		this.history.length = 0;
		this.currentIndex = 0;
		this.history.push( textEdit.plainText );
		this.updateButtons();
		this.hasChanges = false;
		if( this.onChanged ) this.onChanged();
		// MessageLog.trace('History.Reset: '+textEdit.plainText);
	}

	//
	this.undo = function(){
 		// MessageLog.trace('undo: '+this.currentIndex+' > '+this.history[this.currentIndex] );
 		if( this.currentIndex === 0 ) return;
 		this.currentIndex--;
 		skipHistorySave = true;
 		textEdit.setText( this.history[this.currentIndex] );
 		this.updateButtons();
 	}

 	//
	this.redo = function(){
 		// MessageLog.trace('redo '+this.currentIndex+'; '+this.history.length );
 		if( this.currentIndex+1 >= this.history.length ) return;
 		this.currentIndex++;
 		skipHistorySave = true;
 		textEdit.setText( this.history[this.currentIndex] );
 		this.updateButtons();
 	},

 	//
 	this.updateButtons = function(){
 		var _hide = this.history.length-1;// && textEdit.plainText;
 		if( this.undoButton ) this.undoButton.enabled = _hide && this.currentIndex !== 0;
 		if( this.redoButton ) this.redoButton.enabled = _hide && this.currentIndex+1 < this.history.length;
 	}

}

exports = History;