function initEditor() {
	window.editor = {};
	editor.viewDiv = $("#viewDiv");

	editor.stage = new PIXI.Stage(0xdddddd);
	editor.renderer = PIXI.autoDetectRenderer(300, 300, null, false, true);
	editor.viewDiv.append(editor.renderer.view);
	$(window).resize(function() { resizeView(); });

	editor.displayContainer = new PIXI.DisplayObjectContainer();
	editor.stage.addChild(editor.displayContainer);
	editor.wireframeGraphics = new PIXI.Graphics();
	editor.overlayGraphics = new PIXI.Graphics();
	editor.displayContainer.addChild(editor.wireframeGraphics);
	editor.stage.addChild(editor.overlayGraphics);
	editor.skeletons = {};
	editor.bones = {};

	editor.skeletons["edit"] = new Skeletons.Skeleton();
	editor.skeleton = editor.skeletons["edit"];

	var bone = new Skeletons.Bone(100,0);
	editor.skeleton.addBone(bone);
	editor.bones['bone1'] = bone;

	bone = new Skeletons.Bone(75,90);
	editor.skeleton.addBone(bone);
	editor.bones['bone2'] = bone;

	editor.bones['bone2'].setParent(editor.bones['bone1']);
	editor.skeleton.findRootBones();


	//set up mouse controls
	editor.showMouse = false;
	editor.leftMouseDown = null;
	editor.leftMouseDragging = false;
	editor.lastMouseCoords = null;
	setMouseEvents();

	editor.selectedBone = -1;
	editor.selectedPart = 0;

	resizeView();
	drawStage();
}

function setMouseEvents() {
	var LEFT = 1;
	var MIDDLE = 2;
	var RIGHT = 3;
	var DRAG_DISTANCE = 10;

	editor.viewDiv.mousedown(function(evt) {
		editor.lastMouseCoords = getMouseCoords(evt);

		var which = evt.which;
		if (which == LEFT) {
			editor.leftMouseDown = editor.lastMouseCoords;

			//check for clicked bones
			var clickResult = editor.skeleton.checkWireframeClicked(editor.leftMouseDown);

			if (clickResult[0] != -1) {
				editor.selectedBone = clickResult[0];
				editor.selectedPart = clickResult[1];
			}
		}
	});

	editor.viewDiv.mouseup(function(evt) {
		editor.lastMouseCoords = getMouseCoords(evt);

		var which = evt.which;
		if (which == LEFT) {
			editor.leftMouseDown = null;
			editor.leftMouseDragging = false;
			editor.selectedBone = -1;
		}
	});

	editor.viewDiv.mousemove(function(evt) {
		var coords = getMouseCoords(evt);
		editor.lastMouseCoords = coords;

		if (editor.leftMouseDown != null && Vectors.distanceBetween(coords, editor.leftMouseDown) >= 5) {
			editor.leftMouseDragging = true;
		}

		if (editor.selectedBone != -1 && editor.selectedPart == 1) {
			var bone = editor.skeleton.bones[editor.selectedBone];
			var angle = Vectors.angleTo(bone.startCoords, coords);
			if (bone.hasParent() && !bone.ignoreParentAngle)
				angle -= bone.parent.finalAngle;
			bone.angle = angle;
		}
	});

	editor.viewDiv.mouseleave(function(evt) {
		editor.leftMouseDown = null;
		editor.leftMouseDragging = false;
	});
}

function getMouseCoords(evt) {
	var offset = editor.viewDiv.offset();
	return [
		evt.pageX - offset.left - (editor.displayContainer.position.x), 
		evt.pageY - offset.top - (editor.displayContainer.position.y)
	];
}

function drawStage() {
    requestAnimFrame(function () { drawStage(); });

    editor.wireframeGraphics.clear();
    editor.wireframeGraphics.lineStyle(0,0,0);

    var skeleton;
    for (var skeletonId in editor.skeletons) {
    	skeleton = editor.skeletons[skeletonId];
    	skeleton.update();
    	skeleton.drawWireframe(editor.wireframeGraphics, Skeletons.wireframeDefaultColor, editor.selectedBone);
    }

    if (editor.showMouse && editor.leftMouseDown != null) {
    	var v = editor.lastMouseCoords;
    	editor.wireframeGraphics.lineStyle(2,0x0000ff,1);
    	editor.wireframeGraphics.moveTo(v[0]-4, v[1]-4);
    	editor.wireframeGraphics.lineTo(v[0]+4, v[1]+4);
    	editor.wireframeGraphics.moveTo(v[0]+4, v[1]-4);
    	editor.wireframeGraphics.lineTo(v[0]-4, v[1]+4);
    }

    //if playing
    /*
    editor.overlayGraphics.clear();
    editor.overlayGraphics.lineStyle(8,0x00000ff,1);
    editor.overlayGraphics.drawRect(0, 0, editor.renderer.width, editor.renderer.height);
    */

    editor.renderer.render(editor.stage);
};

function resizeView() {
	var viewWidth = editor.viewDiv.width();
	var viewHeight = editor.viewDiv.height();
	editor.renderer.resize(viewWidth, viewHeight);
	editor.displayContainer.position.x = Math.round(viewWidth/2);
	editor.displayContainer.position.y = Math.round(viewHeight/2);

	positionTimeDiv();
}