/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.220814
*/


var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));

///
var COLORART = 1;
var LINEART = 2;

var MODE_CURRENT = 1;
var MODE_RESTING = 2;
var MODE_BOTH = 3;


var RIGHT = 'Right';
var LEFT = 'Left';
var UP = 'Up';
var DOWN = 'Down';

///
exports = {
    COLORART: COLORART,
    LINEART: LINEART,

    MODE_CURRENT: MODE_CURRENT,
    MODE_RESTING: MODE_RESTING,
    MODE_BOTH: MODE_BOTH,

    RIGHT: RIGHT,
    LEFT: LEFT,
    UP: UP,
    DOWN: DOWN,

    isDefNode: isDefNode,
    isOffsetNode: isOffsetNode,
    setAttrValues: setAttrValues,

    alignVertically: alignVertically,
    alignHorizontally: alignHorizontally,

    orientControlPoints: orientControlPoints,
    orientControlPointsToNext: orientControlPointsToNext,
    distributeControlPoints: distributeControlPoints,

    generateCircleDeformer: generateCircleDeformer,
    generateRectDeformer: generateRectDeformer,
    generateArtDeformer: generateArtDeformer,
    moveDeformersAround: moveDeformersAround,
    insertDeformerCurve: insertDeformerCurve,
    removeDeformerCurve: removeDeformerCurve,
    generateDeformer: generateDeformer,
    symmetrizeChain: symmetrizeChain,
    symmetrizeCurves: symmetrizeCurves,
    reverseChain: reverseChain,
}

var restingAttrNames = {
    "offset.x": "restingOffset.x",
    "offset.y": "restingOffset.y",
    length0: "restlength0",
    length1: "restLength1",
    orientation0: "restingOrientation0",
    orientation1: "restingOrientation1",
};

var validDeformerAttrNames = {
    x: 'offset.x',
    y: 'offset.y',
}


/*
 █████  ██      ██  ██████  ███    ██ 
██   ██ ██      ██ ██       ████   ██ 
███████ ██      ██ ██   ███ ██ ██  ██ 
██   ██ ██      ██ ██    ██ ██  ██ ██ 
██   ██ ███████ ██  ██████  ██   ████ 
*/

//
function alignVertically(side, applyMode) {

    _exec('Align Deformer Points Vertically', function() {

        var _nodes = getSelectedDeformers();
        if (!_nodes) return;

        var center = getCenter(_nodes, side, 'offset.x');
        // if (applyMode) applyAttrValue(_nodes, 'restingOffset.x', center);
        setAttrValues(_nodes, 'offset.x', undefined, applyMode, center);

    });
}

//
function alignHorizontally(side, applyMode) {

    _exec('Align Deformer Points Horizontally', function() {

        var _nodes = getSelectedDeformers();
        if (!_nodes) return;

        var center = getCenter(_nodes, side, 'offset.y');
        // if (applyMode) applyAttrValue(_nodes, 'restingOffset.y', center);
        setAttrValues(_nodes, 'offset.y', undefined, applyMode, center);

    });

}






// =====================================================================
/*
 ██████  ██████  ███    ██ ████████ ██████   ██████  ██          ██████   ██████  ██ ███    ██ ████████ ███████ 
██      ██    ██ ████   ██    ██    ██   ██ ██    ██ ██          ██   ██ ██    ██ ██ ████   ██    ██    ██      
██      ██    ██ ██ ██  ██    ██    ██████  ██    ██ ██          ██████  ██    ██ ██ ██ ██  ██    ██    ███████ 
██      ██    ██ ██  ██ ██    ██    ██   ██ ██    ██ ██          ██      ██    ██ ██ ██  ██ ██    ██         ██ 
 ██████  ██████  ██   ████    ██    ██   ██  ██████  ███████     ██       ██████  ██ ██   ████    ██    ███████ 
*/

//
function orientControlPoints(_nodes, applyMode, useEntireChain, controlSide) {

    _exec('Orient Control Points', function() {


        var deformersChain = getDeformersChain();
        if (!_nodes) _nodes = useEntireChain ? deformersChain : getSelectedDeformers();
        if (!_nodes) return;

        _nodes.forEach(function(_node) {

            if (isOffsetNode(_node)) {

            } else {

                /*
                var targetNode = getParentNode(_node);
                if (!targetNode || !(isOffsetNode(_node) || isDefNode(_node))) return;

                var srcNode = _node;
                if (node.getTextAttr(_node, 1, 'closePath') === 'Y') {
                    srcNode = (getDeformersChain(_node) || [])[0];
                    if (!srcNode) return;
                }
                */
                var targetNode = getParentDefNode(_node, deformersChain);
                if (!targetNode) return;

                var targetPos = getDeformerPointPosition(targetNode);
                var pos = getDeformerPointPosition(isClosedDefNode(_node) ? deformersChain[0] : _node);
                var ang = fixOrientation(Math.atan2(pos.y - targetPos.y, pos.x - targetPos.x) / Math.PI * 180);
                // MessageLog.trace('targetPos:\n'+JSON.stringify(targetPos)+'\n>'+JSON.stringify(pos)+' > '+ang);

                if (!controlSide || controlSide === 1) setAttrValues(_node, 'orientation0', undefined, applyMode, ang);
                if (!controlSide || controlSide === 2) setAttrValues(_node, 'orientation1', undefined, applyMode, ang);

            }

        });

    });

}


//
function orientControlPointsToNext(_nodes, applyMode, useEntireChain, controlSide) {

    _exec('Orient Control Points', function() {

        // MessageLog.trace('orientControlPoints ' + applyMode + ', ' + useEntireChain + ' > ' + _nodes.join(', '));
        var deformersChain = getDeformersChain();
        if (!_nodes) _nodes = useEntireChain ? deformersChain : getSelectedDeformers();
        if (!_nodes) return;

        _nodes.forEach(function(_node) {

            if (isOffsetNode(_node)) {

            } else {

                var prevNode = getParentDefNode(_node, deformersChain);
                if (prevNode && (!controlSide || controlSide === 1)) {
                    var prevVal = isOffsetNode(prevNode) ? getAttrValue(deformersChain[deformersChain.length - 1], 'orientation1') : getAttrValue(prevNode, 'orientation1');
                    setAttrValues(_node, 'orientation0', undefined, applyMode, prevVal);
                }

                var nextNode = getNextDefNode(_node, deformersChain);
                if (nextNode && (!controlSide || controlSide === 2)) {
                    var nextVal = isOffsetNode(nextNode) ? getAttrValue(deformersChain[1], 'orientation0') : getAttrValue(nextNode, 'orientation0');
                    setAttrValues(_node, 'orientation1', undefined, applyMode, nextVal);
                }

            }

        });

    });

}


