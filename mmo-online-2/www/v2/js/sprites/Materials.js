var Materials = {};

function applyMaterial(colorMap, material, prefix) {
	for (var matTypeName in material) {
		colorMap[prefix + matTypeName] = material[matTypeName];
	}
}

Materials.Metals = {};
Materials.Metals.Iron = {
	VLight:0xa6a6a6,
	Light:0x919191,
	'':0x696969,
	Dark:0x3d3d3d
};
Materials.Metals.Steel = {
	VLight:0xc9c9c9,
	Light:0xa6a6a6,
	'':0x919191,
	Dark:0x696969
};
Materials.Metals.Silver = {
	VLight:0xffffff,
	Light:0xe3e3e3,
	'':0xc9c9c9,
	Dark:0xa6a6a6
};
Materials.Metals.Gold = {
	'':0xccc159,
	Light:0xeaff00,
	VLight:0xf3f3f3,
	Dark:0x948c41
};

Materials.Woods = {};
Materials.Woods.Ash = {
	'':0x887000,
	Light:0xb89600,
	Dark:0x574700
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
	Light:0xa68b5b,
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
	Dark:0x8b2f32,
	'':0xff0000,
	Light:0xff7578
};
Materials.Clothing.Blue = {
	Dark:0x0b5e87,
	'':0x0e7cb3,
	Light:0x3cbcfc
};
Materials.Clothing.Yellow = {
	Dark:0xcaa710,
	'':0xffd314,
	Light:0xfff7d4
};
Materials.Clothing.Green = {
	Dark:0x006321,
	'':0x00852c,
	Light:0x00ba3e
};
Materials.Clothing.LightGreen = {
	Dark:0x00ba3e,
	'':0x00ea4e,
	Light:0x8effb4
};
Materials.Clothing.Turquoise = {
	Dark:0x0c9091,
	'':0x10c9ca,
	Light:0x4feffc
};
Materials.Clothing.Majenta = {
	Dark:0x6b0942,
	'':0x910c59,
	Light:0xca107c
};
Materials.Clothing.Black = {
	'':0x3d3d3d,
	Light:0x696969,
	Dark:0x262626
};
Materials.Clothing.Brown = {
	'':0x887000,
	Light:0xb89600,
	Dark:0x5d4b00
};
Materials.Clothing.Grey = {
	'':0x5e5e5e,
	Light:0x959595,
	Dark:0x404040
};
Materials.Clothing.Gray = Materials.Clothing.Grey; //thanks english
Materials.Clothing.LightGrey = {
	'':0x959595,
	Light:0xacacac,
	Dark:0x5e5e5e
};
Materials.Clothing.LightGray = Materials.Clothing.LightGrey; //thanks english
Materials.Clothing.White = {
	'':0xc9c9c9,
	Light:0xf3f3f3,
	Dark:0x919191
};