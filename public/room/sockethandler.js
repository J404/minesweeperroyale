// Socket.io
const socket = io();

// Emit name to server upon joining game
let nick = prompt('Howdy sailor! Let us know what you want to be called');
socket.emit('name', nick);
playerName = nick;

// When server sends new player info
let localPlayers = [];

socket.on('playerdata', players => {
  localPlayers = players;
  app.players = localPlayers;

  for (let player of localPlayers) {
    if (player.nickname === playerName)
      playerColor = player.color;
  }
});

/**
 * Sends updates to the server on this client's score
 * @param {number} update Update to the player's score, NOT their total score
 */
function sendScoreUpdate(update) {
  socket.emit('playerdata', update);
}

// Sends an event to the server when a spot is explored
// I and J refer to the position of the spot in the board array
function sendExplore(spotI, spotJ) {
  socket.emit('explore', { i: spotI, j: spotJ });
}

// Receive a explore event from server
// must explore/reveal square to this user
socket.on('explore', ({ coord, color }) => {
  const square = board[coord.i][coord.j];
  square.click(true, false, color);
});

// Sends a flag click to server
function sendFlag(i, j) {
  socket.emit('flag', { i, j });
}

// Receive a flag click from server
socket.on('flag', ({ coord, color }) => {
  const square = board[coord.i][coord.j];
  square.flag(color);
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