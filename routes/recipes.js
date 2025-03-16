const router = require('express').Router();
const passport = require('passport');
require('../config/passport');

const CLIENT_URL = 'http://localhost:8081';

const Recipe = require('../models/recipe');

function isLoggedIn(req, res, next) {
    req.user ? next () : res.sendStatus(401).redirect('/');
}

//recipes
router.get('/', isLoggedIn, (req, res) => {
    Recipe.find().then((recipes) => {
        res.status(200).json(recipes);
    }).catch((err) => {
        res.status(400).json(err);
    });
});

router.post('/new', (req, res) => {
    Recipe.create(req.body).then((recipe) => {
        res.status(201).json(recipe);
    }).catch((err) => {
        res.status(400).json(err);
    });
});


module.exports = router;