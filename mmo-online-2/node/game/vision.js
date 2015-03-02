/**
 * Created by Kevin on 08/02/2015.
 */
var Vision = {};
module.exports = Vision;

Vision.Vision = function () {
    this.observers = {};
    this.units = {};

    this.getChanges = function() {
        var diffs = {};
        for (var id in this.observers) {
            diffs[id] = this.observers[id].getChanges();
        }
        return diffs;
    };

    this.addObserver = function (id) {
        this.observers[id] = new Vision.Observer(id);
        for (var uId in this.units) {
            this.observers[id].seenUnits[uId] = true;
        }
    };

    this.removeObserver = function (id) {
        delete this.observers[id];
    };

    this.addUnit = function(id) {
        this.units[id] = true;
        for (var o in this.observers) {
            this.observers[o].seenUnits[id] = true;
        }
    };

    this.removeUnit = function(id) {
        delete this.units[id];
        for (var o in this.observers) {
            delete this.observers[o].seenUnits[id];
        }
    };

    this.getUnitObservers = function(id) {
        var r = [];
        var seen;
        if (id in this.units) {
            for (var oId in this.observers) {
                seen = this.unitSeen(id, oId);
                if (seen) {
                    r.push(oId);
                }
            }
        }
        return r;
    };

    this.unitSeen = function(uId, oId) {
        if (this.observers[oId].seenUnits[uId]) {
            return true;
        } else {
            return false;
        }
    };
};

Vision.Observer = function(id) {
    this.id = id;
    this.seenUnits = {};
    this.lastAck = {}; //last acknowledged seenUnits

    this.getChanges = function() {
        var diff = {};

        for (var id in this.lastAck) {
            if (!this.seenUnits[id]) {
                diff[id] = false;
            }
        }

        for (var id in this.seenUnits) {
            if (!this.lastAck[id]) {
                diff[id] = true;
            }
        }

        this.lastAck = JSON.parse(JSON.stringify(this.seenUnits));
        return diff;
    };
};