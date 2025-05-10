const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://prashanthandel2501:7zVFgVWod9Tgo072@tinder.wfipss6.mongodb.net/devTinder');
}

module.exports = connectDB;