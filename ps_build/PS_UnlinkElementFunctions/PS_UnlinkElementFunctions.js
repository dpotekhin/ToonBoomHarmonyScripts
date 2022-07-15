/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_UnlinkElementFunctions :]
[Version: 0.210501 :]

[Description:
This script allows to unlink animation functions and expressions from selected nodes.
:]

[Usage:
* Select nodes in Node View and click the Script button to unlink all animation functions linked to them.

#### Options
* Hold Control key to unlink Bezier functions only
* Hold Shift key to unlink Expressions only
* Hold Alt key to keep current transformation values
:]

*/

function PS_UnlinkElementFunctions() {

    MessageLog.clearLog();

    var n = selection.numberOfNodesSelected();

    if (!n) {
        MessageBox.warning('Please select at least one node to remove its animation functions and expressions.\n\n' +
            'Options:\n' +
            '- Hold Control key to unlink Bezier functions only\n' +
            '- Hold Shift key to unlink Expressions only\n' +
            '- Hold Alt key to keep current transformation values', 0, 0, 0, 'Error');
        return;
    }

    var unlinkBeziers = KeyModifiers.IsControlPressed();
    var unlinkExpressions = KeyModifiers.IsShiftPressed();
    var keepCurrentValues = KeyModifiers.IsAlternatePressed();

    var numberTypes = ['DOUBLEVB', 'DOUBLE', 'INT'];
    var columnFilter = ['DRAWING']; //
    var invertColumnFilter = true;

    if (unlinkBeziers || unlinkExpressions) {

        columnFilter = []; //
        invertColumnFilter = false;

        if (unlinkBeziers) columnFilter.push('BEZIER');
        if (unlinkExpressions) columnFilter.push('EXPR');

        MessageLog.trace('>>> Unlink only: ' + columnFilter);

    } else {
        MessageLog.trace('>>> Unlink all except: ' + columnFilter);
    }

    scene.beginUndoRedoAccum('Unlink Animation Functions');

    try {

        for (i = 0; i < n; ++i) {

            var selNode = selection.selectedNode(i);

            if (node.isGroup(selNode)) {

                var childNodes = node.subNodes(selNode);
                // MessageLog.trace('!! Is GROUP: "'+node.getName(selNode)+'",  children:'+childNodes.length );
                for (gi = 0; gi < childNodes.length; gi++) {
                    unlinkFunctions(childNodes[gi], columnFilter, invertColumnFilter, keepCurrentValues);
                }

            } else {
                unlinkFunctions(selNode, columnFilter, invertColumnFilter, keepCurrentValues);
            }

        }

    } catch (err) {

        MessageLog.trace('Error: ' + err);

    }

    scene.endUndoRedoAccum();

    // MessageLog.trace('<<< Unlink Functions : Ended');

    //
    function unlinkFunctions(_node, _columnTypes, _invertColumnTypes, keepCurrentValues) {

        var nodeNamePath = _node.split("/");
        var nodeName = nodeNamePath[nodeNamePath.length - 1];
        // MessageLog.trace(i+") "+nodeName+", "+nodeNamePath  );

        MessageLog.trace("NODE: " + i + ") " + nodeName + ", [" + node.type(_node) + "]");

        var attrs = getFullAttributeList(_node);
        var isPositionSeparate = node.getTextAttr(_node, 1, 'POSITION.SEPARATE') === 'Y'; //
        var isEnabled3d = node.getTextAttr(_node, 1, 'ENABLE_3D') === 'Y'; //
        var isRotationSeparate = node.getTextAttr(_node, 1, 'ROTATION.SEPARATE') === 'On'; // On = Euler; Off = Quaternion
        // MessageLog.trace("isEnabled3d: "+isEnabled3d);
        // MessageLog.trace("isRotationSeparate: "+isRotationSeparate);

        try {

            attrs.forEach(function(attr) {

                var attrFullName = attr.fullKeyword();
                // MessageLog.trace("ATTR: " + attrFullName+' > '+ node.getTextAttr(_node, 1, attrFullName ) );

                var linkedColumn = node.linkedColumn(_node, attrFullName);
                if (!linkedColumn) return;

                var columnType = column.type(linkedColumn);
                // if (columnType !==E 'QUATERNIONPATH') return; // !!!

                if (_columnTypes) {

                    if (_invertColumnTypes) { // Skip provided column types

                        if (_columnTypes.indexOf(columnType) !== -1) {
                            MessageLog.trace('Skipped');
                            return;
                        }

                    } else { // Skip all except provided column types

                        if (_columnTypes.indexOf(columnType) === -1) {
                            return;
                            MessageLog.trace('Skipped');
                        }

                    }

                }

                // if ( linkedColumn && attrFullName != "DRAWING.ELEMENT" ){
                // MessageLog.trace("-   UNLINK: " + attr.name() + " (" + attrFullName + ")" + " <" + attr.typeName());

                if (isEnabled3d) { // 3d mode enabled

                    if (isRotationSeparate) { // Euler
                        if (columnType === 'QUATERNIONPATH') return;

                    } else { // Quaternion
                        if (attrFullName.indexOf('ROTATION.ANGLE') !== -1) return;

                    }

                }

                var currentValue = column.getEntry(linkedColumn, 0, frame.current());
                if( currentValue === '' ) {
                	node.unlinkAttr(_node, attrFullName);
                	return;
                }

                MessageLog.trace('currentValue: '+ currentValue );

                switch (columnType) {

                    case 'QUATERNIONPATH':

                        currentValue = attr.pos3dValueAt(frame.current());
                        break;

                }
                // MessageLog.trace('--> columnType: "' + columnType + '", ' + attr.name() + " (" + attrFullName + ")" + " <" + attr.typeName() + ">");

                node.unlinkAttr(_node, attrFullName);

                if (keepCurrentValues) {

                    switch (columnType) {

                        case 'QUATERNIONPATH':
                            node.getAttr(_node, frame.current(), 'ROTATION.ANGLEX').setValue(currentValue.x);
                            node.getAttr(_node, frame.current(), 'ROTATION.ANGLEY').setValue(currentValue.y);
                            node.getAttr(_node, frame.current(), 'ROTATION.ANGLEZ').setValue(currentValue.z);
                            break;

                        default:
                            // MessageLog.trace("-   VALUE: " + currentValue);
                            if (numberTypes.indexOf(typeof attr.typeName()) === -1) currentValue = parseFloat(currentValue);
                            // MessageLog.trace('Apply EColumn Value: ' + currentValue + ' > ' + typeof currentValue);
                            attr.setValue(currentValue);
                    }


                }

            });

        } catch (err) { MessageLog.trace('ERR:' + err) }

    }


    //
    function getAttributes(attribute, attributeList) {
        attributeList.push(attribute);
        var subAttrList = attribute.getSubAttributes();
        for (var j = 0; j < subAttrList.length; ++j) {
            if (typeof(subAttrList[j].keyword()) === 'undefined' || subAttrList[j].keyword().length == 0)
                continue;
            getAttributes(subAttrList[j], attributeList);
        }
    }


    //
    function getFullAttributeList(nodePath) {
        var attributeList = [];
        var topAttributeList = node.getAttrList(nodePath, 1);
        for (var i = 0; i < topAttributeList.length; ++i) {
            getAttributes(topAttributeList[i], attributeList);
        }
        return attributeList;
    }

}