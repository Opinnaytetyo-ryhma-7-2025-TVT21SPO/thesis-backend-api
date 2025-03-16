const router = require('express').Router();
const passport = require('passport');
require('../config/passport');

const CLIENT_URL = 'http://localhost:8081';

const Recipe = require('../models/recipe');

//recipes
router.get('/', (req, res) => {
    Recipe.find().then((recipes) => {
        res.status(200).json(recipes);
    }).catch((err) => {
        res.status(400).json(err);
    });
});

module.exports = router;