/**
 * Created by Kevin on 23/01/2015.
 */

/// <reference path="connection.ts" />
/// <reference path="game.ts" />
/// <reference path="lib/pixi.d.ts" />

module MMOO {
    export class Client {
        connection: Connection;
        game:       Game;
        stage:      PIXI.Stage;
        renderer:   PIXI.PixiRenderer;
        statusText: PIXI.Text;

        constructor(serverURL: string, serverPort: number, parentElement: HTMLElement) {
            var _this = this;

            this.stage = new PIXI.Stage(0x333333);
            this.stage.interactive = true;
            this.renderer = PIXI.autoDetectRenderer(800, 600);
            parentElement.appendChild(this.renderer.view);

            this.statusText = new PIXI.Text('Connecting...', {font:'72px Arial', fill:'white'});
            this.statusText.anchor.x = 0.5;
            this.statusText.anchor.y = 0.5;
            this.statusText.position.x = this.renderer.width * 0.5;
            this.statusText.position.y = this.renderer.height * 0.5;
            this.stage.addChild((this.statusText));

            this.drawStage();

            this.connection = new Connection(
                serverURL,
                serverPort,
                function (status: string) { _this.onConnectionStatusChange(status); },
                function (message: Object) { _this.onMessage(message); }
            );
        }

        onConnectionStatusChange(status: string) {
            if (status == 'Handshaking') {
                this.statusText.setText('Handshaking...');
            } else if (status == 'Ready') {
                this.statusText.setText('Connected!');
            } else if (status == 'Disconnected') {
                this.statusText.setStyle({font:'72px Arial', fill:'red'});
                this.statusText.setText('Can\'t connect.');
            }
        }

        onMessage(message: Object) {

        }

        drawStage() {
            var _this = this;
            requestAnimFrame(function () { _this.drawStage(); });

            //this.game.updateUnitPositions();

            this.renderer.render(this.stage);
        }
    }
}