//
function distributeControlPoints(_nodes, applyMode, useEntireChain, controlSide) {

    _exec('Distribute Control Points', function() {

        var deformersChain = getDeformersChain();
        if (!_nodes) _nodes = useEntireChain ? deformersChain : getSelectedDeformers();
        if (!_nodes) return;

        var _isChainClosed = isChainClosed(deformersChain);

        _nodes.forEach(function(_node) {

            if (isOffsetNode(_node)) {

            } else {
                /*
                var targetNode = getParentNode(_node);
                if (!targetNode || !(isOffsetNode(_node) || isDefNode(_node))) return;

                var srcNode = _node;
                if (node.getTextAttr(_node, 1, 'closePath') === 'Y') {
                    srcNode = (getDeformersChain(_node) || [])[0];
                    if (!srcNode) return;
                }
                */
                var targetNode = getParentDefNode(_node);
                if (!targetNode) return;

                var targetPos = getDeformerPointPosition(targetNode);
                var pos = getDeformerPointPosition(isClosedDefNode(_node) ? deformersChain[0] : _node);
                var dx = pos.x - targetPos.x;
                var dy = pos.y - targetPos.y;
                var hypo = Math.sqrt(dx * dx + dy * dy);
                var length = hypo / 3;

                // if (applyMode) {
                //     applyAttrValue(_node, 'restlength0', length);
                //     applyAttrValue(_node, 'restLength1', length);
                // }

                if (!controlSide || controlSide === 1) setAttrValues(_node, 'length0', undefined, applyMode, length);
                if (!controlSide || controlSide === 2) setAttrValues(_node, 'length1', undefined, applyMode, length);

                // MessageLog.trace('-> SF: '+_node+'('+pos.x+','+pos.y+')' );
                // MessageLog.trace('-> PR: '+targetNode+' ('+targetPos.x+','+targetPos.y+')' );
                // MessageLog.trace('-> length: '+length+' ( '+hypo );

            }

        });

    });

}










/// =====================================================
/*
 ██████  ███████ ███    ██ ███████ ██████   █████  ████████  ██████  ██████  ███████ 
██       ██      ████   ██ ██      ██   ██ ██   ██    ██    ██    ██ ██   ██ ██      
██   ███ █████   ██ ██  ██ █████   ██████  ███████    ██    ██    ██ ██████  ███████ 
██    ██ ██      ██  ██ ██ ██      ██   ██ ██   ██    ██    ██    ██ ██   ██      ██ 
 ██████  ███████ ██   ████ ███████ ██   ██ ██   ██    ██     ██████  ██   ██ ███████ 
 */
//
function generateCircleDeformer(artIndex, curDrawing, reversePath) {
    _exec('Generate Circle Deformer', function() {
        generateDeformer('circle', artIndex, curDrawing, reversePath);
    });
}

//
function generateRectDeformer(artIndex, curDrawing, reversePath) {
    _exec('Generate Rectangle Deformer', function() {
        generateDeformer('rectangle', artIndex, curDrawing, reversePath);
    });
}

//
function generateArtDeformer(artIndex, curDrawing, reversePath, dontClosePath) {
    _exec('Generate Deformer on Art layer', function() {
        generateDeformer('art', artIndex, curDrawing, reversePath, dontClosePath);
    });
}

///
function generateDeformer(mode, artIndex, curDrawing, reversePath, dontClosePath) {

    if (!curDrawing) curDrawing = SelectionUtils.filterNodesByType(true, ['READ']);
    if (!curDrawing) {
        MessageBox.information("Please select at least one drawing node before running this script.");
        return;
    }

    // MessageLog.trace('curDrawing: '+ curDrawing+' >> '+artIndex );
    var currentArtIndex = artIndex !== undefined ? artIndex : LINEART;
    var corners = getCorners(curDrawing, currentArtIndex);
    if (!("x" in corners[0]) && currentArtIndex !== COLORART) {
        currentArtIndex = COLORART;
        corners = getCorners(curDrawing, currentArtIndex);
    }

    // MessageLog.trace('>> '+ currentArtIndex );
    // MessageLog.trace('>> '+ JSON.stringify( corners ) );

    if (!("x" in corners[0])) // if corners array is still empty
    {
        MessageLog.trace(curDrawing + " is empty at frame " + frame.current() + ". Quit.");
        return;
    }

    var btmL_local_OGL = Point2d(corners[0].x / 1875, corners[0].y / 1875);
    var topR_local_OGL = Point2d(corners[1].x / 1875, corners[1].y / 1875);
    var center_local_OGL = midPointAt(btmL_local_OGL, topR_local_OGL, 0.5);
    center_local_OGL.x = scene.fromOGLX(center_local_OGL.x);
    center_local_OGL.y = scene.fromOGLY(center_local_OGL.y);
    var wh = scene.fromOGLX(topR_local_OGL.x - btmL_local_OGL.x) / 2;
    var hh = scene.fromOGLY(topR_local_OGL.y - btmL_local_OGL.y) / 2;
    //

    // Create group
    var parentNode = node.parentNode(curDrawing);

    // MessageLog.trace('parentNode: ', parentNode );
    var groupPosition = {
        x: node.coordX(curDrawing),
        y: node.coordY(curDrawing) - 20
    }
    var offsetDest = node.srcNode(curDrawing, 0);

    // node.add( parentNode, node.getName(curDrawing)+'-Deformation', 'GROUP', groupPosition.x, groupPosition.y, 0 );

    var deformers;

    switch (mode) {

        case 'circle':
            deformers = pointsToDeformerCurves(
                strokePointsToPoints(
                    getCircleStrokes(center_local_OGL, wh, hh),
                    center_local_OGL, reversePath),
                curDrawing, offsetDest, dontClosePath);
            break;

        case 'rectangle':
            deformers = pointsToDeformerCurves(
                strokePointsToPoints(
                    getRectangleStrokes(center_local_OGL, wh, hh),
                    center_local_OGL, reversePath),
                curDrawing, offsetDest, dontClosePath);
            break;

        case 'art':
            deformers = pointsToDeformerCurves(
                strokePointsToPoints(
                    getArtStrokesData(curDrawing, currentArtIndex),
                    center_local_OGL, reversePath),
                curDrawing, offsetDest, dontClosePath);
            break;
    }

    if (deformers) {

        generateDeformersNodes(parentNode, groupPosition.x, groupPosition.y, deformers);

        var groupNode = node.createGroup(deformers.map(function(deformerData) { return deformerData.node; }).join(), node.getName(curDrawing) + '-DFM');

        // MessageLog.trace('groupNode: ', groupNode );
        if (groupNode) {
            node.setCoord(groupNode,
                node.coordX(curDrawing) + node.width(curDrawing) / 2 - node.width(groupNode) / 2,
                node.coordY(curDrawing) - (offsetDest ? (node.coordY(curDrawing) - node.coordY(offsetDest)) / 2 : 40)
            );
        }

    }
    //
    return deformers;

}






/// ============================================================
/*
███    ███  ██████  ██    ██ ███████      █████  ██████   ██████  ██    ██ ███    ██ ██████  
████  ████ ██    ██ ██    ██ ██          ██   ██ ██   ██ ██    ██ ██    ██ ████   ██ ██   ██ 
██ ████ ██ ██    ██ ██    ██ █████       ███████ ██████  ██    ██ ██    ██ ██ ██  ██ ██   ██ 
██  ██  ██ ██    ██  ██  ██  ██          ██   ██ ██   ██ ██    ██ ██    ██ ██  ██ ██ ██   ██ 
██      ██  ██████    ████   ███████     ██   ██ ██   ██  ██████   ██████  ██   ████ ██████  
*/

