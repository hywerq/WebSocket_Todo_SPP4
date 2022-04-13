const express = require('express');
const mongoose = require('mongoose');
const cookie = require('cookie-parser');
const cors = require('cors');
const ws = require('ws');
const {mongoDB} = require('../server/config');
const clientHandler = require('./handlers/clientHandler');
const todoHandler = require('./handlers/todoHandler');
const fileRouter = require('./handlers/fileHandler')

const app = express();
const PORT = process.env.PORT || 5000;

const wss = new ws.WebSocketServer({
    port: PORT,
    maxPayload: 50000
}, () => { console.log(`Server has been started on port ${PORT}...`)});

app.use(express.urlencoded({
    extended: true
}));

app.use(cors());
app.use(cookie());
app.use(express.json());
app.use('/file', fileRouter);

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        msg = JSON.parse(msg);
        switch (msg.method) {
            case 'alert':
                clientHandler.alertBroadcast(ws, wss, msg);
                break;

            case 'login':
                clientHandler.login(ws, msg);
                break;

            case 'register':
                clientHandler.register(ws, msg);
                break;

            case 'logout':
                clientHandler.logout(ws, msg);
                clientHandler.alertBroadcast(ws, wss, msg);
                break;

            case 'get-todo':
                todoHandler.getTodos(ws, msg);
                break;

            case 'add-todo':
                todoHandler.newTodo(ws, msg);
                break;

            case 'change-todo':
                todoHandler.changeTodo(ws, msg);
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

run()