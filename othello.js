// Modal for rules button
var modal = document.getElementById("myModal");

var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
    modal.style.display = "block";
}

span.onclick = function () {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

//----------------------------------------------------------------
class Player {
    constructor(id, Npecas) {
        this.id = id;
        this.Npecas = Npecas;
        this.vitorias = 0;
        this.cor = null;
        this.className = null;
    }
}

//Inicializar variaveis globais
var PosCor = new Array(8);
var Player1 = new Player(1, 2);
var Player2 = new Player(2, 2);
var Turn;
var Adversary;
/*
    Depois de pressionar botão login colocamos todos os elementos necessários na página.
*/
function GameOn() {
    "use strict";
    document.getElementById("Access").style.display = "none";
    document.getElementById("Status").style.display = 'block';
    document.getElementById("Config").style.display = 'block';
    document.getElementById("myBtn").style.display = 'block';
    document.getElementById("DiscosB").style.display = 'block';
    document.getElementById("DiscosP").style.display = 'block';
    document.getElementById("PlayerTurn").style.display = 'block';
    document.getElementById("Statistics").style.display = 'block';
    document.getElementById("JogadorWin").style.display = 'block';
    document.getElementById("ComputerWin").style.display = 'block';
}

//Processar as opções de jogo escolhidas
function Submit() {
    radioCor = document.getElementsByName("Color");
    radioAdeversario = document.getElementsByName("Adversary");

    if (radioAdeversario[1].checked) {
        TabOn();
        Adversary = "Computer";
        ArrayInit();
    } else if (radioAdeversario[0].checked) {
        Join();
        TabOn(); //Colocar tabuleiro
        Adversary = "Player";
        return;
    } else {
        window.alert("Tem de escolher uma opção!");
    }

    if (radioCor[0].checked) {
        Player1.cor = "black";
        Player1.className = "squareB";
        Player2.cor = "white";
        Player2.className = "squareW";
        Turn = Player1;
    } else if (radioCor[1].checked) {
        Player1.cor = "white";
        Player1.className = "squareW";
        Player2.cor = "black";
        Player2.className = "squareB";
        Turn = Player2;
        bestMove();
    } else {
        window.alert("Tem de escolher uma opção!");
    }

    document.getElementById("DiscosB").innerHTML = "Discos brancos: 2";
    document.getElementById("DiscosP").innerHTML = "Discos pretos: 2";
    //document.getElementById("PlayerTurn").innerHTML = nick;
}

//Coloca o tabuleiro do jogo no ecra
function TabOn() {

    const board = document.createElement("div");
    board.className = "board";

    for (let i = 0; i < 64; i++) {
        const square = document.createElement("div");
        square.className = "square";
        square.id = i;
        square.onclick = ((P) => {
            return () => turnClick(P)
        })(i);
        board.appendChild(square);
    }

    document.body.appendChild(board);

    document.getElementById("28").className = "squareB";
    document.getElementById("35").className = "squareB";
    document.getElementById("27").className = "squareW";
    document.getElementById("36").className = "squareW";

    document.getElementById("Play").disabled = true;
    document.getElementById("Leave").disabled = false;
}


function GameOver() {
    document.getElementById("Play").disabled = false;
    document.getElementById("Skip").style.display = 'none';
    document.getElementById("PlayerTurn").style.display = 'none';
    document.getElementById("Winner").style.display = 'none';
    document.getElementById("Winner").innerHTML = "";
    document.getElementById("Leave").disabled = true;

    for (let i = 0; i < 64; i++) document.getElementById(i).remove();
}

//Vez do computador a jogar
function bestMove() {

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (PosCor[i][j] != Turn.cor && (analiseNeighbors(i, j, 1) == 1)) {
                let z = returnId(i, j);
                document.getElementById(z).disabled = "true";
                swapTurn(); // Jogador

                if (CheckEndGame() == true) { //Verficar se jogador pode jogar
                    swapTurn();
                    if (CheckEndGame() == true) { // Verificar se IA pode jogar
                        EndGame();
                    } else {
                        bestMove();
                    }
                }
                return;
            }
        }
    }
}


//Depois de clicarmos no tabuleiro
function turnClick(indice) {

    if (Adversary == "Computer" && playMove(indice) == 1) {
        document.getElementById(indice).disabled = "true";
        swapTurn(); //IA
        if (CheckEndGame() == false) { // Se a IA puder jogar joga, caso contrario passa a jogada
            setTimeout(bestMove, 2000);
        } else {
            swapTurn(); //Jog
            if (CheckEndGame() == true) EndGame();
        }
    } else if (Adversary == "Player") {

        let count = 0;
        while (indice > 7) {
            indice -= 8;
            count++;
        }

        notifyServer(count, indice);
    }
}

//Esta função vai decidir se onde clicamos é possivel jogar ou nao consoante as regras
//Se mudar alguma peça do adversário retorna 1 caso contrário retorna -1
function playMove(indice) {

    let status = -1;

    let count = 0;
    while (indice > 7) {
        indice -= 8;
        count++;
    }

    status = analiseNeighbors(count, indice, 1);

    return status;
}