/*
TODO:
- take into account the inheritance of parent transformations
*/
function moveDeformersAround(direction, applyMode) {

    _exec('Move Deformers Around', function() {

        var _deformers = getDeformersChain();
        if (!_deformers) return;

        if (!isChainClosed(_deformers)) {
            MessageLog.trace('The Deformer Chain must be closed.');
            return;
        }

        var currentFrame = frame.current();

        _deformers = _deformers.map(function(defNode, i) {
            return getDeformerAttrs(defNode, applyMode);
        });

        // MessageLog.trace("moveDeformersAround: " + JSON.stringify(_deformers, true, '  '));

        var swapDefData;
        _deformers.forEach(function(defNode, i) {

            if (direction === 'left') {

                swapDefData = (i === _deformers.length - 1) ? _deformers[1] : _deformers[i + 1];

                if (i === _deformers.length - 2) {
                    if (swapDefData.attrs["offset.x"] !== undefined) {
                        swapDefData.attrs["offset.x"] = _deformers[0].attrs["offset.x"];
                        swapDefData.attrs["offset.y"] = _deformers[0].attrs["offset.y"];
                    }
                    if (swapDefData.attrs[restingAttrNames["offset.x"]] !== undefined) {
                        swapDefData.attrs[restingAttrNames["offset.x"]] = _deformers[0].attrs[restingAttrNames["offset.x"]];
                        swapDefData.attrs[restingAttrNames["offset.y"]] = _deformers[0].attrs[restingAttrNames["offset.y"]];
                    }
                }

            } else {

                swapDefData = i <= 1 ? _deformers[_deformers.length - 2 + i] : _deformers[i - 1];

            }
            // MessageLog.trace(defNode.node+' > '+swapDefNode.node);
            setAttrValues(defNode.node, swapDefData.attrs, currentFrame);
        });

    });

}



/*
██╗███╗   ██╗███████╗███████╗██████╗ ████████╗     ██████╗██╗   ██╗██████╗ ██╗   ██╗███████╗
██║████╗  ██║██╔════╝██╔════╝██╔══██╗╚══██╔══╝    ██╔════╝██║   ██║██╔══██╗██║   ██║██╔════╝
██║██╔██╗ ██║███████╗█████╗  ██████╔╝   ██║       ██║     ██║   ██║██████╔╝██║   ██║█████╗  
██║██║╚██╗██║╚════██║██╔══╝  ██╔══██╗   ██║       ██║     ██║   ██║██╔══██╗╚██╗ ██╔╝██╔══╝  
██║██║ ╚████║███████║███████╗██║  ██║   ██║       ╚██████╗╚██████╔╝██║  ██║ ╚████╔╝ ███████╗
╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝        ╚═════╝ ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝
*/

/*
TODO:
- take into account the inheritance of parent transformations
*/

function insertDeformerCurve(curvePos) {


    _exec('Insert a Control point to the Deformer', function() {

        var _deformers = getSelectedDeformers();
        if (!_deformers.length) {
            MessageLog.trace('The Script requires at least one selected deformer.');
            return;
        }

        // MessageLog.trace( JSON.stringify(_deformers,true,'  '));

        _deformers.forEach(function(deformerNode, i) {

            if (isOffsetNode(deformerNode)) {
                MessageLog.trace('Unable to insert a Curve point in the Offset Module.');
                return;
            }

            var parentNode = getParentNode(deformerNode);

            var defData = [
                _getDeformerPos(deformerNode, parentNode, MODE_RESTING),
                _getDeformerPos(deformerNode, parentNode, MODE_CURRENT),
            ];

            var newDeformerData = defData[0].newDeformerData;
            // MessageLog.trace('!!! '+JSON.stringify(newDeformerData,true,'  '));

            generateDeformersNodes(
                node.parentNode(deformerNode),
                node.coordX(deformerNode) + 15,
                node.coordY(deformerNode) - (node.coordY(deformerNode) - node.coordY(parentNode) + node.height(deformerNode)) / 2, newDeformerData
            );

            // Update params of the old deformer
            defData.forEach(function(_defData, i) {
                // MessageLog.trace(i + ') ' + newDeformerData[0].node+' > '+JSON.stringify(_defData.oldDeformerData[0].attrs, true, '  '));
                setAttrValues(deformerNode, _defData.oldDeformerData[0].attrs, _defData.frame, _defData.mode);
                if (i !== 0) setAttrValues(newDeformerData[0].node, _defData.newDeformerData[0].attrs, _defData.frame, _defData.mode);
            });

        });

    });


    //
    function _getDeformerPos(deformerNode, parentNode, mode, _frame) {

        var restingData = mode === MODE_RESTING;
        var parentPos = getDeformerPointPosition(parentNode, restingData, true);
        var deformerPos = getDeformerPointPosition(deformerNode, restingData, true, parentPos[1]);
        // MessageLog.trace('insertDeformerCurve: ' + i + ':\ndeformerNode: ' + deformerNode + '\nparentNode: ' + parentNode);
        // MessageLog.trace(i + ') ' + JSON.stringify(deformerPos, true, '  ') + ' > ' + JSON.stringify(parentPos, true, '  '));
        // MessageLog.trace('??? '+mode+' >> '+restingData);

        var newDeformerPath = Drawing.geometry.insertPoints({
            path: deformerPos,
            params: [curvePos || 0.5]
        });
        // MessageLog.trace('newDeformerPath: ' + JSON.stringify(newDeformerPath, true, '  '));
        var newDeformerPoints = newDeformerPath.splice(0, 4);
        var newDeformerData = pointsToDeformerCurves(
            strokePointsToPoints(
                newDeformerPoints,
                undefined, false),
            deformerNode, parentNode, true, true);
        // MessageLog.trace('NEW PATH:' + JSON.stringify(newDeformerPath, true, '  ') + '\n---\n' + JSON.stringify(newDeformerData, true, '  '));

        newDeformerPath.unshift(newDeformerPoints[newDeformerPoints.length - 1]);
        var oldDeformerData = pointsToDeformerCurves(
            strokePointsToPoints(
                newDeformerPath,
                undefined, false),
            undefined, undefined, true, true);

        return {
            mode: mode,
            frame: _frame,
            newDeformerPath: newDeformerPath,
            newDeformerPoints: newDeformerPoints,
            newDeformerData: newDeformerData,
            oldDeformerData: oldDeformerData,
        }
    }

}








