/*
Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1

This script allows to copy and paste a hexademal value of a selected Palette Color.

Options:
- Hold Control key to quick paste a Hex Color from the Clipboard to a selected color
- Hold Shift key to quick copy a Hex Color to the Clipboard from a selected color
- Hold Alt key to ignore alpha

TODO:
- 
*/


function PS_HexPaletteColor(){

	function componentToHex(c) {
	  var hex = c.toString(16);
	  return hex.length == 1 ? "0" + hex : hex;
	}

	function rgbToHex(r, g, b, a) {
	  // return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	  var result = componentToHex(r) + componentToHex(g) + componentToHex(b);
	  if( a !== undefined && !ignoreAlpha ) result = componentToHex(a);
	  return result;
	}

	function hexToRgb(hex) {
	  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
	  if( !result ) return null;
	  result = {
	    r: parseInt(result[1], 16),
	    g: parseInt(result[2], 16),
	    b: parseInt(result[3], 16)
	  };
	  if( !ignoreAlpha ) result.a = parseInt(result[4], 16);
	  return result;
	}

	var ignoreAlpha = KeyModifiers.IsAlternatePressed();

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

	var currentHexColor = rgbToHex( colorData.r, colorData.g, colorData.b, colorData.a );
	MessageLog.trace( 'currentHexColor: '+ currentHexColor+' ('+colorObject.colorType+') '+paletteName+'/'+colorName );

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
		
		value = Input.getText(paletteName+'/'+colorName, currentHexColor, 'Hex Color value' );

	}

	if( value ) value = value.replace('#','').trim();
	if( !value || value === currentHexColor ) {
		MessageLog.trace('Error: the same or empty input.');
		return;
	}

	value = hexToRgb( value );
	if( !value ) {
		MessageLog.trace('Error: Hex string parsing failed.');
		return;
	}

	if( isNaN(value.a) ) value.a = colorData.a;

	colorObject.setColorData( value );

}