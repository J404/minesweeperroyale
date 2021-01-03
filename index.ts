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

// Types
import { Board, Square, createBoard } from './msutil';

interface Room {
    roomCode: string;
    board: Board;
    players: Player[];
}

interface Player {
    nickname: string;
    color: string;
}

const rooms: { [ roomCode: string ]: Room } = {};

io.on('connection', (socket: Socket) => {
    let playerName = '';

    // Create a new room if necessary
    if (!!!rooms[roomCode]) {
        const board = createBoard();
        rooms[roomCode] = { roomCode, board, players: [] };
    }
        
    const room = rooms[roomCode];

    // Send this socket to that new room
    socket.join(roomCode);
    
    // When the socket emits a name, it means the player is joining the lobby
    socket.on('name', (nickname: string) => {

        // Generate random hex color for this player
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        
        let hexR = r.toString(16);
        let hexG = g.toString(16);
        let hexB = b.toString(16);
        
        hexR = (hexR.length === 1) ? '0' + hexR : hexR;
        hexG = (hexG.length === 1) ? '0' + hexG : hexG;
        hexB = (hexB.length === 1) ? '0' + hexB : hexB;

        const color = '#' + hexR + hexG + hexB;

        // Update their name to the room
        room.players.push({ nickname, color });

        // Send the data to other players
        io.to(roomCode).emit('playerdata', room.players);

        // Identify this socket with the nickname
        playerName = nickname;

        // Send the new player a copy of the board
        io.to(roomCode).emit('boarddata', room.board);
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