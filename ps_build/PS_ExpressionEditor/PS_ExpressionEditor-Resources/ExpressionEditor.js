/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.210728

Base methods of the Expression editor
*/

///
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_ExpressionEditor-Resources/ps/Utils.js"));

///
function ExpressionEditor(){
    
    var _this = this;

    this.expressionStartToken = '%EXPR:';

    this.nextLinkedNode = undefined;
    this.version = undefined;
    this.modal = undefined;
    this.currentExpressionName = undefined;
    this.onExpressionListRefreshed = undefined;
    this.showOutputMessage = function(){};

    //
    this.createExpression = function( expressionName, expressionBody, forceNameInput ) {

        scene.beginUndoRedoAccum('Create Expression');

        _this.showOutputMessage();

        if( !expressionName || forceNameInput ){

            expressionName = Input.getText('Enter Expression name', expressionName || '', 'Create Expression');
            if (!expressionName) {
                _this.showOutputMessage('Expression name required','',false);
                return;
            }

        }

        // MessageLog.trace('_createExpression: '+columnName+', '+_this.modal.textEdit.plainText );

        var columnName = _this.resolveExpressionName(expressionName);

        var columnExists = column.type(columnName);
        if (columnExists) {
            _this.showOutputMessage('An expression with name "'+columnName+'" already exists','',false);
            return;
        }

        var result = column.add(columnName, 'EXPR');
        if (!result) {
            MessageLog.trace('Expression creation error');
            return;
        }

        if( expressionBody ) _this.saveExpression( columnName, expressionBody );

        _this.onExpressionListRefreshed(columnName);

        scene.endUndoRedoAccum();

        return expressionName;

    }

    this.saveExpression = function( expressionName, expressionBody ){
        if( !expressionName ) return;
        var result = column.setTextOfExpr( expressionName, expressionBody );
        return true;
    }

    //
    this.renameExpression = function() {

        if (!_this.currentExpressionName) return;

        _this.showOutputMessage();

        var expressionName = Input.getText('Enter Expression name', _this.currentExpressionName, 'Rename Expression');
        if (!expressionName) {
            _this.showOutputMessage('Expression name required','',false);
            return;
        }

        var columnName = _this.resolveExpressionName(expressionName);

        if (_this.currentExpressionName === columnName) return;

        var columnExists = column.type(columnName);
        if (columnExists) {
            _this.showOutputMessage('An expression with the same name already exists','',false);
            return;
        }

        column.rename(_this.currentExpressionName, columnName);

        _this.showOutputMessage('Expression renamed from "'+_this.currentExpressionName+'" to "'+columnName+'"','',true);

        _this.onExpressionListRefreshed(columnName);

    }


    //
    this.deleteAllExpressions = function() {

        // try{

        if (!_this.showConfirmDialog(
                'Confirm deletion',
                'You are going to delete all the Expressions in the Scene.\nAre you sure?',
                "Yep. Kill'em all.",
                "Nope. Not today."
            )) return;

        var expressionsData = _this.getExpressionColumns(true);
        if (!expressionsData.length) {
            _this.showOutputMessage('No expressions found.','',false);
            return;
        }

        scene.beginUndoRedoAccum('Delete All Expressions');

        var nodeCount = 0;
        var expressionCount = 0;

        expressionsData.forEach(function(expressionData, i) {
            if (!expressionData.name) return;
            // MessageLog.trace('expressions: '+JSON.stringify( expressionData, true, '  ') );
            nodeCount += __deleteExpression(expressionData.name);
            expressionCount++;
        })

        _this.onExpressionListRefreshed(false);

        _this.showOutputMessage('Deleted Expressions count: ' + expressionCount + '. Removed links from ' + nodeCount + ' nodes.','',true);

        scene.endUndoRedoAccum();

        // }catch(err){MessageLog.trace('Error:'+err)}

    }


    //
    this.deleteAllUnusedExpressions = function() {
        
        if (!_this.showConfirmDialog(
                'Confirm deletion',
                'You are about to delete all unused Expressions in the Scene.\nAre you sure?'
            )) return;

        var expressionsData = _this.getExpressionColumns(true).map(function(expressionData){return expressionData.name;});
        if (!expressionsData.length) {
            _this.showOutputMessage('No Expressions found in the Scene.','',false);
            return;
        }

        // Filter the used Expressions out
        var usedNodes = _this.getAllUsedNodes();
        Object.keys(usedNodes).forEach(function(nodeName){
            usedNodes[nodeName].forEach(function(attrData){
                var usedExpressionName = attrData[0];
                var index = expressionsData.indexOf(usedExpressionName);
                if( index !== -1 ) expressionsData.splice(index,1);
            });
        });

        // MessageLog.trace('1>>> '+JSON.stringify(expressionsData, true, '  ') );
        // MessageLog.trace('2>>> '+JSON.stringify(usedNodes, true, '  ') );

        if (!expressionsData.length) {
            _this.showOutputMessage('No unused Expressions found in the Scene.','',false);
            return;
        }

        scene.beginUndoRedoAccum('Delete All Unused Expressions');

        expressionsData.forEach(function(expressionName){
            __deleteExpression( expressionName );
        });

        _this.onExpressionListRefreshed(false);

        _this.showOutputMessage('Deleted Expression count: ' + expressionsData.length,'',true);

        scene.endUndoRedoAccum();

    }


    //
    this.deleteExpression = function() {

        if (!_this.currentExpressionName) return;

        scene.beginUndoRedoAccum('Delete Expression');

        var nodeCount = __deleteExpression(_this.currentExpressionName);

        _this.onExpressionListRefreshed(false);

        _this.showOutputMessage('Expression deleted. Removed links from ' + nodeCount + ' nodes.','',true);

        scene.endUndoRedoAccum();

    }

    //
    function __deleteExpression(expressionName) {

        // MessageLog.trace( '__deleteExpression: "'+expressionName+'"' );

        var allLinkedNodes = _this.getAllUsedNodes(expressionName);

        var linkedNodesNames = Object.keys(allLinkedNodes);

        var nodeCount = 0;

        linkedNodesNames.forEach(function(_node) {

            allLinkedNodes[_node].forEach(function(attrData) {

                // MessageLog.trace('unlink: '+_node+' : '+attrData[1]+' : '+attrData[0] );
                node.unlinkAttr(_node, attrData[1]);
                nodeCount++;

            });

        });

        // column.removeUnlinkedFunctionColumn(expressionName); // Doesn't work

        var _node = node.add('Top', '__' + column.generateAnonymousName(), 'PEG', 0, 0, 0);
        node.linkAttr(_node, "ROTATION.ANGLEZ", expressionName);
        var result = node.deleteNode(_node, true, true);

        return nodeCount;

    }



    //
    this.findNextUsedNode = function() {

        if (!_this.currentExpressionName) return;

        var allLinkedNodes = _this.getAllUsedNodes(_this.currentExpressionName);

        // try{
        // MessageLog.trace('findNextUsedNode: ' + JSON.stringify(allLinkedNodes, true, '  ') );

        var linkedNodesNames = Object.keys(allLinkedNodes);
        if (!linkedNodesNames.length) {
            _this.showOutputMessage('No nodes found','',false);
            return;
        }

        if (_this.nextLinkedNode === undefined) nextLinkedNodeIndex = 0;
        else {
            var nextLinkedNodeIndex = linkedNodesNames.indexOf(_this.nextLinkedNode);
            if (nextLinkedNodeIndex === -1) nextLinkedNodeIndex = 0;
            else {
                nextLinkedNodeIndex++;
                if (nextLinkedNodeIndex >= linkedNodesNames.length) nextLinkedNodeIndex = 0;
            }
        }

        _this.nextLinkedNode = linkedNodesNames[nextLinkedNodeIndex];

        // MessageLog.trace('_this.nextLinkedNode: "'+_this.nextLinkedNode+'"');
        if (!_this.nextLinkedNode) return;

        var attributes = [];
        allLinkedNodes[_this.nextLinkedNode].forEach(function(attrData) { attributes.push('- ' + attrData[1]) })
        _this.showOutputMessage('"' + _this.nextLinkedNode + '" ' + (nextLinkedNodeIndex + 1) + '/' + linkedNodesNames.length, attributes.join('\n'));

        selection.clearSelection();
        selection.addNodeToSelection(_this.nextLinkedNode);

        // MessageLog.trace('>>'+JSON.stringify(Action.validate("onActionFocusOnSelectionNV()", "Node View")) )

        var actionCheck = Action.validate("onActionFocusOnSelectionNV()", "Node View");
        if (actionCheck.isValid && actionCheck.enabled) {

            _this.modal.setFocusOnMainWindow();
            Action.perform("onActionFocusOnSelectionNV()", "Node View");

            if (KeyModifiers.IsControlPressed()) Action.perform("onActionEditProperties()", "scene");

        }

        // }catch(err){MessageLog.trace('Error: '+err)}

    }


    ///
    //
    this.copyExpression = function( expressionName, expressionBody ) {

        if (!expressionName) return;

        _this.showOutputMessage('');

        scene.beginUndoRedoAccum('Copy Expression');

        var expressionData = 'Expression Editor. Expression Data | v' + _this.version + '\n';
        expressionData += _this.expressionStartToken + expressionName + '\n' + expressionBody + '\n';

        // Save to a File
        if (KeyModifiers.IsControlPressed()) {

            var filePath = FileDialog.getSaveFileName('*.txt');
            if (filePath) {

                if (saveDataToFile(filePath, expressionData))
                    _this.showOutputMessage('Expression Data saved to the file','',true);

                else _this.showOutputMessage('An error occurred while saving');

            } else {
                _this.showOutputMessage('');
            }

        } else { // Clipboard

            QApplication.clipboard().setText(expressionData);
            _this.showOutputMessage('Expression Data copied to the Clipboard','',true);
        }

        scene.endUndoRedoAccum();

    }


    //
    this.pasteExpression = function() {

        var expressionData;

        _this.showOutputMessage('');

        // Load from a File
        if (KeyModifiers.IsControlPressed()) {

            var filePath = FileDialog.getOpenFileName('*.txt');
            if (filePath) {
                expressionData = loadDataFromFile(filePath) || '';
            }

        } else { // Clipboard

            expressionData = QApplication.clipboard().text();

        }

        expressionData = (expressionData || '').trim();

        if (expressionData) {

            expressionData = expressionData.split(/\r?\n/);

            var dataHead = expressionData.shift();

            if (dataHead && dataHead.indexOf('Expression Editor. Expression Data') !== -1) {


                // Parse Data
                var currentExpressionName;
                var currentExpressionValue;

                function putCurrentExpression() {

                    if (!(currentExpressionName && currentExpressionValue)) return;

                    var _currentExpressionName = currentExpressionName;
                    currentExpressionName = undefined;

                    var _currentExpressionValue = currentExpressionValue.join('\n');
                    currentExpressionValue = undefined;

                    //
                    var columnName = _this.resolveExpressionName(_currentExpressionName);

                    // Check that the new expression is not exists in the Scene
                    var columnExists = column.type(columnName);
                    if (columnExists) {
                        var response = MessageBox.warning('Expression named "' + columnName + '" already exists in the Scene.\nOverride?', 1, 2, 0, 'Paste error');
                        if (response === 2) {
                            MessageLog.trace('Expression "' + columnName + '" skipped by user.');
                            return;
                        }
                    }

                    if (!columnExists) {

                        var result = column.add(columnName, 'EXPR');
                        if (!result) {
                            MessageLog.trace('Expression creation error');
                            return;
                        }

                    }

                    column.setTextOfExpr(columnName, _currentExpressionValue);

                    _this.onExpressionListRefreshed(columnName);

                }

                scene.beginUndoRedoAccum('Paste Expression');

                expressionData.forEach(function(line) {

                    line = line.trim();

                    if (line.indexOf(_this.expressionStartToken) === 0) {
                        putCurrentExpression();
                        currentExpressionName = line.split(_this.expressionStartToken)[1]
                        currentExpressionValue = [];
                    } else {
                        currentExpressionValue.push(line);
                    }

                });

                putCurrentExpression();

                scene.endUndoRedoAccum();

                _this.showOutputMessage('Expression Data pasted successfully','',true);

                return;

            }

        }

        _this.showOutputMessage('Expression Data not found in the Clipboard','',true);

    }



    /// ------------------------------------------------

    this.showConfirmDialog = function( title, text, okButtonText, cancelButtonText ) {
        var d = new Dialog();
        d.title = title;
        if (okButtonText) d.okButtonText = okButtonText;
        if (cancelButtonText) d.cancelButtonText = cancelButtonText;
        if (text) {
            var bodyText = new Label();
            bodyText.text = text;
            d.add(bodyText);
        }

        return d.exec();
    }


    //
    this.getExpressionColumns = function(noFirstEmpty) {
        var expressions = column.getColumnListOfType('EXPR');
        if (!noFirstEmpty) expressions.unshift('');
        // MessageLog.trace('_getExpressionColumns '+JSON.stringify(expressions,true,'  '));
        expressions = expressions.map(function(v) {
            return { name: v };
        });
        _this.expressions = expressions;
        return expressions;
    }


    //
    this.traverseNodes = function( nodes, callback ){

        nodes.forEach(function(_node){

            var name = node.getName(_node);
            callback( _node, name );

            if( node.isGroup(_node) ){
                var childNodes = node.subNodes(_node);
                _this.traverseNodes( childNodes, callback );
            }

        });
    }


    //
    this.getAllUsedNodes = function( _columnName ){

        var allLinkedNodes = {};

        _this.traverseNodes([node.root()],function(_node){

            var linkedAttrs = [];

            Utils.getFullAttributeList( _node, 1, true ).forEach(function(attrName){
                var columnName = node.linkedColumn( _node, attrName );
                if( columnName && column.type(columnName) === 'EXPR' ){
                    if( !_columnName || ( _columnName && _columnName === columnName ) )  {
                        linkedAttrs.push( [columnName, attrName] );
                        // MessageLog.trace('Expression found: '+columnName );
                    }
                }
            });

            // MessageLog.trace('--> '+_node+'; '+JSON.stringify(linkedAttrs, true, '  ') );
          
            if( linkedAttrs.length) allLinkedNodes[_node] = linkedAttrs;

        });

        return allLinkedNodes;

        // MessageLog.trace('_getAllUsedNodes: ' + JSON.stringify(allLinkedNodes, true, '  ') );

    }


    //
    this.resolveExpressionName = function(name){
        return (name || '').trim().replace(/\s/gi,'_').replace(/[^0-9\w]/gi,'');
    }


    //
    this.getAvailableColumnName = function( columnName ) {
        
        if( !column.type(columnName) ) return columnName;

        var counter = 0;
        var _columnName = columnName;
        do {
            counter++;
            _columnName = columnName+'_'+counter;
        } while ( column.type(_columnName) && counter < 100 )

        return _columnName;

    }




    //
    function saveDataToFile(path, data) {

        try {
            var file = new File(path);
            file.open(2); // write only
            file.write(data);
            file.close();
            return true;
        } catch (err) {
            return false;
        }

    }


    //
    function loadDataFromFile(path) {

        var file = new File(path);

        try {
            if (file.exists) {
                file.open(1) // read only
                var savedData = file.read();
                file.close();
                return savedData;
            }
        } catch (err) {}

    }


}

///
exports = ExpressionEditor;