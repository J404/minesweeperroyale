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
socket.on('explore', ({ i, j }) => {
  const spot = board[i][j];
  spot.click(false);
});