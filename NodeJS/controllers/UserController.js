const express = require('express');
var ObjectId = require('mongoose').Types.ObjectId;
const { User } = require("../models/UserModel");
const { Course } = require("../models/CourseModel");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
var { AreaOfInterest } = require('../models/areaOfInterestModel');
const courseController = require("../controllers/CourseController")
const passport = require('passport');
const jwtHelper = require('../Config/jwtHelper');
var router = express.Router();
const app = express();
const loadash = require('lodash');
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require("dotenv").config();
const stripe = require("stripe")('sk_test_51KzDD9SFGZJvDt6TYvB963ObQApw5N2P1IPcWJkwrzkfENlx2a4Ir9mFhxEdiPncNQvVSzPLQGeIDTrHYyKeSJY600yJgkFjeE');
const cookieSession = require('cookie-session');
var { token } = require('morgan');
require('../Config/OAuth');
var cookieParser = require('cookie-parser');
const { has } = require('lodash');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use(router);
app.use(express.json());


// var allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//     if ('OPTIONS' == req.method) {
//     	res.send(200);
//     }
//     else {
//     	next();
//     }
// }; 

//Getting all users
app.get('/users', async (req, res) =>
{
    User.find((err, data) =>
    {
        if (!err)
        {

            res.send(data);
        }
        else { console.log("Error in getting data : " + err); }
    });
});

//Posting user detials to database
app.post('/users', (req, res) =>
{
    var user = new User({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
        password: req.body.password,
        //confirm_password: req.body.confirm_password,
        courseid: req.body.courseid,
    });
    user.save((err, doc) =>
    {
        if (!err)
        {
            res.send(doc);
            console.log("Data saved");
        }
        else
        {
            console.log('Error in saving data :' + err);
            res.send(err.message);
        }
    });

});


//getting the details of a particular user
app.get('/users/:userid', (req, res) =>
{
    User.findOne({ userid: req.params.userid }, `name age email`, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log("Error in retreiving data") }
    });
});

//Updating record of a particular user
app.put('/users/:userid', (req, res) =>
{
    var user = {
        name: req.body.name,
        age: req.body.age,
        password: req.body.password,
        //confirm_password: req.body.confirm_password,
        courseid: req.body.courseid,
    };
    User.findOneAndUpdate({ userid: req.params.userid }, { $set: user }, { new: true }, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log(`Error in updating user`); }
    });
});

// Updating the courseid to User after Enrollment
app.put('/usercoursearea/:userid/:courseid/', (req, res) =>
{

    var user = {
        courseid: req.body.courseid
    };

    User.findOneAndUpdate({ userid: req.params.userid }, { $addToSet: { courseid: req.params.courseid } }, { new: true }, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log(`Error in updating user`); }
    });
});

//Deleting the user from the database
app.delete('/users/:userid', (req, res) =>
{
    User.findByIdAndRemove(req.params.userid, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log("Error in deleting user"); }
    });
});

app.use(bodyParser.urlencoded({ extended: true }));

app.put('/usercourse/:userid/:courseid/:price', (req, res) =>
{
    var user = {
        courseid: req.params.courseid,
    };
    console.log(req.params.price);
    User.findOneAndUpdate({ userid: req.params.userid }, { $addToSet: user }, { new: true }, (err, doc) =>
    {
        
    });
    User.findOneAndUpdate({ userid: req.params.userid }, { $inc: { totalamount: req.params.price } }, { new: true }, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log(`Error in updating user`); }
    });

});

//Authenticating the user upon login and generating refresh and access token
app.post('/authenticate', async (req, res, next) =>
{
    const password = req.body.password;
        User.findOne({ email: req.body.email },
            (err, user) => {
                if (err)
                    return (err); 
                else if (!user)
                    return res.status(404).json( { message: 'Email is not registered' });
                else if (!user.verifyPassword(password))
                    return res.status(404).json({ message: 'Wrong password.' });
                else
                    {
                 return res.status(200).json({ "token": user.generateJwt(), "refreshtoken": user.generateRefreshToken() })
                
            }
        });
});

