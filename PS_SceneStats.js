/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_SceneStats :]
[Version: 0.220715 :]

[Description:
The script displays statistics on the nodes of the selected group.
:]

[Usage:
Select a Group or Node in that Group, click the Script button and select the desired stats.
:]
*/


//
var ContextMenu = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/ContextMenu.js"));
var SceneStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/SceneStats.js"));

//
function PS_SceneStats() {

    MessageLog.clearLog(); // !!!

    if (KeyModifiers.IsControlPressed()) { runStats({ all: true }); return; }
    if (KeyModifiers.IsShiftPressed()) { runStats({ drawings: true, pegs: true }); return; }
    if (KeyModifiers.IsAlternatePressed()) { runStats({ palettes: true, colors: true }); return; }

    try {

        ContextMenu.showContextMenu({
            '!All (Click + Ctrl)': function() { runStats({ all: true }); },
            '!Drawings + Pegs (Click + Shift)': function() { runStats({ drawings: true, pegs: true }); },
            '!Palettes + Colors (Click + Alt)': function() { runStats({ palettes: true, colors: true }); },
            '!Drawings': function() { runStats({ drawings: true }); },
            '!Pegs': function() { runStats({ pegs: true }); },
            '!Drawing Substitutions': function() { runStats({ drawingSubs: true }); },
            '!Composites': function() { runStats({ composites: true }); },
            '!Unconnected Nodes': function() { runStats({ unconnectedNodes: true }); },
            '!General': function() { runStats({ general: true }); },
        });

    } catch (err) { MessageLog.trace('Error: PS_SceneStats: ' + err) }

    function runStats(options) {
        new SceneStats(options);
    }

}