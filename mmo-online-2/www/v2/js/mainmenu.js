function initMainMenu() {
	window.mainMenu = {};

	mainMenu.stage = 'login';

	//Banner
	mainMenu.banner = new InterfaceText("MMO Online", {
		font:UIConfig.bannerText,
		attach:{
			where:[0.5,1],
			parentWhere:[0.5,0.5],
			offset:[0,-130]
		},
		parent:game.ui
	});
	//mainMenu.banner.displayObject.filters = [game.filters.dropShadow];
	game.ui.addChild(mainMenu.banner);

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
	//mainMenu.banner2.displayObject.filters = [game.filters.dropShadow];
	mainMenu.banner.addChild(mainMenu.banner2);

	//Username box
	mainMenu.username = new TextBox({
		id:'username',
		name:'username',
		allowedCharacters:TextBox.userName,
		maxChars:25,
		parent:game.ui,
		width:250,
		height:30,
		attach:{
			where:[0.5, 0],
			parentWhere:[0.5, 0.5],
			offset:[0,-80]
		}
	});
	game.ui.addChild(mainMenu.username);

	var nameLabel = new InterfaceText("Username", {
		font: UIConfig.bodyText,
		parent: mainMenu.username,
		attach:{
			where:[0,0],
			parentWhere:[0,1],
			offset:[5,3]
		}
	});
	//nameLabel.displayObject.filters = [game.filters.dropShadow];
	mainMenu.username.addChild(nameLabel);

	//Password box
	mainMenu.password = new TextBox({
		id:'password',
		name:'password',
		allowedCharacters:TextBox.any,
		parent:game.ui,
		width:250,
		height:30,
		hideInput:true,
		attach:{
			where:[0.5, 0],
			parentWhere:[0.5, 0.5],
			offset:[0,-20]
		}
	});
	game.ui.addChild(mainMenu.password);

	var passLabel = new InterfaceText("Password", {
		font: UIConfig.bodyText,
		parent: mainMenu.password,
		attach:{
			where:[0,0],
			parentWhere:[0,1],
			offset:[5,3]
		}
	});
	//passLabel.displayObject.filters = [game.filters.dropShadow];
	mainMenu.password.addChild(passLabel);
}