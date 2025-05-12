const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ['accepted', 'rejected', 'ignored', 'interested'],
            message: '{VALUE} is not supported!',
            required: true
        }
    }
},
{
    timestamps: true
});

connectionRequestSchema.index({fromUserId: 1, toUserId: 1});

connectionRequestSchema.pre('save', function(next) {
    const request = this;

    if(request?.toUserId.equals(request?.fromUserId)) {
        throw new Error('from user id and to user id are same');
    }
    next();
});

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);