/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_ResetTransformation :]
[Version: 0.220615 :]

[Description:
Three scripts to universal (pegs and deformers) reset of transformations, save transformation state and remove that state.
:]

[Usage:
### 1) PS_ResetTransformation
Resets transformation of selected Pegs, Drawings and Deformation nodes to their saved (via PS_SaveTransformation script) or default state with options:
- Resets all transformations - Position, Rotation and Scale by default
- Hold the Shift key to reset only the Position of the selected node
- Hold the Control key to reset only the Scale of the selected node
- Hold the Alt key to reset only the Rotation of the selected node
- Hold the Shift + Control + Alt keys to reset all transformations of child elements

### 2) PS_SaveTransformation
Saves current transformation of selected Pegs, Drawings and Deformation nodes to their custom attributes as the Default state with options:
- Saves all transformations - Position, Rotation and Scale by default
- Hold the Shift key to save only the Position of the selected node
- Hold the Control key to save only the Scale of the selected node
- Hold the Alt key to save only the Rotation of the selected node

### 3) PS_ClearSavedTransformationСC
Removes custom attributes with the Default state of transformation of selected Pegs, Drawings and Deformation nodes with options:
- Clears all saved transformations - Position, Rotation and Scale by default
- Hold the Shift key to clear only the saved Position of the selected node
- Hold the Control key to clear only the saved Scale of the selected node
- Hold the Alt key to clear only the saved Rotation of the selected node
:]

*/





var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));