/*
██████╗ ███████╗███╗   ███╗ ██████╗ ██╗   ██╗███████╗     ██████╗██╗   ██╗██████╗ ██╗   ██╗███████╗
██╔══██╗██╔════╝████╗ ████║██╔═══██╗██║   ██║██╔════╝    ██╔════╝██║   ██║██╔══██╗██║   ██║██╔════╝
██████╔╝█████╗  ██╔████╔██║██║   ██║██║   ██║█████╗      ██║     ██║   ██║██████╔╝██║   ██║█████╗  
██╔══██╗██╔══╝  ██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝      ██║     ██║   ██║██╔══██╗╚██╗ ██╔╝██╔══╝  
██║  ██║███████╗██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗    ╚██████╗╚██████╔╝██║  ██║ ╚████╔╝ ███████╗
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝
*/
//
function removeDeformerCurve() {


    _exec('Remove Deformer Curve', function() {

        var _deformers = getSelectedDeformers();
        if (!_deformers.length) {
            MessageLog.trace('The Script requires at least one selected deformer.');
            return;
        }

        _deformers.forEach(function(deformerNode, i) {

            if (isOffsetNode(deformerNode)) {

                var _nodes = getDeformersChain();

                if (!isChainClosed(_nodes)) {

                    node.deleteNode(deformerNode, true, true);
                    return;
                }

                MessageLog.trace('Unable to remove the Offset Module in Deformation Chain.');

                return;
            }

            var parentNode = getParentNode(deformerNode);
            var parentPos = getDeformerPointPosition(parentNode, true, true);
            var deformerPos = getDeformerPointPosition(deformerNode, true, true, parentPos[1]);
            var nextNode = getNextNode(deformerNode);
            var nextPos = getDeformerPointPosition(nextNode, true, true, deformerPos[3]);
            // MessageLog.trace('removeDeformerCurve: ' + i + ':\ndeformerNode: ' + deformerNode + '\nnextNode: ' + nextNode);

            nextPos.shift();
            var solidCurvePath = deformerPos.concat(nextPos);
            // MessageLog.trace('SOLID CURVE: ' + JSON.stringify(solidCurvePath, true, '  '));

            var path = Drawing.geometry.discretize({
                precision: 30,
                path: solidCurvePath
            });
            // MessageLog.trace('POINTS: ' + JSON.stringify(path, true, '  '));

            var bezierPath = Drawing.geometry.fit({
                oneBezier: true,
                path: path
            });
            // MessageLog.trace('BEZIER: ' + JSON.stringify(bezierPath, true, '  '));

            // Update params of the next deformer
            var deformerData = pointsToDeformerCurves(
                strokePointsToPoints(
                    bezierPath,
                    undefined, false),
                undefined, undefined, true, true);
            setAttrValues(nextNode, deformerData[0].attrs, undefined, MODE_RESTING);

            node.deleteNode(deformerNode, true, true);

            // MessageLog.trace(i + ') ' + JSON.stringify(deformerPos, true, '  ') + ' > ' + JSON.stringify(parentPos, true, '  '));
        });

    })

}






/*
███████╗██╗     ██╗██████╗      ██████╗██╗  ██╗ █████╗ ██╗███╗   ██╗
██╔════╝██║     ██║██╔══██╗    ██╔════╝██║  ██║██╔══██╗██║████╗  ██║
█████╗  ██║     ██║██████╔╝    ██║     ███████║███████║██║██╔██╗ ██║
██╔══╝  ██║     ██║██╔═══╝     ██║     ██╔══██║██╔══██║██║██║╚██╗██║
██║     ███████╗██║██║         ╚██████╗██║  ██║██║  ██║██║██║ ╚████║
╚═╝     ╚══════╝╚═╝╚═╝          ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
*/

function reverseChain(applyMode) {

    _exec('Reverse Deformer Chain', function() {

        MessageLog.clearLog();

        var _nodes = getDeformersChain();
        if (!_nodes.length) {
            MessageLog.trace('The Script requires at least one selected deformer.');
            return;
        }

        var _isChainClosed = isChainClosed(_nodes);
        var chainStrokes = getStrokesFromChain(_nodes);
        var strokes;
        MessageLog.trace(JSON.stringify(strokes, true, '  '));

        // strokePoints, destNode, srcNode, dontClosePath, skipOffsetModule
        if (applyMode === MODE_BOTH || applyMode === MODE_RESTING) {

            strokes = pointsToDeformerCurves(
                strokePointsToPoints(chainStrokes.strokesResting, undefined, true),
                undefined, undefined, _isChainClosed, false);

            strokes.forEach(function(defData, defI) {
                setAttrValues(_nodes[defI], defData.attrs, undefined, applyMode);
            });

        }

        if (applyMode === MODE_BOTH || applyMode === MODE_CURRENT) {

            strokes = pointsToDeformerCurves(
                strokePointsToPoints(chainStrokes.strokes, undefined, true),
                undefined, undefined, _isChainClosed, false);

            strokes.forEach(function(defData, defI) {
                setAttrValues(_nodes[defI], defData.attrs, undefined, applyMode);
            });

        }



    });

}






/*
███████╗██╗   ██╗███╗   ███╗███╗   ███╗███████╗████████╗██████╗ ██╗███████╗███████╗
██╔════╝╚██╗ ██╔╝████╗ ████║████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██║╚══███╔╝██╔════╝
███████╗ ╚████╔╝ ██╔████╔██║██╔████╔██║█████╗     ██║   ██████╔╝██║  ███╔╝ █████╗  
╚════██║  ╚██╔╝  ██║╚██╔╝██║██║╚██╔╝██║██╔══╝     ██║   ██╔══██╗██║ ███╔╝  ██╔══╝  
███████║   ██║   ██║ ╚═╝ ██║██║ ╚═╝ ██║███████╗   ██║   ██║  ██║██║███████╗███████╗
╚══════╝   ╚═╝   ╚═╝     ╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
*/
///
function _copyPointValues(point1, point2, signX, signY) {
    if (!point2) return;
    point2.x = point1.x * (signX || 1);
    point2.y = point1.y * (signY || 1);
}

function _copyPointsValues(points1, indecies1, points2, indecies2, signX, signY) {
    indecies1.forEach(function(index1, i) {
        _copyPointValues(points1[index1], points2[indecies2[i]], signX, signY);
    });
}


///
function symmetrizeCurves(direction, applyMode) {

    _exec('Remove Deformer Curve', function() {

        MessageLog.clearLog();

        var _deformers = getSelectedDeformers();
        if (!_deformers.length) {
            MessageLog.trace('The Script requires at least one selected deformer.');
            return;
        }
        // MessageLog.trace('_deformers'+_deformers.join(','));

        _deformers = _deformers.map(function(_deformer) {

            return {
                node: _deformer,
                attrs: getDeformerPointPosition(_deformer)
            }
        });

        var defFrom = _deformers[0];
        var defTo = _deformers[1];
        if (defFrom.attrs.x > 0) {
            defFrom = _deformers[1];
            defTo = _deformers[0];
        }
        var _defFromParent = getParentNode(defFromParent);
        var defFromParent = {
            node: _defFromParent,
            attrs: getDeformerPointPosition(_defFromParent)
        };
        var _defToParent = getParentNode(defToParent);
        var defToParent = {
            node: _defToParent,
            attrs: getDeformerPointPosition(_defToParent)
        };
        MessageLog.trace('defFromParent' + JSON.stringify(defFrom, true, '  ') + '\n' + JSON.stringify(defTo, true, '  '));

        var coefX = -1;

        defToParent.attrs.x = defFrom.attrs.x * coefX;
        defToParent.attrs.y = defFrom.attrs.y;

        defTo.attrs.x = defFromParent.attrs.x * coefX;
        defTo.attrs.y = defFromParent.attrs.y;
        defTo.attrs.length1 = defFrom.attrs.length0;
        defTo.attrs.orientation1 = (defFrom.attrs.orientation0 + 180) % 360;
        // defTo.attrs.orientation1 = defFrom.attrs.orientation0;
        defTo.attrs.length0 = defFrom.attrs.length1;
        defTo.attrs.orientation0 = (defFrom.attrs.orientation1 + 180) % 360;
        // defTo.attrs.orientation0 = defFrom.attrs.orientation1;


        setAttrValues(defTo.node, defTo.attrs, undefined, false);
        setAttrValues(defToParent.node, defTo.attrs, undefined, false);

        MessageLog.trace('_deformers' + JSON.stringify(_deformers, true, '  '));

    });

}



