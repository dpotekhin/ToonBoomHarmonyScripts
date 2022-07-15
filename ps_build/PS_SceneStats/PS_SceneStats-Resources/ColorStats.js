/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220714
*/

//
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts+"/PS_SceneStats-Resources/ps/TableView.js"));


//
exports = function(selectedNodes, modal, storage, contentMaxHeight) {

    storage.getAllChildNodes(selectedNodes, 'READ');
    // MessageLog.trace('currentSceneName: ' + currentSceneName);

    storage.parsePalettesAndColors();

    var typeColors = {
        Palette: storage.bgInfo,
        Texture: storage.bgYellow,
        Color: ''
    };


    // COLORS TABLE
    var colorColumns = [

        {
            key: 'num',
            header: '#',
        },

        {
            key: 'type',
            header: 'Type',
            getBg: function(v, data) {
                return typeColors[v];
            },
        },

        {
            key: 'paletteName',
            header: 'Palette Name',
            getValue: storage.outputString,
            // onClick: storage.defaultCellClick
        },

        {
            key: 'colorName',
            header: 'Color Name',
            getValue: storage.outputString,
            // onClick: storage.defaultCellClick
        },

        {
            key: 'colorNamingIssues',
            header: 'NI',
            toolTip: true,
            getBg: storage.bgSuccessOrFailInverted,
            getValue: storage.outputYesNo
        },

        {
            key: 'usedInScene',
            header: 'UiS',
            toolTip: 'Color is used in the Scene',
            getBg: storage.bgSuccessOrFail,
            getValue: storage.outputYesNo
        },

        {
            key: 'colorsHasSameId',
            header: 'CSID',
            toolTip: function(v, data) {
                if (v) return 'Palette colors has the same ID:\n' + data.colorsHasSameIdToolTip;
                return 'Palette colors has unique IDs';
            },
            getBg: storage.bgSuccessOrFailInverted,
            getValue: storage.outputYesNo,
        },

        {
            key: 'usedDefaultColorId',
            header: 'DCID',
            toolTip: 'Color has Default Color ID',
            getBg: storage.bgSuccessOrFailInverted,
            getValue: storage.outputYesNo,
            // onClick: selectPalletOrColor
        },

        {
            key: 'id',
            header: 'ID',
            toolTip: 'Color ID',
        },

    ];

    return new TableView(storage.colors, colorColumns, undefined, contentMaxHeight);

    // ----------------------------
    //
    function hasDefaultName(v) {
        return v && v.toLowerCase().match(/^new/);
    }


}