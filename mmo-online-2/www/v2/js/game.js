
function initGame() {
	window.game = {};
	game.viewDiv = $("#viewDiv");

	game.stage = new PIXI.Container();
	game.renderer = new PIXI.autoDetectRenderer(300, 300, null, false, true);
	game.renderer.backgroundColor = 0x489848; //dawnlike:0x6daa2c
	game.viewDiv.append(game.renderer.view);
	$(window).resize(function() { resizeView(); });
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
	game.TERRAIN_TILE_WIDTH = 24;
	game.DEFAULT_SCALE = 2;

	game.worldContainer = new PIXI.Container();
	game.stage.addChild(game.worldContainer);

	//global graphics for RenderTextures to use
	game.volatileGraphics = new PIXI.Graphics();

	//global texture for masking
	game.maskTexture = TextureGenerator.rectangle(10, 10, 0xffffff, 0, 0x000000);

	//recolors and caches textures for generating spritesheets
	game.recolorManager = new RecolorManager();

	//mouse state
	game.leftMouseDown = null;
	game.leftClickedIsUI = false;
	game.leftMouseDragging = false;
	game.lastMouseCoords = null;
	setMouseEvents();

	//ui drag
	game.clickedElement = null;
	game.dragElement = null;
	game.dragElementCoords = null;
	game.activeElement = null;
	game.hoverElement = null;

	game.connection = new Connections.Connection({
		connString: window.serverWs,
		onConnect: function() {},
		onDisconnect: function() {},
		onMessage: onMainMenuMessage,
		onError: function() {}
	});

    //global filters
    game.filters = {
    	gray: 		new PIXI.filters.GrayFilter(),
    	bloom: 		new PIXI.filters.BloomFilter(),
    	dropShadow: new PIXI.filters.DropShadowFilter(),
    	ascii: 		new PIXI.filters.AsciiFilter(),
    	noise: 		new PIXI.filters.NoiseFilter(),
    	pixelate: 	new PIXI.filters.PixelateFilter(),
    	uiBlur:		new PIXI.filters.BlurFilter()
    };
    game.filters.dropShadow.distance = 2;
    game.filters.bloom.blur = 4;
    game.filters.uiBlur.blur = 2;

    //set up base UI
	game.ui = new InterfaceElement({
		id:"main"
	});
	game.stage.addChild(game.ui.displayObject);
	game.ui.status = null;

	//framerate tracking
	game.framerate = 0;
	game.frameRenderTimes = [];
	var frameText = new InterfaceText('0', {id:'framerate'});
	frameText.addFilter(game.filters.dropShadow);
	game.ui.addChild(frameText);
	console.log(frameText);

	//set up the view
	resizeView();
	drawStage();

	//load
	loadTextures();
}

function updateFramerate(value) {
	game.frameRenderTimes.push(value);
	
	var avg = 0;
	for (var i = game.frameRenderTimes.length-1; i >= 0 && avg < 1000; i--) {
		avg += game.frameRenderTimes[i];
	}
	avg /= game.frameRenderTimes.length-i;
	avg = 1000/avg;
	game.frameRenderTimes.splice(0,i);
	var s = Math.round(avg).toString() + ' fps';
	game.ui.findChildById('framerate').changeString(s);
}

function onLoadTextures() {
	if (soundEnabled)
		loadSounds();
	else
		onLoadComplete();
}

function onLoadSounds() {
	setTimeout(function() {
		onLoadComplete();
	}, 500);
}

function onLoadComplete() {
	if (urlArgs.testUI)
		initTestInterface();

	if (urlArgs.testSprites)
		testAnimatedSprites();

	//connect
	initMainMenu();

	initConnection();

	setStatus('Connecting', 'Establishing connection to game server...');
}

function initConnection() {
	game.connection.connect();
}

function onConnect() {

}

function onMessage(msg) {
	if (mainMenu !== null) {
		onMainMenuMessage(msg);
	}
}

function drawStage() {
    requestAnimationFrame(function () { drawStage(); });
    var frameStart = performance.now();

  	game.ui.draw();
  	if (menuBackground !== null)
  		updateMenuBackground();

  	//testUI
  	var eleList = game.ui.findChildById("eleList");
  	if (eleList != null) {
  		eleList.attach.offset[1] += 1;
  		if (eleList.attach.offset[1] > 100)
  			eleList.attach.offset[1] = -100;
  		eleList.reposition(true);
  	}	

    game.renderer.render(game.stage);
    updateFramerate(performance.now() - frameStart);
}

function getVolatileGraphics() {
	game.volatileGraphics.clear();
	game.volatileGraphics.lineStyle(0,0,0);
	return game.volatileGraphics;
}