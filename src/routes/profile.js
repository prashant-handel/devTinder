const express = require('express');
const { userAuth } = require('../middlewares/auth');

router = express.Router();

router.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;