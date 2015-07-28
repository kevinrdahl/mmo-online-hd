var Skeletons = {
	wireframeEndSize : 7,
	wireframeLineWidth : 3,
	wireframeDefaultColor : 0x000000,
	progressions:[
		NONE:0,
		LINEAR:1
	]
};

/*\
|*|
|*| BONE
|*|
\*/

Skeletons.Bone = function (parent, length, angle, ignoreParentAngle) {
	if (typeof parent === 'undefined') {
		this.parent = null;
	} else if (parent === 'self') {
		this.parent = this;
	} else {
		this.parent = parent;
	}
	this.len = typeof length !== 'undefined' ?  length : 1;
	this.angle = typeof angle !== 'undefined' ?  angle : 0;
	this.finalAngle = this.angle;
	this.ignoreParentAngle = typeof ignoreParentAngle !== 'undefined' ?  ignoreParentAngle : false;

	this.initialize();
};

Skeletons.Bone.prototype.initialize = function () {
	this.startCoords = [0,0];
	this.endCoords = [0,0];
	this.children = [];
};

Skeletons.Bone.prototype.update = function() {
	if (this.parent != null && this.parent != this) {
		Vectors.copyTo(this.parent.endCoords, this.startCoords);
		if (this.ignoreParentAngle)
			this.finalAngle = this.angle;
		else
			this.finalAngle = this.parent.finalAngle + this.angle;
	}
	this.endCoords = Vectors.offset(this.startCoords, this.finalAngle, this.len);

	for (var i = 0; i < this.children.length; i++) {
		this.children[i].update();
	}
};

Skeletons.Bone.prototype.drawWireframe = function(graphics, color) {
	graphics.beginFill(color, 1);
	this.drawEndWireframe(graphics, this.startCoords);
	this.drawEndWireframe(graphics, this.endCoords);
	graphics.endFill;
	graphics.lineStyle(Skeletons.wireframeLineWidth, color, 1);
	graphics.moveTo(this.startCoords[0], this.startCoords[1]);
	graphics.lineTo(this.endCoords[0], this.endCoords[1]);
};

Skeletons.Bone.prototype.drawEndWireframe = function (graphics, v) {
	var x = Skeletons.wireframeEndSize/2 - 1;
	graphics.drawRect(v[0]-x, v[1]-x, Skeletons.wireframeEndSize, Skeletons.wireframeEndSize);
};

Skeletons.Bone.prototype.checkWireframeClicked = function(v) {
	if (Vectors.distanceBetween(this.endCoords, v) <= Skeletons.wireframeEndSize)
		return 1;
	else if (Vectors.distanceBetween(this.startCoords, v) <= Skeletons.wireframeEndSize)
		return 0;
	else
		return -1;
};


/*\
|*|
|*| SKELETON
|*|
\*/

Skeletons.Skeleton = function () {
	this.initialize();
};

Skeletons.Skeleton.prototype.initialize = function() {
	this.bones = {};
	this.rootBones = [];
	this.parent = this;
	this.coords = [0,0];
};

Skeletons.Skeleton.prototype.update = function () {
	var bone;
	for (var i = 0; i < this.rootBones.length; i++) {
		bone = this.rootBones[i];
		if (bone.parent == null)
			bone.startCoords = Vectors.copy(this.coords);
		bone.update();
	}
};

Skeletons.Skeleton.prototype.drawWireframe = function(graphics, color) {
	color = typeof color !== 'undefined' ?  color : Skeletons.wireframeDefaultColor;
	var bone;
	for (var boneId in this.bones) {
		bone = this.bones[boneId];
		bone.drawWireframe(graphics, color);
	}
};

Skeletons.Skeleton.prototype.findRootBones = function() {
	var bone;

	this.rootBones = [];
	for (var boneId in this.bones) {
		bone = this.bones[boneId];
		if (bone.parent == null || bone.parent == bone) {
			this.rootBones.push(bone);
		}
	}
};

Skeletons.Skeleton.prototype.addBone = function(bone, id) {
	if (id in this.bones) {
		console.log("Failed to add bone to skeleton: id '" + id + "' already exists.");
		return;
	}

	this.bones[id] = bone;
	this.findRootBones();
};

Skeletons.Skeleton.prototype.checkWireframeClicked = function(v) {
	var bone;
	var val;

	var clickedBone = null;

	for (var boneId in this.bones) {
		bone = this.bones[boneId];
		val = bone.checkWireframeClicked();

		if (val == 1)
			return [boneId, 1];
		else
			clickedBone = boneId;
	}

	return [clickedBone, 0];
};

/*\
|*|
|*| ANIMATION
|*|
\*/

Skeletons.Animation = function(len) {
	this.len = typeof len !== 'undefined' ?  len : 1;
	this.initialize();
};

Skeletons.Animation.prototype.initialize = function() {

};

Skeletons.Animation.prototype.createBlankAnimation = function(skeleton) {
	var bone;

	for (var boneId in skeleton.bones) {
		bone = skeleton.bones[boneId];
	}
};

Skeletons.BoneAnimation = function() {
	this.initialize();
};

Skeletons.BoneAnimation.prototype.initialize = function() {
	this.coords = new Skeletons.TimeSequence();
	this.len = new Skeletons.TimeSequence();
	this.angle = new Skeletons.TimeSequence();
};

Skeletons.BoneAnimation.prototype.createBlankAnimation = function(bone) {
	this.coords.setKeyframe(0, new Skeletons.Keyframe(0, Vectors.copy(bone.offsetCoords), Skeletons.progressions.NONE));
	this.len.setKeyframe(0, new Skeletons.Keyframe(0, bone.len, Skeletons.progressions.NONE));
	this.angle.setKeyframe(0, new Skeletons.Keyframe(0, bone.angle, Skeletons.progressions.NONE));
};

Skeletons.TimeSequence = function(duration) {
	this.duration = typeof duration !== 'undefined' ?  duration : 1;
	this.keys = [];
}

Skeletons.TimeSequence.prototype.setKeyframe = function(keyframe) {
	if (keyframe.time > this.duration - 1)
		return;

	var index = this.findTimeIndex(keyframe.time);
	if (index == -1)
		this.keys.push(keyframe);
	else if (this.keys[index].time == keyframe.time)
		this.keys[index] = keyframe;
	else
		this.keys.splice(index+1,0,keyframe);
}

Skeletons.TimeSequence.prototype.removeKeyframe = function(time) {
	var index = this.findTimeIndex(time);
	if (this.keys[index])
		this.keys.splice(index,1);
}

Skeletons.TimeSequence.prototype.findTimeIndex = function(time) {
	//number of keyframes is expected to be small, so use linear search
	var i;
	for (i = 0; i < this.keys.length; i++) {
		if (this.keys[i].time == time)
			return i
		else if (this.keys[i].time > time)
			return i-1;
	}

	return i-1;
}

Skeletons.Keyframe = function(time, val, progression) {
	this.time = time;
	this.val = val;
	this.progression = progression;
}