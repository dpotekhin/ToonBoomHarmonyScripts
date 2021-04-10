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
exports = {
  getTimestamp: getTimestamp,
  getZeroLeadingString: getZeroLeadingString,
};