const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookie = require('cookie-parser');
const cors = require('cors');
const ws = require('ws');
const {mongoDB} = require('../server/config');
const authController = require('./controllers/authController');
const todoController = require('./controllers/todoController');

const PORT = process.env.PORT || 5000;

const wss = new ws.WebSocketServer({
    port: PORT,
    maxPayload: 100
}, () => { console.log(`Server has been started on port ${PORT}...`)});

app.use(express.urlencoded({
    extended: true
}));

app.use(cors());
app.use(cookie());
app.use(express.json());

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        msg = JSON.parse(msg);
        switch (msg.method) {
            case 'connection':
                connectionHandler(ws, msg);
                break;
            case 'login':
                loginHandler(ws, msg);
                break;
            case 'register':
                registrationHandler(ws, msg);
                break;
            case 'logout':
                logoutHandler(ws, msg);
                break;
            case 'get-todo':
                todoHandler(ws, msg);
                break;
            case 'add-todo':
                newTodoHandler(ws, msg);
                break;
            case 'change-todo':
                changeTodoHandler(ws, msg);
                break;
        }
    });
});

const run = async () => {
    try {
        mongoose.connect(mongoDB).catch(err => console.log(err));
    }
    catch (err) {
        console.log(err);
    }
}

const connectionHandler = (ws, msg) => {
    ws.id = msg.id;
    broadcastConnection(ws, msg);
}

const broadcastConnection = (ws, msg) => {
    wss.clients.forEach(client => {
        if(client.id !== msg.id) {
            client.send(JSON.stringify({message: `User ${msg.username} connected`}));
        }
    })
}

const loginHandler = (ws, msg) => {
    authController.login(msg, ws);
}

const todoHandler = (ws, msg) => {
    todoController.getAllTodos(msg, ws);
}

const newTodoHandler = (ws, msg) => {
    todoController.addNewTodo(msg, ws);
}

const changeTodoHandler = (ws, msg) => {
    todoController.changeTodoStatus(msg, ws);
}

const registrationHandler = (ws, msg) => {
    authController.registration(msg, ws);
}

const logoutHandler = (ws, msg) => {
    authController.removeCookie(msg, ws);
}

run()