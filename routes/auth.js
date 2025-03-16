const router = require('express').Router();
const passport = require('passport');
require('../config/passport');



//auth login
router.get('/login', (req, res) => {
    res.render('login');
});

//auth logout
router.get('/logout', (req, res) => {
    // handle with passport
    req.logout();
    res.redirect('/')
});

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/redirect', passport.authenticate('google', {
    successRedirect: 'auth/success',
    failureRedirect: '/auth/failure'
}));

router.get('/local', passport.authenticate('local', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure'
}));

router.get('/failure', (req, res) => {
    res.status(401).json({success: false, message: "Failed to authenticate"});
});

router.get('/success', (req, res) => {
    res.status(200).json({success: true, message: "Successfully authenticated", user: req.user, cookies: req.cookies});
});
module.exports = router;