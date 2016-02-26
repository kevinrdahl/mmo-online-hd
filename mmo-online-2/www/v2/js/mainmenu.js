//this file is a mess and I'm sorry

window.mainMenu = null;
window.menuBackground = null;

function initMainMenu() {
	menuBackground = new PIXI.Container();
	menuBackground.lastUpdate = Date.now();
	menuBackground.lastSpawnedCol = -1;
	menuBackground.lastColumn = [];
	menuBackground.scrollX = 0;

	game.ui.displayObject.addChildAt(menuBackground,0);

	mainMenu = new InterfaceElement({
		id:"mainMenu",
		parent:game.ui,
		attach:{
			where:[0.5,0.5],
			parentWhere:[0.5,0.5],
			offset:[0,0]
		}
	});
	game.ui.addChild(mainMenu);
	mainMenu.displayObject.filters = [game.filters.dropShadow];

	mainMenu.music = createjs.Sound.play('music/fortress', {loop:-1});
	mainMenu.music.volume = 0.3;

	if (urlArgs.menu == 'charCreate')
		initMainMenuCharacterCreate();
	else
		initMainMenuLogin('', '');
}

function mainMenuClear() {
	if (mainMenu.banner) {
		mainMenu.removeChild(mainMenu.banner);
		delete mainMenu.banner;
	}

	if (mainMenu.controls) {
		mainMenu.removeChild(mainMenu.controls);
		delete mainMenu.controls;
	}
}

function mainMenuSetY() {
	mainMenu.attach.offset[1] = mainMenu.displayObject.height/-2 + 50;
	mainMenu.reposition(true);
}

function mainMenuBanner (title, subtitle) {
	//Banner
	mainMenu.banner = new InterfaceText(title, {
		font:UIConfig.bannerText,
		attach:{
			where:[0.5,1],
			parentWhere:[0.5,0.5],
			offset:[0,0]
		},
		parent:mainMenu
	});
	mainMenu.addChild(mainMenu.banner);

	//Subtitle
	mainMenu.banner2 = new InterfaceText(subtitle, {
		font:UIConfig.titleText,
		attach:{
			where:[0.5,0],
			parentWhere:[0.5,1],
			offset:[0,-5]
		},
		parent:mainMenu.banner
	});
	mainMenu.banner.addChild(mainMenu.banner2);
}

function initMainMenuLogin () {
	var username = (mainMenu.username) ? mainMenu.username.text : '';
	var password = (mainMenu.password) ? mainMenu.password.text : '';

	mainMenuClear();
	mainMenu.screen = 'login';

	mainMenuBanner('MMO Online', 'A video game');

	mainMenu.controls = new ElementList({
		padding:10,
		attach: {
			where:[0.5,0],
			parentWhere:[0.5,0.5],
			offset:[0,50]
		}
	});
	mainMenu.addChild(mainMenu.controls);

	mainMenu.username = TextBox.createLabelled('Username', 'username', username, false, TextBox.userName);
	mainMenu.username.maxChars = 25;
	mainMenu.username.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.username);

	mainMenu.password = TextBox.createLabelled('Password', 'password', password, true, TextBox.any);
	mainMenu.password.maxChars = 100;
	mainMenu.password.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.password);

	mainMenu.loginButton = InterfaceText.createMenuButton('Login', 'login');
	mainMenu.loginButton.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.loginButton, 30);

	mainMenu.registerButton = InterfaceText.createMenuButton('Register', 'register');
	mainMenu.registerButton.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.registerButton);

	mainMenuSetY();
}

