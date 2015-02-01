/**
 * Created by Kevin on 31/01/2015.
 */
/// <reference path="node.d.ts" />
/// <reference path="ws.d.ts" />
var MMOO;
(function (MMOO) {
    var Server = (function () {
        function Server(port) {
            this.port = port;
        }
        return Server;
    })();
    MMOO.Server = Server;
})(MMOO || (MMOO = {}));
//# sourceMappingURL=server.js.map