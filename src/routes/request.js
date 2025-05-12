const express = require('express');

const router = express.Router();

router.post('/sendConnectionRequest', async (req, res) => {
    const user = req.user;
    res.send(user, ' sent a connection request');
})

module.exports = router;