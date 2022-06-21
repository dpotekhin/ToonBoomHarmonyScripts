/*
Author: Dima Potekhin (skinion.onn@gmail.com)

Name: PS_SceneStats
Version: 0.220412

*/


//
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var DrawingsStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/DrawingsStats.js"));

//
function PS_SceneStats(){

	MessageLog.clearLog(); // !!!

	// Get selection
	var selectedNodes = selection.selectedNodes();
	if(!selectedNodes.length) {
		MessageBox.warning( "Please select a node or a group.",0,0,0,"Error");
		return;
	}

	//
	var scriptName = 'Scene Stats';
	var scriptVer = '0.220412';
	//

	// var DeformerTools = _DeformerTools;
	// var Utils = _Utils;

	var btnHeight = 30;
	var modalWidth = 850;
	var modalHeight = 700;
	// var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_DeformerTools-Resources/icons/");
	var forceWindowInstances = true;//KeyModifiers.IsControlPressed();

	//
	var modal = new pModal( scriptName + " v" + scriptVer, modalWidth, modalHeight );  
	if( !modal.ui ) return;
	var ui = modal.ui;

	ui.setStyleSheet( ui.styleSheet +' QPushButton{ border: none; }' );

	// Main Group
  	// var mainGroup = modal.addGroup( '', ui, true, hGroupStyle);

  	var lib = {
  		
  		returnEmpty: function () {},

  		bgSuccess: new QBrush( new QColor('#004000') ),
  		bgFail: new QBrush( new QColor('#400000') ),
  		bgYellow: new QBrush( new QColor('#404000') ),
  		bgSuccessOrFail: function(v) { return v ? lib.bgSuccess : lib.bgFail; },
  		bgSuccessOrFailInverted: function(v) { return !v ? lib.bgSuccess : lib.bgFail; },
  		bgSuccessYellow: function(v) { return v ? lib.bgYellow : undefined; },
  		bgEmpty: function(v) { return !v || v==0 ? lib.bgFail : undefined },

  		outputYesNo: function(v){ return v ? 'Yes' : 'No'; },

  		showNodeProperties: function(data) {
  			// MessageLog.trace('>>'+data.path);
  			selection.clearSelection();
			selection.addNodeToSelection(data.path);
  			Action.perform("onActionEditProperties()", "scene" );
  		},

  		selectNode: function(data){
  			selection.clearSelection();
			selection.addNodeToSelection(data.path);
  		}
  	};

	try{
		// Get Drawings stats
		var drawingsStats = new DrawingsStats( selectedNodes, modal, lib );

		//
	  	// modal.addVLine( btnHeight, mainGroup );
	  	// mainGroup.mainLayout.addStretch();

  	}catch(err){ MessageLog.trace('Error: '+err); }

  	//
  	//
	ui.mainLayout.addStretch();

	modal.show();

}