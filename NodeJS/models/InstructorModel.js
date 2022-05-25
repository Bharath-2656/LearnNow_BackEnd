var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const InstructorSchema = new mongoose.Schema({
  instructorid: {
    type: String,
    // required:true,
    unique: true,
  },
  name: {
    type: String,
    required: 'Name cannot be empty',
  },
  age: {
    type: Number,
    required: 'age cannot be empty'
  },
  email: {
    type: String,
    unique: true,
    primaryKey: true,
    required: 'email cannot be empty',
  },
  description: {
    type: String,
  },
  password: {
    type: String,
    required: 'Password cannot be empty',
    minlength: [4, 'Password must be atleast 4 character long'],
  },
  numberofcourses: {
    type: Number,
  },
  numberofstudents: {
    type: Number,
  },
  reviews: {
    type: []
  },
  role: {
    type: String,
    default: 'instructor',
  },
  refreshtoken:{
    type: String,
    default: 'refresh_token'
  },
  courseid: {
    type: [],
  },
  routerlink:{
    type: String,
  },
  saltSecret: String,
});

InstructorSchema.pre('save', function (next)
{
  bcrypt.genSalt(10, (err, salt) =>
  {
    bcrypt.hash(this.password, salt, (err, hash) =>
    {
      this.password = hash;
      this.confirm_password = hash;
      this.saltSecret = this.salt;
      next();
    });
  });
});

InstructorSchema.pre("save", function (next)
{
  var docs = this;
  mongoose
    .model("Instructor", InstructorSchema)
    .countDocuments({ account: docs.name }, function (error, counter)
    {
      if (error) return next(error);
      docs.instructorid = counter + 1;
      next();
    });
});

InstructorSchema.methods.verifyPassword = function (password)
{
  return bcrypt.compareSync(password, this.password);
};

InstructorSchema.methods.generateJwt = function ()
{
  return jwt.sign({ instructorid: this.instructorid, role: 'instructor' },
    'SECRET#123',
    {
      expiresIn: '3m'
    });
}

InstructorSchema.methods.generateRefreshToken = function ()
{
  return jwt.sign({ instructorid: this.instructorid, role: 'instructor' }, 'RefreshToken', { expiresIn: '30d' });
}

const Instructor = mongoose.model("Instructor", InstructorSchema);

module.exports = { Instructor };