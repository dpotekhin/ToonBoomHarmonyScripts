/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1

TODO:
- 
*/


//
var SelectionUtils = require(fileMapper.toNativePath(specialFolders.userScripts+"/ps/SelectionUtils.js"));

//
function PS_AdjustNodeColor( processGroups, adjustColor ){

    if( !SelectionUtils.hasSelectedNodes() ){

        MessageBox.warning(
            "Please select nodes to adjust their Color.\n\n"
            +"Options:\n"
            +"- Hold down the Control key to process nodes in groups.\n"
            +"- Hold down the Alt key to enter a color.\n"
        ,0,0,0,"Error");

        return;
    }

    if( processGroups === undefined ) processGroups = KeyModifiers.IsControlPressed();
    if( adjustColor === undefined ) adjustColor = KeyModifiers.IsAlternatePressed();

    var newColor;

    if( adjustColor ){

        var dialog = new QColorDialog();
        dialog.colorSelected.connect( dialog, function(_newColor){
            newColor = _newColor;
        });

        if ( !dialog.exec() || !newColor )
        {
            MessageBox.warning( "Please select a Color.",0,0,0,"Error");
            return;
        }
        
        // MessageLog.trace('newColor: '+newColor+': '+newColor.red()+','+newColor.alpha());
        if( newColor ){
            newColor = new ColorRGBA( newColor.red(), newColor.green(), newColor.blue(), newColor.alpha() );
        }

    }

    scene.beginUndoRedoAccum('Adjust Node Color');

    SelectionUtils.eachSelectedNode( function(_node){
        if( newColor ){
            node.setColor(_node, newColor);
        }else{
            node.resetColor(_node);
        }
    }, processGroups );

    scene.endUndoRedoAccum();

}

///