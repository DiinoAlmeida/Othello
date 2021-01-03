const fs = require('fs');
const crypto = require('crypto');
const headers = require('./headers.js').headers;

let Games = [];

class Game {
    constructor(Player1, Player2, Hash, Board, Turn) {
        this.Player1 = Player1;
        this.Player1Color = "dark";
        this.NPlayer1 = 2;
        this.Player1Response = null;
        this.Hash = Hash;
        this.Player2 = Player2;
        this.Player2Color = "light";
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

    if (err)
        fs.writeFile('data.json', JSON.stringify(data), function (err) {
            if (err) throw err;
        });
});

function WriteAnswer(response, status, headers, menssage) {
    response.writeHead(status, headers);
    response.write(menssage);
    response.end();
}

function EndResponse(response, status, headers) {
    response.writeHead(status, headers);
    response.write(JSON.stringify({}));
    response.end();
}

module.exports.doGetRequest = function (request, response, pathname, query) {

    switch (pathname) {
        case '/update':
            update(request, response, pathname, query);
            break;

        default:
            EndResponse(response, 404, headers.plain);
            break;
    }
}

module.exports.doPost = function (pathname, request, response) {
    let FileData = JSON.parse(fs.readFileSync('data.json'));

    switch (pathname) {
        case '/ranking':
            ranking(response, FileData);
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

        case '/leave':
            leave(request, response);
            break;

        default:
            response.writeHead(404, headers.plain);
            response.end();
            break;
    }
}

function ranking(response, FileData){
       FileData = JSON.stringify(FileData);
       WriteAnswer(response, 200, headers.plain, FileData);
}

function register(request, response, FileData) {

    let BodyData = "";

    request.on('data', chunk => {
        BodyData += chunk;
    });

    let i, registed;
    request.on('end', () => {

        BodyData = JSON.parse(BodyData);

        if (BodyData.nick === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Name is not valid"
            }));
            return;
        } else if (BodyData.pass === undefined) {
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
                    EndResponse(response, 200, headers.plain);
                } else {
                    WriteAnswer(response, 401, headers.plain, JSON.stringify({
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
            })

            EndResponse(response, 200, headers.plain);
            return;
        }
    });

    request.on('error', (err) => {
        console.log(err.message);
    });
}

