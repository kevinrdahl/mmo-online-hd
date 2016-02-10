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
				logger.log("ui", element.getFullName() + " mousedown.");

				game.ui.moveChildToTop(element.findTopParent());
				game.clickedElement = element;
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
					logger.log("ui", element.getFullName() + " clicked.");
					//console.log(element.width + ' ' + element.height);
					//console.log(element.displayObject.getBounds());
					//console.log(element);
					if (element.name == "close") {
						logger.log("ui", "close " + element.parent.getFullName());
						element.parent.parent.removeChild(element.parent);
					} else if (element instanceof TextBox) {
						setElementActive(element);
					} else {
						setElementActive(null);
					}
				} else {
					setElementActive(null);
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
	logger.log("ui", "Begin dragging " + element.getFullName());
	game.dragElement = element;
	game.dragElementCoords = [game.dragElement.x, game.dragElement.y];
}

function endDrag() {
	if (game.dragElement != null) {
		game.dragElement.toNearestPixel();
		logger.log("ui", "End drag");
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

	diff = position.x - (game.renderer.width - element.width);
	if (diff > 0)
		element.x -= diff;

	//clamp y
	diff = 0 - position.y;
	if (diff > 0)
		element.y += diff;

	diff = position.y - (game.renderer.height - element.height);
	if (diff > 0)
		element.y -= diff;
}

function setElementActive(element) {
	if (element !== null) {
		element.active = true;
	}

	if (game.activeElement !== null) {
		game.activeElement.active = false;
	}

	game.activeElement = element;
}

function resizeView() {
	var viewWidth = game.viewDiv.width();
	var viewHeight = game.viewDiv.height();
	logger.log("debug", "Resize: " + viewWidth + "x" + viewHeight);
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

	var bounds = testWindow.getInnerBounds();
	var eleList = new ElementList({
		id:"eleList",
		parent:testWindow,
		width:bounds.width - 2*UIConfig.elementListOuterPadding,
		height:bounds.height,
		attach:{
			where:[0,0],
			parentWhere:[0,0],
			offset:[UIConfig.elementListOuterPadding, UIConfig.elementListOuterPadding]
		}
	});
	testWindow.addChild(eleList);

	testWindow.applyMask(bounds);

	var textEle = new InterfaceText("Stuff", {font:UIConfig.titleText});
	eleList.addChild(textEle);
	textEle.fitToParent();

	function createElementAdder(num) {
		return function() {
			var textEle = new InterfaceText("Message " + num, {font:UIConfig.bodyText});
			game.ui.findChildById("eleList").addChild(textEle);
			textEle.fitToParent();
		}
	}

	for (var i = 0; i < 15; i++) {
		setTimeout(createElementAdder(i+1),i*1000);
	}

	var sprite = new PIXI.Sprite(PIXI.loader.resources['character/man'].texture);
	game.stage.addChild(sprite);
	sprite.position.x = 200;
	sprite.position.y = 200;
	sprite.scale.x = 2;
	sprite.scale.y = 2;
}