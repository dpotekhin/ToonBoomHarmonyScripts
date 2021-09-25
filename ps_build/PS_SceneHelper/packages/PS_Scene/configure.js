//
function configure(packageFolder, packageName)
{
  
  // MessageLog.trace("!!! Package " + this.packageName + " configure was called in folder: " + packageFolder);

  var SceneHelper = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SceneHelper.js"));


  // = = = = = = = = = = = = = = = = = = = = = = = = = = =
  // Reload Scene
  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  var reloadSceneAction = {
      id: "ru.peppers-studio.reloadSceneDisplay",
      text: "Reload Scene ",
      // icon: "PS_BackupScene.png",
      checkable: false,
      isEnabled: true,
      onTrigger: SceneHelper.PS_ReloadScene
  };


  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ScriptManager.addAction(reloadSceneAction);

  ScriptManager.addMenuItem({
      targetMenuId: "File",
      id: reloadSceneAction.id,
      text: reloadSceneAction.text,
      action: reloadSceneAction.id
      //action: 'reloadSceneAction.onTrigger in ./configure.js'
  });
  // = = = = = = = = = = = = = = = = = = = = = = = = = = =




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



  // RESOURCES

  ScriptManager.addMenu({
    targetMenuId: "File",
    id: 'Resources',
    text: 'Resources'
  });



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
      targetMenuId: "File/Resources",
      id: openScriptsFolderAction.id,
      text: openScriptsFolderAction.text,
      action: openScriptsFolderAction.id
      //action: 'openSceneFolderAction.onTrigger in ./configure.js'
  });
  // = = = = = = = = = = = = = = = = = = = = = = = = = = =




  // = = = = = = = = = = = = = = = = = = = = = = = = = = =
  // Open Selected Library Template Folder
  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  var openSelectedLibraryTemplateFolderAction = {
      id: "ru.peppers-studio.openSelectedLibraryTemplateFolderDisplay",
      text: "Open Selected Library Template Folder",
      icon: "PS_BackupScene.png",
      checkable: false,
      isEnabled: true,
      onTrigger: SceneHelper.PS_OpenTemplateFolder
  };


  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ScriptManager.addAction(openSelectedLibraryTemplateFolderAction);

  ScriptManager.addMenuItem({
      targetMenuId: "File/Resources",
      id: openSelectedLibraryTemplateFolderAction.id,
      text: openSelectedLibraryTemplateFolderAction.text,
      action: openSelectedLibraryTemplateFolderAction.id
      //action: 'openSceneFolderAction.onTrigger in ./configure.js'
  });
  // = = = = = = = = = = = = = = = = = = = = = = = = = = =




  // = = = = = = = = = = = = = = = = = = = = = = = = = = =
  // Open Pencil Texture Folder
  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  var openPencilTextureFolderAction = {
      id: "ru.peppers-studio.openPencilTextureFolderDisplay",
      text: "Open Pencil Texture Folder",
      icon: "PS_BackupScene.png",
      checkable: false,
      isEnabled: true,
      onTrigger: SceneHelper.PS_OpenPencilTextureFolder
  };


  // - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ScriptManager.addAction(openPencilTextureFolderAction);

  ScriptManager.addMenuItem({
      targetMenuId: "File/Resources",
      id: openPencilTextureFolderAction.id,
      text: openPencilTextureFolderAction.text,
      action: openPencilTextureFolderAction.id
      //action: 'openSceneFolderAction.onTrigger in ./configure.js'
  });
  // = = = = = = = = = = = = = = = = = = = = = = = = = = =



  // BACKUP


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
        onTrigger: SceneHelper.PS_OpenBackupFolder
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