/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version 0.220731
*/


var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));

///
var COLORART = 1;
var LINEART = 2;

///
exports = {
    RESTING: 1,
    CURRENT: 2,
    COLORART: COLORART,
    LINEART: LINEART,
    alignVertically: alignVertically,
    alignHorizontally: alignHorizontally,
    orientControlPoints: orientControlPoints,
    distributeControlPoints: distributeControlPoints,
    generateCircleDeformer: generateCircleDeformer,
    generateRectDeformer: generateRectDeformer,
    generateArtDeformer: generateArtDeformer,
    moveDeformersAround: moveDeformersAround,
    insertDeformerCurve: insertDeformerCurve,
    removeDeformerCurve: removeDeformerCurve,
    generateDeformer: generateDeformer,
}

var restingAttrNames = {
    "offset.x": "restingOffset.x",
    "offset.y": "restingOffset.y",
    Length0: "restLength0",
    Length1: "restLength1",
    orientation0: "restingOrientation0",
    orientation1: "restingOrientation1",
};




/*
 █████  ██      ██  ██████  ███    ██ 
██   ██ ██      ██ ██       ████   ██ 
███████ ██      ██ ██   ███ ██ ██  ██ 
██   ██ ██      ██ ██    ██ ██  ██ ██ 
██   ██ ███████ ██  ██████  ██   ████ 
*/

//
function alignVertically(side, applyToResting) {

    _exec('Align Deformer Points Vertically', function() {

        var _nodes = getSelectedDeformers();
        if (!_nodes) return;

        var center = getCenter(_nodes, side, 'offset.X');
        if (applyToResting) applyAttrValue(_nodes, 'restingOffset.X', center);
        applyAttrValue(_nodes, 'offset.X', center);

    });
}

