require('dotenv').config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  try {
      User.findById(id).then((user) => {
          done(null, user);
      });
  } catch (error) {
      done(error, null);
  }
});   


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/redirect`,
    passReqToCallback: false
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({googleId: profile.id}).then((currentUser) => {
        if(currentUser){
            done(null, currentUser);
        } else {
            new User({
                username: profile.emails[0].value,
                displayName: profile.displayName,
                givenName: profile.name.givenName,
                googleId: profile.id
            }).save().then((newUser) => {
                done(null, newUser);
            });
        }
    });
  }
));

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }).then((user) => {
        if (!user) { 
            new User({
                username: username,
                password: password
            }).save().then((newUser) => {
                done(null, newUser);
            });
        } else if (!user.verifyPassword(password)) { return done(null, false); } else {
          return done(null, user);
        }
    });
  }
));
