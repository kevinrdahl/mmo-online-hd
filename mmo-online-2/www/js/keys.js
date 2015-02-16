/**
 * Created by Kevin on 13/02/2015.
 */
var Keys = {
    pressed:{},
    names:{},
    ids:{},
    events:[],

    init:function() {
        var _this = this;
        var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = 0; i < 26; i++) {
            this.ids[alphabet.charAt(i)] = i+65;
        }
        this.ids['BACKSPACE'] = 8;
        this.ids['TAB'] = 9;
        this.ids['ENTER'] = 13;
        this.ids['SHIFT'] = 16;
        this.ids['CRTL'] = 17;
        this.ids['ALT'] = 18;
        this.ids['ESC'] = 27;
        this.ids['SPACE'] = 32;
        this.ids['LEFT'] = 37;
        this.ids['UP'] = 38;
        this.ids['RIGHT'] = 39;
        this.ids['DOWN'] = 40;
        this.ids['DEL'] = 46;

        for (var name in this.ids) {
            this.pressed[this.ids[name]] = false;
            this.names[this.ids[name]] = name;
        }

        document.addEventListener('keydown', function(e) {_this.onKeyDown(e.keyCode);}, false);
        document.addEventListener('keyup', function(e) {_this.onKeyUp(e.keyCode);}, false);
    },

    isPressed:function(name) {
        return this.pressed[this.ids[name]];
    },

    onKeyDown:function(id) {
        this.pressed[id] = true;
        this.events.push({key:this.names[id], type:'down'});
    },

    onKeyUp:function(id) {
        this.pressed[id] = false;
        this.events.push({key:this.names[id], type:'up'});
    },

    getEvents:function() {
        var r = this.events;
        this.events = [];
        return r;
    }
};
Keys.init();