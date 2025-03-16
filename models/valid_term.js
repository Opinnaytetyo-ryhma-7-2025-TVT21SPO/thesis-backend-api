const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const valid_termSchema = new Schema({
    termEnglish: {
        type: String,
        required: true,
        unique: true,
    },
    termFinnish: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: Array,
        required: true,
    }
    
}, {timestamps: true});

module.exports = mongoose.model('valid_term', valid_termSchema);