function join(request, response) {

    let BodyData = "";

    request.on('data', chunk => {
        BodyData += chunk;
    });

    request.on('end', () => {

        BodyData = JSON.parse(BodyData);

        if (BodyData.group === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Group is undefined"
            }));
            return;
        } else if (BodyData.nick === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Nick is undefined"
            }));
            return;
        } else if (BodyData.pass === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Pass is undefined"
            }));
            return;
        }

        if (!CheckNickPass(BodyData.nick, BodyData.pass)) {
            WriteAnswer(response, 401, headers.plain, JSON.stringify({
                "error": "Nick and Pass don't match"
            }));
            return;
        }

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
            let newGame = new Game(BodyData.nick, "", hash, board, BodyData.nick);
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

    let BodyData = "";
    let Data;

    request.on('data', chunk => {
        BodyData += chunk;
    });

    request.on('end', () => {
        BodyData = JSON.parse(BodyData);

        if (BodyData.nick === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Nick is undefined"
            }));
            return;
        } else if (BodyData.pass === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Pass is undefined"
            }));
            return;
        } else if (BodyData.move === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Move is undefined"
            }));
            return;
        } else if (BodyData.game === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Game is undefined"
            }));
            return;
        }

        if (!CheckNickPass(BodyData.nick, BodyData.pass)) {
            WriteAnswer(response, 401, headers.plain, JSON.stringify({
                "error": "Nick and Pass don't match"
            }));
            return;
        }

        let result = CheckGame(BodyData.game);
        if (result == -1) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Game not found"
            }));
            return;
        } else if (Games[result].Player1 === "" || Games[result].Player2 === "") {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Game not started"
            }));
            return;
        }

        let i, notifyError;

        if (BodyData.move === null) { //Caso seja preciso passar a jogada

            for (i in Games) {
                if (Games[i].Player1 == BodyData.nick || Games[i].Player2 == BodyData.nick) {
                    if (BodyData.game == Games[i].Hash) {
                        SwapTurn(Games[i]);

                        Data = {
                            'board': Games[i].Board,
                            'turn': Games[i].Turn,
                            'dark': Games[i].NPlayer1,
                            'light': Games[i].NPlayer2
                        };

                        Data = JSON.stringify(Data);

                        EndResponse(response, 200, headers.plain);

                        Games[i].Player1Response.write('data: ' + Data + '\n\n');
                        Games[i].Player2Response.write('data: ' + Data + '\n\n');
                        return;
                    }
                }
            }

            EndResponse(response, 400, headers.plain);
            return;
        }

        //Verifica se as coordenadas estão certas
        if (BodyData.move.row === undefined || BodyData.move.column === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                error: "Move lacks property column or row"
            }));
            return;
        }

        if (BodyData.move.row > 7 || BodyData.move.row < 0 || BodyData.move.column > 7 || BodyData.move.column < 0) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                error: "Invalid move"
            }));
            return;
        }

        for (i in Games) {
            if (Games[i].Player1 == BodyData.nick || Games[i].Player2 == BodyData.nick) {
                if (BodyData.game == Games[i].Hash) {

                    if ((Games[i].Player1 == BodyData.nick && Games[i].Turn == Games[i].Player2) || (Games[i].Player2 == BodyData.nick && Games[i].Turn == Games[i].Player1)) {
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
                        EndResponse(response, 200, headers.plain);

                        SwapTurn(Games[i]);
                        DataSend(Games[i]);

                        if (CheckEndGame(Games[i]) == true) {

                            let winner;
                            if (Games[i].NPlayer1 > Games[i].NPlayer2) {
                                winner = Games[i].Player1;
                                UpdateJSON(Games[i].Player1, Games[i].Player2);
                            } else if (Games[i].NPlayer1 < Games[i].NPlayer2) {
                                winner = Games[i].Player2;
                                UpdateJSON(Games[i].Player2, Games[i].Player1);
                            } else {
                                winner = null;
                            }

                            Data = {
                                'winner': winner,
                                'board': Games[i].Board,
                                'turn': Games[i].Turn,
                                'dark': Games[i].NPlayer1,
                                'light': Games[i].NPlayer2
                            };

                            Data = JSON.stringify(Data);

                            Games[i].Player1Response.write('data: ' + Data + '\n\n');
                            Games[i].Player2Response.write('data: ' + Data + '\n\n');
                            Games[i].Player1Response.end();
                            Games[i].Player2Response.end();
                            Games.splice(i, 1);
                            return;

                        } else if (CheckSkip(Games[i]) == true) {

                            Data = {
                                'board': Games[i].Board,
                                'turn': Games[i].Turn,
                                'skip': true,
                                'dark': Games[i].NPlayer1,
                                'light': Games[i].NPlayer2
                            };

                        } else {

                            Data = {
                                'board': Games[i].Board,
                                'turn': Games[i].Turn,
                                'dark': Games[i].NPlayer1,
                                'light': Games[i].NPlayer2
                            };
                        }

                        Data = JSON.stringify(Data);

                        Games[i].Player1Response.write('data: ' + Data + '\n\n');
                        Games[i].Player2Response.write('data: ' + Data + '\n\n');
                    }
                    return;
                }
            }
        }

        if (notifyError === undefined) {
            EndResponse(response, 400, headers.plain);
        }
    });

    request.on('error', (err) => {
        console.log(err.message);
    });
}

function update(request, response, pathname, query) {

    if (query.nick === undefined) {
        WriteAnswer(response, 400, headers.plain, JSON.stringify({
            error: "User is undefined"
        }));
        return;
    } else if (query.game == undefined) {
        WriteAnswer(response, 400, headers.plain, JSON.stringify({
            error: "Game is undefined"
        }));
        return;
    }

    let result = CheckGame(query.game);
    if (result == -1) {
        WriteAnswer(response, 400, headers.plain, JSON.stringify({
            "error": "Game not found"
        }));
        return;
    } else if (Games[result].Player1 != query.nick && Games[result].Player2 != query.nick) {
        WriteAnswer(response, 400, headers.plain, JSON.stringify({
            "error": "Don't exist players with that nick in the game"
        }));
        return;
    }

    if (Games[result].Player1 == query.nick && Games[result].Player1Response == null) {
        Games[result].Player1Response = response;
        response.writeHead(200, headers.sse);
        return;
    } else if (Games[result].Player2 == query.nick && Games[result].Player2Response == null) {
        Games[result].Player2Response = response;
        response.writeHead(200, headers.sse);

        let data = {
            'board': Games[result].Board,
            'turn': Games[result].Turn,
            'dark': Games[result].NPlayer1,
            'light': Games[result].NPlayer2
        };

        data = JSON.stringify(data);

        Games[result].Player1Response.write('data: ' + data + '\n\n');
        Games[result].Player2Response.write('data: ' + data + '\n\n');
    }
}

