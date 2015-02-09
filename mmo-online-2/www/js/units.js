/**
 * Created by Kevin on 08/02/2015.
 */
var Units = {};

Units.Unit = function(o) {
    for (var prop in o) {
        this[prop] = o[prop];
    }
    this.nextPosition = this.position.copy();
    this.class = 'unit';

    this.update = function() {
        if (this.order != null) {
            if (this.order.type == 'move') {
                var done = this.stepTowards(this.order.point);
                if (done) {
                    this.order = null;
                }
            }
        }
    };

    this.stepTowards = function(point) {
        if (this.position.distanceTo(point) <= this.speed) {
            this.nextPosition = point.copy();
            return true;
        } else {
            var angle = this.position.angleTo(point);
            this.nextPosition = this.position.offset(angle, this.speed);
            return false;
        }
    };
};