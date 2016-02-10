window.ASSET_LIST = {
	"character":[
		"man.png"
	],

	"terrain":[
		"grass.png",
		"dirt.png",
		"wall.png"
	]
};

function parseAssetList (assets) {
	var r = [];
	var dir, fullpath, name;

	for (var path in assets) {
		dir = assets[path];
		for (var i = 0; i < dir.length; i++) {
			fullpath = 'img/' + path + '/' + dir[i];
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

function loadAssets() {
	var asset;

	game.assetList = parseAssetList(ASSET_LIST);
	game.numAssetsLoaded = 0;

	for (var i = 0; i < game.assetList.length; i++) {
		asset = game.assetList[i];
		PIXI.loader.add(asset.name, asset.path);
	}

	var loadPanel = new Panel({
		id:"loadPanel",
		width:200,
		height:60,
		attach:{
			where:[0.5, 0],
			parentWhere:[0.5, 0.5],
			offset:[0,-60]
		},
		parent:game.ui
	});

	loadPanel.addChild(new InterfaceText("LOADING", {
		font:UIConfig.titleText,
		attach:{
			where:[0.5,1],
			parentWhere:[0.5,0.5],
			offset:[0,0]
		},
		parent:loadPanel
	}));

	loadPanel.addChild(new InterfaceText("0/" + game.assetList.length, {
		id:"loadCountText",
		font:UIConfig.bodyText,
		attach:{
			where:[0.5,0],
			parentWhere:[0.5,0.5],
			offset:[0,4]
		},
		parent:loadPanel
	}));

	game.ui.addChild(loadPanel);


    PIXI.loader.on('progress', function() {
        game.numAssetsLoaded++;
        game.ui.findChildById("loadCountText").changeString(game.numAssetsLoaded + "/" + game.assetList.length);
    });

    PIXI.loader.on('complete', function() {
    	setTimeout(
			function() {
				onLoadComplete();
			},
			1000
		);
    });
    PIXI.loader.load();
}