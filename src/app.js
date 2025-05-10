const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
const { validateSignupData } = require('./utils/validation');
const bcrypt = require('bcrypt');
const validator = require('validator');
const cookieParser = require('cookie-parser');
const { userAuth } = require('./middlewares/auth');

app.use(express.json());
app.use(cookieParser());

secretKey = "this is a secret key";

app.post('/signup', async (req, res) => {
    try {
        // validate the data
        validateSignupData(req);

        // encrypt the password
        const { password } = req?.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User ({
            ...req.body,
            password: passwordHash
        });
        const result = await user.save();
        res.send('User created successfully');
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if(!emailId || !password) {
            const errorObj = {
                status: false,
                message: 'Please fill all the fields'
            };
            throw new Error(JSON.stringify(errorObj));
        };
        if(!validator.isEmail(emailId)) {
            const errorObj = {
                status: false,
                message: 'Invalid credentials'
            }
            throw new Error(JSON.stringify(errorObj));
        };

        const user = await User.findOne({
            emailId
        });

        const isPasswordValid = await user.validatePassword(password);
        if(!isPasswordValid) {
            const errorObj = {
                status: false,
                message: 'Invalid credentials'
            }
            throw new Error(JSON.stringify(errorObj));
        }

        const token = await user?.getJWT();

        res.cookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }); // expires in 7 days
        res.send({
            status: true,
            message: 'Login successful',
            userId: user?._id
        })
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
})

app.post('/user', userAuth, async (req, res) => {
    const { emailId } = req.body;

    try {
        const users = await User.find({emailId});
        res.send(users);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/feed', async (req, res) => {

    try {
        const users = await User.find({});
        res.send(users);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete('/user', async (req, res) => {
    const { userId } = req?.body;

    try {
        const user = await User.findByIdAndDelete(userId);
        res.send('User deleted successfully');
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});

app.patch('/user/:userId', async (req, res) => {

    try {
        const data = req.body;
        const userId = req.params?.userId;

        const ALLOWED_FIELDS = ['gender', 'password', 'age', 'photoUrl', 'about', 'skills'];
        const keys = Object.keys(data);
        const isValidOperation = keys.every((key) => ALLOWED_FIELDS.includes(key));
        if (!isValidOperation) {
            res.status(400).send('Invalid updates!');
        }

        await User.findByIdAndUpdate(userId, data);
        res.send('User updated successfully');
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});



connectDB().then(() => {
    app.listen(8888, () => {
        console.log('Server is running on port 8888');
      });
}
).catch((err) => {
    console.log('MongoDB connection error:', err);
});