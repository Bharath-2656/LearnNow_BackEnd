var express = require('express');
var router = express.Router();

const app = express();

const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    name: {
      type: String,
      //required: true,
    },
    description: {
      type: String,
      //required: true,
    },
    duration: {
      type: String,
    },
    author: {
      type: String,
      // required: true,
    },
    category: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    // rating: {
    //     type: Number,
    //     required: true,
    // },
    courseid: {
      type: Number,
      // required: true,
      primaryKey: true,
    },
    routerlink: {
      type: String,
    },
    contents : {
      type: String,
    },
    courseincludes: {
      type:String,
    },
    couponcode: {
      type: String,
    },
    language: {
      type: String,
    },
    rating: {
      type: Number,
    },
    enrolledstudents: {
      type: Number,
      default:0,
    },
    requirements: {
      type: String,
    },
    reviews: {
      type: [],
    },
    
    
  });

  CourseSchema.pre("save", function (next) {
    var docs = this;
    mongoose
      .model("Course", CourseSchema)
      .countDocuments({ account: docs.name }, function (error, counter) {
        if (error) return next(error);
        docs.courseid = counter + 1;
        next();
      });
  });

  CourseSchema.pre("save", function (next) {
    var docs = this;
    mongoose
      .model("Course", CourseSchema)
      .countDocuments({ account: docs.name }, function (error, counter) {
        if (error) return next(error);
        docs.routerlink = docs.name.replace(/\s+/g, '').toLowerCase();
        next();
      });
  });


  const Course = mongoose.model("Course", CourseSchema);
  module.exports = {Course};