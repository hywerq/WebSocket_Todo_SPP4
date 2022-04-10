const express = require('express');
const mongoose = require('mongoose');
const cookie = require('cookie-parser');
const cors = require('cors');
const {json} = require('express');
const {mongoDB} = require('../config');
const controller = require('./controllers/authController');

const app = express();
const WSServer = require('express-ws')(app);
const aWss = WSServer.getWss();

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({
    extended: true
}));

app.use(cors());
app.use(cookie());
app.use(express.json());

app.ws('/', (ws, req) => {
    ws.on('message', (msg) => {
        msg = JSON.parse(msg);
        switch (msg.method) {
            case 'connection':
                connectionHandler(ws, msg);
                break;
            case 'login':
                loginHandler(ws, msg);
                break;
        }
    });
});

const run = async () => {
    try {
        mongoose.connect(mongoDB).catch(err => console.log(err));

        app.listen(PORT, () => { console.log(`Server has been started on port ${PORT}...`); });
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
    aWss.clients.forEach(client => {
        if(client.id === msg.id) {
            client.send(`User ${msg.username} connected`)
        }
    })
}

const loginHandler = (ws, msg) => {
    controller.login(msg, ws);
}

run()