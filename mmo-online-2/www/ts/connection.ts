/**
 * Created by Kevin on 23/01/2015.
 */

enum readyStates {
    CONNECTING,
    OPEN,
    CLOSING,
    CLOSED
};

module MMOO {
    export class Connection {
        public artificialDelay: number = 0;

        status:             String      = 'Not connected';
        dictionary:         Object      = null;
        socket:             WebSocket;

        onStatusChange:     Function;
        onMessageCallback:  Function;

        constructor (serverURL: string, serverPort: number, onStatusChange: Function, onMessage: Function) {
            var _this = this;

            this.onStatusChange = onStatusChange;
            this.onMessageCallback = onMessage;

            this.socket = new WebSocket('ws://' + serverURL + ':' + serverPort.toString());
            this.socket.addEventListener('open', function () { _this.onConnect(); });
            this.socket.addEventListener('close', function () { _this.onDisconnect(); });
            this.socket.addEventListener('error', function () { _this.onDisconnect(); });
            this.socket.addEventListener('message', function (message: MessageEvent) { _this.onMessage(message); });
        }

        onConnect () {
            this.onStatusChange('Handshaking');
        }

        onMessage (message: MessageEvent) {
            var data = message.data;

            if (data.startsWith('dict:')) {
                this.dictionary = JSON.parse(data.substr(5,data.length-5));
                this.onStatusChange('Ready');
                return;
            }

            var json;
            try {
                for (var abbreviation in this.dictionary) {
                    data = data.replace('"'+abbreviation+'":', '"'+this.dictionary[abbreviation]+'":');
                }
                json = JSON.parse(data);
            } catch (e) {
                Connection.log('Can\'t read message: \'' + data + '\'');
                return;
            }

            this.onMessageCallback(json);
        }

        onDisconnect () {
            this.onStatusChange('Disconnected');
        }

        sendMessage (message) {
            if (this.socket.readyState == readyStates.CONNECTING) {
                Connection.log('Not connected yet! Message \'' + message + '\' not sent.');
            } else if (this.socket.readyState == readyStates.OPEN) {
                if (this.artificialDelay == 0) {
                    this.socket.send(this.abbreviateMessage(message));
                } else if (Math.round(this.artificialDelay) > 0) {
                    var _this = this;
                    var msg = this.abbreviateMessage(message);
                    setTimeout(function() {_this.socket.send(msg)}, Math.round(this.artificialDelay));
                } else {
                    Connection.log('Strange artificialDelay value \'' + this.artificialDelay + '\'');
                }
            } else {
                Connection.log('Connection lost! Message \'' + message + '\' not sent.');
            }
        }

        abbreviateMessage (message) {
            for (var abbreviation in this.dictionary) {
                message = message.replace('"'+this.dictionary[abbreviation]+'":', '"'+abbreviation+'":');
            }
        }

        static log (logMsg) {
            console.log('CONNECTION: ' + logMsg);
        }
    }
}