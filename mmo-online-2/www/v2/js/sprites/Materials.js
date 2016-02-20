var Materials = {};

function applyMaterial(colorMap, material, prefix) {
	for (var matTypeName in material) {
		colorMap[prefix + matTypeName] = material[matTypeName];
	}
}

Materials.Metals = {};
Materials.Metals.Steel = {
	VLight:0xf3f3f3,
	Light:0xc9c9c9,
	'':0x919191,
	Dark:0x696969
};

Materials.Skins = {};
Materials.Skins.Olive = {
	'':0xfc9838,
	Light:0xffd1a6,
	Dark:0xb86e28
};
Materials.Skins.Fair = {
	'':0xffd1a6,
	Light:0xffffff,
	Dark:0xfc9838
};
Materials.Skins.SunTouched = {
	'':0xb86e28,
	Light:0xfc9838,
	Dark:0x78481a
};
Materials.Skins.Cocoa = {
	'':0x78481a,
	Light:0xb86e28,
	Dark:0x612b0a,
};
Materials.Skins.Ebony = {
	'':0x6f5939,
	Light:0x6f5939,
	Dark:0x50422b
};
Materials.Skins.Slate = {
	'':0xbdbdbd,
	Light:0xdedede,
	Dark:0x8c8c8c
};
Materials.Skins.LapisLazuli = {
	'':0x528dba,
	Light:0x3cbcfc,
	Dark:0x345f80
};
Materials.Skins.Emerald = {
	'':0x1eba4a,
	Light:0x24e35a,
	Dark:0x168535
};

Materials.Hairs = {};
Materials.Hairs.Gold = {
	'':0xe8be00,
	Light:0xeaff00,
};
Materials.Hairs.Coal = {
	'':0x3d3d3d,
	Light:0x595959,
};
Materials.Hairs.Pumpkin = {
	'':0xb86e28,
	Light:0xfc9838,
};
Materials.Hairs.Carrot = {
	'':0xfc9838,
	Light:0xffd1a6,
};
Materials.Hairs.Chestnut = {
	'':0x887000,
	Light:0xb89600
};
Materials.Hairs.Silver = {
	'':0xc9c9c9,
	Light:0xf3f3f3
};

Materials.Clothing = {};
Materials.Clothing.Red = {
	'':0x8e2020,
	Light:0xcf3232
};