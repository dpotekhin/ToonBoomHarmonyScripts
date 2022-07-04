/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220630
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
// var pFile = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pFile.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

//
var defaultColorsIds = [
    "0b3934f843700d34",
    "0b3934f843700d36",
    "0b3934f843700d38",
    "0b3934f843700d3a",
    "0b3934f843700d3c",
    "0000000000000003"
];

//
exports = function(selectedNodes, modal, lib, contentMaxHeight) {

    var selectedGroupName = node.getName(selectedNodes[0]);
    var currentSceneName = scene.currentScene().replace(/\.tpl$/, '').replace(/\.|_v\d\d\d?$/, '');
    MessageLog.trace('currentSceneName: ' + currentSceneName);
    var paletteTableItems = [];
    var colorTableItems = [];

    var paletteList = PaletteObjectManager.getScenePaletteList();
    var palletteCount = paletteList.numPalettes;
    var globalColorIds = {};

    for (var i = 0; i < palletteCount; i++) {

        var _palette = paletteList.getPaletteByIndex(i);
        var paletteName = _palette.getName();
        var palettePath = _palette.getPath();
        var paletteColorsHasDefaultNames = false;
        var colorsHasSameId = [];
        var colorsHasSameIdToolTip = '';
        var colorsUsedInScene = true;

        var paletteItem = {
            num: i + 1,
            type: 'Palette',
            paletteId: _palette.id,
            paletteName: paletteName,
            paletteNamingIssues: lib.checkColorName( paletteName ),
            colorsNamingIssues: [],
            isNameEqualToGroup: selectedGroupName === paletteName,
            isNameEqualToScene: currentSceneName === paletteName,
            isFound: !_palette.isNotFound(),
            isValid: _palette.isValid(),
            isLoaded: _palette.isLoaded(),
            isColorPalette: _palette.isColorPalette(),
            nColors: _palette.nColors,
            palettePath: _palette.getPath(),
            usedDefaultColorId: false,
        };

        paletteTableItems.push(paletteItem);
        // MessageLog.trace('ID: '+_palette.id);

        // Colors
        for (var ci = 0; ci < _palette.nColors; ci++) {

            var palletteColor = _palette.getColorByIndex(ci);
            // MessageLog.trace(ci + '] ' + palletteColor.name + ', ' + palletteColor.id);

            var colorItem = {};
            Object.keys(paletteItem).forEach(function(v) { colorItem[v] = null; });
            colorItem.paletteId = _palette.id;
            colorItem.colorId = palletteColor.id;
            colorItem.num = (i + 1) + '-' + (ci + 1);
            colorItem.type = palletteColor.isTexture ? 'Texture' : 'Color';
            colorItem.paletteName = paletteName;
            colorItem.colorName = palletteColor.name;
            colorItem.id = palletteColor.id;
            colorItem.isTexture = palletteColor.isTexture;
            colorItem.usedInScene = _palette.containsUsedColors([palletteColor.id]);
            colorItem.usedDefaultColorId = defaultColorsIds.indexOf(palletteColor.id) !== -1;
            if( colorItem.usedDefaultColorId ) paletteItem.usedDefaultColorId = true;

            // Naming Issues
            colorItem.colorNamingIssues = lib.checkColorName( palletteColor.name );
            if( colorItem.colorNamingIssues ){
                colorItem.colorNamingIssues.forEach(function(v){ if( paletteItem.colorsNamingIssues.indexOf(v) === -1 ) paletteItem.colorsNamingIssues.push(v); })
                colorItem.colorNamingIssues = 'Has naming issuses:\n' + colorItem.colorNamingIssues.join('\n');
            }

            if (!colorItem.usedInScene) colorsUsedInScene = false;

            colorTableItems.push(colorItem);

            var colorIdString = paletteName + '/' + palletteColor.name + '(' + palletteColor.id + ')';

            if (!globalColorIds[palletteColor.id]) globalColorIds[palletteColor.id] = [];
            else {
                colorsHasSameId = [palletteColor.id];
                colorItem.colorsHasSameId = true;
                colorItem.colorsHasSameIdToolTip = colorIdString + ' >> ' + globalColorIds[palletteColor.id].join(' >> ');
            }
            globalColorIds[palletteColor.id].push(colorIdString);

        }

        if (colorsHasSameId.length) {
            colorsHasSameId.forEach(function(v) {
                colorsHasSameIdToolTip += globalColorIds[v].join(' >> ') + '\n';
            });
        }

        paletteItem.colorsHasSameId = colorsHasSameId.length;
        paletteItem.colorsHasSameIdToolTip = colorsHasSameIdToolTip;
        paletteItem.usedInScene = colorsUsedInScene;
        paletteItem.colorsNamingIssues = paletteItem.colorsNamingIssues.length ? 'Palette Colors has naming issuses:\n' + paletteItem.colorsNamingIssues.join('\n') : false;

    }

    // MessageLog.trace('pallettes: '+JSON.stringify(pallettes,true,'  '));
    // Group
    var style = 'QGroupBox{ position: relative; border: none; padding-top:0; padding-bottom: 0; border-radius: 0;}';
    // var uiGroup = modal.addGroup('COMPOSITES ('+colorTableItems.length+')', modal.ui, true, style);

    var typeColors = {
        Palette: lib.bgInfo,
        Texture: lib.bgYellow,
        Color: ''
    };


    // COLORS TABLE
    var palettesColumns = [

        {
            key: 'num',
            header: '#',
        },

        {
            key: 'paletteName',
            header: 'Palette Name',
            getValue: lib.outputString,
            getBg: function(v, data) {
                return lib.checkNull(v, hasDefaultName(v) ? lib.bgFail : lib.bgSuccess);
            },
            toolTip: function(v, data) { return lib.checkNull(v, hasDefaultName(v) ? 'Palette has default name' : ''); }
            // onClick: lib.defaultCellClick
        },

        {
            key: 'paletteNamingIssues',
            header: 'NI',
            toolTip: true,
            getBg: lib.bgSuccessOrFailInverted,
            getValue: lib.outputYesNo
        },

        {
            key: 'isNameEqualToGroup',
            header: 'NeG',
            toolTip: function(v) { return v ? 'The palette name is equal to the selected group name' : 'The palette name is NOT equal to the selected group name'; },
            getBg: lib.bgSuccessOrFail,
            getValue: lib.outputYesNo
        },

        {
            key: 'isNameEqualToScene',
            header: 'NeS',
            toolTip: function(v) { return v ? 'The palette name is equal to the scene name' : 'The palette name is NOT equal to the scene name'; },
            getBg: lib.bgSuccessOrFail,
            getValue: lib.outputYesNo
        },

        {
            key: 'isColorPalette',
            header: 'CP',
            toolTip: 'Is Color Palette',
            getBg: lib.bgFailYellow,
            getValue: lib.outputYesNo
        },

        {
            key: 'nColors',
            header: 'cN',
            toolTip: 'Palette Color count',
            getBg: lib.bgSuccessOrFail,
            getValue: lib.outputNumber,
        },


        {
            key: 'usedInScene',
            header: 'UiS',
            toolTip: 'Colors is used in the Scene',
            getBg: lib.bgSuccess,
            getValue: lib.outputYesNo
        },

        {
            key: 'colorsNamingIssues',
            header: 'cNI',
            toolTip: true,
            getBg: lib.bgSuccessOrFailInverted,
            getValue: lib.outputYesNo
        },

        {
            key: 'usedDefaultColorId',
            header: 'DCID',
            toolTip: 'Some of Palette Colors have Default Color IDs',
            getBg: lib.bgSuccessOrFailInverted,
            getValue: lib.outputYesNo,
            // onClick: selectPalletOrColor
        },

        {
            key: 'colorsHasSameId',
            header: 'cSID',
            toolTip: function(v, data) {
                if (v) return 'Palette colors has the same ID:\n' + data.colorsHasSameIdToolTip;
                return 'Palette colors has unique IDs';
            },
            getBg: lib.bgSuccessOrFailInverted,
            getValue: lib.outputYesNo,
            // onClick: selectPalletOrColor
        }
    ];
    var palettesTableView = new TableView(paletteTableItems, palettesColumns, undefined, contentMaxHeight);


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
            getValue: lib.outputString,
            // onClick: lib.defaultCellClick
        },

        {
            key: 'colorName',
            header: 'Color Name',
            getValue: lib.outputString,
            // onClick: lib.defaultCellClick
        },

        {
            key: 'colorNamingIssues',
            header: 'NI',
            toolTip: true,
            getBg: lib.bgSuccessOrFailInverted,
            getValue: lib.outputYesNo
        },

        {
            key: 'usedInScene',
            header: 'UiS',
            toolTip: 'Colors is used in the Scene',
            getBg: lib.bgSuccess,
            getValue: lib.outputYesNo
        },

        {
            key: 'colorsHasSameId',
            header: 'CSID',
            toolTip: function(v, data) {
                if (v) return 'Palette colors has the same ID:\n' + data.colorsHasSameIdToolTip;
                return 'Palette colors has unique IDs';
            },
            getBg: lib.bgSuccessOrFailInverted,
            getValue: lib.outputYesNo,
            // onClick: selectPalletOrColor
        },

        {
            key: 'usedDefaultColorId',
            header: 'DCID',
            toolTip: 'Color has Default Color ID',
            getBg: lib.bgSuccessOrFailInverted,
            getValue: lib.outputYesNo,
            // onClick: selectPalletOrColor
        },

        {
            key: 'id',
            header: 'ID',
            toolTip: 'Color ID',
        },

    ];
    var colorsTableView = new TableView(colorTableItems, colorColumns, undefined, contentMaxHeight);


    return {
        palettes: {
            tableView: palettesTableView,
            items: paletteTableItems,
        },
        colors: {
            tableView: colorsTableView,
            items: colorTableItems,
        }
    };


    // ----------------------------
    //
    function hasDefaultName(v) {
        return v && v.toLowerCase().match(/^new/);
    }

    //
    function selectPalletOrColor(data) {
        if (!data.paletteId) return;
        selection.clearSelection();
        // MessageLog.trace( data.paletteId+' , '+data.colorId);
        if (data.type === 'Palette') PaletteManager.setCurrentPaletteById(data.paletteId);
        else PaletteManager.setCurrentPaletteAndColorById(data.paletteId, data.colorId);
    }

}