function initMainMenuRegister () {
	var username = (mainMenu.username) ? mainMenu.username.text : '';
	var password = (mainMenu.password) ? mainMenu.password.text : '';

	mainMenuClear();
	mainMenu.screen = 'register';

	mainMenuBanner('Register', 'Who are you?');

	mainMenu.controls = new ElementList({
		padding:10,
		attach: {
			where:[0.5,0],
			parentWhere:[0.5,0.5],
			offset:[0,50]
		}
	});
	mainMenu.addChild(mainMenu.controls);

	mainMenu.username = TextBox.createLabelled('Username', 'username', username, false, TextBox.userName);
	mainMenu.username.maxChars = 25;
	mainMenu.username.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.username);

	mainMenu.password = TextBox.createLabelled('Password', 'password', password, true, TextBox.any);
	mainMenu.password.maxChars = 100;
	mainMenu.password.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.password);

	mainMenu.password2 = TextBox.createLabelled('Confirm Password', 'password2', '', true, TextBox.any);
	mainMenu.password.maxChars = 100;
	mainMenu.password2.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.password2);

	mainMenu.email = TextBox.createLabelled('Email (optional)', 'email', '', false, TextBox.any);
	mainMenu.email.maxChars = 100;
	mainMenu.email.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.email);

	mainMenu.registerButton = InterfaceText.createMenuButton('Register', 'register');
	mainMenu.registerButton.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.registerButton, 30);

	mainMenu.cancelButton = InterfaceText.createMenuButton('Cancel', 'cancel');
	mainMenu.cancelButton.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.cancelButton);

	mainMenuSetY();
}

function initMainMenuWorlds () {
	if (!mainMenu.worlds) {
		initMainMenuLogin();
		uiMessage('Uh oh', 'Something is wrong, something is amiss.');
	}

	mainMenuClear();
	mainMenu.screen = 'worlds';

	mainMenuBanner('World Select', 'Choose a destination.');

	mainMenu.controls = new ElementList({
		padding:10,
		attach: {
			where:[0.5,0],
			parentWhere:[0.5,0.5],
			offset:[0,50]
		}
	});
	mainMenu.addChild(mainMenu.controls);

	var button, text;
	for (var i = 0; i < mainMenu.worlds.length; i++) {
		var text = mainMenu.worlds[i].name + ' (' + mainMenu.worlds[i].players + ' playing)';
		button = InterfaceText.createMenuButton(text, 'world');
		button.worldId = mainMenu.worlds[i].id;
		button.setAttachX(0.5, 0.5);
		mainMenu.controls.addChild(button);
	}

	mainMenu.cancelButton = InterfaceText.createMenuButton('Cancel', 'cancel');
	mainMenu.cancelButton.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.cancelButton, 30);

	mainMenuSetY();
}

function initMainMenuCharacters () {
	if (mainMenu.characters.length === 0) {
		initMainMenuCharacterCreate();
		return;
	}

	mainMenuClear();
	mainMenu.screen = 'characters';

	mainMenuBanner('Character Select', 'Which you is you?');

	mainMenu.controls = new ElementList({
		padding:10,
		attach: {
			where:[0.5,0],
			parentWhere:[0.5,0.5],
			offset:[0,50]
		}
	});
	mainMenu.addChild(mainMenu.controls);

	var character;
	for (var i = 0; i < mainMenu.characters.length; i++) {
		var character = mainMenu.characters[i];
		var text = character.name + ' (' + character.summary + ')';
		button = InterfaceText.createMenuButton(text, 'character');
		button.characterId = character.id;
		button.setAttachX(0.5, 0.5);
		mainMenu.controls.addChild(button);
	}

	mainMenu.createButton = InterfaceText.createMenuButton('New Character', 'create');
	mainMenu.createButton.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.createButton);

	mainMenu.cancelButton = InterfaceText.createMenuButton('Cancel', 'cancel');
	mainMenu.cancelButton.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.cancelButton);

	mainMenuSetY();
}

