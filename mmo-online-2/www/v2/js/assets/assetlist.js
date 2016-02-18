window.TEXTURE_LIST = {
	"character":[
		"man.png"
	],

	"terrain":[
		"grass1.png",
		"grass2.png",
		"grass3.png",
		"grass4.png",
		"flower1.png",
		"flower2.png",
		"flower3.png",
		"dirt.png",
		"dirtpatch1.png",
		"dirtpatch2.png",
		"dirtpatch3.png",
		"tree1.png",
		"tree2.png",
		"wall.png"
	]
};

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

function loadTextures() {
	var asset;

	game.textureList = parseAssetList(TEXTURE_LIST, 'img/');
	game.numTexturesLoaded = 0;
	delete TEXTURE_LIST;

	for (var i = 0; i < game.textureList.length; i++) {
		asset = game.textureList[i];
		PIXI.loader.add(asset.name, asset.path);
	}

	/*var loadPanel = new Panel({
		id:"loadPanel",
		width:250,
		height:60,
		attach:{
			where:[0.5, 0],
			parentWhere:[0.5, 0.5],
			offset:[0,-60]
		},
		parent:game.ui
	});

	loadPanel.addChild(new InterfaceText("Loading Textures", {
		id:'loadTitle',
		font:UIConfig.titleText,
		attach:{
			where:[0.5,1],
			parentWhere:[0.5,0.5],
			offset:[0,0]
		},
		parent:loadPanel
	}));

	loadPanel.addChild(new InterfaceText("0%", {
		id:"loadCountText",
		font:UIConfig.bodyText,
		attach:{
			where:[0.5,0],
			parentWhere:[0.5,0.5],
			offset:[0,4]
		},
		parent:loadPanel
	}));

	game.ui.addChild(loadPanel);*/

	setStatus('Loading Textures', '0%');

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
    PIXI.loader.load();
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