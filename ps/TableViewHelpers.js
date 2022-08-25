/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220825
*/

//
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/SelectionUtils.js"));

///
function checkNull(v1, v2) {
    if (v1 === null) return '';
    return v2;
}

function checkByValueType(val, equalTo) {

    if (!val) return equalTo !== undefined ? val === equalTo : false;

    if (typeof val === 'string') {
        // console.log('string');
        return equalTo !== undefined ? val === equalTo : !!val;
    }
    // Array
    if (Array.isArray(val)) {
        // console.log('array');
        return equalTo !== undefined ? val.length === equalTo : !!val.length;
    }

    // Number
    if (!isNaN(val)) {
        // console.log('number');
        return equalTo !== undefined ? val === equalTo : !!val;
    }

    return false

}


//
var helpers = {
	///
    checkNull: checkNull,
    checkByValueType: checkByValueType,
    returnEmpty: function() {},

    bgSuccess: new QBrush(new QColor('#004000')),
    bgFail: new QBrush(new QColor('#400000')),
    bgYellow: new QBrush(new QColor('#404000')),
    bgWarning: new QBrush(new QColor('#404000')),
    bgStrange: new QBrush(new QColor('#444400')),
    bgInfo: new QBrush(new QColor('#000044')),
    bgGray1: new QBrush(new QColor('#303030')),
    bgGray2: new QBrush(new QColor('#101010')),
    bgSuccessOrFail: function(v) { return checkNull(v, checkByValueType(v) ? helpers.bgSuccess : helpers.bgFail); },
    bgFailOnly: function(v) { return checkNull(v, checkByValueType(v) ? undefined : helpers.bgFail); },
    bgSuccessOrFailInverted: function(v) { return checkNull(v, !checkByValueType(v) ? helpers.bgSuccess : helpers.bgFail); },
    bgSuccessYellow: function(v) { return checkNull(v, checkByValueType(v) ? helpers.bgYellow : undefined); },
    bgFailYellow: function(v) { return checkNull(v, checkByValueType(v) ? helpers.bgSuccess : helpers.bgYellow); },
    bgEmpty: function(v) { return checkNull(v, !checkByValueType(v) || checkByValueType(v, 0) ? helpers.bgFail : undefined); },
    bgSuccessIfOne: function(v) { return checkNull(v, checkByValueType(v, 1) ? helpers.bgSuccess : helpers.bgYellow); },
    bgIndex: function(v) { return (typeof v === 'string' ? Number(v.split('-')[0]) : v) % 2 ? helpers.bgGray1 : helpers.bgGray2; },

    outputYesNo: function(v) { return checkNull(v, checkByValueType(v) ? 'Yes' : 'No'); },
    outputYesNoInverted: function(v) { return checkNull(v, !checkByValueType(v) ? 'Yes' : 'No'); },
    outputValueOrNo: function(v) { return checkNull(v, checkByValueType(v) ? v : 'No'); },
    outputWarning: function(v) { return checkNull(v, checkByValueType(v) ? '!' : ''); },
    outputString: function(v) { return checkNull(v, v) },
    outputNumber: function(v) { return checkNull(v, ~~v) },
    outputPointOne: function(v) { return checkNull(v, ~~(v * 10) / 10); },
    outputPointTwo: function(v) { return checkNull(v, ~~(v * 100) / 100); },
    outputPointThree: function(v) { return checkNull(v, ~~(v * 1000) / 1000); },

    defaultCellClick: function(data) {
        MessageLog.trace('defaultCellClick:' + JSON.stringify(data, true, '  '));

        if (KeyModifiers.IsControlPressed()) {
            helpers.selectNode(data);
            SelectionUtils.focusOnSelectedNode();
            return;

        } else if (KeyModifiers.IsAlternatePressed()) {

            helpers.showNodeProperties(data);
            return;

        }
        helpers.selectNode(data);
    },

    showNodeProperties: function(data) {
        // MessageLog.trace('>>'+data.path);
        selection.clearSelection();
        selection.addNodeToSelection(typeof data === 'string' ? data : data.path || data.node);
        Action.perform("onActionEditProperties()", "scene");
    },

    selectNode: function(data) {
        selection.clearSelection();
        selection.addNodeToSelection(typeof data === 'string' ? data : data.path || data.node);
    },
}

///
exports = helpers;