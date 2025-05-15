const express = require('express');
const connectDB = require('./config/database');
const app = express();
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');

app.use(express.json());
app.use(cookieParser());


app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/',userRouter);

connectDB().then(() => {
    app.listen(8888, () => {
        console.log('Server is running on port 8888');
      });
}
).catch((err) => {
    console.log('MongoDB connection error:', err);
});