//
function _getCommonData() {

    var selectedNodes = selection.selectedNodes();
    if (!selectedNodes || !selectedNodes.length) {
        return;
    }

    // MessageLog.trace( node.getTextAttr(selectedNodes[0],frame.current(),'ROTATION.X') );
    // var attr =  node.getAttr(selectedNodes[0],frame.current(),'ROTATION.QUATERNIONPATH');
    // var attr =  node.getAttr(selectedNodes[0],frame.current(),'ROTATION.QUATERNIONPATH.X');
    // MessageLog.trace( attr.intValue() );

    // Utils.getFullAttributeList(selectedNodes[0],frame.current()).forEach(function(attr){
    // 	MessageLog.trace(  attr.keyword()+' > '+attr.typeName(), attr.textValueAt(frame.current()) );	
    // });


    var attr = node.getAttr(selectedNodes[0], frame.current(), 'ROTATION.QUATERNIONPATH');
    // MessageLog.trace( Object.keys(attr).join('\n'));
    // MessageLog.trace( attr.doubleValueAt(frame.current()) );
    // MessageLog.trace( attr.getSubAttributes() );
    // return;

    var usePosition = KeyModifiers.IsShiftPressed();
    var useScale = KeyModifiers.IsControlPressed();
    var useRotation = KeyModifiers.IsAlternatePressed();

    //
    var nodeTemplates = {
        'PEG,READ': {
            position: [
                'POSITION.X', 0, 'POSITION.Y', 0, 'POSITION.Z', 0,
                'POSITION.3DPATH', 0,
                'OFFSET.X', 0, 'OFFSET.Y', 0, 'OFFSET.Z', 0
            ],
            rotation: [
                'ROTATION.ANGLEX', 0, 'ROTATION.ANGLEY', 0, 'ROTATION.ANGLEZ', 0,
                'ROTATION.QUATERNIONPATH', 0,
                'ANGLE', 0, 'SKEW', 0
            ],
            scale: [
                'SCALE.X', 1, 'SCALE.Y', 1, 'SCALE.Z', 1,
                'SCALE.XY', 1
            ]
        },
        'OffsetModule,CurveModule': {
            position: ['offset.X', 'restingOffset.X', 'offset.Y', 'restingOffset.Y'],
            rotation: [
                'orientation', 'restingOrientation',
                'orientation1', 'restingOrientation1',
                'orientation0', 'restingOrientation0',
            ],
            scale: [
                'length1', 'restLength1',
                'length0', 'restLength0'
            ]
        },
        'BendyBoneModule': {
            position: ['offset.X', 'restOffset.X', 'offset.Y', 'restOffset.Y'],
            rotation: [
                'orientation', 'restOrientation',
                'radius', 'restRadius', 'bias', 'restBias'
            ],
            scale: ['length', 'restLength']
        }
    };

    var nodeTemplatesByNodeName = {};
    var nodeTypes = [];
    Object.keys(nodeTemplates).forEach(function(_nodeName) {
        _nodeName.split(',').forEach(function(__nodeName) {
            nodeTypes.push(__nodeName);
            nodeTemplatesByNodeName[__nodeName] = nodeTemplates[_nodeName];
        });
    });


    //
    if (usePosition && useScale && useRotation) {
        selectedNodes = NodeUtils.getAllChildNodes(selectedNodes, nodeTypes.join('|'));
        MessageLog.trace('Reset all children:\n' + selectedNodes.join('\n'));
    }

    // get content of groups
    var nodeList = [];
    selectedNodes.forEach(function(_node) {
        // if (node.type(_node) !== 'GROUP') { nodeList.push(_node); } // else nodeList = nodeList.concat(node.subNodes(_node));
        if( nodeTypes.indexOf(node.type(_node)) !== -1 ) nodeList.push(_node);
    });

    //
    function getOutputNode(_node) {
        var numOutput = node.numberOfOutputPorts(_node);
        var listOfDestinationNodes = [];
        for (var i = 0; i < numOutput; i++)
            listOfDestinationNodes.push(node.dstNode(_node, i, 0));
        return listOfDestinationNodes[0];
    }

    //
    function getNodeAttr(_node, attrName, currentFrame, createIfNotExist, returnNodeAndAttr) {

        var modifier = attrName.charAt(0);
        
        var result = {
    		node: _node,
    		attrName: attrName,
    		attr: node.getAttr(_node, currentFrame, attrName),
        	isValid: false,
        	isModified: false
        };
/*
        if (modifier === '>') { // reset next node
            var nextNode = getOutputNode(_node);
            if (!nextNode) {
                MessageLog.trace('Next node of the "' + _node + '" not found.');
                return;
            }
            attrName = result.attrName = attrName.substr(1, attrName.length);
            MessageLog.trace('Get an attribute of the next node of "'+_node+'" > '+nextNode+' >> "'+attrName+'"' );
            _node = result.node = nextNode;
            result.isModified = true;
        }
*/
        var attr = result.attr = node.getAttr( result.node, currentFrame, result.attrName);

        if (!attr || attr.keyword() === ''){

	        if( createIfNotExist ) {

	            if ( node.createDynamicAttr(_node, "DOUBLE", attrName, '', false) ) {

	                var attr = node.getAttr(_node, currentFrame, attrName);
	                attr.setValue( result.attr.doubleValueAt( currentFrame ) );
	                result.attr = attr;
	                result.isValid = true;
	                MessageLog.trace('Dynamic attribute added: "' + attrName+'"');

	            } else {

	                MessageLog.trace('Dynamic attribute NOT added: "' + attrName+'"');
	                return;
	            }

	        }else{

		        // MessageLog.trace('Attribute NOT found: "' + attrName+'" in node "'+result.node+'" ('+_node+')' );
		        return;

		    }

        }

    	result.val = result.attr.doubleValue();
    	result.valAtFrame = result.attr.doubleValueAt( currentFrame );
    	result.isValid = true;
		result.columnName = node.linkedColumn( result.node, result.attrName );
		// MessageLog.trace( '#### '+node.getTextAttr(result.node, currentFrame, result.attrName ) );
        return returnNodeAndAttr ? result : attr;

    }

    //
    function eachNode(_commonData, nodeAction, onNodeComplete) {

        _commonData.nodeList.forEach(function(_node) {

            var nodeType = node.type(_node);

            var nodeAttrSettings = _commonData.nodeTemplates[nodeType];
            if (!nodeAttrSettings) {
                MessageLog.trace('Custom attribute settings not found for node "' + _node + '" (' + nodeType + ')');
                return;
            }

            if (_commonData.useAll || _commonData.usePosition) nodeAction(_node, nodeAttrSettings.position);
            if (_commonData.useAll || _commonData.useRotation) nodeAction(_node, nodeAttrSettings.rotation);
            if (_commonData.useAll || _commonData.useScale) nodeAction(_node, nodeAttrSettings.scale);

            if (onNodeComplete) onNodeComplete(_node, nodeType);

        });

    }

    //
    function getCustomAttrName(attrName) {
        attrName = attrName.replace('>', '');
        return '_PS_OST_' + attrName; // an original attribute name with the state prefix
    }


    //
    return {
        nodeList: nodeList,
        nodeTemplates: nodeTemplatesByNodeName,
        getNodeAttr: getNodeAttr,
        eachNode: eachNode,
        getCustomAttrName: getCustomAttrName,
        currentFrame: frame.current(),
        usePosition: usePosition,
        useScale: useScale,
        useRotation: useRotation,
        useAll: !(usePosition || useRotation || useScale)
    };

}



