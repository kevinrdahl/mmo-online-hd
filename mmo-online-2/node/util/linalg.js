/**
 * Created by Kevin on 01/02/2015.
 */
var LinAlg = {};

if(typeof module === 'undefined') {
    //nuffin bruv
} else {
    module.exports = LinAlg;
}

LinAlg.Vector2 = function(x,y) {
    this.x = x;
    this.y = y;

    this.getLength = function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };

    this.distanceTo = function (v) {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    };

    this.offset = function (angle, dist) {
        var v = new LinAlg.Vector2(this.x, this.y);
        angle = LinAlg.toRadians(angle);
        v.x += dist * Math.cos(angle);
        v.y += dist * Math.sin(angle);
        return v;
    };

    this.angleTo = function (v) {
        return LinAlg.toDegrees(Math.atan2(v.y - this.y, v.x - this.x));
    };

    this.midpointTo = function(v) {
        return new LinAlg.Vector2(this.x+(v.x-this.x)/2, this.y+(v.y-this.y)/2);
    };

    this.add = function(v) {
        return new LinAlg.Vector2(this.x + v.x, this.y + v.y);
    };

    this.sub = function(v) {
        return new LinAlg.Vector2(this.x - v.x, this.y - v.y);
    };

    this.scaled = function(s) {
        return new LinAlg.Vector2(this.x * s, this.y * s);
    };

    this.normalized = function() {
        if (this.x == 0 && this.y == 0) {
            return new LinAlg.Vector2(1,1);
        }
        return this.scaled(1/this.getLength());
    };

    this.copy = function () {
        return new LinAlg.Vector2(this.x, this.y);
    };

    this.toJSON = function(places) {
        var x = LinAlg.cutFloat(this.x, places);
        var y = LinAlg.cutFloat(this.y, places);
        return '{"x":'+ x + ',"y":' + y + '}';
    };
};

//returns toString of a number to a certain precision
LinAlg.cutFloat = function(f, places) {
    places = (typeof places === 'undefined') ? 0 : places;
    f = Math.round(f * Math.pow(10, places)).toString();
    if (places > 0) {
        f = f.slice(0, f.length-places) + '.' + f.slice(f.length-places, f.length);
    }
    return f;
};

LinAlg.toRadians = function(angle) {
    return (angle*Math.PI)/180.0;
};

LinAlg.toDegrees = function(angle) {
    return (angle*180)/Math.PI;
};

LinAlg.vector2FromObj = function(o) {
    if (typeof o.x === 'number' && typeof o.y === 'number') {
        return new LinAlg.Vector2(o.x, o.y);
    } else {
        return null;
    }
};

//v flipped across the line x=i
/*LinAlg.vectorFlipY = function(v, i) {
    return [-(v[0]-i)+i, v[1]];
};*/