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

Units.UnitSprite = function(unit, texManager) {
    this.container = new PIXI.DisplayObjectContainer;

    this.sprite = new PIXI.Sprite(texManager.getTexture(unit.sprite));

    this.hpBar = new HUD.Bar(this.sprite.width, Math.round(this.sprite.width/6), 0x00ff00, unit.hp, unit.maxhp);
    this.hpBar.sprite.position.x = 0;
    this.hpBar.sprite.position.y = this.sprite.height + 1;

    this.container.addChild(this.sprite);
    this.container.addChild(this.hpBar.sprite);

    this.draw = function(stepProgress, unit, graphics) {
        this.hpBar.draw(graphics);
        var drawPosition = unit.position.add(unit.nextPosition.sub(unit.position).scaled(stepProgress));
        this.container.position.x = drawPosition.x - this.sprite.width / 2;
        this.container.position.y = drawPosition.y - this.sprite.height / 2;
    };

    this.getPosition = function() {
        return new LinAlg.Vector2(
            this.container.position.x + this.sprite.width/2,
            this.container.position.y + this.sprite.height/2
        );
    };
};