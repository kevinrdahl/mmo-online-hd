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

    this.equals = function(v) {
        return (this.x == v.x && this.y == v.y);
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

    this.rounded = function() {
        return new LinAlg.Vector2(Math.round(this.x), Math.round(this.y));
    };

    //don't want to send huge useless floats to clients
    /*this.toJSON = function(places) {
        var x = LinAlg.cutFloat(this.x, places);
        var y = LinAlg.cutFloat(this.y, places);
        var json = '{"x":'+ x + ',"y":' + y + '}';
        console.log('JSON: ' + json);
        console.log(x);
        console.log(y);
        return json;
    };*/

    this.toJSON = function() {
        return {
            x:this.x,
            y:this.y
        };
    };
};

//returns toString of a number to a certain precision
LinAlg.cutFloat = function(f, places) {
    places = places|0;
    var s = Math.round(f * Math.pow(10, places)).toString();
    if (places > 0) {
        s = s.slice(0, s.length-places) + '.' + s.slice(s.length-places, s.length);
    }

    //trim trailing zeroes
    //not the greatest implementation (checks twice per index before the last)
    var len = s.length;
    for (var i = s.length-1; i >= 0; i++) {
        if (s.charAt(i) != '0') {
            break;
        }
        len -= 1
        if (s.charAt(i-1) == '.') {
            len -= 1;
            break;
        }
    }
    s = s.substr(0,len);

    if (f < 1) {
        return '0' + s;
    } else {
        return s;
    }
};

LinAlg.toRadians = function(angle) {
    return (angle*Math.PI)/180.0;
};

LinAlg.toDegrees = function(angle) {
    return (angle*180)/Math.PI;
};

LinAlg.clamp = function(num, min, max) {
    if (num > max) {
        return max;
    } else if (num < min) {
        return min;
    } else {
        return num;
    }
};

//checks if a property is vector2, converting if possible
LinAlg.propIsVector2 = function(obj, prop) {
    var val = obj[prop];
    if (val instanceof LinAlg.Vector2) {
        return true;
    } else if (Array.isArray(val) && val.length === 2 && typeof val[0] === 'number' && typeof val[1] === 'number') {
        obj[prop] = new LinAlg.Vector2(val[0], val[1]);
        return true;
    }
    obj[prop] = null;
    return false;
};

//v flipped across the line x=i
/*LinAlg.vectorFlipY = function(v, i) {
    return [-(v[0]-i)+i, v[1]];
};*/