function leave(request, response) {

    let BodyData = "";

    request.on('data', chunk => {
        BodyData += chunk;
    });

    request.on('end', () => {
        BodyData = JSON.parse(BodyData);

        if (BodyData.nick === undefined || BodyData.pass === undefined || BodyData.game === undefined) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                error: "Data is undefined"
            }));
            return;
        }

        if (!CheckNickPass(BodyData.nick, BodyData.pass)) {
            WriteAnswer(response, 401, headers.plain, JSON.stringify({
                "error": "Nick and Pass don't match"
            }));
            return;
        }

        let result = CheckGame(BodyData.game);
        if (result == -1) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Game not found"
            }));
            return;
        } else if (Games[result].Player1 != BodyData.nick && Games[result].Player2 != BodyData.nick) {
            WriteAnswer(response, 400, headers.plain, JSON.stringify({
                "error": "Don't exist players with that nick in the game"
            }));
            return;
        }

        let winner = null;

        if (Games[result].Player2Response == null) {

            let Data = {
                'winner': winner,
                'board': Games[result].Board,
                'turn': Games[result].Turn,
                'dark': Games[result].NPlayer1,
                'light': Games[result].NPlayer2
            };

            Data = JSON.stringify(Data);
            Games[result].Player1Response.write('data: ' + Data + '\n\n');
            Games[result].Player1Response.end();
            Games.splice(i, 1);
            EndResponse(response, 200, headers.plain);
            return;

        } else if (Games[result].Player2Response != null && Games[result].Player1Response != null) {

            if (Games[result].Player1 == BodyData.nick) {
                winner = Games[result].Player2;
                UpdateJSON(Games[i].Player2, Games[i].Player1);
            } else {
                winner = Games[result].Player1;
                UpdateJSON(Games[i].Player1, Games[i].Player2);
            }

            let Data = {
                'winner': winner,
                'board': Games[result].Board,
                'turn': Games[result].Turn,
                'dark': Games[result].NPlayer1,
                'light': Games[result].NPlayer2
            };

            Data = JSON.stringify(Data);
            Games[result].Player1Response.write('data: ' + Data + '\n\n');
            Games[result].Player2Response.write('data: ' + Data + '\n\n');
            Games[result].Player1Response.end();
            Games[result].Player2Response.end();
            Games.splice(i, 1);
            EndResponse(response, 200, headers.plain);
            return;
        }
    });
}

//Funções Auxiliares
function CheckNickPass(nick, pass) {
    let FileData = JSON.parse(fs.readFileSync('data.json'));

    const hash = crypto.createHash('md5').update(pass).digest('hex');

    for (i in FileData.Data)
        if (FileData.Data[i].nick == nick && FileData.Data[i].pass == hash) return true;

    return false;
}

function CheckGame(game) {

    for (i in Games)
        if (Games[i].Hash === game) return i;

    return -1;
}

//Se mudar alguma peça do adversário retorna 1 caso contrário retorna -1
//Option serve para indicar se é só para observar se há jogada ou se também é para jogar!
// Option == 1 -> Jogar.
// Option == 2 -> Observar.
function analiseNeighbors(Game, i, j, option) {

    let status = -1;
    if (Game.Board[i][j] != "null") return status;

    let Turn;

    if (Game.Turn == Game.Player1) Turn = Game.Player1Color;
    else Turn = Game.Player2Color;


    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {

            let r = i + dr;
            let c = j + dc;

            if ((dc == 0 && dr == 0) || r < 0 || c < 0 || r > 7 || c > 7 || (Game.Board[r][c] == "null") || Game.Board[r][c] == Turn) {
                continue;
            } else {
                let count = 0;

                while (r >= 0 && c >= 0 && r <= 7 && c <= 7 && Game.Board[r][c] != Turn && Game.Board[r][c] != "null") {
                    r += dr;
                    c += dc;
                    count++;
                }

                if (r >= 0 && c >= 0 && r <= 7 && c <= 7 && Game.Board[r][c] == Turn && count >= 1) {
                    if (option == 1) {
                        while (count != -1) {
                            r = r - dr;
                            c = c - dc;

                            Game.Board[r][c] = Turn;
                            count--;
                        }
                    }
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

function CheckSkip(game) {

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (game.Board[i][j] == "null" && (analiseNeighbors(game, i, j, 0) == 1)) return false;
        }
    }

    return true;
}

function CheckEndGame(game) {

    if (CheckSkip(game) == true) {
        SwapTurn(game);
        if (CheckSkip(game) == true) {
            return true;
        } else {
            SwapTurn(game);
        }
    }

    return false;
}

function SwapTurn(Game) {

    if (Game.Turn == Game.Player1) Game.Turn = Game.Player2;
    else Game.Turn = Game.Player1;

}

function UpdateJSON(winner, loser) {

    let FileData = JSON.parse(fs.readFileSync('data.json'));

    for (i in FileData.Data) {
        if (FileData.Data[i].nick == winner) {
            FileData.Data[i].games = FileData.Data[i].games + 1;
            FileData.Data[i].victories = FileData.Data[i].victories + 1;
        }else if(FileData.Data[i].nick == loser){
            FileData.Data[i].games = FileData.Data[i].games + 1;
        }
    }
  
    fs.writeFile('data.json', JSON.stringify(FileData), function (err) {
        if (err) throw err;
    });
}
