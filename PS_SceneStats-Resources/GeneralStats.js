/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220713
*/

//
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
exports = function(selectedNodes, modal, storage, contentMaxHeight) {

    // Collect Data
    var scenePath = fileMapper.toNativePath(scene.currentProjectPath() + '/' + scene.currentVersionName() + '.xstage');
    MessageLog.trace('scenePath: ' + scenePath);

    var sceneIsTemplate = false;

    var file = new QFile(scenePath);
    // MessageLog.trace('>>> '+file.open( QIODevice.ReadOnly ) );
    if (!file.open(QIODevice.ReadOnly)) {
        MessageLog.trace("Error while scene file parsing");
        return false;
    }

    var xml = new QXmlStreamReader(file);
    while (!xml.atEnd() && !xml.hasError()) {
        var token = xml.readNextStartElement();
        switch (xml.name()) {

            case 'project':
                break;

            case 'timeline':
                break;

            case 'actionTemplate':
                sceneIsTemplate = true;
                break;

            default:
                xml.skipCurrentElement();

        }

    }

    var drawingElements = [];
    var drawingSubstitutions = 0;
    var usedDrawingSubstitutions = 0;
    
    storage.getAllChildNodes(selectedNodes, 'READ').forEach(function(nodeData) {
        if (drawingElements.indexOf(nodeData.elementId) !== -1) return;
        drawingElements.push(nodeData.elementId);
        drawingSubstitutions += nodeData.drawingTimings.length;
        usedDrawingSubstitutions += nodeData.usedDrawingTimings.length;
    });

    


    // Generate the Table
    var items = [

        {
            key: "Scene is Template",
            value: sceneIsTemplate ? 'Yes' : 'No',
            bg: sceneIsTemplate ? storage.bgSuccess : storage.bgYellow,
        },

        {
            key: "Drawings",
            value: storage.getAllChildNodes(selectedNodes, 'READ').length,
        },

        {
            key: "Used Drawing Elements",
            value: drawingElements.length,
        },

        {
            key: "Total Drawing Substitutions",
            value: drawingSubstitutions,
        },

        {
            key: "Used Drawing Substitutions",
            value: usedDrawingSubstitutions,
        },

        {
            key: "Pegs",
            value: storage.getAllChildNodes(selectedNodes, 'PEG').length,
        },

        {
            key: "Composites",
            value: storage.getAllChildNodes(selectedNodes, 'COMPOSITE').length,
        },

        {
            key: "Cutters",
            value: storage.getAllChildNodes(selectedNodes, 'CUTTER').length,
        },

        {
            key: "MC",
            value: storage.getAllChildNodes(selectedNodes, 'MasterController').length,
        }

    ]

    // Group
    var style = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
    // var uiGroup = modal.addGroup( 'DRAWINGS ('+items.length+')', modal.ui, true, style );

    var mainGroup = modal.addGroup('', undefined, false, true);

    modal.addButton('Toggle Performance Report', mainGroup, 150, 30, '', function() {
        preferences.setBool('ADVANCED_ENABLE_PERFORMANCE_REPORT', !preferences.getBool('ADVANCED_ENABLE_PERFORMANCE_REPORT', true));
    });

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

    ], mainGroup, contentMaxHeight - 40);
    tableView.maximumWidth = 260;

    // 

    return mainGroup;

}