function initMainMenuCharacterCreate() {
	mainMenuClear();
	mainMenu.screen = 'characterCreate';

	mainMenuBanner('Character Creation', 'Meet the new you.');

	var creationElement = new InterfaceElement({
		id:'creation',
		width:900,
		height:500,
	});
	creationElement.attach.offset[1] = 50;
	creationElement.setAttachX(0.5, 0.5);
	var appearanceControls = new ElementList({
		id:'appearance',
		padding:10
	});
	//appearanceControls.setAttachX(0.5, 0.5);
	creationElement.addChild(appearanceControls);

	var hairStyle = Selector.createLabelled([
		{name:'Shiny', value:null},
		{name:'Sharp', value:Parts.Hairs.Hair2},
		{name:'Dashing', value:Parts.Hairs.Hair1},
		{name:'Flat', value:Parts.Hairs.Hair4},
		{name:'Round', value:Parts.Hairs.Hair5},
		{name:'Vlad', value:Parts.Hairs.Hair3},
		{name:'Wild', value:Parts.Hairs.Hair7},
		{name:'Sunrise', value:Parts.Hairs.Hair6}
	], 'Hair Style', 'hairStyle');
	hairStyle.setRandom();
	hairStyle.setAttachX(0.5, 0.5);
	appearanceControls.addChild(hairStyle);

	var hairColor = Selector.createLabelled([
		{name:'Coal', 		value:Materials.Hairs.Coal},
		{name:'Chestnut', 	value:Materials.Hairs.Chestnut},
		{name:'Pumpkin', 	value:Materials.Hairs.Pumpkin},
		//{name:'Carrot', 	value:Materials.Hairs.Carrot},
		{name:'Gold', 		value:Materials.Hairs.Gold},
		{name:'Silver', 	value:Materials.Hairs.Silver}
	], 'Hair Color', 'hairColor');
	hairColor.setRandom();
	hairColor.setAttachX(0.5, 0.5);
	appearanceControls.addChild(hairColor);

	var skinColor = Selector.createLabelled([
		{name:'Fair', 			value:Materials.Skins.Fair},
		{name:'Olive', 			value:Materials.Skins.Olive},
		{name:'Sun Touched', 	value:Materials.Skins.SunTouched},
		{name:'Cocoa', 			value:Materials.Skins.Cocoa},
		{name:'Ebony', 			value:Materials.Skins.Ebony}
	], 'Skin Tone', 'skinColor');
	skinColor.setRandom();
	skinColor.setAttachX(0.5, 0.5);
	appearanceControls.addChild(skinColor);

	var previewPanel = new Panel({
		name:'charPreview',
		isClickable:false,
		width:144,
		height:144,
		attach:{
			where:[0,0],
			parentWhere:[0,0],
			offset:[160,0]
		},
		bgColor:0xffffff,
		borderWidth:0
	});
	previewPanel.sprite.alpha = 0.6;
	creationElement.addChild(previewPanel);


	var animSet = Animations.man;
	var partList = {
        head:[
            {part:Parts.Heads.Human}
        ],
        body:[{part:Parts.Bodies.Human}],
        handleft:[{part:Parts.Hands.Hand}],
        handright:[{part:Parts.Hands.Hand}],
        footleft:[{part:Parts.Feet.Boot}],
        footright:[{part:Parts.Feet.Boot}],
        weaponright:[{part:Parts.Weapons.Spear}]
    };
    if (hairStyle.getValue() != null)
    	partList.head.push({part:hairStyle.getValue()});

	var colorMap = {};
    applyMaterial(colorMap, skinColor.getValue(), 'skin');
    applyMaterial(colorMap, hairColor.getValue(), 'hair');
    applyMaterial(colorMap, Materials.Clothing.Brown, 'foot');
    colorMap.cloakHem = Materials.Metals.Gold.Light;
    colorMap.cloakClasp = Materials.Metals.Gold.Light;
    colorMap.belt = Materials.Clothing.Black[''];
    applyMaterial(colorMap, Materials.Clothing.Grey, 'body');
    applyMaterial(colorMap, Materials.Clothing.Blue, 'cloak');
    applyMaterial(colorMap, Materials.Metals.Steel, 'rightMat');
    applyMaterial(colorMap, Materials.Woods.Ash, 'rightMat2');

	var spriteSheet = new SpriteSheet(animSet, partList, colorMap);
    spriteSheet.render();
    var animSprite = new AnimatedSprite(spriteSheet, 'walkhold');
    animSprite.sprite.scale.x = 5;
    animSprite.sprite.scale.y = 5;
    animSprite.position.x = 12;
    animSprite.position.y = 12;

    animSprite.update(Date.now());
    setInterval(function() {
    	animSprite.update(Date.now());
    },50);

    hairStyle.onChange = function() {
    	var head = partList.head;
    	if (head.length > 1)
    		head.pop();
    	var val = hairStyle.getValue();
    	if (val != null)
    		partList.head.push({part:val});
    	spriteSheet.render();
    };

    hairColor.onChange = function() {
    	applyMaterial(colorMap, hairColor.getValue(), 'hair');
    	spriteSheet.render();
    };

    skinColor.onChange = function() {
    	applyMaterial(colorMap, skinColor.getValue(), 'skin');
    	spriteSheet.render();
    };

    previewPanel.displayObject.addChild(animSprite.sprite);

    //class
    var classGrid = createClassSelect();
    creationElement.addChild(classGrid);
    var classText = new InterfaceText('Base Class', {
    	font:UIConfig.titleText,
    	attach:{
    		where:[1,0.5],
    		parentWhere:[0,0],
    		offset:[classGrid.x - 7,classGrid.height/2]
    	}
    });
    creationElement.addChild(classText);

    //stats
    var statsPreview = new ElementList({
    	id:'stats',
    	padding:10,
    	attach:{
    		where:[0,0],
    		parentWhere:[0.5,0],
    		offset:[-135,0]
    	}
    });
    var stats = ['Might', 'Skill', 'Fortitude', 'Will', 'Faith'];
    for (var i = 0; i < stats.length; i++) {
    	var t = new InterfaceText(stats[i], {font:UIConfig.menuLabelText});
    	var tex = TextureGenerator.rectangle(100,20,0x0e7cb3,3,UIConfig.borderColor);
    	var texEle = new InterfaceTexture(tex, {});
    	texEle.attach.offset[0] = 75;
    	t.addChild(texEle);
    	statsPreview.addChild(t);

    }
    creationElement.addChild(statsPreview);

	mainMenu.controls = new ElementList({
		padding:10,
		attach: {
			where:[0.5,0],
			parentWhere:[0.5,0.5],
			offset:[0,50]
		}
	});

	mainMenu.controls.addChild(creationElement);
	mainMenu.charname = TextBox.createLabelled('Character Name', 'charname', '', false, TextBox.characterName);
	mainMenu.charname.maxChars = 25;
	mainMenu.charname.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.charname);

	mainMenu.addChild(mainMenu.controls);

	mainMenu.createButton = InterfaceText.createMenuButton('Create', 'create');
	mainMenu.createButton.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.createButton, 25);

	mainMenu.cancelButton = InterfaceText.createMenuButton('Cancel', 'cancel');
	mainMenu.cancelButton.setAttachX(0.5, 0.5);
	mainMenu.controls.addChild(mainMenu.cancelButton);

	mainMenuSetY();
}