///
function symmetrizeChain(direction, applyMode) {

    _exec('Remove Deformer Curve', function() {

        MessageLog.clearLog();

        var _deformers = getSelectedDeformers();
        if (!_deformers.length) {
            MessageLog.trace('The Script requires at least one selected deformer.');
            return;
        }

        var _nodes = getDeformersChain(undefined, true);
        // MessageLog.trace('symmetrizeChain: ' + JSON.stringify(_nodes, true, '  '));

        var fromCurves = [];
        var toCurves = [];
        var _isChainClosed = isChainClosed(_nodes.map(function(nodeData) { return nodeData.node }));
        MessageLog.trace('symmetrizeChain: ' + _isChainClosed);

        var halfCount = (_nodes.length - 1) / 2;
        var startIndex = 0;
        var currentIndex = 0;

        for (var i = startIndex; i < _nodes.length; i++) {

            var nodeData = _nodes[currentIndex];

            if (nodeData.isOffset) {


            } else {

                var targetNodeData = _nodes[startIndex - currentIndex];

            }

            currentIndex++;
            if (currentIndex >= _nodes.length) currentIndex = 0;

        }

        /*
                _nodes.forEach(function(nodeData, i) {

                    // Check side by restiong position
                    var posResting0 = nodeData.pointsResting[0];
                    var posResting1 = nodeData.pointsResting[nodeData.pointsResting.length - 1];

                    // Flip X
                    // nodeData.points[0].x = -nodeData.points[0].x; // !!!
                    // nodeData.points[1].x = -nodeData.points[1].x; // !!!


                    // //
                    if (i === 0) return;

                    // Flip X
                    // nodeData.points[2].x = -nodeData.points[2].x;// !!!
                    // nodeData.points[3].x = -nodeData.points[3].x;// !!!

                    if (Utils.getSign(posResting0.x) !== Utils.getSign(posResting1.x)) { // One curve cross the Axis

                        if (posResting0.x < 0) {
                            _copyPointsValues(nodeData.points, [0, 1], nodeData.points, [3, 2], -1, 1);
                        } else {
                            _copyPointsValues(nodeData.points, [3, 2], nodeData.points, [0, 1], -1, 1);
                        }

                        return;

                    }

                    // From left to Right
                    if (posResting1.x <= 0) fromCurves.push(nodeData);
                    else toCurves.push(nodeData);

                });

                fromCurves.sort(function(a, b) { return a.index === b.index ? 0 : (a.index > b.index ? 1 : -1) });
                toCurves.sort(function(a, b) { return a.index === b.index ? 0 : (a.index < b.index ? 1 : -1) });
                // MessageLog.trace('fromCurves: ' + fromCurves.length + '\n' + JSON.stringify(fromCurves, true, '  '));
                // MessageLog.trace('toCurves: ' + toCurves.length + '\n' + JSON.stringify(toCurves, true, '  '));

                fromCurves.forEach(function(nodeData, i) {

                    var toNodeData = toCurves[i];
                    MessageLog.trace(i + ')) @@@@@: ' + nodeData.node + '\n' + JSON.stringify(nodeData.points, true, '  '));
                    // MessageLog.trace(i + ')) @1: ' + JSON.stringify(toNodeData.points, true, '  '));
                    MessageLog.trace('-->>: ' + nodeData.node + ' -> ' + toNodeData.node);
                    // _copyPointsValues(nodeData.points, [0, 1, 2, 3], toNodeData.points, [3, 2, 1, 0], -1, 1);
                    // toNodeData.points[2].x -= toNodeData.points[0].x;//nodeData.points[2].x;
                    // toNodeData.points[2].y = 1;//nodeData.points[2].x;
                    // toNodeData.points[1].x -= toNodeData.points[3].x; //nodeData.points[2].x;
                    // toNodeData.points[1].y = 1;//nodeData.points[2].x;
                    // MessageLog.trace(i + ')) @2: ' + JSON.stringify(toNodeData.points, true, '  '));

                });

        */
        // APPLY STROKES TO DEFORMERS
        var strokePoints = [];
        _nodes.forEach(function(nodeData, i) { i === 0 ? strokePoints.push(nodeData.points[1]) : strokePoints = strokePoints.concat(nodeData.points.splice(1, 3)); });
        // MessageLog.trace('======>\n' + JSON.stringify(strokePoints, true, '  '));

        // ------------
        // var elementId = node.getElementId('Top/TEMP');
        // // _nodes.forEach(function(nodeData, i) { i === 0 ? strokePoints.push(nodeData.points[1]) : strokePoints = strokePoints.concat(nodeData.points.splice(1, 3)); });

        // DrawingTools.createLayers({
        //     label: "unused",
        //     // drawing: { node: _node, frame: frame.current() },
        //     drawing: { elementId: elementId, exposure: 'Default' },
        //     art: 0,
        //     layers: [{
        //         contours: [{
        //             polygon: false,
        //             path: strokePoints
        //         }]
        //     }]
        // });
        // -----------------------

        var deformerData = pointsToDeformerCurves(
            strokePointsToPoints(strokePoints, undefined, false),
            undefined, undefined, !_isChainClosed, false);

        MessageLog.trace('----->\n' + JSON.stringify(deformerData, true, '  '));

        deformerData.forEach(function(_deformerData, i) {
            setAttrValues(_nodes[i].node, _deformerData.attrs, undefined, false);
        });

    });

}










/// ============================================================
/*

██    ██ ████████ ██ ██      ███████ 
██    ██    ██    ██ ██      ██      
██    ██    ██    ██ ██      ███████ 
██    ██    ██    ██ ██           ██ 
 ██████     ██    ██ ███████ ███████ 
                                     

*/
// UTILS

//
function _exec(_name, _action) {

    // MessageLog.trace('>>> '+_name);

    scene.beginUndoRedoAccum(_name);

    try {

        _action();

    } catch (err) {
        MessageLog.trace('Error: ' + _name + ': ' + err);
    }

    scene.endUndoRedoAccum();

}



//
function isChainClosed(_nodes) {
    if (!_nodes) return null;
    return node.getTextAttr(_nodes[_nodes.length - 1], frame.current(), 'closePath') === 'Y';
}

//
function isClosedDefNode(_node) {
    return node.getTextAttr(_node, 1, 'closePath') === 'Y';
}

//
function getSelectedDeformers() {
    var _nodes = selection.selectedNodes().filter(function(_node) {
        return isDefNode(_node) || isOffsetNode(_node);
    });
    // MessageLog.trace(_nodes.join('\n'));
    return _nodes;
}


//
function isDefNode(_node) {
    var type = node.type(_node);
    return type === 'CurveModule' || type === 'OffsetModule';
}


//
function isOffsetNode(_node) {
    return node.type(_node) === 'OffsetModule';
}

