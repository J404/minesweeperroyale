import express from 'express';
import http from 'http';
import { Socket } from 'socket.io';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('public'));

const server = http.createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket: Socket) => {
    console.log('user connected');
    
    type Coord = { i: number, j: number };
    socket.on('explore', (coord: Coord) => {
        socket.broadcast.emit('explore', coord);
    });
});

server.listen(3000);
console.log(`Listening on port ${PORT}`);