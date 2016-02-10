
function initGame() {
	window.game = {};
	game.viewDiv = $("#viewDiv");

	game.stage = new PIXI.Container();
	game.renderer = new PIXI.autoDetectRenderer(300, 300, null, false, true);
	game.renderer.backgroundColor = 0x3366ff;
	game.viewDiv.append(game.renderer.view);
	$(window).resize(function() { resizeView(); });
	PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

	game.worldContainer = new PIXI.Container();
	game.stage.addChild(game.worldContainer);

	//global graphics for RenderTextures to use
	game.volatileGraphics = new PIXI.Graphics();

	//global 1x1 texture for masking
	game.maskTexture = TextureGenerator.rectangle(10, 10, 0xffffff, 0, 0x000000);

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

	//TODO: kibo

	game.connection = new Connections.Connection({
		connString: window.serverWs,
		onConnect: function() {},
		onDisconnect: function() {},
		onMessage: function() {},
		onError: function() {}
	});

    //global filters
    game.filters = {
    	gray: 		new PIXI.filters.GrayFilter(),
    	bloom: 		new PIXI.filters.BloomFilter(),
    	dropShadow: new PIXI.filters.DropShadowFilter(),
    	ascii: 		new PIXI.filters.AsciiFilter(),
    	noise: 		new PIXI.filters.NoiseFilter(),
    	pixelate: 	new PIXI.filters.PixelateFilter()
    };
    game.filters.dropShadow.distance = 2;

    //set up base UI
	game.ui = new InterfaceElement({
		id:"main"
	});
	game.stage.addChild(game.ui.displayObject);
	game.ui.displayObject.filters = [game.filters.dropShadow];

	//set up the view
	resizeView();
	drawStage();

	//load
	loadAssets();
}

function onLoadComplete() {
	game.ui.removeChild(game.ui.findChildById("loadPanel"));

	if (urlArgs.testUI)
		initTestInterface();

	//connect
	initConnection();

	initMainMenu();
}

function initConnection() {
	game.connection.connect();
}

function onConnect() {

}

function drawStage() {
    requestAnimationFrame(function () { drawStage(); });

  	game.ui.draw();

  	var eleList = game.ui.findChildById("eleList");
  	if (eleList != null) {
  		eleList.attach.offset[1] += 1;
  		if (eleList.attach.offset[1] > 100)
  			eleList.attach.offset[1] = -100;
  		eleList.reposition(true);
  	}	

    game.renderer.render(game.stage);
}

function getVolatileGraphics() {
	game.volatileGraphics.clear();
	game.volatileGraphics.lineStyle(0,0,0);
	return game.volatileGraphics;
}