const { Socket } = require('dgram');
const express = require('express');
const app = express();
const server = require('http').Server(app); // this allows us create a server to use socket.io
const io = require('socket.io')(server); // this allows io to determine which server we are using
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`${uuidV4()}`); // this allows us to genreate random different chat rooms
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId); // this will tell the server to send to every client that is in roomNo except the current socket. So, that message will not be sent to the current socket, but to other sockets in the room. I set up a test app and verified this is the behavior.
        socket.on('disconnet', () => {
            socket.broadcast.to(roomId).emit('user-disconnected');
        });
    });
});

server.listen(3000, () => {
    console.log('Server listening on PORT 3000.');
});
