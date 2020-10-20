function gameon() {
    "use strict";
    document.getElementById("Status").style.display = 'block';
    document.getElementById("Config").style.display = 'block';
    
    
    /*const board = document.getElementsByClassName("board");*/
    const board = document.createElement("div");
    board.className = "board";
    

for(var i= 0; i < 64; i++){
    const square = document.createElement("div");
    square.className = "square";
    board.appendChild(square);
}
    document.body.appendChild(board);
}





