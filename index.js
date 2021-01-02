"use strict";

let PORT = '8117';

const http = require('http');
const path = require('path');
const url = require('url');
const methods = require('./methods.js');
const headers = require('./headers.js').headers;

http.createServer(function (request, response) {
    const preq = url.parse(request.url, true) //Dividir o url em partes
    const pathname = preq.pathname;
    let query = preq.query;

    switch (request.method) {
        case 'GET':
            methods.doGetRequest(request, response, pathname, query);
            break;
        case 'POST':
            methods.doPost(pathname, request, response);
            break;
        default:
            response.writeHead(500, headers.plain);
            response.end();
    }

}).listen(PORT);