function onMainMenuClick (element) {
	if (element instanceof InterfaceText)
		createjs.Sound.play('ui/click');

	if (element.name === 'login') {
		tryLoginUser();
	} else if (element.name === 'register') {
		if (mainMenu.screen === 'login') {
			initMainMenuRegister();
		} else if (mainMenu.screen === 'register') {
			tryCreateUser();
		}
	} else if (element.name === 'cancel') {
		switch (mainMenu.screen) {
			case 'register': initMainMenuLogin(); break;
			case 'worlds': logoutUser(); initMainMenuLogin(); break;
			case 'characters': logoutWorld(); initMainMenuWorlds(); break;
			case 'characterCreate': 
				if (mainMenu.characters.length > 0)
					initMainMenuCharacters();
				else
					initMainMenuWorlds();
		}
	} else if (element.name === 'world') {
		//world list format is kinda dumb
		var world = null;
		for (var i = 0; i < mainMenu.worlds.length; i++) {
			if (mainMenu.worlds[i].id === element.worldId) {
				world = mainMenu.worlds[i];
				break;
			}
		}

		if (world == null) {
			initMainMenuLogin();
			uiMessage('Error', 'Can\'t find world with id ' + element.worldId);
		} else {
			setStatus('Joining "' + world.name + '"');
			loginWorld(world.id);
		}
	} else if (element.name === 'character') {
		//character list name is also dumb
		var character;
		for (var i = 0; i < mainMenu.characters.length; i++) {
			if (mainMenu.characters[i].id === element.characterId) {
				character = mainMenu.characters[i];
				break;
			}
		}

		if (character === null) {
			uiMessage('Error', 'Can\'t find character with id ' + element.characterId);
		} else {
			setStatus('')
		}
	}
}