//
function PS_ResetTransformation() {

    MessageLog.clearLog();

    var _commonData = _getCommonData();
    if (!_commonData) {
        MessageBox.information('Select at least one node (Peg, Drawing and Deformation) to reset its transformations to their saved (via PS_SaveTransformation script) or default state with options:' +
            '\n- Resets all transformations - Position, Rotation and Scale by default' +
            '\n- Hold the Shift key to reset only the Position of the selected node' +
            '\n- Hold the Control key to reset only the Scale of the selected node' +
            '\n- Hold the Alt key to reset only the Rotation of the selected node' +
            '\n- Hold the Shift + Control + Alt keys to reset all transformations of child elements', 0, 0, 0);
        return;
    }

    //
    function setAttrValues(_node, attrList) {
    	try{
        for (var i = 0; i < attrList.length; i += 2) {

            var attrName = attrList[i];
            // if( attrName.indexOf('length0') === -1 ) continue; // !!!
            var val = attrList[i + 1]; // 
            // var _val = val;

            var currentAttrObject = _commonData.getNodeAttr( _node, attrName, _commonData.currentFrame, false, true );
            if( !currentAttrObject ) continue;
            // MessageLog.trace( '>>>>>> : '+ _node+', '+attrName );
            // MessageLog.trace( '\n\currentAttrObject: '+JSON.stringify(currentAttrObject,true,'  '));

            var srcAttrObject = _commonData.getNodeAttr( currentAttrObject.node, _commonData.getCustomAttrName(currentAttrObject.attrName), _commonData.currentFrame, false, true );

            if (typeof val === 'string') { // the value is a name of an another node attribute
            	
            	if( !srcAttrObject )
            		srcAttrObject = _commonData.getNodeAttr( currentAttrObject.node, val, _commonData.currentFrame, false, true );
            	// MessageLog.trace( '\n\nsrcAttrObject: '+JSON.stringify(srcAttrObject,true,'  '));
            	if( !srcAttrObject ) continue;
            	currentAttrObject.val = srcAttrObject.val;
            	currentAttrObject.valAtFrame = srcAttrObject.valAtFrame;
            	// currentAttrObject = srcAttrObject;
			}else{

				currentAttrObject.valAtFrame = currentAttrObject.val = srcAttrObject ? srcAttrObject.val : val;

			}

			if( currentAttrObject.columnName ){ // If Attr is animated set value at current frame
	            currentAttrObject.attr.setValueAt( currentAttrObject.val, _commonData.currentFrame );
				// MessageLog.trace('Apply value to "'+currentAttrObject.attrName+'" '+currentAttrObject.val+' at the current frame.' );

	        }else{

				currentAttrObject.attr.setValue( currentAttrObject.val );
				// MessageLog.trace('Apply value to "'+currentAttrObject.attrName+'" '+currentAttrObject.val );
	        }

            /*
            if (typeof val === 'string') { // the value is a name of an another node attribute

                attrObject = _commonData.getNodeAttr( _node, val, _commonData.currentFrame, false, true );
                if (!attrObject) {
                    MessageLog.trace('Referenced attribute not found "' + val + '"');
                    continue;
                }
                val = attrObject.attr.doubleValueAt(_commonData.currentFrame);
                MessageLog.trace('Reset the next Node attr: "'+attrObject.node+'", "'+attrObject.attrName+'", '+val);

            }
            */

            // if ( columnName ) { // If Attr is animated set value at current frame

            // 	MessageLog.trace('Reset column attr "' + attrName);
            //     attrObject.attr.setValueAt( val, _commonData.currentFrame );

            // } else {

            // 	attrObject.attr.setValue( val );
            // }

            /*
            // Custom attr
            var customAttributeName = _commonData.getCustomAttrName(attrName);
            var custAttrObject = _commonData.getNodeAttr( _node, customAttributeName, _commonData.currentFrame, false, true );
            if (custAttrObject && custAttrObject.attr.keyword()) {
                val = custAttrObject.attr.doubleValue();
                MessageLog.trace('Dynamic Attr "' + customAttributeName + '" = ' + val);
            }

            var columnName = node.linkedColumn( custAttrObject.node, attrName);
            MessageLog.trace('NODE: "'+custAttrObject.node.split('/').pop()+'"' );
            MessageLog.trace(' - attr: "'+attrName+'"');
            MessageLog.trace(' - column: "'+columnName+'"');
            MessageLog.trace(' - val: "'+val+'"');
            if ( columnName ) { // If Attr is animated set value at current frame

            	MessageLog.trace('Reset column attr "' + attrName);
                custAttrObject.attr.setValueAt( val, _commonData.currentFrame );

            } else {

            	custAttrObject.attr.setValue( val );
            }

            
            // 3d Path attribute
            if (attrName.indexOf("3DPATH") !== -1 || attrName.indexOf("QUATERNIONPATH") !== -1) { // TODO: reset 3d path values to custom values

               
                if ( columnName ) { // If Attr is animated set value at current frame

                    MessageLog.trace('Reset column attr "' + attrName);
                    column.setEntry(columnName, 1, _commonData.currentFrame, 0);
                    column.setEntry(columnName, 2, _commonData.currentFrame, 0);
                    column.setEntry(columnName, 3, _commonData.currentFrame, 0);
                    column.setEntry(columnName, 4, _commonData.currentFrame, 0);

                }else{

                	node.getAttr( custAttrObject.node, _commonData.currentFrame, 'ROTATION.ANGLEX' ).setValue( 0 );
                    node.getAttr( custAttrObject.node, _commonData.currentFrame, 'ROTATION.ANGLEY' ).setValue( 0 );
                    node.getAttr( custAttrObject.node, _commonData.currentFrame, 'ROTATION.ANGLEZ' ).setValue( 0 );
                }

            } else { // Standard attr

                // var attrObject = _commonData.getNodeAttr(custAttrObject.node, attrName, _commonData.currentFrame, false, true );
                // if (!attrObject) {
                //     MessageLog.trace('Attribute not found "' + attrName + '"');
                //     continue;
                // }

                if ( columnName ) { // If Attr is animated set value at current frame

                	MessageLog.trace('Reset column attr "' + attrName);
                    attrObject.attr.setValueAt( val, _commonData.currentFrame );

                } else {

                	attrObject.attr.setValue( val );
                }

            }

            // MessageLog.trace( attrName+' => '+val+' ('+_val+') = '+attr.doubleValueAt( _commonData.currentFrame ) );
			*/
        }
    }catch(err){MessageLog.trace('ERR3:'+err)}

    }


    ///
    scene.beginUndoRedoAccum('ResetTransformation');


    _commonData.eachNode(_commonData, setAttrValues,
        function(_node, nodeType) {
            /*
            MessageLog.trace('reset node transform: '+ _node+' > '+ nodeType );
            var _attrs = Utils.getFullAttributeList( _node, _commonData.currentFrame, true );
            MessageLog.trace('attrs: '+ _attrs.join('\n') );
            MessageLog.trace('>>> '+node.getTextAttr(_node,_commonData.currentFrame,'POSITION.3DPATH.X'));

            try{
            	var attrs = Utils.getFullAttributeList(_node, _commonData.currentFrame, false );
            // MessageLog.trace('>>> '+attr.attr.getSubAttributes().map(function(u,i){return u.keyword()+'='+i}).join('\n') );
            	attrs.forEach(function(u){
            		if( u.typeName() !== 'PATH_3D') return;
            		MessageLog.trace('==> '+u.keyword ()+' > '+u.typeName()+' >> '+u.hasSubAttributes() );
            		
            	})
            }catch(err){MessageLog.trace(err);}
            */
        }
    );


    ///
    scene.endUndoRedoAccum();

}










