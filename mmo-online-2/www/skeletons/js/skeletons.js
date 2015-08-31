var Skeletons = {
	wireframeEndSize : 7,
	wireframeLineWidth : 3,
	wireframeDefaultColor : 0x000000,
	wireframeHighlightColor : 0x00ff00,
	wireframeDefaultSoloColor : 0x0000ff,
	progressions: {
		NONE: 0,
		LINEAR: 1
	}
};

/*\
|*|
|*| BONE
|*|
\*/

Skeletons.Bone = function (length, angle, ignoreParentAngle) {
	this.parent = null;
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
	this.finalAngle = this.angle;

	if (this.parent != null && this.parent != this) {
		Vectors.copyTo(this.parent.endCoords, this.startCoords);
		if (!this.ignoreParentAngle)
			this.finalAngle = this.parent.finalAngle + this.angle;
	}

	this.endCoords = Vectors.offset(this.startCoords, this.finalAngle, this.len);

	for (var i = 0; i < this.children.length; i++) {
		this.children[i].update();
	}
};

Skeletons.Bone.prototype.drawWireframe = function(graphics, color) {
	graphics.lineStyle(Skeletons.wireframeLineWidth, color, 1);
	
	this.drawEndWireframe(graphics, this.startCoords, Skeletons.wireframeEndSize+2);
	graphics.beginFill(color, 1);
	this.drawEndWireframe(graphics, this.endCoords, Skeletons.wireframeEndSize);
	graphics.endFill();
	
	var angle = Vectors.angleTo(this.startCoords, this.endCoords);
	var startCoords = Vectors.offset(this.startCoords, angle, Skeletons.wireframeEndSize/2+1);
	var endCoords = Vectors.offset(this.endCoords, angle+180, Skeletons.wireframeEndSize/2+1);

	graphics.moveTo(startCoords[0], startCoords[1]);
	graphics.lineTo(endCoords[0], endCoords[1]);
};

Skeletons.Bone.prototype.drawEndWireframe = function (graphics, v, size) {
	var x = size/2;
	graphics.drawRect(v[0]-x, v[1]-x, size+1, size+1);
};

Skeletons.Bone.prototype.checkWireframeClicked = function(v) {
	if (Vectors.distanceBetween(this.endCoords, v) <= Skeletons.wireframeEndSize)
		return 1;
	else if (Vectors.distanceBetween(this.startCoords, v) <= Skeletons.wireframeEndSize)
		return 0;
	else
		return -1;
};

Skeletons.Bone.prototype.setParent = function(parent) {
	if (this.hasParent()) {
		this.parent.children.splice(this.parent.children.indexOf(this), 1);
	}

	this.parent = parent;

	if (this.hasParent()) {
		this.parent.children.push(this);
	}
};

Skeletons.Bone.prototype.hasParent = function() {
	return this.parent != null && this.parent != this;
}


/*\
|*|
|*| SKELETON
|*|
\*/

Skeletons.Skeleton = function (animSet) {
	this.animationSet = typeof animSet !== 'undefined' ?  animSet : new Skeletons.AnimationSet();

	this.initialize();
};

