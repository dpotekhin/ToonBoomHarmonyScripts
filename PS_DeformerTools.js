/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.211026
*/


var _DeformerTools = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_DeformerTools-Resources/DeformerTools.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

///
function PS_DeformerTools(){

	//
  MessageLog.clearLog();

  //
  var scriptName = 'Deformer Tools';
  var scriptVer = '0.211026';
  //

  // var SETTINGS_NAME = 'PS_DEFORMER_TOOLS_SETTINGS';

  var DeformerTools = _DeformerTools;
  var Utils = _Utils;

  var btnHeight = 30;
  var modalWidth = 290;
  var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_DeformerTools-Resources/icons/");
  var hGroupStyle = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
  var forceWindowInstances = true;//KeyModifiers.IsControlPressed();


  //
  var modal = new pModal( scriptName + " v" + scriptVer, modalWidth, 260, forceWindowInstances ? false : true );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;

  ui.setStyleSheet( ui.styleSheet +' QPushButton{ border: none; }' );

  // ALIGN
  var alignGroup = modal.addGroup( 'Align Points:', ui, true, hGroupStyle);

  modal.addButton( '', alignGroup, btnHeight, btnHeight,
  	iconPath+'align-left.png',
    function(){
      DeformerTools.alignVertically(-1);
    },
    'Align points to the left'
  );

  modal.addButton( '', alignGroup, btnHeight, btnHeight,
  	iconPath+'align-h-center.png',
    function(){
      DeformerTools.alignVertically(0);
    },
    'Align points to the horizontal center'
  );

  modal.addButton( '', alignGroup, btnHeight, btnHeight,
  	iconPath+'align-right.png',
    function(){
      DeformerTools.alignVertically(1);
    },
    'Align points to the right'
  );

	//
  modal.addVLine( btnHeight, alignGroup );

  //
  modal.addButton( '', alignGroup, btnHeight, btnHeight,
  	iconPath+'align-top.png',
    function(){
      DeformerTools.alignHorizontally(1);
    },
    'Align points to the top'
   );

	modal.addButton( '', alignGroup, btnHeight, btnHeight,
  	iconPath+'align-v-center.png',
    function(){
      DeformerTools.alignHorizontally(0);
    },
    'Align points to the center'
   );

  modal.addButton( '', alignGroup, btnHeight, btnHeight,
  	iconPath+'align-bottom.png',
    function(){
      DeformerTools.alignHorizontally(-1);
    },
    'Align points to the bottom'
   );  

  ///
  alignGroup.mainLayout.addStretch();


  // CONTROL POINTS
  var cpGroup = modal.addGroup( 'Control points:', ui, true, hGroupStyle);

  modal.addButton( 'O', cpGroup, btnHeight, btnHeight,
  	// iconPath+'align-left.png',
  	undefined,
    function(){
      DeformerTools.orientControlPoints();
    },
    'Orient control points to oposite points'
  );

  modal.addButton( 'D', cpGroup, btnHeight, btnHeight,
  	// iconPath+'align-left.png',
  	undefined,
    function(){
      DeformerTools.distributeControlPoints();
    },
    'Distribute control points on thirds'
  );


  cpGroup.mainLayout.addStretch();

  // Generate deformers
  var gdGroup = modal.addGroup( 'Generate:', ui, true, hGroupStyle);
  modal.addButton( 'O', gdGroup, btnHeight, btnHeight,
    // iconPath+'align-left.png',
    undefined,
    function(){
      DeformerTools.generateCircleDeformer();
    },
    'Generate Circle Deformer'
  );
  modal.addButton( 'R', gdGroup, btnHeight, btnHeight,
    // iconPath+'align-left.png',
    undefined,
    function(){
      DeformerTools.generateRectDeformer();
    },
    'Generate Rectangle Deformer'
  );

  gdGroup.mainLayout.addStretch();

  //
  ui.mainLayout.addStretch();

  modal.show();


}



// !!!
function PS_DeformerTools_TEST() {
  
  // _DeformerTools.generateCircleDeformer();
  // _DeformerTools.generateRectDeformer();
  
  /*
  // !!!
  var nodes = selection.selectedNodes();
  
  // MessageLog.trace('>>'+JSON.stringify( _Utils.getFullAttributeList( nodes[0], 1 ), true, '  ' ) );
  
  _Utils.getFullAttributeList( nodes[0], 1 ).forEach(function(attr){
    MessageLog.trace( attr.keyword()+' ==> '+attr.textValue() );
  })

  // MessageLog.trace(nodes+' > '+node.type(nodes));
  */
}
