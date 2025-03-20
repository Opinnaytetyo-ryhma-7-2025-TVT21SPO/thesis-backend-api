const router = require('express').Router();
const passport = require('passport');
require('../config/passport');
const mongoose = require('mongoose');

const CLIENT_URL = 'http://localhost:8081';

const Recipe = require('../models/recipe');
const ValidTerms = require('../models/valid_term');

function isLoggedIn(req, res, next) {
    req.user ? next () : res.sendStatus(401);
}

//recipes
router.get('/', (req, res) => {
    Recipe.find().then((recipes) => {
        res.status(200).json(recipes);
    }).catch((err) => {
        res.status(400).json(err);
    });
});

router.get('/favourites', isLoggedIn, (req, res) => {
    let listOfRecipes = []
    const listOfFavourites = req.user.dietData.favouriteRecipes;
    for (let i = 0; i < listOfFavourites.length; i++) {
        let newObjectId = new mongoose.Types.ObjectId(listOfFavourites[i])
        listOfRecipes.push({_id: newObjectId})
    }
    if(listOfFavourites.length == 0) {
        res.status(200).json({})
    }
    Recipe.find({$or: listOfRecipes}).then((recipes) => {
        res.status(200).send(recipes);
    })
})

router.get('/:id', (req, res) => {
    Recipe.findById(req.params.id).then((recipe) => {
        res.status(200).json(recipe);
    }).catch((err) => {
        res.status(400).json(err);
    });
});



router.get('/filtered/:category', (req, res) => {
    Recipe.find({$or: [{ingredientsEnglish: req.params.category}, {ingredientsFinnish: req.params.category}, {allergens: req.params.category}, {dishType: req.params.category}]}).then((recipes) => {
        
        if(recipes.length === 0){
            res.status(200).json({message: "none"});
            return;
        } else {
            res.status(200).json(recipes);
        }
    }).catch((err) => {
        res.status(400).json(err);
    });
});

router.get('/categories/ingredients', (req, res) => {
    ValidTerms.find({$or: [{type: "ingredient"}]}).then((categories) => {
        res.status(200).json(categories);
    }).catch((err) => {
        res.status(400).json(err);
    });
});

router.get('/categories/dishTypes', (req, res) => {
    ValidTerms.find({$or: [{type: "dishType"}]}).then((categories) => {
        res.status(200).json(categories);
    }).catch((err) => {
        res.status(400).json(err);
    });
});

router.get('/categories/cuisines', (req, res) => {
    ValidTerms.find({$or: [{type: "cuisine"}]}).then((categories) => {
        res.status(200).json(categories);
    }).catch((err) => {
        res.status(400).json(err);
    });
});

router.get('/categories/diets', (req, res) => {
    ValidTerms.find({$or: [{type: "diet"}]}).then((categories) => {
        res.status(200).json(categories);
    }).catch((err) => {
        res.status(400).json(err);
    });
});

router.get('/categories/allergies', (req, res) => {
    ValidTerms.find({$or: [{type: "allergen"}]}).then((categories) => {
        if(categories.length === 0){
            res.status(404).json({message: "none"});
            return;
        } else {
            res.status(200).json(categories);
        }
    }).catch((err) => {
        res.status(400).json(err);
    });
});

router.get('/categories/filtered', (req, res) => {
    ValidTerms.find().then((categories) => {
        const allergens = categories.filter((category) => category.type.includes("allergen"));
        const ingredients = categories.filter((category) => category.type.includes("ingredient"));
        const dishTypes = categories.filter((category) => category.type.includes("dishType"));
        const cuisines = categories.filter((category) => category.type.includes("cuisine"));
        const diets = categories.filter((category) => category.type.includes("diet"));

        var allCategories = [];
        allCategories = allCategories.concat(allergens);
        allCategories = allCategories.concat(ingredients);
        allCategories = allCategories.concat(dishTypes);
        allCategories = allCategories.concat(cuisines);
        allCategories = allCategories.concat(diets);
        const uniqueCategories = [...new Set(allCategories)];
        res.status(200).json(uniqueCategories);

        // const allCategories = {allergens: allergens, ingredients: ingredients, dishTypes: dishTypes, cuisines: cuisines, diets: diets};
        // res.status(200).json(allCategories);
    }).catch((err) => {
        res.status(400).json(err);
    });
});
module.exports = router;