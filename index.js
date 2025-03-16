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
    req.user ? next () : res.sendStatus(401).redirect('/');
}

const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));



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



app.use(passport.initialize());
app.use(passport.session());

app.use(cors())

mongoose.connect(process.env.MONGO_DB_URI,)
    .catch(err => console.error(err));


app.use('/auth', authRoutes);
app.use('/recipes', recipeRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Google Login</a>');
    });

app.get('/protected', isLoggedIn, (req, res) => {
    res.send('wow you logged in :D');
    });

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
    });

app.listen(5000);