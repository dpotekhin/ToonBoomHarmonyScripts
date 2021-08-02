/*
Author: D.Potekhin (d@peppers-studio.ru)
Version: 0.5
*/

function pBox2D( x0, y0, x1, y1 ){
  
  Object.defineProperties( this, {
  
    width: {
      get: function() {
        if( this.x0 === undefined ) return;
        return this.x1 - this.x0;
      },
      set: function(w){
        if( this.x0 === undefined ) return;
        this.x1 = this.x0 + w;
      }
    },

    height: {
      get: function() {
        if( this.y0 === undefined ) return;
        return this.y1 - this.y0;
      },
      set: function(h){
        if( this.y0 === undefined ) return;
        this.y1 = this.y0 + h;
      }
    },

    center: {
      get: function(){
        return {
          x: this.x0 + this.width / 2,
          y: this.y0 + this.height / 2
        };
      }
    }

  });

  this.set( x0, y0, x1, y1 );

};

///
//
pBox2D.getLineBox = function( p0, p1 ) {
  
  var result = new pBox2D();

  if( p0.x < p1.x ){
    result.x0 = p0.x;
    result.x1 = p1.x;
  }else{
    result.x0 = p1.x;
    result.x1 = p0.x;
  }

  if( p0.y < p1.y ){
    result.y0 = p0.y;
    result.y1 = p1.y;
  }else{
    result.y0 = p1.y;
    result.y1 = p0.y;
  }

  return result;
}

//
pBox2D.getBezierBox = function(p0, p1, p2, p3) {

  var tvalues = [], xvalues = [], yvalues = [],
      a, b, c, t, t1, t2, b2ac, sqrtb2ac;
  for (var i = 0; i < 2; ++i) {
      if (i == 0) {
          b = 6 * p0.x - 12 * p1.x + 6 * p2.x;
          a = -3 * p0.x + 9 * p1.x - 9 * p2.x + 3 * p3.x;
          c = 3 * p1.x - 3 * p0.x;
      } else {
          b = 6 * p0.y - 12 * p1.y + 6 * p2.y;
          a = -3 * p0.y + 9 * p1.y - 9 * p2.y + 3 * p3.y;
          c = 3 * p1.y - 3 * p0.y;
      }
      if (Math.abs(a) < 1e-12) {
          if (Math.abs(b) < 1e-12) {
              continue;
          }
          t = -c / b;
          if (0 < t && t < 1) {
              tvalues.push(t);
          }
          continue;
      }
      b2ac = b * b - 4 * c * a;
      if (b2ac < 0) {
          if (Math.abs(b2ac) < 1e-12) {
              t = -b / (2 * a);
              if (0 < t && t < 1) {
                  tvalues.push(t);
              }
          }
          continue;
      }
      sqrtb2ac = Math.sqrt(b2ac);
      t1 = (-b + sqrtb2ac) / (2 * a);
      if (0 < t1 && t1 < 1) {
          tvalues.push(t1);
      }
      t2 = (-b - sqrtb2ac) / (2 * a);
      if (0 < t2 && t2 < 1) {
          tvalues.push(t2);
      }
  }

  var j = tvalues.length, mt;
  while (j--) {
      t = tvalues[j];
      mt = 1 - t;
      xvalues[j] = (mt * mt * mt * p0.x) + (3 * mt * mt * t * p1.x) + (3 * mt * t * t * p2.x) + (t * t * t * p3.x);
      yvalues[j] = (mt * mt * mt * p0.y) + (3 * mt * mt * t * p1.y) + (3 * mt * t * t * p2.y) + (t * t * t * p3.y);
  }

  xvalues.push(p0.x,p3.x);
  yvalues.push(p0.y,p3.y);

  return new pBox2D(
    Math.min.apply(0, xvalues),
    Math.min.apply(0, yvalues),
    Math.max.apply(0, xvalues),
    Math.max.apply(0, yvalues)
  );

}


///
pBox2D.prototype.set = function( x0, y0, x1, y1 ){
  
  if( x0 === undefined && y0 === undefined ) return;

  if( typeof x0 === 'number' || typeof y0 === 'number' ){
    
    this.x0 = x0 || 0;
    this.y0 = y0 || 0;
    this.x1 = x1 || this.x0 || 0;
    this.y1 = y1 || this.y0 || 0;

  }else{

    this.x0 = x0.x0;
    this.y0 = x0.y0;
    this.x1 = x0.x1;
    this.y1 = x0.y1;

  }

};

pBox2D.prototype.identity = function(){
  this.x0 = 0;
  this.y0 = 0;
  this.x1 = 0;
  this.y1 = 0;
};

pBox2D.prototype.addBox = function(b2){
  
  if( !b2 || b2.x0 === undefined ) return;
  
  if( this.x0 === undefined ) {
    this.set(b2);
    return;
  }

  this.x0 = Math.min( this.x0, b2.x0 );
  this.y0 = Math.min( this.y0, b2.y0 );
  this.x1 = Math.max( this.x1, b2.x1 );
  this.y1 = Math.max( this.y1, b2.y1 );

};

pBox2D.prototype.addPoint = function( x, y ){

  if( this.x0 === undefined ) {
    this.set(x,y,x,y);
    return;
  }

  this.x0 = Math.min( this.x0, x );
  this.y0 = Math.min( this.y0, y );
  this.x1 = Math.max( this.x1, x );
  this.y1 = Math.max( this.y1, y );

};

///
exports = pBox2D;