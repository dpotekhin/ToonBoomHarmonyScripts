//
function configure(packageFolder, packageName)
{
  
  // MessageLog.trace("!!! Package " + this.packageName + " configure was called in folder: " + packageFolder);

  var SceneHelper = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SceneHelper.js"));

  // = = = = = = = = = = = = = = = = = = = = = = = = = = =
  // Open Scene Folder
  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  var openSceneFolderAction = {
      id: "ru.peppers-studio.openSceneFolderDisplay",
      text: "Open Scene Folder",
      icon: "PS_BackupScene.png",
      checkable: false,
      isEnabled: true,
      onTrigger: SceneHelper.PS_OpenSceneFolder
  };


  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ScriptManager.addAction(openSceneFolderAction);

  ScriptManager.addMenuItem({
      targetMenuId: "File",
      id: openSceneFolderAction.id,
      text: openSceneFolderAction.text,
      action: openSceneFolderAction.id
      //action: 'openSceneFolderAction.onTrigger in ./configure.js'
  });
  // = = = = = = = = = = = = = = = = = = = = = = = = = = =






  // = = = = = = = = = = = = = = = = = = = = = = = = = = =
  // Open Scripts Folder
  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  var openScriptsFolderAction = {
      id: "ru.peppers-studio.openScriptsFolderDisplay",
      text: "Open User Scripts Folder",
      icon: "PS_BackupScene.png",
      checkable: false,
      isEnabled: true,
      onTrigger: SceneHelper.PS_OpenScriptsFolder
  };


  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ScriptManager.addAction(openScriptsFolderAction);

  ScriptManager.addMenuItem({
      targetMenuId: "File",
      id: openScriptsFolderAction.id,
      text: openScriptsFolderAction.text,
      action: openScriptsFolderAction.id
      //action: 'openSceneFolderAction.onTrigger in ./configure.js'
  });
  // = = = = = = = = = = = = = = = = = = = = = = = = = = =





  ScriptManager.addMenu({
    targetMenuId: "File",
    id: 'Backup',
    text: 'Backup'
  });

  // = = = = = = = = = = = = = = = = = = = = = = = = = = =
  // Backup Scene
  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
    var backupSceneAction = {
        id: "ru.peppers-studio.backupSceneDisplay",
        text: "Backup Scene",
        icon: "PS_BackupScene.png",
        checkable: false,
        isEnabled: true,
        onTrigger: SceneHelper.PS_BackupScene
    };


    // - - - - - - - - - - - - - - - - - - - - - - - - - - -
    ScriptManager.addAction(backupSceneAction);

    ScriptManager.addMenuItem({
        targetMenuId: "File/Backup",
        id: backupSceneAction.id,
        text: backupSceneAction.text,
        action: backupSceneAction.id
        //action: 'backupSceneAction.onTrigger in ./configure.js'
    });
    // = = = = = = = = = = = = = = = = = = = = = = = = = = =




    // = = = = = = = = = = = = = = = = = = = = = = = = = = =
    // Open Backup Folder
    // - - - - - - - - - - - - - - - - - - - - - - - - - - -
    var openBackupFolderAction = {
        id: "ru.peppers-studio.openBackupFolderDisplay",
        text: "Open Backup Folder",
        icon: "PS_BackupScene.png",
        checkable: false,
        isEnabled: true,
        onTrigger: function(){
          SceneHelper.PS_BackupScene( SceneHelper.MODE_OPEN_ONLY );
        }
    };


    // - - - - - - - - - - - - - - - - - - - - - - - - - - -
    ScriptManager.addAction(openBackupFolderAction);

    ScriptManager.addMenuItem({
        targetMenuId: "File/Backup",
        id: openBackupFolderAction.id,
        text: openBackupFolderAction.text,
        action: openBackupFolderAction.id
        //action: 'openBackupFolderAction.onTrigger in ./configure.js'
    });
    // = = = = = = = = = = = = = = = = = = = = = = = = = = =


}

///
exports.configure = configure;