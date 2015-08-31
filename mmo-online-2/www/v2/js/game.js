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
	game.logger = new Logger();

	game.logger.types["debug"] = new Logger.LogType({
		textColor:"#999" //grey
	});
	game.logger.types["error"] = new Logger.LogType({
		textColor:"#f00", //red
		prefix:"ERROR"
	});
	game.logger.types["game"] = new Logger.LogType({
		textColor:"#093", //green
		prefix:"game"
	});
	game.logger.types["conn"] = new Logger.LogType({
        textColor:"#fff", //white
        bgColor:"#06c" //blue
    });
    game.logger.types["connRecv"] = new Logger.LogType({
        textColor:"#06c", //blue
        prefix:"RECV"
    });
    game.logger.types["connSend"] = new Logger.LogType({
        textColor:"#93f", //purple
        prefix:"SEND"
    });
    game.logger.types["ui"] = new Logger.LogType({
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

function setMouseEvents() {
	var LEFT = 1;
	var MIDDLE = 2;
	var RIGHT = 3;
	var DRAG_DISTANCE = 10;

	game.viewDiv.mousedown(function(evt) {
		game.lastMouseCoords = getMouseCoords(evt);

		var which = evt.which;
		if (which == LEFT) {
			game.leftMouseDown = game.lastMouseCoords;

			var element = game.ui.getElementAtCoords(game.leftMouseDown);
			if (element != null) {
				game.logger.log("ui", element.getFullName() + " mousedown.");

				game.clickedElement = element;

				game.ui.moveChildToTop(element.findTopParent());
			}
		}
	});

	game.viewDiv.mouseup(function(evt) {
		game.lastMouseCoords = getMouseCoords(evt);

		var which = evt.which;
		if (which == LEFT) {
			if (game.leftMouseDragging) {

			} else {
				//click!
				var element = game.clickedElement;
				if (element != null) {
					game.logger.log("ui", element.getFullName() + " clicked.");
					if (element.name == "close") {
						game.logger.log("ui", "close " + element.parent.getFullName());
						element.parent.parent.removeChild(element.parent);
					}
				}
			}

			game.leftMouseDown = null;
			game.leftMouseDragging = false;
			endDrag();
		}
	});

	game.viewDiv.mousemove(function(evt) {
		var coords = getMouseCoords(evt);
		game.lastMouseCoords = coords;

		if (game.leftMouseDown != null && Vectors.distanceBetween(coords, game.leftMouseDown) >= 5) {
			if (!game.leftMouseDragging && game.clickedElement != null && game.clickedElement.draggable) {
				beginDragElement(game.clickedElement.dragElement);
			}
			game.leftMouseDragging = true;
		}

		//drag UI element
		if (game.dragElement != null) {
			var c = Vectors.subtract(coords, game.leftMouseDown);
			c = Vectors.add(c, game.dragElementCoords);

			game.dragElement.x = c[0];
			game.dragElement.y = c[1];

			keepElementInView(game.dragElement);
		}
	});

	game.viewDiv.mouseleave(function(evt) {
		game.leftMouseDown = null;
		game.leftMouseDragging = false;
		endDrag();
	});
}

function getMouseCoords(evt) {
	var offset = game.viewDiv.offset();
	return [
		evt.pageX - offset.left, 
		evt.pageY - offset.top
	];
}

function beginDragElement(element) {
	game.logger.log("ui", "Begin dragging " + element.getFullName());
	game.dragElement = element;
	game.dragElementCoords = [game.dragElement.x, game.dragElement.y];
}

function endDrag() {
	if (game.dragElement != null) {
		game.dragElement.toNearestPixel();
		game.logger.log("ui", "End drag");
	}

	game.dragElement = null;
	game.clickedElement = null;
}

function keepElementInView(element) {
	element.updateDisplayObjectPosition();
	var position = element.displayObject.toGlobal(game.ui.displayObject.position);

	//clamp x
	var diff = 0 - position.x;
	if (diff > 0)
		element.x += diff;

	diff = position.x - (game.renderer.width - element.displayObject.width);
	if (diff > 0)
		element.x -= diff;

	//clamp y
	diff = 0 - position.y;
	if (diff > 0)
		element.y += diff;

	diff = position.y - (game.renderer.height - element.displayObject.height);
	if (diff > 0)
		element.y -= diff;
}

function resizeView() {
	var viewWidth = game.viewDiv.width();
	var viewHeight = game.viewDiv.height();
	game.logger.log("debug", "Resize: " + viewWidth + "x" + viewHeight);
	game.renderer.resize(viewWidth, viewHeight);

	game.ui.resize(viewWidth, viewHeight);

	for (var i = 0; i < game.ui.children.length; i++) {
		keepElementInView(game.ui.children[i]);
	}
}

function initTestInterface() {
	var testWindow = new WindowPanel({
		id:"testWindow",
		title:"cmd.exe",
		parent:game.ui,
		attach:{
			where:[0.5, 0],
			parentWhere:[0.5, 0],
			offset:[0,100],
			firstOnly:true

		},
		width:200,
		height:250
	});
	game.ui.addChild(testWindow);

	game.ui.addChild(new Panel({
		id:"attachPanel",
		parent:game.ui,
		attach:{
			where:[1,0],
			parentWhere:[0.75, 0],
			offset:[0,0]
		}
	}));

	var size = testWindow.getInnerSize();
	var maskEle = new MaskElement({
		parent:testWindow,
		width:size.width - 2*UIConfig.elementListOuterPadding,
		height:size.height - testWindow.headerBar.height-2,
		attach:{
			where:[0,0],
			parentWhere:[0,0],
			offset:[testWindow.borderWidth + UIConfig.elementListOuterPadding, testWindow.headerBar.height + UIConfig.elementListOuterPadding]
		}
	});
	var eleList = new ElementList({
		id:"eleList",
		parent:maskEle,
		width:maskEle.width,
		height:maskEle.height
	});
	maskEle.addChild(eleList);
	testWindow.addChild(maskEle);

	var textEle = new InterfaceText("Stuff", {font:UIConfig.titleText});
	eleList.addChild(textEle);
	textEle.fitToParent();

	for (var i = 0; i < 10; i++) {
		textEle = new InterfaceText("Message " + (i+1), {font:UIConfig.bodyText});
		eleList.addChild(textEle);
		textEle.fitToParent();
	}
}

function getVolatileGraphics() {
	game.volatileGraphics.clear();
	game.volatileGraphics.lineStyle(0,0,0);
	return game.volatileGraphics;
}