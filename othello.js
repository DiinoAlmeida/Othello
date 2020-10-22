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
    PlayersPos [] -> indica o "dono" de cada quadrado. Vai ser usado para decidir se há jogadas possíveis ou não.
    
    2 -> Discos Pretos
    1 -> Discos Brancos
    
    Temos dois jogadores. Player1 e player2. O player1 vai escolher a sua cor nas opções
    A AI vai ser sempre o Player2
*/



class Player {

    constructor(id, Npecas) {
        this.id = id;
        this.Npecas = Npecas;
        this.cor = null;
    }

}

var PosColor = new Array(64);
var Player1 = new Player(1, 2);
var Player2 = new Player(2, 2);
var cells;
var Turn;


//Mudar as opções do jogo
function submit() {
    radioCor = document.getElementsByName("Cor");
    radioAdeversario = document.getElementsByName("Adversario");
    radioDificuldade = document.getElementsByName("Dificuldade");

    console.log(radioCor);

    if (radioCor[0].cheked) {
        Player1.cor = "black";
        Player2.cor = "white";
        Turn = Player1;

    } else {
        Player1.cor = "white";
        Player2.cor = "black";
        Turn = Player2;
        bestMove();
    }

    console.log(Turn);
}


for (let i = 0; i < 64; i++) {
    PosColor[i] = "null";
}

//Cores iniciais
PosColor[28] = "white";
PosColor[35] = "white";
PosColor[27] = "black";
PosColor[36] = "black";

//console.log(PlayersPos);

function gameon() {
    "use strict";
    document.getElementById("Status").style.display = 'block';
    document.getElementById("Config").style.display = 'block';
    document.getElementById("myBtn").style.display = 'block';

    /*const board = document.getElementsByClassName("board");*/
    const board = document.createElement("div");
    board.className = "board";

    for (let i = 0; i < 64; i++) {
        const square = document.createElement("div");
        square.className = "square";
        square.id = i;
        board.appendChild(square);
    }

    document.body.appendChild(board);

    cells = document.querySelectorAll(".square");

    document.getElementById("28").style.backgroundColor = "black";
    document.getElementById("35").style.backgroundColor = "black";
    document.getElementById("27").style.backgroundColor = "white";
    document.getElementById("36").style.backgroundColor = "white";

    for (let i = 0; i < cells.length; i++) {
        if (i != 28 && i != 35 && i != 27 && i != 36) {
            cells[i].addEventListener('click', turnClick, {
                once: true
            });
        }
    }
}


function bestMove() {
    let i = 0;

    while (PosColor[i] != "null") {
        i++;
    }

    document.getElementById(i).style.backgroundColor = Player2.cor;
    PosColor[i] = Player2.cor;
    Player2.Npecas++;
    cells[i].removeEventListener('click', turnClick);
}


function turnClick(square) {

    //if (itspossible()) {

    if (Turn == Player2) {
        bestMove();
        document.getElementById(square.target.id).style.backgroundColor = Turn.cor;
        PosColor[square.target.id] = Turn.cor;

        Turn.Npecas++;
        console.log(Turn);
    } else {
        document.getElementById(square.target.id).style.backgroundColor = Turn.cor;
        PosColor[square.target.id] = Turn.cor;

        Turn.Npecas++;
        console.log(Turn);
        bestMove();

    }
    //}
}

//Esta função vai decidir se onde clicamos é possivel jogar ou nao consoante as regras
function itspossible() {


}
