// Socket.io
const socket = io();

// Emit name to server upon joining game
let nick = prompt('Howdy sailor! Let us know what you want to be called');
socket.emit('name', nick);

// When server sends new player info
let localPlayers = [];

socket.on('playerdata', players => {
  localPlayers = players;
  app.players = localPlayers;
});

// Sends an event to the server when a spot is explored
// I and J refer to the position of the spot in the board array
function sendExplore(spotI, spotJ) {
  socket.emit('explore', { i: spotI, j: spotJ });
}

// Receive a explore event from server
// must explore/reveal square to this user
socket.on('explore', ({ i, j, }) => {
  const square = board[i][j];
  square.click(true, false);
});

// Sends a flag click to server
function sendFlag(i, j) {
  socket.emit('flag', { i, j });
}

// Receive a flag click from server
socket.on('flag', ({ i, j }) => {
  const square = board[i][j];
  square.flag();
});

// Receives new board data from server
socket.on('boarddata', serverBoard => {
  for (let i = 0; i < serverBoard.length; i++) {
    board[i] = [];
    for (let j = 0; j < serverBoard[i].length; j++) {
      const serverSqr = serverBoard[i][j];

      const square = new Square(serverSqr.i, serverSqr.j, serverSqr.x, serverSqr.y);
      square.isMine = serverSqr.isMine;
      
      board[i][j] = square;
    }
  }
  
  for (let row of board) {
    for (let square of row) {
      square.calculateAdjacentMines();
    }
  }
});