//
function PS_SaveTransformation() {

    MessageLog.clearLog();

    var _commonData = _getCommonData();
    if (!_commonData) return;

    //
    function setCustomAttrValues(_node, attrList) {

        for (var i = 0; i < attrList.length; i += 2) {

            var attrName = attrList[i];
            var currentAttrObject = _commonData.getNodeAttr(_node, attrName, _commonData.currentFrame, false, true );
            // MessageLog.trace( '\n\rcurrentAttrObject: '+JSON.stringify(currentAttrObject,true,'  '));

            if (!currentAttrObject) {
                // MessageLog.trace('Attribute not found "' + attrName + '"');
                continue;
            }

            var customAttrObject = _commonData.getNodeAttr(currentAttrObject.node, _commonData.getCustomAttrName(currentAttrObject.attrName), _commonData.currentFrame, true, true );
            // MessageLog.trace( '\n\rcustomAttrObject: '+JSON.stringify(customAttrObject,true,'  '));

            if (customAttrObject) {
                customAttrObject.attr.setValueAt( currentAttrObject.valAtFrame, _commonData.currentFrame );
                MessageLog.trace('Dynamic Attribute added "' + customAttrObject.attrName + '" set: ' + currentAttrObject.valAtFrame );
            }

            
        }

    }

    ///
    scene.beginUndoRedoAccum('SaveTransformation');

    _commonData.eachNode(_commonData, setCustomAttrValues,
        function(_node, nodeType) {
            MessageLog.trace('Save node transform: ' + _node + ' > ' + nodeType);

            // var _attrs = Utils.getFullAttributeList( _node, _commonData.currentFrame, true );
            // MessageLog.trace('attrs: '+ _attrs.join('\n') );
        }
    );

    ///
    scene.endUndoRedoAccum();

}










