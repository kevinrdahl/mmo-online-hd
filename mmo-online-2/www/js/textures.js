/*
 * Created by Kevin on 09/02/2015.
 */
var Textures = {
    texList:[
        'img/guy.gif',
        'img/icon/backstab.png',
        'img/icon/backstab2.png',
        'img/icon/teleport.png'
    ]
};

Textures.TextureManager = function() {
    this.textures = {
        guy:PIXI.Texture.fromImage('img/guy.gif'),
        icon_backstab2:PIXI.Texture.fromImage('img/icon/backstab2.png')
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