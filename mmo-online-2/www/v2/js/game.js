function initGame() {
	window.game = {};
	game.viewDiv = $("#viewDiv");

	game.stage = new PIXI.Stage(0x99ff99);
	game.renderer = new PIXI.autoDetectRenderer(300, 300, null, false, true);
	game.viewDiv.append(game.renderer.view);
	$(window).resize(function() { resizeView(); });

	game.worldContainer = new PIXI.DisplayObjectContainer();
	game.stage.addChild(game.worldContainer);

	//Have a global graphics for RenderTextures to use
	game.volatileGraphics = new PIXI.Graphics();

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

	//TODO: kibo

	//logging
	window.logger = new Logger();

	window.logger.types["debug"] = new Logger.LogType({
		textColor:"#999" //grey
	});
	window.logger.types["error"] = new Logger.LogType({
		textColor:"#f00", //red
		prefix:"ERROR"
	});
	window.logger.types["game"] = new Logger.LogType({
		textColor:"#093", //green
		prefix:"game"
	});
	window.logger.types["conn"] = new Logger.LogType({
        textColor:"#fff", //white
        bgColor:"#06c" //blue
    });
    window.logger.types["connRecv"] = new Logger.LogType({
        textColor:"#06c", //blue
        prefix:"RECV"
    });
    window.logger.types["connSend"] = new Logger.LogType({
        textColor:"#93f", //purple
        prefix:"SEND"
    });
    window.logger.types["ui"] = new Logger.LogType({
        textColor:"#f90", //orange
        prefix:"ui"
    });

    //filters for everyone!
    game.filters = {
    	gray: new PIXI.GrayFilter()
    }

    //set up base UI
	game.ui = new InterfaceElement({
		id:"main"
	});
	game.stage.addChild(game.ui.displayObject);

	//set up the view
	resizeView();
	drawStage();

	//connect to the server
	initConnection();

	//load
	loadAssets();
}

function loadAssets() {
	game.assetList = parseAssetList(GAME_ASSETS);
	game.loader = new PIXI.AssetLoader(game.assetList);
	game.loader.numLoaded = 0;

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
			where:[0.5,0],
			parentWhere:[0.5,0],
			offset:[0,10]
		},
		parent:loadPanel
	}));

	loadPanel.addChild(new InterfaceText("0/" + game.assetList.length, {
		id:"loadCountText",
		font:UIConfig.bodyText,
		attach:{
			where:[0.5,1],
			parentWhere:[0.5,1],
			offset:[0,-8]
		},
		parent:loadPanel
	}));

	game.ui.addChild(loadPanel);


    game.loader.onProgress = function() {
        game.loader.numLoaded++;
        game.ui.findChildById("loadCountText").changeString(game.loader.numLoaded + "/" + game.assetList.length);
    };
    game.loader.onComplete = function() {
        onLoadComplete();
    };
    game.loader.load();
}

function onLoadComplete() {
	setTimeout(
		function() {
			game.ui.removeChild(game.ui.findChildById("loadPanel"));
		},
		1000
	);

	initTestInterface();

	//connect
	initConnection();
}

function drawStage() {
    requestAnimFrame(function () { drawStage(); });

  	game.ui.draw();

  	var eleList = game.ui.findChildById("eleList");
  	if (eleList != null) {
  		eleList.attach.offset[1] += 1;
  		if (eleList.attach.offset[1] > 100)
  			eleList.attach.offset[1] = -100;
  		eleList.reposition(true);
  	}	

    game.renderer.render(game.stage);
};

function getVolatileGraphics() {
	game.volatileGraphics.clear();
	game.volatileGraphics.lineStyle(0,0,0);
	return game.volatileGraphics;
}