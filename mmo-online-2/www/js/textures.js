/**
 * Created by Kevin on 09/02/2015.
 */
var Textures = {};

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
};