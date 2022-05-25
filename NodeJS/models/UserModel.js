var express = require('express');
var router = express.Router();
var server = require('../server');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');
const dotenv = require("dotenv").config();

const UserSchema = new mongoose.Schema({
    userid:{
      type:String,
      // required:true,
      unique:true,
    },
    name: {
      type: String,
      //required: 'Name cannot be empty',
    },
    age: {
      type: Number,
      //required:'age cannot be empty'
    },
    email: {
        type: String,
        unique: true,
        primaryKey: true,
        //required:'email cannot be empty',
    },
    password: {
        type: String,
        //required:'Password cannot be empty',
        minlength: [4, 'Password must be atleast 4 character long'],
    },
    
    courseid: {
      type: [],
    },
    role:{
      type: String,
      default: 'user',
    },
    
    areaofintrest: {
      type: [],
    },
    totalamount: {
      type: Number,
      default: 0,
    },
    saltSecret:String,
  });
 UserSchema.plugin(uniqueValidator);

  UserSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

UserSchema.pre('save', function(next){
  bcrypt.genSalt(10,(err,salt) => {
    bcrypt.hash(this.password,salt,(err, hash) => {
      this.password=hash;
      this.confirm_password=hash;
      this.saltSecret=this.salt;
      next();
    });
  });
});


UserSchema.pre("save", function (next) {
  var docs = this;
  mongoose
    .model("User", UserSchema)
    .countDocuments({ account: docs.name }, function (error, counter) {
      if (error) return next(error);
      docs.userid = counter + 1;
      next();
    });
});



UserSchema.methods.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJwt = function () {
  return jwt.sign({ userid: this.userid, role: 'user'},
      'SECRET#123',
  {
      expiresIn: '3m'
  });
}

UserSchema.methods.generateRefreshToken = function() {

  return jwt.sign({ userid: this.userid, role: 'user'}, 'RefreshToken', { expiresIn:'30d' });
}

  const User = mongoose.model("User", UserSchema);
  
  module.exports = {User};
  