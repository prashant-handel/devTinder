const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const router = express.Router();

// get all connection requests for logged in user
router.get('/user/pendingRequests', userAuth, async (req, res) => {
    try {
        const loggedInUser = req?.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser?._id,
            status: 'interested'
        }).populate("fromUserId", ["firstName", "lastName", "age", "photoUrl", "gender", "skills", "about"]);
        res.json({
            data: connectionRequests,
            status: true
        })
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/user/connections', userAuth, async (req, res) => {
    try {
        const loggedInUser = req?.user;

        const connections = await ConnectionRequest.find({
            $or: [
                {
                    status: 'accepted',
                    fromUserId: loggedInUser?._id
                },
                {
                    status: 'accepted',
                    toUserId: loggedInUser?._id
                }
            ]
        }).populate("fromUserId", ["firstName", "lastName", "age", "photoUrl", "gender", "skills", "about"])
        .populate("toUserId", ["firstName", "lastName", "age", "photoUrl", "gender", "skills", "about"]);

        const dataToSend = connections.flatMap(item => [item.fromUserId, item.toUserId])
        .filter(user =>{
            console.log(`Checking user._id: ${user._id} === ${loggedInUser?._id} ?`, user._id === loggedInUser?._id);
            return !user._id?.equals(loggedInUser?._id);
        });

        res.send({
            data: dataToSend,
            status: true
        })
    }
    catch (err) {
        res.status(500).send(err.message);
    }
})

module.exports = router;