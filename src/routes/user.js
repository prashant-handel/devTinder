const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const router = express.Router();
const User = require('../models/user');

const SAFE_USER_DATA = ["firstName", "lastName", "age", "photoUrl", "gender", "skills", "about"];

// get all connection requests for logged in user
router.get('/user/pendingRequests', userAuth, async (req, res) => {
    try {
        const loggedInUser = req?.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser?._id,
            status: 'interested'
        }).populate("fromUserId", SAFE_USER_DATA);
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
        }).populate("fromUserId", SAFE_USER_DATA)
        .populate("toUserId", );

        const dataToSend = connections.flatMap(item => [item.fromUserId, item.toUserId])
        .filter(user =>{
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
});

router.get('/feed', userAuth, async (req, res) => {
    try {
        const loggedInUser = req?.user;

        let limit = parseInt(req?.query?.limit) || 10;
        limit = (limit > 50) ? 50 : limit;
        const page = parseInt(req?.query?.page) || 1;

        const skip = (page-1)*limit; 
        
        const allUserConnections = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser?._id},
                {toUserId: loggedInUser?._id}
            ]
        });

        const usersToHide = new Set();

        allUserConnections?.map((item) => {
            usersToHide.add(item?.toUserId.toString());
            usersToHide.add(item?.fromUserId.toString());
        });

        const users = await User.find({
            $and : [
                {_id: { $ne: loggedInUser?._id} }, // remove the logged in user
                {_id: { $nin: Array.from(usersToHide)} } // remove previous connections
            ]
        }).select(SAFE_USER_DATA)
        .skip(skip)
        .limit(limit);

        res.send({
            data: users,
            status: true
        });

    }
    catch (err) {
        res.status(500).send(err.message);
    }
})

module.exports = router;