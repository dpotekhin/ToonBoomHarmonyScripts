/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220715
*/

var pModal = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pModal.js"));
var storage = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/Storage.js"));

//
exports = function(options) {

    // Get selection
    var selectedNodes = selection.selectedNodes();
    if (!selectedNodes.length) {
        MessageBox.warning("Please select a node or a group.", 0, 0, 0, "Error");
        return;
    }

    if (node.type(selectedNodes[0]) !== 'GROUP') { // Use the group of the selected node if it isn't a Group
        selectedNodes = [node.parentNode(selectedNodes[0])];
    }

    storage.init(selectedNodes[0]);

    //
    var scriptName = 'Scene Stats';
    var scriptVer = '0.220715';
    //

    var btnHeight = 30;
    var modalWidth = 1000;
    var modalHeight = 500;
    var contentMaxHeight = modalHeight - 60;
    // var iconPath = fileMapper.toNativePath(specialFolders.userScripts+"/PS_DeformerTools-Resources/icons/");
    var forceWindowInstances = true; //KeyModifiers.IsControlPressed();

    //
    var modal = new pModal(scriptName + " v" + scriptVer, modalWidth, modalHeight);
    if (!modal.ui) return;
    var ui = modal.ui;

    ui.setStyleSheet(ui.styleSheet + ' QPushButton{ border: none; }');

    // Main Group
    // var mainGroup = modal.addGroup( '', ui, true, hGroupStyle);


    /// ------------------------------------------------
    var tabsAdded = 0;

    try {

        var tabs = new QTabWidget(ui);

        if (options.all || options.pegs) {
            var PegStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/PegStats.js"));
            tabs.addTab(new PegStats(selectedNodes, undefined, storage, contentMaxHeight), 'Pegs');
            tabsAdded++;
        }

        if (options.all || options.drawings) {
            var DrawingStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/DrawingStats.js"));
            tabs.addTab(new DrawingStats(selectedNodes, undefined, storage, contentMaxHeight), 'Drawings');
            tabsAdded++;
        }

        if (options.all || options.drawingSubs) {
            var DrawingSubsStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/DrawingSubsStats.js"));
            tabs.addTab(new DrawingSubsStats(selectedNodes, undefined, storage, contentMaxHeight), 'Drawings Substitutions');
            tabsAdded++;
        }

        if (options.all || options.composites) {
            var CompositeStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/CompositeStats.js"));
            tabs.addTab(new CompositeStats(selectedNodes, undefined, storage, contentMaxHeight), 'Composites');
            tabsAdded++;
        }

        if (options.all || options.palettes) {
            var PaletteStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/PaletteStats.js"));
            tabs.addTab(new PaletteStats(selectedNodes, undefined, storage, contentMaxHeight), 'Palettes');
            tabsAdded++;
        }

        if (options.all || options.colors) {
            var ColorStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/ColorStats.js"));
            tabs.addTab(new ColorStats(selectedNodes, undefined, storage, contentMaxHeight), 'Colors');
            tabsAdded++;
        }

        if (options.all || options.unconnectedNodes) {
            var unconnectedNodesStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/UnconnectedNodesStats.js"));
            tabs.addTab(new unconnectedNodesStats(selectedNodes, undefined, storage, contentMaxHeight), 'Unconnected Nodes');
            tabsAdded++;
        }

        if (options.all || options.general) {
            var GeneralStats = require(fileMapper.toNativePath(specialFolders.userScripts + "/PS_SceneStats-Resources/GeneralStats.js"));
            tabs.addTab(new GeneralStats(selectedNodes, modal, storage, contentMaxHeight), 'General');
            tabsAdded++;
        }

        // tabs.addTab( new QLabel("widget 2"), 'Tab2');

        ui.mainLayout.addWidget(tabs, 0, 0);

        //
        // modal.addVLine( btnHeight, mainGroup );
        // mainGroup.mainLayout.addStretch();

    } catch (err) { MessageLog.trace('Error: ' + err); }

    if (!tabsAdded) return;

    //
    ui.mainLayout.addStretch();

    ui.show();

}