const router = require('express').Router();
const passport = require('passport');
require('../config/passport');

const User = require('../models/user');

function isLoggedIn(req, res, next) {
    req.user ? next () : res.sendStatus(401);
}
//auth login
router.get('/login', (req, res) => {
    res.render('login');
});

//auth logout
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('http://localhost:8081');
    })
});

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/redirect', passport.authenticate('google', {
    successRedirect: 'success',
    failureRedirect: '/failure'
}));

router.get('/local', passport.authenticate('local', {
    successRedirect: 'success',
    failureRedirect: '/failure'
},));

router.get('/failure', (req, res) => {
    res.status(401).json({success: false, message: "Failed to authenticate"});
});
// json({success: true, message: "Successfully authenticated", user: req.user, cookies: req.cookies})
router.get('/google/success', (req, res) => {
    res.status(200).redirect('http://localhost:8081/Home');
});


router.get('/cachedata', (req, res) => {
    if(!req.user){
        res.sendStatus(401)
        return;
    }
    const sendUser = {
        dietData: req.user.dietData,
        historyData: req.user.historyData,
        updatedAt: req.user.updatedAt
    }
    res.status(200).send(sendUser)
})

router.put('/updateUserData', isLoggedIn, (req, res) => {
    if(!req.body.dietData && !req.body.historyData){
        res.status(400).json({error: "Missing new data, include at least dietData or historyData in body"})
        return;
    }
    let currentUser = req.user;
    if(req.body.dietData) {
        currentUser.dietData = req.body.dietData
    }
    if(req.body.historyData) {
        currentUser.historyData = req.body.historyData
    }
    console.log(currentUser)
    currentUser.save();
    res.sendStatus(202)
})

module.exports = router;