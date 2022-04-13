const authController = require('../controllers/authController');

exports.alertBroadcast = (ws, wss, msg) => {
    ws.id = msg.id;
    wss.clients.forEach(client => {
        if(client.id !== msg.id) {
            client.send(JSON.stringify({message: msg.message}));
        }
    })
}

exports.login = (ws, msg) => {
    authController.login(msg, ws);
}

exports.register = (ws, msg) => {
    authController.registration(msg, ws);
}

exports.logout = (ws, msg) => {
    authController.removeCookie(msg, ws);
}