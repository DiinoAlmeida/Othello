"use strict";

let PORT = '8117';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const crypto = require('crypto');


/*
class Game{
    
    constructor(Player1, Player2, GameId, ){
        
    }
}
*/


//Verificar se file existe, caso contrário cria-o
fs.access('./data.json', fs.F_OK, (err) => {


    let data = {
        "Data": [],
    }

    if (err) {
        fs.writeFile('data.json', JSON.stringify(data), function (err) {
            if (err) throw err;
        })
    }
});


const headers = {
    plain: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    },
    sse: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
    }
};


http.createServer(function (request, response) {
    const preq = url.parse(request.url, true) //Dividir o url em partes
    const pathname = preq.pathname;
    let answer = {}

    switch (request.method) {
        case 'GET':
            answer = doGetRequest(pathname, request, response);
            break;
        case 'POST':
            doPost(pathname, request, response);
            break;
        default:
            response.writeHead(500, headers.plain);
            response.end();
    }

}).listen(PORT);


function doGetRequest(request, response) {

}

function WriteAnswer(response, status, headers, menssage) {
    response.writeHead(status, headers);
    response.write(menssage);
    response.end();
}

function doPost(pathname, request, response) {
    let status;
    let FileData = JSON.parse(fs.readFileSync('data.json'));

    switch (pathname) {
        case '/ranking':
            WriteAnswer(response, 200, headers.plain, JSON.stringify(FileData));
            break;

        case '/register':
            register(request, response, FileData);
            break;

        case '/join':
            join(request, response);
            break;
            
        default:
            status = 400;
            break;
    }
}


function register(request, response, FileData) {


    let BodyData = {};

    request.on('data', chunk => {
        BodyData = chunk;
    });

    let i, registed;
    request.on('end', () => {
        BodyData = JSON.parse(BodyData);
    
        if(BodyData.nick == ""){
              WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Name is not valid"
            }));
            return;
        }else if(BodyData.pass == ""){
              WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Password is not valid"
            }));
            return;
        }
                
        
        for (i in FileData.Data) {
            if (FileData.Data[i].nick == BodyData.nick) { //Se o nick já existir
                registed = 1;

                const hash = crypto.createHash('md5').update(BodyData.pass).digest('hex');

                if (FileData.Data[i].pass == hash) { //Se a pass for igual.
                    WriteAnswer(response, 200, headers.plain, "{}");
                } else {
                    WriteAnswer(response, 400, headers.plain, JSON.stringify({
                        "error": "User registered with a different password"
                    }));
                }
                return;
            }
        }

        if (registed === undefined) { //Registar user
            let pass = BodyData.pass;
            const hash = crypto.createHash('md5').update(pass).digest('hex');

            let data = {
                "nick": BodyData.nick,
                "pass": hash,
                "victories": 0,
                "games": 0
            };

            FileData.Data.push(data);

            fs.writeFile('data.json', JSON.stringify(FileData), function (err) {
                if (err) return console.log(err);
                console.log("Well done, Bem Vndo");
            })

            WriteAnswer(response, 200, headers.plain, "{}");
            return;
        }
       
    });
    
}



function join(request, response){
    
}