//
function PS_ClearSavedTransformation() {

    // MessageLog.clearLog();

    var _commonData = _getCommonData();
    if (!_commonData) return;

    

    //
    function removeCustomAttr(_node, attrList) {

    	try{
        for (var i = 0; i < attrList.length; i += 2) {

            var attrName = attrList[i];

            var currentAttrObject = _commonData.getNodeAttr(_node, attrName, _commonData.currentFrame, false, true );
            // MessageLog.trace( '\n\rcurrentAttrObject: '+JSON.stringify(currentAttrObject,true,'  '));

            if (!currentAttrObject) {
                // MessageLog.trace('Attribute not found "' + attrName + '"');
                continue;
            }

            var customAttrObject = _commonData.getNodeAttr(currentAttrObject.node, _commonData.getCustomAttrName(currentAttrObject.attrName), _commonData.currentFrame, false, true);
            // MessageLog.trace( '\n\rcustomAttrObject: '+JSON.stringify(customAttrObject,true,'  '));

            if (customAttrObject) {
                node.removeDynamicAttr(customAttrObject.node, customAttrObject.attrName );
                MessageLog.trace('Dynamic Attr "' + customAttrObject.attrName + '" removed in node "' + customAttrObject.node + '"');
            }else{
            	MessageLog.trace("Three's no Dynamic Attr for '"+attrName+"' in node '" + _node + "'" );
            }

        }
        }catch(err){MessageLog.trace('ERROR: removeCustomAttr: '+err); }

    }

    ///
    scene.beginUndoRedoAccum('Clear Saved Custom Transformation');

    _commonData.eachNode(_commonData, removeCustomAttr,
        function(_node, nodeType) {
            MessageLog.trace('Clear node transform: ' + _node + ' > ' + nodeType);
            MessageLog.trace('...');
            // var _attrs = Utils.getFullAttributeList( _node, _commonData.currentFrame, true );
            // MessageLog.trace('attrs: '+ _attrs.join('\n') );
        }
    );

    ///
    scene.endUndoRedoAccum();

}