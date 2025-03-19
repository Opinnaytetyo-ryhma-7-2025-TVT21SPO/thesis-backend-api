const router = require('express').Router();
const passport = require('passport');
require('../config/passport');



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
    successRedirect: '/success',
    failureRedirect: '/failure'
},
function(req, res) {
    res.sendStatus(200);
}
));

router.get('/failure', (req, res) => {
    res.status(401).json({success: false, message: "Failed to authenticate"});
});
// json({success: true, message: "Successfully authenticated", user: req.user, cookies: req.cookies})
router.get('/google/success', (req, res) => {
    res.status(200).redirect('http://localhost:8081/Home');
});
module.exports = router;