const dotenv = require("dotenv").config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require("../models/UserModel");

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
      done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:9000/admin/google/callback",
    passReqToCallback   : true
  },
  async (request, accessToken, refreshToken, profile, done) => {
    try{

    var existingUser = await User.findOne({ 'email': profile.emails[0].value });
    // if user exists return the user 
    if (existingUser) {
      var token = existingUser.generateJwt();
    return done(null, existingUser);
    }
    // if user does not exist create a new user 
    console.log('Creating new user...');
    const newUser = new User({
        
    name: profile.displayName,
    email: profile.emails[0].value,
    })
    await newUser.save();
    var token = newUser.generateJwt();
    console.log(this.token);
    return done(null, newUser);
    } catch (error) {
    return done(error, false)
    }
  }
));