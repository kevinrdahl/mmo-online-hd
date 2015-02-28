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
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.8;

    this.hpBar = new HUD.Bar(this.sprite.width, Math.round(this.sprite.width/6), 0x00ff00, unit.hp, unit.maxhp);
    this.hpBar.sprite.anchor.x = 0.5;
    this.hpBar.sprite.position.y = Math.floor(this.sprite.height/4) + 1;

    var maxDimension = Math.max(this.sprite.width, this.sprite.height);
    this.selectionCircle = new HUD.Circle(maxDimension*1.1, maxDimension*1.1/2, 0x00ff00, 3);
    this.selectionCircle.sprite.anchor.x = 0.5;
    this.selectionCircle.sprite.anchor.y = 0.5;
    this.selectionCircle.setInactive();

    this.container.addChild(this.selectionCircle.sprite);
    this.container.addChild(this.sprite);
    this.container.addChild(this.hpBar.sprite);

    this.draw = function(stepProgress, unit, graphics) {
        this.hpBar.draw(graphics);
        this.selectionCircle.draw(graphics);
        var drawPosition = unit.position.add(unit.nextPosition.sub(unit.position).scaled(stepProgress));
        drawPosition = UI.worldToView(drawPosition);
        this.container.position.x = drawPosition.x;
        this.container.position.y = drawPosition.y;
    };

    this.getPosition = function() {
        return new LinAlg.Vector2(
            this.container.position.x,
            this.container.position.y
        );
    };

    this.select = function() {
        this.selectionCircle.setActive();
    };

    this.deselect = function() {
        this.selectionCircle.setInactive();
    };
};