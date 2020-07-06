var CharClasses = {};

CharClasses.Mage = {
	icon:'icon/magic-palm',
	name:'Mage',
	stats:{
		might:1,
		fortitude:1.5,
		skill:1,
		will:6,
		faith:3
	}
};

//SKL / MGT
CharClasses.Warrior = {
	icon:'icon/crossed-swords',
	name:'Warrior',
	stats:{
		might:4,
		fortitude:3.5,
		skill:4,
		will:1.5,
		faith:1
	}
};

//MGT / WIL / FOR
CharClasses.Knight = {
	icon:'icon/rosa-shield',
	name:'Knight',
	stats:{
		might:3,
		fortitude:3.5,
		skill:2,
		will:3,
		faith:1.5
	}
};

//SKL
CharClasses.Archer = {
	icon:'icon/high-shot',
	name:'Archer',
	stats:{
		might:2.5,
		fortitude:2.5,
		skill:5,
		will:2,
		faith:1.5
	}
};

//SKL
CharClasses.Rogue = {
	icon:'icon/hood',
	name:'Rogue',
	stats:{
		might:3,
		fortitude:2,
		skill:5,
		will:2,
		faith:1
	}
};

//SKL / WIL
CharClasses.Trickster = {
	icon:'icon/zeus-sword',
	name:'Trickster',
	stats:{
		might:2.5,
		fortitude:2,
		skill:4,
		will:3.5,
		faith:2.5
	}
};

//MGT / FOR
CharClasses.Brute = {
	icon:'icon/fist',
	name:'Brute',
	stats:{
		might:5,
		fortitude:5,
		skill:2,
		will:1.5,
		faith:1
	}
};

//FTH
CharClasses.Priest = {
	icon:'icon/cross',
	name:'Cleric',
	stats:{
		might:1,
		fortitude:1.5,
		skill:1,
		will:4,
		faith:6
	}
};

//FTH / WIL / FOR
CharClasses.Cleric = {
	icon:'icon/hand-shield',
	name:'Cleric',
	stats:{
		might:2.5,
		fortitude:2.5,
		skill:1.5,
		will:3,
		faith:4
	}
};

//FTH / MGT / FOR / SKL
CharClasses.Crusader = {
	icon:'icon/spiral-thrust',
	name:'Crusader',
	stats:{
		might:3.5,
		fortitude:3,
		skill:2.5,
		will:1,
		faith:3
	}
};

//FTH / WIL
CharClasses.Adept = {
	icon:'icon/swirl',
	name:'Adept',
	stats:{
		might:1,
		fortitude:2,
		skill:2,
		will:4,
		faith:4
	}
};

for (var c in CharClasses) {
	var sum = 0;
	for (var s in CharClasses[c].stats) {
		sum += CharClasses[c].stats[s];
	}
	console.log(c + ': ' + sum);
}



function createClassSelect() {
    var classGrid = new SelectGrid({
    	attach:{
    		where:[1,0],
    		parentWhere:[1,0],
    		offset:[0,0]
    	}
    });

    var c;
    for (var className in CharClasses) {
    	c = CharClasses[className];
    	var icon = new InterfaceTexture(game.textures[c.icon], {});
    	classGrid.addChild(icon);
    }
    classGrid.selectRandom();

    return classGrid;
}