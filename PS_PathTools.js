/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.5

ToDo:
- add aligment options (like in Adobe animate)
  - distribute, justify
  - aligning strokes relative to each other
    - how to detect a stroke group?
*/

//
var _AlignPaths = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/AlignPaths.js"));
var _Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/Utils.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));


/*
function PS_test(){
  _AlignPaths.AlignLeft();
}
*/

//
function PS_PathTools(){

   //
  MessageLog.clearLog();

  //
  var scriptName = 'Path Tools';
  var scriptVer = '0.5';
  //

  var SETTINGS_NAME = 'PS_PATH_TOOLS_SETTINGS';

  var AlignPaths = _AlignPaths;
  var Utils = _Utils;

  var btnHeight = 30;
  var modalWidth = 290;
  var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/icons/");
  var hGroupStyle = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
  var forceWindowInstances = true;//KeyModifiers.IsControlPressed();
  
  // Tool Settings
  var toolSettings = preferences.getString(SETTINGS_NAME, '');

  toolSettings = toolSettings ? JSON.parse(toolSettings) : {
    centerX: 1,
    centerY: 0,
    relativeToPoint: false
  };

  function saveToolSettings(){
    preferences.setString(SETTINGS_NAME, JSON.stringify( toolSettings ) );
  }

  //
  var currentSettings = {};

  function updateCurrentSettings(){
    // MessageLog.trace('updateCurrentSettings '+scene.numberOfUnitsX() +', '+scene.currentResolutionX()+' = '+(scene.currentResolutionX()/scene.numberOfUnitsX() )+' ; '+scene.unitsAspectRatioX()+'; '+scene.coordAtCenterX() );
    // MessageLog.trace('updateCurrentSettings Y '+scene.numberOfUnitsY() +', '+scene.currentResolutionY()+' = '+(scene.currentResolutionY()/scene.numberOfUnitsY() )+' ; '+scene.unitsAspectRatioY()+'; '+scene.coordAtCenterY() );
    // MessageLog.trace('updateCurrentSettings '+toolSettings.centerX+', '+toolSettings.centerY);
    
    currentSettings.centerX = toolSettings.relativeToPoint ? Utils.gridToPixelsX(toolSettings.centerX) : undefined;
    currentSettings.centerY = toolSettings.relativeToPoint ? Utils.gridToPixelsY(toolSettings.centerY) : undefined;
    // MessageLog.trace('updateCurrentSettings '+toolSettings.centerX+', '+toolSettings.centerY +', '+currentSettings.centerX+', '+currentSettings.centerY );
    
  }

  updateCurrentSettings();
  // MessageLog.trace('!!!'+JSON.stringify( toolSettings, true, '  ' ));


  //
  var modal = new pModal( scriptName + " v" + scriptVer, modalWidth, 260, forceWindowInstances ? false : true );  
  if( !modal.ui ){
    return;
  }
  var ui = modal.ui;

  ui.setStyleSheet( ui.styleSheet +' QPushButton{ border: none; }' );

  // Align
  var alignGroup = modal.addGroup( 'Align:', ui, true, hGroupStyle);

  var btnAlignLeft = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-left.png',
    function(){
      AlignPaths.AlignLeft( currentSettings.centerX );
    },
    'Align left edges' );

  var btnAlignHCenter = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-h-center.png',
    function(){
      AlignPaths.AlignHCenter( currentSettings.centerX );
    },
    'Align horizontal centers' );

  var btnAlignRight = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-right.png',
    function(){
      AlignPaths.AlignRight( currentSettings.centerX );
    },
    'Align right edges' );

  modal.addVLine( btnHeight, alignGroup );

  var btnAlignCenter = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-center.png',
    function(){
      AlignPaths.AlignCenter( currentSettings.centerX, currentSettings.centerY );
    },
    'Align center' );

  modal.addVLine( btnHeight, alignGroup );

  var btnAlignTop = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-top.png',
    function(){
      AlignPaths.AlignTop( currentSettings.centerY );
    },
    'Align top edges' );

  var btnAlignVCenter = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-v-center.png',
    function(){
      AlignPaths.AlignVCenter( currentSettings.centerY );
    },
    'Align vertical centers' );

  var btnAlignBottom = modal.addButton( '', alignGroup, btnHeight, btnHeight, iconPath+'align-bottom.png',
    function(){
      AlignPaths.AlignBottom( currentSettings.centerY );
    },
    'Align bottom edges' );


  alignGroup.mainLayout.addStretch();

  
  /// Flip
  var flipGroup = modal.addGroup( 'Flip:', ui, true, hGroupStyle );

  var btnFlipHCenter = modal.addButton( '', flipGroup, btnHeight, btnHeight, iconPath+'flip-h.png',
    function(){ AlignPaths.FlipHCenter( currentSettings.centerX ) }, 'Horizontal Flip' );
  var btnFlipVCenter = modal.addButton( '', flipGroup, btnHeight, btnHeight, iconPath+'flip-v.png',
    function(){ AlignPaths.FlipVCenter( currentSettings.centerY ) }, 'Vertical Flip' );
  
  flipGroup.mainLayout.addStretch();

  /// Relative to point
  var relativeGroup = modal.addGroup( '', ui, true, hGroupStyle);

  var relativeToPointCheckBox = modal.addCheckBox( 'Relative to', relativeGroup, toolSettings.relativeToPoint, checkCenterPos );
  
  // relativeGroup.mainLayout.addSpacing(20);
  // relativeGroup.mainLayout.addStretch();

  //
  
  var centerXInput = modal.addNumberInput( 'X:', relativeGroup, btnHeight*1.5, btnHeight, toolSettings.centerX, checkCenterPos );
  var centerYInput = modal.addNumberInput( 'Y:', relativeGroup, btnHeight*1.5, btnHeight, toolSettings.centerY, checkCenterPos );

  function checkCenterPos(){
    toolSettings.centerX = parseFloat( centerXInput.text );
    toolSettings.centerY = parseFloat( centerYInput.text );
    toolSettings.relativeToPoint = relativeToPointCheckBox.checkState() === Qt.Checked;
    // MessageLog.trace('checkCenterPos: '+relativeToPointCheckBox.checkState() + ' => ' + JSON.stringify( toolSettings, true, '  ' ) );
    saveToolSettings();
    updateCurrentSettings();
  }

  relativeGroup.mainLayout.addStretch();  
  

  //
  modal.addHLine( modalWidth, ui );

  // Modify
  var modifyGroup = modal.addGroup( 'Modify:', ui, true, hGroupStyle );

  var btnCollapse = modal.addButton( '', modifyGroup, btnHeight, btnHeight, iconPath+'merge.png',
    function (){
      AlignPaths.Merge( KeyModifiers.IsControlPressed() );
    },
    'Merge curve points'
    +'\nHold down the Control key to also merge the Control points'
  );

/*
  var btnSetPivot = modal.addButton( '', modifyGroup, btnHeight, btnHeight, iconPath+'pivot-to-selection.png',
    function (){
      AlignPaths.SetPivot();
      Action.perform( 'onActionChooseSpRotateTool()', 'sceneUI');
    }
    ,
    'Move pivot to the center of the selection'
  );
*/

  modifyGroup.mainLayout.addStretch();

  //
  ui.mainLayout.addStretch();

  modal.show();




}


function setPivot(){

  MessageLog.clearLog();

  _AlignPaths.SetPivot();
  Action.perform( 'onActionChooseSpRotateTool()', 'sceneUI');

}