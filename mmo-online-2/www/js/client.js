/**
 * Created by Kevin on 07/02/2015.
 */
var Client = function (serverURL, port, parentElement) {
    var _this = this;

    //server info
    this.serverURL = serverURL;
    this.port = port;

    //PIXI
    this.stage = new PIXI.Stage(0x333333);
    this.stage.interactive = true;
    this.renderer = PIXI.autoDetectRenderer(800, 600);
    this.renderer.view.setAttribute('z-index','0');
    parentElement.appendChild(this.renderer.view);

    this.loader = null;
    this.numLoaded = 0;
    this.loaderText = new PIXI.Text("Connecting...", {font: "35px Arial", fill: "white", align: "center"});
    this.loaderText.anchor.x = 0.5;
    this.loaderText.anchor.y = 0.5;
    this.loaderText.position.x = 400;
    this.loaderText.position.y = 250;
    this.stage.addChild(this.loaderText);

    this.loaderGraphics = new PIXI.Graphics();
    this.loaderBar = null;

    //UI
    UI.init();

    //Connection
    this.connection = new Connection(serverURL, port, this);

    //Game
    this.game = null;


    this.drawStage = function() {
        var _this = this;
        requestAnimFrame(function () { _this.drawStage(); });

        if (this.game != null) {
            this.game.draw();
        }
        this.renderer.render(this.stage);
    }; this.drawStage();

    this.onConnect = function () {
        //handshaking, stand by
        this.connection.log('Connected to ' + this.serverURL + ':' + this.port);
        this.connection.log('Handshaking...');
        this.loaderText.setText('Handshaking...');
    };

    this.onHandShake = function () {
        //okay, start loading assets
        var _this = this;
        this.loaderText.setText('Loading...');
        this.loaderBar = new HUD.Bar(400,40,0xffffff,0,1);
        this.loaderBar.sprite.anchor.x = 0.5;
        this.loaderBar.sprite.anchor.y = 0.5;
        this.loaderBar.sprite.position.x = 400;
        this.loaderBar.sprite.position.y = 300;
        this.loaderBar.draw(_this.loaderGraphics);
        this.stage.addChild(this.loaderBar.sprite);

        this.loader = new PIXI.AssetLoader(Textures.texList);
        this.loader.onProgress = function() {
            _this.numLoaded++;
            _this.loaderBar.changeVal(_this.numLoaded / this.assetURLs.length, true);
            _this.loaderBar.draw(_this.loaderGraphics);
        };
        this.loader.onComplete = function() {
            _this.onLoadComplete();
        };
        this.loader.load();
    };

    this.onLoadComplete = function() {
        //send sync message
        this.loaderText.setText('Synchronizing...');
        this.stage.removeChild(this.loaderBar.sprite);
        this.loaderBar = null;
        this.connection.sendSync();
    };

    this.onConnectionReady = function (playerId) {
        //start the game!
        this.stage.removeChild(this.loaderText);
        this.connection.log('Connection ready!');
        this.game = new Game(playerId, this.connection, this.stage);
        this.game.onTick();
    };

    this.onMessage = function(msg) {
        if (this.game != null) {
            this.game.onMessage(msg);
        }
    };
};