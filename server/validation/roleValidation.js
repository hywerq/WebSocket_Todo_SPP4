const jwt = require('jsonwebtoken');
const {secret} = require('../config');

module.exports = function (roles, msg) {
    return function () {
        try {
            const token = msg.token;

            if (!token) {
                return false;
            }

            const {roles: userRoles} = jwt.verify(token, secret);

            let flag = false;
            userRoles.forEach(role => {
                if (roles.includes(role)) {
                    flag = true;
                }
            })

            return flag;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}