app.use(cookieSession({
    name: 'google-auth-session',
    keys: ['key1', 'key2']
}))

app.get('/api/auth/google',
    passport.authenticate('google', {
        
        scope:
            ['email', 'profile']
    }
    ));

app.get("/failed", (req, res) =>
{
    res.send("Failed")
})
app.get("/success", (req, res) =>
{
    res.send(`Welcome ${req.user.email}`)
})

app.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failed',
        
    }),
    function(req, res) {
        var responseHTML = '<html><head><title>Main</title></head><body></body><script>res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>'; 
        
        responseHTML = responseHTML.replace('%value%', JSON.stringify({
        userid: req.user.userid,
        email: req.user.email,
        }));    

        res.status(200).send(responseHTML);
    
    
    }
);

app.get('/googleauthentication/:userid', async(req, res, next) =>
{
    console.log(req.params.userid);
    User.findOne({userid : req.params.userid},(err, user) => {
    
    return res.status(200).json({ "token": user.generateJwt(), "refreshtoken": user.generateRefreshToken() })
    })
})

//Generating access token if refersh token is valid and access token is expired
app.post('/token/:userid/:refreshtoken', async (req, res, next) =>
{
    const userfortoken = await User.findOne({ userid: req.params.userid }, 'userid').exec();
    jwt.verify(req.params.refreshtoken, 'RefreshToken',
        (err, decoded) =>
        {
            if (err)
                return res.status(500).send({ auth: false, message: 'Token authentication failed.' });
            else
            {
                return res.status(200).json({ "token": userfortoken.generateJwt() });
                next();
            }
        }
    )
});

app.post('/deletetoken/:userid', (req, res) =>
{
    var user = {
        refreshtoken: 'refresh_token',
    };
    User.findOneAndUpdate({ userid: req.params.userid }, { $set: user }, { new: true }, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log(`Error in updating user`); }
    });
})

//getting all userprofiles Admin access
app.get('/userprofile', (req, res, next) =>
{
    User.findOne({ userid: req.body.userid },
        (err, user) =>
        {
            if (!user)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else
                return res.status(200).json({ status: true, user: loadash.pick(user, ['name', 'email']) });
        }
    );
});

/*  Area of intfrest section to be moved to seperate controller */

//adding area of Intrest
app.post('/areaofinterest', (req, res) =>
{
    var areaofinterest = new AreaOfInterest({
        name: req.body.name,
        imagesrc: req.body.imagesrc,
        routerlink: req.body.name.replace(/\s+/g, '').toLowerCase(),
    });
    areaofinterest.save((err, doc) =>
    {
        if (!err)
        {
            res.send(doc);
            console.log("Data saved");
        }
        else
        {
            console.log('Error in saving data :' + err);
            res.send(err.message);
        }
    });
});

//Getting all the area of interest 
app.get('/areaofinterest', async (req, res) =>
{
    AreaOfInterest.find((err, data) =>
    {
        if (!err)
        {
            res.send(data);
        }
        else { console.log("Error in getting data : " + err); }
    });
});

app.post('/payment/:price', async (req, res) =>
{
    try
    {
        console.log(req.body.token);
        token = req.body.token;
        price = req.body.price;
      
        const customer = stripe.customers
            .create({
                email: "bharathstarck@gmail.com",
                source: token.id,
                
            })
            .then((customer) =>
            {
                //console.log(customer);
                //return stripe.charges.create({
                    
                return stripe.paymentIntents.create({
                    amount: req.params.price,
                    description: "Payment for course enrollment",
                    currency: "inr",
                    customer: customer.id,
                    confirm: true,
                });
            })
            .then((charge) =>
            {
                //console.log(charge);
                res.json({
                    data: "success"
                })
            })
            .catch((err) =>
            {
                //console.log(err);
                //console.log("statusCode: ", err.statusCode);
                res.json({
                    data: "failure",
                });
            });
        return true;
    } catch (error)
    {
        console.log(error);
        return false;
    }
})