//
function getParentNode(_node) {
    return node.srcNode(_node, 0);
}

function getParentDefNode(_node, deformerChain) {

    if (isOffsetNode(_node) && deformerChain) {
        var lastNode = deformerChain[deformerChain.length - 1];
        return node.getTextAttr(lastNode, 1, 'closePath') === 'Y' ? lastNode : null;
    }

    var parentNode = getParentNode(_node);
    return isDefNode(parentNode) ? parentNode : null;

}

function getNextNode(_node) {
    return node.dstNode(_node, 0, 0);
}

function getNextDefNode(_node, deformerChain) {

    var nextNode = getNextNode(_node);

    if (!isDefNode(nextNode) && deformerChain) {
        return node.getTextAttr(_node, 1, 'closePath') === 'Y' ? deformerChain[0] : null;
    }

    return isDefNode(nextNode) ? nextNode : null;

}

//
function getDeformerNodes(_nodes, _frame) {

    var offsetNode = getOffsetNode(_nodes[0]);
    if (!offsetNode) return;
    // MessageLog.trace('offsetNode '+offsetNode );
    // MessageLog.trace('--> '+node.getAllAttrKeywords(offsetNode).join('\n') );

    var curves = [getCurveData(offsetNode, _frame)];
    getCurveNodes(offsetNode, curves, _frame);
    // MessageLog.trace('--> '+node.getAllAttrKeywords(curves[curves.length-1]).join('\n') );

    return curves;
}


//
function getOffsetNode(_node) {

    if (!isDefNode(_node)) return;
    if (isOffsetNode(_node)) return _node;

    var inputCount = node.numberOfInputPorts(_node);
    for (var i = 0; i < inputCount; i++) {
        var inNode = node.srcNode(_node, i);
        if (!isDefNode(inNode)) continue;
        return getOffsetNode(inNode);
    }
}


//
function getCurveNodes(_node, curveList, _frame) {

    if (!isDefNode(_node)) return;

    var outputCount = node.numberOfOutputPorts(_node);
    var outputNodes = [];

    for (var i = 0; i < outputCount; i++) {

        var destNode = node.dstNode(_node, i, 0);
        if (!isDefNode(destNode)) continue;
        // MessageLog.trace(' => '+destNode);
        curveList.push(getCurveData(destNode, _frame));
        getCurveNodes(destNode, curveList, _frame);
    }
}


//
function fixOrientation(orientation) {
    orientation %= 360;
    if (orientation > 180) orientation -= 360;
    else if (orientation < -180) orientation += 360;
    return orientation;
}

//
function getCurveData(_node, _frame) {

    var data = {
        node: _node,
        name: node.getName(_node),
        type: node.type(_node)
    }

    node.getAllAttrKeywords(_node).forEach(function(attrName) {
        data[attrName] = node.getAttr(_node, _frame, attrName);
    });

    return data;
}


//
function getControlData(x0, y0, controls, i, x1, y1) {

    if (controls) {
        x1 = controls[i].x;
        y1 = controls[i].y;
    }

    var lengthCoef = controls ? 1 : .333;

    if (x0 === x1 && y0 === y1) {
        // MessageLog.trace('Same point!');
        lengthCoef = .333;

        if (i === 0) {
            x1 = controls[1].x;
            y1 = controls[1].y;
        } else {
            x1 = controls[0].x;
            y1 = controls[0].y;
        }
    }

    var dx = x1 - x0;
    var dy = y1 - y0;
    return {
        length: Math.sqrt(dx * dx + dy * dy) * lengthCoef,
        orientation: fixOrientation(Math.atan2(dy, dx) / Math.PI * 180 + (i === 1 ? 180 : 0)),
    };

}


//
function pointsToDeformerCurves(strokePoints, destNode, srcNode, dontClosePath, skipOffsetModule) {

    if (!strokePoints) return;
    if (strokePoints.length === 2) dontClosePath = true;

    var deformerCurves = [];

    strokePoints.forEach(function(pointData, i) {

        if (i === 0 && !skipOffsetModule) {

            deformerCurves.push({
                name: 'Offset',
                type: 'OffsetModule',
                src: srcNode,
                attrs: {
                    SEPARATE: true,
                    localReferential: false,
                    "offset.x": pointData.x0,
                    "offset.y": pointData.y0,
                }
            })

        }

        if (strokePoints.length === 1 && !pointData.controls) return;

        // Same point
        if (Math.abs(pointData.x0 - pointData.x1) < .001 && Math.abs(pointData.y0 - pointData.y1) < .001 && !pointData.controls) return;

        var control0 = getControlData(pointData.x0, pointData.y0, pointData.controls, 0, pointData.x1, pointData.y1);
        var control1 = getControlData(pointData.x1, pointData.y1, pointData.controls, 1, pointData.x0, pointData.y0);
        var _pointData = {
            name: 'Curve',
            type: 'CurveModule',
            attrs: {
                SEPARATE: true,
                localReferential: false,
                "offset.x": pointData.x1,
                "offset.y": pointData.y1,
                length0: control0.length,
                orientation0: control0.orientation,
                length1: control1.length,
                orientation1: control1.orientation,
            }
        };

        if (i === 0 && skipOffsetModule) _pointData.src = srcNode;

        deformerCurves.push(_pointData);

        if (i === strokePoints.length - 1) {

            _pointData.dest = destNode;

            if (pointData.x1 === strokePoints[0].x0 && pointData.y1 === strokePoints[0].y0) {
                _pointData.attrs.closePath = dontClosePath || true;
            }
        }

    });

    // MessageLog.trace('?? ' + JSON.stringify(deformerCurves, true, '  '));
    return deformerCurves;

}

//
function strightenBezier(_nodes) {

    _nodes.forEach(function(_node, i) {

        var type = node.type(_node);
        var name = node.getName(_node);

        // MessageLog.trace(i+' =>  '+name+'['+type+']' );
        MessageLog.trace(node.getAllAttrNames(_node).join('\n'));

    });

}



//
function getChildNodes(_node) {
    var numOutput = node.numberOfOutputPorts(_node);
    var listOfDestinationNodes = [];
    for (var i = 0; i < numOutput; i++)
        listOfDestinationNodes.push(node.dstNode(_node, i, 0));
    return listOfDestinationNodes;
}


//
function getAttrValue(_node, attrName, _frame) {

    if (_frame === undefined) _frame = frame.current();

    var attr = node.getAttr(_node, _frame, attrName);
    if (!attr) return null;

    var val;

    var columnName = node.linkedColumn(_node, attrName);
    if (columnName && func.numberOfPoints(columnName)) {
        val = Number(column.getEntry(columnName, 0, _frame));
    } else {
        val = attr.doubleValueAt(_frame);
    }

    // MessageLog.trace(_node + ' > ' + attrName + ' > ' + val + ' > ' + typeof val);
    return val;

}


