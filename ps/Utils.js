/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.1
*/

//
function getTimestamp(){
  var date = new Date();
  return date.getFullYear() + getZeroLeadingString(date.getMonth()+1) + getZeroLeadingString(date.getDate())+'_'+getZeroLeadingString(date.getHours())+getZeroLeadingString(date.getMinutes());
};


//
function getZeroLeadingString(v){
  return v<10 ? '0'+v : v;
}

//
// TODO: I Did not find yet how to convert Drawing Grid coordinates to pixels.
function getGridStepX(){
	return scene.currentResolutionX() / scene.numberOfUnitsX() * 2 * 1.302; // 15.625
}

function getGridStepY( y ){
	return scene.currentResolutionY() / scene.numberOfUnitsY() * 2 * 1.7358; // 20.83
}

//
exports = {
  getTimestamp: getTimestamp,
  getZeroLeadingString: getZeroLeadingString,
  getGridStepX: getGridStepX,
  getGridStepY: getGridStepY
};