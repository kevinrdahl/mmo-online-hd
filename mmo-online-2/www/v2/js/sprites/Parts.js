var Parts = {};

Parts.Feet = {};
Parts.Feet.Boot = {
	name:'boot',
	colors:{
		foot:0x333333,
		footLight:0x444444
	},
	basic: {image:'foot', attach:[5,2]},
	footleftwalk5: {image:'footwalk5', attach:[5,3]}
};

Parts.Hands = {};
Parts.Hands.Hand = {
	name:'hand',
	colors:{
		body:0x333333,
		skin:0x444444
	},
	basic: {image:'hand', attach:[1,1]},
	handrightwalk0: {image:'handwalk0', attach:[1,0]},
	handrightwalk1: {image:'handwalk1', attach:[1,1]},
	handrightwalk2: {image:'handwalk2', attach:[1,1]},
	handrightwalk3: {image:'handwalk3', attach:[1,1]},
	handrightwalk4: {image:'handwalk2', attach:[1,1]},
	handrightwalk5: {image:'handwalk1', attach:[1,1]},

	handrightstand0: {image:'handwalk1', attach:[1,1]}//,

	//"handrightwalkhold*": {image:'handwalk3', attach:[1,1]}
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
		cloakInside:0x888888
	},
	basic: {image:'body', attach:[5,4]},
	bodywalk: {image:'bodywalk3', attach:[5,4]}
};

Parts.Heads = {};
Parts.Heads.Human = {
	name:'headHuman',
	colors: {
		skin:0x333333,
		skinLight:0x444444,
	},
	basic: {image:'head', attach:[4,6]}
};

Parts.Hairs = {};
Parts.Hairs.Hair1 = {
	name:'hair1',
	colors: {
		hair:0x333333,
		hairLight:0x444444,
	},
	basic: {image:'hair', attach:[9,6]}
};
Parts.Hairs.Hair2 = {
	name:'hair2',
	colors: {
		hair:0x333333,
		hairLight:0x444444,
	},
	basic: {image:'hair2', attach:[8,5]}
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
	basic: {image:'shield', attach:[5,5]}
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
	basic: {image:'shield2', attach:[6,4]}
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
	basic: {image:'sword', attach:[10,2]}
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
	basic: {image:'mace', attach:[10,2]}
};
Parts.Weapons.Staff = {
	name:'staff',
	colors: {
		rightMat:0x555555,
		rightMatLight:0x666666
	},
	basic: {image:'staff', attach:[2,13]}
};