function onMainMenuKey (event) {
	switch (event.which) {
		case Keys.keyCodes.TAB:
			if (game.activeElement == mainMenu.username) {
				setElementActive(mainMenu.password);
			} else if (game.activeElement == mainMenu.password) {
				if (mainMenu.screen === 'register')
					setElementActive(mainMenu.password2);
				else
					setElementActive(mainMenu.username);
			} else if (game.activeElement == mainMenu.password2) {
				setElementActive(mainMenu.email);
			} else if (game.activeElement == mainMenu.email) {
				setElementActive(mainMenu.username);
			}
			break;
		case Keys.keyCodes.ENTER:
			if (mainMenu.screen === 'login')
				tryLoginUser();
			break;
	}
}

function tryLoginUser () {
	var username = mainMenu.username.text;
	var password = mainMenu.password.text;

	createjs.Sound.play('ui/click');

	if (username.length === 0) {
		uiMessage('Error', 'Username is empty.');
		return;
	}

	game.connection.send(new Messages.LoginUser(username, password).serialize());

	setStatus('Logging In', 'Please wait...');
}

function logoutUser () {
	game.connection.send(new Messages.LogoutUser().serialize());
}

function tryCreateUser () {
	var username = mainMenu.username.text;
	var password = mainMenu.password.text;

	if (password !== mainMenu.password2.text) {
		uiMessage('Error', 'Passwords don\'t match');
		return;
	} else if (username.length === 0) {
		uiMessage('Error', 'Username is empty.');
		return;
	} else if (username.length === 1) {
		uiMessage('Error', 'Username too short.');
		return;
	}

	var msg = new Messages.CreateUser(username, password, mainMenu.email.text);
	game.connection.send(msg.serialize());
}

function loginWorld (id) {
	game.connection.send(new Messages.LoginWorld(id).serialize());
}

function logoutWorld () {
	game.connection.send(new Messages.LogoutWorld().serialize());
}

function loginCharacter (id) {
	game.connection.send(new Messages.LoginCharacter(id).serialize());
}

function tryCreateCharacter () {
	game.connection.send(new Messages.CreateCharacter().serialize());
}

function logoutCharacter () {
	game.connection.send(new Messages.LogoutCharacter().serialize());
}

function onMainMenuMessage (msg) {
	switch (msg.params.action) {
		case 'loginUser':
			if (msg.params.success) {
				game.userSettings = msg.params.settings;
				setStatus('Success', 'Fetching world list...');
				game.connection.send(new Messages.GetWorlds().serialize());
			} else {
				uiMessage('Login Failed', msg.params.reason.toString());
			}
			break;
		case 'createUser':
			if (msg.params.success) {
				setStatus('Success', 'Logging in...');
				tryLoginUser();
			} else {
				uiMessage('Registration Failed', msg.params.reason.toString());
			}
			break;
		case 'getWorlds':
			clearStatus();
			mainMenu.worlds = msg.params.worlds;
			initMainMenuWorlds();
			break;
		case 'loginWorld':
			if (msg.params.success) {	
				setStatus('Success', 'Fetching character list...');
				game.connection.send(new Messages.GetCharacters().serialize());
			} else {
				uiMessage('Join Failed', msg.params.reason.toString());
			}
			break;
		case 'getCharacters':
			if (msg.params.success) {	
				clearStatus();
				mainMenu.characters = msg.params.characters;
				initMainMenuCharacters();
			} else {
				uiMessage('Error', msg.params.reason.toString());
			}
			break;
		case 'loginCharacter':
			if (msg.params.success) {
				initMainMenuLogin();
				uiMessage('Oops!', 'Not implemented yet. :(');
			} else {
				uiMessage('Login Failed', msg.params.reason.toString());
			}
			break;
		case 'createCharacter':
			if (msg.params.success) {	
				setStatus('Success', 'Updating character list...');
				game.connection.send(new Messages.GetCharacters().serialize());
			} else {
				uiMessage('Creation Failed', msg.params.reason.toString());
			}
			break;
		default:
			uiMessage('Error', 'Unknown action "' + msg.params.action + '"');
	}
}