Skeletons.Skeleton.prototype.initialize = function() {
	this.bones = [];
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

Skeletons.Skeleton.prototype.drawWireframe = function(graphics, color, toHighlight, highlightColor) {
	color = typeof color !== 'undefined' ?  color : Skeletons.wireframeDefaultColor;
	toHighlight = typeof toHighlight !== 'undefined' ?  toHighlight : -1;
	highlightColor = typeof highlightColor !== 'undefined' ?  highlightColor : Skeletons.wireframeHighlightColor;
	var bone;
	for (var i = 0; i < this.bones.length; i++) {
		bone = this.bones[i];
		if (i == toHighlight)
			bone.drawWireframe(graphics, highlightColor);
		else if (!bone.hasParent())
			bone.drawWireframe(graphics, Skeletons.wireframeDefaultSoloColor);
		else
			bone.drawWireframe(graphics, color);
	}
};

Skeletons.Skeleton.prototype.findRootBones = function() {
	var bone;

	this.rootBones = [];
	for (var i = 0; i < this.bones.length; i++) {
		bone = this.bones[i];
		if (bone.parent == null || bone.parent == bone) {
			this.rootBones.push(bone);
		}
	}
};

Skeletons.Skeleton.prototype.addBone = function(bone) {
	this.bones.push(bone);
	this.animationSet.addBone(bone);

	this.findRootBones();
};

Skeletons.Skeleton.prototype.removeBone = function(bone) {
    for (var i = 0; i < bone.children.length; i++) {
    	this.removeBone(bone.children[i]);
    }
    var index = this.findBoneIndex(bone);
    this.animationSet.removeBone(index);
    this.bones.splice(index, 1);

    this.findRootBones();
};

Skeletons.Skeleton.findBoneIndex = function(bone) {
	var b;
	for (var i = 0; i < this.bones.length; i++) {
		b = this.bones[i];
		if (b == bone) {
			return i;
		}
	}

	return -1;
};

Skeletons.Skeleton.prototype.checkWireframeClicked = function(v) {
	var bone;
	var val;

	var clickedBone = -1;

	for (var i = 0; i < this.bones.length; i++) {
		bone = this.bones[i];
		val = bone.checkWireframeClicked(v);

		if (val == 1)
			return [i, 1];
		else if (val == 0)
			clickedBone = i;
	}

	return [clickedBone, 0];
};

/*\
|*| AnimationSet
\*/
Skeletons.AnimationSet = function() {
	this.animations = {};
};

Skeletons.AnimationSet.prototype.addAnimation = function(name, len, skeleton) {
	var noneAnim = this.animations['none'];
	var anim;
	if (typeof noneAnim !== 'undefined') {
		anim = noneAnim.copy();
	} else {
		name = 'none';
		len = 1;
		anim = new Animation(len);
		for (var i = 0; i < skeleton.bones.length; i++) {
			anim.addBone(skeleton.bones[i]);
		}
	}
	this.animations[name] = anim;
};

Skeletons.AnimationSet.prototype.addBone = function(bone) {
	for (var animName in this.animations) {
		this.animations[animName].addBone(bone);
	}
};

Skeletons.AnimationSet.prototype.removeBone = function(index) {
	for (var animName in this.animations) {
		this.animations[animName].removeBone(index);
	}
};

/*\
|*| Animation
\*/
Skeletons.Animation = function(len) {
	this.len = typeof len !== 'undefined' ?  len : 1;
	this.boneAnimations = [];
};

Skeletons.Animation.prototype.addBone = function(bone) {
	var boneAnim = new Skeletons.BoneAnimation();
	boneAnime.initializeFromBone(bone);
	this.boneAnimations.push(boneAnim);
};

Skeletons.Animation.prototype.removeBone = function(index) {
	this.boneAnimations.splice(index,1);
};

Skeletons.Animation.prototype.copy = function() {
	var copy = new Skeletons.Animation(this.len);
	for (var i = 0; i < this.boneAnimations.length; i++) {
		copy.boneAnimations.push(this.boneAnimations[i].copy());
	}
	return copy;
};

/*\
|*| BoneAnimation
\*/
Skeletons.BoneAnimation = function() {
	this.initialize();
};

Skeletons.BoneAnimation.prototype.initialize = function() {
	this.coords = new Skeletons.TimeSequence();
	this.len = new Skeletons.TimeSequence();
	this.angle = new Skeletons.TimeSequence();
};

Skeletons.BoneAnimation.prototype.initializeFromBone = function(bone) {
	this.coords.setKeyframe(new Skeletons.Keyframe(0, Vectors.copy(bone.startCoords), Skeletons.progressions.NONE));
	this.len.setKeyframe(new Skeletons.Keyframe(0, bone.len, Skeletons.progressions.NONE));
	this.angle.setKeyframe(new Skeletons.Keyframe(0, bone.angle, Skeletons.progressions.NONE));
};

Skeletons.BoneAnimation.prototype.copy = function() {
	var copy = new Skeletons.BoneAnimation();
	var props = ['coords', 'len', 'angle'];
	var keyframes;

	for (var i = 0; i < props.length; i++) {
		keyframes = this[props[i]].keys;
		for (var j = 0; j < keyframes.length; j++) {
			copy[props[i]].setKeyframe(keyframes[j].copy());
		}
	}

	return copy;
};

/*\
|*| TimeSequence
\*/
Skeletons.TimeSequence = function() {
	this.keys = [];
}

Skeletons.TimeSequence.prototype.setKeyframe = function(keyframe) {

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
	//editor only, faster method in Skeleton.Animate
	var i;
	for (i = 0; i < this.keys.length; i++) {
		if (this.keys[i].time == time)
			return i
		else if (this.keys[i].time > time)
			return i-1;
	}

	return i-1;
}

/*\
|*| Keyframe
\*/
Skeletons.Keyframe = function(time, val, progression) {
	this.time = time;
	this.val = val;
	this.progression = progression;
};

Skeletons.Keyframe.prototype.copy = function() {
	return new Skeletons.Keyframe(this.time, Skeletons.dirtyCopy(this.val), this.progression);
};

//for editor use
Skeletons.dirtyCopy = function(o) {
	return JSON.parse(JSON.stringify(o));
};