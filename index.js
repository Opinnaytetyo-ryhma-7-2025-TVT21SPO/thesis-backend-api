require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cors = require('cors');
require('./config/passport');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const adminRoutes = require('./routes/admin');




function isLoggedIn(req, res, next) {
    console.log(req.user);
    req.user ? next () : res.sendStatus(401);
}

const app = express();


const corsOptions = {
    origin: 'http://localhost:8081',
    credentials: true
};
app.use(cors(corsOptions))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(passport.initialize());

const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_DB_URI
});

app.use(session({
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 24 * 60 * 60 * 1000, },
    secret: process.env.SESSION_SECRET
}));


app.use(passport.session());



mongoose.connect(process.env.MONGO_DB_URI,)
    .catch(err => console.error(err));


app.use('/auth', authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send("You've reached the API. Good job!");
    });

app.get('/protected', isLoggedIn, (req, res) => {
    console.log(req.user);
    res.send('wow you logged in :D');
    });

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
    });

app.listen(5000);