//
function getDeformerAttrs(defNode, applyMode, _frame) {

    if (_frame === undefined) _frame = frame.current();

    var defData = {
        node: defNode,
        attrs: {}
    };

    Object.keys(restingAttrNames).forEach(function(attrName) {

        // if (applyMode === MODE_CURRENT || applyMode === MODE_BOTH) defData.attrs[attrName] = node.getTextAttr(defNode, _frame, attrName);
        if (applyMode === MODE_CURRENT || applyMode === MODE_BOTH) defData.attrs[attrName] = getAttrValue(defNode, attrName, _frame);

        if (applyMode === MODE_RESTING || applyMode === MODE_BOTH) {
            var restingAttr = restingAttrNames[attrName];
            // defData.attrs[restingAttr] = node.getTextAttr(defNode, _frame, restingAttr);
            defData.attrs[restingAttr] = getAttrValue(defNode, restingAttr, _frame);
        }

    });

    return defData;

}


//
function getDeformerPointPosition(_node, resting, asStroke, parentPoint, _frame) {

    var point = {
        x: getAttrValue(_node, resting ? restingAttrNames['offset.x'] : 'offset.x', _frame),
        y: getAttrValue(_node, resting ? restingAttrNames['offset.y'] : 'offset.y', _frame),
        length0: getAttrValue(_node, resting ? restingAttrNames['length0'] : 'length0', _frame),
        orientation0: getAttrValue(_node, resting ? restingAttrNames['orientation0'] : 'orientation0', _frame),
        length1: getAttrValue(_node, resting ? restingAttrNames['length1'] : 'length1', _frame),
        orientation1: getAttrValue(_node, resting ? restingAttrNames['orientation1'] : 'orientation1', _frame)
    };

    // MessageLog.trace('getDeformerPointPosition: ' + JSON.stringify(point, true, '  '));

    if (!asStroke) return point;

    var angle0 = (point.orientation0) / 180 * Math.PI;
    var angle1 = (point.orientation1 + 180) / 180 * Math.PI;
    // MessageLog.trace('A: '+angle0+', '+point.length0+'\n'+JSON.stringify(point,true,'  '));
    var strokePoint = [{
            x: point.x + Math.cos(angle1) * point.length1,
            y: point.y + Math.sin(angle1) * point.length1
        },
        {
            onCurve: true,
            x: point.x,
            y: point.y
        }
    ];

    if (!parentPoint) return strokePoint;

    strokePoint.unshift({
        onCurve: true,
        x: parentPoint.x,
        y: parentPoint.y
    }, {
        x: parentPoint.x + Math.cos(angle0) * point.length0,
        y: parentPoint.y + Math.sin(angle0) * point.length0
    });

    return strokePoint;

}


//
function getValidDeformerAttrName(attrName) {
    return validDeformerAttrNames[attrName] || attrName;
}


//
function _setAttrValue(_node, attrName, value, _frame) {
    if (_frame === undefined) _frame = frame.current();
    var attr = node.getAttr(_node, _frame, attrName);
    if (!attr) return;
    // MessageLog.trace('=>'+ _node+', '+attrName+', '+value );
    var columnName = node.linkedColumn(_node, attrName);
    if (columnName) {
        val = column.setEntry(columnName, 0, _frame, value);
    } else attr.setValueAt(value, _frame);
}


//
function setAttrValues(_nodes, attrs, _frame, applyMode, value) {

    // MessageLog.trace('applyMode: ' + applyMode + '\n' + JSON.stringify(attrs, true, '  ') + '\n -> ' + _frame + ', ' + applyMode + ', ' + value);
    if (!applyMode) applyMode = MODE_CURRENT;
    if (_frame === undefined) _frame = frame.current();
    if (typeof _nodes === 'string') _nodes = [_nodes];

    _nodes.forEach(function(_node) {

        if (typeof attrs === 'string') {
            _set(_node, attrs, value);
            return;
        }

        Object.keys(attrs).forEach(function(attrName) {

            // MessageLog.trace('+> ' + _node + ' >> ' + attrName+' => '+attrs[attrName]);
            attrName = getValidDeformerAttrName(attrName);
            _set(_node, attrName, attrs[attrName]);

        });

    });

    function _set(_node, attrName, _value) {

        if (applyMode === MODE_BOTH || applyMode === MODE_CURRENT)
            // node.setTextAttr(_node, attrName, _frame, _value);
            _setAttrValue(_node, attrName, _value, _frame);

        // MessageLog.trace( '-> '+_node+' >> '+attrName+' >> '+_frame+' >> '+_value );
        if (applyMode === MODE_BOTH || applyMode === MODE_RESTING) {
            var restingAttrName = restingAttrNames[attrName];
            if (restingAttrName)
                // node.setTextAttr(_node, restingAttrName, _frame, _value);
                _setAttrValue(_node, restingAttrName, _value, _frame);
        }

    }

}


//
function getCenter(_nodes, side, attrName) {

    // MessageLog.trace('getCenter: '+side+' >> '+attrName );
    var currentFrame = frame.current();
    var center = side > 0 ? -999999 : 999999;
    var centers = [];

    _nodes.forEach(function(_node) {
        // MessageLog.trace('--> '+node.getAllAttrKeywords(_node).join('\n') );

        var val = getAttrValue(_node, attrName);
        if (val === null) return;

        // MessageLog.trace('--> '+val+' ? '+center+' >>> '+node.getTextAttr(_node,currentFrame,attrName) );
        switch (side) {
            case -1:
                if (val < center) center = val;
                break;
            case 0:
                centers.push(val);
                break;
            case 1:
                if (val > center) center = val;
                break;
        }
    });

    // MessageLog.trace('Centers: '+centers);
    if (side === 0) center = centers.reduce(function add(acc, a) { return acc + a; }, 0) / centers.length;
    // MessageLog.trace('Center: '+center);
    return center;

}


//
function getDeformersChain(_nodes, withPoints) {

    if (!_nodes) _nodes = getSelectedDeformers();
    if (typeof _nodes === 'string') _nodes = [_nodes];
    if (!_nodes || !_nodes.length) return;

    var offsetNode;
    var _node = _nodes[0];

    if (isOffsetNode(_node)) {

        offsetNode = _node;

    } else {

        for (var i = 0; i < 100; i++) {
            _node = getParentNode(_node);
            if (isOffsetNode(_node)) {
                offsetNode = _node;
                break;
            }
            // MessageLog.trace(i+') '+_node);
        }

    }

    if (!offsetNode) return;

    // MessageLog.trace('->>'+offsetNode);

    var deformerChain = [offsetNode];

    var currentNode = offsetNode;
    for (var i = 0; i < 100; i++) {
        var children = getChildNodes(currentNode);
        if (!children || !children.length) break;
        var defIsFound = false;
        children.every(function(_node) {
            if (!isDefNode(_node)) return true;
            currentNode = _node;
            deformerChain.push(_node);
            defIsFound = true;
            // MessageLog.trace(i+')'+_node);
        });
        if (!defIsFound) break;
    }

    // MessageLog.trace('deformerChain:'+JSON.stringify(deformerChain,true,'  '));
    return withPoints ? getPointsOfDeformerChain(deformerChain) : deformerChain;

}

function getPointsOfDeformerChain(_nodes) {
    if (!_nodes || !_nodes.length) return;
    var prevNodeData;
    return _nodes.map(function(_node, i) {
        var parentPointIndex = i < 2 ? 1 : 3;
        var nodeData = {
            node: _node,
            isOffset: isOffsetNode(_node),
            index: i,
            points: getDeformerPointPosition(_node, false, true, prevNodeData ? prevNodeData.points[parentPointIndex] : undefined),
            pointsResting: getDeformerPointPosition(_node, true, true, prevNodeData ? prevNodeData.pointsResting[parentPointIndex] : undefined)
        }
        prevNodeData = nodeData;
        return nodeData;
    });
}

