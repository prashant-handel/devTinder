const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        maxLength: 50
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: (value) => {
            if(!validator.isEmail(value)) {
                throw new Error('Invalid email ', value)
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate: (value) => {
            if(!validator.isStrongPassword(value, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
                throw new Error('Enter a strong password');
            }
        }
    },
    age: {
        type: Number,
        maxLength: 2,
        min: 18
    },
    gender: {
        type: String,
        lowercase: true,
        enum: {
            values: ['male', 'female', 'other'],
            message: '{VALUE} is not supported!'
        }

    },
    photoUrl: {
        type: String
    },
    about: {
        type: String
    },
    skills: {
        type: [String]
    }
    
},
{
    timestamps: true
});

userSchema.index({ firstName: 1, lastName: 1});

userSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt?.sign({_id: user?._id}, secretKey, {expiresIn: '7d'});
    return token;
};

userSchema.methods.validatePassword = async function(password) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(password, user?.password);
    return isPasswordValid;
}

module.exports = mongoose.model('User', userSchema);;