import express from 'express';
import http from 'http';

const PORT = process.env.PORT || 3000;
const app = express();

const io = require('socket.io')(http.createServer(app));

app.use(express.static('public'));

app.listen(3000);
console.log(`Listening on port ${PORT}`);