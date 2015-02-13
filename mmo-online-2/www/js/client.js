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
    };

    this.onConnectionReady = function () {
        //start the game!
        this.connection.log('Connection ready!');
        this.game = new Game(this.connection, this.stage);
        this.game.onTick();
    };

    this.onMessage = function(msg) {
        if (this.game != null) {
            this.game.onMessage(msg);
        }
    };
};