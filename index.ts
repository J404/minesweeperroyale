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
import { Board, Square, createBoard } from './utils/msutil';
import { Room, determineRankings, isGameOver } from './utils/util';

const rooms: { [ roomCode: string ]: Room } = {};

io.on('connection', (socket: Socket) => {
    let playerName = '';
    let color = '';
    let playerIndex = 0;

    // Create a new room if necessary
    if (!!!rooms[roomCode]) {
        rooms[roomCode] = { 
            roomCode, 
            board: [] as Square[][], 
            players: [], 
            active: false 
        };
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

        color = '#' + hexR + hexG + hexB;

        // Update their name to the room, determine if they're the first player/host
        playerIndex = room.players.length;
        room.players.push({ 
            nickname, 
            color, 
            score: 0, 
            alive: true,
            ingame: false,
            isHost: room.players.length === 0,
        });

        // Send the data to other players
        io.to(roomCode).emit('playerdata', room.players);

        // Identify this socket with the nickname
        playerName = nickname;
    });
    
    // Receive gamestart from host, carry on the message to clients, reset old game if necessary
    socket.on('gamestart', () => {
        // Reset and send board
        room.board = createBoard();
        io.to(roomCode).emit('boarddata', room.board);

        // Reset player stats
        for (let player of room.players) {
            player.score = 0;
            player.alive = true;
            player.ingame = true;
        }
        io.to(roomCode).emit('playerdata', room.players);

        // Send game start event
        io.to(roomCode).emit('gamestart');
        
        // Set the game to active
        room.active = true;
    });

    type Coord = { i: number, j: number };

    // Activates when a player explores a square
    // Tells other sockets to show that square as clicked
    socket.on('explore', (coord: Coord) => {
        socket.to(roomCode).broadcast.emit('explore', { coord, color });
    });
    
    // When client places a new flag
    socket.on('flag', (coord: Coord) => {
        socket.to(roomCode).broadcast.emit('flag', { coord, color });
    });

    // When client's score updates
    socket.on('playerdata', (score: number) => {
        room.players[playerIndex].score += score;
    });
    
    // When a client alerts their death
    socket.on('deathdata', () => {
        room.players[playerIndex].alive = false;
        socket.to(roomCode).broadcast.emit('deathdata', { playerName, playerIndex });
        
        if (isGameOver(room)) {
            io.to(roomCode).emit('gameover', { rankings: determineRankings(room) });
        }
    });
    
    // When a client alerts that the game is complete
    socket.on('gameover', () => {
        const rankings = determineRankings(room);
        io.to(roomCode).emit('gameover', { rankings });
        room.active = false;
    });
});

server.listen(3000);
console.log(`Listening on port ${PORT}`);