/**
 * Created by Kevin on 13/02/2015.
 */
var HUD = {
    flashFadeTime:3000,
    circleExpandTime:200,
    circleHighlightTime:400,
    borderColor:0x000000,

    colors:{
        self:0x00ff00,
        friend:0x0066ff,
        neutral:0xffff00,
        enemy:0xff0000
    }
};

HUD.borderSize = function(w,h) {
    var x = Math.min(w,h);
    x = Math.ceil(x/10);
    return x;
};

HUD.highlightColor = function(color) {
    var x = 0.75;
    var c = HUD.getRGB(color);

    c[0] += Math.round((255-c[0])*x);
    c[1] += Math.round((255-c[1])*x);
    c[2] += Math.round((255-c[2])*x);

    return HUD.fromRGB(c);
};

//from c1 to c2
HUD.interpolateColor = function(color1, color2, progress) {
    var c1 = HUD.getRGB(color1);
    var c2 = HUD.getRGB(color2);
    var c = [
        Math.round(c1[0] + (c2[0] - c1[0]) * progress),
        Math.round(c1[1] + (c2[1] - c1[1]) * progress),
        Math.round(c1[2] + (c2[2] - c1[2]) * progress)
    ];

    return HUD.fromRGB(c);
};

HUD.easeOutExpo = function (t, b, c, d) {
    return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
};

HUD.easeInExpo = function (t, b, c, d) {
    return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
};

HUD.easeOutSine = function (t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
};

HUD.easeInSine = function (t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
};


HUD.getRGB = function(color) {
    return [
        (color & 0xff0000) >> 16,
        (color & 0x00ff00) >> 8,
        color & 0x0000ff
    ];
};

HUD.fromRGB = function(rgb) {
    return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
};

HUD.Bar = function(w, h, color, val, maxVal) {
    this.w = Math.max(w,3);
    this.h = Math.max(h,3);
    this.color = color;
    this.flashColor = HUD.highlightColor(color);
    this.val = val;
    this.maxVal = maxVal;

    this.tex = new PIXI.RenderTexture(w,h);
    this.sprite = new PIXI.Sprite(this.tex);
    this.flashes = [];
    this.redraw = true;

    this.draw = function(graphics) {
        if (this.redraw && this.flashes.length == 0) {
            this.redraw = false;
        } else if (!this.redraw) {
            return;
        }
        var currentTime = new Date().getTime();
        var b = HUD.borderSize(this.w, this.h);
        var w = this.w-b*2;
        var h = this.h-b*2;

        graphics.clear();

        //background
        graphics.beginFill(HUD.borderColor);
        graphics.drawRect(0,0,this.w,this.h);
        graphics.endFill();

        //fill
        var fillW = Math.round((this.val / this.maxVal) * w);

        graphics.beginFill(this.color);
        graphics.drawRect(b,b,fillW,h);
        graphics.endFill();

        //flashes
        var numExpiredFlashes = 0;
        for (var i = 0; i < this.flashes.length; i++) {
            var flash = this.flashes[i];
            var progress = (currentTime - flash.time) / HUD.flashFadeTime;
            var flashX = b + Math.round(flash.newVal / this.maxVal * w);
            var flashW = Math.round((flash.prevVal - flash.newVal) / this.maxVal * w);

            progress = HUD.easeOutExpo(progress, 0, 1, 1);

            graphics.beginFill(this.flashColor, Math.max(0, 1-progress));
            graphics.drawRect(flashX,b,flashW,h);
            graphics.endFill();

            if (progress >= 1) {
                numExpiredFlashes += 1;
            }
        }

        if (numExpiredFlashes > 0) {
            this.flashes.splice(0,numExpiredFlashes);
        }

        this.tex.render(graphics);
    };

    this.changeVal = function(val, noflash) {
        var _this = this;
        if (!noflash && val < this.val) {
            var flash = {
                time:new Date().getTime(),
                prevVal:_this.val,
                newVal:val
            };
            this.flashes.push(flash);
        }
        this.val = val;
        this.redraw = true;
    };

    this.setActive = function() {
        this.sprite.alpha = 1;
    };

    this.setInactive = function() {
        this.sprite.alpha = 0;
    };

    this.fadeOut = function(duration) {

    };
};

HUD.Circle = function(w, h, color, borderWidth) {
    this.w = w*2;
    this.h = h*2;
    this.color = color;
    this.highlightColor = HUD.highlightColor(this.color);
    this.borderWidth = borderWidth*2;

    this.tex = new PIXI.RenderTexture(this.w+this.borderWidth*2,this.h+this.borderWidth*2);
    this.sprite = new PIXI.Sprite(this.tex);
    this.sprite.scale.x = 0.5;
    this.sprite.scale.y = 0.5;
    this.highlightStart = 0;
    this.highlightEnd = 0;
    this.expandEnd = 0;
    this.redraw = true;

    this.draw = function(graphics) {
        if (this.redraw) {
            this.tex.clear();
            
            var highlightProgress = Math.min(1, (Date.now()-this.highlightStart) / (this.highlightEnd-this.highlightStart));
            var expandProgress = Math.min(1, (Date.now()-this.highlightStart) / (this.expandEnd-this.highlightStart));
            var color = HUD.interpolateColor(this.highlightColor, this.color, highlightProgress);
            
            expandProgress = HUD.easeOutExpo(expandProgress, 0, 1, 1);


            graphics.clear();
            graphics.lineStyle(this.borderWidth, color, 1);
            graphics.drawEllipse(this.w/2+this.borderWidth, this.h/2+this.borderWidth, this.w/2*expandProgress, this.h/2*expandProgress);

            this.tex.render(graphics);

            if (highlightProgress == 1 && expandProgress == 1) {
                this.redraw = false;
            }
        }
    };

    this.highlight = function() {
        this.highlightStart = Date.now();
        this.highlightEnd = this.highlightStart + HUD.circleHighlightTime;
        this.expandEnd = this.highlightStart + HUD.circleExpandTime;
        this.redraw = true;
    };

    this.setActive = function() {
        this.sprite.alpha = 1;
    };

    this.setInactive = function() {
        this.sprite.alpha = 0;
    };

    this.set = function(props) {
        for (var prop in props) {
            this[prop] = props[prop];
        }
    };
};

HUD.FloatingText = function(text, lifeTime, fadeTime, velocity) {
    this.text = text;
    this.birthTime = new Date().getTime();
    this.lastDrawTime = this.birthTime;
    this.deathTime = this.birthTime + lifeTime;
    this.fadeEndTime = this.deathTime + fadeTime;
    this.velocity = velocity;
    this.remove = false;

    text.anchor.x = 0.5;
    text.anchor.y = 0.5;

    this.draw = function() {

        var currentTime = new Date().getTime();
        var displacementFactor = (currentTime-this.lastDrawTime) / 1000;
        this.text.position.x += this.velocity.x * displacementFactor;
        this.text.position.y += this.velocity.y * displacementFactor;

        if (currentTime >= this.deathTime) {
            var progress = (currentTime-this.deathTime) / (this.fadeEndTime-this.deathTime);
            this.text.alpha = Math.max(0, 1-progress);
            if (progress >= 1) {
                this.remove = true;
            }
        }

        this.lastDrawTime = currentTime;
    };
};