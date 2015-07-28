var Vectors = function() {}

Vectors.copy = function(v) {
    return [v[0], v[1]];
}
Vectors.copyTo = function(v1, v2) {
    v2[0] = v1[0];
    v2[1] = v1[1];
}
Vectors.getLength = function(v) {
    return Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2));
}
Vectors.distanceBetween = function(v1, v2) {
    return Math.sqrt(Math.pow(v1[0] - v2[0], 2) + Math.pow(v1[1] - v2[1], 2));
}
Vectors.offset = function(v, angle, dist) {
    var v2 = Vectors.copy(v);
    angle = degToRad(angle);
    v2[0] += dist * Math.cos(angle);
    v2[1] += dist * Math.sin(angle);
    return v2;
}
Vectors.angleTo = function(v1, v2) {
    return radToDeg(Math.atan2(v2[1] - v1[1], v2[0] - v1[0]));
}
Vectors.midpoint = function(v1, v2) {
    return [v1[0]+(v1[0]-v1[0])/2, v1[1]+(v2[1]-v1[1])/2];
}
Vectors.add = function (v1, v2) {
    return [v1[0]+v2[0], v1[1]+v2[1]];
}
Vectors.subtract = function(v1, v2) {
    return [v1[0]-v2[0], v1[1]-v2[1]];
}
Vectors.scaled = function (v, scale) {
    var v2 = Vectors.copy(v);
    v2[0] *= scale;
    v2[1] *= scale;
    return v2;
}
Vectors.normalized = function(v) {
    if (v[0] == 0 && v[1] == 0)
        return [0,1];
    else
        return Vectors.scaled(v, 1/Vectors.getLength(v));
}

//FUN NEW GLOBALS

degToRad = function(angle) {
    return (angle*Math.PI)/180.0;
};

radToDeg = function(angle) {
    return (angle*180)/Math.PI;
};

clampNumber = function(num, min, max) {
    if (num > max) {
        return max;
    } else if (num < min) {
        return min;
    } else {
        return num;
    }
};