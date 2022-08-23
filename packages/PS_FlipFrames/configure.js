/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220823
*/

//
function configure(packageFolder, packageName) {

    var PREF_NAME = 'PS_FlipFrames';

    //Create Toolbar
    var toolbar = new ScriptToolbarDef({
        id: "onn.skinion", // A unique identifier. Use of reverse DNS is recommended.
        text: "Flip Frames", // The name of the toolbar
        customizable: true // If true, the toolbar is customizable.
    });

    // SetFlipFrame
    var SetFlipFrameAction = {
        id: "onn.skinion.SetFlipFrame",
        text: "Set Flip Frame",
        icon: "set-flip-frame.png",
        isEnabled: true,
        // checkable: !true,
        // isChecked: true,
        onTrigger: function() {
            // MessageLog.trace('PS_FlipFrames: Set first frame: ' + PREF_NAME);
            preferences.setInt(PREF_NAME, frame.current());
            FlipFramesAction.isEnabled = true;
        }
    };

    ScriptManager.addAction(SetFlipFrameAction);

    toolbar.addButton({
        text: SetFlipFrameAction.text,
        icon: SetFlipFrameAction.icon,
        checkable: SetFlipFrameAction.checkable,
        action: SetFlipFrameAction.id
    });

    ScriptManager.addShortcut({
        id: SetFlipFrameAction.id,
        text: SetFlipFrameAction.text,
        action: "PS_SetFlipFrame in ./configure.js",
        longDesc: SetFlipFrameAction.text,
        order: "256",
        categoryId: "PS",
        categoryText: "Scripts"
    });


    // FlipFrames
    var FlipFramesAction = {
        id: "onn.skinion.FlipFrames",
        text: "Flip Frames",
        icon: "flip-frames.png",
        isEnabled: !true,
        // checkable: !true,
        // isChecked: true,
        onTrigger: function() {
            var _frame = preferences.getInt(PREF_NAME, -1);
            // MessageLog.trace('PS_FlipFrames: ' + _frame);
            if (_frame === -1) {
                // MessageBox.warning("To flip frames you need to apply this script with Control key at the first frame.", 0, 0, 0, "Error");
                return;
            }

            preferences.setInt(PREF_NAME, frame.current());
            frame.setCurrent(Number(_frame));
        }
    };

    ScriptManager.addAction(FlipFramesAction);

    toolbar.addButton({
        text: FlipFramesAction.text,
        icon: FlipFramesAction.icon,
        checkable: FlipFramesAction.checkable,
        action: FlipFramesAction.id
    });

    ScriptManager.addShortcut({
        id: FlipFramesAction.id,
        text: FlipFramesAction.text,
        action: "PS_FlipFrames in ./configure.js",
        longDesc: FlipFramesAction.text,
        order: "256",
        categoryId: "PS",
        categoryText: "Scripts"
    });

    //
    ScriptManager.addToolbar(toolbar);

    preferences.setInt(PREF_NAME, -1);

}


//
function PS_SetFlipFrame() {

    Action.perform("onTriggerScriptAction(QString)", "ScriptManagerResponder", "onn.skinion.SetFlipFrame");

}


//
function PS_FlipFrames() {

    Action.perform("onTriggerScriptAction(QString)", "ScriptManagerResponder", "onn.skinion.FlipFrames");

}

///
exports.configure = configure;