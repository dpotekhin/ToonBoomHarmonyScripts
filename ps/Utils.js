/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.1
*/

//
function getNumber(v) {
    if (typeof v !== 'string') return v;
    return parseFloat(v.replace(',', '.'));
}


//
function getTimestamp() {
    var date = new Date();
    return date.getFullYear() + '' + getZeroLeadingString(date.getMonth() + 1) + getZeroLeadingString(date.getDate()) + '_' + getZeroLeadingString(date.getHours()) + getZeroLeadingString(date.getMinutes());
}


//
function getZeroLeadingString(v, digits) {
    v = '' + v;
    return '000000000000000000'.substr(0, (digits || 2) - v.length) + v;
}

//
// TODO: I Did not find yet how to convert Drawing Grid coordinates to pixels.
var gridWidth = 1875;

function gridToPixelsX(x) {
    return x / (scene.numberOfUnitsX() / 2) * (gridWidth * (scene.unitsAspectRatioX() / scene.unitsAspectRatioY()));
}

function gridToPixelsY(y) {
    return y / (scene.numberOfUnitsY() / 2) * gridWidth;
}

function pixelsToGridX(x) {
    return x / (gridWidth * (scene.unitsAspectRatioX() / scene.unitsAspectRatioY())) * (scene.numberOfUnitsX() / 2);
}

function pixelsToGridY(y) {
    return y / gridWidth * (scene.numberOfUnitsY() / 2);
}

//
function getPointGlobalPosition(_node, _point, _frame) {
    if (!_frame) _frame = frame.current();
    if (!_point) _point = node.getPivot(_node, _frame);
    var nodeMatrix = node.getMatrix(_node, _frame);
    var pos = nodeMatrix.multiply(_point);
    pos = scene.fromOGL(pos);
    return pos;
}

function findParentPeg(_node) {
    var numSubNodes = node.numberOfSubNodes(_node);
    var src = node.srcNode(_node, 0);
    for (var nd = 0; nd < numSubNodes; nd++) {
        if (src == "")
            return "";

        else if (node.type(src) == "PEG")
            return src;

        src = node.srcNode(src, 0);
    }
    return "";
}

//
function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
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

function getFullAttributeList(nodePath, frame, onlyNames) {
    var attributeList = [];
    var topAttributeList = node.getAttrList(nodePath, frame);
    for (var i = 0; i < topAttributeList.length; ++i) {
        getAttributes(topAttributeList[i], attributeList);
    }
    if (onlyNames) {
        attributeList = attributeList.map(function(attr) {
            return attr.fullKeyword();
        });
    }
    return attributeList;
}


//
function getLinkedAttributeNames(_node) {
    var linkedAttrs = [];
    getFullAttributeList(_node, 1, true).forEach(function(attrName, i) {
        var _column = node.linkedColumn(_node, attrName);
        // MessageLog.trace( i+') '+attrName+', '+_column  );
        if (_column) linkedAttrs.push(attrName);
    });
    return linkedAttrs;
}

//
function getAnimatableAttrs(_node) {

    function getAnimatableAttrs(argNode, validAttrList, parAttrName, col) {
        var attrList = node.getAttrList(argNode, 1, parAttrName);

        for (var at = 0; at < attrList.length; at++) {
            var attrName = attrList[at].keyword();
            // if current attr is a sub-attr, append parent attr's name
            if (parAttrName !== "") {
                attrName = parAttrName + "." + attrName;
            }

            // check if attr is linked to a column
            var colName = node.linkedColumn(argNode, attrName);
            if (colName == "") // not linked
            {
                // check if the attr is linkable
                node.linkAttr(argNode, attrName, col);
                var colName2 = node.linkedColumn(argNode, attrName);
                if (colName2 == col) {
                    validAttrList.push(attrName);
                    node.unlinkAttr(argNode, attrName);
                }
            } else // linked
            {
                validAttrList.push(attrName);
            }

            // check for sub-attrs
            var subAttrCheck = node.getAttrList(argNode, 1, attrName);
            if (subAttrCheck.length > 0) {
                var subList = getAnimatableAttrs(argNode, [], attrName, col);
                validAttrList.push.apply(validAttrList, subList);
            }
        }
        return validAttrList;
    }

    var testCol = "ATV-testCol___";
    column.add(testCol, "BEZIER");

    var animatableAttrs = getAnimatableAttrs(_node, [], "", testCol);

    column.removeUnlinkedFunctionColumn(testCol);

    return animatableAttrs;
}

function eachAnimatableAttr(_node, callback) {
    _node = _node === true ? selection.selectedNode(0) : _node;
    var animatableAttrs = getAnimatableAttrs(_node);
    animatableAttrs.forEach(function(attrName, i) {
        callback(attrName, i, _node);
    });
}



//
function getSoundColumns(count) {

    if (count === undefined) count = 99999;
    var soundColumns = [];

    for (var i = 0; i < Timeline.numLayers && soundColumns.length < count; i++) {

        if (Timeline.layerIsColumn(i)) {
            var _columnName = Timeline.layerToColumn(i);
            if (column.type(_columnName) === 'SOUND') {
                soundColumns.push(_columnName);
            }
        }

    }

    return soundColumns;

}


//
function getUnusedColumnName(name) {

    name = name ? name.replace(/\s/gi, '_').replace(/[^a-zA-Z0-9_-]+/gi, '') : undefined;
    if (!name) return;

    if (!column.type(name)) return name;

    for (var i = 1; i < 999; i++) {

        var _name = name + '_' + i;
        if (!column.type(_name)) return _name;

    }

}



//
function createUid() {
    return QUuid.createUuid().toString().replace(/{|}/g, '');
}


///
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

//
function rgbToHex(r, g, b, a, ignoreAlpha) { // alternate params: ColorRGBA, useAlpha
    // return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    if (b === undefined) {
        g = r.g;
        b = r.b;
        if (g) a = r.a;
        r = r.r;
    }
    var result = componentToHex(r) + componentToHex(g) + componentToHex(b);
    if (a !== undefined && !ignoreAlpha) result += componentToHex(a);
    return result;
}


//
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    if (!result) return null;
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: parseInt(result[4], 16)
    };
}


// Object.assign polyfill
if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target, firstSource) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}


//
Math.sign = function(v) {
    if (!v) return 0;
    return v < 0 ? -1 : 1;
}

//
Math.signp = function(v) {
    return v < 0 ? -1 : 1;
}

//
exports = {
    gridWidth: gridWidth,
    getTimestamp: getTimestamp,
    getZeroLeadingString: getZeroLeadingString,
    gridToPixelsX: gridToPixelsX,
    gridToPixelsY: gridToPixelsY,
    pixelsToGridX: pixelsToGridX,
    pixelsToGridY: pixelsToGridY,
    getPointGlobalPosition: getPointGlobalPosition,
    findParentPeg: findParentPeg,
    getFullAttributeList: getFullAttributeList,
    isFunction: isFunction,
    getAnimatableAttrs: getAnimatableAttrs,
    getLinkedAttributeNames: getLinkedAttributeNames,
    eachAnimatableAttr: eachAnimatableAttr,
    createUid: createUid,
    rgbToHex: rgbToHex,
    hexToRgb: hexToRgb,
    getSoundColumns: getSoundColumns,
    getUnusedColumnName: getUnusedColumnName,
    getNumber: getNumber,
};