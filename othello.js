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

    if (radioCor[0].checked) {
        Player1.cor = "black";
        Player2.cor = "white";
        document.getElementById("PlayerTurn").innerHTML = "Black turn";
        Turn = Player1;
    } else {
        Player1.cor = "white";
        Player2.cor = "black";
        Turn = Player2;
        bestMove();
        document.getElementById("PlayerTurn").innerHTML = "White turn";
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

    document.getElementById("DiscosB").innerHTML = "Discos brancos: " + Player1.Npecas;
    document.getElementById("DiscosP").innerHTML = "Discos pretos: " + Player2.Npecas;


}


function bestMove() {

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (PosColor[i][j] != Turn.cor && (analiseNeighbors(i, j, 1) == 1)) {
                document.getElementById(returnId(i, j)).disabled = "true";
                swapTurn(); // Jogador

                if (EndGame() == true) { //Verficar se jogador pode jogar
                    swapTurn();
                    if (EndGame() == true) { // Verificar se IA pode jogar 
                        window.alert("O JOGO ACABOU!!");
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
        if (EndGame() == false) { // Se a IA puder jogar joga, caso contrario passa a jogada
            setTimeout(bestMove, 2000);
        } else {
            swapTurn(); //Jog
            if(EndGame() == true){
                window.alert("O JOGO ACABOU!!");
            }else{
                 console.log("A ai passou a jogada");
            }
           
        }
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


    status = analiseNeighbors(count, indice, 1);

    //console.log(status);

    return status;
}


//Se mudar alguma peça do adversário retorna 1 caso contrário retorna -1
//Option serve para indicar se é só para observar se há jogada ou se também é para jogar!
// Option == 1 -> Jogar.
// Option == 2 -> Observar.
function analiseNeighbors(i, j, option) {

    let status = -1;

    if (PosColor[i][j] != "null") {
        return status;
    }

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

                if (r >= 0 && c >= 0 && r <= 7 && c <= 7 && PosColor[r][c] == Turn.cor && count >= 1) {

                    if (option == 1) {
                        while (count != -1) {
                            r = r - dr;
                            c = c - dc;
                            z = returnId(r, c);
                            document.getElementById(z).style.backgroundColor = Turn.cor;
                            PosColor[r][c] = Turn.cor;
                            Turn.Npecas++;
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

function swapTurn() {

    //Compor este ciclo!!
    if (Turn == Player1) {
        document.getElementById("PlayerTurn").innerHTML = "White turn";
        Turn = Player2;
    } else {
        document.getElementById("PlayerTurn").innerHTML = "Black turn";
        Turn = Player1;
    }
}

function EndGame() {

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (PosColor[i][j] == "null" && (analiseNeighbors(i, j, 0) == 1)) {
                return false;
            }
        }
    }


    return true;
}

function skipTurn() {
    if (EndGame() == false) {
        console.log("Ainda podes jogar!");
    } else {
        swapTurn();
        bestMove();
    }
}
