/**
 * Created by Kevin on 09/02/2015.
 */
var Textures = {
    texList:[
        'img/guy.gif',
        'img/sprite/man/bow.png',
        'img/sprite/man/hurt.png',
        'img/sprite/man/slash.png',
        'img/sprite/man/spell.png',
        'img/sprite/man/thrust.png',
        'img/sprite/man/walk.png'
    ]
};

Textures.TextureManager = function() {
    this.textures = {
        guy:PIXI.Texture.fromImage('img/guy.gif')
    };

    this.getTexture = function(s) {
        if (s in this.textures) {
            return this.textures[s];
        } else {
            return this.textures['guy'];
        }
    };

    this.registerTexture = function(name, tex) {
        this.textures[name] = tex;
    };
};