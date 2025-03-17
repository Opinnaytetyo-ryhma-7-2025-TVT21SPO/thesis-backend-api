const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: false,
    },
    displayName: {
        type: String,
        required: false,
    },
    givenName: {
        type: String,
        required: false,
    },
    googleId: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },
    bodyData: {
        age: {
            type: Number,
            required: false,
        },
        sex: {
            type: String,
            required: false,
        },
        height: {
            type: Number,
            required: false,
        },
        weight: {
            type: Number,
            required: false,
        }
    },
    dietData: {
        allergies: {
            type: Array,
            required: false,
        },
        dietaryRestrictions: {
            type: Array,
            required: false,
        },
        favouriteRecipes: {
            type: Array,
            required: false,
        },
        goal: {
            type: String,
            required: false,  
        },
        goalCaloriesPerDay: {
            type: Number,
            required: false,
        },
    },
    historyData: {
        recipesHistory: {
            type: Array,
            required: false,
        },
        mealsHistory: {
            type: Array,
            required: false,
        },
        weightHistory: {
            type: Array,
            required: false,
        },
        activityHistory: {
            type: Array,
            required: false,
        },
    },
    isAdmin: {
        type: Boolean,
        required: false,
    }
}, {timestamps: true});

userSchema.plugin(require('mongoose-bcrypt'));

module.exports = mongoose.model('user', userSchema);