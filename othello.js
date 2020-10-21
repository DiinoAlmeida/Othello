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
function gameon() {
    "use strict";
    document.getElementById("Status").style.display = 'block';
    document.getElementById("Config").style.display = 'block';
    document.getElementById("myBtn").style.display = 'block';


    /*const board = document.getElementsByClassName("board");*/
    const board = document.createElement("div");
    board.className = "board";


    for (var i = 0; i < 64; i++) {
        const square = document.createElement("div");
        square.className = "square";
        board.appendChild(square);
    }
    document.body.appendChild(board);
}
