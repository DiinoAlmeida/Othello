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

//Create a 2d array and set every position equal to null
var PosColor = new Array(8);

for (let i = 0; i < 8; i++) {
    PosColor[i] = new Array(8);
    for (let j = 0; j < 8; j++) {
        PosColor[i][j] = "null";
    }
}

console.log(PosColor);


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
        Turn = Player1;

    } else {
        Player1.cor = "white";
        Player2.cor = "black";
        Turn = Player2;
        bestMove();
    }
}


//Cores iniciais
PosColor[3][3] = "white";
PosColor[4][4] = "white";
PosColor[3][4] = "black";
PosColor[4][3] = "black";
//PosColor[2][2] = PosColor[2][3] = PosColor[2][4] = PosColor[2][5] = PosColor[3][2] = PosColor[3][5] = PosColor[4][2] = PosColor[4][5] = PosColor[5][2] = PosColor[5][3] = PosColor[5][4] = PosColor[5][5] = "possivel";

//console.log(PosColor);

function gameon() {
    "use strict"; //????
    document.getElementById("Status").style.display = 'block';
    document.getElementById("Config").style.display = 'block';
    document.getElementById("myBtn").style.display = 'block';

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

    for (let i = 0; i <= 7; i++) {
        for (let j = 0; j <= 7; j++) {
            if (analiseNeighbors(i, j) == 1) {
                //console.log(Turn.id + "    " + Turn.cor);
                cells[returnId(i, j)].removeEventListener('click', turnClick);


                /*
                    cell.onclick ((P) => {
                        return () => turnClick (P)
                    } )(i);
                    Exemplo no jogo do galo. 
                */


                return;
            }
        }
    }
}


