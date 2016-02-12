window.mainMenu = null;
window.menuBackground = null;

function initMainMenu() {
	menuBackground = new PIXI.Container();
	menuBackground.lastUpdate = Date.now();
	menuBackground.lastSpawnedCol = -1;
	menuBackground.lastColumn = [];

	game.ui.displayObject.addChildAt(menuBackground,0);

	mainMenu = new InterfaceElement({
		id:"mainMenu",
		parent:game.ui,
		attach:{
			where:[0.5,0.5],
			parentWhere:[0.5,0.5],
			offset:[0,30]
		}
	});
	game.ui.addChild(mainMenu);
	mainMenu.displayObject.filters = [game.filters.dropShadow];

	mainMenu.stage = 'login';
	mainMenu.music = createjs.Sound.play('music/fortress', {loop:-1});
	mainMenu.music.volume = 0.5;

	//Banner
	mainMenu.banner = new InterfaceText("MMO Online", {
		font:UIConfig.bannerText,
		attach:{
			where:[0.5,1],
			parentWhere:[0.5,0.5],
			offset:[0,-130]
		},
		parent:mainMenu
	});
	mainMenu.addChild(mainMenu.banner);

	//Subtitle
	mainMenu.banner2 = new InterfaceText("a video game", {
		font:UIConfig.titleText,
		attach:{
			where:[0.5,0],
			parentWhere:[0.5,1],
			offset:[0,-5]
		},
		parent:mainMenu.banner
	});
	mainMenu.banner.addChild(mainMenu.banner2);

	//Username box
	mainMenu.username = TextBox.createLabelled("Username", "username", false, TextBox.userName);
	mainMenu.username.attach = {
		where:[0.5,0],
		parentWhere:[0.5,0.5],
		offset:[0,-80]
	};
	mainMenu.addChild(mainMenu.username);

	//Password box
	mainMenu.password = TextBox.createLabelled("Password", "password", true, TextBox.any);
	mainMenu.password.attach = {
		where:[0.5,0],
		parentWhere:[0.5,0.5],
		offset:[0,-20]
	};
	mainMenu.addChild(mainMenu.password);

	mainMenu.loginButton = new InterfaceText("Login", {
		name:'login',
		font: UIConfig.titleText,
		parent: mainMenu,
		isClickable:true,
		attach:{
			where:[0.5,0],
			parentWhere:[0.5,0.5],
			offset:[0,40]
		}
	});
	mainMenu.addChild(mainMenu.loginButton);

	mainMenu.registerButton = new InterfaceText("Register", {
		name: 'register',
		font: UIConfig.titleText,
		parent: mainMenu,
		isClickable:true,
		attach:{
			where:[0.5,0],
			parentWhere:[0.5,0.5],
			offset:[0,75]
		}
	});
	mainMenu.addChild(mainMenu.registerButton);

	function highlight() {
		this.changeFont(UIConfig.titleTextHover);
		createjs.Sound.play('ui/rollover');
	}

	function revert() {
		this.changeFont(UIConfig.titleText);
	}

	mainMenu.loginButton.onHoverStart = highlight;
	mainMenu.loginButton.onHoverEnd = revert;
	mainMenu.registerButton.onHoverStart = highlight;
	mainMenu.registerButton.onHoverEnd = revert;
}

function onMainMenuClick (element) {
	if (element.name === 'login') {
		tryLogin();
	} else if (element.name === 'register') {
		createjs.Sound.play('ui/click');
		uiMessage('Oops!', 'Not implemented.  :(');
	}
}

function onMainMenuKey (event) {
	switch (event.which) {
		case Keys.keyCodes.TAB:
			if (game.activeElement == mainMenu.username) {
				setElementActive(mainMenu.password);
			} else if (game.activeElement == mainMenu.password) {
				setElementActive(mainMenu.username);
			}
			break;
		case Keys.keyCodes.ENTER:
			if (mainMenu.stage === 'login')
				tryLogin();
			break;
	}
}

