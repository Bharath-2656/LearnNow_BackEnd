const express = require('express');
const { Instructor} = require('../models/InstructorModel');
const bodyParser = require("body-parser");
const passport = require('passport');
var router = express.Router();
const app = express();
const jwt = require('jsonwebtoken');
const { Course} = require("../models/CourseModel");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);

//Get all Instructors
app.get('/instructors', async (req, res) =>
{
    Instructor.find((err, data) =>
    {
        if (!err)
        {
            res.send(data);
        }
        else { console.log("Error in getting data : " + err); }
    });
});

//Post Instructer details to database
app.post('/instructors', (req, res) =>
{
    var instructor = new Instructor({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
        description: req.body.description,
        password: req.body.password,
        routerlink: req.body.name.replace(/\s+/g, '').toLowerCase(),
        //instructorid: req.body.name.replace(/\s+/g, '').toLowerCase(),
        // numberofcourses: req.body.numberofcourses,
        // numberofstudents: req.body.numberofstudents,
    });
    instructor.save((err, doc) =>
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

//Get particular record of the instructor
app.get('/instructors/:instructorid', (req, res) =>
{

    Instructor.findOne({ instructorid: req.params.instructorid }, `name age email`, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log("Error in retreiving data") }
    });
});

//Update a particular record of Instructor
app.put('/instructors/:instructorid', (req, res) =>
{
    var instructor = {
        name: req.body.name,
        age: req.body.age,
        password: req.body.password,
        description: req.body.description,
        numberofcourses: req.body.numberofcourses,
        numberofstudents: req.body.numberofstudents,
    };
    Instructor.findOneAndUpdate({ instructorid: req.params.instructorid }, { $set: instructor }, { new: true }, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log(`Error in updating user`); }
    });
});

//Delete a Instructor
app.delete('/instructors/:instructorid', (req, res) =>
{
    Instructor.findOneAndRemove(req.params.instructorid, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log("Error in deleting user"); }
    });
});

app.put('/instructorcourse/:instructorid', (req, res) =>
{
    
    var instructor = {
        instructorid: req.body.instructorid
    };
    console.log(req.body);
    Instructor.findOneAndUpdate({ instructorid: req.params.instructorid }, { $push: instructor }, { new: true }, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log(`Error in updating user`); }
    });
});

var  instructoridforrefresh;

app.get('/getinstructorid', (req,res,next) => {
    Instructor.findOne({ instructorid: req.params.instructorid }, `name age email`, (err, doc) =>
    {
        if (!err) { res.send(doc); }
        else { console.log("Error in retreiving data") }
    });


})


app.post('/authenticate', (req, res, next) =>
{
    passport.authenticate('local-instructor', (err, instructor, info) =>
    {
        if (err) return res.status(400).json(err);
        else if (instructor)
            {
                var instructor1 = {
                    refreshtoken: instructor.generateRefreshToken()
                };
                
                instructoridforrefresh = req.body.email;
                
                const refresh_token = instructor.generateRefreshToken();
                
                Instructor.findOneAndUpdate({ email: req.body.email }, {  refreshtoken: instructor.generateRefreshToken() },(err, doc) =>
                {
                    // if (!err) { res.send(doc); }
                    // else { console.log(`Error in updating user`); }
                    
                });
                return res.status(200).json( { "token": instructor.generateJwt(), });
            }
        else return res.status(404).json(info);
    })(req, res);
});

//Generating access token if refersh token is valid and access token is expired
app.post('/token/:instructorid', async (req,res,next) =>
{
    const instructorfortoken = await Instructor.findOne({ instructorid: req.params.instructorid }, 'instructorid refreshtoken').exec();
    
    jwt.verify(instructorfortoken.refreshtoken,process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err)
                return res.status(500).send({ auth: false, message: 'Token authentication failed.' });
            else {
                    return res.status(200).json( { "token": instructorfortoken.generateJwt() });
                next();
            }
        }
    )
});

app.post('/deletetoken/:instructorid', (req,res) => {
    var instructor = {
        refreshtoken: 'refresh_token',
    };
    console.log("hi");
    Instructor.findOneAndUpdate({ instructorid: req.params.instructorid }, { $set: instructor }, { new: true }, (err, doc) =>
    {
        if (!err) { 
            console.log("hello");
            res.send(doc); }
        else { console.log(`Error in updating user`); }
    });
})

app.get('/instructorcourse', async (req, res) =>
{
    Instructor.aggregate([
        {
            $lookup: {
                from: "courses",
                localField: "routerlink",
                foreignField: "author",
                as: "instructor_courses",
            },
        },
        
    ])
        .then((result) =>
        {
            res.send(result);
        })
        .catch((error) =>
        {
            console.log(error);
        });
});


module.exports = app;