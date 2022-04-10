const Router = require('express');
const router = new Router();
const controller = require('../controllers/authController');
const {check} = require('express-validator');

router.post('/registration', [
    check('username', 'Username cannot be empty').notEmpty(),
    check('password', 'Password must be at least 8 characters').isLength({min: 8})
], controller.registration);

router.post('/authorization', controller.login);

router.get('/cookie', controller.getCookie);

router.get('/logout', controller.removeCookie);

module.exports = router;