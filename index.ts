import express from 'express';
import http from 'http';
import { Socket } from 'socket.io';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

let roomCode: string = '';

app.get('/room/:roomCode', (req, res) => {
    roomCode = req.params.roomCode;
    res.sendFile(__dirname + '/public/room/minesweeper.html');
});

const server = http.createServer(app);
const io = require('socket.io')(server);

interface Room {
    roomCode: string;
    players: Player[];
}

interface Player {
    nickname: string;
}

const rooms: { [ roomCode: string ]: Room } = {};

io.on('connection', (socket: Socket) => {
    let playerName = '';

    // Find or create a new room from the room code
    if (!!!rooms[roomCode])
        rooms[roomCode] = { roomCode, players: [] };
        
    const room = rooms[roomCode];

    // Send this socket to that new room
    socket.join(roomCode);
    
    // When the socket emits a name, it means the player is joining the lobby
    // So, update the players and send the new data to everyone else so they see the new player
    socket.on('name', (nickname: string) => {
        room.players.push({ nickname });
        io.to(roomCode).emit('playerdata', room.players);
        playerName = nickname;
    });

    // Activates when a player explores a square
    // Tells other sockets to show that square as clicked
    type Coord = { i: number, j: number };
    socket.on('explore', (coord: Coord) => {
        socket.to(roomCode).broadcast.emit('explore', coord);
    });
});

server.listen(3000);
console.log(`Listening on port ${PORT}`);