function updateMenuBackground () {
	var speed = game.TERRAIN_TILE_WIDTH; //pixels/sec
	var currentTime = Date.now();
	var timeDelta = currentTime - menuBackground.lastUpdate;
	var pixelDelta = timeDelta / 1000 * speed;
	var tileWidth = game.TERRAIN_TILE_WIDTH * game.DEFAULT_SCALE;

	menuBackground.scrollX -= pixelDelta;
	menuBackground.position.x = Math.round(menuBackground.scrollX);
	menuBackground.lastUpdate = currentTime;

	var child;
	for (var i = 0; i < menuBackground.children.length; i++) {
		child = menuBackground.children[i];
		if (child.position.x + menuBackground.position.x <= -tileWidth)
			menuBackground.removeChild(child);
	}

	var col = Math.ceil((game.renderer.width - menuBackground.position.x) / tileWidth);
	while (menuBackground.lastSpawnedCol < col) {
		menuSpawnColumn();
	}
}

function menuSpawnColumn () {
	var tileWidth = game.TERRAIN_TILE_WIDTH * game.DEFAULT_SCALE;
	var numRows = Math.ceil(game.renderer.height / tileWidth);
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

		if (row > 2 && row < 5 && urlArgs.testSprites)
			treeChance = 0;

		if (Math.random() < treeChance) {
			texName = MmooUtil.chooseRandomCumulative (
				['terrain/tree1', 'terrain/tree2'],
				[0.95, 1]
			);
			sprite = new PIXI.Sprite(game.textures[texName]);
			column[row] = 't';
		} else if (Math.random() < grassChance) {
			texName = MmooUtil.chooseRandomCumulative (
				['terrain/grass2', 'terrain/grass3', 'terrain/grass4'],
				[0.33, 0.66, 1]
			);
			sprite = new PIXI.Sprite(game.textures[texName]);
			column[row] = 'g';
		} else if (Math.random() < 0.05) {
			/*texName = MmooUtil.chooseRandomCumulative (
				['terrain/flower1', 'terrain/flower2', 'terrain/flower3','terrain/dirtpatch1', 'terrain/dirtpatch3', 'terrain/dirtpatch2'],
				[0.25, 0.4, 0.5, 0.75, 0.9, 1]
			);*/

			texName = MmooUtil.chooseRandomWeighted (
				['terrain/flower1', 'terrain/flower2', 'terrain/flower3','terrain/dirtpatch1', 'terrain/dirtpatch3', 'terrain/dirtpatch2'],
				[25,15,10,25,15,10]
			);

			sprite = new PIXI.Sprite(game.textures[texName]);
			column[row] = 'd';
		} else {
			column[row] = 'g';
		}

		if (sprite !== null) {
			sprite.position.x = menuBackground.lastSpawnedCol * tileWidth;
			sprite.position.y = row * tileWidth;
			sprite.scale.x = game.DEFAULT_SCALE;
			sprite.scale.y = game.DEFAULT_SCALE;
			menuBackground.addChild(sprite);
		}
	}

	menuBackground.lastSpawnedCol += 1;
	menuBackground.lastColumn = column;
}
