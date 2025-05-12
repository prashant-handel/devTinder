const express = require('express');
const { validateSignupData } = require('../utils/validation');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const validator = require('validator');

router = express.Router();

router.post('/signup', async (req, res) => {
    try { 
        // validate the data
        validateSignupData(req);

        // encrypt the password
        const { password } = req?.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User ({
            ...req.body,
            password: passwordHash
        });
        const result = await user.save();
        res.send('User created successfully');
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if(!emailId || !password) {
            const errorObj = {
                status: false,
                message: 'Please fill all the fields'
            };
            throw new Error(JSON.stringify(errorObj));
        };
        if(!validator.isEmail(emailId)) {
            const errorObj = {
                status: false,
                message: 'Invalid credentials'
            }
            throw new Error(JSON.stringify(errorObj));
        };

        const user = await User.findOne({
            emailId
        });

        const isPasswordValid = await user.validatePassword(password);
        if(!isPasswordValid) {
            const errorObj = {
                status: false,
                message: 'Invalid credentials'
            }
            throw new Error(JSON.stringify(errorObj));
        }

        const token = await user?.getJWT();

        res.cookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }); // expires in 7 days
        res.send({
            status: true,
            message: 'Login successful',
            userId: user?._id
        })
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        res.send({
            status: true,
            message: 'Logout successful'
        });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;