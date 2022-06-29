/*
Author: Dima Potekhin (skinion.onn@gmail.com)
Version: 0.220628
*/

//
var Utils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/Utils.js"));
// var pFile = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/pFile.js"));
var NodeUtils = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/NodeUtils.js"));
var TableView = require(fileMapper.toNativePath(specialFolders.userScripts + "/ps/TableView.js"));

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
            num: i+1,
            type: 'Palette',
            paletteId: _palette.id,
            paletteName: paletteName,
            colorName: null,
            isNameEqualToGroup: selectedGroupName === paletteName,
            isNameEqualToScene: currentSceneName === paletteName,
            isFound: !_palette.isNotFound(),
            isValid: _palette.isValid(),
            isLoaded: _palette.isLoaded(),
            isColorPalette: _palette.isColorPalette(),
            nColors: _palette.nColors,
            palettePath: _palette.getPath(),
        }
        colorTableItems.push(paletteItem);
        paletteTableItems.push(paletteItem);
        // MessageLog.trace('ID: '+_palette.id);

        // Colors
        for (var ci = 0; ci < _palette.nColors; ci++) {
            
            var palletteColor = _palette.getColorByIndex(ci);
            // MessageLog.trace(ci + '] ' + palletteColor.name + ', ' + palletteColor.id);
            var colorHasDefaultNames;
            
            var colorItem = {};
            Object.keys(paletteItem).forEach(function(v){ colorItem[v] = null; });
            colorItem.paletteId = _palette.id;
            colorItem.colorId = palletteColor.id;
            colorItem.num = (i+1)+'-'+(ci+1);
            colorItem.type = palletteColor.isTexture ? 'Texture' : 'Color';
            colorItem.paletteName = paletteName;
            colorItem.colorName = palletteColor.name;
            colorItem.id = palletteColor.id;
            colorItem.isTexture = palletteColor.isTexture;
            colorItem.usedInScene = _palette.containsUsedColors([palletteColor.id]);
            if( !colorItem.usedInScene ) colorsUsedInScene = false;

            colorTableItems.push(colorItem);
            
            var colorIdString = paletteName+'/'+palletteColor.name+'('+palletteColor.id+')';

            if( hasDefaultName(palletteColor.name) ) colorItem.colorHasDefaultNames = paletteColorsHasDefaultNames = true;
            if( !globalColorIds[palletteColor.id] ) globalColorIds[palletteColor.id] = [];
            else {
                colorsHasSameId = [palletteColor.id];
                colorItem.colorsHasSameId = true;
                colorItem.colorsHasSameIdToolTip = colorIdString +' >> '+ globalColorIds[palletteColor.id].join(' >> ');
            }
            globalColorIds[palletteColor.id].push( colorIdString );

        }

        if( colorsHasSameId.length ){
            colorsHasSameId.forEach(function(v){
                colorsHasSameIdToolTip += globalColorIds[v].join(' >> ')+'\n';
            });
        }

        paletteItem.colorHasDefaultNames = paletteColorsHasDefaultNames;
        paletteItem.colorsHasSameId = colorsHasSameId.length;
        paletteItem.colorsHasSameIdToolTip = colorsHasSameIdToolTip;
        paletteItem.usedInScene = colorsUsedInScene;

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

    var tableColumns = [

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
            // onClick: lib.defaultCellClick
        },

        {
            key: 'paletteName',
            header: 'Palette Name',
            getValue: lib.outputString,
            getBg: function( v, data ) {
                return lib.checkNull( v, hasDefaultName(v) ? lib.bgFail : lib.bgSuccess);
            },
            toolTip: function( v, data ) { return lib.checkNull( v, hasDefaultName(v) ? 'Palette has default name' : ''); }
            // onClick: lib.defaultCellClick
        },

        {
            key: 'colorName',
            header: 'Color Name',
            getValue: lib.outputString,
            getBg: function( v, data ) {
                return lib.checkNull( v, hasDefaultName(v) ? lib.bgFail : lib.bgSuccess);
            },
            toolTip: function( v, data ) { return lib.checkNull( v, hasDefaultName(v) ? 'Color has default name' : ''); }
            // onClick: lib.defaultCellClick
        },

        {
            key: 'isNameEqualToGroup',
            header: 'pNeG',
            toolTip: function(v) { return v ? 'The palette name is equal to the selected group name' : 'The palette name is NOT equal to the selected group name'; },
            getBg: lib.bgSuccessOrFail,
            getValue: lib.outputYesNo
        },

        {
            key: 'isNameEqualToScene',
            header: 'pNeS',
            toolTip: function(v) { return v ? 'The palette name is equal to the scene name' : 'The palette name is NOT equal to the scene name'; },
            getBg: lib.bgSuccessOrFail,
            getValue: lib.outputYesNo
        },

        {
            key: 'isColorPalette',
            header: 'pCP',
            toolTip: 'Is Color Palette',
            getBg: lib.bgFailYellow,
            getValue: lib.outputYesNo
        },

        {
            key: 'nColors',
            header: 'pCN',
            toolTip: 'Palette Color count',
            getBg: lib.bgSuccessOrFail,
            getValue: lib.outputNumber,
        },

        {
            key: 'colorHasDefaultNames',
            header: 'DfN',
            toolTip: 'Colors has default names',
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
            toolTip: function(v,data){
                if(v) return 'Palette colors has the same ID:\n'+data.colorsHasSameIdToolTip;
                return 'Palette colors has unique IDs';
            },
            getBg: lib.bgSuccessOrFailInverted,
            getValue: lib.outputYesNo,
            // onClick: selectPalletOrColor
        }

    ];

    //
    var palettesTableView = new TableView( paletteTableItems, tableColumns.filter(function(v){ return v.key !== 'colorName' && v.key !== 'num'; }),
        undefined, contentMaxHeight );

    var colorsTableView = new TableView( colorTableItems, tableColumns, undefined, contentMaxHeight );

    return [palettesTableView, colorsTableView];


    // ----------------------------
    //
    function hasDefaultName(v){
        return v && v.toLowerCase().match(/^new/);
    }

    //
    function selectPalletOrColor( data ){
        if( !data.paletteId ) return;
        selection.clearSelection();
        // MessageLog.trace( data.paletteId+' , '+data.colorId);
        if( data.type === 'Palette' ) PaletteManager.setCurrentPaletteById( data.paletteId );
        else PaletteManager.setCurrentPaletteAndColorById( data.paletteId, data.colorId );
    }

}