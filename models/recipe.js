const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({

    nameEnglish: {
        type: String,
        required: true,
    },
    nameFinnish: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        default: 'Admin',
    },
    imageUrl: {
        type: String,
        required: false,
    },
    ingredientsEnglish: {
        type: Array,
        required: true,
    },
    ingredientsFinnish: {
        type: Array,
        required: true,
    },
    instructionsEnglish: {
        type: String,
        required: true,
    },
    instructionsFinnish: {
        type: String,
        required: true,
    },
    preparationTimeInMinutes: {
        type: Number,
    },
    cookingTimeInMinutes: {
        type: Number,
        required: true,
    },
    servings: {
        type: Number,
        required: true,
    },
    macros: {
        calories: {
            type: Number,
            required: true,
        },
        fat: {
            type: Number,
            required: true,
        },
        carbs: {
            type: Number,
            required: true,
        },
        protein: {
            type: Number,
            required: true,
        },
        sodium: {
            type: Number,
            required: true,
        },
    },
    allergens: {
        type: Array,
        required: false
    },
    dietaryRestrictions: {
        type: Array,
        required: false
    },
    dishType: {
        type: String,
        required: true
    },
}, {timestamps: true});

module.exports = mongoose.model('recipe', recipeSchema);