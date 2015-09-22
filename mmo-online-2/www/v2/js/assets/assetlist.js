var GAME_ASSETS = {
	"img/oryx":[
		"lofi_char.png",
		"map1.png",
		"map2.png",
		"map3.png",
		"map4.png",
		"map5.png"
	]
};

function parseAssetList (assets) {
	var r = [];
	var sub;

	for (var path in assets) {
		sub = assets[path];
		for (var i = 0; i < sub.length; i++) {
			r.push(path + "/" + sub[i]);
		}
	}

	return r;
}