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
	return; //ayy

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

	for (var i = 0; i < 15; i++) {
		var j = i;
		setTimeout(function() {
			var textEle = new InterfaceText("Message " + (j+1), {font:UIConfig.bodyText});
			game.ui.findChildById("eleList").addChild(textEle);
			textEle.fitToParent();
		},
		i*1000
		);
		
	}
}