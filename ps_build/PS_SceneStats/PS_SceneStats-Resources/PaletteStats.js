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

    // COLORS TABLE
    var palettesColumns = [

        {
            key: 'num',
            header: '#',
        },

        {
            key: 'paletteName',
            header: 'Palette Name',
            getValue: storage.outputString,
            getBg: function(v, data) {
                return storage.checkNull(v, hasDefaultName(v) ? storage.bgFail : storage.bgSuccess);
            },
            toolTip: function(v, data) { return storage.checkNull(v, hasDefaultName(v) ? 'Palette has default name' : ''); }
            // onClick: storage.defaultCellClick
        },

        {
            key: 'paletteNamingIssues',
            header: 'NI',
            toolTip: true,
            getBg: storage.bgSuccessOrFailInverted,
            getValue: storage.outputYesNo
        },

        {
            key: 'isNameEqualToGroup',
            header: 'NeG',
            toolTip: function(v) { return v ? 'The palette name is equal to the selected group name' : 'The palette name is NOT equal to the selected group name'; },
            getBg: storage.bgSuccessOrFail,
            getValue: storage.outputYesNo
        },

        {
            key: 'isNameEqualToScene',
            header: 'NeS',
            toolTip: function(v) { return v ? 'The palette name is equal to the scene name' : 'The palette name is NOT equal to the scene name'; },
            getBg: storage.bgSuccessOrFail,
            getValue: storage.outputYesNo
        },

        {
            key: 'isColorPalette',
            header: 'CP',
            toolTip: 'Is Color Palette',
            getBg: storage.bgFailYellow,
            getValue: storage.outputYesNo
        },

        {
            key: 'nColors',
            header: 'cN',
            toolTip: 'Palette Color count',
            getBg: storage.bgSuccessOrFail,
            getValue: storage.outputNumber,
        },


        {
            key: 'usedInScene',
            header: 'UiS',
            toolTip: 'Colors is used in the Scene',
            getBg: storage.bgSuccessOrFail,
            getValue: storage.outputYesNo
        },

        {
            key: 'colorsNamingIssues',
            header: 'cNI',
            toolTip: true,
            getBg: storage.bgSuccessOrFailInverted,
            getValue: storage.outputYesNo
        },

        {
            key: 'usedDefaultColorId',
            header: 'DCID',
            toolTip: 'Some of Palette Colors have Default Color IDs',
            getBg: storage.bgSuccessOrFailInverted,
            getValue: storage.outputYesNo,
            // onClick: selectPalletOrColor
        },

        {
            key: 'colorsHasSameId',
            header: 'cSID',
            toolTip: function(v, data) {
                if (v) return 'Palette colors has the same ID:\n' + data.colorsHasSameIdToolTip;
                return 'Palette colors has unique IDs';
            },
            getBg: storage.bgSuccessOrFailInverted,
            getValue: storage.outputYesNo,
            // onClick: selectPalletOrColor
        }
    ];

    return new TableView(storage.palettes, palettesColumns, undefined, contentMaxHeight);

    // ----------------------------
    //
    function hasDefaultName(v) {
        return v && v.toLowerCase().match(/^new/);
    }

    //
    // function selectPalletOrColor(data) {
    //     if (!data.paletteId) return;
    //     selection.clearSelection();
    //     // MessageLog.trace( data.paletteId+' , '+data.colorId);
    //     if (data.type === 'Palette') PaletteManager.setCurrentPaletteById(data.paletteId);
    //     else PaletteManager.setCurrentPaletteAndColorById(data.paletteId, data.colorId);
    // }

}