//ALterar esta função, pois se o primeiro jogador a jogar for o player2 o bestMove() é logo executado.
function turnClick(square) {

    if (Turn == Player2) {
        setTimeout(bestMove, 2000);
        swapTurn();
        playMove(square.target.id);
        swapTurn();
    } else {
        if (playMove(square.target.id) == 1) {
            setTimeout(bestMove, 2000);
            swapTurn();
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


    status = analiseNeighbors(count, indice);


    return status;
}


//Não está beeemm!!
//Se mudar alguma peça do adversário retorna 1 caso contrário retorna -1
//Pode ser otimizada de modo a libertar recursos mas funciona
function analiseNeighbors(i, j) {

    let count = 0;
    let status = -1;

    console.log(i + "   " + j);
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            
            let r = i + dr;
            let c = j + dc;
            
            if ((dc == 0 && dr == 0) || (PosColor[r][c] == "null")) {
                continue;
            } else {
                
                
                while(PosColor[r][c] != Turn.cor && PosColor[r][c] != "null"){
                    r +=  dr;
                    c +=  dc;
                    count++;
                    console.log("r: " + r + "    c: " + c);
                    console.log( "cor: " + PosColor[r][c] + "    " + Turn.cor );
                    
                }
     
                if (PosColor[r][c] == Turn.cor) {
                    while (count != -1) {
                        r = r - dr;
                        c = c - dc;
                        z = returnId(r, c);
                        document.getElementById(z).style.backgroundColor = Turn.cor;
                        PosColor[r][c] = Turn.cor;
                        Turn.Npecas++;
                        count--;
                    }
                    status = 1;
                }

            }

        }


       


    }
     return status;
}







    /*
    let status = -1;
    let z;


    //Podemos começar logo no numero a seguir a posição que queremos.
    //E antes de verificarmos a condição se é cor verificamos se é null ou possivel, se for um desses paramos logo a pesquisa.


    //Vertical up ]}
    for (let x = i; x >= 0; x--) {
        if (PosColor[x][j] == Turn.cor && (i - x) > 1) { //Testar cor das peças
            while (x <= i) { //corrigir cor do meio.
                z = returnId(x, j);
                document.getElementById(z).style.backgroundColor = Turn.cor;
                PosColor[x][j] = Turn.cor;
                Turn.Npecas++;
                x++;
            }
            status = 1;
            break;
        }
    }

    //Vertical down
    for (let x = i; x <= 7; x++) {
        if (PosColor[x][j] == Turn.cor && (x - i) > 1) { //Testar cor das peças
            while (x >= i) { //corrigir cor do meio.
                z = returnId(x, j);
                document.getElementById(z).style.backgroundColor = Turn.cor;
                PosColor[x][j] = Turn.cor;
                Turn.Npecas++;
                x--;
            }
            status = 1;
            break;
        }
    }

    //Horizontal left
    for (let x = j; x >= 0; x--) {
        if (PosColor[i][x] == Turn.cor && (j - x) > 1) { //Testar cor das peças
            while (x <= j) { //corrigir cor do meio.
                z = returnId(i, x);
                document.getElementById(z).style.backgroundColor = Turn.cor;
                PosColor[i][x] = Turn.cor;
                Turn.Npecas++;
                x++;
            }
            status = 1;
            break;
        }
    }



    //Horizontal right
    for (let x = j + 1; x <= 7; x++) {
        if (PosColor[i][x] == Turn.cor && (x - j) > 1) { //Testar cor das peças
            x--;
            while (x >= j) { //corrigir cor do meio.
                z = returnId(i, x);
                console.log(z);
                document.getElementById(z).style.backgroundColor = Turn.cor;
                PosColor[i][x] = Turn.cor;
                Turn.Npecas++;
                x--;
            }
            status = 1;
            break;
        }
    }



    let x = i,
        y = j;

    //Diagonal up right
    while ((x >= 0) && (y <= 7)) { //Testar cor das peças
        if (PosColor[x][y] == Turn.cor && (i - x) > 1 && (y - j) > 1) {
            while ((x <= i) && (y >= j)) { //corrigir cor do meio.
                z = returnId(x, y);
                document.getElementById(z).style.backgroundColor = Turn.cor;
                PosColor[x][y] = Turn.cor;
                Turn.Npecas++;
                x++;
                y--;
            }
            status = 1;
            break;
        }
        x--;
        y++;
    }

    x = i, y = j;

    //Diagonal up left
    while ((x >= 0) && (y >= 0)) { //Testar cor das peças
        if (PosColor[x][y] == Turn.cor && (i - x) > 1 && (j - y) > 1) {
            while ((x <= i) && (y >= j)) { //corrigir cor do meio.
                z = returnId(x, y);
                document.getElementById(z).style.backgroundColor = Turn.cor;
                PosColor[x][y] = Turn.cor;
                Turn.Npecas++;
                x++;
                y++;
            }
            status = 1;
            break;
        }
        x--;
        y--;
    }

    x = i, y = j;

    //Diagonal down right
    while ((x <= 7) && (y <= 7)) { //Testar cor das peças
        if (PosColor[x][y] == Turn.cor && (x - i) > 1 && (y - j) > 1) {
            while ((x >= i) && (y >= j)) { //corrigir cor do meio.
                z = returnId(x, y);
                document.getElementById(z).style.backgroundColor = Turn.cor;
                PosColor[x][y] = Turn.cor;
                Turn.Npecas++;
                x--;
                y--;
            }
            status = 1;
            break;
        }
        x++;
        y++;
    }

    x = i, y = j;

    //Diagonal down left 
    while ((x <= 7) && (y >= 0)) { //Testar cor das peças
        if (PosColor[x][y] == Turn.cor && (x - i) > 1 && (j - y) > 1) {
            while ((x >= i) && (y <= j)) { //corrigir cor do meio.
                z = returnId(x, y);
                document.getElementById(z).style.backgroundColor = Turn.cor;
                PosColor[x][y] = Turn.cor;
                Turn.Npecas++;
                x--;
                y++;
            }
            status = 1;
            break;
        }
        x++;
        y--;
    }


    if (status == 1) {
        updateColor(i, j);
    }

    return status;
    }

    */

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
        console.log(count);
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
        if (Turn == Player1) {
            Turn = Player2;
        } else {
            Turn = Player1;
        }
    }
