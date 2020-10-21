// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}




/*
    PlayersPos [] -> indica o "dono" de cada quadrado. Vai ser usado para decidir se há jogadas possíveis ou não.
    
    2 -> Discos Pretos
    1 -> Discos Brancos
    
    NPlayer1 e NPlayer2 Nº total de peças de cada jogador
    
    O player1 vai ser sempre o primeiro a jogar e é o das peças pretas
*/

var PlayersPos = new Array (64);
var NPlayer1 = 2;
var NPlayer2 = 2;
var Turn = "Player2";

for(let i = 0; i < 64; i++){
    PlayersPos[i] = 0;    
}

//Posições iniciais
PlayersPos[28] = 2;
PlayersPos[35] = 2;
PlayersPos[27] = 1;
PlayersPos[36] = 1;

console.log(PlayersPos);

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
    
    const cells = document.querySelectorAll(".square");
    
    document.getElementById("28").style.backgroundColor = "black"; 
    document.getElementById("35").style.backgroundColor = "black"; 
    document.getElementById("27").style.backgroundColor = "white"; 
    document.getElementById("36").style.backgroundColor = "white";
    
    for (let i = 0; i < cells.length; i++) {
        if(i !=  28 && i != 35 && i != 27 && i != 36){
            cells[i].addEventListener('click', turnClick,);
        }
	}
      
}


function turnClick(square) {
    if(Turn == "Player1"){
        document.getElementById(square.target.id).style.backgroundColor = "black";
    }else{
        document.getElementById(square.target.id).style.backgroundColor = "white";
    }
}


