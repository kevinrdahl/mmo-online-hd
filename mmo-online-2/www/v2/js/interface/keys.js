var Keys = {};
Keys.keyCodes = {
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT:16,
	CRTL: 17,
	ALT: 18,
	UP:38,
	DOWN:40,
	LEFT:37,
	RIGHT:39,
}
Keys.keyNames = (function() {
	var obj = {};
	for (var name in Keys.keyCodes) {
		obj[Keys.keyCodes[name]] = name;
	}
	return obj;
})();

Keys.preventedKeys = [8,9,13,16,17,18,37,38,39,40];

$(document).keydown(function(event) {
  	if (Keys.preventedKeys.indexOf(event.which) !== -1)
  		event.preventDefault();

  	if (game.activeElement instanceof TextBox) {
  		if (event.which === Keys.keyCodes.BACKSPACE) {
	  		game.activeElement.deleteCharacter();
	  	}
  	}

  	if (mainMenu !== null && game.ui.status === null) {
  		onMainMenuKey(event);
  	}
});

$(document).keypress(function(event) {
  	//console.log(event.which + ' (' + String.fromCharCode(event.which) + ')');
  	if (game.activeElement !== null && game.activeElement instanceof TextBox) {
  		game.activeElement.addCharacter(String.fromCharCode(event.which));
  	}
});