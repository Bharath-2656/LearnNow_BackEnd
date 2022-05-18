var express = require('express');
var router = express.Router();

const app = express();

const mongoose = require("mongoose");

const AreaOfInterestSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    imagesrc: {
      type:String,
    },
    routerlink: {
      type:String,
    },
  });

  const AreaOfInterest = mongoose.model("AreaOfInterest", AreaOfInterestSchema);
  module.exports = {AreaOfInterest};