function tryLogin () {
	var username = mainMenu.username.text;
	var password = mainMenu.password.text;

	createjs.Sound.play('ui/click');

	if (username.length < 2) {
		uiMessage('Error', 'Username too short.');
		return;
	}

	game.connection.send(new Messages.LoginUser(username, password).serialize());

	setStatus('Logging In', 'Please wait...');
}

function onMainMenuMessage (msg) {
	if (msg.params.success) {
		setStatus('Success', 'Fetching world data...');
	} else {
		uiMessage('Login Failed', 'Username and Password didn\'t match any database entries.');
	}
}

function updateMenuBackground () {
	var speed = 20.0; //pixels/sec
	var currentTime = Date.now();
	var timeDelta = currentTime - menuBackground.lastUpdate;
	var pixelDelta = timeDelta / 1000 * speed;

	menuBackground.position.x -= pixelDelta;
	menuBackground.lastUpdate = currentTime;

	var child;
	for (var i = 0; i < menuBackground.children.length; i++) {
		child = menuBackground.children[i];
		if (child.position.x + menuBackground.position.x <= -48)
			menuBackground.removeChild(child);
	}

	var col = Math.ceil((game.renderer.width - menuBackground.position.x) / 48);
	while (menuBackground.lastSpawnedCol < col) {
		menuSpawnColumn();
	}
}

function menuSpawnColumn () {
	var numRows = Math.ceil(game.renderer.height / 48);
	var column = [];
	var lastColumn = menuBackground.lastColumn;

	

	for (var row = 0; row < numRows; row++) {
		var treeChance = 0.05;
		var treeAssoc = 0.35;
		var grassChance = 0.1;
		var grassAssoc = 0.15;
		var sprite = null;
		var texName = null;

		//left
		if (lastColumn[row] === 't') {
			treeChance += treeAssoc;
			grassChance += grassAssoc;
		} else if (lastColumn[row] === 'g') {
			grassChance += grassAssoc;
		}

		//top left
		if (lastColumn[row-1] === 't') {
			treeChance += treeAssoc/Math.SQRT2;
			grassChance += grassAssoc/Math.SQRT2;
		} else if (lastColumn[row-1] === 'g') {
			grassChance += grassAssoc/Math.SQRT2;;
		}

		//bottom left
		if (lastColumn[row+1] === 't') {
			treeChance += treeAssoc/Math.SQRT2;;
			grassChance += grassAssoc/Math.SQRT2;;
		} else if (lastColumn[row+1] === 'g') {
			grassChance += grassAssoc/Math.SQRT2;;
		}

		if (Math.random() < treeChance) {
			texName = MmooUtil.chooseRandomCumulative (
				['terrain/tree1', 'terrain/tree2'],
				[0.95, 1]
			);
			sprite = new PIXI.Sprite(PIXI.loader.resources[texName].texture);
			column[row] = 't';
		} else if (Math.random() < grassChance) {
			texName = MmooUtil.chooseRandomCumulative (
				['terrain/grass2', 'terrain/grass3', 'terrain/grass4'],
				[0.33, 0.66, 1]
			);
			sprite = new PIXI.Sprite(PIXI.loader.resources[texName].texture);
			column[row] = 'g';
		} else if (Math.random() < 0.05) {
			texName = MmooUtil.chooseRandomCumulative (
				['terrain/flower1', 'terrain/flower2', 'terrain/flower3','terrain/dirtpatch1', 'terrain/dirtpatch3', 'terrain/dirtpatch2'],
				[0.25, 0.4, 0.5, 0.75, 0.9, 1]
			);
			sprite = new PIXI.Sprite(PIXI.loader.resources[texName].texture);
			column[row] = 'd';
		} else {
			column[row] = 'g';
		}

		if (sprite !== null) {
			sprite.position.x = menuBackground.lastSpawnedCol * 48;
			sprite.position.y = row * 48;
			sprite.scale.x = 2;
			sprite.scale.y = 2;
			menuBackground.addChild(sprite);
		}
	}

	menuBackground.lastSpawnedCol += 1;
	menuBackground.lastColumn = column;
}