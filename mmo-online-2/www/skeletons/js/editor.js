function initEditor() {
	window.editor = {};
	editor.viewDiv = $("#viewDiv");
	var viewWidth = editor.viewDiv.width();
	var viewHeight = editor.viewDiv.height();

	editor.stage = new PIXI.Stage(0xdddddd);
	editor.renderer = PIXI.autoDetectRenderer(300, 300, null, false, true);
	editor.viewDiv.append(editor.renderer.view);
	$(window).resize(function() { resizeView(); });

	editor.displayContainer = new PIXI.DisplayObjectContainer();
	editor.stage.addChild(editor.displayContainer);
	editor.wireframeGraphics = new PIXI.Graphics();
	editor.displayContainer.addChild(editor.wireframeGraphics);
	editor.skeletons = {};

	editor.skeletons["edit"] = new Skeletons.Skeleton();
	editor.skeletons["edit"].addBone(new Skeletons.Bone(null,100,0), 'bone');

	//set up mouse controls
	editor.leftMouseDown = null;
	editor.leftMouseDragging = false;
	setMouseEvents();

	resizeView();
	drawStage();
}

function setMouseEvents() {
	var LEFT = 1;
	var MIDDLE = 2;
	var RIGHT = 3;
	var DRAG_DISTANCE = 10;

	editor.viewDiv.mousedown(function(evt) {
		var which = evt.which;
		if (which == LEFT) {
			editor.leftMouseDown = getMouseCoords(evt);
		}
	});

	editor.viewDiv.mouseup(function(evt) {
		var which = evt.which;
		if (which == LEFT) {

		}
	});

	editor.viewDiv.mousemove(function(evt) {

	});

	editor.viewDiv.mouseleave(function(evt) {
	});
}

function getMouseCoords(evt) {
	var offset = editor.viewDiv.offset();
	return [evt.pageX-offset.left, evt.pageY-offset.top];
}

function drawStage() {
    requestAnimFrame(function () { drawStage(); });

    editor.wireframeGraphics.clear();
    editor.wireframeGraphics.lineStyle(0,0,0);

    var skeleton;
    for (var skeletonId in editor.skeletons) {
    	skeleton = editor.skeletons[skeletonId];
    	skeleton.update();
    	skeleton.drawWireframe(editor.wireframeGraphics);
    }

    editor.renderer.render(editor.stage);
};

function resizeView() {
	var viewWidth = editor.viewDiv.width();
	var viewHeight = editor.viewDiv.height();
	editor.renderer.resize(viewWidth, viewHeight);
	editor.displayContainer.position.x = Math.round(viewWidth/2);
	editor.displayContainer.position.y = Math.round(viewHeight/2);
}