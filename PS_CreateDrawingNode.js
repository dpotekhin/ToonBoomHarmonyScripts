/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220805


Options:
- Hold down the Alt key to connect the created Drawing to the back of the linked Composite.
- Hold down the Shift key to place the created Drawing on the left of the selected target node.
- Hold down the Control key to copy Graphics from the selected Drawing

*/


function PS_CreateDrawingNode() {

    try {

        var _view = view.currentView();
        var _type = view.type(_view);
        // MessageLog.trace('_view:'+_view+', ['+_type+']');
        if (_type !== 'Node View') {
            MessageBox.information('Node View must be active.', 0, 0, 0);
            return;
        }

        var _group = view.group(_view);
        // MessageLog.trace('_group:'+_group+' > ');

        // Determine position of the new node
        var _selection = selection.selectedNodes();
        if (!_selection || !_selection[0]) {
            MessageBox.warning(
                'Please select a node for a position for the new Drawing creation.' +
                '\nOptions:\n' +
                '\n- Hold down the Alt key to connect the created Drawing to the back of the linked Composite.' +
                '\n- Hold down the Shift key to place the created Drawing on the left of the selected target node.', 0, 0, 0, 'Error');
            return;
        }
        /*
        if( !_selection || !_selection.length ) _selection = node.subNodes( _group );
        var bounds = {x0:Number.MAX_VALUE,y0:Number.MAX_VALUE,x1:-Number.MAX_VALUE,y1:-Number.MAX_VALUE};
        /*
        _selection.forEach(function(_n){
            MessageLog.trace( node.type(_n) );
            var x = node.coordX(_n);
            var y = node.coordY(_n);
            if( x < bounds.x0 ) bounds.x0 = x;
            if( x > bounds.x1 ) bounds.x1 = x;
            if( y < bounds.y0 ) bounds.y0 = y;
            if( y > bounds.y1 ) bounds.y1 = y;
        });
        var posX = (bounds.x1 - bounds.x0)/2 + bounds.x0;
        var posY = (bounds.y1 - bounds.y0)/2 + bounds.y0;
        */

        if (!_selection) {
            MessageBox.information('Selection required.', 0, 0, 0);
            return;
        }

        var xNodeOffset = 50;
        var pegTopOffset = 80;

        var linkToCompOnBack = KeyModifiers.IsAlternatePressed();
        var placeOnLeftOfTarget = KeyModifiers.IsShiftPressed();
        var cloneSelectedDrawingGraphics = KeyModifiers.IsControlPressed();

        var _selectedNode = _selection[0];
        var selectedNodeIsDrawing = node.type(_selectedNode) === 'READ';
        var newName = selectedNodeIsDrawing ? _getUnusedName(_selectedNode, true) : 'Drawing';

        var _name = Input.getText('Drawing Name', newName);
        if (!_name) return;
        _name = _name.trim();
        name = _name.replace(/[\u0250-\ue007]/g, '');

        // MessageLog.trace("Name: ["+_name+'] => ['+name+']');

        if (!name || _name.length !== name.length) {
            MessageBox.information('Invalid Drawing name: "' + _name + '"', 0, 0, 0, 'Error');
            return;
        }

        ///
        scene.beginUndoRedoAccum('Add Drawing');

        var drawingNode = node.add(_group, name, 'READ', 0, 0, 0);
        if (!drawingNode) {
            scene.cancelUndoRedoAccum();
            return;
        }

        var posX = placeOnLeftOfTarget ? node.coordX(_selectedNode) + node.width(_selectedNode) + xNodeOffset : node.coordX(_selectedNode) - node.width(drawingNode) - xNodeOffset;
        var posY = node.coordY(_selectedNode) - (node.type(_selectedNode) === 'COMPOSITE' ? 100 : 0);
        node.setCoord(drawingNode, posX, posY);

        // Switch off the Animate Using Animation Tools flag
        node.getAttr(drawingNode, 1, 'CAN_ANIMATE').setValue(false);
        // Set up the Separate flags
        node.getAttr(drawingNode, 1, 'OFFSET.SEPARATE').setValue(true);
        node.getAttr(drawingNode, 1, 'SCALE.SEPARATE').setValue(true);

        var columnName = _getAvailableColumnName(drawingNode.split('/').pop());
        if (!columnName) {
            scene.endUndoRedoAccum();
            return;
        }

        // MessageLog.trace( 'Created: '+drawingNode+', ['+columnName+']' );

        var elementId = element.add(columnName, "COLOR", 12, "SCAN", "TVG");
        column.add(columnName, "DRAWING");

        column.setElementIdOfDrawing(columnName, elementId);

        node.linkAttr(drawingNode, "DRAWING.ELEMENT", columnName);

        // Create a Drawing
        var exposure = 'Default';

        _selectNodes(drawingNode);

        Tools.createDrawing();
        column.renameDrawing(columnName, column.getDrawingTimings(columnName).shift(), exposure);

        // Drawing.create(elementId, exposure, true);
        column.setEntry(columnName, 1, 1, exposure);
        column.fillEmptyCels(columnName, 1, frame.numberOf() + 1);
        column.update();

        if (cloneSelectedDrawingGraphics && selectedNodeIsDrawing) { // Copy graphics from the selected drawing to the created one
            var _query = {
                // drawing: { elementId: node.getElementId(_selectedNode), exposure: column.getEntry(node.linkedColumn(_selectedNode, 'DRAWING.ELEMENT'), frame.current(), 1) }
                drawing: {node: _selectedNode, frame: frame.current() }
            };
            var drData = Drawing.query.getData(_query);
            // MessageLog.trace('?? '+_selectedNode+'\n'+node.linkedColumn(_selectedNode, 'DRAWING.ELEMENT')+'\n'+JSON.stringify(_query,true,'  ')+'\n----\n'+JSON.stringify(drData,true,'  '));

            if (drData.arts) drData.arts.forEach(function(artData) {

                artData.layers.forEach(function(layerData) { // Fix stroke color id
                    if (layerData.strokes) layerData.strokes.forEach(function(strokeData) { // Fix stroke color id
                        if (!strokeData.pencilColorId) strokeData.pencilColorId = strokeData.colorId;
                    });
                });

                DrawingTools.createLayers({
                    label: "",
                    drawing: { elementId: elementId, exposure: exposure },
                    art: artData.art,
                    layers: artData.layers,
                });
            });

        }

        // Add a Peg
        var pegNode = node.add(_group, name + '-P', 'PEG', posX, posY - pegTopOffset, 0);
        node.link(pegNode, 0, drawingNode, 0);


        // Connect to a Composition
        var targetCompose = _getLinkedComposite(_selectedNode);
        // MessageLog.trace('targetCompose: '+targetCompose);
        if (targetCompose) {
            var targetComposeNumInput = linkToCompOnBack ? 0 : node.numberOfInputPorts(targetCompose);
            node.link(drawingNode, 0, targetCompose, targetComposeNumInput);
        }

        // Select the created nodes
        _selectNodes([pegNode, drawingNode]);

    } catch (err) { MessageLog.trace('err: ' + err); }

    ///
    scene.endUndoRedoAccum();

    //
    function _selectNodes(nodes) {
        selection.clearSelection();
        if (!nodes) return;
        if (typeof nodes === 'string') nodes = [nodes];
        selection.addNodesToSelection(nodes);
    }

    //
    function _getAvailableColumnName(_name) {
        if (_checkColumnName(_name)) return _name;
        for (var i = 1; i < 100; i++) {
            var __name = _name + '_' + i;
            if (_checkColumnName(__name)) return __name;
        }
    }

    function _checkColumnName(_name) {
        var type = column.type(_name);
        // MessageLog.trace('_checkColumnName: '+_name+', '+type);
        return !type;
    }

    function _getLinkedComposite(_node) {

        if (node.type(_node) === 'COMPOSITE') return _node;

        var numOutput = node.numberOfOutputPorts(_node);
        // MessageLog.trace(_node+': '+numOutput);
        for (var o = 0; o < numOutput; o++) {
            var numOutputLinks = node.numberOfOutputLinks(_node, o);
            var destNodes = [];
            for (var op = 0; op < numOutputLinks; op++) {
                var destNode = node.dstNodeInfo(_node, o, op).node;
                var nodeType = node.type(destNode);
                if (nodeType == 'COMPOSITE') return destNode;
                destNodes.push(destNode);
                // MessageLog.trace(o+') '+op+') '+destNode+' > '+nodeType );
            }

            for (var i = 0; i < destNodes.length; i++) {
                var targetNode = _getLinkedComposite(destNodes[i]);
                if (targetNode) return targetNode;
            }
        }

    }

    //
    //
    function _getUnusedName(_node, nameOnly) {

        if (!node.type(_node)) return nameOnly ? _node.split('/').pop() : _node;

        var _newName;
        var renameTries = 0;
        var nameIsUnused = false;

        do { // Rename until success omitting existing names
            renameTries++;
            _newName = _node + '_' + renameTries;
            if (!node.type(_newName)) nameIsUnused = true;

        } while (!nameIsUnused && renameTries < 200)

        if (!nameIsUnused) return;
        return nameOnly ? _newName.split('/').pop() : _newName;

    }

}