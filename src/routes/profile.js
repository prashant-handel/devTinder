const express = require('express');
const { userAuth } = require('../middlewares/auth');
const User = require('../models/user');
const { validateProfileEditData } = require('../utils/validation');
const bcrypt = require('bcrypt');
const validator = require('validator');

router = express.Router();

router.get('/profile/view', userAuth, async (req, res) => {
    try {
        const currentUser = req.user;
        res.send(currentUser);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

router.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        validateProfileEditData(req);

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });
        res.json({
            message: 'Profile updated successfully',
            data: loggedInUser
        });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

router.patch('/profile/password', userAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword} = req?.body;
        const loggedInUser = req?.user;

        isCorrectPassword = await bcrypt.compare(oldPassword, loggedInUser.password);
        if(!isCorrectPassword) {
            return res.status(400).json({
                message: 'Incorrect password',
                status: false
            });
        }

        if(!validator.isStrongPassword(newPassword, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
            return res.status(400).json({
                message: 'Enter a strong password',
                status: false
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        loggedInUser.password = hashedPassword;
        await loggedInUser.save();
        res.json({
            message: 'Password updated successfully',
            status: true
        });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
})

module.exports = router;