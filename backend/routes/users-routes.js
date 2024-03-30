const express = require('express');
const {check} = require('express-validator')
const router = express.Router();
const usersController = require('../controllers/users-controller');


router.get('/', usersController.getUsers);

router.post('/signup', [
    check('name').notEmpty(),
    check('email')
    .normalizeEmail() // Test@Domain.com => test@dimain.com
    .isEmail(),
    check('password').isLength({min: 6})
], usersController.signup);

router.post('/login', usersController.login);


module.exports = router