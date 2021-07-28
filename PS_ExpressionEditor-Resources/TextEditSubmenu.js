/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210728

Context menu of the Expression editor
*/

var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));


//
function initSubmenu( editor ){

	//
	var innerActions = {
		
		createFixedFrameRateBy2Expression: function( editor ){ editor.createExpression( 'fixedFrameRateBy2', chunks.fixedFrameRateBy2 ); }

	}

	//
	var chunks = {
		fixedFrameRateBy2: "var holdFrame = 2;\nfloor( (currentFrame - .5 ) / holdFrame ) * holdFrame + 1"
	};

	//
	var submenuFlatList = {};

	//
	var submenuConfig = {

		'-': 1,

		// Selected node Columns
		"Selected Node Columns": getSelectedNodeColumns,
		
		// Functions
		'Functions':{

			"currentFrame": "currentFrame",
			"numFrames": "numFrames",

			"--0": "",
			"sin (angle)": "sin (angle)",
			"cos (angle)": "cos (angle)",
			"tan (angle)": "tan (angle)",
			"asin( v )": "asin( v )",
			"acos( v )": "acos( v )",
			"atan( v )": "atan( v )",
			"atan2( x, y )": "atan2( x, y )",
			"int ( v )": "int ( v )",
			"ceil( v )": "ceil( v )",
			"floor( v )": "floor( v )",
			"abs( v )": "abs( v )",
			"sqrt( v )": "sqrt( v )",
			"exp( v )": "exp( v )",
			"ln( v )": "ln( v )",
			"ln( v )": "ln( v )",

			"--1": "",
			"Math.min( a, ... )": "Math.min( a, b )",
			"Math.max( a, ... )": "Math.max( a, b )",
			"Math.random() * v": "Math.random() * v",
			"Math.PI": "Math.PI",
			"Math.pow( base, exponent )": "Math.pw( base, exponent )",		

			"--2": "",
			"value( columnName )": "value( columnName )",
			"value( columnName, frame )": "value( columnName, frame )",
			"column( columnName )": "column( columnName )",
		},

		// Actions
		'Actions': {

			'Create Fixed Framerate on 2s Expression': '!createFixedFrameRateBy2Expression'

		},

		// Examples
		'Examples': {

			"Pendulum": "var speedCoef = 0.5;\nvar amp = 2;\nMath.sin( currentFrame * speedCoef ) * amp;",

			"Random": "var minRandomValue = 2;\nvar maxRandomValue = 5;\nMath.random() * (maxRandomValue - minRandomValue) + minRandomValue;",

			"Wiggle": "// Wiggle expression\nvar seedOffset = 0; // Random seed offset\nvar amp = 100; // Amplitude\nvar freq = 5; // Random value changes every N-th frame\n\nfunction seedrandom( seed ) { // Seeded Random Generator\n    var x = Math.sin(seed + seedOffset) * 10000;\n    return x - Math.floor(x);\n}\n\nfunction interpolate(pa, pb, px){ // Interpolator\n	var ft = px * Math.PI, f = (1 - Math.cos(ft)) * 0.5;\n	return pa * (1 - f) + pb * f;\n}\n\nvar _currentFrame = ~~(currentFrame / freq);\nvar _currentRandom = seedrandom( _currentFrame );\nvar _prevRandom = seedrandom( _currentFrame - 1 );\ninterpolate(_prevRandom, _currentRandom, (currentFrame % freq) / freq) * amp; // Noise result",

			"Fixed Frame Rate by 2": chunks.fixedFrameRateBy2,

			"Degrees to Radians": "var DEG2RAD = Math.PI / 180;",

			"Radians to Degrees": "var RAD2DEG = 180 / Math.PI;",

		}

	};


	//
	editor.textEdit.contextMenuEvent = function(event){
    
	    try{ // !!!

	    var menu = editor.textEdit.createStandardContextMenu();
	    
	    createSubmenu( menu, submenuConfig );
	    
	    menu.triggered.connect(function(a){
	      // MessageLog.trace('clicked '+a.text);
	      var submenuItemData = submenuFlatList[a.text];

	      if( typeof submenuItemData === 'string' ) editor.textEdit.textCursor().insertText(submenuItemData);
	      else submenuItemData( editor );

	    });
	    
	    menu.exec(event.globalPos());
	    delete menu;
	    
	    }catch(err){MessageLog.trace(err)} // !!!

	}

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

						if( submenuItemData.charAt(0) === '!' ){ // Menu item is action

							// MessageLog.trace('Action: "'+submenuItemName+'" '+submenuItemData.substr(1,submenuItemData.length));
							submenuFlatList[submenuItemName] = innerActions[submenuItemData.substr(1,submenuItemData.length)];

						}else{

		    			submenuFlatList[submenuItemName] = submenuItemData;

		    		}

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
	function getSelectedNodeColumns(){

		var _node = selection.selectedNode(0);

    if( !_node ){
      return;
    }

    var linkedColumns = [];
    Utils.getFullAttributeList( _node, 1, true ).forEach(function(attrName){
      var columnName = node.linkedColumn( _node, attrName );
      if( !columnName ) return;
      if( editor.currentExpressionName && editor.currentExpressionName === columnName ) return; // skip same expression name
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
      submenuItems[attrData[0]] = 'value( column("'+attrData[1]+'") ); /* '+_node+': '+attrData[0]+'*/';
    });

    return submenuItems;

	}

}

///
exports = {
	initSubmenu: initSubmenu
}