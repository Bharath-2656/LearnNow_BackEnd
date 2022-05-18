const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
var {User} = require('../models/UserModel');
const { Instructor } = require('../models/InstructorModel');


passport.use('local',
    new localStrategy({ usernameField: 'email' },
        (username, password, done) => {
            User.findOne({ email: username },
                (err, user) => {
                    if (err)
                        return done(err); 
                    else if (!user)
                        return done(null, false, { message: 'Email is not registered' });
                    else if (!user.verifyPassword(password))
                        return done(null, false, { message: 'Wrong password.' });
                    else
                        return done(null, user);
                });
        })
);

passport.use('local-instructor',
    new localStrategy({ usernameField: 'email' },
        (username, password, done) => {
            Instructor.findOne({ email: username },
                (err, instructor) => {
                    if (err)
                        return done(err); 
                    else if (!instructor)
                        return done(null, false, { message: 'Email is not registered' });
                    else if (!instructor.verifyPassword(password))
                        return done(null, false, { message: 'Wrong password.' });
                    else
                        return done(null, instructor);
                });
        })
);