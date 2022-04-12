const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const {secret} = require('../config');

const generateAccessToken = (id, roles) => {
    const payload = { id, roles };
    return jwt.sign(payload, secret, {expiresIn: '1h'});
}

class authController {
    async registration(msg, ws) {
        try {
            const {username, password} = msg.body;
            const person = await User.findOne({username});
            if(person) {
                ws.send(JSON.stringify({message: `${username} already exists`, type: 'error'}));
                return;
            }

            const hashPassword = bcrypt.hashSync(password, 6);
            const userRole = await Role.findOne({value: "USER"});
            const user = new User({username, password: hashPassword, roles: [userRole.value]});

            await user.save();
            ws.send(JSON.stringify({message: 'Successfully registered'}));
        }
        catch (e) {
            console.log(e);
            ws.send(JSON.stringify({message: 'Registration error', type: 'error'}));
        }
    }

    async login(msg, ws) {
        try {
            const {username, password} = JSON.parse(msg.body);
            const user = await User.findOne({username});
            if(!user) {
                ws.send(JSON.stringify({message: `Couldn't find user ${username}`, type: 'error'}));
                return;
            }

            const validPassword = bcrypt.compareSync(password, user.password);
            if(!validPassword) {
                ws.send(JSON.stringify({message: 'Wrong password', type: 'error'}));
                return;
            }

            const token = generateAccessToken(user._id, user.roles);

            ws.send(JSON.stringify({message: `Welcome, ${username}!`, response: 'login', token: token}));
        }
        catch (e) {
            console.log(e);
            ws.send(JSON.stringify({message: 'Login error', type: 'error'}));
        }
    }

    async getCookie(msg, ws) {
        try {
            const token = JSON.parse(msg.body).token;

            if(token) {
                ws.send(JSON.stringify({response: 'token', value: token }));
            }

            ws.send(JSON.stringify({response: 'token', value: null }));
        }
        catch (e) {
            console.log(e);
            ws.send(JSON.stringify({message: `Couldn't get cookie`, type: 'error'}));
        }
    }

    async removeCookie(msg, ws) {
        try {
            ws.send(JSON.stringify({response: 'token', value: null }));
        }
        catch (e) {
            console.log(e);
            ws.send(JSON.stringify({message: `Couldn't get cookie`, type: 'error'}));
        }
    }
}

module.exports = new authController;