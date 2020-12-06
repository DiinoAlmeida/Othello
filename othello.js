// Modal for rules button
var modal1 = document.getElementById("Rules");

var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
    modal1.style.display = "block";
}

span.onclick = function () {
    modal1.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal1.style.display = "none";
    }
}

//Modal for ranking
var modal2 = document.getElementById("Ranking");

var btn2 = document.getElementById("myBtnTwo");

var span2 = document.getElementsByClassName("close")[1];

btn2.onclick = function () {
    modal2.style.display = "block";
}

window.onclick = function (event) {
    if (event.target == modal2) {
        modal2.style.display = "none";
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

if (!localStorage.getItem('Player1')) {
    localStorage.setItem('Player1', '0');
    localStorage.setItem('Player2', '0');
} else {
    Player1.vitorias = localStorage.getItem("Player1");
    Player2.vitorias = localStorage.getItem("Player2");
}

ranking();

function board() {

    ArrayInit();

    if (!!document.getElementById("board")) {
        for (let i = 0; i < 64; i++) {
            document.getElementById(i).className = "square";
        }
        document.getElementById("28").className = "squareB";
        document.getElementById("35").className = "squareB";
        document.getElementById("27").className = "squareW";
        document.getElementById("36").className = "squareW";
        return;
    }

    const board = document.createElement("div");
    board.id = "board";

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
}

//Processar as opções de jogo escolhidas
function submit() {
    radioCor = document.getElementsByName("Color");
    radioAdeversario = document.getElementsByName("Adversary");

    board();
    document.getElementById("Status").style.display = "block";
    document.getElementById("DiscosB").style.display = 'block';
    document.getElementById("DiscosP").style.display = 'block';
    document.getElementById("PlayerTurn").style.display = 'block';
    document.getElementById("Access").style.display = "none";
    document.getElementById("Winner").style.display = "none";
    document.getElementById("Leave").disabled = false;
    document.getElementById("btskip").disabled = false;
    document.getElementById("Play").disabled = true;
    document.getElementById("DiscosB").innerHTML = "Discos brancos: 2";
    document.getElementById("DiscosP").innerHTML = "Discos pretos: 2";


    if (document.getElementById("Config").style.display == "block") {
        if (radioAdeversario[1].checked) {
            Adversary = "AI";
        } else if (radioAdeversario[0].checked) {
            Adversary = "Player";
            document.getElementById("PlayerTurn").innerHTML = nick;
            Join();
            return;
        } else {
            window.alert("Tem de escolher uma opção!");
            return;
        }
    } else {
        Adversary = "AI";
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
        return;
    }

    if (nick == "undefined") {
        document.getElementById("PlayerTurn").innerHTML = "Jogador";
    } else {
        document.getElementById("PlayerTurn").innerHTML = nick;

    }
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

    if (Adversary == "AI" && playMove(indice) == 1) {
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
    if(document.getElementById("Welcome").style.display == "none"){
     document.getElementById("Access").style.display = "block";   
    }
    document.getElementById("btskip").disabled = true;
    document.getElementById("Leave").disabled = true;
    document.getElementById("Play").disabled = false;

    if (Player1.Npecas > Player2.Npecas) {
        document.getElementById("Winner").innerHTML = "Parabéns ganhou!!";
        Player1.vitorias++;
    } else {
        Player2.vitorias++;
        document.getElementById("Winner").innerHTML = "Fica para a próxima, jogar outra vez?";
    }

    localStorage.setItem('Player1', Player1.vitorias.toString());
    localStorage.setItem('Player2', Player2.vitorias.toString());

    ranking();
}

//Passar a jogada
function skipTurn() {
if(Adversary == "Player"){
        notifyServerSkip();
        document.getElementById("SkipServer").style.display = "none";
        return;
    }
    
    if (CheckEndGame() == false) {
        document.getElementById("btskip").style.display = 'block';
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
                document.getElementById("DiscosB").innerHTML = "";
                document.getElementById("DiscosP").innerHTML = "";
            })
            .catch(console.log);

        serverRanking();
    } else {
        Player2.vitorias++;
        document.getElementById("Winner").style.display = "block";
        document.getElementById("Skip").style.display = "none";
        document.getElementById("PlayerTurn").style.display = "none";
        if (!document.getElementById("Welcome")) {
            ranking();
            localStorage.setItem("Player1", Player1.vitorias.toString());
            localStorage.setItem("Player2", Player2.vitorias.toString());
            document.getElementById("Access").style.display = "block";
        }
        document.getElementById("btskip").disabled = true;
        document.getElementById("Leave").disabled = true;
        document.getElementById("Play").disabled = false;
        document.getElementById("Winner").innerHTML = "Vencedor: Computador";

    }

    document.getElementById("DiscosB").innerHTML = "";
    document.getElementById("DiscosP").innerHTML = "";
}


//Server--------------------------------------------------------------------------
var url = "http://twserver.alunos.dcc.fc.up.pt:8008/";

var nick = "Jogador";
var pass;
var group = "17";
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
                document.getElementById("Play").disabled = false;
                document.getElementById("Leave").disabled = true;
                document.getElementById("btskip").disabled = true;
            } else {
                serverRanking();

                let div = document.createElement("div");
                div.id = "Welcome";
                div.innerHTML = "Bem vindo, " + nick + "!";
                document.body.appendChild(div);


                document.getElementById("ConfigButtons1").id = "ConfigButtons2";
                document.getElementById("Access").style.display = "none";
                document.getElementById("Config").style.display = 'block';

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

            if (t.error) {
                window.alert(t.error);
                document.getElementById("PlayerTurn").style.display = 'block';
                document.getElementById("Leave").disabled = false;
                document.getElementById("btskip").disabled = false;
                document.getElementById("Play").disabled = true;
            } else {
                game = t.game;
                update();
            }


        })
        .catch(console.log());
}

