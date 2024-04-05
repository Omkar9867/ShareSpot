// const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error');
const User = require('../models/userModel');

const getUsers = async (req, res, next) => {
    let users
    try {
        users = await User.find({}, '-password'); // it can be User.find({}, 'email name') also
    } catch (error) {
        const err = new HttpError('Fetching users failed, please try again later',500);
        return next(err);
    }
    res.json({ users: users.map(u => u.toObject({getters: true})) });
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please check data', 422));
    }

    const { name, email, password } = req.body;

    let existingUser
    try {
        existingUser = await User.findOne({ email: email });
        if (existingUser) {
            const err = new HttpError('Email Id already exist, try to login', 422);
            return next(err)
        };
        existingUser = new User({
            name, // name: name
            email, // email: email
            password, // password: password
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVMAgWVsREWm087nqxYIQDBW__Sx79sbO49Q&s',
            places: []
        });
        await existingUser.save()
    } catch (error) {
        const err = new HttpError('Signing up Failed, please try again');
        return next(err);
    }

    res.status(201).json({ user: existingUser.toObject({ getters: true }) });
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser

    try {
        existingUser = await User.findOne({ email: email });
        if (!existingUser || existingUser.password !== password) {
            const err = new HttpError('Invalid credentials, could not log you in!', 401);
            return next(err)
        };
    }
    catch (error){
        const err = new HttpError('Login Failed, please try again');
        return next(err);
    }

    res.json({ message: 'LoggedIn' , user: existingUser.toObject({ getters: true })})
}


exports.getUsers = getUsers;
exports.login = login;
exports.signup = signup;