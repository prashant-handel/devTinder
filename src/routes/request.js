const express = require('express');
const router = express.Router();
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

router.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req?.user?._id;
        const toUserId = req?.params?.toUserId;
        const status = req?.params?.status;

        const validStatus = ['ignored', 'interested'];

        const toUser = await User.findById(toUserId);


        if(!toUser) {
            throw new Error({
                message: 'User not found',
                status: false
            })
        }

        if(!validStatus?.includes(status)) {
            return res.status(400).json({
                message: "Invalid Status",
                status: false
            });
        }

        const isExistingRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId,toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        });

        if(isExistingRequest) {
            return res.status(400).json({
                message: 'Connection request already exists!',
                status: false
            })
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save();

        res.json({
            message: `Profile ${status} successfully`,
            data
        });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedInUser = req?.user;
        const allowedStatus = ['accepted', 'rejected'];
        const { status, requestId } = req?.params;

        if(!allowedStatus?.includes(status)) {
            return res.status(400).json({
                message: "Invalid Status",
                status: false
            });
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser?._id,
            status: "interested"
        });

        if(!connectionRequest) {
            return res.status(404).json({
                message: 'Connection request not found!',
                status: false
            })
        }

        connectionRequest.status = status;
        const data = connectionRequest.save();
        
        res.json({
            message: `Connection request ${status} successfully`,
            status: true
        })
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;