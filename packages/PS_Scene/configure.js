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
  // Open Scene Folder
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
        targetMenuId: "File",
        id: backupSceneAction.id,
        text: backupSceneAction.text,
        action: backupSceneAction.id
        //action: 'backupSceneAction.onTrigger in ./configure.js'
    });
    // = = = = = = = = = = = = = = = = = = = = = = = = = = =



}
exports.configure = configure;