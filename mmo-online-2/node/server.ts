/**
 * Created by Kevin on 31/01/2015.
 */
/// <reference path="node.d.ts" />
/// <reference path="ws.d.ts" />

import ws = require('ws');

module MMOO {

    export class Server {
        wsServer: ws.Server;
        port:number;


        constructor(port:number) {
            this.port = port;
        }
    }
}