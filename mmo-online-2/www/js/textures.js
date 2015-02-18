/**
 * Created by Kevin on 09/02/2015.
 */
var Textures = {
    texList:[
        'img/guy.gif'
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

    this.loadTextures = function(onProgress) {
        var loaded = 0;
        var loaders = {};
        for (var i = 0; i < Textures.texList.length; i++) {
            loaders[Textures.texList[i]] = new PIXI.ImageLoader(Textures.texList[i]);
        }
    };
};