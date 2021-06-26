const socket = io();

const chatForm = document.querySelector('#chat-form');
const chatMsgs = document.querySelector('.chat-messages');
const output = document.querySelector('.output');
const roomName = document.querySelector('#room-name');
const userList = document.querySelector('#users');
const leaveBtn = document.querySelector('#leave-btn');
const message = document.querySelector('#msg');
const typingDiv = document.querySelector('.typing')
//get username and room name
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

//emit events

//send message
chatForm.addEventListener('submit',(e) => {
    e.preventDefault();
    let msg = e.target.elements.msg.value;
    msg = msg.trim();
    if (!msg) {return false;}
    socket.emit('chatMessage', msg);

    //clear message after sending
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//join room
socket.emit('joinRoom', {username, room});

//typing
msg.addEventListener('keypress', () => {
    socket.emit('typing',{username, room});
});

//receive data

//receive messages
socket.on('message', (msg) => {
    typingDiv.innerText = '';
    outputMsg(msg);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
});

//get rooms and users
socket.on('roomUsers', ({room, users}) => {
    OutputRoomName(room);
    OutputUsers(users);
});

//user typing
socket.on('typing', (username) => {
    typingDiv.innerText = `${username} is typing...`;
});

//functions
const outputMsg = (msg) => {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    const para = document.createElement('p');
    para.classList.add('text');
    p.innerText = msg.username;
    p.innerHTML += `<span> ${msg.time}</span>`;
    para.innerText = msg.text;
    div.appendChild(p);
    div.appendChild(para);
    output.appendChild(div); 
}

// const outputTyping = (username) => {

// }

const OutputRoomName = (room) => {
    roomName.innerText = room;
}

const OutputUsers = (users) => {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}

leaveBtn.addEventListener('click',() => {
    const leaveRoom = confirm('Are you sure you want to leave this room?');
    if(leaveRoom){
        window.location = '../index.html';
    }
});