//
function midPointAt(p1, p2, t) {
    var x = (p1.x * (1 - t) + p2.x * t);
    var y = (p1.y * (1 - t) + p2.y * t);
    return Point2d(parseFloat(x.toFixed(20)), parseFloat(y.toFixed(20)));
}


//
function getCorners(curDrawing, artIndex) {

    var fr = frame.current();
    var corners = [{}, {}, {}];
    // MessageLog.trace('>>>>> '+artIndex);
    for (var at = 0; at < 4; at++) {
        var shapeInfo = { drawing: { node: curDrawing, frame: fr }, art: at };
        var box = Drawing.query.getBox(shapeInfo);
        // MessageLog.trace('> '+ JSON.stringify( box, true, '  ' ) );
        if (artIndex !== undefined && at !== artIndex) continue;

        if (box == false || "empty" in box)
            continue;

        else if (!("x" in corners[0])) // if corners array is empty
        {
            corners[0].x = box.x0;
            corners[0].y = box.y0;
            corners[1].x = box.x1;
            corners[1].y = box.y1;
        } else {
            corners[0].x = Math.min(box.x0, corners[0].x);
            corners[0].y = Math.min(box.y0, corners[0].y);
            corners[1].x = Math.max(box.x1, corners[1].x);
            corners[1].y = Math.max(box.y1, corners[1].y);
        }
    }

    return corners;

}


//
function generateDeformersNodes(parentNode, nodeViewX, nodeViewY, deformers) {

    var nodeViewYStep = 40;
    var currentFrame = frame.current();

    deformers.forEach(function(deformerData, i) {

        deformerData.node = NodeUtils.createNode(
            parentNode,
            deformerData.name,
            deformerData.type,
            nodeViewX,
            nodeViewY += nodeViewYStep,
            i == 0 ? deformerData.src : deformers[i - 1].node,
            deformerData.dest
        );

        setAttrValues(deformerData.node, deformerData.attrs, currentFrame, MODE_BOTH);
        /*Object.keys(deformerData.attrs).forEach(function(attrName) {
            node.setTextAttr(deformerData.node, attrName, currentFrame, deformerData.attrs[attrName]);
            var restingAttrName = restingAttrNames[attrName];
            if (restingAttrName)
                node.setTextAttr(deformerData.node, restingAttrName, currentFrame, deformerData.attrs[attrName]);
        });
        */

    });

}


//
function strokePointsToPoints(strokePoints, center, reversePath) {

    if (!strokePoints) return;

    if (reversePath) strokePoints = strokePoints = strokePoints.reverse();
    var points = [];
    var currentPoint;

    function startNewCurrentPoint(x, y) {

        // var dx = x - center.x;
        // var dy = y - center.y;
        // var angleToCenter = Math.atan2(dy, dx);
        currentPoint = {
            x0: x,
            y0: y,
            controls: [],
            // angleToCenter: angleToCenter,
            // orientedAngle: angleToCenter >= 0 ? angleToCenter : 100 + angleToCenter,
            // distToCenter: Math.sqrt(dx * dx + dy * dy)
        };

    }

    var firstPoint = strokePoints[0];
    var lastPoint = strokePoints[strokePoints.length - 1];
    var pathIsClosed = firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y;


    if (pathIsClosed && center) {

        // Find a top center point    
        var topPoint;
        var topPointIndex;

        strokePoints.forEach(function(pointData, pi) {

            pointData.i = pi;

            if (!pointData.onCurve) return;

            if (!topPoint) {
                topPoint = { x: Math.abs(pointData.x - center.x), y: pointData.y - center.y };
                topPointIndex = pi;
            } else {
                var x = Math.abs(pointData.x - center.x);
                var y = pointData.y - center.y;
                if (x < topPoint.x && y >= topPoint.y) {
                    topPoint = { x: x, y: y }
                    topPointIndex = pi;
                }
            }

        });

        if (topPointIndex) {
            var _strokePoints = strokePoints.splice(0, topPointIndex + 1);
            strokePoints.unshift(_strokePoints[_strokePoints.length - 1]);
            strokePoints = strokePoints.concat(_strokePoints);
        }

    }

    strokePoints.forEach(function(pointData, pi) {

        // MessageLog.trace(pi + '] ' + JSON.stringify(pointData));

        var x = pointData.x;
        var y = pointData.y;

        if (pointData.onCurve) {

            if (!currentPoint) {

                startNewCurrentPoint(x, y);

            } else {

                currentPoint.x1 = x;
                currentPoint.y1 = y;
                if (!currentPoint.controls.length) delete currentPoint.controls;
                points.push(currentPoint);

                startNewCurrentPoint(x, y);

            }

        } else {

            if (!currentPoint) {

                startNewCurrentPoint(x, y);

            } else {

                currentPoint.controls.push({
                    x: x,
                    y: y
                });

            }

        }

    });

    // MessageLog.trace(' currentPoint ==> ' + JSON.stringify(currentPoint, true, '  '));
    // MessageLog.trace('==> ' + JSON.stringify(points, true, '  '));
    if (!points.length && currentPoint) {
        delete currentPoint.controls;
        return [currentPoint];
    }

    return points;

}



//
function getRectangleStrokes(center, wh, hh) {

    return Drawing.geometry.createRectangle({
        x0: center.x - wh,
        y0: center.y + hh,
        x1: center.x + wh,
        y1: center.y - hh
    });

}


//
function getCircleStrokes(center, wh, hh) {

    return Drawing.geometry.createCircle({
        x: center.x,
        y: center.y,
        radiusX: wh,
        radiusY: hh,
    });

}


function getArtStrokesData(curDrawing, artIndex) {

    var settings = Tools.getToolSettings();
    if (!settings.currentDrawing) return;
    var fr = frame.current();
    var config = {
        drawing: { node: curDrawing, frame: fr },
        art: artIndex
    };
    var strokes = Drawing.query.getStrokes(config);
    if (!strokes) return;

    var points = [];
    strokes.layers.forEach(function(layerData, li) {
        layerData.strokes.forEach(function(strokeData, si) {
            // MessageLog.trace('STROKE: '+si+' > '+JSON.stringify(strokeData,true,'  '));
            if (strokeData.shaderRight === 0) strokeData.path = strokeData.path.reverse();
            strokeData.path.forEach(function(pointData, pi) {
                pointData.x = scene.fromOGLX(pointData.x / 1875);
                pointData.y = scene.fromOGLY(pointData.y / 1875);
                points.push(pointData);
            });
        });
    });



    return points;

}

//
function getStrokesFromChain(_nodes) {

    var _deformers = getPointsOfDeformerChain(_nodes);

    var strokes = [];
    var strokesResting = [];

    _deformers.forEach(function(nodeData) {
        strokes = strokes.concat(nodeData.points.splice(1, 3));
        strokesResting = strokesResting.concat(nodeData.pointsResting.splice(1, 3));
    });

    return {
        strokes: strokes,
        strokesResting: strokesResting
    };

}