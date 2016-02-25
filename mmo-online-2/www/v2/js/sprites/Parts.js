var Parts = {};

Parts.Feet = {};
Parts.Feet.Boot = {
	name:'boot',
	colors:{
		foot:0x333333,
		footLight:0x444444
	},
	basic: {image:'parts/foot', attach:[5,2]},
	footleftwalk5: {image:'parts/footwalk5', attach:[5,3]},
	footleftwalkhold5: {image:'parts/footwalk5', attach:[5,3]}
};

Parts.Hands = {};
Parts.Hands.Hand = {
	name:'hand',
	colors:{
		body:0x333333,
		skin:0x444444
	},
	basic: {image:'parts/hand', attach:[1,1]},
	handrightwalk0: {image:'parts/handwalk0', attach:[1,0]},
	handrightwalk1: {image:'parts/handwalk1', attach:[1,1]},
	handrightwalk2: {image:'parts/handwalk2', attach:[1,1]},
	handrightwalk3: {image:'parts/handwalk3', attach:[1,1]},
	handrightwalk4: {image:'parts/handwalk2', attach:[1,1]},
	handrightwalk5: {image:'parts/handwalk1', attach:[1,1]},

	handrightstand0: {image:'parts/handwalk1', attach:[1,1]}//,

	//"handrightwalkhold*": {image:'parts/handwalk3', attach:[1,1]}
};

Parts.Bodies = {};
Parts.Bodies.Human = {
	name:'bodyHuman',
	colors:{
		body:0x333333,
		belt:0x444444,
		cloak:0x555555,
		cloakHem:0x666666,
		cloakClasp:0x777777,
		cloakDark:0x888888
	},
	basic: {image:'parts/body', attach:[5,4]},
	bodywalk: {image:'parts/bodywalk3', attach:[5,4]}
};

Parts.Heads = {};
Parts.Heads.Human = {
	name:'headHuman',
	colors: {
		skin:0x333333,
		skinLight:0x444444,
	},
	basic: {image:'parts/head', attach:[4,6]}
};

Parts.Hairs = {};
Parts.Hairs.Hair1 = {
	name:'hair1',
	colors: {
		hair:0x333333,
		hairLight:0x444444,
	},
	basic: {image:'parts/hair', attach:[5,7]}
};
Parts.Hairs.Hair2 = {
	name:'hair2',
	colors: {
		hair:0x333333,
		hairLight:0x444444,
	},
	basic: {image:'parts/hair2', attach:[4,6]}
};

Parts.Hats = {};
Parts.Hats.WizHood = {
	name:'wizhood',
	colors: {
		skinDark:0x333333,
		hatMat:0x444444,
		hatMatLight:0x555555,
		hatMat2:0x666666,
	},
	basic: {image:'parts/wizhood', attach:[6,8]}
};
Parts.Hats.Helmet = {
	name:'helmet',
	colors: {
		skinDark:0x333333,
		hatMatDark:0x444444,
		hatMat:0x555555,
		hatMatLight:0x666666,
		hatMat2:0x777777,
		hatMat2Light:0x888888,
		hatMat3:0x999999
	},
	basic: {image:'parts/helmet', attach:[6,9]}
};
Parts.Hats.Hoplite = {
	name:'hoplite',
	colors: {
		hatMat:0x333333,
		hatMatLight:0x444444,
		hatMatVLight:0x555555,
		hatMat2:0x666666
	},
	basic: {image:'parts/hoplite', attach:[5,9]}
};
Parts.Hats.Hoplite2 = {
	name:'hoplite2',
	colors: {
		hatMat:0x333333,
		hatMatLight:0x444444,
		hatMatVLight:0x555555,
		hatMat2:0x666666,
		hatMat3:0x777777
	},
	basic: {image:'parts/hoplite2', attach:[5,9]}
};


Parts.Shields = {};
Parts.Shields.Shield1 = {
	name:'shield1',
	colors: {
		leftMatLight:0x555555,
		leftMatVLight:0x666666,
		leftMat:0x444444,
		leftMatDark:0x333333
	},
	basic: {image:'parts/shield', attach:[5,5]}
};
Parts.Shields.Shield2 = {
	name:'shield2',
	colors: {
		leftMatLight:0x555555,
		leftMatVLight:0x666666,
		leftMat2Dark:0x777777,
		leftMat2:0x888888,
		leftMat3:0x999999
	},
	basic: {image:'parts/shield2', attach:[6,4]}
};

Parts.Weapons = {};
Parts.Weapons.Sword = {
	name:'sword',
	colors: {
		rightMat:0x555555,
		rightMatLight:0x666666,
		rightMatDark:0x444444,
		rightMat2:0x777777
	},
	basic: {image:'parts/sword', attach:[10,2]}
};
Parts.Weapons.Mace = {
	name:'mace',
	colors: {
		rightMat:0x555555,
		rightMatLight:0x666666,
		rightMatDark:0x444444,
		rightMatVDark:0x333333,
		rightMat2:0x777777
	},
	basic: {image:'parts/mace', attach:[10,2]}
};
Parts.Weapons.Staff = {
	name:'staff',
	colors: {
		rightMat:0x555555,
		rightMatLight:0x666666
	},
	basic: {image:'parts/staff', attach:[2,13]}
};