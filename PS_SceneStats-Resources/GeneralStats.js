/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220630
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function(selectedNodes, modal, lib, contentMaxHeight) {

    // Collect Data
    var scenePath = fileMapper.toNativePath(scene.currentProjectPath() + '/' + scene.currentVersionName() + '.xstage');
    MessageLog.trace('scenePath: ' + scenePath);

    var sceneIsTemplate = false;

    var file = new QFile(scenePath);
    // MessageLog.trace('>>> '+file.open( QIODevice.ReadOnly ) );
    if (!file.open(QIODevice.ReadOnly)){
        MessageLog.trace("Error while scene file parsing");
        return false;
    }

    var xml = new QXmlStreamReader(file);
    while (!xml.atEnd() && !xml.hasError()) {
        var token = xml.readNextStartElement();
        switch (xml.name()) {

            case 'project': break;

            case 'timeline': break;

            case 'actionTemplate': sceneIsTemplate = true; break;

            default:
                xml.skipCurrentElement();

        }

    }

    // Generate the Table
    var items = [

        {
            key: "Scene is Template",
            value: sceneIsTemplate ? 'Yes' : 'No',
            bg: sceneIsTemplate ? lib.bgSuccess : lib.bgYellow,
        },

        {
            key: "Cutters",
            value: NodeUtils.getAllChildNodes(selectedNodes, 'CUTTER').length,
        }

    ]

    // Group
    var style = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
    // var uiGroup = modal.addGroup( 'DRAWINGS ('+items.length+')', modal.ui, true, style );

    //
    var tableView = new TableView(items, [

        {
            header: "Key",
            key: "key",
        },

        {
            header: "Value",
            key: "value",
            getBg: function(v, data) { return data.bg !== undefined ? data.bg : ''; }
        }

    ], undefined, contentMaxHeight);

    return tableView;

}