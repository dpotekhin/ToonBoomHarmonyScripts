//
var submenuConfig = {

	'-': 1,

	'Examples': {

		"Pendulum": "var speedCoef = 0.5;\nvar amp = 2;\nMath.sin( currentFrame * speedCoef ) * amp;",

		"Random": "var minRandomValue = 2;\nvar maxRandomValue = 5;\nMath.random() * (maxRandomValue - minRandomValue) + minRandomValue;"

	}

};

var submenuFlatList = {};


//
function createSubmenu( menu, submenuData ){

	Object.keys( submenuData ).forEach(function( submenuItemName ){
    	
    	if( submenuItemName.charAt(0) === '-' ){ // Add a Separator

    		menu.addSeparator();

    	}else{

    		var submenuItemData = submenuData[submenuItemName];

    		if( typeof submenuItemData !== 'string' ){ // Add a submenu
				
				var submenu = menu.addMenu( submenuItemName );
    			createSubmenu( submenu, submenuItemData )

    		}else{ // Add menu item

    			menu.addAction(submenuItemName);	
    			submenuFlatList[submenuItemName] = submenuItemData;
    		}

    	}

    })

}


//
function initSubmenu( textEdit ){

	textEdit.contextMenuEvent = function(event){
    
	    // try{ // !!!

	    var menu = textEdit.createStandardContextMenu();
	    
	    createSubmenu( menu, submenuConfig );
	    
	    menu.triggered.connect(function(a){
	      // MessageLog.trace('clicked '+a.text);
	      var submenuItemData = submenuFlatList[a.text];
	      textEdit.textCursor().insertText(submenuItemData);
	    });
	    
	    menu.exec(event.globalPos());
	    delete menu;
	    
	    // }catch(err){MessageLog.trace(err)} // !!!

	}

}

///
exports = {
	initSubmenu: initSubmenu
}