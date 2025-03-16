const router = require('express').Router();
const passport = require('passport');
require('../config/passport');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const multer = require('multer');
const PutObjectCommand = require('@aws-sdk/client-s3').PutObjectCommand;
const S3Client = require('@aws-sdk/client-s3').S3Client;

const upload = multer({ dest: 'uploads/' });

const CLIENT_URL = 'http://localhost:8081';

const Recipe = require('../models/recipe');
const valid_term = require('../models/valid_term');

function isLoggedIn(req, res, next) {
    req.user ? next () : res.sendStatus(401).redirect('/');
}

function isAdmin(req, res, next) {
    req.user === '67d40df4cec9dc96fcec7f04' ? next() : res.sendStatus(401).redirect('/');
}

const r2_client = new S3Client({ region: 'eeur',
    endpoint: process.env.R2_API_URL,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
 });

//recipes
router.get('/', isLoggedIn, (req, res) => {
    Recipe.find().then((recipes) => {
        res.status(200).json(recipes);
    }).catch((err) => {
        res.status(400).json(err);
    });
});

function Str_Random(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    
    // Loop to generate characters for the specified length
    for (let i = 0; i < length; i++) {
        const randomInd = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomInd);
    }
    return result;
}

function uploadToS3(file, name){
    const fileStream = fs.createReadStream(file.path);
    const params = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: name,
        Body: fileStream,
        ACL: 'public-read',
        ContentType: file.mimetype
    };
    return r2_client.send(new PutObjectCommand(params))
}

router.post('/terms/new', isAdmin, async (req, res) => {

    if(!req.body.termEnglish || !req.body.termFinnish || !req.body.type){
        res.status(400).json({message: "Missing required fields"});
        return;
    }

    newTerm = {
        termEnglish: req.body.termEnglish,
        termFinnish: req.body.termFinnish,
        type: req.body.type.split(',')
    }

    valid_term.create(newTerm).then((term) => {
        res.status(201).json({message: "created the following term",term});
    }).catch((err) => {
        res.status(400).json(err);
    });
});


router.post('/recipes/new', isAdmin, upload.single('image'), async (req, res) => {

    if(!req.body.nameEnglish || !req.body.nameFinnish || !req.file || !req.body.ingredientsEnglish || !req.body.ingredientsFinnish || !req.body.instructionsEnglish || !req.body.instructionsFinnish || !req.body.preparationTimeInMinutes || !req.body.cookingTimeInMinutes || !req.body.servings || !req.body.calories || !req.body.fat || !req.body.carbs || !req.body.protein || !req.body.sodium || !req.body.dishType){
        res.status(400).json({message: "Missing required fields"});
        await unlinkFile(req.file.path);
        return;
    }

    var newAllergens = [];
    if(req.body.allergens){
        newAllergens = req.body.allergens.split(',');
    }
    var newDietaryRestrictions = [];
    if(req.body.dietaryRestrictions){
        newDietaryRestrictions = req.body.dietaryRestrictions.split(',');
    }
    // lump terms together
    const terms = req.body.ingredientsEnglish.split(',').concat(req.body.ingredientsFinnish.split(',')).concat(newAllergens).concat(newDietaryRestrictions).concat(req.body.dishType);
    var invalidTerms = [];
    // check terms are valid

    for (const currentTerm of terms) {
        if (currentTerm.trim() === '') {
            continue;
        }
        await valid_term.findOne({$or: [{termEnglish: currentTerm}, {termFinnish: currentTerm}]}).then((term) => {
            if(!term){
                invalidTerms.push(currentTerm);
            }
        }).catch(async (err) => {
            res.status(400).json(err);
            await unlinkFile(req.file.path);
            return;
        });
    }
    if(invalidTerms.length > 0){
        res.status(400).json({message: "Invalid terms: ", invalidTerms});
        await unlinkFile(req.file.path);
        return;
    }


    const fileName = `${req.body.nameEnglish}-${Str_Random(8)}`

    const result = await uploadToS3(req.file, fileName);
    if(!result){
        res.status(500).json({message: "Error uploading file, no response"});
        return;
    } else if(result.$metadata.httpStatusCode !== 200){
        res.status(500).json({message: "Error uploading file, bad response: ", result});
        return;
    }
    await unlinkFile(req.file.path);

    const imageUrl = `${process.env.R2_PUBLIC_BUCKET_URL}/${process.env.R2_BUCKET_NAME}/${fileName}`;

    const newRecipe = {
        nameEnglish: req.body.nameEnglish,
        nameFinnish: req.body.nameFinnish,
        imageUrl: imageUrl,
        ingredientsEnglish: req.body.ingredientsEnglish.split(','),
        ingredientsFinnish: req.body.ingredientsFinnish.split(','),
        instructionsEnglish: req.body.instructionsEnglish,
        instructionsFinnish: req.body.instructionsFinnish,
        preparationTimeInMinutes: req.body.preparationTimeInMinutes,
        cookingTimeInMinutes: req.body.cookingTimeInMinutes,
        servings: req.body.servings,
        macros: {
            calories: req.body.calories,
            fat: req.body.fat,
            carbs: req.body.carbs,
            protein: req.body.protein,
            sodium: req.body.sodium
        },
        allergens: newAllergens,
        dietaryRestrictions: newDietaryRestrictions,
        dishType: req.body.dishType
    }

    Recipe.create(newRecipe).then((recipe) => {
        res.status(201).json({message: "successfully created recipe",recipe});
    }).catch((err) => {
        res.status(400).json(err);
    });

    

});


module.exports = router;