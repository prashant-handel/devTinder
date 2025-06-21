const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req, res, next) => {
    try {
        const { token } = req?.cookies;
        if(!token) {
            const errorObj = {
                status: false,
                message: 'Please login to continue'
            };
            throw new Error(JSON.stringify(errorObj));
        }


        const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = decodedObj;

        const user = await User.findById(_id);

        if(!user) {
            throw new Error("User not found");
        }
 
        req.user = user;
        next();
}
catch (err) {
    res.status(400).send(err.message);
}
}

module.exports = {
    userAuth
}