//mapping the usercourse with the user using lookup in mongo
app.get('/usercourse', async (req, res) =>
{
    Course.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "routerlink",
                foreignField: "courseid",
                as: "user_courses",
            },
        },
        // {
        //     $unwind: "$user_courses",
        // },
    ])
        .then((result) =>
        {
            //console.log(JSON.stringify(result));
            res.send(result);
        })
        .catch((error) =>
        {
            console.log(error);
        });
});


//Sending mail upon enrollment of a course
app.post('/course_mail', async (req, res) =>
{

    let transprter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "bharathstarck@gmail.com",
            pass: '@pplEisred123',
        },
        tls: {
            rejectUnauthorized: false,
        }
    });

    let mailOptions = {
        from: "bharathstarck@gmail.com",
        to: "bharath2000madhu@gmail.com",
        subject: "Confirmation of enrollemnt",
        // html:{path: `http://localhost:4200/user/confirmenrollment`}
        text: "You have successfully enrolled a course on the LearnNow! application",
    }

    transprter.sendMail(mailOptions, function (err, success)
    {
        if (err)
        {
            console.log(err);
        }
        else 
        {
            console.log("Email has been sent sucessfully");
        }
    });
    res.send("Email sent")
});

//Sending mail upon successful registeration to the application 
app.post('/user_mail', async (req, res) =>
{
    
    //link="http://"
    let transprter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "bharathstarck@gmail.com",
            pass: '@pplEisred123',
        },
        tls: {
            rejectUnauthorized: false,
        }
    });

    let mailOptions = {
        from: "bharathstarck@gmail.com",
        to: "bharath2000madhu@gmail.com",//to be changed
        subject: "Confirmation of Registration",
        // html:{path: `http://localhost:4200/user/confirmenrollment`}
        text: "Dear " + req.body.name + " you have successfully registered on the LearnNow application.\n Please login to continue"
    }
    transprter.sendMail(mailOptions, function (err, success)
    {
        if (err)
        {
            console.log(err);
        }
        else 
        {
            console.log("Email has been sent sucessfully");
        }
    });
    res.send("Email sent")
});

app.get('/forgotpassword_mail/:email', async (req, res) =>
{
   var otp = Math.floor(100000 + Math.random() * 900000);
   
    //link="http://"
    let transprter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "bharathstarck@gmail.com",
            pass: '@pplEisred123',
        },
        tls: {
            rejectUnauthorized: false,
        }
    });

    let mailOptions = {
        from: "bharathstarck@gmail.com",
        to:  req.params.email,  //"bharath2000madhu@gmail.com",//to be changed
        subject: "Confirmation of Registration",
        // html:{path: `http://localhost:4200/user/confirmenrollment`}
        text: "You have requested for reseting password please verify the following OTP and continue to rest the password \n OTP: " + otp
    }
    transprter.sendMail(mailOptions, function (err, success)
    {
        if (err)
        {
            console.log(err);
        }
        else 
        {
            console.log("Email has been sent sucessfully");
        }
    });
    res.json({
        data: otp,
    });
});

app.get('/verifyotp/:otp',  (req, res) =>
{
    console.log(req.params.otp);
    
});

app.post('/resetpassword/:email/:password', async (req, res) =>
{
    var user = new User({
        password: req.params.password,
    })
 
    var password = await bcrypt.hash(req.params.password, 10);
    console.log(password);
    User.findOneAndUpdate({ email: req.params.email }, { $set: {password: await bcrypt.hash(req.params.password, 10)} },{ new: true }, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log(`Error in updating user`); }
    });
});

module.exports = app;