function update() {

    let urltemp = url + "update?nick=" + nick + "&game=" + game;

    const eventSource = new EventSource(encodeURI(urltemp));

    eventSource.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.winner !== undefined) {
            document.getElementById("Winner").style.display = "block";
            document.getElementById("PlayerTurn").style.display = "none";
            document.getElementById("Leave").disabled = true;
            document.getElementById("btskip").disabled = true;
            document.getElementById("Play").disabled = false;
            document.getElementById("Winner").innerHTML = "Vencedor: " + data.winner;
            eventSource.close();
            return;
        } else if (data.skip !== undefined) {
            if(nick == data.turn){
                document.getElementById("btskip").disabled = false;
                document.getElementById("SkipServer").style.display = "block";
            }
        } else {
            document.getElementById("DiscosB").innerHTML = "Discos Brancos: " + data.count.light;
            document.getElementById("DiscosP").innerHTML = "Discos Pretos: " + data.count.dark;
            document.getElementById("PlayerTurn").innerHTML = data.turn;
        }

        for (let i = 0; i <= 7; i++)
            for (let j = 0; j <= 7; j++) {
                let id = returnId(i, j);
                if (data.board[i][j] == "dark") {
                    document.getElementById(id).className = "squareB";
                } else if (data.board[i][j] == "light") {
                    document.getElementById(id).className = "squareW";
                }
            }
    }
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
        .catch(console.log);
}

function notifyServerSkip() {

    data = {
        "nick": nick,
        "pass": pass,
        "game": game,
        "move": null
    }

    fetch(url + "notify", {
            method: "POST",
            body: JSON.stringify(data),
        })
        .catch(console.log);
}



//Ranking
function deleteRanking() {
    let modal = document.getElementById("Ranking");
    modal.removeChild(document.getElementById("modaltwo"));
    let divmodal = document.createElement("div");
    divmodal.className = "modal-contenttwo";
    divmodal.id = "modaltwo";
    let spanmodal = document.createElement("span");
    spanmodal.className = "close";
    spanmodal.innerHTML = "&times;";

    modal.appendChild(divmodal);
}

function serverRanking() {


    fetch(url + "ranking", {
            method: "POST",
            body: JSON.stringify(""),
        })
        .then(function (r) {
            return r.json();
        })
        .then(function (t) {
            printRanking(t);

        })
        .catch(console.log);

}

function ranking() {

    deleteRanking();

    let btn = document.getElementById("modaltwo");

    const h3 = document.createElement("h3");
    const p1 = document.createElement("p");
    const p2 = document.createElement("p");
    h3.innerHTML = "Classificações: ";
    p1.innerHTML = "Jogador: " + Player1.vitorias;
    p2.innerHTML = "Computador: " + Player2.vitorias;

    btn.appendChild(h3);
    btn.appendChild(p1);
    btn.appendChild(p2);

}

function printRanking(data) {

    deleteRanking();

    data = data.ranking;
    let btn = document.getElementById("modaltwo");

    const h3 = document.createElement("h3");
    h3.innerHTML = "Classificações: ";

    const table = document.createElement("table")

    const def = document.createElement("tr");
    const nick = document.createElement("th");
    const win = document.createElement("th");
    const games = document.createElement("th");
    nick.innerHTML = "Nick";
    win.innerHTML = "Vitorias";
    games.innerHTML = "Jogos";

    btn.appendChild(h3);
    btn.appendChild(table);
    table.appendChild(def);
    def.appendChild(nick);
    def.appendChild(win);
    def.appendChild(games);

    for (let i = 0; i < 10; i++) {
        let row = document.createElement("tr");
        table.appendChild(row);
        let nome = document.createElement("td");
        let vitorias = document.createElement("td");
        let jogos = document.createElement("td");
        nome.innerHTML = data[i].nick;
        vitorias.innerHTML = data[i].victories
        jogos.innerHTML = data[i].games;

        row.appendChild(nome);
        row.appendChild(vitorias);
        row.appendChild(jogos);
    }
}
