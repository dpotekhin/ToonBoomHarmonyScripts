/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220714
*/

//
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SceneStats-Resources/ps/TableView.js"));

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
        drawingSubstitutions += nodeData.drawingSubstitutions.length;
        usedDrawingSubstitutions += nodeData.usedDrawingSubstitutions.length;
    });


    // Main Group
    var mainGroup = modal.addGroup('', undefined, false, true);

    // Buttons
    var buttonsGroup = modal.addGroup('', mainGroup, true, true);


    // Toggle Performance Report
    modal.addButton('Toggle Performance Report', buttonsGroup, 150, 30, '', function() {
        preferences.setBool('ADVANCED_ENABLE_PERFORMANCE_REPORT', !preferences.getBool('ADVANCED_ENABLE_PERFORMANCE_REPORT', true));
    });


    // Test Render
    var testRenderButton = modal.addButton('Test Render', buttonsGroup, 150, 30, '', function() {

        var tempDisplayNode = node.add(
            node.parentNode(storage.topSelectedNode),
            '__TempDisplay_' + Date.now(),
            'DISPLAY',
            node.coordX(storage.topSelectedNode) + node.width(storage.topSelectedNode) * .6,
            node.coordY(storage.topSelectedNode) + 80,
            0
        );
        node.link(storage.topSelectedNode, 0, tempDisplayNode, 0);

        //
        function frameReady(frame, celImage) {
            // celImage.imageFile("c:/tmp/myimage" + frame + ".png");
        }

        function renderFinished() {
            // MessageBox.information("Render Finished");
        }

        render.renderFinished.connect(renderFinished);
        render.frameReady.connect(frameReady);

        render.setRenderDisplay(tempDisplayNode);
        render.setWhiteBackground(true);
        var currentFrame = frame.current();

        testRenderButton.text = 'Render ' + currentFrame + 'f in progress...'
        var startTime = Date.now();
        render.renderScene(currentFrame, currentFrame);
        var renderTime = (Date.now() - startTime) / 1000;
        testRenderButton.text = 'Test Render: ' + renderTime.toFixed(2) + 's';

        render.renderFinished.disconnect(renderFinished);
        render.frameReady.disconnect(frameReady);

        node.deleteNode(tempDisplayNode);

    });


    // Show Drawing Substitutions Tab Button
    var showDrawingSubstitutionsTabButton = modal.addButton('Show Drawing Substitutions Tab', buttonsGroup, 170, 30, '', function() {
        showDrawingSubstitutionsTabButton.enabled = false;
        storage.showDrawingSubstitutionStatsTab();
    });


    buttonsGroup.mainLayout.addStretch();




    /// Tables
    var tablesGroup = modal.addGroup('', mainGroup, true, true);

    //
    // Table #1
    var items = [

        {
            key: "Scene is Template",
            value: sceneIsTemplate ? 'Yes' : 'No',
            bg: sceneIsTemplate ? storage.bgSuccess : storage.bgYellow,
        },

        {
            key: "Total Nodes",
            value: Object.keys(storage.nodes).length,
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

    ]

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

    ], tablesGroup, contentMaxHeight - 40);
    tableView.maximumWidth = 212;


    // Table #2
    var items = Object.keys(storage.nodesByType)
        .sort()
        .map(function(typeName, i) {
            var nodeList = storage.nodesByType[typeName];
            return {
                key: (typeName.match(/[A-Z][a-z]+/g) || [typeName]).join('_').split('_').map(function(vv) { return vv.charAt(0).toUpperCase() + vv.substring(1).toLowerCase() }).join(' '),
                value: nodeList.length,
                nodes: nodeList,
                currentIndex: undefined,
                itemIndex: i
            }
        });

    var tableView = new TableView(items, [

        {
            header: "Node Type",
            key: "key",
        },

        {
            header: "Total",
            key: "value",
            getBg: function(v, data) { return data.bg !== undefined ? data.bg : ''; }
        },

        {
            header: "Prev",
            // value: '<-',
            icon: storage.ICONS_PATH + 'l-arrow.png',
            onClick: function(data) {

                if (data.currentIndex === undefined) data.currentIndex = -1;
                data.currentIndex++;
                if (data.currentIndex >= data.nodes.length) data.currentIndex = 0;
                // MessageLog.trace(data.currentIndex + ' > ' + JSON.stringify(data.nodes[data.currentIndex], true, ''));
                storage.defaultCellClick(data.nodes[data.currentIndex].node);
            }
        },

        {
            header: "Next",
            // value: '->',
            icon: storage.ICONS_PATH + 'r-arrow.png',
            onClick: function(data) {
                if (data.currentIndex === undefined) data.currentIndex = 1;
                data.currentIndex--;
                if (data.currentIndex < 0) data.currentIndex = data.nodes.length - 1;
                // MessageLog.trace(data.currentIndex + ' > ' + JSON.stringify(data.nodes[data.currentIndex], true, ''));
                storage.defaultCellClick(data.nodes[data.currentIndex]);

            }
        },

    ], tablesGroup, contentMaxHeight - 40);
    tableView.minimumWidth = tableView.maximumWidth = 340;


    tablesGroup.mainLayout.addStretch();

    //
    return mainGroup;

}