"use strict";

let PORT = '8117';

const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const crypto = require('crypto');

let Games = [];

class Game {
    constructor(Player1, Player2, Hash, Board, Turn) {
        this.Player1 = Player1;
        this.NPlayer1 = 2;
        this.Player1Response = null;
        this.Hash = Hash;
        this.Player2 = Player2;
        this.NPlayer2 = 2;
        this.Player2Response = null;
        this.Board = Board;
        this.Turn = Turn;
    }
}

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
    let query = preq.query;

    switch (request.method) {
        case 'GET':
            doGetRequest(request, response, pathname, query);
            break;
        case 'POST':
            doPost(pathname, request, response);
            break;
        default:
            response.writeHead(500, headers.plain);
            response.end();
    }

}).listen(PORT);

function doGetRequest(request, response, pathname, query) {

    switch (pathname) {
        case '/update':

            if (query.nick == null) {
                WriteAnswer(response, 400, headers.plain, JSON.stringify({
                    error: "User is undefined"
                }));
                return;
            } else if (query.game == null) {
                WriteAnswer(response, 400, headers.plain, JSON.stringify({
                    error: "Game is undefined"
                }));
                return;
            }

            let i;
            for (i in Games) {
                if (Games[i].Hash == query.game) {
                    if (Games[i].Player1 == query.nick && Games[i].Player1Response == null) {
                        Games[i].Player1Response = response;
                        response.writeHead(200, headers.sse);
                        return;
                    } else if (Games[i].Player2 == query.nick && Games[i].Player2Response == null) {
                        Games[i].Player2Response = response;
                        response.writeHead(200, headers.sse);

                        let data = {
                            'board': Games[i].Board,
                            'turn': Games[i].Turn,

                                'dark': Games[i].NPlayer1,
                                'light': Games[i].NPlayer2
                            
                        };

                        data = JSON.stringify(data);

                        Games[i].Player1Response.write('data: ' + data + '\n\n');
                        Games[i].Player2Response.write('data: ' + data + '\n\n');
                    }
                }
            }

            break;
    }
}

function WriteAnswer(response, status, headers, menssage) {
    response.writeHead(status, headers);
    response.write(menssage);
    response.end();
}

function doPost(pathname, request, response) {
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

        case '/notify':
            notify(request, response);
            break;

        default:
            response.writeHead(400, headers.plain);
            response.end();
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

        if (BodyData.nick == "") {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Name is not valid"
            }));
            return;
        } else if (BodyData.pass == "") {
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

    request.on('error', (err) => {
        console.log(err.message);
    });

}

function join(request, response) {

    let BodyData = {};

    request.on('data', chunk => {
        BodyData = chunk;
    });

    request.on('end', () => {

        BodyData = JSON.parse(BodyData);
        let i, inGame;

        for (i in Games) {
            if (Games[i].Player2 == "") {
                inGame = 1;
                Games[i].Player2 = BodyData.nick;

                let joinResponse = {
                    "color": "light",
                    "game": Games[i].Hash
                }

                WriteAnswer(response, 200, headers.plain, JSON.stringify(joinResponse));
                return;
            }
        }

        if ((Games.length == 0) || (inGame === undefined)) {
            let nick = BodyData.nick;
            const hash = crypto.createHash('md5').update(nick).digest('hex');

            let board = new Array(8);
            ArrayInit(board);
            let newGame = new Game(BodyData.nick, "", hash, board, "dark");
            Games.push(newGame);

            let joinResponse = {
                "color": "dark",
                "game": hash
            }

            WriteAnswer(response, 200, headers.plain, JSON.stringify(joinResponse));
            return;
        }


        WriteAnswer(response, 400, headers.plain, JSON.stringify({
            "error": "Game connection failed"
        }));
    });


    request.on('error', (err) => {
        console.log(err.message);
    });
}

