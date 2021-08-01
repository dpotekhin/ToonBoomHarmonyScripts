/*
Author: D.Potekhin (d@peppers-studio.ru)

[Name: PS_HexPaletteColor :]
[Version: 0.210622 :]

[Description:
This script allows you to copy and paste a hexadecimal value of the selected Color.
:]

[Usage:
* Select a Color in Colour panel
* Click on the Script button to open a window to edit a hexadecimal value of the selected color.

#### Options:
* Hold Control key to quick paste a Hex Color from the Clipboard to the selected color
* Hold Shift key to quick copy a Hex Color to the Clipboard from the selected color
* Hold Alt key to ignore alpha in hexadecimal values
:]

TODO:
- 
*/


function PS_HexPaletteColor(){

	// MessageLog.clearLog();

	var paletteList = PaletteObjectManager.getScenePaletteList(); // In some reason without this new color vakues does not applied.
	if(paletteList.numPalettes < 1) return;

	function componentToHex(c) {
	  var hex = c.toString(16);
	  return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b, a) {
	  // return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	  var result = componentToHex(r) + componentToHex(g) + componentToHex(b);
	  if( a !== undefined && !ignoreAlpha ) result += componentToHex(a);
	  return result;
	}

	function hexToRgb(hex) {
	  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
	  if( !result ) return null;
	  return {
	    r: parseInt(result[1], 16),
	    g: parseInt(result[2], 16),
	    b: parseInt(result[3], 16),
	    a: parseInt(result[4], 16)
	  };
	}

	var ignoreAlpha = !KeyModifiers.IsAlternatePressed();
	// MessageLog.trace('ignoreAlpha: '+ignoreAlpha);

	var palletteId = PaletteManager.getCurrentPaletteId();
	var colorId = PaletteManager.getCurrentColorId();

	if( !palletteId || !colorId ){
		MessageLog.trace( 'A selected Color required.' );
		return;
	}

	var paletteName = PaletteManager.getCurrentPaletteName();
	var colorName = PaletteManager.getCurrentColorName();

	var palette = PaletteObjectManager.getPalette(palletteId);

	var colorObject = palette.getColorById(colorId);
	var colorData = colorObject.colorData;

	// MessageLog.trace( 'colorData.colorType: '+colorObject.colorType);
	if( colorObject.colorType !== 0 ){
		MessageLog.trace( 'This script works with solid colors only.' );
		return;
	}

	var currentHexColor = rgbToHex( colorData.r, colorData.g, colorData.b, colorData.a );
	MessageLog.trace( 'The current Color of "'+paletteName+'/'+colorName+'": '+ currentHexColor+' ('+JSON.stringify(colorData,true,'  ')+') ' );

	// Copy a hex color to the Clipboard
	if( KeyModifiers.IsShiftPressed() ){
		QApplication.clipboard().setText(currentHexColor);
		MessageLog.trace('Pasted the Hex Color to the Clipboard: '+currentHexColor );
		return;
	}

	var value;

	if( KeyModifiers.IsControlPressed() ){ // Paste a hex color from the Clipboard
		
		value = QApplication.clipboard().text();
		MessageLog.trace('Apply the Hex Color from the Clipboard: '+value );
		// return;

	}else{ // Input hex color
		
		value = Input.getText(paletteName+'/'+colorName, currentHexColor, 'Hex Color value'+( ignoreAlpha ? ' (Alpha values ignored)': '') );

	}

	if( value ) value = value.replace('#','').trim();
	if( !value || value === currentHexColor ) {
		MessageLog.trace('Error: the same or empty input.');
		return;
	}

	// MessageLog.trace('value @1: '+value);
	value = hexToRgb( value );

	if( !value ) {
		MessageLog.trace('Error: Hex string parsing failed.');
		return;
	}

	// MessageLog.trace('value @2: '+isNaN(value.a)+' > '+colorData.a+'\n'+JSON.stringify(value,true,'  '));
	if( isNaN(value.a) || ignoreAlpha ) value.a = colorData.a;
	// MessageLog.trace('New Color value: '+JSON.stringify(value,true,'  '));

	colorObject.setColorData( value );

}