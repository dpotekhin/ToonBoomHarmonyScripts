/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.3

ToDo:
- add aligment options (like in Adobe animate)
  - distribute, justify
  - aligning strokes relative to each other
    - how to detect a stroke group?
*/

//
var _AlignPaths = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_PathTools-Resources/AlignPaths.js"));
var pModal = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/pModal.js"));


/*
function PS_test(){
  _AlignPaths.AlignLeft();
}
*/

//
function PS_ShowPathToolsModal(){

   //
  MessageLog.clearLog();

  //
  var scriptName = 'Path Tools';
  var scriptVer = '0.31';
  //

  var SETTINGS_NAME = 'PS_PATH_TOOLS_SETTINGS';

  var AlignPaths = _AlignPaths;
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

    // TODO: I Did not find yet how to convert Drawing Grid coordinates to pixels.
    var gridStepX = scene.currentResolutionX() / scene.numberOfUnitsX() * 2 * 1.302; // 15.625
    var gridStepY = scene.currentResolutionY() / scene.numberOfUnitsY() * 2 * 1.7358; // 20.83
    currentSettings.centerX = toolSettings.relativeToPoint ? toolSettings.centerX * gridStepX : undefined;
    currentSettings.centerY = toolSettings.relativeToPoint ? toolSettings.centerY * gridStepY : undefined;
  }

  updateCurrentSettings();
  // MessageLog.trace('!!!'+JSON.stringify( toolSettings, true, '  ' ));
  
  //
  function getCenterParam(){
    return toolSettings.relativeToPoint ? { x:toolSettings.centerX, y: toolSettings.centerY } : { x: undefined, y: undefined };
  };


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
    function(){ AlignPaths.FlipHCenter( currentSettings.centerX ) }, 'Flip horizontally around the center of the Drawing' );
  var btnFlipVCenter = modal.addButton( '', flipGroup, btnHeight, btnHeight, iconPath+'flip-v.png',
    function(){ AlignPaths.FlipVCenter( currentSettings.centerY ) }, 'Flip vertically around the center of the Drawing' );
  
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
    +'\nHold down the Control key to also merge the Control points.'
  );
  
  modifyGroup.mainLayout.addStretch();

  //
  ui.mainLayout.addStretch();

  modal.show();

}
