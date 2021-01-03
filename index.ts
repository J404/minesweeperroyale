import express from 'express';
import http from 'http';
import { Socket } from 'socket.io';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

let roomCode: string | undefined = undefined;

app.get('/room/:roomCode', (req, res) => {
    roomCode = req.params.roomCode;
    res.sendFile(__dirname + '/public/room/minesweeper.html');
});

const server = http.createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket: Socket) => {
    console.log('user connected');

    if (roomCode)
        socket.join(roomCode);
    
    type Coord = { i: number, j: number };
    socket.on('explore', (coord: Coord) => {
        socket.broadcast.emit('explore', coord);
    });
});

server.listen(3000);
console.log(`Listening on port ${PORT}`);