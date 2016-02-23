var Animations = {};

Animations.man = {};

/*
Offsets:
	feet: the heel
	body: cape clasp
	head: top of left eye (his left)
	hair: top of ear
	hands: top left inside
*/

var animTime = ((20/24)*1000) / 6;

Animations.man.walk = {
	defaultDuration:animTime,
	defaultOrigin:[11,2],
	gridSize:[40,40],
	frames:[
		{points:[ //frame 0
			{name:'footright', x:10, y:23},
			{name:'body', x:10, y:15},
			{name:'footleft', x:17, y:23},
			{name:'head', x:11, y:9},
			{name:'handleft', x:14, y:15},
			{name:'handright', x:6, y:16}
		]},
		{points:[ //frame 1
	        {name:'footright', x:12, y:23},
	        {name:'footleft', x:16, y:22},
	        {name:'body', x:10, y:15},
	        {name:'head', x:11, y:9},
	        {name:'handleft', x:15, y:16},
	        {name:'handright', x:5, y:16}
	    ]},
	    {points:[ //frame 2
	    	{name:'footright', x:14, y:23},
	        {name:'footleft', x:14, y:22},
	        {name:'body', x:10, y:14},
	        {name:'head', x:11, y:8},
	        {name:'handleft', x:16, y:16},
	        {name:'handright', x:4, y:14}
	    ]},
	    {points:[ //frame 3
	    	{name:'footright', x:15, y:23},
	        {name:'footleft', x:12, y:23},
	        {name:'body', x:10, y:15},
	        {name:'head', x:11, y:9},
	        {name:'handleft', x:17, y:17},
	        {name:'handright', x:3, y:14}
	    ]},
	    {points:[ //frame 4
	    	{name:'footright', x:14, y:22},
	        {name:'footleft', x:14, y:23},
	        {name:'body', x:10, y:15},
	        {name:'head', x:11, y:9},
	        {name:'handleft', x:16, y:17},
	        {name:'handright', x:4, y:15}
	    ]},
	    {points:[ //frame 5
	    	{name:'footright', x:11, y:22},
	        {name:'footleft', x:15, y:23},
	        {name:'body', x:10, y:14},
	        {name:'head', x:11, y:8},
	        {name:'handleft', x:15, y:15},
	        {name:'handright', x:5, y:15}
	    ]}
	]
};

Animations.man.walkhold = {
	defaultDuration:150,
	defaultOrigin:[11,2],
	gridSize:[40,40],
	frames:[
		{points:[ //frame 0
			{name:'footright', x:10, y:23},
			{name:'body', x:10, y:15},
			{name:'footleft', x:17, y:23},
			{name:'head', x:11, y:9},
			{name:'handleft', x:14, y:15},
			{name:'handright', x:3, y:14}
		]},
		{points:[ //frame 1
	        {name:'footright', x:12, y:23},
	        {name:'footleft', x:16, y:22},
	        {name:'body', x:10, y:15},
	        {name:'head', x:11, y:9},
	        {name:'handleft', x:15, y:16},
	        {name:'handright', x:3, y:14}
	    ]},
	    {points:[ //frame 2
	    	{name:'footright', x:14, y:23},
	        {name:'footleft', x:14, y:22},
	        {name:'body', x:10, y:14},
	        {name:'head', x:11, y:8},
	        {name:'handleft', x:16, y:16},
	        {name:'handright', x:3, y:13}
	    ]},
	    {points:[ //frame 3
	    	{name:'footright', x:15, y:23},
	        {name:'footleft', x:12, y:23},
	        {name:'body', x:10, y:15},
	        {name:'head', x:11, y:9},
	        {name:'handleft', x:17, y:17},
	        {name:'handright', x:3, y:14}
	    ]},
	    {points:[ //frame 4
	    	{name:'footright', x:14, y:22},
	        {name:'footleft', x:14, y:23},
	        {name:'body', x:10, y:15},
	        {name:'head', x:11, y:9},
	        {name:'handleft', x:16, y:17},
	        {name:'handright', x:3, y:14}
	    ]},
	    {points:[ //frame 5
	    	{name:'footright', x:11, y:22},
	        {name:'footleft', x:15, y:23},
	        {name:'body', x:10, y:14},
	        {name:'head', x:11, y:8},
	        {name:'handleft', x:15, y:15},
	        {name:'handright', x:3, y:13}
	    ]}
	]
};

Animations.man.stand = {
	defaultDuration:150,
	gridSize:[24,24],
	frames:[
		{points:[ //frame 0
			{name:'footright', x:10, y:23},			
			{name:'body', x:10, y:15},
			{name:'footleft', x:16, y:23},
			{name:'head', x:11, y:9},
			{name:'handleft', x:15, y:16},
			{name:'handright', x:5, y:16}
		]}
	]
};

(function() {
	var animSetName, animName, anim, frame, t, total, point;
	for (animSetName in Animations) {
		for (animName in Animations[animSetName]) {
			anim = Animations[animSetName][animName];
			if (!anim.defaultOrigin)
				anim.defaultOrigin = [0,0];
			total = 0;
			for (t = 0; t < anim.frames.length; t++) {
				frame = anim.frames[t];
				if (!frame.duration)
					frame.duration = anim.defaultDuration;
				if (!frame.origin)
					frame.origin = anim.defaultOrigin;
				total += frame.duration;
			}
			anim.fullDuration = total;
		}
	}

	for (animName in Animations.man) {
		anim = Animations.man[animName];
		for (t = 0; t < anim.frames.length; t++) {
			frame = anim.frames[t];
			for (var i = 0; i < frame.points.length; i++) {
				point = frame.points[i];
				if (point.name === 'handright')
					break;
			}

			frame.points.unshift({name:'weaponright', x:point.x, y:point.y});
		}
	}
})();