//
function configure(packageFolder, packageName)
{
  
    // MessageLog.trace("!!! Package " + this.packageName + " configure was called in folder: " + packageFolder);
    var PS_ExpressionEditor = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_ExpressionEditor.js"));
    

    // = = = = = = = = = = = = = = = = = = = = = = = = = = =
    // Open Scene Folder
    // - - - - - - - - - - - - - - - - - - - - - - - - - - -
    var PS_ExpressionEditorAction = {
        id: "ru.peppers-studio.PS_ExpressionEditorDisplay",
        text: "Expression Editor",
        icon: "PS_BackupScene.png",
        checkable: false,
        isEnabled: true,
        onTrigger: function(){
            PS_ExpressionEditor();
        }
    };


    // - - - - - - - - - - - - - - - - - - - - - - - - - - -
    ScriptManager.addAction(PS_ExpressionEditorAction);

    ScriptManager.addMenuItem({
        targetMenuId: "Animation",
        id: PS_ExpressionEditorAction.id,
        text: PS_ExpressionEditorAction.text,
        action: PS_ExpressionEditorAction.id
        //action: 'PS_ExpressionEditorAction.onTrigger in ./configure.js'
    });
  // = = = = = = = = = = = = = = = = = = = = = = = = = = =

};

///
exports.configure = configure;