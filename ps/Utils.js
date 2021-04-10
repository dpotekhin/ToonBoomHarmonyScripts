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
function joinBoxes(b1,b2){
  
  // MessageLog.trace('joinBoxes: '+JSON.stringify(b1,true,'  ')+', '+JSON.stringify(b2,true,'  ') );

  var b1Empty = !b1 || b1.empty;
  var b2Empty = !b2 || b2.empty;

  if( b1Empty && b2Empty ) return;
  if( b1Empty ) return b2;
  if( b2Empty ) return b1;

  return {
    x0: Math.min( b1.x0, b2.x0 ),
    y0: Math.min( b1.y0, b2.y0 ),
    x1: Math.max( b1.x1, b2.x1 ),
    y1: Math.max( b1.y1, b2.y1 )
  }

}


//
function addPointToBox( box, x, y ){
  if( !box ){
    return {
      x0: x, y0: y,
      x1: x, y1: y
    }
  }
  return {
    x0: Math.min( box.x0, x ),
    y0: Math.min( box.y0, y ),
    x1: Math.max( box.x1, x ),
    y1: Math.max( box.y1, y )
  }
}


//
/*
function Bounds(){

  this.reset = function(){
      this.left = Number.MAX_VALUE;
      this.right = -Number.MAX_VALUE;
      this.top = Number.MAX_VALUE;
      this.bottom = -Number.MAX_VALUE;
  }

  this.checkPoint = function(x,y){
    if( this.left > x ) this.left = x;
    if( this.right < x ) this.right = x;
    if( this.top > y ) this.top = y;
    if( this.bottom < y ) this.bottom = y;
  }

  this.reset();

}

Object.defineProperties(Bounds, {
  x: {
    get: function() { return this.left; },
    set: function(v) { this.left = v; }
  },
  y: {
    get: function() { return this.top; },
    set: function(v) { this.top = v; }
  },
  width: {
    get: function() { return this.right - this.left; },
    set: function(v) { this.right = this.left + v; }
  },
  height: {
    get: function() { return this.top - this.bottom; },
    set: function(v) { this.top = this.bottom + v; }
  }
});
*/

//
exports = {
  getTimestamp: getTimestamp,
  getZeroLeadingString: getZeroLeadingString,
  // Bounds: Bounds,
  joinBoxes: joinBoxes,
  addPointToBox: addPointToBox,
};