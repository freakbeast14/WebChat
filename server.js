const express = require('express');
const socketIO = require('socket.io');
const formatMsg = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require('./utils/users');

const app = express();
const port = process.env.PORT || 3000;

const botName = 'JustChat Bot';
//static files
app.use(express.static('public'));

//server listening
const server = app.listen(port, () => {
    console.log(`Server listening to port ${port}`);
});

//setup socket
const io = socketIO(server);

//setup connection
io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);

    //when user sends msg in a room
    socket.on('chatMessage', (data) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMsg(user.username, data));
    });

    //when user joins a room
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id,username,room);
        //join the user to that room
        socket.join(user.room);

        //welcome the user
        socket.emit('message',formatMsg(botName, `${user.username}, Welcome to ${user.room}!`));

        //notify other users in the room 
        socket.broadcast.to(user.room).emit('message', formatMsg(botName, `${user.username} has joined the chat`));

        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    
    //when user disconnects or leaves the room
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        //user has left the chat
        if(user){
            io.to(user.room).emit('message', formatMsg(botName,`${user.username} has left the chat`));
        }

        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});
