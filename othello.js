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
        this.cor = null;
    }

}

//Create a 2d array and set every position equal to null
var PosColor = new Array(8);

for (let i = 0; i < 8; i++) {
    PosColor[i] = new Array(8);
    for (let j = 0; j < 8; j++) {
        PosColor[i][j] = "null";
    }
}

var Player1 = new Player(1, 2);
var Player2 = new Player(2, 2);
var cells;
var Turn;

//Mudar as opções do jogo
function submit() {
    radioCor = document.getElementsByName("Cor");
    radioAdeversario = document.getElementsByName("Adversario");
    radioDificuldade = document.getElementsByName("Dificuldade");
    document.getElementById("PlayerTurn").innerHTML = "Black turn";
    if (radioCor[0].checked) {
        Player1.cor = "black";
        Player2.cor = "white";
        Turn = Player1;
    } else {
        Player1.cor = "white";
        Player2.cor = "black";
        Turn = Player2;
        bestMove();
        swapTurn();
    }
}

//Cores iniciais
PosColor[3][3] = PosColor[4][4] = "white";
PosColor[3][4] = PosColor[4][3] = "black";

function gameon() {
    "use strict"; //????
    document.getElementById("Access").style.display = "none";
    document.getElementById("Status").style.display = 'block';
    document.getElementById("Config").style.display = 'block';
    document.getElementById("myBtn").style.display = 'block';
    document.getElementById("DiscosB").style.display = 'block';
    document.getElementById("DiscosP").style.display = 'block';
    document.getElementById("PlayerTurn").style.display = 'block';

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

    document.getElementById("28").style.backgroundColor = "black";
    document.getElementById("35").style.backgroundColor = "black";
    document.getElementById("27").style.backgroundColor = "white";
    document.getElementById("36").style.backgroundColor = "white";
}


function bestMove() {

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (PosColor[i][j] != Turn.cor && (analiseNeighbors(i, j) == 1)) {
                return;
            }
        }
    }
}


//ALterar esta função, pois se o primeiro jogador a jogar for o player2 o bestMove() é logo executado.
function turnClick(indice) {
    /*
    playMove(square.target.id)
    swapTurn();
    setTimeout(bestMove, 2000);
    */


    if (playMove(indice) == 1) {
        swapTurn();
        setTimeout(bestMove, 2000);
        setTimeout(swapTurn, 3000);

    }


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

    /*
     i/8
     i%8
    */


    status = analiseNeighbors(count, indice);

    console.log(status);

    return status;
}


//Se mudar alguma peça do adversário retorna 1 caso contrário retorna -1
function analiseNeighbors(i, j) {

    let status = -1;


    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {

            let r = i + dr;
            let c = j + dc;

            if ((dc == 0 && dr == 0) || r < 0 || c < 0 || r > 7 || c > 7 || (PosColor[r][c] == "null") || PosColor[r][c] == Turn.cor) {
                continue;
            } else {

                let count = 0;

                while (r >= 0 && c >= 0 && r <= 7 && c <= 7 && PosColor[r][c] != Turn.cor && PosColor[r][c] != "null") {
                    r += dr;
                    c += dc;
                    count++;
                }

                console.log(r);
                if (r >= 0 && c >= 0 && r <= 7 && c <= 7 && PosColor[r][c] == Turn.cor && count >= 1) {
                    while (count != -1) {
                        r = r - dr;
                        c = c - dc;
                        z = returnId(r, c);
                        document.getElementById(z).style.backgroundColor = Turn.cor;
                        PosColor[r][c] = Turn.cor;
                        Turn.Npecas++;
                        if(Turn.cor == "white") {
                          document.getElementById("DiscosB").innerHTML = "Discos brancos: " + Turn.Npecas;
                        } else {
                          document.getElementById("DiscosP").innerHTML = "Discos pretos: " + Turn.Npecas;
                        }

                        count--;
                    }
                    status = 1;
                }
            }
        }
    }
    return status;
}


function returnId(i, j) {

    //console.log("i: " + i + "j: " + j);


    /*
        i/8
        i%8
    */
    //Contrario disto

    let count = 0;
    while (i > 0) {
        count += 8;
        i--;
    }

    count += j;
    return count;
}

function updateColor(i, j) {
    if (((i - 1) >= 0 && PosColor[i - 1][j] == "null")) {
        PosColor[i - 1][j] = "possivel";
    }

    if ((j - 1) >= 0 && PosColor[i][j - 1] == "null") {
        PosColor[i][j - 1] = "possivel";
    }

    if ((j + 1) <= 7 && PosColor[i][j + 1] == "null") {
        PosColor[i][j + 1] = "possivel";
    }

    if (((i + 1) <= 7 && PosColor[i + 1][j] == "null")) {
        PosColor[i + 1][j] = "possivel";
    }
}

function swapTurn() {
  if(Turn.cor == "black") {
  document.getElementById("PlayerTurn").innerHTML = "White turn";
} else {
  document.getElementById("PlayerTurn").innerHTML = "Black turn";
}
    if (Turn == Player1) {
        Turn = Player2;
    } else {
        Turn = Player1;
    }
}