//Se mudar alguma peça do adversário retorna 1 caso contrário retorna -1
//Option serve para indicar se é só para observar se há jogada ou se também é para jogar!
// Option == 1 -> Jogar.
// Option == 2 -> Observar.
function analiseNeighbors(i, j, option) {

    let status = -1;

    if (PosCor[i][j] != "null") return status;

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {

            let r = i + dr;
            let c = j + dc;

            if ((dc == 0 && dr == 0) || r < 0 || c < 0 || r > 7 || c > 7 || (PosCor[r][c] == "null") || PosCor[r][c] == Turn.cor) {
                continue;
            } else {

                let count = 0;

                while (r >= 0 && c >= 0 && r <= 7 && c <= 7 && PosCor[r][c] != Turn.cor && PosCor[r][c] != "null") {
                    r += dr;
                    c += dc;
                    count++;
                }

                if (r >= 0 && c >= 0 && r <= 7 && c <= 7 && PosCor[r][c] == Turn.cor && count >= 1) {

                    if (option == 1) {
                        while (count != -1) {
                            r = r - dr;
                            c = c - dc;
                            z = returnId(r, c);
                            document.getElementById(z).className = Turn.className;
                            PosCor[r][c] = Turn.cor;
                            count--;
                        }
                    }
                    contarPecas();
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

//Faz a troca de turnos
function swapTurn() {

    if (Turn == Player1) {
        document.getElementById("PlayerTurn").innerHTML = "Computador";
        Turn = Player2;
    } else {
        document.getElementById("PlayerTurn").innerHTML = "Jogador";
        Turn = Player1;
    }

    document.getElementById("Skip").style.display = 'none';
}


function CheckEndGame() {

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (PosCor[i][j] == "null" && (analiseNeighbors(i, j, 0) == 1)) return false;
        }
    }

    return true;
}

//Termina o jogo
function EndGame() {

    document.getElementById("Skip").style.display = 'none';
    document.getElementById("PlayerTurn").style.display = 'none';
    document.getElementById("Winner").style.display = 'block';

    if (Player1.Npecas > Player2.Npecas) {
        document.getElementById("Winner").innerHTML = "Parabéns ganhou!!";
        Player1.vitorias++;
    } else {
        Player2.vitorias++;
        document.getElementById("Winner").innerHTML = "Fica para a próxima, jogar outra vez?";
    }

    document.getElementById("JogadorWin").innerHTML = "Jogador: " + Player1.vitorias;
    document.getElementById("ComputerWin").innerHTML = "Computador: " + Player2.vitorias;

}

//Passar a jogada
function skipTurn() {
    if (CheckEndGame() == false) {
        document.getElementById("Skip").style.display = 'block';
    } else {
        swapTurn();
        bestMove();
    }
}

//Conta as peças para a atualizar o status
function contarPecas() {

    let count1 = 0;
    let count2 = 0;

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (PosCor[i][j] == Player1.cor) {
                count1++;
            } else if (PosCor[i][j] == Player2.cor) {
                count2++;
            }
        }
    }

    Player1.Npecas = count1;
    Player2.Npecas = count2;

    if (Player1.cor == "black") {
        document.getElementById("DiscosB").innerHTML = "Discos brancos: " + count2;
        document.getElementById("DiscosP").innerHTML = "Discos pretos: " + count1;
    } else {
        document.getElementById("DiscosB").innerHTML = "Discos brancos: " + count1;
        document.getElementById("DiscosP").innerHTML = "Discos pretos: " + count2;
    }
}

//Inicia o array a null e coloca as cores de inicio de jogo
function ArrayInit() {
    for (let i = 0; i < 8; i++) {
        PosCor[i] = new Array(8);
        for (let j = 0; j < 8; j++) {
            PosCor[i][j] = "null";
        }
    }

    PosCor[3][3] = PosCor[4][4] = "white";
    PosCor[3][4] = PosCor[4][3] = "black";
}




//Server----------------------------------

var url = "http://twserver.alunos.dcc.fc.up.pt:8008/";

var nick;
var pass;
var group = "10";
var game;


function login() {

    nick = document.getElementById("user").value;
    pass = document.getElementById("pass").value;

    data = {
        "nick": nick,
        "pass": pass
    }

    fetch(url + "register", {
            method: "POST",
            body: JSON.stringify(data),
        })
        .then(function (r) {
            return r.text();
        })
        .then(function (t) {
            if (t != "{}") {
                window.alert(t);
            } else {
                GameOn();
            }
        })
        .catch(console.log);
}


function Join() {

    data = {
        "group": group,
        "nick": nick,
        "pass": pass
    }

    fetch(url + "join", {
            method: "POST",
            body: JSON.stringify(data),
        })
        .then(function (r) {
            return r.json();
        })
        .then(function (t) {
            game = t.game; //Tratar dos erros mas não percebi como se fazia
        })
        .catch(console.log);

}


function LeaveGame() {

    if (Adversary == "Player") {
        data = {
            "game": game,
            "nick": nick,
            "pass": pass
        }

        fetch(url + "leave", {
                method: "POST",
                body: JSON.stringify(data),
            })
            .then(function (r) {
                return r.json();
            })
            .then(function (t) {
                //Tratar dos erros mas não percebi como se fazia
            })
            .catch(console.log);
    }

    document.getElementById("DiscosB").innerHTML = "";
    document.getElementById("DiscosP").innerHTML = "";
    GameOver();
}


function notifyServer(row, col) {

    data = {
        "nick": nick,
        "pass": pass,
        "game": game,
        "move": {
            "row": row,
            "column": col
        }
    }

    fetch(url + "notify", {
            method: "POST",
            body: JSON.stringify(data),
        })
        .then(function (r) {
            return r.text();
        })
        .then(function (t) {
            //Tratar dos erros mas não percebi como se fazia
        })
        .catch(console.log);
    
    
        update();
}


function update() {

    let urltemp = url + "update?nick=" + nick + "&game=" + game;

    const eventSource = new EventSource(encodeURI(urltemp));

    eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);
        
        console.log(data);
    }

}