function notify(request, response) {

    let BodyData = {};

    request.on('data', chunk => {
        BodyData = chunk;
    });

    request.on('end', () => {
        BodyData = JSON.parse(BodyData);
        let i, notifyError;

        for (i in Games) {
            if (Games[i].Player1 == BodyData.nick || Games[i].Player2 == BodyData.nick) {
                if (BodyData.game == Games[i].Hash) {

                    if ((Games[i].Player1 == BodyData.nick && Games[i].Turn == 'light') || (Games[i].Player2 == BodyData.nick && Games[i].Turn == 'dark')) {
                        WriteAnswer(response, 400, headers.plain, JSON.stringify({
                            error: "Not your turn to play"
                        }));
                        return;
                    }

                    notifyError = 1;
                    if (analiseNeighbors(Games[i], BodyData.move.row, BodyData.move.column, 1) == -1) {
                        WriteAnswer(response, 400, headers.plain, JSON.stringify({
                            error: "Invalid move"
                        }));
                    } else {
                        response.writeHead(200, headers.plain);
                        response.end();


                        if (Games[i].Turn == "dark") {
                            Games[i].Turn = "light";
                        } else {
                            Games[i].Turn = "dark";
                        }

                        DataSend(Games[i]);

                        let Data = {
                            'board': Games[i].Board,
                            'turn': Games[i].Turn,
                            'dark': Games[i].NPlayer1,
                            'light': Games[i].NPlayer2
                        };
                        
                        Data = JSON.stringify(Data);

                        Games[i].Player1Response.write('data: ' + Data + '\n\n');
                        Games[i].Player2Response.write('data: ' + Data + '\n\n');


                        //WriteAnswer(response, 200, headers.plain);
                    }

                    //console.log(BodyData.move);
                    return;
                }
            }
        }


        if (notifyError === undefined) {
            response.writeHead(400, headers.plain);
            response.end();
        }
    });


    request.on('error', (err) => {
        console.log(err.message);
    });
}



//Se mudar alguma peça do adversário retorna 1 caso contrário retorna -1
//Option serve para indicar se é só para observar se há jogada ou se também é para jogar!
// Option == 1 -> Jogar.
// Option == 2 -> Observar.
function analiseNeighbors(Game, i, j, option) {

    let status = -1;
    //let z = returnId(i, j);
    if (Game.Board[i][j] != "null") return status;

    //console.log("Ola");
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {

            let r = i + dr;
            let c = j + dc;
            //z = returnId(r, c);

            //console.log("Game.Board[r][c]: " + Game.Board[r][c] + "   " + Game.Turn);
            if ((dc == 0 && dr == 0) || r < 0 || c < 0 || r > 7 || c > 7 || (Game.Board[r][c] == "null") || Game.Board[r][c] == Game.Turn) {
                continue;
            } else {
                let count = 0;

                while (r >= 0 && c >= 0 && r <= 7 && c <= 7 && Game.Board[r][c] != Game.Turn && Game.Board[r][c] != "null") {
                    //console.log("Diferente:    Game.Board[r][c]: " + Game.Board[r][c] + "   " + Game.Turn);
                    r += dr;
                    c += dc;
                    //z = returnId(r, c);
                    count++;
                }

                if (r >= 0 && c >= 0 && r <= 7 && c <= 7 && Game.Board[r][c] == Game.Turn && count >= 1) {
                    //console.log("Aqui?");
                    if (option == 1) {
                        while (count != -1) {
                            r = r - dr;
                            c = c - dc;
                            //z = returnId(r, c);
                            Game.Board[r][c] = Game.Turn;
                            count--;
                        }
                    }
                    //contarPecas();
                    status = 1;
                }
            }
        }
    }
    return status;
}

//Vai returna o id do quadrado selecionado para usar no PosCor
function returnId(i, j) {

    let count = 0;
    while (i > 0) {
        count += 8;
        i--;
    }

    count += j;
    return count;
}

//Inicia o array a null e coloca as cores de inicio de jogo
function ArrayInit(Board) {
    for (let i = 0; i < 8; i++) {
        Board[i] = new Array(8);
        for (let j = 0; j < 8; j++) {
            Board[i][j] = "null";
        }
    }

    Board[3][3] = Board[4][4] = "light";
    Board[3][4] = Board[4][3] = "dark";
}

//Conta as peças para a atualizar o status
function DataSend(game) {

    let countd = 0;
    let countl = 0;

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (game.Board[i][j] == 'dark') {
                countd++;
            } else if (game.Board[i][j] == 'light') {
                countl++;
            }
        }
    }

    game.NPlayer1 = countd;
    game.NPlayer2 = countl;
}
