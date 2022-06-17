/*
Author: Dima Potekhin (skinion.onn@gmail.com)

[Name: PS_LineStyleFromStroke :]
[Version: 0.220617 :]

[Description:
This script applies the size and color from the selected stroke to the Pencil tool.
:]


[Usage:
Select a stroke then click the script button.
:]
*/

function PS_LineStyleFromStroke() {

    // MessageLog.clearLog();

    try {

        var settings = Tools.getToolSettings();
        if (!settings.currentDrawing) return;

        // MessageLog.trace('settings: ' + JSON.stringify(settings, true, '  '))
        var config = {
            drawing: settings.currentDrawing,
        };

        var minThickness = 99999;
        var maxThickness = 0;
        var startTip = "ROUND_TIP";
        var colorId;

        for (var artIndex = 0; artIndex < 4; artIndex++) {
            config.art = artIndex;

            var _selection = Drawing.selection.get(config);
            if( !_selection.selectedStrokes.length ) continue;
            MessageLog.trace(JSON.stringify(_selection, true, '  '));
            
            var strokesData = Drawing.query.getStrokes(config);
            // MessageLog.trace(JSON.stringify(strokesData, true, '  '));
            // strokeData.strokeIndex;

            _selection.selectedStrokes.forEach(function(strokeData){
            	var layerData = strokesData.layers[strokeData.layer];
            	
            	MessageLog.trace(JSON.stringify(layerData, true, '  '));
            	
            	layerData.thicknessPaths.forEach(function(thicknessPathsData){
            		if( minThickness > thicknessPathsData.minThickness ) minThickness = thicknessPathsData.minThickness;
            		if( maxThickness < thicknessPathsData.maxThickness ) maxThickness = thicknessPathsData.maxThickness;
            		if( thicknessPathsData.keys[0].leftFromCtrlThickness === 0 && thicknessPathsData.keys[0].rightFromCtrlThickness === 0 ) startTip =  "FLAT_TIP";
            		// MessageLog.trace(thicknessPathsData.minThickness+' > '+thicknessPathsData.maxThickness);
            	});

            	
            	colorId = layerData.strokes[0].pencilColorId;

            })

            // Drawing.selection.clear();

            Action.perform("onActionChoosePencilTool()","sceneUI");

            MessageLog.trace(minThickness+' > '+maxThickness+' > '+ startTip );
            var settings = PenstyleManager.getCurrentPenstyleMaximumSize();
        	PenstyleManager.changeCurrentPenstyleMaximumSize( maxThickness );
        	PenstyleManager.changeCurrentPenstyleMinimumSize( minThickness );

        	ToolProperties.setPencilTipMode(startTip); // start cap

        	if( colorId ) PaletteManager.setCurrentColorById( colorId );

            /*
            start cap:
            	thicknessPath[0].leftFromCtrlThickness = 0
            	thicknessPath[0].rightFromCtrlThickness = 0
        	end cap:
            	thicknessPath[last].leftToCtrlThickness = 0
            	thicknessPath[last].rightToCtrlThickness = 0
            */

        }

    } catch (err) { MessageLog.trace('Error: ' + err) }

}