//
function alignHorizontally(side, applyToResting) {

    _exec('Align Deformer Points Horizontally', function() {

        var _nodes = getSelectedDeformers();
        if (!_nodes) return;

        var center = getCenter(_nodes, side, 'offset.Y');
        if (applyToResting) applyAttrValue(_nodes, 'restingOffset.Y', center);
        applyAttrValue(_nodes, 'offset.Y', center);

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
function orientControlPoints(_nodes, applyToResting, useEntireChain) {

    _exec('Orient Control Points', function() {

        // MessageLog.trace('orientControlPoints ' + applyToResting + ', ' + useEntireChain + ' > ' + _nodes.join(', '));

        if (!_nodes) _nodes = useEntireChain ? getDeformersChain() : getSelectedDeformers();
        if (!_nodes) return;

        _nodes.forEach(function(_node) {

            if (isOffsetNode(_node)) {

            } else {

                var targetNode = getParentNode(_node);
                if (!targetNode || !(isOffsetNode(_node) || isDefNode(_node))) return;
                // if node is the last of a closed deformer
                // MessageLog.trace('>-> ' + node.getTextAttr(_node, 1, 'closePath'));

                var srcNode = _node;
                if (node.getTextAttr(_node, 1, 'closePath') === 'Y') {
                    srcNode = (getDeformersChain(_node) || [])[0];
                    if (!srcNode) return;
                }

                var targetPos = getDeformerPointPosition(targetNode);
                var pos = getDeformerPointPosition(srcNode);
                var ang = Math.atan2(pos.y - targetPos.y, pos.x - targetPos.x) / Math.PI * 180;

                if (applyToResting) {
                    applyAttrValue(_node, 'restingOrientation0', ang);
                    applyAttrValue(_node, 'restingOrientation1', ang);
                }

                applyAttrValue(_node, 'orientation0', ang);
                applyAttrValue(_node, 'orientation1', ang);

                // MessageLog.trace('-> SF: '+_node+'('+pos.x+','+pos.y+')' );
                // MessageLog.trace('-> PR: '+targetNode+' ('+targetPos.x+','+targetPos.y+')' );
                // MessageLog.trace('->: '+(pos.y - targetPos.y)+' > '+ (pos.x - targetPos.x) +' >> '+Math.atan2( pos.y - targetPos.y, pos.x - targetPos.x ));
                // MessageLog.trace(ang);
                // MessageLog.trace('--> '+node.getAllAttrKeywords(_node).join('\n') );

            }

        });

    });

}


//
function distributeControlPoints(_nodes, applyToResting, useEntireChain) {

    _exec('Distribute Control Points', function() {

        if (!_nodes) _nodes = useEntireChain ? getDeformersChain() : getSelectedDeformers();
        if (!_nodes) return;

        _nodes.forEach(function(_node) {

            if (isOffsetNode(_node)) {

            } else {

                var targetNode = getParentNode(_node);
                if (!targetNode || !(isOffsetNode(_node) || isDefNode(_node))) return;

                var srcNode = _node;
                if (node.getTextAttr(_node, 1, 'closePath') === 'Y') {
                    srcNode = (getDeformersChain(_node) || [])[0];
                    if (!srcNode) return;
                }

                var targetPos = getDeformerPointPosition(targetNode);
                var pos = getDeformerPointPosition(srcNode);
                var dx = pos.x - targetPos.x;
                var dy = pos.y - targetPos.y;
                var hypo = Math.sqrt(dx * dx + dy * dy);
                var length = hypo / 3;

                if (applyToResting) {
                    applyAttrValue(_node, 'restLength0', length);
                    applyAttrValue(_node, 'restLength1', length);
                }

                applyAttrValue(_node, 'length0', length);
                applyAttrValue(_node, 'length1', length);

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

    // MessageLog.trace('==> ' + JSON.stringify(points, true, '  '));
    return points;
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
        orientation: Math.atan2(dy, dx) / Math.PI * 180 + (i === 1 ? 180 : 0),
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
                Length0: control0.length,
                orientation0: control0.orientation,
                Length1: control1.length,
                orientation1: control1.orientation,
            }
        };

        if (i === 0 && skipOffsetModule) _pointData.src = srcNode;

        deformerCurves.push(_pointData);

        if (i === strokePoints.length - 1) {

            _pointData.dest = destNode;

            if (pointData.x1 === strokePoints[0].x0 && pointData.y1 === strokePoints[0].y0) {
                _pointData.attrs.closePath = dontClosePath;
            }
        }

    });

    // MessageLog.trace('?? ' + JSON.stringify(deformerCurves, true, '  '));
    return deformerCurves;

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
- add the ability to not change the binding state
- take into account the inheritance of parent transformations
*/

function moveDeformersAround(direction) {

    _exec('Move Deformers Around', function() {

        var _deformers = getDeformersChain();
        if (!_deformers) return;
        // MessageLog.trace("moveDeformersAround: "+JSON.stringify(_deformers,true,'  '));

        var currentFrame = frame.current();

        _deformers = _deformers.map(function(defNode, i) {

            var defData = {
                node: defNode,
                attrs: {}
            };

            Object.keys(restingAttrNames).forEach(function(attrName) {
                defData.attrs[attrName] = node.getTextAttr(defNode, currentFrame, attrName);
                var restingAttr = restingAttrNames[attrName];
                defData.attrs[restingAttr] = node.getTextAttr(defNode, currentFrame, restingAttr);
            });

            return defData;

        });

        // MessageLog.trace("=> "+JSON.stringify(_deformers,true,'  '));
        var swapDefNodeI;
        _deformers.forEach(function(defNode, i) {
            /*
            var swapDefNodeI = direction === 'left' ? i+1 : i-1;
            if( swapDefNodeI < 0 ) swapDefNodeI = _deformers.length-1;
            if( swapDefNodeI > _deformers.length ) swapDefNodeI = 0;
            */
            if (direction === 'left') {

                swapDefNodeI = i === _deformers.length - 1 ? 1 : i + 1;

            } else {

                swapDefNodeI = i <= 1 ? _deformers.length - 2 + i : i - 1;

            }
            // MessageLog.trace(i+') '+swapDefNodeI+') ');
            var swapDefNode = _deformers[swapDefNodeI];
            // MessageLog.trace(defNode.node+' > '+swapDefNode.node);
            setAttrValues(defNode.node, swapDefNode.attrs, currentFrame);
        });

    });

}



/*
██╗███╗   ██╗███████╗███████╗██████╗ ████████╗     ██████╗██████╗ 
██║████╗  ██║██╔════╝██╔════╝██╔══██╗╚══██╔══╝    ██╔════╝██╔══██╗
██║██╔██╗ ██║███████╗█████╗  ██████╔╝   ██║       ██║     ██████╔╝
██║██║╚██╗██║╚════██║██╔══╝  ██╔══██╗   ██║       ██║     ██╔═══╝ 
██║██║ ╚████║███████║███████╗██║  ██║   ██║       ╚██████╗██║     
╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝        ╚═════╝╚═╝     
*/

/*
TODO:
- take into account the inheritance of parent transformations
*/

function insertDeformerCurve() {


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
            var parentPos = getDeformerPointPosition(parentNode, true, true);
            var deformerPos = getDeformerPointPosition(deformerNode, true, true, parentPos[1]);
            MessageLog.trace('insertDeformerCurve: ' + i + ':\ndeformerNode: ' + deformerNode + '\nparentNode: ' + parentNode);
            MessageLog.trace(i + ') ' + JSON.stringify(deformerPos, true, '  ') + ' > ' + JSON.stringify(parentPos, true, '  '));

            var newDeformerPath = Drawing.geometry.insertPoints({
                path: deformerPos,
                params: [0.5]
            });
            MessageLog.trace('newDeformerPath: '+JSON.stringify(newDeformerPath,true,'  '));
            var newDeformerPoints = newDeformerPath.splice(0, 4);
            var newDeformerData = pointsToDeformerCurves(
                strokePointsToPoints(
                    newDeformerPoints,
                    undefined, false),
                deformerNode, parentNode, true, true);

            // MessageLog.trace('NEW PATH:' + JSON.stringify(newDeformerPath, true, '  ') + '\n---\n' + JSON.stringify(newDeformerData, true, '  '));

            generateDeformersNodes(
                node.parentNode(deformerNode),
                node.coordX(deformerNode) + 15,
                node.coordY(deformerNode) - (node.coordY(deformerNode) - node.coordY(parentNode) + node.height(deformerNode)) / 2, newDeformerData
            );

            // Update params of the old deformer
            newDeformerPath.unshift(newDeformerPoints[newDeformerPoints.length - 1]);
            var oldDeformerData = pointsToDeformerCurves(
                strokePointsToPoints(
                    newDeformerPath,
                    undefined, false),
                undefined, undefined, true, true);
            setAttrValues(deformerNode, oldDeformerData[0].attrs, undefined, true);

        });

    });

}









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

            node.deleteNode(deformerNode, true, true);

            // Update params of the next deformer
            var deformerData = pointsToDeformerCurves(
                strokePointsToPoints(
                    bezierPath,
                    undefined, false),
                undefined, undefined, true, true);
            setAttrValues(nextNode, deformerData[0].attrs, undefined, true);

            // MessageLog.trace(i + ') ' + JSON.stringify(deformerPos, true, '  ') + ' > ' + JSON.stringify(parentPos, true, '  '));
        });
    })
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
function isChainClosed(_nodes, _frame) {
    if (!_nodes) return null;
    return node.getTextAttr(_nodes[_nodes.length - 1], _frame || frame.current(), 'closePath') === 'Y';
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
function strightenBezier(_nodes) {

    _nodes.forEach(function(_node, i) {

        var type = node.type(_node);
        var name = node.getName(_node);

        // MessageLog.trace(i+' =>  '+name+'['+type+']' );
        MessageLog.trace(node.getAllAttrNames(_node).join('\n'));

    });

}


//
function getParentNode(_node) {
    return node.srcNode(_node, 0);
}

function getNextNode(_node) {
    return node.dstNode(_node, 0, 0);
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
function getAttrValue(_node, attrName) {

    var attr = node.getAttr(_node, currentFrame, attrName);
    if (!attr) return null;

    var currentFrame = frame.current();
    var val = attr.doubleValueAt(currentFrame);
    var columnName = node.linkedColumn(_node, attrName);
    if (columnName) {
        val = Number(column.getEntry(columnName, 0, currentFrame));
    }
    // MessageLog.trace(_node+' > '+attrName+' > '+val+' > '+typeof val);
    return val;
}

//
function getDeformerPointPosition(_node, resting, asStroke, parentPoint) {

    var point = {
        x: getAttrValue(_node, resting ? restingAttrNames['offset.x'] : 'offset.x'),
        y: getAttrValue(_node, resting ? restingAttrNames['offset.y'] : 'offset.y'),
        length0: getAttrValue(_node, resting ? restingAttrNames['Length0'] : 'Length0'),
        orientation0: getAttrValue(_node, resting ? restingAttrNames['orientation0'] : 'orientation0'),
        length1: getAttrValue(_node, resting ? restingAttrNames['Length1'] : 'Length1'),
        orientation1: getAttrValue(_node, resting ? restingAttrNames['orientation1'] : 'orientation1')
    };

    MessageLog.trace('getDeformerPointPosition: '+JSON.stringify(point,true,'  '));

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
function applyAttrValue(_nodes, attrName, value) {

    var currentFrame = frame.current();
    if (typeof _nodes === 'string') _nodes = [_nodes];

    _nodes.forEach(function(_node) {

        var attr = node.getAttr(_node, currentFrame, attrName);
        if (!attr) return;
        // MessageLog.trace('=>'+ _node+', '+attrName+', '+value );
        var columnName = node.linkedColumn(_node, attrName);
        if (columnName) {
            val = column.setEntry(columnName, 0, currentFrame, value);
        } else attr.setValueAt(value, currentFrame);

    });
}


//
function setAttrValues(_node, attrs, _frame, applyToResting) {
    if (_frame === undefined) _frame = frame.current();
    Object.keys(attrs).forEach(function(attrName) {
        node.setTextAttr(_node, attrName, _frame, attrs[attrName]);
        // MessageLog.trace( '-> '+_node+' >> '+attrName+' >> '+_frame+' >> '+attrs[attrName] );
        if (applyToResting) {
            var restingAttrName = restingAttrNames[attrName];
            if (restingAttrName)
                node.setTextAttr(_node, restingAttrName, _frame, attrs[attrName]);
        }
    });
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
function getDeformersChain(_nodes) {

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
    return deformerChain;
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

        setAttrValues(deformerData.node, deformerData.attrs, currentFrame, true);
        /*Object.keys(deformerData.attrs).forEach(function(attrName) {
            node.setTextAttr(deformerData.node, attrName, currentFrame, deformerData.attrs[attrName]);
            var restingAttrName = restingAttrNames[attrName];
            if (restingAttrName)
                node.setTextAttr(deformerData.node, restingAttrName, currentFrame, deformerData.attrs[attrName]);
        });
        */

    });

}