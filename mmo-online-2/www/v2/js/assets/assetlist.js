window.SOUND_LIST = {
	"music":[
		"fortress.ogg"
	],

	"ui":[
		"click.ogg",
		"rollover.ogg",
		"nope.ogg"
	]
};

function parseAssetList (list, prefix) {
	var r = [];
	var dir, fullpath, name;

	for (var path in list) {
		dir = list[path];
		for (var i = 0; i < dir.length; i++) {
			fullpath = prefix + path + '/' + dir[i];
			name = path + '/' + dir[i].split('.')[0];

			r.push(new Asset(name, fullpath));
		}
	}

	return r;
}

var Asset = Class({
	constructor: function(name, path) {
		this.name = name;
		this.path = path;
	}
});

//fetch the texture sheet and its json map
function loadTextures() {
	game.textureSheet = null;
	game.textureMap = null;
	game.textures = {};

	setStatus('Loading Textures', 'This should be quick.');

	PIXI.loader.add('textureSheet', 'textures.png');
	PIXI.loader.load(function(loader, resources) {
		game.textureSheet = resources.textureSheet.texture.baseTexture;
		onSheetOrMap();
	});

	$.getJSON('textureMap.json', function(data) {
		game.textureMap = data.frames;
		onSheetOrMap();
	});


	/*var asset;

	game.textureList = parseAssetList(TEXTURE_LIST, 'img/');
	game.numTexturesLoaded = 0;
	delete TEXTURE_LIST;

	for (var i = 0; i < game.textureList.length; i++) {
		asset = game.textureList[i];
		PIXI.loader.add(asset.name, asset.path);
	}


    PIXI.loader.on('progress', function() {
        game.numTexturesLoaded++;
        game.ui.status.findChildById("statusMessage").changeString(Math.round(game.numTexturesLoaded / game.textureList.length * 100).toString() + '%');
    });

    PIXI.loader.on('complete', function() {
    	delete game.textureList;
    	game.textures = {};
    	var tex;
    	for (var name in PIXI.loader.resources) {
    		tex = PIXI.loader.resources[name].texture;
    		game.textures[name] = tex;
    	}
    	onLoadTextures();
    });
    PIXI.loader.load();*/
}

function onSheetOrMap() {
	var map = game.textureMap;
	var sheet = game.textureSheet;

	if (sheet === null || map === null)
		return;

	//both are loaded
	var frame, rect;

	for (var texName in map) {
		frame = map[texName].frame;
		rect = new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h);
		game.textures[texName] = new PIXI.Texture(sheet, rect);
	}

	onLoadTextures();
}

function loadSounds() {
	var asset;
	var soundPath = 'sound/';

	game.soundList = parseAssetList(SOUND_LIST, soundPath);
	game.numSoundsLoaded = 0;
	delete SOUND_LIST;

	//update ui
	game.ui.status.findChildById('statusTitle').changeString("Loading Sounds");
	game.ui.status.findChildById('statusMessage').changeString("0%");

	createjs.Sound.addEventListener('fileload', onSoundLoaded);

	createjs.Sound.alternateExtensions = ['mp3'];
	for (var i = 0; i < game.soundList.length; i++) {
		asset = game.soundList[i];
		createjs.Sound.registerSound({id:asset.name, src:asset.path});
	}
}

function onSoundLoaded() {
	game.numSoundsLoaded += 1;
	game.ui.status.findChildById("statusMessage").changeString(Math.round(game.numSoundsLoaded / game.soundList.length * 100).toString() + '%');

	if (game.numSoundsLoaded >= game.soundList.length) {
		onLoadSounds();
	}
}