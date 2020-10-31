// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


/*
    Ver porque quando a ia não pode jogar nem o jogador pode (por esta ordem) a IA joga
*/


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

//Create a 2d array and set every position equal to null
var PosCor = new Array(8);
var Player1 = new Player(1, 2);
var Player2 = new Player(2, 2);
var cells;
var Turn;

//Mudar as opções do jogo
function submit() {
    radioCor = document.getElementsByName("Cor");
    radioAdeversario = document.getElementsByName("Adversario");
    radioDificuldade = document.getElementsByName("Dificuldade");

    if (radioCor[0].checked) {
        Player1.cor = "black";
        Player1.className = "squareB";
        Player2.cor = "white";
        Player2.className = "squareW";
        Turn = Player1;
    } else {
        Player1.cor = "white";
        Player1.className = "squareW";
        Player2.cor = "black";
        Player2.className = "squareB";
        Turn = Player2;
        bestMove();
    }
    document.getElementById("PlayerTurn").innerHTML = "Jogador";
}

function gameon() {
    "use strict"; //????
    document.getElementById("Access").style.display = "none";
    document.getElementById("Status").style.display = 'block';
    document.getElementById("Config").style.display = 'block';
    document.getElementById("myBtn").style.display = 'block';
    document.getElementById("DiscosB").style.display = 'block';
    document.getElementById("DiscosP").style.display = 'block';
    document.getElementById("PlayerTurn").style.display = 'block';
    document.getElementById("Classificacoes").style.display = 'block';
    document.getElementById("JogadorWin").style.display = 'block';
    document.getElementById("ComputerWin").style.display = 'block';

    ArrayInit();

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

    cells = document.querySelectorAll(".square");

    document.getElementById("28").className = "squareB";
    document.getElementById("35").className = "squareB";
    document.getElementById("27").className = "squareW";
    document.getElementById("36").className = "squareW";

    document.getElementById("DiscosB").innerHTML = "Discos brancos: 2";
    document.getElementById("DiscosP").innerHTML = "Discos pretos: 2";
}

function PlayAgain() {

    document.getElementById("Again").disabled = true;
    document.getElementById("Passar").style.display = 'block';
    document.getElementById("PlayerTurn").style.display = 'block';
    document.getElementById("Vencedor").style.display = 'none';
    document.getElementById("Vencedor").innerHTML = "";

    ArrayInit();

    Player1.Npecas = Player2.Npecas = 2;

    for (let i = 0; i < 64; i++) {
        document.getElementById(i).className = "square";
    }

    document.getElementById("28").className = "squareB";
    document.getElementById("35").className = "squareB";
    document.getElementById("27").className = "squareW";
    document.getElementById("36").className = "squareW";

    submit();
}

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

function turnClick(indice) {

    if (playMove(indice) == 1) {
        document.getElementById(indice).disabled = "true";
        swapTurn(); //IA
        if (CheckEndGame() == false) { // Se a IA puder jogar joga, caso contrario passa a jogada
            setTimeout(bestMove, 2000);
        } else {
            swapTurn(); //Jog
            if (CheckEndGame() == true) EndGame();
            document.getElementById("Again").disabled = false;
        }
    }
}



function EndGame() {

    document.getElementById("Passar").style.display = 'none';
    document.getElementById("PlayerTurn").style.display = 'none';
    document.getElementById("Vencedor").style.display = 'block';
    if (Player1.Npecas > Player2.Npecas) {
        document.getElementById("Vencedor").innerHTML = "Parabéns ganhou!!";
        Player1.vitorias++;
    } else {
        Player2.vitorias++;
        document.getElementById("Vencedor").innerHTML = "Fica para a próxima, jogar outra vez?";
    }
    document.getElementById("JogadorWin").innerHTML = "Jogador: " + Player1.vitorias;
    document.getElementById("ComputerWin").innerHTML = "Computador: " +Player2.vitorias;

}

//Esta função vai decidir se onde clicamos é possivel jogar ou nao consoante as regras
//Se mudar alguma peça do adversário retorna 1 caso contrário retorna -1
function playMove(indice) {

    let status = -1;

    //find line and collumn of indice
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


function returnId(i, j) {

    let count = 0;
    while (i > 0) {
        count += 8;
        i--;
    }

    count += j;
    return count;
}

function swapTurn() {

    if (Turn == Player1) {
        document.getElementById("PlayerTurn").innerHTML = "Computador";
        Turn = Player2;
    } else {
        document.getElementById("PlayerTurn").innerHTML = "Jogador";
        Turn = Player1;
    }

    document.getElementById("Passar").style.display = 'none';
}

function CheckEndGame() {

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (PosCor[i][j] == "null" && (analiseNeighbors(i, j, 0) == 1)) return false;
        }
    }

    return true;
}



function skipTurn() {
    if (CheckEndGame() == false) {
        document.getElementById("Passar").style.display = 'block';
    } else {
        swapTurn();
        bestMove();
    }
}

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
