var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));

//
var submenuConfig = {

	'-': 1,

	"Selected Node Columns": getSelectedNodeColumns,

	'Examples': {

		"Pendulum": "var speedCoef = 0.5;\nvar amp = 2;\nMath.sin( currentFrame * speedCoef ) * amp;",

		"Random": "var minRandomValue = 2;\nvar maxRandomValue = 5;\nMath.random() * (maxRandomValue - minRandomValue) + minRandomValue;"

	}

};

//
function getSelectedNodeColumns(){

	var _node = selection.selectedNode(0);

    if( !_node ){
      return;
    }

    var linkedColumns = [];
    Utils.getFullAttributeList( _node, 1, true ).forEach(function(attrName){
      var columnName = node.linkedColumn( _node, attrName );
      if( !columnName ) return;
      if( curentExpressionName && curentExpressionName === columnName ) return; // skip same expression name
      linkedColumns.push( [attrName, columnName] );
    });

    if( !linkedColumns.length ){
      return;
    }

    var currentFrame = frame.current();

    var submenuItems = {};

    linkedColumns.forEach(function(attrData){
      // str += 'value( "'+attrData[1]+'", currentFrame ); // '+_node+': '+attrData[0]+'\n';
      // str += 'value( "'+attrData[1]+'" ); // '+_node+': '+attrData[0]+'\n\n';
      submenuItems[attrData[0]] = 'value( "'+attrData[1]+'", currentFrame ); /* '+_node+': '+attrData[0]+'*/';
    });

    return submenuItems;

}

//
var submenuFlatList = {};


//
function createSubmenu( menu, submenuData ){

	Object.keys( submenuData ).forEach(function( submenuItemName ){
    	
    	var submenuItemData = submenuData[submenuItemName];

    	// MessageLog.trace('!! '+submenuItemName+' >> '+Utils.isFunction(submenuItemData) );

    	if( submenuItemName.charAt(0) === '-' ){ // Add a Separator

    		menu.addSeparator();

    	}else{

    		if( typeof submenuItemData === 'string' ){ // Add menu item
				
				menu.addAction(submenuItemName);	
    			submenuFlatList[submenuItemName] = submenuItemData;

    		}else if( Utils.isFunction(submenuItemData) ){ // Dynamic items

    			var submenuItems = submenuItemData();

	    		if( submenuItems && Object.keys(submenuItems).length ){

	    			var submenuObject = {};
	    			submenuObject[submenuItemName] = submenuItems;
	    			createSubmenu( menu, submenuObject );

	    		}else{
	    			
	    			var submenu = menu.addMenu( submenuItemName );
	    			submenu.enabled = false;

	    		}

    		}else{ // Add a submenu

    			var submenu = menu.addMenu( submenuItemName );
    			createSubmenu( submenu, submenuItemData );

    		}

    	}

    })

}


//
function initSubmenu( textEdit ){

	textEdit.contextMenuEvent = function(event){
    
	    try{ // !!!

	    var menu = textEdit.createStandardContextMenu();
	    
	    createSubmenu( menu, submenuConfig );
	    
	    menu.triggered.connect(function(a){
	      // MessageLog.trace('clicked '+a.text);
	      var submenuItemData = submenuFlatList[a.text];
	      textEdit.textCursor().insertText(submenuItemData);
	    });
	    
	    menu.exec(event.globalPos());
	    delete menu;
	    
	    }catch(err){MessageLog.trace(err)} // !!!

	}

}

///
exports = {
	initSubmenu: initSubmenu
}